from pydantic import BaseModel, Field
from typing import Dict, Any, List, Optional

class FlowResultSchema(BaseModel):
    totalCollectedTonnes: float
    totalProcessedTonnes: float
    totalLandfillTonnes: float
    totalRecoveredTonnes: float
    recoveryRatePct: float
    landfillDependencyPct: float
    totalTrips: int
    totalDistanceKm: float
    totalFuelUsedLiters: float
    totalCO2eTonnes: float
    maxNetworkFlowTonnes: float
    nodeMetrics: Dict[str, Any]
    edgeFlows: Dict[str, Any]

class NetworkStateSchema(BaseModel):
    nodes: List[Dict[str, Any]]
    edges: List[Dict[str, Any]]
    vehicleConfig: Dict[str, Any]
    levers: Dict[str, Any]
    activeScenarioId: Optional[str] = None
