import os, time
from typing import List, Tuple
from models import Bus

GHOST_SECONDS = int(os.getenv("GHOST_SECONDS", "180"))
SPEED_MAX = 90.0  # anomaly threshold

class AnomalyDetector:
    def classify(self, buses: List[Bus]) -> Tuple[List[Bus], List[str]]:
        now = int(time.time())
        alerts: List[str] = []
        output: List[Bus] = []
        for b in buses:
            status = "active"
            if now - b.last_update_ts > GHOST_SECONDS:
                status = "ghost"
                alerts.append(f"Ghost bus detected: {b.id} (route {b.route})")
            if b.speed_kmh and b.speed_kmh > SPEED_MAX:
                alerts.append(f"Speed anomaly: {b.id} at {b.speed_kmh:.1f} km/h")
            output.append(Bus(**{**b.model_dump(), "status": status}))
        return output, alerts