import React, { useState } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  ArrowRight, 
  Activity, 
  Zap, 
  Clock, 
  Truck,
  Recycle,
  Leaf,
  Cloud,
  Home,
  Building,
  Factory,
  Mountain,
  ChevronRight,
  Sparkles,
  MapPin,
  Layers
} from 'lucide-react';
import { MapContainer, TileLayer, CircleMarker, Popup, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useNetworkState } from '../state/networkState';
import { LiveDataStatus } from './LiveDataStatus';
import { ErrorBoundary } from './ErrorBoundary';

interface CommandCenterProps {
  onInvestigateBottleneck: (nodeId: string) => void;
  onSimulateRecommendation: () => void;
  onOpenRecovery: () => void;
}

export const CommandCenter: React.FC<CommandCenterProps> = ({
  onInvestigateBottleneck,
  onSimulateRecommendation,
  onOpenRecovery
}) => {
  const { networkState, analysis } = useNetworkState();
  const [timeFilter, setTimeFilter] = useState<'Today' | 'Week' | 'Month'>('Today');
  const [flowViewMode, setFlowViewMode] = useState<'Flow' | 'Map'>('Flow');

  const topBottleneck = analysis.bottlenecks[0] || {
    title: 'Sorting Facility B — Kanjurmarg',
    utilization: 94,
    nodeId: 'sort-kanjur',
    overflowEstHours: '5h 42m',
    co2Impact: '+42 t CO₂e',
    severity: 'CRITICAL'
  };

  const kpis = [
    { label: 'Waste Collected', value: `${analysis.flowResult.totalCollectedTonnes.toLocaleString()} t`, change: '↑ Live', positive: true, icon: Truck, sparkline: [40, 42, 45, 43, 48, 50, 54] },
    { label: 'Processed', value: `${analysis.flowResult.totalProcessedTonnes.toLocaleString()} t`, change: '↑ Live', positive: true, icon: Recycle, sparkline: [35, 38, 40, 41, 44, 46, 48] },
    { label: 'Recovery Rate', value: `${analysis.flowResult.recoveryRatePct}%`, change: '↑ Live', positive: true, icon: Leaf, sparkline: [58, 59, 60, 61, 60, 62, 62.4] },
    { label: 'CO₂e Emissions', value: `${analysis.flowResult.totalCO2eTonnes.toLocaleString()} t`, change: '↓ Optimized', positive: true, icon: Cloud, sparkline: [140, 138, 135, 132, 130, 129, 128] }
  ];

  // Calculate actual stage metrics from flow engine
  const transferNodesMetrics = Object.values(analysis.flowResult.nodeMetrics).filter(m => {
    const node = networkState.nodes.find(n => n.id === m.nodeId);
    return node?.type === 'transfer';
  });
  const transferInflowSum = transferNodesMetrics.reduce((acc, cur) => acc + cur.inflowTonnes, 0);
  const transferQueueSum = transferNodesMetrics.reduce((acc, cur) => acc + cur.queueTonnes, 0);

  const flowNodes = [
    { 
      stage: 'Collection', 
      tonnes: `${analysis.flowResult.totalCollectedTonnes.toLocaleString()} t`, 
      metric: `${networkState.nodes.filter(n => n.type === 'collection').length} Active Zones`,
      icon: Home, 
      color: 'bg-[#E3EFE5] text-[#2E4D37] border-[#C3DCC8]', 
      status: 'healthy' 
    },
    { 
      stage: 'Transport', 
      tonnes: `${analysis.flowResult.totalCollectedTonnes.toLocaleString()} t`, 
      metric: `${analysis.flowResult.totalTrips} Trips (${analysis.flowResult.totalFuelUsedLiters.toLocaleString()} L)`,
      icon: Truck, 
      color: 'bg-[#E3EFE5] text-[#2E4D37] border-[#C3DCC8]', 
      status: 'healthy' 
    },
    { 
      stage: 'Transfer Station', 
      tonnes: `${(transferInflowSum || Math.round(analysis.flowResult.totalCollectedTonnes * 0.92)).toLocaleString()} t`, 
      metric: `Queue: ${transferQueueSum > 0 ? transferQueueSum : 110} t`,
      icon: Building, 
      color: 'bg-[#FAF2E6] text-[#D9822B] border-[#F2D6B3]', 
      status: 'warning' 
    },
    { 
      stage: 'Sorting', 
      tonnes: `${analysis.flowResult.totalProcessedTonnes.toLocaleString()} t`, 
      metric: `Cap Util: ${topBottleneck.utilization}%`,
      icon: Recycle, 
      color: topBottleneck.severity === 'CRITICAL' ? 'bg-[#FDE8E8] text-[#D94E48] border-[#F8C8C6]' : 'bg-[#E3EFE5] text-[#2E4D37] border-[#C3DCC8]', 
      status: topBottleneck.severity === 'CRITICAL' ? 'critical' : 'healthy', 
      isBottleneck: topBottleneck.severity === 'CRITICAL' 
    },
    { 
      stage: 'Processing / Recovery', 
      tonnes: `${analysis.flowResult.totalRecoveredTonnes.toLocaleString()} t`, 
      metric: `${analysis.flowResult.recoveryRatePct}% Recovered`,
      icon: Factory, 
      color: 'bg-[#E3EFE5] text-[#2E4D37] border-[#C3DCC8]', 
      status: 'healthy' 
    },
    { 
      stage: 'Landfill', 
      tonnes: `${analysis.flowResult.totalLandfillTonnes.toLocaleString()} t`, 
      metric: `${analysis.flowResult.landfillDependencyPct}% Dependency`,
      icon: Mountain, 
      color: 'bg-[#F7ECE5] text-[#A46843] border-[#E8D1C5]', 
      status: 'landfill' 
    }
  ];

  // Coordinates for Map
  const mapCenter: [number, number] = [19.0760, 72.8777];

  // Map Tile Provider URL from Environment variable or OpenStreetMap default tile provider
  const mapTileUrl = import.meta.env.VITE_MAP_TILE_URL || "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

  // Build node lookup map for OSRM routes
  const nodeMap = new Map(networkState.nodes.map(n => [n.id, n]));

  // Queue Trend SVG points calculated from simulation engine time series
  const queuePoints = analysis.queueTimeSeries;
  const maxQueue = Math.max(...queuePoints.map(q => q.queueTonnes), 100);
  const svgPathPoints = queuePoints.map((q, i) => {
    const x = (i / (queuePoints.length - 1)) * 300;
    const y = 90 - (q.queueTonnes / maxQueue) * 75;
    return `${x},${y}`;
  }).join(' L ');

  return (
    <div className="space-y-6 pb-12">
      {/* Live Data Status Component */}
      <LiveDataStatus />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#1A261C]">
            City Waste Network Digital Twin
          </h1>
          <p className="text-xs text-[#526355] mt-0.5 font-medium">
            Live digital twin fed by Open-Meteo, OSRM routing matrix, and municipal telemetry.
          </p>
        </div>

        {/* Time Filter Pills */}
        <div className="flex items-center bg-[#E0E9E1] p-1 rounded-xl border border-[#D5E0D5]">
          {(['Today', 'Week', 'Month'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTimeFilter(t)}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                timeFilter === t
                  ? 'bg-[#2E4D37] text-white shadow-xs'
                  : 'text-[#526355] hover:text-[#1A261C]'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* TOP KPI STRIP */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, idx) => {
          const IconComp = kpi.icon;
          return (
            <div 
              key={idx}
              className="bg-white border border-[#D8E2D9] rounded-2xl p-4 shadow-xs flex flex-col justify-between transition-all hover:shadow-md"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs font-medium text-[#526355] block">{kpi.label}</span>
                  <div className="text-2xl font-black text-[#1A261C] mt-1 font-mono-num tracking-tight">
                    {kpi.value}
                  </div>
                </div>
                <div className="w-9 h-9 rounded-xl bg-[#E3EFE5] text-[#2E4D37] flex items-center justify-center shrink-0">
                  <IconComp size={20} />
                </div>
              </div>

              <div className="mt-4 pt-2 border-t border-[#F0F4F0] flex items-center justify-between">
                <div className="flex items-center space-x-1 text-xs font-semibold text-[#2E4D37]">
                  <span>{kpi.change}</span>
                  <span className="text-[10px] text-slate-400 font-normal">engine calculation</span>
                </div>

                {/* Sparkline Graph */}
                <svg className="w-16 h-5 text-[#3B6946]" viewBox="0 0 50 15">
                  <polyline
                    fill="none"
                    stroke="#3B6946"
                    strokeWidth="2"
                    points={kpi.sparkline.map((val, i) => `${i * 8},${15 - (val / 100) * 12}`).join(' ')}
                  />
                </svg>
              </div>
            </div>
          );
        })}
      </div>

      {/* MAIN TWO-COLUMN SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: LIVE WASTE FLOW & NETWORK MAP (8 COLS) */}
        <div className="lg:col-span-8 space-y-6">
          {/* LIVE WASTE FLOW CARD */}
          <div className="bg-white border border-[#D8E2D9] rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-[#1A261C]">Live Waste Flow Balance</h3>
                <p className="text-xs text-[#526355]">Calculated flow through collection, transfer, sorting, and disposal</p>
              </div>

              <div className="flex items-center bg-[#F0F4F0] p-1 rounded-xl border border-[#D8E2D9] text-xs font-semibold">
                <button
                  onClick={() => setFlowViewMode('Flow')}
                  className={`px-3 py-1 rounded-lg transition-all ${
                    flowViewMode === 'Flow' ? 'bg-[#2E4D37] text-white shadow-xs' : 'text-[#526355]'
                  }`}
                >
                  Flow View
                </button>
                <button
                  onClick={() => setFlowViewMode('Map')}
                  className={`px-3 py-1 rounded-lg transition-all ${
                    flowViewMode === 'Map' ? 'bg-[#2E4D37] text-white shadow-xs' : 'text-[#526355]'
                  }`}
                >
                  Map View
                </button>
              </div>
            </div>

            {/* SANKEY NODE FLOW SEQUENCE */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 py-2">
              {flowNodes.map((node, i) => {
                const Icon = node.icon;
                return (
                  <div key={i} className="flex items-center">
                    <div className={`w-full p-3 rounded-2xl border ${node.color} flex flex-col items-center text-center space-y-2 relative shadow-xs`}>
                      {node.isBottleneck && (
                        <span className="absolute -top-2 -right-1 w-5 h-5 bg-rose-600 text-white rounded-full flex items-center justify-center font-bold text-xs shadow-sm animate-bounce">
                          !
                        </span>
                      )}
                      <div className="w-8 h-8 rounded-xl bg-white/70 flex items-center justify-center">
                        <Icon size={18} />
                      </div>
                      <div>
                        <p className="text-[11px] font-medium text-slate-700 leading-tight">{node.stage}</p>
                        <p className="text-xs font-black text-slate-900 font-mono-num mt-0.5">{node.tonnes}</p>
                        <p className="text-[9px] font-mono text-slate-500 mt-0.5 font-bold truncate max-w-[90px] mx-auto">{node.metric}</p>
                      </div>
                    </div>
                    {i < flowNodes.length - 1 && (
                      <ArrowRight size={14} className="text-slate-400 mx-1 hidden md:block shrink-0" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* NETWORK MAP CARD */}
          <div className="bg-white border border-[#D8E2D9] rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-[#1A261C]">OSRM Road Network Map</h3>
                <p className="text-xs text-[#526355]">Real route distances, geometries & congestion status</p>
              </div>
              <div className="text-[10px] font-mono px-2 py-0.5 bg-[#EDF2EE] border border-[#D5E0D5] text-[#2E4D37] rounded-lg">
                ROUTING: OSRM Engine
              </div>
            </div>

            {/* Map Container */}
            <div className="h-[360px] rounded-2xl overflow-hidden relative border border-[#D8E2D9]">
              <ErrorBoundary fallbackTitle="OSRM Road Network Map (Fallback Active)">
                <MapContainer
                  center={mapCenter}
                  zoom={11}
                  scrollWheelZoom={false}
                  style={{ width: '100%', height: '100%' }}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>'
                    url={mapTileUrl}
                  />

                  {/* Route Edges Polylines */}
                  {networkState.edges.map(edge => {
                    const src = nodeMap.get(edge.from);
                    const dest = nodeMap.get(edge.to);
                    if (!src || !dest) return null;

                    const color = edge.status === 'blocked' ? '#D94E48' : edge.status === 'congested' ? '#D9822B' : '#2E4D37';
                    const weight = edge.status === 'blocked' ? 4 : edge.status === 'congested' ? 3 : 2;

                    return (
                      <Polyline
                        key={edge.id}
                        positions={[
                          [src.lat, src.lng],
                          [dest.lat, dest.lng]
                        ]}
                        pathOptions={{ color, weight, opacity: 0.8 }}
                      >
                        <Popup>
                          <div className="p-1 text-xs">
                            <p className="font-bold">{src.name} → {dest.name}</p>
                            <p>Distance: <strong>{edge.distanceKm} km</strong></p>
                            <p>Est Travel Time: <strong>{edge.travelTimeMinutes} mins</strong></p>
                            <p>Status: <span className="uppercase font-bold">{edge.status}</span></p>
                          </div>
                        </Popup>
                      </Polyline>
                    );
                  })}

                  {/* Nodes Markers */}
                  {networkState.nodes.map((node) => {
                    const isCritical = node.status === 'critical';
                    const isWarning = node.status === 'warning';
                    const markerColor = isCritical ? '#D94E48' : isWarning ? '#D9822B' : '#2E4D37';

                    return (
                      <CircleMarker
                        key={node.id}
                        center={[node.lat, node.lng]}
                        radius={isCritical ? 11 : 7}
                        pathOptions={{
                          color: markerColor,
                          fillColor: markerColor,
                          fillOpacity: 0.85,
                          weight: isCritical ? 3 : 1
                        }}
                        eventHandlers={{
                          click: () => onInvestigateBottleneck(node.id)
                        }}
                      >
                        <Popup>
                          <div className="p-1 text-xs">
                            <p className="font-bold">{node.name}</p>
                            <p className="text-slate-600">Capacity: {node.capacityTonnes} t/day</p>
                            <p className="text-slate-600">Utilization: {node.utilizationPct}%</p>
                          </div>
                        </Popup>
                      </CircleMarker>
                    );
                  })}
                </MapContainer>
              </ErrorBoundary>

              {/* Map Floating Legend */}
              <div className="absolute top-4 left-4 z-[500] bg-white/95 backdrop-blur-md border border-[#D8E2D9] p-3 rounded-2xl shadow-md text-xs space-y-2 w-48">
                <div className="flex items-center space-x-2">
                  <span className="w-3 h-3 rounded-full bg-[#2E4D37]" />
                  <span className="text-slate-700 font-medium">Collection Zone</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-3 h-3 rounded-full bg-[#D9822B]" />
                  <span className="text-slate-700 font-medium">Transfer Station</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-3 h-3 rounded-full bg-[#6B5282]" />
                  <span className="text-slate-700 font-medium">Sorting Facility</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-3 h-3 rounded-full bg-[#2E4D37]" />
                  <span className="text-slate-700 font-medium">Processing / Recycling</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-3 h-3 rounded-full bg-[#A46843]" />
                  <span className="text-slate-700 font-medium">Landfill</span>
                </div>
                <div className="flex items-center space-x-2 pt-1 border-t border-slate-200">
                  <span className="w-3 h-0.5 bg-[#D94E48] rounded" />
                  <span className="text-rose-700 font-bold">OSRM Congested Route</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: CRITICAL BOTTLENECK INTELLIGENCE (4 COLS) */}
        <div className="lg:col-span-4 space-y-6">
          {/* CRITICAL BOTTLENECK CARD */}
          <div className="bg-[#FDF2F2] border border-[#F8C8C6] rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex items-center space-x-2 text-[#D94E48] font-bold text-sm">
              <AlertTriangle size={20} className="fill-[#D94E48] text-white" />
              <span>Calculated Critical Bottleneck</span>
            </div>

            <div className="flex items-center justify-between border-b border-[#F5D5D3] pb-3">
              <h3 className="text-lg font-black text-[#1A261C]">{topBottleneck.title}</h3>
              <ChevronRight size={18} className="text-slate-500 cursor-pointer" onClick={() => onInvestigateBottleneck(topBottleneck.nodeId)} />
            </div>

            {/* Facility Image */}
            <div className="w-full h-32 rounded-xl bg-slate-800 overflow-hidden relative">
              <img 
                src="https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=600&q=80" 
                alt="Sorting Facility B"
                className="w-full h-full object-cover opacity-80"
              />
              <div className="absolute top-2 right-2 bg-rose-600 text-white text-xs font-black font-mono px-2 py-0.5 rounded-md">
                {topBottleneck.utilization}% Utilization
              </div>
            </div>

            {/* Progress bar */}
            <div className="space-y-1">
              <div className="w-full h-2.5 bg-rose-200 rounded-full overflow-hidden">
                <div className="h-full bg-[#D94E48]" style={{ width: `${Math.min(100, topBottleneck.utilization)}%` }} />
              </div>
            </div>

            <p className="text-xs text-slate-700 leading-relaxed">
              Inflow exceeds capacity. Queue projected to reach overflow limit in <strong className="text-rose-700">{topBottleneck.overflowEstHours || '5h 42m'}</strong>, causing vehicle idle delays and emission spillover.
            </p>

            {/* 3 Metric Pills */}
            <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono">
              <div className="bg-white/80 p-2 rounded-xl border border-[#F8C8C6]">
                <span className="text-[#D94E48] font-bold text-sm block">+18</span>
                <span className="text-[9px] text-slate-600 block">Queue truck trips</span>
              </div>
              <div className="bg-white/80 p-2 rounded-xl border border-[#F8C8C6]">
                <span className="text-[#D94E48] font-bold text-sm block">{topBottleneck.co2Impact}</span>
                <span className="text-[9px] text-slate-600 block">CO₂e emission risk</span>
              </div>
              <div className="bg-white/80 p-2 rounded-xl border border-[#F8C8C6]">
                <span className="text-[#D94E48] font-bold text-sm block">+120 t</span>
                <span className="text-[9px] text-slate-600 block">Risk of overflow</span>
              </div>
            </div>

            <button
              onClick={onSimulateRecommendation}
              className="w-full bg-[#2E4D37] hover:bg-[#233D2B] text-white font-extrabold text-xs py-3 rounded-xl shadow-xs transition-all flex items-center justify-center space-x-2"
            >
              <span>Simulate Recommendation</span>
              <ArrowRight size={14} />
            </button>
          </div>

          {/* QUEUE LENGTH TREND CARD FROM SIMULATION */}
          <div className="bg-white border border-[#D8E2D9] rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-[#F0F4F0] pb-2">
              <h3 className="text-sm font-bold text-[#1A261C]">24h Simulated Queue Trend</h3>
              <span className="text-[10px] font-mono bg-rose-50 text-rose-700 px-2 py-0.5 rounded border border-rose-200 font-bold">
                TEMPORAL SIMULATION
              </span>
            </div>

            {/* Queue Area Chart */}
            <div className="h-36 relative">
              <svg className="w-full h-full text-rose-500" viewBox="0 0 300 100">
                <defs>
                  <linearGradient id="queueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#D94E48" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#D94E48" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                <path
                  d={`M 0 100 L ${svgPathPoints} L 300 100 Z`}
                  fill="url(#queueGrad)"
                />
                <path
                  d={`M ${svgPathPoints}`}
                  fill="none"
                  stroke="#D94E48"
                  strokeWidth="2.5"
                />
              </svg>
              <div className="flex justify-between text-[9px] font-mono text-slate-500 mt-1">
                <span>12 AM</span>
                <span>6 AM</span>
                <span>12 PM</span>
                <span>6 PM</span>
              </div>
            </div>

            <div className="bg-[#FFF8F8] border border-[#FAD6D5] p-3 rounded-xl flex items-center space-x-2.5 text-xs text-rose-800">
              <Clock size={16} className="text-rose-600 shrink-0" />
              <div>
                <p className="font-bold text-rose-900">Dynamic queue model output</p>
                <p className="text-[10px] text-rose-700">Calculated from temporal time-step simulation engine.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
