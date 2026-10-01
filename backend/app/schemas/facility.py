from pydantic import BaseModel, Field
from typing import Optional, List

class FacilityBase(BaseModel):
    id: str
    name: str
    type: str # collection, transfer, sorting, processing, landfill
    capacityTonnes: float = Field(..., alias="capacity_tonnes")
    currentTonnes: float = Field(0.0, alias="current_tonnes")
    utilizationPct: float = Field(0.0, alias="utilization_pct")
    status: str = "healthy"
    queueTonnes: Optional[float] = Field(0.0, alias="queue_tonnes")
    processingRate: Optional[str] = Field(None, alias="processing_rate")
    operatingHours: Optional[float] = Field(16.0, alias="operating_hours")
    lat: float
    lng: float
    zone: Optional[str] = None
    description: Optional[str] = None

    class Config:
        populate_by_name = True

class FacilityCreate(FacilityBase):
    pass

class FacilityUpdate(BaseModel):
    name: Optional[str] = None
    capacityTonnes: Optional[float] = Field(None, alias="capacity_tonnes")
    currentTonnes: Optional[float] = Field(None, alias="current_tonnes")
    status: Optional[str] = None

    class Config:
        populate_by_name = True
