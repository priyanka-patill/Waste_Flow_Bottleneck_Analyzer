from fastapi import APIRouter
from app.engines.digital_twin import DEFAULT_VEHICLE_CONFIG

router = APIRouter(prefix="/vehicles", tags=["Vehicles"])

@router.get("", summary="Get fleet vehicle configuration")
async def get_vehicle_config():
    return {"success": True, "data": DEFAULT_VEHICLE_CONFIG}
