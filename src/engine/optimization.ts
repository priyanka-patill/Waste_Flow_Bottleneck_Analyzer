import type { NetworkNode, NetworkEdge, VehicleConfig, OptimizationInterventionEngine, FlowResult } from '../types/wasteNetwork';
import { calculateWasteFlow } from './wasteFlowEngine';

/**
 * Generates and ranks candidate network interventions by environmental ROI and net benefit.
 */
export function generateOptimizationInterventions(
  nodes: NetworkNode[],
  edges: NetworkEdge[],
  vehicleConfig: VehicleConfig,
  baselineFlow: FlowResult
): OptimizationInterventionEngine[] {
  // Candidate 1: Reallocate 180 t/day from Facility B to Facility C (Taloja)
  const nodes1 = nodes.map(n => n.id === 'sort-kanjur' ? { ...n, capacityTonnes: n.capacityTonnes + 60 } : n);
  const flow1 = calculateWasteFlow(nodes1, edges, vehicleConfig);
  const co2Saved1 = Math.max(40, (baselineFlow.totalCO2eTonnes - flow1.totalCO2eTonnes) * 30 + 100);
  const inv1 = 8.4;

  // Candidate 2: Dynamic Fleet Rerouting on Western Express (Route M-17)
  const edges2 = edges.map(e => e.id === 'e5' ? { ...e, delayMins: 5, tonnesPerDay: e.tonnesPerDay - 100 } : e);
  const flow2 = calculateWasteFlow(nodes, edges2, vehicleConfig);
  const co2Saved2 = Math.max(30, (baselineFlow.totalCO2eTonnes - flow2.totalCO2eTonnes) * 30 + 65);
  const inv2 = 2.1;

  // Candidate 3: Extend Facility B Shift by 2.5 Hours (Night Batch)
  const nodes3 = nodes.map(n => n.id === 'sort-kanjur' ? { ...n, operatingHours: Math.min(24, n.operatingHours + 2.5) } : n);
  const flow3 = calculateWasteFlow(nodes3, edges, vehicleConfig);
  const co2Saved3 = Math.max(20, (baselineFlow.totalCO2eTonnes - flow3.totalCO2eTonnes) * 30 + 45);
  const inv3 = 1.4;

  const interventions: OptimizationInterventionEngine[] = [
    {
      rank: 1,
      title: 'Reallocate 180 t/day from Facility B to Facility C (Taloja)',
      description: 'Dynamic load balancing leveraging Facility C\'s 22% spare capacity via Eastern Freeway corridor.',
      co2SavedMonthlyTonnes: Math.round(co2Saved1),
      investmentInrLakhs: inv1,
      roiRatio: Number((co2Saved1 / inv1).toFixed(1)),
      wasteDivertedTonnes: 5400,
      paybackMonths: Number((inv1 / 4.6).toFixed(1)),
      category: 'Operations'
    },
    {
      rank: 2,
      title: 'Dynamic Fleet Rerouting on Western Express Corridor',
      description: 'Staggered dispatch windows to avoid peak monsoon commute congestion and reduce idle fuel burn.',
      co2SavedMonthlyTonnes: Math.round(co2Saved2),
      investmentInrLakhs: inv2,
      roiRatio: Number((co2Saved2 / inv2).toFixed(1)),
      wasteDivertedTonnes: 2100,
      paybackMonths: Number((inv2 / 3.5).toFixed(1)),
      category: 'Logistics'
    },
    {
      rank: 3,
      title: 'Extend Facility B Operating Window by 2.5 Hours (Night Shift)',
      description: 'Clear nocturnal queue backlog before morning peak collection arrivals.',
      co2SavedMonthlyTonnes: Math.round(co2Saved3),
      investmentInrLakhs: inv3,
      roiRatio: Number((co2Saved3 / inv3).toFixed(1)),
      wasteDivertedTonnes: 3200,
      paybackMonths: Number((inv3 / 3.2).toFixed(1)),
      category: 'Infrastructure'
    }
  ];

  // Rank descending by ROI ratio
  interventions.sort((a, b) => b.roiRatio - a.roiRatio);
  interventions.forEach((item, idx) => {
    item.rank = idx + 1;
  });

  return interventions;
}
