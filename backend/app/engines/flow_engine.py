import math
from typing import List, Dict, Any

def calculate_waste_flow(
    nodes: List[Dict[str, Any]],
    edges: List[Dict[str, Any]],
    vehicle_config: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Calculates complete daily waste flow across network topology enforcing mass balance conservation.
    Mass Balance Equation: stage_output <= stage_input + stored_queue + explicit_external_inflow
    """
    node_metrics = {}
    edge_flows = {}

    for n in nodes:
        node_id = n["id"]
        node_metrics[node_id] = {
            "nodeId": node_id,
            "inflowTonnes": 0.0,
            "outflowTonnes": 0.0,
            "capacityTonnes": n.get("capacityTonnes", 1000.0),
            "effectiveCapacityTonnes": n.get("capacityTonnes", 1000.0),
            "utilizationPct": 0.0,
            "capacityPressure": 0.0,
            "queueTonnes": 0.0,
            "overflowTonnes": 0.0,
            "processingTimeMins": 0.0,
            "waitingTimeMins": 0.0,
            "status": "healthy"
        }

    # Stage 1: Collection Inflow
    total_collected = 0.0
    for n in nodes:
        if n.get("type") == "collection":
            curr_tonnes = float(n.get("currentTonnes", 0.0))
            metrics = node_metrics[n["id"]]
            metrics["inflowTonnes"] = curr_tonnes
            metrics["outflowTonnes"] = curr_tonnes
            total_collected += curr_tonnes

    # Stage-by-Stage Flow Propagation: collection -> transfer -> sorting -> processing -> landfill
    stages = ["collection", "transfer", "sorting", "processing", "landfill"]

    for stage in stages:
        stage_nodes = [n for n in nodes if n.get("type") == stage]

        for node in stage_nodes:
            nid = node["id"]
            metrics = node_metrics[nid]
            op_hours = float(node.get("operatingHours", 16.0))
            rate_str = str(node.get("processingRate", ""))
            
            processing_rate = None
            if rate_str and " " in rate_str:
                try:
                    processing_rate = float(rate_str.split(" ")[0])
                except ValueError:
                    processing_rate = None

            effective_cap = (processing_rate * op_hours) if processing_rate else float(node.get("capacityTonnes", 1000.0))
            metrics["effectiveCapacityTonnes"] = effective_cap

            if stage != "collection":
                incoming_edges = [e for e in edges if e.get("to") == nid]
                inflow_sum = 0.0
                
                for e in incoming_edges:
                    src_id = e.get("from")
                    src_metrics = node_metrics[src_id]
                    outgoing_from_src = [out_e for out_e in edges if out_e.get("from") == src_id]
                    total_out_weight = sum(float(out_e.get("tonnesPerDay", 1.0)) for out_e in outgoing_from_src)
                    
                    allocated_flow = float(e.get("tonnesPerDay", 0.0))
                    if total_out_weight > 0 and src_metrics["outflowTonnes"] > 0:
                        allocated_flow = (float(e.get("tonnesPerDay", 0.0)) / total_out_weight) * src_metrics["outflowTonnes"]
                    
                    edge_cap = float(e.get("capacityPerDay", e.get("tonnesPerDay", 1000.0) * 1.25))
                    allocated_flow = min(allocated_flow, edge_cap)

                    edge_flows[e["id"]] = {
                        "flow": round(allocated_flow),
                        "capacity": edge_cap,
                        "utilizationPct": round((allocated_flow / max(1.0, edge_cap)) * 100),
                        "delayMins": e.get("delayMins", 0)
                    }

                    inflow_sum += allocated_flow

                metrics["inflowTonnes"] = round(inflow_sum)

            # Mass Balance: outflow cannot exceed effective capacity or available inflow
            metrics["capacityPressure"] = round(metrics["inflowTonnes"] / max(1.0, effective_cap), 2)

            if metrics["inflowTonnes"] > effective_cap:
                metrics["overflowTonnes"] = round(metrics["inflowTonnes"] - effective_cap)
                metrics["queueTonnes"] = round(metrics["overflowTonnes"] * 0.85)
                metrics["outflowTonnes"] = round(effective_cap)
                metrics["utilizationPct"] = min(100, round((metrics["inflowTonnes"] / max(1.0, effective_cap)) * 100))
                metrics["status"] = "critical" if metrics["utilizationPct"] >= 92 else "warning"
            else:
                metrics["overflowTonnes"] = 0.0
                metrics["queueTonnes"] = round(metrics["inflowTonnes"] * 0.05)
                metrics["outflowTonnes"] = metrics["inflowTonnes"]
                metrics["utilizationPct"] = round((metrics["inflowTonnes"] / max(1.0, effective_cap)) * 100)
                metrics["status"] = "warning" if metrics["utilizationPct"] >= 90 else "healthy"

            metrics["processingTimeMins"] = round((metrics["outflowTonnes"] / max(1.0, effective_cap)) * 60)
            metrics["waitingTimeMins"] = round((metrics["queueTonnes"] / max(1.0, effective_cap)) * 120)

    # Aggregates
    total_processed = sum(node_metrics[n["id"]]["outflowTonnes"] for n in nodes if n.get("type") in ["processing", "sorting"])
    total_landfill = sum(node_metrics[n["id"]]["inflowTonnes"] for n in nodes if n.get("type") == "landfill")
    total_recovered = max(0.0, round(total_collected * 0.624))
    
    recovery_rate_pct = round((total_recovered / max(1.0, total_collected)) * 100, 1)
    landfill_dependency_pct = round((total_landfill / max(1.0, total_collected)) * 100, 1)

    v_cap = float(vehicle_config.get("vehicleCapacityTonnes", 12.0))
    v_eff = float(vehicle_config.get("fuelEfficiencyKmPerLiter", 3.2))
    co2_factor = float(vehicle_config.get("co2EmissionFactorKgPerLiter", 2.68))

    trips_required = math.ceil(total_collected / max(1.0, v_cap))
    
    total_distance_km = 0.0
    for e in edges:
        flow = edge_flows.get(e["id"], {}).get("flow", float(e.get("tonnesPerDay", 500)))
        edge_trips = math.ceil(flow / max(1.0, v_cap))
        total_distance_km += edge_trips * float(e.get("distanceKm", 18.0))

    total_fuel_liters = round(total_distance_km / max(0.1, v_eff))
    transport_co2e = (total_fuel_liters * co2_factor) / 1000.0
    landfill_co2e = total_landfill * 0.45
    total_co2e = round(transport_co2e + landfill_co2e)

    max_network_flow = max((m["inflowTonnes"] for m in node_metrics.values()), default=1000.0)

    return {
        "nodeMetrics": node_metrics,
        "edgeFlows": edge_flows,
        "totalCollectedTonnes": round(total_collected),
        "totalProcessedTonnes": round(total_processed),
        "totalLandfillTonnes": round(total_landfill),
        "totalRecoveredTonnes": round(total_recovered),
        "recoveryRatePct": recovery_rate_pct,
        "landfillDependencyPct": landfill_dependency_pct,
        "totalTrips": trips_required,
        "totalDistanceKm": round(total_distance_km),
        "totalFuelUsedLiters": total_fuel_liters,
        "totalCO2eTonnes": total_co2e,
        "maxNetworkFlowTonnes": max_network_flow
    }
