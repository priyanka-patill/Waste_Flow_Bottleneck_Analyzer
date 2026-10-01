import httpx
import math
from typing import Dict, Any, List
from app.core.config import settings
from app.core.logging import logger

def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    R = 6371.0
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat / 2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return round(R * c * 1.35, 1)

async def fetch_osrm_route(src_lat: float, src_lng: float, dest_lat: float, dest_lng: float) -> Dict[str, Any]:
    url = f"{settings.OSRM_BASE_URL}/route/v1/driving/{src_lng},{src_lat};{dest_lng},{dest_lat}?overview=full&geometries=geojson"
    try:
        async with httpx.AsyncClient(timeout=4.0) as client:
            resp = await client.get(url)
            if resp.status_code == 200:
                data = resp.json()
                if data.get("code") == "Ok" and data.get("routes"):
                    route = data["routes"][0]
                    dist_km = round(route.get("distance", 0) / 1000.0, 1)
                    dur_mins = round(route.get("duration", 0) / 60.0, 1)
                    return {
                        "distanceKm": max(1.0, dist_km),
                        "durationMinutes": max(3.0, dur_mins),
                        "provider": "OSRM Live API",
                        "isFallback": False
                    }
    except Exception as e:
        logger.warning(f"OSRM API fallback triggered: {e}")

    # Fallback Haversine Calculation
    dist = haversine_distance(src_lat, src_lng, dest_lat, dest_lng)
    return {
        "distanceKm": dist,
        "durationMinutes": round(dist * 2.4, 1),
        "provider": "Haversine Fallback",
        "isFallback": True
    }
