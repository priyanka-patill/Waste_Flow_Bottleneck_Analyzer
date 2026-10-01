from fastapi import APIRouter, HTTPException
from typing import Optional, List
from app.engines.digital_twin import DEFAULT_NODES

router = APIRouter(prefix="/facilities", tags=["Facilities"])

@router.get("", summary="List all facilities & collection zones")
async def list_facilities(type: Optional[str] = None):
    nodes = DEFAULT_NODES
    if type:
        nodes = [n for n in nodes if n.get("type") == type]
    return {"success": True, "data": nodes}

@router.get("/{facility_id}", summary="Get facility details by ID")
async def get_facility(facility_id: str):
    node = next((n for n in DEFAULT_NODES if n["id"] == facility_id), None)
    if not node:
        raise HTTPException(status_code=404, detail="Facility not found")
    return {"success": True, "data": node}
