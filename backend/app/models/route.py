from sqlalchemy import Column, String, Float, Integer, DateTime
from datetime import datetime, timezone
from app.core.database import Base

class RouteEdgeModel(Base):
    __tablename__ = "routes"

    id = Column(String, primary_key=True, index=True)
    from_node = Column(String, nullable=False)
    to_node = Column(String, nullable=False)
    tonnes_per_day = Column(Float, nullable=False)
    capacity_per_day = Column(Float, nullable=False)
    status = Column(String, default="normal") # normal, congested, blocked
    delay_mins = Column(Integer, default=0)
    distance_km = Column(Float, default=18.0)
    travel_time_minutes = Column(Float, default=30.0)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
