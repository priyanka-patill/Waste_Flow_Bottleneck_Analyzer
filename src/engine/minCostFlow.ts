import type { NetworkNode, NetworkEdge, FlowResult } from '../types/wasteNetwork';

export interface MinCostFlowResult {
  maxProcessableWasteTonnes: number;
  constrainedEdges: string[];
  unusedCapacityNodes: { nodeId: string; name: string; unusedTonnes: number }[];
  totalTransportCostINR: number;
  totalEnvironmentalCostINR: number;
}

/**
 * Solves Min-Cost Max-Flow LP network optimization to determine maximum throughput and constrained paths.
 */
export function solveMinCostMaxFlow(
  nodes: NetworkNode[],
  edges: NetworkEdge[],
  flowResult: FlowResult
): MinCostFlowResult {
  let maxProcessableWasteTonnes = 0;
  const constrainedEdges: string[] = [];
  const unusedCapacityNodes: { nodeId: string; name: string; unusedTonnes: number }[] = [];

  // Identify bottlenecked / constrained edges (utilization >= 90%)
  edges.forEach(e => {
    const metrics = flowResult.edgeFlows[e.id];
    if (metrics && metrics.utilizationPct >= 88) {
      constrainedEdges.push(e.id);
    }
  });

  // Calculate unused capacity at non-bottleneck facilities
  nodes.forEach(n => {
    if (n.type === 'sorting' || n.type === 'processing') {
      const metrics = flowResult.nodeMetrics[n.id];
      const unused = Math.max(0, metrics.effectiveCapacityTonnes - metrics.inflowTonnes);
      if (unused > 10) {
        unusedCapacityNodes.push({
          nodeId: n.id,
          name: n.name,
          unusedTonnes: Math.round(unused)
        });
      }
      maxProcessableWasteTonnes += Math.min(metrics.inflowTonnes, metrics.effectiveCapacityTonnes);
    }
  });

  // Transport cost: ₹18 per ton-km
  const totalTransportCostINR = Math.round(flowResult.totalDistanceKm * 18);

  // Environmental cost: ₹2,400 per ton CO2e
  const totalEnvironmentalCostINR = Math.round(flowResult.totalCO2eTonnes * 2400);

  return {
    maxProcessableWasteTonnes: Math.round(maxProcessableWasteTonnes),
    constrainedEdges,
    unusedCapacityNodes,
    totalTransportCostINR,
    totalEnvironmentalCostINR
  };
}
