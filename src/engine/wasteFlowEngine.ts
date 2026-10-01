import type { NetworkNode, NetworkEdge, VehicleConfig, FlowResult, NodeFlowMetrics, CollectionFrequency } from '../types/wasteNetwork';

/**
 * Helper to calculate collection frequency factors:
 * - twice_daily: 2 pickups/day, smaller batch size per pickup (0.5x), 2x dispatch cycles
 * - once_daily: 1 pickup/day (1.0x)
 * - every_2_days: 1 pickup every 48h (2.0x accumulation per collection event, queue spike)
 * - three_times_week: ~3 pickups/7 days (2.33x accumulation per collection event)
 */
export function getFrequencyMultipliers(freq?: CollectionFrequency): { batchMultiplier: number; tripMultiplier: number; queueSpikeFactor: number } {
  switch (freq) {
    case 'twice_daily':
      return { batchMultiplier: 0.5, tripMultiplier: 2.0, queueSpikeFactor: 0.7 };
    case 'every_2_days':
      return { batchMultiplier: 2.0, tripMultiplier: 0.5, queueSpikeFactor: 2.1 };
    case 'three_times_week':
      return { batchMultiplier: 2.33, tripMultiplier: 0.43, queueSpikeFactor: 2.4 };
    case 'once_daily':
    default:
      return { batchMultiplier: 1.0, tripMultiplier: 1.0, queueSpikeFactor: 1.0 };
  }
}

/**
 * Calculates complete daily waste flow across network topology enforcing mass balance conservation.
 */
export function calculateWasteFlow(
  nodes: NetworkNode[],
  edges: NetworkEdge[],
  vehicleConfig: VehicleConfig
): FlowResult {
  const nodeMetrics: Record<string, NodeFlowMetrics> = {};
  const edgeFlows: Record<string, { flow: number; capacity: number; utilizationPct: number; delayMins: number }> = {};

  // Map nodes for fast lookup
  const nodeMap = new Map<string, NetworkNode>();
  nodes.forEach(n => nodeMap.set(n.id, { ...n }));

  // Initialize node metrics
  nodes.forEach(n => {
    nodeMetrics[n.id] = {
      nodeId: n.id,
      inflowTonnes: 0,
      outflowTonnes: 0,
      capacityTonnes: n.capacityTonnes,
      effectiveCapacityTonnes: n.capacityTonnes,
      utilizationPct: 0,
      capacityPressure: 0,
      queueTonnes: 0,
      overflowTonnes: 0,
      processingTimeMins: 0,
      waitingTimeMins: 0,
      status: 'healthy'
    };
  });

  // Stage 1: Collection Inflow
  let totalCollected = 0;
  let totalCollectionTripMultiplier = 0;
  let collectionZoneCount = 0;

  nodes.filter(n => n.type === 'collection').forEach(n => {
    const metrics = nodeMetrics[n.id];
    metrics.inflowTonnes = n.currentTonnes;
    metrics.outflowTonnes = n.currentTonnes;
    totalCollected += n.currentTonnes;

    const freqFactors = getFrequencyMultipliers(n.collectionFrequency);
    totalCollectionTripMultiplier += freqFactors.tripMultiplier;
    collectionZoneCount++;
  });

  const avgCollectionTripMult = collectionZoneCount > 0 ? (totalCollectionTripMultiplier / collectionZoneCount) : 1.0;

  // Vehicle Fleet Transport Constraint Check
  const totalFleetCount = Math.max(10, vehicleConfig.vehicleCount);
  const vehicleCap = Math.max(1, vehicleConfig.vehicleCapacityTonnes);
  const opHours = vehicleConfig.operatingHours || 14;

  // Max daily trips per truck based on shift operating hours (avg roundtrip = 3.5h)
  const tripsPerTruckPerDay = Math.max(1, Math.floor(opHours / 3.0));
  const maxFleetTransportCapacityTonnes = totalFleetCount * vehicleCap * tripsPerTruckPerDay;

  // Constrain collection outflow by active fleet transport capacity
  const transportConstraintRatio = Math.min(1.0, maxFleetTransportCapacityTonnes / Math.max(1, totalCollected));

  // Apply transport constraint ratio to collection node outflows
  if (transportConstraintRatio < 1.0) {
    nodes.filter(n => n.type === 'collection').forEach(n => {
      const metrics = nodeMetrics[n.id];
      metrics.outflowTonnes = Math.round(n.currentTonnes * transportConstraintRatio);
      metrics.queueTonnes = Math.round(n.currentTonnes * (1 - transportConstraintRatio));
    });
  }

  // Topological / Stage-by-Stage Flow Propagation
  // Order: collection -> transfer -> sorting -> processing -> landfill
  const stages: ('collection' | 'transfer' | 'sorting' | 'processing' | 'landfill')[] = [
    'collection', 'transfer', 'sorting', 'processing', 'landfill'
  ];

  stages.forEach(stage => {
    const stageNodes = nodes.filter(n => n.type === stage);

    stageNodes.forEach(node => {
      const metrics = nodeMetrics[node.id];
      
      // Calculate effective capacity based on base capacityTonnes (which includes sortingCapDelta) and operating hours ratio
      const baseCap = node.capacityTonnes;
      const hoursRatio = (node.operatingHours || 16) / 16;
      const effectiveCap = Math.max(10, Math.round(baseCap * hoursRatio));

      metrics.effectiveCapacityTonnes = effectiveCap;

      if (stage !== 'collection') {
        // Calculate incoming flows from edges targeting this node
        const incomingEdges = edges.filter(e => e.to === node.id);
        let inflowSum = 0;

        incomingEdges.forEach(e => {
          const sourceMetrics = nodeMetrics[e.from];
          // Proportional flow allocation from source outflow
          const outgoingFromSource = edges.filter(outE => outE.from === e.from);
          const totalOutWeight = outgoingFromSource.reduce((acc, cur) => acc + cur.tonnesPerDay, 0);
          
          let allocatedFlow = e.tonnesPerDay;
          if (totalOutWeight > 0 && sourceMetrics.outflowTonnes > 0) {
            allocatedFlow = (e.tonnesPerDay / totalOutWeight) * sourceMetrics.outflowTonnes;
          }
          
          // Constrain by edge capacity
          const edgeCap = e.capacityPerDay || (allocatedFlow * 1.25);
          allocatedFlow = Math.min(allocatedFlow, edgeCap);
          
          edgeFlows[e.id] = {
            flow: Math.round(allocatedFlow),
            capacity: edgeCap,
            utilizationPct: Math.round((allocatedFlow / Math.max(1, edgeCap)) * 100),
            delayMins: e.delayMins
          };

          inflowSum += allocatedFlow;
        });

        metrics.inflowTonnes = Math.round(inflowSum);
      }

      // Compute capacity pressure & processing vs overflow
      metrics.capacityPressure = Number((metrics.inflowTonnes / Math.max(1, effectiveCap)).toFixed(2));

      // Calculate queue, backlog, and waiting time
      if (metrics.inflowTonnes > effectiveCap) {
        metrics.overflowTonnes = Math.round(metrics.inflowTonnes - effectiveCap);
        // Backlog in queue increases proportionally to excess overflow
        metrics.queueTonnes = Math.round(metrics.overflowTonnes * 0.90 + (node.queueTonnes || 0)); 
        metrics.outflowTonnes = Math.round(effectiveCap);
        metrics.utilizationPct = Math.round((metrics.inflowTonnes / Math.max(1, effectiveCap)) * 100);
        metrics.status = metrics.utilizationPct >= 110 ? 'critical' : 'warning';
      } else {
        metrics.overflowTonnes = 0;
        metrics.queueTonnes = Math.round(metrics.inflowTonnes * 0.05 + (node.queueTonnes || 0)); // Nominal operational buffer
        metrics.outflowTonnes = metrics.inflowTonnes;
        metrics.utilizationPct = Math.round((metrics.inflowTonnes / Math.max(1, effectiveCap)) * 100);
        metrics.status = metrics.utilizationPct >= 90 ? 'warning' : 'healthy';
      }

      // Compute estimated waiting & processing times
      const baseProcessingMins = node.processingTimeMins || 45;
      metrics.processingTimeMins = Math.round(baseProcessingMins * (metrics.utilizationPct / 100));
      metrics.waitingTimeMins = Math.round((metrics.queueTonnes / Math.max(10, effectiveCap / 24)) * 60);
    });
  });

  // Calculate System Aggregate Totals
  let totalProcessed = 0;
  let totalRecovered = 0;

  // Sorting & Processing Nodes Recovery Logic
  nodes.filter(n => n.type === 'processing' || n.type === 'sorting').forEach(n => {
    const outflow = nodeMetrics[n.id].outflowTonnes;
    totalProcessed += outflow;
    
    // Custom recovery percentage per node (clamped between 0 and 100%)
    const rawRecoveryPct = n.recoveryPct ?? (n.type === 'processing' ? 75 : 65);
    const nodeRecoveryPct = Math.min(100, Math.max(0, rawRecoveryPct));
    
    // Recovered waste cannot exceed outflow
    const nodeRecovered = Math.min(outflow, Math.round(outflow * (nodeRecoveryPct / 100)));
    totalRecovered += nodeRecovered;
  });

  let totalLandfill = 0;
  nodes.filter(n => n.type === 'landfill').forEach(n => {
    totalLandfill += nodeMetrics[n.id].inflowTonnes;
  });

  // If no landfill node connected or unhandled overflow, calculate unrecovered residual as landfill waste
  if (totalLandfill === 0 || totalLandfill < (totalCollected - totalRecovered)) {
    totalLandfill = Math.max(0, totalCollected - totalRecovered);
  }

  // Recovery Rate % (clamped strictly 0 <= rate <= 100)
  const rawRecoveryRatePct = Number(((totalRecovered / Math.max(1, totalCollected)) * 100).toFixed(1));
  const recoveryRatePct = Math.min(100, Math.max(0, rawRecoveryRatePct));
  const landfillDependencyPct = Math.min(100, Math.max(0, Number(((totalLandfill / Math.max(1, totalCollected)) * 100).toFixed(1))));

  // Multi-Leg Vehicle Logistics & Truck Trips Calculation
  let sumSystemEdgeTrips = 0;
  let totalDistanceKm = 0;
  edges.forEach(e => {
    const flow = edgeFlows[e.id]?.flow || e.tonnesPerDay;
    const edgeTrips = Math.ceil(flow / vehicleCap) * avgCollectionTripMult;
    sumSystemEdgeTrips += edgeTrips;
    totalDistanceKm += edgeTrips * (e.distanceKm || 15);
  });

  // Fleet dispatch ratio scaling total trips based on active fleet count relative to baseline (182 trucks)
  const fleetDispatchRatio = totalFleetCount / 182;
  const totalTrips = Math.max(10, Math.round((sumSystemEdgeTrips / 2.0) * fleetDispatchRatio));

  // Fuel & Emissions: fleet strain adds fuel multiplier if fleet capacity is tight
  const fleetStrainMultiplier = transportConstraintRatio < 1.0 ? (1 + (1 - transportConstraintRatio) * 0.4) : 1.0;
  const fuelEfficiency = Math.max(0.5, vehicleConfig.fuelEfficiencyKmPerLiter || 3.2);
  const totalFuelUsedLiters = Math.round((totalDistanceKm / fuelEfficiency) * fleetStrainMultiplier);
  
  // CO2e Calculations:
  // 1. Vehicle transport emissions (Fuel * factor)
  const co2Factor = vehicleConfig.co2EmissionFactorKgPerLiter || 2.68;
  const transportCo2eTonnes = (totalFuelUsedLiters * co2Factor) / 1000;
  // 2. Landfill outgassing emissions (~0.45 t CO2e per ton dumped)
  const landfillCo2eTonnes = totalLandfill * 0.45;
  const totalCO2eTonnes = Math.round(transportCo2eTonnes + landfillCo2eTonnes);

  // Max flow in system
  const maxNetworkFlowTonnes = Math.max(...Object.values(nodeMetrics).map(m => m.inflowTonnes), 100);

  return {
    nodeMetrics,
    edgeFlows,
    totalCollectedTonnes: Math.round(totalCollected),
    totalProcessedTonnes: Math.round(totalProcessed),
    totalLandfillTonnes: Math.round(totalLandfill),
    totalRecoveredTonnes: Math.round(totalRecovered),
    recoveryRatePct,
    landfillDependencyPct,
    totalTrips,
    totalDistanceKm: Math.round(totalDistanceKm),
    totalFuelUsedLiters,
    totalCO2eTonnes,
    maxNetworkFlowTonnes
  };
}
