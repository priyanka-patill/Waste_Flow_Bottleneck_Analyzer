from fastapi import APIRouter

router = APIRouter(prefix="/optimization", tags=["Optimization Engine"])

@router.get("/recommendations", summary="Get ranked optimization interventions & ROI")
async def get_optimization_recommendations():
    recommendations = [
        {
            "rank": 1,
            "title": "Reallocate 180 t/day from Facility B to Facility C (Taloja)",
            "description": "Dynamic load balancing leveraging Facility C's 22% spare capacity via Eastern Freeway corridor.",
            "co2SavedMonthlyTonnes": 142,
            "investmentInrLakhs": 8.4,
            "roiRatio": 16.9,
            "wasteDivertedTonnes": 5400,
            "paybackMonths": 1.8,
            "category": "Operations"
        },
        {
            "rank": 2,
            "title": "Dynamic Fleet Rerouting on Western Express (Route M-17)",
            "description": "Staggered dispatch windows to avoid peak monsoon commute congestion.",
            "co2SavedMonthlyTonnes": 91,
            "investmentInrLakhs": 2.1,
            "roiRatio": 43.3,
            "wasteDivertedTonnes": 2100,
            "paybackMonths": 0.6,
            "category": "Logistics"
        },
        {
            "rank": 3,
            "title": "Extend Facility B Shift by 2.5 Hours (Night Batch)",
            "description": "Clear nocturnal queue backlog before morning peak collection arrivals.",
            "co2SavedMonthlyTonnes": 67,
            "investmentInrLakhs": 1.4,
            "roiRatio": 47.8,
            "wasteDivertedTonnes": 3200,
            "paybackMonths": 0.4,
            "category": "Infrastructure"
        }
    ]
    return {"success": True, "data": recommendations}
