import type { NetworkNode, NetworkEdge, FlowResult, MinCutResult } from '../types/wasteNetwork';

/**
 * Computes Max-Flow Min-Cut between Source (Collection network) and Sink (Processing/Landfill).
 * Identifies the capacity bottleneck cut and capacity gap.
 */
export function computeMinCut(
  nodes: NetworkNode[],
  edges: NetworkEdge[],
  flowResult: FlowResult
): MinCutResult {
  // Find facility with highest capacity pressure & queue growth
  const sortingNodes = nodes.filter(n => n.type === 'sorting' || n.type === 'transfer');
  
  let maxPressureNode = sortingNodes[0];
  let maxPressure = 0;

  sortingNodes.forEach(node => {
    const metrics = flowResult.nodeMetrics[node.id];
    if (metrics) {
      const pressure = metrics.inflowTonnes / Math.max(1, metrics.effectiveCapacityTonnes);
      if (pressure > maxPressure) {
        maxPressure = pressure;
        maxPressureNode = node;
      }
    }
  });

  const targetMetrics = flowResult.nodeMetrics[maxPressureNode.id];
  const cutCapacityTonnes = targetMetrics ? targetMetrics.effectiveCapacityTonnes : maxPressureNode.capacityTonnes;
  const currentInflow = targetMetrics ? targetMetrics.inflowTonnes : maxPressureNode.currentTonnes;
  const capacityGapTonnes = Math.max(0, currentInflow - cutCapacityTonnes);

  // Edges directly connected to this bottleneck node
  const cutEdges = edges
    .filter(e => e.to === maxPressureNode.id || e.from === maxPressureNode.id)
    .map(e => e.id);

  return {
    cutCapacityTonnes: Math.round(cutCapacityTonnes),
    cutNodes: [maxPressureNode.id],
    cutEdges,
    capacityGapTonnes: Math.round(capacityGapTonnes)
  };
}
