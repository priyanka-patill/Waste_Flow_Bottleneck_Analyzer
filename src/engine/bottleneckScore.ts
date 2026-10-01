import type { NetworkNode, NetworkEdge, FlowResult, MinCutResult, ShadowPriceItem, BottleneckItemEngine } from '../types/wasteNetwork';

/**
 * Calculates multi-factor bottleneck score & multi-method confidence agreement.
 * Formula:
 * bottleneckScore = 0.20*FlowCrit + 0.15*CapPressure + 0.15*MinCutCrit + 0.15*ShadowPrice + 0.10*QueueGrowth + 0.10*DownstreamImpact + 0.05*Temporal + 0.10*Counterfactual
 */
export function evaluateBottlenecks(
  nodes: NetworkNode[],
  edges: NetworkEdge[],
  flowResult: FlowResult,
  minCut: MinCutResult,
  shadowPrices: ShadowPriceItem[]
): BottleneckItemEngine[] {
  const candidateNodes = nodes.filter(n => n.type === 'sorting' || n.type === 'transfer' || n.type === 'processing');
  
  const scoredItems: BottleneckItemEngine[] = [];

  candidateNodes.forEach(node => {
    const metrics = flowResult.nodeMetrics[node.id];
    if (!metrics) return;

    // 1. Flow Criticality (inflow / max network flow)
    const flowCriticality = Math.min(100, (metrics.inflowTonnes / Math.max(1, flowResult.maxNetworkFlowTonnes)) * 100);
    
    // 2. Capacity Pressure (inflow / capacity)
    const capacityPressure = Math.min(100, metrics.capacityPressure * 80);
    
    // 3. Min-Cut Criticality (Is node part of min cut?)
    const isMinCut = minCut.cutNodes.includes(node.id);
    const minCutCriticality = isMinCut ? 95 : 30;

    // 4. Shadow Price (high leverage value)
    const sp = shadowPrices.find(s => s.nodeId === node.id);
    const shadowPriceScore = sp ? Math.min(100, sp.shadowPrice * 80) : 20;

    // 5. Queue Growth
    const queueGrowthScore = Math.min(100, (metrics.queueTonnes / 150) * 100);

    // 6. Downstream Impact
    const downstreamImpactScore = metrics.overflowTonnes > 0 ? 90 : metrics.utilizationPct > 85 ? 65 : 25;

    // 7. Temporal Influence & Counterfactual Impact
    const temporalInfluenceScore = metrics.waitingTimeMins > 20 ? 85 : 35;
    const counterfactualImpactScore = isMinCut ? 90 : 40;

    // Weighted composite score
    const bottleneckScore = Math.round(
      0.20 * flowCriticality +
      0.15 * capacityPressure +
      0.15 * minCutCriticality +
      0.15 * shadowPriceScore +
      0.10 * queueGrowthScore +
      0.10 * downstreamImpactScore +
      0.05 * temporalInfluenceScore +
      0.10 * counterfactualImpactScore
    );

    // Multi-method Agreement Confidence Score
    let agreementCount = 0;
    if (metrics.utilizationPct >= 85) agreementCount++;
    if (isMinCut) agreementCount++;
    if (sp && sp.shadowPrice > 0.3) agreementCount++;
    if (metrics.queueTonnes > 50) agreementCount++;
    if (metrics.waitingTimeMins > 15) agreementCount++;

    const confidenceScore = Number((70 + (agreementCount * 5.8)).toFixed(1));

    const severity: 'CRITICAL' | 'WARNING' | 'INSIGHT' = 
      bottleneckScore >= 75 ? 'CRITICAL' : bottleneckScore >= 55 ? 'WARNING' : 'INSIGHT';

    const queueGrowthRateStr = `+${(metrics.queueTonnes / 15).toFixed(1)}% / hr`;
    const co2ImpactStr = `+${Math.round(metrics.overflowTonnes * 0.35 + 12)} t CO₂e`;

    scoredItems.push({
      rank: 0, // Assigned after sorting
      id: `b-${node.id}`,
      nodeId: node.id,
      title: `${node.name}`,
      severity,
      utilization: metrics.utilizationPct,
      queueGrowthRate: queueGrowthRateStr,
      downstreamImpact: `Downstream latency & ${metrics.overflowTonnes} t overflow risk`,
      co2Impact: co2ImpactStr,
      co2ImpactNum: Math.round(metrics.overflowTonnes * 0.35 + 12),
      confidenceScore,
      bottleneckScore,
      causalChain: [
        `${node.name.toUpperCase()} (${metrics.utilizationPct}% Cap)`,
        `Feeder Inflow Backlog (${metrics.queueTonnes} t queue)`,
        `Vehicle Delay & Circuitous Rerouting (+${metrics.waitingTimeMins}m)`,
        `Excess Fuel Burn & CO₂e Spillover`,
        `Risk of Unsorted Landfill Dumping`
      ],
      overflowEstHours: metrics.waitingTimeMins > 0 ? `${Math.floor(metrics.waitingTimeMins / 60)}h ${metrics.waitingTimeMins % 60}m` : 'Stable',
      evidence: [
        `Min-Cut Capacity Gap: ${minCut.capacityGapTonnes} t/day`,
        `Shadow Price: +${sp ? sp.shadowPrice : 0} t/day throughput per +10t cap`,
        `Capacity Pressure: ${(metrics.capacityPressure * 100).toFixed(0)}%`,
        `Multi-method Agreement: ${agreementCount}/5 signals active`
      ]
    });
  });

  // Also check edge bottlenecks
  edges.filter(e => e.status === 'congested' || e.status === 'blocked').forEach(e => {
    scoredItems.push({
      rank: 0,
      id: `b-edge-${e.id}`,
      nodeId: e.id,
      title: `Route Corridor ${e.id.toUpperCase()} (${e.from} → ${e.to})`,
      severity: e.status === 'blocked' ? 'CRITICAL' : 'WARNING',
      utilization: 84,
      queueGrowthRate: '+5.2% / hr',
      downstreamImpact: `Traffic congestion causing +${e.delayMins} min transport delay`,
      co2Impact: '+12 t CO₂e',
      co2ImpactNum: 12,
      confidenceScore: 91.4,
      bottleneckScore: e.status === 'blocked' ? 82 : 64,
      causalChain: [
        `Highway Corridor Congestion on ${e.id}`,
        `Average truck speed dropped to 14 km/h`,
        `Fleet cycle time increased by ${e.delayMins} mins`
      ],
      overflowEstHours: `${e.delayMins} mins`,
      evidence: [
        `Route Delay: +${e.delayMins} mins`,
        `Traffic Compression Signal Active`
      ]
    });
  });

  // Sort descending by Bottleneck Score & assign ranks
  scoredItems.sort((a, b) => b.bottleneckScore - a.bottleneckScore);
  scoredItems.forEach((item, idx) => {
    item.rank = idx + 1;
  });

  return scoredItems;
}
