from sqlalchemy import Column, String, Float, Integer, DateTime
from datetime import datetime, timezone
from app.core.database import Base

class FacilityModel(Base):
    __tablename__ = "facilities"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    type = Column(String, nullable=False) # collection, transfer, sorting, processing, landfill
    capacity_tonnes = Column(Float, nullable=False)
    current_tonnes = Column(Float, default=0.0)
    utilization_pct = Column(Float, default=0.0)
    status = Column(String, default="healthy") # healthy, warning, critical
    queue_tonnes = Column(Float, default=0.0)
    processing_rate = Column(String, nullable=True)
    operating_hours = Column(Float, default=16.0)
    lat = Column(Float, nullable=False)
    lng = Column(Float, nullable=False)
    zone = Column(String, nullable=True)
    description = Column(String, nullable=True)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
