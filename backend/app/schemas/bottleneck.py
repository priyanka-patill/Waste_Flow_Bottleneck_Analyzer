from pydantic import BaseModel
from typing import List, Dict, Any, Optional

class BottleneckItemSchema(BaseModel):
    rank: int
    id: str
    nodeId: str
    title: str
    severity: str # CRITICAL, WARNING, INSIGHT
    utilization: float
    queueGrowthRate: str
    downstreamImpact: str
    co2Impact: str
    confidenceScore: float
    causalChain: List[str]
    evidence: Optional[Dict[str, Any]] = None

class BottleneckAnalysisResponse(BaseModel):
    bottlenecks: List[BottleneckItemSchema]
    focalBottleneckId: str
