import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  GitFork, 
  Layers, 
  Clock, 
  Activity, 
  Truck
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, CircleMarker } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { INITIAL_NODES } from '../data/wasteData';
import { ErrorBoundary } from './ErrorBoundary';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

interface DigitalTwinPageProps {
  onNodeSelect: (nodeId: string) => void;
}

export const DigitalTwinPage: React.FC<DigitalTwinPageProps> = ({ onNodeSelect }) => {
  const [viewMode, setViewMode] = useState<'MAP' | 'NETWORK' | 'SANKEY'>('MAP');
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [simSpeed, setSimSpeed] = useState<number>(1);
  const [timeMinutes, setTimeMinutes] = useState<number>(582);

  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setTimeMinutes(prev => (prev + 1 * simSpeed) % (24 * 60));
    }, 1000 / simSpeed);
    return () => clearInterval(interval);
  }, [isPlaying, simSpeed]);

  const formatSimTime = (totalMins: number) => {
    const hours = Math.floor(totalMins / 60);
    const mins = Math.floor(totalMins % 60);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 === 0 ? 12 : hours % 12;
    return `${displayHours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')} ${period}`;
  };

  const mapCenter: [number, number] = [19.0760, 72.8777];

  const animatedTrucks = [
    { id: 't1', name: 'Truck MH-03-AX-8910', route: 'Zone B → TS-2 Kurla', lat: 19.065 + Math.sin(timeMinutes / 10) * 0.02, lng: 72.855 + Math.cos(timeMinutes / 10) * 0.02 },
    { id: 't2', name: 'Truck MH-04-CY-1102', route: 'Zone D → Sorting B', lat: 19.145 + Math.cos(timeMinutes / 15) * 0.03, lng: 72.935 + Math.sin(timeMinutes / 15) * 0.02 },
    { id: 't3', name: 'Truck MH-02-EE-4491', route: 'TS-1 → Sorting A', lat: 19.038 + Math.sin(timeMinutes / 8) * 0.01, lng: 72.845 + Math.sin(timeMinutes / 8) * 0.01 }
  ];

  return (
    <div className="space-y-4 pb-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#D8E2D9] pb-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#1A261C]">
            Digital Twin
          </h1>
          <p className="text-xs text-[#526355] mt-0.5 font-medium">
            Live operational replica of the city waste network
          </p>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center space-x-1 bg-[#E0E9E1] p-1 rounded-xl border border-[#D5E0D5]">
          {(['MAP', 'NETWORK', 'SANKEY'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === mode ? 'bg-[#2E4D37] text-white shadow-xs' : 'text-[#526355] hover:text-[#1A261C]'
              }`}
            >
              {mode} VIEW
            </button>
          ))}
        </div>
      </div>

      {/* CENTER VISUALIZATION AREA */}
      <div className="bg-white border border-[#D8E2D9] rounded-2xl p-2 relative h-[560px] overflow-hidden shadow-xs flex flex-col justify-between">
        {/* Top Control Overlay */}
        <div className="absolute top-4 left-4 right-4 z-[500] flex flex-wrap items-center justify-between gap-3 pointer-events-none">
          <div className="bg-white/90 backdrop-blur-md border border-[#D8E2D9] px-4 py-2 rounded-xl pointer-events-auto flex items-center space-x-3 text-xs font-semibold text-[#1A261C] shadow-xs">
            <span className="flex items-center text-[#2E4D37]">
              <span className="w-2 h-2 rounded-full bg-[#2E4D37] mr-1.5 animate-ping" />
              TWIN SYNCED
            </span>
            <span className="text-slate-300">|</span>
            <span>182 VEHICLES</span>
            <span className="text-slate-300">|</span>
            <span className="text-rose-600 font-bold">1 BOTTLENECK</span>
          </div>

          <div className="bg-white/90 backdrop-blur-md border border-[#D8E2D9] px-3 py-1.5 rounded-xl pointer-events-auto flex items-center space-x-2 shadow-xs">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-1.5 bg-[#F0F4F0] hover:bg-slate-200 rounded-lg text-[#2E4D37] transition-colors"
            >
              {isPlaying ? <Pause size={16} /> : <Play size={16} />}
            </button>
            <button
              onClick={() => setTimeMinutes(582)}
              className="p-1.5 bg-[#F0F4F0] hover:bg-slate-200 rounded-lg text-slate-700 transition-colors"
            >
              <RotateCcw size={16} />
            </button>

            <span className="text-slate-300">|</span>

            {[1, 5, 20].map((spd) => (
              <button
                key={spd}
                onClick={() => setSimSpeed(spd)}
                className={`px-2 py-1 rounded text-xs font-mono font-bold ${
                  simSpeed === spd ? 'bg-[#2E4D37] text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {spd}x
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic Display based on viewMode */}
        {viewMode === 'MAP' && (
          <div className="w-full h-full rounded-xl overflow-hidden">
            <ErrorBoundary fallbackTitle="Digital Twin Map View">
              <MapContainer
                center={mapCenter}
                zoom={11}
                scrollWheelZoom={true}
                style={{ width: '100%', height: '100%' }}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url={import.meta.env.VITE_MAP_TILE_URL || "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"}
                />

                {INITIAL_NODES.map((node) => {
                  const isCritical = node.status === 'critical';
                  const isWarning = node.status === 'warning';
                  const markerColor = isCritical ? '#D94E48' : isWarning ? '#D9822B' : '#2E4D37';

                  return (
                    <CircleMarker
                      key={node.id}
                      center={[node.lat, node.lng]}
                      radius={isCritical ? 12 : 8}
                      pathOptions={{
                        color: markerColor,
                        fillColor: markerColor,
                        fillOpacity: 0.85,
                        weight: isCritical ? 3 : 1
                      }}
                      eventHandlers={{
                        click: () => onNodeSelect(node.id)
                      }}
                    >
                      <Popup>
                        <div className="p-1 text-xs">
                          <p className="font-bold text-[#1A261C]">{node.name}</p>
                          <p className="text-slate-600">Utilization: {node.utilizationPct}%</p>
                        </div>
                      </Popup>
                    </CircleMarker>
                  );
                })}

                {animatedTrucks.map((truck) => (
                  <Marker key={truck.id} position={[truck.lat, truck.lng]}>
                    <Popup>
                      <div className="p-1 text-xs font-sans">
                        <p className="font-bold">{truck.name}</p>
                        <p className="text-slate-600">{truck.route}</p>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            </ErrorBoundary>
          </div>
        )}

        {viewMode === 'NETWORK' && (
          <div className="w-full h-full flex items-center justify-center bg-[#F7F9F7] rounded-xl p-6 relative overflow-hidden border border-[#D8E2D9]">
            <div className="grid grid-cols-4 gap-6 w-full max-w-4xl text-center">
              {['COLLECTION', 'TRANSFER', 'SORTING', 'PROCESSING / LANDFILL'].map((stage, i) => (
                <div key={i} className="space-y-3">
                  <h3 className="text-xs font-bold text-[#2E4D37] uppercase tracking-wider border-b border-[#D8E2D9] pb-2">
                    {stage}
                  </h3>
                  <div className="space-y-2">
                    {INITIAL_NODES.filter((_, idx) => idx % 4 === i).map((node) => (
                      <div
                        key={node.id}
                        onClick={() => onNodeSelect(node.id)}
                        className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                          node.status === 'critical'
                            ? 'bg-rose-50 border-rose-300 text-rose-900'
                            : 'bg-white border-[#D8E2D9] hover:border-[#2E4D37]'
                        }`}
                      >
                        <p className="text-xs font-bold truncate">{node.name}</p>
                        <p className="text-[10px] text-slate-500 mt-0.5">Cap: {node.capacityTonnes}t</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {viewMode === 'SANKEY' && (
          <div className="w-full h-full bg-[#F7F9F7] rounded-xl p-6 flex flex-col justify-center items-center text-center border border-[#D8E2D9]">
            <Activity size={48} className="text-[#2E4D37] animate-pulse mb-3" />
            <h3 className="text-base font-bold text-[#1A261C]">SANKEY STREAM MATRIX</h3>
            <p className="text-xs text-[#526355] max-w-md mt-1 font-medium">
              Real-time mass balance stream: 4,820 t collected → 3,970 t processed → 1,284 t CO₂e mitigated.
            </p>
          </div>
        )}

        {/* BOTTOM TIMELINE SCRUBBER */}
        <div className="absolute bottom-4 left-4 right-4 z-[500] bg-white/95 backdrop-blur-md border border-[#D8E2D9] rounded-xl p-3 flex items-center space-x-4 shadow-md">
          <div className="flex items-center space-x-2 text-[#2E4D37] font-bold text-sm min-w-[100px]">
            <Clock size={16} />
            <span>{formatSimTime(timeMinutes)}</span>
          </div>

          <div className="flex-grow space-y-1">
            <input
              type="range"
              min={0}
              max={1440}
              value={timeMinutes}
              onChange={(e) => setTimeMinutes(Number(e.target.value))}
              className="w-full h-1.5 bg-[#E0E9E1] rounded-lg appearance-none cursor-pointer accent-[#2E4D37]"
            />
            <div className="flex justify-between text-[9px] font-mono text-slate-500">
              <span>00:00 AM (Night)</span>
              <span>08:00 AM (Peak Influx)</span>
              <span className="text-rose-600 font-bold">02:00 PM (Bottleneck Peak)</span>
              <span>08:00 PM (Shift End)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
