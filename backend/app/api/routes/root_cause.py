from fastapi import APIRouter

router = APIRouter(prefix="/root-cause", tags=["Root Cause Analysis"])

@router.get("/{facility_id}", summary="Get root cause causal chain for facility")
async def get_root_cause(facility_id: str):
    return {
        "success": True,
        "data": {
            "facilityId": facility_id,
            "primaryLikelyCause": "Inflow rate (1,450 t/day) exceeds processing capacity (1,200 t/day)",
            "causalChain": [
                "Sorting Facility B (94% Utilization)",
                "Transfer Station 2 Congestion ( Kurla )",
                "Fleet Beta Queue Growth (18 Trucks)",
                "Longer idling & circuitous re-routing",
                "Excess diesel burn & CO₂ spike"
            ],
            "confidenceScore": 94.8,
            "evidence": {
                "capacityPressure": 0.94,
                "queueGrowth": 0.82,
                "downstreamImpact": 0.89,
                "counterfactualImpact": 0.91
            }
        }
    }
