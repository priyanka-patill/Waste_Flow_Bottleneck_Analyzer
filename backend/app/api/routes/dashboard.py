from fastapi import APIRouter
from app.engines.digital_twin import run_digital_twin_analysis
from app.integrations.open_meteo import fetch_open_meteo_weather
from app.integrations.openaq import fetch_open_aq_air_quality
from app.integrations.data_gov import fetch_gov_waste_data

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

@router.get("/summary", summary="Get WasteWise Dashboard Master Summary")
async def get_dashboard_summary():
    analysis = run_digital_twin_analysis()
    flow = analysis["flowResult"]
    top_bottleneck = analysis["bottlenecks"][0] if analysis["bottlenecks"] else None
    
    weather = await fetch_open_meteo_weather()
    air_quality = await fetch_open_aq_air_quality()
    gov_data = await fetch_gov_waste_data()

    return {
        "success": True,
        "data": {
            "wasteCollectedTonnes": flow["totalCollectedTonnes"],
            "wasteProcessedTonnes": flow["totalProcessedTonnes"],
            "recoveryRatePct": flow["recoveryRatePct"],
            "co2eEmissionsTonnes": flow["totalCO2eTonnes"],
            "landfillDependencyPct": flow["landfillDependencyPct"],
            "totalTrips": flow["totalTrips"],
            "totalFuelLiters": flow["totalFuelUsedLiters"],
            "topBottleneck": top_bottleneck,
            "systemHealth": "healthy" if not top_bottleneck or top_bottleneck["severity"] != "CRITICAL" else "critical_warning",
            "weather": weather,
            "airQuality": air_quality,
            "wasteGovData": gov_data,
            "dataSources": {
                "weather": weather["source"],
                "routing": "OSRM Engine",
                "wasteData": gov_data["source"],
                "airQuality": air_quality["source"]
            }
        }
    }

@router.get("/flow", summary="Get WasteWise Flow Stage Breakdown")
async def get_dashboard_flow():
    analysis = run_digital_twin_analysis()
    flow = analysis["flowResult"]
    return {
        "success": True,
        "data": {
            "nodeMetrics": flow["nodeMetrics"],
            "edgeFlows": flow["edgeFlows"],
            "maxFlowTonnes": flow["maxNetworkFlowTonnes"]
        }
    }
