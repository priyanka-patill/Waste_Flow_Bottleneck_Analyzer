from fastapi import APIRouter

router = APIRouter(prefix="/scenarios", tags=["Scenario Engine"])

@router.get("", summary="Get predefined scenario presets")
async def get_scenarios():
    presets = [
        {
            "id": "ganpati",
            "title": "Ganpati Visarjan Festival Surge",
            "wasteIncreasePct": 35,
            "durationDays": 5,
            "affectedFacilities": ["zone-colaba", "zone-bandra", "ts-dharavi"],
            "riskLevel": "HIGH",
            "description": "Massive influx of organic floral waste & temporary structures."
        },
        {
            "id": "diwali",
            "title": "Diwali Commercial & Packaging Peak",
            "wasteIncreasePct": 42,
            "durationDays": 4,
            "affectedFacilities": ["zone-andheri", "zone-thane", "sort-kanjur"],
            "riskLevel": "CRITICAL",
            "description": "Spike in cardboard, electronic packaging, and solid waste overloading sorting hubs."
        },
        {
            "id": "monsoon",
            "title": "Monsoon Heavy Inundation & Highway Collapse",
            "wasteIncreasePct": 20,
            "durationDays": 3,
            "affectedFacilities": ["ts-kurla", "e5", "sort-kanjur"],
            "riskLevel": "CRITICAL",
            "description": "Waterlogging shuts down key underpasses, reducing transport speeds by 60%."
        },
        {
            "id": "facility-shutdown",
            "title": "Sorting Facility B Outage (72h Emergency)",
            "wasteIncreasePct": 0,
            "durationDays": 3,
            "affectedFacilities": ["sort-kanjur", "ts-kurla", "landfill-deonar"],
            "riskLevel": "CRITICAL",
            "description": "Unplanned mechanical fault forces complete halt of main optical sorter conveyor."
        },
        {
            "id": "truck-strike",
            "title": "Civic Transport Fleet Shortage (-25% Vehicles)",
            "wasteIncreasePct": 0,
            "durationDays": 7,
            "affectedFacilities": ["zone-andheri", "zone-thane", "ts-dharavi"],
            "riskLevel": "HIGH",
            "description": "Driver strike reduces active vehicle fleet from 182 to 136 trucks."
        }
    ]
    return {"success": True, "data": presets}
