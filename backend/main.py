from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import redis
import time
import json
import requests
from google.transit import gtfs_realtime_pb2
import asyncio
import socket
import requests.packages.urllib3.util.connection as urllib3_cn

# Force requests to always use IPv4 (fix DNS resolution issue on Windows)
def allowed_gai_family():
    return socket.AF_INET
urllib3_cn.allowed_gai_family = allowed_gai_family

app = FastAPI()

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Redis connection
r = redis.Redis(host='localhost', port=6379, db=0, decode_responses=True)

MTA_URLS = [
    "https://gtfsrt.prod.obanyc.com/vehiclePositions?feed_id=b",   # Bronx
    "https://gtfsrt.prod.obanyc.com/vehiclePositions?feed_id=bqc"  # Brooklyn, Queens, Staten Island
]

CACHE_KEY = "buses"
CACHE_EXPIRY = 5  # fetch fresh data every 5 seconds
STATE_KEY = "bus_states"  # for tracking ghost/anomaly history
RECOVERY_TIME = 120         # 2 minutes recovery


@app.get("/buses")
def get_buses():
    cached = r.get(CACHE_KEY)
    if cached:
        return json.loads(cached)
    buses = []
    now = int(time.time())
    # Load previous states (persist anomaly/ghost timing)
    try:
        states = json.loads(r.get(STATE_KEY) or "{}")
    except:
        states = {}
    for url in MTA_URLS:
        try:
            response = requests.get(url, timeout=5, headers={"Cache-Control": "no-cache"})
            response.raise_for_status()
            feed = gtfs_realtime_pb2.FeedMessage()
            feed.ParseFromString(response.content)
            for entity in feed.entity:
                if entity.HasField("vehicle"):
                    vehicle = entity.vehicle
                    vehicle_id = vehicle.vehicle.id
                    lat = vehicle.position.latitude
                    lon = vehicle.position.longitude
                    timestamp = vehicle.timestamp or now
                    age_seconds = now - timestamp
                    prev_state = states.get(vehicle_id, {})
                    # Default to normal
                    status = "normal"
                    # Ghost detection faster now: 60s old → ghost
                    if age_seconds > 60:
                        status = "ghost"
                    elif age_seconds < 2:   # very fresh update → anomaly
                        status = "anomaly"
                    # Recovery logic: if bus has been ghost/anomaly > 2 minutes, return to normal
                    if prev_state.get("status") in ["ghost", "anomaly"]:
                        entered_at = prev_state.get("since", now)
                        if now - entered_at >= RECOVERY_TIME:
                            status = "normal"
                    # Save/update state
                    if status != prev_state.get("status"):
                        states[vehicle_id] = {"status": status, "since": now}
                    buses.append({
                        "id": vehicle_id,
                        "lat": lat,
                        "lon": lon,
                        "timestamp": timestamp,
                        "status": status
                    })
        except Exception as e:
            print(f"Error fetching {url}:", e)
            continue
    # Save states persistently in Redis
    r.set(STATE_KEY, json.dumps(states))
    r.set(CACHE_KEY, json.dumps(buses), ex=CACHE_EXPIRY)
    return buses

# WebSocket manager to handle multiple connections
class ConnectionManager:
    def __init__(self):
        self.active_connections: list[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            try:
                await connection.send_text(message)
            except Exception:
                self.disconnect(connection)

manager = ConnectionManager()

# Background task to fetch bus data every CACHE_EXPIRY seconds and broadcast to clients
async def bus_data_broadcaster():
    while True:
        try:
            buses = get_buses()
            message = json.dumps(buses)
            await manager.broadcast(message)
        except Exception as e:
            print("Error broadcasting bus data:", e)
        await asyncio.sleep(CACHE_EXPIRY)

@app.on_event("startup")
async def startup_event():
    asyncio.create_task(bus_data_broadcaster())

@app.websocket("/ws/buses")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            # Keep connection alive by receiving messages (if any)
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)