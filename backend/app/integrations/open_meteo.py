import httpx
from typing import Dict, Any
from app.core.config import settings
from app.core.logging import logger

DEFAULT_MUMBAI_WEATHER = {
    "temperature": 28.5,
    "weatherCode": 61,
    "conditionLabel": "Monsoon Light Rain",
    "precipitationMm": 4.2,
    "rainMm": 4.2,
    "windSpeedKmH": 14.5,
    "humidityPct": 82,
    "isFallback": True,
    "source": "Open-Meteo Baseline / Fallback"
}

async def fetch_open_meteo_weather(lat: float = 19.0760, lng: float = 72.8777) -> Dict[str, Any]:
    url = f"{settings.OPEN_METEO_BASE_URL}/v1/forecast?latitude={lat}&longitude={lng}&current=temperature_2m,relative_humidity_2m,precipitation,rain,weather_code,wind_speed_10m&timezone=Asia%2FKolkata"
    try:
        async with httpx.AsyncClient(timeout=4.0) as client:
            resp = await client.get(url)
            if resp.status_code == 200:
                data = resp.json()
                current = data.get("current", {})
                return {
                    "temperature": current.get("temperature_2m", 28.5),
                    "weatherCode": current.get("weather_code", 61),
                    "conditionLabel": "Live Open-Meteo Weather",
                    "precipitationMm": current.get("precipitation", 0.0),
                    "rainMm": current.get("rain", 0.0),
                    "windSpeedKmH": current.get("wind_speed_10m", 10.0),
                    "humidityPct": current.get("relative_humidity_2m", 80),
                    "isFallback": False,
                    "source": "Open-Meteo Live API"
                }
    except Exception as e:
        logger.warning(f"Open-Meteo API fallback triggered: {e}")
    
    return DEFAULT_MUMBAI_WEATHER
