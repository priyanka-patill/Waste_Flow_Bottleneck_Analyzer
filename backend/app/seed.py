from app.core.database import engine, Base, SessionLocal
from app.models.facility import FacilityModel
from app.models.route import RouteEdgeModel
from app.models.vehicle import VehicleConfigModel
from app.engines.digital_twin import DEFAULT_NODES, DEFAULT_EDGES, DEFAULT_VEHICLE_CONFIG

def seed_database():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # Check if facilities exist
        if db.query(FacilityModel).count() == 0:
            for node in DEFAULT_NODES:
                f = FacilityModel(
                    id=node["id"],
                    name=node["name"],
                    type=node["type"],
                    capacity_tonnes=float(node["capacityTonnes"]),
                    current_tonnes=float(node.get("currentTonnes", 0)),
                    utilization_pct=float(node.get("utilizationPct", 0)),
                    status=node.get("status", "healthy"),
                    queue_tonnes=float(node.get("queueTonnes", 0)),
                    processing_rate=node.get("processingRate"),
                    operating_hours=float(node.get("operatingHours", 16)),
                    lat=float(node["lat"]),
                    lng=float(node["lng"]),
                    zone=node.get("zone"),
                    description=node.get("description")
                )
                db.add(f)
            print(f"Seeded {len(DEFAULT_NODES)} facilities into database.")

        if db.query(RouteEdgeModel).count() == 0:
            for edge in DEFAULT_EDGES:
                r = RouteEdgeModel(
                    id=edge["id"],
                    from_node=edge["from"],
                    to_node=edge["to"],
                    tonnes_per_day=float(edge["tonnesPerDay"]),
                    capacity_per_day=float(edge.get("capacityPerDay", edge["tonnesPerDay"] * 1.25)),
                    status=edge.get("status", "normal"),
                    delay_mins=int(edge.get("delayMins", 0)),
                    distance_km=float(edge.get("distanceKm", 18)),
                    travel_time_minutes=float(edge.get("travelTimeMinutes", 30))
                )
                db.add(r)
            print(f"Seeded {len(DEFAULT_EDGES)} routes into database.")

        if db.query(VehicleConfigModel).count() == 0:
            v = VehicleConfigModel(
                vehicle_count=int(DEFAULT_VEHICLE_CONFIG["vehicleCount"]),
                vehicle_capacity_tonnes=float(DEFAULT_VEHICLE_CONFIG["vehicleCapacityTonnes"]),
                fuel_efficiency_km_per_liter=float(DEFAULT_VEHICLE_CONFIG["fuelEfficiencyKmPerLiter"]),
                operating_hours=float(DEFAULT_VEHICLE_CONFIG["operatingHours"]),
                co2_emission_factor_kg_per_liter=float(DEFAULT_VEHICLE_CONFIG["co2EmissionFactorKgPerLiter"])
            )
            db.add(v)
            print("Seeded vehicle configuration into database.")

        db.commit()
    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
