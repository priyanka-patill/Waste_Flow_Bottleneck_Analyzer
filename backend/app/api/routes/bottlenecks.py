from fastapi import APIRouter, HTTPException
from app.engines.digital_twin import run_digital_twin_analysis

router = APIRouter(prefix="/bottlenecks", tags=["Bottleneck Intelligence"])

@router.get("", summary="Get all detected network bottlenecks")
async def get_bottlenecks():
    analysis = run_digital_twin_analysis()
    return {"success": True, "data": analysis["bottlenecks"]}

@router.get("/top", summary="Get top critical focal bottleneck")
async def get_top_bottleneck():
    analysis = run_digital_twin_analysis()
    top = analysis["bottlenecks"][0] if analysis["bottlenecks"] else None
    return {"success": True, "data": top}

@router.get("/{facility_id}", summary="Get bottleneck analysis for specific facility")
async def get_facility_bottleneck(facility_id: str):
    analysis = run_digital_twin_analysis()
    item = next((b for b in analysis["bottlenecks"] if b["nodeId"] == facility_id), None)
    if not item:
        return {
            "success": True,
            "data": {
                "nodeId": facility_id,
                "severity": "HEALTHY",
                "utilization": 70,
                "note": "No active bottleneck detected for this facility"
            }
        }
    return {"success": True, "data": item}
