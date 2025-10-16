import aiohttp
from google.transit import gtfs_realtime_pb2

# Your 2 live MTA bus feeds
MTA_FEEDS = [
    "https://gtfsrt.prod.obanyc.com/vehiclePositions?feed_id=b",
    "https://gtfsrt.prod.obanyc.com/vehiclePositions?feed_id=bqc"
]

async def fetch_bus_data():
    buses = []
    for url in MTA_FEEDS:
        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(url) as response:
                    raw_data = await response.read()

                    # Decode GTFS-RT protobuf
                    feed = gtfs_realtime_pb2.FeedMessage()
                    feed.ParseFromString(raw_data)

                    for entity in feed.entity:
                        if entity.HasField("vehicle"):
                            bus = entity.vehicle
                            buses.append({
                                "id": bus.vehicle.id if bus.vehicle.id else "unknown",
                                "lat": bus.position.latitude,
                                "lng": bus.position.longitude,
                                "status": "normal"  # mark ghost buses later if needed
                            })

        except Exception as e:
            print(f"fetch_bus_data error from {url}: {e}")
    return buses