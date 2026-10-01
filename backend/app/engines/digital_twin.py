from typing import Dict, Any, List, Optional
from app.engines.flow_engine import calculate_waste_flow
from app.engines.bottleneck_engine import evaluate_bottlenecks

DEFAULT_NODES = [
  {"id": "zone-colaba", "name": "Zone A — Colaba & Fort", "type": "collection", "capacityTonnes": 800, "currentTonnes": 680, "utilizationPct": 85, "status": "healthy", "lat": 18.9067, "lng": 72.8147, "description": "Commercial & High-density municipal sector"},
  {"id": "zone-bandra", "name": "Zone B — Bandra & Khar", "type": "collection", "capacityTonnes": 950, "currentTonnes": 840, "utilizationPct": 88, "status": "healthy", "lat": 19.0596, "lng": 72.8295, "description": "Mixed commercial & residential sector"},
  {"id": "zone-andheri", "name": "Zone C — Andheri & Juhu", "type": "collection", "capacityTonnes": 1200, "currentTonnes": 1120, "utilizationPct": 93, "status": "warning", "lat": 19.1136, "lng": 72.8697, "description": "High volume residential & IT corridor"},
  {"id": "zone-thane", "name": "Zone D — Thane & Mulund", "type": "collection", "capacityTonnes": 1100, "currentTonnes": 1050, "utilizationPct": 95, "status": "warning", "lat": 19.1726, "lng": 72.9426, "description": "Dense northern residential belt"},
  {"id": "zone-navi", "name": "Zone E — Navi Mumbai", "type": "collection", "capacityTonnes": 1200, "currentTonnes": 1130, "utilizationPct": 94, "status": "healthy", "lat": 19.0330, "lng": 73.0297, "description": "Planned industrial & civic node"},

  {"id": "ts-dharavi", "name": "Transfer Station 1 — Dharavi", "type": "transfer", "capacityTonnes": 1400, "currentTonnes": 1150, "utilizationPct": 82, "status": "healthy", "lat": 19.0400, "lng": 72.8500, "description": "Central hub for South & Central Mumbai"},
  {"id": "ts-kurla", "name": "Transfer Station 2 — Kurla", "type": "transfer", "capacityTonnes": 1600, "currentTonnes": 1392, "utilizationPct": 87, "status": "warning", "queueTonnes": 110, "lat": 19.0700, "lng": 72.8800, "description": "Eastern highway transit node — Heavy influx"},
  {"id": "ts-goregaon", "name": "Transfer Station 3 — Goregaon", "type": "transfer", "capacityTonnes": 1200, "currentTonnes": 810, "utilizationPct": 68, "status": "healthy", "lat": 19.1500, "lng": 72.8400, "description": "Western suburb compression station"},

  {"id": "sort-mahim", "name": "Sorting Facility A — Mahim", "type": "sorting", "capacityTonnes": 120, "currentTonnes": 106, "utilizationPct": 88, "status": "healthy", "processingRate": "120 t/hr", "lat": 19.0350, "lng": 72.8400, "description": "Semi-automated optical sorting facility"},
  {"id": "sort-kanjur", "name": "Sorting Facility B — Kanjurmarg", "type": "sorting", "capacityTonnes": 160, "currentTonnes": 151, "utilizationPct": 94, "status": "critical", "queueTonnes": 182, "processingRate": "160 t/hr", "lat": 19.1300, "lng": 72.9300, "description": "High-throughput MRF — Bottleneck focal point"},
  {"id": "sort-taloja", "name": "Sorting Facility C — Taloja", "type": "sorting", "capacityTonnes": 220, "currentTonnes": 140, "utilizationPct": 64, "status": "healthy", "processingRate": "220 t/hr", "lat": 19.0600, "lng": 73.1000, "description": "State-of-the-art regional processing plant"},
  {"id": "sort-bhiwandi", "name": "Sorting Facility D — Bhiwandi", "type": "sorting", "capacityTonnes": 140, "currentTonnes": 99, "utilizationPct": 71, "status": "healthy", "processingRate": "140 t/hr", "lat": 19.2800, "lng": 73.0500, "description": "Northern outskirts bulk material facility"},

  {"id": "proc-biogas", "name": "Bio-Methanation Plant 1", "type": "processing", "capacityTonnes": 500, "currentTonnes": 450, "utilizationPct": 90, "status": "healthy", "lat": 19.0800, "lng": 72.9100, "description": "Produces compressed biogas & organic fertilizer"},
  {"id": "proc-pyrolysis", "name": "Plastic Pyrolysis Hub", "type": "processing", "capacityTonnes": 350, "currentTonnes": 320, "utilizationPct": 91, "status": "healthy", "lat": 19.1000, "lng": 72.9500, "description": "Converts non-recyclable polymers to synthetic fuel"},
  {"id": "proc-mrf", "name": "Material Recovery Hub (MRF)", "type": "processing", "capacityTonnes": 700, "currentTonnes": 680, "utilizationPct": 97, "status": "warning", "lat": 19.1600, "lng": 72.9800, "description": "High-value paper, metal & glass recovery unit"},

  {"id": "landfill-deonar", "name": "Deonar Landfill Site", "type": "landfill", "capacityTonnes": 2400000, "currentTonnes": 1982000, "utilizationPct": 83, "status": "warning", "lat": 19.0600, "lng": 72.9200, "description": "Legacy dumping ground — Urgent diversion target"},
  {"id": "landfill-kanjur", "name": "Kanjurmarg Regional Landfill", "type": "landfill", "capacityTonnes": 4100000, "currentTonnes": 2900000, "utilizationPct": 71, "status": "healthy", "lat": 19.1400, "lng": 72.9400, "description": "Engineered sanitary landfill"}
]

DEFAULT_EDGES = [
  {"id": "e1", "from": "zone-colaba", "to": "ts-dharavi", "tonnesPerDay": 680, "status": "normal", "delayMins": 4, "distanceKm": 14, "travelTimeMinutes": 22},
  {"id": "e2", "from": "zone-bandra", "to": "ts-dharavi", "tonnesPerDay": 470, "status": "normal", "delayMins": 6, "distanceKm": 8, "travelTimeMinutes": 15},
  {"id": "e3", "from": "zone-bandra", "to": "ts-goregaon", "tonnesPerDay": 370, "status": "normal", "delayMins": 5, "distanceKm": 12, "travelTimeMinutes": 20},
  {"id": "e4", "from": "zone-andheri", "to": "ts-goregaon", "tonnesPerDay": 440, "status": "normal", "delayMins": 8, "distanceKm": 7, "travelTimeMinutes": 14},
  {"id": "e5", "from": "zone-andheri", "to": "ts-kurla", "tonnesPerDay": 680, "status": "congested", "delayMins": 22, "distanceKm": 11, "travelTimeMinutes": 32},
  {"id": "e6", "from": "zone-thane", "to": "sort-kanjur", "tonnesPerDay": 1050, "status": "congested", "delayMins": 18, "distanceKm": 15, "travelTimeMinutes": 28},
  {"id": "e7", "from": "zone-navi", "to": "sort-taloja", "tonnesPerDay": 1130, "status": "normal", "delayMins": 5, "distanceKm": 18, "travelTimeMinutes": 24},

  {"id": "e8", "from": "ts-dharavi", "to": "sort-mahim", "tonnesPerDay": 850, "status": "normal", "delayMins": 3, "distanceKm": 4, "travelTimeMinutes": 8},
  {"id": "e9", "from": "ts-dharavi", "to": "sort-kanjur", "tonnesPerDay": 300, "status": "congested", "delayMins": 14, "distanceKm": 16, "travelTimeMinutes": 30},
  {"id": "e10", "from": "ts-kurla", "to": "sort-kanjur", "tonnesPerDay": 1392, "status": "blocked", "delayMins": 34, "distanceKm": 10, "travelTimeMinutes": 45},
  {"id": "e11", "from": "ts-goregaon", "to": "sort-bhiwandi", "tonnesPerDay": 810, "status": "normal", "delayMins": 7, "distanceKm": 28, "travelTimeMinutes": 40},

  {"id": "e12", "from": "sort-mahim", "to": "proc-biogas", "tonnesPerDay": 450, "status": "normal", "delayMins": 2, "distanceKm": 9, "travelTimeMinutes": 16},
  {"id": "e13", "from": "sort-mahim", "to": "proc-pyrolysis", "tonnesPerDay": 320, "status": "normal", "delayMins": 4, "distanceKm": 13, "travelTimeMinutes": 22},
  {"id": "e14", "from": "sort-kanjur", "to": "proc-mrf", "tonnesPerDay": 680, "status": "normal", "delayMins": 5, "distanceKm": 6, "travelTimeMinutes": 12},
  {"id": "e15", "from": "sort-taloja", "to": "proc-mrf", "tonnesPerDay": 500, "status": "normal", "delayMins": 6, "distanceKm": 22, "travelTimeMinutes": 35},

  {"id": "e16", "from": "sort-kanjur", "to": "landfill-deonar", "tonnesPerDay": 1100, "status": "congested", "delayMins": 28, "distanceKm": 12, "travelTimeMinutes": 32},
  {"id": "e17", "from": "sort-kanjur", "to": "landfill-kanjur", "tonnesPerDay": 710, "status": "normal", "delayMins": 8, "distanceKm": 3, "travelTimeMinutes": 6},
  {"id": "e18", "from": "sort-bhiwandi", "to": "landfill-kanjur", "tonnesPerDay": 420, "status": "normal", "delayMins": 10, "distanceKm": 24, "travelTimeMinutes": 36}
]

DEFAULT_VEHICLE_CONFIG = {
  "vehicleCount": 182,
  "vehicleCapacityTonnes": 12.0,
  "fuelEfficiencyKmPerLiter": 3.2,
  "operatingHours": 14.0,
  "co2EmissionFactorKgPerLiter": 2.68
}

DEFAULT_LEVERS = {
  "sortingCapDelta": 180,
  "vehiclesDelta": 0,
  "targetRecoveryPct": 71,
  "operatingHours": 18,
  "routeStrategy": "Dynamic Freeway Rerouting"
}

def run_digital_twin_analysis(
    nodes: Optional[List[Dict[str, Any]]] = None,
    edges: Optional[List[Dict[str, Any]]] = None,
    vehicle_config: Optional[Dict[str, Any]] = None,
    levers: Optional[Dict[str, Any]] = None,
    scenario_id: Optional[str] = None
) -> Dict[str, Any]:
    current_nodes = nodes or DEFAULT_NODES
    current_edges = edges or DEFAULT_EDGES
    current_vcfg = vehicle_config or DEFAULT_VEHICLE_CONFIG
    current_levers = levers or DEFAULT_LEVERS

    flow_result = calculate_waste_flow(current_nodes, current_edges, current_vcfg)
    bottlenecks = evaluate_bottlenecks(current_nodes, current_edges, flow_result)

    return {
        "flowResult": flow_result,
        "bottlenecks": bottlenecks,
        "activeScenarioId": scenario_id,
        "environmentalMetrics": {
            "healthScore": 78,
            "co2MitigatedMonthlyTonnes": round(flow_result["totalCO2eTonnes"] * 0.4),
            "landfillRunway": {
                "remainingCapacityTonnes": 1918000,
                "daysRemaining": 143,
                "projectedFillDate": "2027-02-21",
                "inflowPerDayTonnes": flow_result["totalLandfillTonnes"]
            }
        }
    }
