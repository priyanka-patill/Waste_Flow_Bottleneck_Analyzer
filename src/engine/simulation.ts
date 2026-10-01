import type { NetworkState, WasteFlowAnalysisResult, NetworkNode, NetworkEdge } from '../types/wasteNetwork';
import { calculateWasteFlow } from './wasteFlowEngine';
import { solveMinCostMaxFlow } from './minCostFlow';
import { computeMinCut } from './minCut';
import { calculateShadowPrices } from './shadowPrice';
import { simulate24HourQueues } from './queueAnalysis';
import { analyzeRootCauses } from './causalAnalysis';
import { evaluateBottlenecks } from './bottleneckScore';
import { simulateCounterfactual } from './counterfactual';
import { generateOptimizationInterventions } from './optimization';
import { calculateEnvironmentalMetrics } from './environmentalMetrics';

/**
 * Runs the full waste flow simulation, bottleneck detection, root-cause, counterfactual, and optimization pipeline.
 */
export function runCompleteAnalysis(state: NetworkState): WasteFlowAnalysisResult {
  const { nodes, edges, vehicleConfig, levers, activeScenarioId, weatherImpact, trafficStatus } = state;

  const rainMultiplier = weatherImpact?.rainTravelMultiplier || 1.0;
  const heavyRainMultiplier = weatherImpact?.heavyRainTravelMultiplier || 1.0;
  const vehicleCapReduction = weatherImpact?.vehicleCapacityReduction || 0.0;
  const collectionDelayMult = weatherImpact?.collectionDelayMultiplier || 1.0;
  const trafficMult = trafficStatus?.trafficMultiplier || 1.0;

  // Apply What-If Levers, Weather Multipliers, or Scenario Perturbations to Network Nodes & Edges
  let modifiedNodes: NetworkNode[] = nodes.map(n => {
    let nodeCap = n.capacityTonnes;
    let nodeHrs = n.operatingHours || 16;
    let currTonnes = n.currentTonnes;
    let recPct = n.recoveryPct;

    // Apply Weather collection delay & backlog boost to collection nodes
    if (n.type === 'collection') {
      currTonnes = Math.round(currTonnes * collectionDelayMult);
    }

    // Apply What-If Sorting Capacity Shift to sorting nodes
    if (n.type === 'sorting' && levers.sortingCapDelta !== undefined && levers.sortingCapDelta !== 0) {
      if (n.id === 'sort-kanjur' || nodes.filter(nod => nod.type === 'sorting').length === 1) {
        nodeCap = Math.max(50, n.capacityTonnes + levers.sortingCapDelta);
      } else {
        // Distribute delta across sorting nodes
        const sortingCount = nodes.filter(nod => nod.type === 'sorting').length;
        nodeCap = Math.max(50, Math.round(n.capacityTonnes + levers.sortingCapDelta / sortingCount));
      }
    }

    // Apply Target Recovery Rate Lever (clamped between 0 and 100%)
    if ((n.type === 'sorting' || n.type === 'processing') && levers.targetRecoveryPct !== undefined) {
      recPct = Math.min(100, Math.max(0, levers.targetRecoveryPct));
    }

    // Apply Operating Hours Lever
    if (levers.operatingHours && levers.operatingHours !== 16) {
      nodeHrs = levers.operatingHours;
    }

    // Apply Scenario Preset modifications if active
    if (activeScenarioId === 'ganpati') {
      if (n.type === 'collection') currTonnes = Math.round(currTonnes * 1.35);
    } else if (activeScenarioId === 'diwali') {
      if (n.type === 'collection') currTonnes = Math.round(currTonnes * 1.42);
    } else if (activeScenarioId === 'monsoon' || activeScenarioId === 'heavy-rain') {
      if (n.id === 'ts-kurla' || n.id === 'sort-kanjur') currTonnes = Math.round(currTonnes * 1.25);
    } else if (activeScenarioId === 'facility-shutdown') {
      if (n.id === 'sort-kanjur') nodeCap = 10; // Emergency halt
    } else if (activeScenarioId === 'truck-strike') {
      if (n.type === 'collection') currTonnes = Math.round(currTonnes * 0.85);
    }

    return {
      ...n,
      capacityTonnes: nodeCap,
      operatingHours: nodeHrs,
      currentTonnes: currTonnes,
      recoveryPct: recPct
    };
  });

  let modifiedVehicleConfig = { ...vehicleConfig };
  if (levers.vehiclesDelta !== undefined && levers.vehiclesDelta !== 0) {
    modifiedVehicleConfig.vehicleCount = Math.max(10, vehicleConfig.vehicleCount + levers.vehiclesDelta);
  }
  if (vehicleCapReduction > 0) {
    modifiedVehicleConfig.vehicleCapacityTonnes = Math.round(
      vehicleConfig.vehicleCapacityTonnes * (1 - vehicleCapReduction) * 10
    ) / 10;
  }

  let modifiedEdges: NetworkEdge[] = edges.map(e => {
    let delay = Math.round(e.delayMins * rainMultiplier * trafficMult);
    let travelTimeMinutes = Math.round(e.travelTimeMinutes * rainMultiplier * trafficMult);
    let distKm = e.distanceKm;
    let status = e.status;

    // Support all routing strategy dropdown choices
    const strat = levers.routeStrategy || '';
    if (strat.includes('Freeway') || strat.includes('Dynamic')) {
      if (e.id === 'e5' || e.from.includes('ts') || e.to.includes('sort')) {
        delay = Math.max(3, Math.round(delay * 0.5));
        travelTimeMinutes = Math.max(10, Math.round(travelTimeMinutes * 0.75));
        status = 'normal';
      }
    } else if (strat.includes('Staggered') || strat.includes('Shift')) {
      delay = Math.max(2, Math.round(delay * 0.6));
      travelTimeMinutes = Math.max(8, Math.round(travelTimeMinutes * 0.8));
    } else if (strat.includes('Express') || strat.includes('Direct')) {
      distKm = Math.max(3, Math.round(distKm * 0.85));
      travelTimeMinutes = Math.max(5, Math.round(travelTimeMinutes * 0.7));
    }

    if ((activeScenarioId === 'monsoon' || activeScenarioId === 'heavy-rain') && (e.id === 'e5' || e.id === 'e10')) {
      delay += Math.round(25 * heavyRainMultiplier);
      travelTimeMinutes += 30;
      status = 'blocked';
    }

    return {
      ...e,
      distanceKm: distKm,
      delayMins: delay,
      travelTimeMinutes,
      status
    };
  });

  // 1. Calculate Primary Waste Flow
  const flowResult = calculateWasteFlow(modifiedNodes, modifiedEdges, modifiedVehicleConfig);

  // 2. Solve Min-Cost Max-Flow Optimization
  const minCostFlow = solveMinCostMaxFlow(modifiedNodes, modifiedEdges, flowResult);

  // 3. Compute Min-Cut Network Criticality
  const minCut = computeMinCut(modifiedNodes, modifiedEdges, flowResult);

  // 4. Calculate Shadow Prices / Dual Values
  const shadowPrices = calculateShadowPrices(modifiedNodes, modifiedEdges, modifiedVehicleConfig);

  // 5. Evaluate Multi-factor Bottlenecks & Multi-method Agreement
  const bottlenecks = evaluateBottlenecks(modifiedNodes, modifiedEdges, flowResult, minCut, shadowPrices);

  const focalBottleneck = bottlenecks.length > 0 ? bottlenecks[0] : null;
  const focalNodeId = focalBottleneck ? focalBottleneck.nodeId : 'sort-kanjur';

  // 6. Root Cause & Lagged Correlation Analysis
  const rootCauses = analyzeRootCauses(modifiedNodes, flowResult, focalNodeId);

  // 7. Time-discrete 24-hour Queue Simulation
  const focalCap = modifiedNodes.find(n => n.id === focalNodeId)?.capacityTonnes || 1600;
  const queueTimeSeries = simulate24HourQueues(focalNodeId, focalCap, flowResult);

  // 8. Counterfactual Simulation
  const counterfactual = simulateCounterfactual(modifiedNodes, modifiedEdges, modifiedVehicleConfig, focalNodeId);

  // 9. Optimization Candidates & ROI Ranking
  const optimizationInterventions = generateOptimizationInterventions(modifiedNodes, modifiedEdges, modifiedVehicleConfig, flowResult);

  // 10. Environmental Impact & Landfill Runway Forecast
  const environmentalMetrics = calculateEnvironmentalMetrics(modifiedNodes, flowResult);

  return {
    flowResult,
    minCut,
    shadowPrices,
    bottlenecks,
    rootCauses,
    environmentalMetrics,
    optimizationInterventions,
    counterfactual,
    queueTimeSeries
  };
}
