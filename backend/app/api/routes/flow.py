from fastapi import APIRouter
from app.engines.digital_twin import run_digital_twin_analysis, DEFAULT_NODES, DEFAULT_EDGES

router = APIRouter(prefix="/flow", tags=["Waste Flow"])

@router.get("/network", summary="Get complete Digital Twin flow network topology")
async def get_flow_network():
    analysis = run_digital_twin_analysis()
    return {
        "success": True,
        "data": {
            "nodes": DEFAULT_NODES,
            "edges": DEFAULT_EDGES,
            "flowResult": analysis["flowResult"]
        }
    }

@router.get("/current", summary="Get current flow metrics")
async def get_current_flow():
    analysis = run_digital_twin_analysis()
    return {"success": True, "data": analysis["flowResult"]}
