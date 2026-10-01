from sqlalchemy import Column, String, Float, Integer
from app.core.database import Base

class VehicleConfigModel(Base):
    __tablename__ = "vehicle_configs"

    id = Column(Integer, primary_key=True, autoincrement=True)
    vehicle_count = Column(Integer, default=182)
    vehicle_capacity_tonnes = Column(Float, default=12.0)
    fuel_efficiency_km_per_liter = Column(Float, default=3.2)
    operating_hours = Column(Float, default=14.0)
    co2_emission_factor_kg_per_liter = Column(Float, default=2.68)
