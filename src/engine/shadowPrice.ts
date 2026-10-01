import type { NetworkNode, NetworkEdge, VehicleConfig, ShadowPriceItem } from '../types/wasteNetwork';
import { calculateWasteFlow } from './wasteFlowEngine';

/**
 * Perturbs capacity of each major facility by +10 t/day and measures network throughput improvement (Shadow Price / Dual Value).
 */
export function calculateShadowPrices(
  nodes: NetworkNode[],
  edges: NetworkEdge[],
  vehicleConfig: VehicleConfig
): ShadowPriceItem[] {
  const baselineFlow = calculateWasteFlow(nodes, edges, vehicleConfig);
  const baselineThroughput = baselineFlow.totalProcessedTonnes;

  const shadowPrices: ShadowPriceItem[] = [];

  const candidateNodes = nodes.filter(n => n.type === 'sorting' || n.type === 'transfer');

  candidateNodes.forEach(candidate => {
    // Clone nodes and perturb candidate capacity by +10 t/day
    const perturbedNodes = nodes.map(n => {
      if (n.id === candidate.id) {
        return {
          ...n,
          capacityTonnes: n.capacityTonnes + 10,
          currentTonnes: n.currentTonnes
        };
      }
      return n;
    });

    const perturbedFlow = calculateWasteFlow(perturbedNodes, edges, vehicleConfig);
    const throughputDelta = Math.max(0, perturbedFlow.totalProcessedTonnes - baselineThroughput);
    const landfillReduction = Math.max(0, baselineFlow.totalLandfillTonnes - perturbedFlow.totalLandfillTonnes);

    // Shadow price = throughput improvement per 10 t capacity increase
    const shadowPriceVal = Number((throughputDelta / 10).toFixed(2));

    shadowPrices.push({
      nodeId: candidate.id,
      nodeName: candidate.name,
      shadowPrice: shadowPriceVal,
      landfillReductionPer10t: Math.round(landfillReduction)
    });
  });

  // Sort descending by shadow price leverage
  return shadowPrices.sort((a, b) => b.shadowPrice - a.shadowPrice);
}
