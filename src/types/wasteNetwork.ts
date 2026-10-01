import type { WeatherData, WeatherImpactMultipliers, AirQualityContext, TrafficStatus, DataServiceStatus } from './api';

export type NodeType = 'collection' | 'transfer' | 'sorting' | 'processing' | 'landfill';
export type NodeStatus = 'healthy' | 'warning' | 'critical';



export type CollectionFrequency = 'once_daily' | 'twice_daily' | 'every_2_days' | 'three_times_week';

export interface NetworkNode {
  id: string;
  name: string;
  type: NodeType;
  capacityTonnes: number; // Tonnes per day (for collection: daily generation; for transfer/sorting/processing: daily throughput cap)
  currentTonnes: number;
  utilizationPct: number;
  status: NodeStatus;
  queueTonnes: number;
  processingRateTonnesPerHour: number;
  operatingHours: number; // Hours per day
  lat: number;
  lng: number;
  zone?: string;
  description: string;
  costPerTon: number;
  co2FactorTonPerTon: number;

  // Requirement 1 Specific Properties
  collectionFrequency?: CollectionFrequency; // PART C
  vehiclesAssigned?: number; // PART A
  vehicleCapacityAssignedTonnes?: number; // PART A
  recoveryPct?: number; // PART F (for processing/recycling facilities, 0-100)
  processingTimeMins?: number; // PART E & F (base handling/processing time)
  totalLandfillCapacityTonnes?: number; // PART G (Total lifetime volume)
  currentFilledVolumeTonnes?: number; // PART G (Current filled volume)
  timeWindow?: string; // PART A (Operating hours/time window)
}

export interface NetworkEdge {
  id: string;
  from: string;
  to: string;
  tonnesPerDay: number;
  capacityPerDay: number;
  distanceKm: number;
  travelTimeMinutes: number;
  fuelConsumptionPerKm: number; // Liters per km
  delayMins: number;
  transportCostPerTonKm: number;
  emissionFactorKgCo2PerLiter: number;
  status: 'normal' | 'congested' | 'blocked';
}

export interface VehicleConfig {
  vehicleCount: number;
  vehicleCapacityTonnes: number;
  fuelEfficiencyKmPerLiter: number;
  operatingHours: number;
  co2EmissionFactorKgPerLiter: number;
  avgSpeedKmPerHour?: number; // PART B
}

export interface NetworkLevers {
  sortingCapDelta: number; // Tonnes/day shift for Sorting
  vehiclesDelta: number; // Delta active vehicles
  targetRecoveryPct: number; // Target resource recovery %
  operatingHours: number; // Operating hours/day
  routeStrategy: string; // 'Dynamic Freeway Rerouting' | 'Staggered Peak Hours' | etc.
}

export interface NetworkState {
  nodes: NetworkNode[];
  edges: NetworkEdge[];
  vehicleConfig: VehicleConfig;
  levers: NetworkLevers;
  activeScenarioId?: string;
  weather?: WeatherData;
  weatherImpact?: WeatherImpactMultipliers;
  airQuality?: AirQualityContext;
  trafficStatus?: TrafficStatus;
  dataStatus?: DataServiceStatus;
}

export interface NodeFlowMetrics {
  nodeId: string;
  inflowTonnes: number;
  outflowTonnes: number;
  capacityTonnes: number;
  effectiveCapacityTonnes: number;
  utilizationPct: number;
  capacityPressure: number;
  queueTonnes: number;
  overflowTonnes: number;
  processingTimeMins: number;
  waitingTimeMins: number;
  status: NodeStatus;
}

export interface FlowResult {
  nodeMetrics: Record<string, NodeFlowMetrics>;
  edgeFlows: Record<string, { flow: number; capacity: number; utilizationPct: number; delayMins: number }>;
  totalCollectedTonnes: number;
  totalProcessedTonnes: number;
  totalLandfillTonnes: number;
  totalRecoveredTonnes: number;
  recoveryRatePct: number;
  landfillDependencyPct: number;
  totalTrips: number;
  totalDistanceKm: number;
  totalFuelUsedLiters: number;
  totalCO2eTonnes: number;
  maxNetworkFlowTonnes: number;
}

export interface MinCutResult {
  cutCapacityTonnes: number;
  cutNodes: string[];
  cutEdges: string[];
  capacityGapTonnes: number;
}

export interface ShadowPriceItem {
  nodeId: string;
  nodeName: string;
  shadowPrice: number; // Delta Throughput (t/day) per +10t capacity increase
  landfillReductionPer10t: number;
}

export interface BottleneckItemEngine {
  rank: number;
  id: string;
  nodeId: string;
  title: string;
  severity: 'CRITICAL' | 'WARNING' | 'INSIGHT';
  utilization: number;
  queueGrowthRate: string;
  downstreamImpact: string;
  co2Impact: string;
  co2ImpactNum: number;
  confidenceScore: number; // Based on multi-method agreement
  bottleneckScore: number; // 0 - 100
  causalChain: string[];
  overflowEstHours: string;
  evidence: string[];
}

export interface RootCauseFactor {
  title: string;
  pct: number;
  color: string;
  note: string;
}

export interface RootCauseEvidenceLog {
  time: string;
  text: string;
  badge: string;
}

export interface RootCauseAnalysisResult {
  causes: RootCauseFactor[];
  evidenceLogs: RootCauseEvidenceLog[];
  diagnosticFinding: string;
}

export interface EnvironmentalMetricsResult {
  healthScore: number;
  divertedTonnesMonthly: number;
  co2MitigatedMonthlyTonnes: number;
  emissionSources: { label: string; pct: number; color: string; tonnesMonthly: number }[];
  landfillRunway: {
    siteName: string;
    totalCapacityTonnes: number;
    remainingTonnes: number;
    baselineDaysRemaining: number;
    optimizedDaysRemaining: number;
    extensionDays: number;
    baselineDepletionDate: string;
  };
}

export interface OptimizationInterventionEngine {
  rank: number;
  title: string;
  description: string;
  co2SavedMonthlyTonnes: number;
  investmentInrLakhs: number;
  roiRatio: number;
  wasteDivertedTonnes: number;
  paybackMonths: number;
  category: 'Infrastructure' | 'Logistics' | 'Operations';
}

export interface CounterfactualMetrics {
  baseline: {
    processedTonnes: number;
    co2EmissionsTonnes: number;
    landfillDumpingTonnes: number;
    fleetDieselLiters: number;
    truckTrips: number;
  };
  counterfactual: {
    processedTonnes: number;
    co2EmissionsTonnes: number;
    landfillDumpingTonnes: number;
    fleetDieselLiters: number;
    truckTrips: number;
  };
  delta: {
    co2SavedTonnes: number;
    landfillAvoidedTonnes: number;
    dieselSavedLiters: number;
    tripsCut: number;
  };
}

export interface TimeStepData {
  timeLabel: string;
  hour: number;
  arrivalsTonnes: number;
  processedTonnes: number;
  queueTonnes: number;
  waitingMins: number;
}

export interface WasteFlowAnalysisResult {
  flowResult: FlowResult;
  minCut: MinCutResult;
  shadowPrices: ShadowPriceItem[];
  bottlenecks: BottleneckItemEngine[];
  rootCauses: RootCauseAnalysisResult;
  environmentalMetrics: EnvironmentalMetricsResult;
  optimizationInterventions: OptimizationInterventionEngine[];
  counterfactual: CounterfactualMetrics;
  queueTimeSeries: TimeStepData[];
}
