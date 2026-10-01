export interface WasteNode {
  id: string;
  name: string;
  type: 'collection' | 'transfer' | 'sorting' | 'processing' | 'landfill';
  capacityTonnes: number; // Daily or hourly depending on type
  currentTonnes: number;
  utilizationPct: number;
  status: 'healthy' | 'warning' | 'critical';
  queueTonnes?: number;
  processingRate?: string;
  overflowEstHours?: string;
  co2ImpactTons?: number;
  lat: number;
  lng: number;
  zone?: string;
  description: string;
  collectionFrequency?: 'once_daily' | 'twice_daily' | 'every_2_days' | 'three_times_week';
  vehiclesAssigned?: number;
  vehicleCapacityAssignedTonnes?: number;
  recoveryPct?: number;
  totalLandfillCapacityTonnes?: number;
  currentFilledVolumeTonnes?: number;
  timeWindow?: string;
}

export interface WasteEdge {
  id: string;
  from: string;
  to: string;
  tonnesPerDay: number;
  status: 'normal' | 'congested' | 'blocked';
  delayMins: number;
}

export interface BottleneckItem {
  rank: number;
  id: string;
  nodeId: string;
  title: string;
  severity: 'CRITICAL' | 'WARNING' | 'INSIGHT';
  utilization: number;
  queueGrowthRate: string;
  downstreamImpact: string;
  co2Impact: string;
  confidenceScore: number;
  causalChain: string[];
}

export interface OptimizationIntervention {
  rank: number;
  title: string;
  description: string;
  co2SavedMonthlyTonnes: number;
  investmentInrLakhs: number;
  roiRatio: number; // t CO2e / Lakh
  wasteDivertedTonnes: number;
  paybackMonths: number;
  category: 'Infrastructure' | 'Logistics' | 'Operations';
}

export interface ScenarioPreset {
  id: string;
  title: string;
  wasteIncreasePct: number;
  durationDays: number;
  affectedFacilities: string[];
  riskLevel: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  description: string;
}

export const INITIAL_NODES: WasteNode[] = [
  // Collection Zones
  { id: 'zone-colaba', name: 'Zone A — Colaba & Fort', type: 'collection', capacityTonnes: 800, currentTonnes: 680, utilizationPct: 85, status: 'healthy', lat: 18.9067, lng: 72.8147, description: 'Commercial & High-density municipal sector', collectionFrequency: 'once_daily', vehiclesAssigned: 35, vehicleCapacityAssignedTonnes: 12, timeWindow: '06:00 - 18:00' },
  { id: 'zone-bandra', name: 'Zone B — Bandra & Khar', type: 'collection', capacityTonnes: 950, currentTonnes: 840, utilizationPct: 88, status: 'healthy', lat: 19.0596, lng: 72.8295, description: 'Mixed commercial & residential sector', collectionFrequency: 'once_daily', vehiclesAssigned: 40, vehicleCapacityAssignedTonnes: 12, timeWindow: '06:00 - 18:00' },
  { id: 'zone-andheri', name: 'Zone C — Andheri & Juhu', type: 'collection', capacityTonnes: 1200, currentTonnes: 1120, utilizationPct: 93, status: 'warning', lat: 19.1136, lng: 72.8697, description: 'High volume residential & IT corridor', collectionFrequency: 'once_daily', vehiclesAssigned: 50, vehicleCapacityAssignedTonnes: 12, timeWindow: '06:00 - 20:00' },
  { id: 'zone-thane', name: 'Zone D — Thane & Mulund', type: 'collection', capacityTonnes: 1100, currentTonnes: 1050, utilizationPct: 95, status: 'warning', lat: 19.1726, lng: 72.9426, description: 'Dense northern residential belt', collectionFrequency: 'once_daily', vehiclesAssigned: 45, vehicleCapacityAssignedTonnes: 12, timeWindow: '06:00 - 18:00' },
  { id: 'zone-navi', name: 'Zone E — Navi Mumbai', type: 'collection', capacityTonnes: 1200, currentTonnes: 1130, utilizationPct: 94, status: 'healthy', lat: 19.0330, lng: 73.0297, description: 'Planned industrial & civic node', collectionFrequency: 'once_daily', vehiclesAssigned: 48, vehicleCapacityAssignedTonnes: 12, timeWindow: '06:00 - 18:00' },

  // Transfer Stations
  { id: 'ts-dharavi', name: 'Transfer Station 1 — Dharavi', type: 'transfer', capacityTonnes: 1400, currentTonnes: 1150, utilizationPct: 82, status: 'healthy', lat: 19.0400, lng: 72.8500, description: 'Central hub for South & Central Mumbai', processingRate: '100 t/hr' },
  { id: 'ts-kurla', name: 'Transfer Station 2 — Kurla', type: 'transfer', capacityTonnes: 1600, currentTonnes: 1392, utilizationPct: 87, status: 'warning', queueTonnes: 110, lat: 19.0700, lng: 72.8800, description: 'Eastern highway transit node — Heavy influx', processingRate: '110 t/hr' },
  { id: 'ts-goregaon', name: 'Transfer Station 3 — Goregaon', type: 'transfer', capacityTonnes: 1200, currentTonnes: 810, utilizationPct: 68, status: 'healthy', lat: 19.1500, lng: 72.8400, description: 'Western suburb compression station', processingRate: '90 t/hr' },

  // Sorting Facilities
  { id: 'sort-mahim', name: 'Sorting Facility A — Mahim', type: 'sorting', capacityTonnes: 120, currentTonnes: 106, utilizationPct: 88, status: 'healthy', processingRate: '120 t/hr', lat: 19.0350, lng: 72.8400, description: 'Semi-automated optical sorting facility', recoveryPct: 70 },
  { id: 'sort-kanjur', name: 'Sorting Facility B — Kanjurmarg', type: 'sorting', capacityTonnes: 160, currentTonnes: 151, utilizationPct: 94, status: 'critical', queueTonnes: 182, processingRate: '160 t/hr', overflowEstHours: '5h 42m', co2ImpactTons: 42, lat: 19.1300, lng: 72.9300, description: 'High-throughput MRF — Bottleneck focal point', recoveryPct: 65 },
  { id: 'sort-taloja', name: 'Sorting Facility C — Taloja', type: 'sorting', capacityTonnes: 220, currentTonnes: 140, utilizationPct: 64, status: 'healthy', processingRate: '220 t/hr', lat: 19.0600, lng: 73.1000, description: 'State-of-the-art regional processing plant with 22% spare capacity', recoveryPct: 75 },
  { id: 'sort-bhiwandi', name: 'Sorting Facility D — Bhiwandi', type: 'sorting', capacityTonnes: 140, currentTonnes: 99, utilizationPct: 71, status: 'healthy', processingRate: '140 t/hr', lat: 19.2800, lng: 73.0500, description: 'Northern outskirts bulk material facility', recoveryPct: 60 },

  // Processing & Recycling
  { id: 'proc-biogas', name: 'Bio-Methanation Plant 1', type: 'processing', capacityTonnes: 500, currentTonnes: 450, utilizationPct: 90, status: 'healthy', lat: 19.0800, lng: 72.9100, description: 'Produces compressed biogas & organic fertilizer', recoveryPct: 80 },
  { id: 'proc-pyrolysis', name: 'Plastic Pyrolysis Hub', type: 'processing', capacityTonnes: 350, currentTonnes: 320, utilizationPct: 91, status: 'healthy', lat: 19.1000, lng: 72.9500, description: 'Converts non-recyclable polymers to synthetic fuel', recoveryPct: 75 },
  { id: 'proc-mrf', name: 'Material Recovery Hub (MRF)', type: 'processing', capacityTonnes: 700, currentTonnes: 680, utilizationPct: 97, status: 'warning', lat: 19.1600, lng: 72.9800, description: 'High-value paper, metal & glass recovery unit', recoveryPct: 85 },

  // Landfills
  { id: 'landfill-deonar', name: 'Deonar Landfill Site', type: 'landfill', capacityTonnes: 2400000, currentTonnes: 1982000, utilizationPct: 83, status: 'warning', overflowEstHours: '143 Days', lat: 19.0600, lng: 72.9200, description: 'Legacy dumping ground — Urgent diversion target', totalLandfillCapacityTonnes: 2400000, currentFilledVolumeTonnes: 1982000 },
  { id: 'landfill-kanjur', name: 'Kanjurmarg Regional Landfill', type: 'landfill', capacityTonnes: 4100000, currentTonnes: 2900000, utilizationPct: 71, status: 'healthy', overflowEstHours: '420 Days', lat: 19.1400, lng: 72.9400, description: 'Engineered sanitary landfill with leachate treatment', totalLandfillCapacityTonnes: 4100000, currentFilledVolumeTonnes: 2900000 }
];

export const INITIAL_EDGES: WasteEdge[] = [
  { id: 'e1', from: 'zone-colaba', to: 'ts-dharavi', tonnesPerDay: 680, status: 'normal', delayMins: 4 },
  { id: 'e2', from: 'zone-bandra', to: 'ts-dharavi', tonnesPerDay: 470, status: 'normal', delayMins: 6 },
  { id: 'e3', from: 'zone-bandra', to: 'ts-goregaon', tonnesPerDay: 370, status: 'normal', delayMins: 5 },
  { id: 'e4', from: 'zone-andheri', to: 'ts-goregaon', tonnesPerDay: 440, status: 'normal', delayMins: 8 },
  { id: 'e5', from: 'zone-andheri', to: 'ts-kurla', tonnesPerDay: 680, status: 'congested', delayMins: 22 },
  { id: 'e6', from: 'zone-thane', to: 'sort-kanjur', tonnesPerDay: 1050, status: 'congested', delayMins: 18 },
  { id: 'e7', from: 'zone-navi', to: 'sort-taloja', tonnesPerDay: 1130, status: 'normal', delayMins: 5 },

  { id: 'e8', from: 'ts-dharavi', to: 'sort-mahim', tonnesPerDay: 850, status: 'normal', delayMins: 3 },
  { id: 'e9', from: 'ts-dharavi', to: 'sort-kanjur', tonnesPerDay: 300, status: 'congested', delayMins: 14 },
  { id: 'e10', from: 'ts-kurla', to: 'sort-kanjur', tonnesPerDay: 1392, status: 'blocked', delayMins: 34 },
  { id: 'e11', from: 'ts-goregaon', to: 'sort-bhiwandi', tonnesPerDay: 810, status: 'normal', delayMins: 7 },

  { id: 'e12', from: 'sort-mahim', to: 'proc-biogas', tonnesPerDay: 450, status: 'normal', delayMins: 2 },
  { id: 'e13', from: 'sort-mahim', to: 'proc-pyrolysis', tonnesPerDay: 320, status: 'normal', delayMins: 4 },
  { id: 'e14', from: 'sort-kanjur', to: 'proc-mrf', tonnesPerDay: 680, status: 'normal', delayMins: 5 },
  { id: 'e15', from: 'sort-taloja', to: 'proc-mrf', tonnesPerDay: 500, status: 'normal', delayMins: 6 },

  { id: 'e16', from: 'sort-kanjur', to: 'landfill-deonar', tonnesPerDay: 1100, status: 'congested', delayMins: 28 },
  { id: 'e17', from: 'sort-kanjur', to: 'landfill-kanjur', tonnesPerDay: 710, status: 'normal', delayMins: 8 },
  { id: 'e18', from: 'sort-bhiwandi', to: 'landfill-kanjur', tonnesPerDay: 420, status: 'normal', delayMins: 10 }
];

export const BOTTLENECKS: BottleneckItem[] = [
  {
    rank: 1,
    id: 'b1',
    nodeId: 'sort-kanjur',
    title: 'Sorting Facility B — Kanjurmarg East',
    severity: 'CRITICAL',
    utilization: 94,
    queueGrowthRate: '+14.2% / hr',
    downstreamImpact: 'Transfer Station 2 gridlock, 18 vehicle queues, +42 t CO₂e emission spillover',
    co2Impact: '+42 t CO₂e',
    confidenceScore: 94.8,
    causalChain: [
      'SORTING FACILITY B (94% Cap)',
      'Transfer Station 2 Congestion ( Kurla )',
      'Fleet Beta Queue Growth (18 Trucks)',
      'Longer idling & circuitous re-routing',
      'Excess diesel burn & CO₂ spike',
      'Unsorted waste spillover to Deonar Landfill'
    ]
  },
  {
    rank: 2,
    id: 'b2',
    nodeId: 'ts-kurla',
    title: 'Transfer Station 2 — Kurla Junction',
    severity: 'WARNING',
    utilization: 87,
    queueGrowthRate: '+8.4% / hr',
    downstreamImpact: 'Feeder routes from Zone C & Zone D delayed by average 22 minutes',
    co2Impact: '+18 t CO₂e',
    confidenceScore: 89.2,
    causalChain: [
      'TRANSFER STATION 2 (87% Cap)',
      'Compactor bay backlog',
      'Western Express corridor delay (+22m)',
      'Collection truck return delays in Zone C'
    ]
  },
  {
    rank: 3,
    id: 'b3',
    nodeId: 'e5',
    title: 'Route M-17 — Western Express Highway Corridor',
    severity: 'WARNING',
    utilization: 82,
    queueGrowthRate: '+5.1% / hr',
    downstreamImpact: 'Monsoon waterlogging causing +22 min delay on 38 daily transport legs',
    co2Impact: '+12 t CO₂e',
    confidenceScore: 92.0,
    causalChain: [
      'Monsoon congestion on M-17',
      'Avg truck speed dropped from 28 km/h to 11 km/h',
      'Fleet cycle time increased by 31%'
    ]
  }
];

export const OPTIMIZATION_INTERVENTIONS: OptimizationIntervention[] = [
  {
    rank: 1,
    title: 'Reallocate 180 t/day from Facility B to Facility C (Taloja)',
    description: 'Dynamic load balancing leveraging Facility C\'s 22% spare capacity via Eastern Freeway corridor.',
    co2SavedMonthlyTonnes: 142,
    investmentInrLakhs: 8.4,
    roiRatio: 16.9,
    wasteDivertedTonnes: 5400,
    paybackMonths: 1.8,
    category: 'Operations'
  },
  {
    rank: 2,
    title: 'Dynamic Fleet Rerouting on Western Express (Route M-17)',
    description: 'Staggered dispatch windows to avoid peak monsoon commute congestion and reduce idle fuel burn.',
    co2SavedMonthlyTonnes: 91,
    investmentInrLakhs: 2.1,
    roiRatio: 43.3,
    wasteDivertedTonnes: 2100,
    paybackMonths: 0.6,
    category: 'Logistics'
  },
  {
    rank: 3,
    title: 'Extend Facility B Shift by 2.5 Hours (Night Batch)',
    description: 'Clear nocturnal queue backlog before morning peak collection arrivals.',
    co2SavedMonthlyTonnes: 67,
    investmentInrLakhs: 1.4,
    roiRatio: 47.8,
    wasteDivertedTonnes: 3200,
    paybackMonths: 0.4,
    category: 'Infrastructure'
  }
];

export const SCENARIO_PRESETS: ScenarioPreset[] = [
  {
    id: 'ganpati',
    title: 'Ganpati Visarjan Festival Surge',
    wasteIncreasePct: 35,
    durationDays: 5,
    affectedFacilities: ['zone-colaba', 'zone-bandra', 'ts-dharavi'],
    riskLevel: 'HIGH',
    description: 'Massive influx of organic floral waste, thermocol & temporary structures across coastal collection zones.'
  },
  {
    id: 'diwali',
    title: 'Diwali Commercial & Packaging Peak',
    wasteIncreasePct: 42,
    durationDays: 4,
    affectedFacilities: ['zone-andheri', 'zone-thane', 'sort-kanjur'],
    riskLevel: 'CRITICAL',
    description: 'Spike in cardboard, electronic packaging, and solid waste overloading sorting hubs.'
  },
  {
    id: 'monsoon',
    title: 'Monsoon Heavy Inundation & Highway Collapse',
    wasteIncreasePct: 20,
    durationDays: 3,
    affectedFacilities: ['ts-kurla', 'e5', 'sort-kanjur'],
    riskLevel: 'CRITICAL',
    description: 'Waterlogging shuts down key underpasses, reducing transport speeds by 60% and doubling queue times.'
  },
  {
    id: 'facility-shutdown',
    title: 'Sorting Facility B Outage (72h Emergency)',
    wasteIncreasePct: 0,
    durationDays: 3,
    affectedFacilities: ['sort-kanjur', 'ts-kurla', 'landfill-deonar'],
    riskLevel: 'CRITICAL',
    description: 'Unplanned mechanical fault forces complete halt of main optical sorter conveyor.'
  },
  {
    id: 'truck-strike',
    title: 'Civic Transport Fleet Shortage (-25% Vehicles)',
    wasteIncreasePct: 0,
    durationDays: 7,
    affectedFacilities: ['zone-andheri', 'zone-thane', 'ts-dharavi'],
    riskLevel: 'HIGH',
    description: 'Driver strike reduces active vehicle fleet from 182 to 136 trucks.'
  }
];
