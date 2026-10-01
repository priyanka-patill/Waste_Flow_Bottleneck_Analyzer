import httpx
from typing import Dict, Any
from app.core.config import settings
from app.core.logging import logger

DEFAULT_GOV_DATASET = {
    "vehicleCount": 182,
    "vehicleCapacity": 12.0,
    "collectionEfficiencyPct": 92.4,
    "dailyWasteGeneratedTpd": 6850.0,
    "source": "Government Dataset (CPCB / Swachh Bharat Baseline)",
    "isFallback": True
}

async def fetch_gov_waste_data() -> Dict[str, Any]:
    api_key = settings.DATAGOV_API_KEY
    if not api_key:
        return DEFAULT_GOV_DATASET

    url = f"https://api.data.gov.in/resource/3b01bcb8-0b14-4abf-b6f2-c1bfd384ba69?api-key={api_key}&format=json&limit=1&filters[city]=Mumbai"
    try:
        async with httpx.AsyncClient(timeout=4.0) as client:
            resp = await client.get(url)
            if resp.status_code == 200:
                data = resp.json()
                records = data.get("records", [])
                if records:
                    rec = records[0]
                    return {
                        "vehicleCount": int(rec.get("total_vehicles", 182)),
                        "vehicleCapacity": float(rec.get("vehicle_capacity_tonnes", 12.0)),
                        "collectionEfficiencyPct": float(rec.get("collection_efficiency_pct", 92.4)),
                        "dailyWasteGeneratedTpd": float(rec.get("daily_waste_generated_tpd", 6850.0)),
                        "source": "data.gov.in Live API",
                        "isFallback": False
                    }
    except Exception as e:
        logger.warning(f"data.gov.in API fallback triggered: {e}")

    return DEFAULT_GOV_DATASET
