from pydantic import BaseModel
from typing import Optional, List, Literal

class Bus(BaseModel):
    id: str
    route: Optional[str] = None
    lat: float
    lon: float
    speed_kmh: Optional[float] = None
    last_update_ts: int
    status: Literal["active", "ghost"]

class TrendPoint(BaseModel):
    ts: int
    active_count: int
    ghost_count: int

class TrendSeries(BaseModel):
    points: List[TrendPoint]