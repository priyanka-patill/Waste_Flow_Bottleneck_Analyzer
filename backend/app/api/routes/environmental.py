from fastapi import APIRouter
from app.engines.digital_twin import run_digital_twin_analysis

router = APIRouter(prefix="/environmental", tags=["Environmental Engine"])

@router.get("/summary", summary="Get environmental lifecycle metrics")
async def get_environmental_summary():
    analysis = run_digital_twin_analysis()
    flow = analysis["flowResult"]
    return {
        "success": True,
        "data": {
            "healthScore": 78,
            "co2MitigatedMonthlyTonnes": round(flow["totalCO2eTonnes"] * 0.4 * 30),
            "totalCO2eTonnesPerDay": flow["totalCO2eTonnes"],
            "landfillRunway": {
                "remainingCapacityTonnes": 1918000,
                "daysRemaining": 143,
                "projectedFillDate": "2027-02-21",
                "inflowPerDayTonnes": flow["totalLandfillTonnes"]
            }
        }
    }

@router.get("/landfill-runway", summary="Get Landfill Depletion Forecast Runway")
async def get_landfill_runway():
    analysis = run_digital_twin_analysis()
    flow = analysis["flowResult"]
    return {
        "success": True,
        "data": {
            "remainingCapacityTonnes": 1918000,
            "daysRemaining": 143,
            "projectedFillDate": "2027-02-21",
            "inflowPerDayTonnes": flow["totalLandfillTonnes"],
            "sensitivityPctRecovery": "+12 days per +5% recovery"
        }
    }
