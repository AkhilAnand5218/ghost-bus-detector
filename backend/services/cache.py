import json, os, time
from typing import List
from redis import Redis
from models import Bus, TrendPoint

CACHE_URL = os.getenv("CACHE_URL", "redis://localhost:6379/0")

class Cache:
    def __init__(self):
        self.r = Redis.from_url(CACHE_URL, decode_responses=True)

    def set_buses(self, buses: List[Bus]):
        payload = json.dumps([b.model_dump() for b in buses])
        self.r.set("buses:latest", payload)
        self.r.set("buses:latest:ts", int(time.time()))

    def get_buses(self) -> List[Bus]:
        raw = self.r.get("buses:latest")
        if not raw:
            return []
        return [Bus(**b) for b in json.loads(raw)]

    def append_trend(self, active: int, ghost: int):
        tp = TrendPoint(ts=int(time.time()), active_count=active, ghost_count=ghost)
        self.r.rpush("trends", json.dumps(tp.model_dump()))
        self.r.expire("trends", 24 * 3600)

    def get_trends(self) -> List[TrendPoint]:
        items = self.r.lrange("trends", 0, -1)
        return [TrendPoint(**json.loads(x)) for x in items]