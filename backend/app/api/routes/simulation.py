from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional, Dict, Any
from app.engines.digital_twin import run_digital_twin_analysis, DEFAULT_NODES, DEFAULT_EDGES, DEFAULT_VEHICLE_CONFIG

router = APIRouter(prefix="/simulation", tags=["Simulation Engine"])

class WhatIfRequest(BaseModel):
    sortingCapDelta: float = 0.0
    vehiclesDelta: int = 0
    targetRecoveryPct: float = 71.0
    operatingHours: float = 16.0
    routeStrategy: str = "Standard Direct Route"

class ChaosRequest(BaseModel):
    disruptionName: str # FACILITY FAILURE, TRUCK SHORTAGE, MONSOON FLOODING, FESTIVAL SURGE

@router.post("/what-if", summary="Run What-If Lever Simulation")
async def run_what_if_simulation(req: WhatIfRequest):
    nodes = [dict(n) for n in DEFAULT_NODES]
    for n in nodes:
        if n["type"] == "sorting" and n["id"] == "sort-kanjur":
            n["capacityTonnes"] = max(50.0, n["capacityTonnes"] + req.sortingCapDelta)
        if req.operatingHours:
            n["operatingHours"] = req.operatingHours

    vcfg = dict(DEFAULT_VEHICLE_CONFIG)
    if req.vehiclesDelta:
        vcfg["vehicleCount"] = max(50, vcfg["vehicleCount"] + req.vehiclesDelta)

    analysis = run_digital_twin_analysis(nodes=nodes, vehicle_config=vcfg)
    return {"success": True, "data": analysis}

@router.post("/counterfactual", summary="Run Counterfactual Baseline vs Mitigated Comparison")
async def run_counterfactual_simulation():
    baseline_analysis = run_digital_twin_analysis()
    baseline_flow = baseline_analysis["flowResult"]

    mitigated_nodes = [dict(n) for n in DEFAULT_NODES]
    for n in mitigated_nodes:
        if n["id"] == "sort-kanjur":
            n["capacityTonnes"] = 340.0 # +180 t/day reallocation

    mitigated_analysis = run_digital_twin_analysis(nodes=mitigated_nodes)
    mitigated_flow = mitigated_analysis["flowResult"]

    return {
        "success": True,
        "data": {
            "baseline": {
                "co2EmissionsTonnes": baseline_flow["totalCO2eTonnes"] * 30,
                "landfillDumpingTonnes": baseline_flow["totalLandfillTonnes"] * 30,
                "fleetDieselLiters": baseline_flow["totalFuelUsedLiters"] * 30,
                "truckTrips": baseline_flow["totalTrips"] * 30
            },
            "counterfactual": {
                "co2EmissionsTonnes": mitigated_flow["totalCO2eTonnes"] * 30,
                "landfillDumpingTonnes": mitigated_flow["totalLandfillTonnes"] * 30,
                "fleetDieselLiters": mitigated_flow["totalFuelUsedLiters"] * 30,
                "truckTrips": mitigated_flow["totalTrips"] * 30
            },
            "delta": {
                "co2SavedTonnes": round((baseline_flow["totalCO2eTonnes"] - mitigated_flow["totalCO2eTonnes"]) * 30),
                "landfillAvoidedTonnes": round((baseline_flow["totalLandfillTonnes"] - mitigated_flow["totalLandfillTonnes"]) * 30),
                "dieselSavedLiters": round((baseline_flow["totalFuelUsedLiters"] - mitigated_flow["totalFuelUsedLiters"]) * 30),
                "tripsCut": round((baseline_flow["totalTrips"] - mitigated_flow["totalTrips"]) * 30)
            }
        }
    }

@router.post("/chaos", summary="Run Chaos Monkey Failure Scenario")
async def run_chaos_simulation(req: ChaosRequest):
    scenario_id = None
    if req.disruptionName == "FACILITY FAILURE":
        scenario_id = "facility-shutdown"
    elif req.disruptionName in ["TRUCK SHORTAGE", "STRIKE"]:
        scenario_id = "truck-strike"
    elif req.disruptionName in ["MONSOON FLOODING", "TRAFFIC COLLAPSE"]:
        scenario_id = "monsoon"
    elif req.disruptionName == "FESTIVAL SURGE":
        scenario_id = "ganpati"

    analysis = run_digital_twin_analysis(scenario_id=scenario_id)
    return {"success": True, "data": analysis}
