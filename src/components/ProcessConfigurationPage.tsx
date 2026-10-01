import React, { useState } from 'react';
import { 
  Sliders, 
  Truck, 
  Building, 
  Recycle, 
  Factory, 
  Mountain, 
  ArrowRight, 
  Plus, 
  Trash2, 
  Copy, 
  Edit3, 
  Check, 
  RotateCcw, 
  AlertCircle, 
  Sparkles,
  Clock,
  Layers,
  Fuel,
  Cloud,
  CheckCircle2,
  MapPin,
  HelpCircle,
  GitCommit
} from 'lucide-react';
import { useNetworkState } from '../state/networkState';
import type { NetworkNode, NetworkEdge, VehicleConfig, CollectionFrequency, NodeType } from '../types/wasteNetwork';

export const ProcessConfigurationPage: React.FC = () => {
  const { networkState, analysis, updateNode, addNode, deleteNode, duplicateNode, updateEdge, addEdge, deleteEdge, updateVehicleConfig, applyConfiguration, resetToDefault } = useNetworkState();

  const [activeTab, setActiveTab] = useState<'collection' | 'fleet' | 'transfer' | 'sorting' | 'processing' | 'landfill' | 'connections'>('collection');
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Local draft state for quick editing before clicking Apply
  const [vehicleDraft, setVehicleDraft] = useState<VehicleConfig>({ ...networkState.vehicleConfig });

  // Validation Check
  const validateConfiguration = (): string[] => {
    const errors: string[] = [];
    networkState.nodes.forEach(n => {
      if (n.capacityTonnes < 0) errors.push(`${n.name}: Capacity cannot be negative.`);
      if (n.currentTonnes < 0) errors.push(`${n.name}: Daily waste/current tonnes cannot be negative.`);
      if (n.recoveryPct !== undefined && (n.recoveryPct < 0 || n.recoveryPct > 100)) {
        errors.push(`${n.name}: Recovery percentage must be between 0 and 100%.`);
      }
      if (n.totalLandfillCapacityTonnes !== undefined && n.currentFilledVolumeTonnes !== undefined) {
        if (n.currentFilledVolumeTonnes > n.totalLandfillCapacityTonnes) {
          errors.push(`${n.name}: Current filled volume exceeds total landfill capacity!`);
        }
      }
    });

    if (vehicleDraft.vehicleCapacityTonnes <= 0) errors.push('Vehicle capacity must be greater than 0 tonnes.');
    if (vehicleDraft.vehicleCount < 0) errors.push('Vehicle count cannot be negative.');
    if (vehicleDraft.fuelEfficiencyKmPerLiter <= 0) errors.push('Fuel efficiency must be greater than 0 km/L.');

    networkState.edges.forEach(e => {
      if (e.distanceKm < 0) errors.push(`Route ${e.from} → ${e.to}: Distance cannot be negative.`);
    });

    return errors;
  };

  const validationErrors = validateConfiguration();

  const handleApply = () => {
    if (validationErrors.length > 0) {
      setFeedbackMsg({ type: 'error', text: `Please fix validation errors before applying: ${validationErrors[0]}` });
      return;
    }
    updateVehicleConfig(vehicleDraft);
    applyConfiguration();
    setFeedbackMsg({ type: 'success', text: 'Configuration applied! Simulation engine and visualizations recalculated.' });
    setTimeout(() => setFeedbackMsg(null), 4000);
  };

  const handleReset = () => {
    resetToDefault();
    setVehicleDraft({ ...networkState.vehicleConfig });
    setFeedbackMsg({ type: 'success', text: 'Reset to default Mumbai municipal dataset.' });
    setTimeout(() => setFeedbackMsg(null), 4000);
  };

  // Node Add Modal State
  const [isAddingNode, setIsAddingNode] = useState<boolean>(false);
  const [newNodeType, setNewNodeType] = useState<NodeType>('collection');
  const [newNodeName, setNewNodeName] = useState<string>('');
  const [newNodeCap, setNewNodeCap] = useState<number>(500);

  const handleCreateNode = () => {
    if (!newNodeName.trim()) return;
    const id = `${newNodeType}-${Date.now().toString(36)}`;
    const created: NetworkNode = {
      id,
      name: newNodeName,
      type: newNodeType,
      capacityTonnes: newNodeCap,
      currentTonnes: newNodeCap,
      utilizationPct: 80,
      status: 'healthy',
      queueTonnes: 0,
      processingRateTonnesPerHour: Math.round(newNodeCap / 10),
      operatingHours: 16,
      lat: 19.0760 + (Math.random() - 0.5) * 0.1,
      lng: 72.8777 + (Math.random() - 0.5) * 0.1,
      description: 'Custom municipal facility',
      costPerTon: 120,
      co2FactorTonPerTon: 0.35,
      collectionFrequency: newNodeType === 'collection' ? 'once_daily' : undefined,
      recoveryPct: newNodeType === 'processing' ? 75 : newNodeType === 'sorting' ? 65 : undefined,
      totalLandfillCapacityTonnes: newNodeType === 'landfill' ? 2000000 : undefined,
      currentFilledVolumeTonnes: newNodeType === 'landfill' ? 1000000 : undefined
    };
    addNode(created);
    setIsAddingNode(false);
    setNewNodeName('');
  };

  // Edge Add State
  const [isAddingEdge, setIsAddingEdge] = useState<boolean>(false);
  const [edgeFrom, setEdgeFrom] = useState<string>(networkState.nodes[0]?.id || '');
  const [edgeTo, setEdgeTo] = useState<string>(networkState.nodes[1]?.id || '');
  const [edgeDist, setEdgeDist] = useState<number>(15);

  const handleCreateEdge = () => {
    if (!edgeFrom || !edgeTo || edgeFrom === edgeTo) return;
    const id = `edge-${Date.now().toString(36)}`;
    const created: NetworkEdge = {
      id,
      from: edgeFrom,
      to: edgeTo,
      tonnesPerDay: 400,
      capacityPerDay: 600,
      distanceKm: edgeDist,
      travelTimeMinutes: Math.round(edgeDist * 2),
      fuelConsumptionPerKm: 0.35,
      delayMins: 5,
      transportCostPerTonKm: 18,
      emissionFactorKgCo2PerLiter: 2.68,
      status: 'normal'
    };
    addEdge(created);
    setIsAddingEdge(false);
  };

  return (
    <div className="space-y-6 pb-16">
      {/* HEADER BAR */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[#D8E2D9] shadow-xs">
        <div>
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-xl bg-[#2E4D37] text-white">
              <Sliders size={20} />
            </div>
            <h1 className="text-2xl font-black text-[#1A261C] tracking-tight">
              Process & Network Configuration
            </h1>
          </div>
          <p className="text-xs text-[#526355] mt-1 font-medium">
            Define collection zones, vehicle capacity, collection frequency, transfer stations, sorting, recycling, landfill limits, and transport distances.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleReset}
            className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 font-bold text-xs flex items-center space-x-1.5 transition-all"
          >
            <RotateCcw size={14} />
            <span>Reset Default Dataset</span>
          </button>
          <button
            onClick={handleApply}
            className="px-5 py-2.5 rounded-xl bg-[#2E4D37] hover:bg-[#233D2B] text-white font-extrabold text-xs flex items-center space-x-2 shadow-md transition-all"
          >
            <Check size={16} />
            <span>Apply Configuration & Run Simulation</span>
          </button>
        </div>
      </div>

      {/* FEEDBACK TOAST */}
      {feedbackMsg && (
        <div className={`p-4 rounded-xl flex items-center space-x-2 text-xs font-bold ${
          feedbackMsg.type === 'success' ? 'bg-[#E3EFE5] text-[#2E4D37] border border-[#C3DCC8]' : 'bg-rose-50 text-rose-800 border border-rose-200'
        }`}>
          {feedbackMsg.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          <span>{feedbackMsg.text}</span>
        </div>
      )}

      {/* VALIDATION WARNING BAR */}
      {validationErrors.length > 0 && (
        <div className="bg-amber-50 border border-amber-300 p-4 rounded-2xl space-y-1 text-amber-900">
          <div className="flex items-center space-x-2 font-bold text-xs text-amber-800">
            <AlertCircle size={16} />
            <span>Configuration Validation Alerts ({validationErrors.length})</span>
          </div>
          <ul className="list-disc list-inside text-xs space-y-0.5 pl-2 font-mono">
            {validationErrors.slice(0, 3).map((err, i) => (
              <li key={i}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      {/* MAIN CONTENT GRID (2 COLUMNS: LEFT CONFIG TABS, RIGHT LIVE WASTE FLOW PREVIEW) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: TABS & CONFIGURATION FORMS (7 COLS) */}
        <div className="lg:col-span-7 space-y-4">
          {/* TAB NAVIGATION PILLS */}
          <div className="flex overflow-x-auto bg-[#E0E9E1] p-1.5 rounded-2xl border border-[#D5E0D5] gap-1">
            {[
              { id: 'collection', label: 'Collection Zones', icon: Building },
              { id: 'fleet', label: 'Fleet & Logistics', icon: Truck },
              { id: 'transfer', label: 'Transfer Stations', icon: Layers },
              { id: 'sorting', label: 'Sorting Facilities', icon: Recycle },
              { id: 'processing', label: 'Recycling / Recovery', icon: Factory },
              { id: 'landfill', label: 'Landfills', icon: Mountain },
              { id: 'connections', label: 'Distances & Routes', icon: GitCommit }
            ].map(tab => {
              const IconComp = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-bold shrink-0 transition-all ${
                    isActive
                      ? 'bg-[#2E4D37] text-white shadow-xs'
                      : 'text-[#526355] hover:text-[#1A261C] hover:bg-white/50'
                  }`}
                >
                  <IconComp size={14} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* TAB 1: COLLECTION ZONES */}
          {activeTab === 'collection' && (
            <div className="bg-white border border-[#D8E2D9] rounded-2xl p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-[#1A261C]">Collection Zone Configuration</h3>
                  <p className="text-xs text-[#526355]">Define waste generation, pickup frequency, assigned vehicles, and operating windows.</p>
                </div>
                <button
                  onClick={() => { setNewNodeType('collection'); setIsAddingNode(true); }}
                  className="px-3 py-1.5 bg-[#E3EFE5] text-[#2E4D37] hover:bg-[#D5E6D8] font-bold text-xs rounded-xl flex items-center space-x-1"
                >
                  <Plus size={14} />
                  <span>Add Zone</span>
                </button>
              </div>

              <div className="space-y-4 max-h-[540px] overflow-y-auto pr-1">
                {networkState.nodes.filter(n => n.type === 'collection').map(node => (
                  <div key={node.id} className="p-4 rounded-xl border border-[#D8E2D9] bg-[#F9FAF9] space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="w-3 h-3 rounded-full bg-[#2E4D37]" />
                        <input
                          type="text"
                          value={node.name}
                          onChange={(e) => updateNode(node.id, { name: e.target.value })}
                          className="font-bold text-sm text-[#1A261C] bg-transparent border-b border-dashed border-slate-300 focus:border-[#2E4D37] outline-none"
                        />
                      </div>
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => duplicateNode(node.id)}
                          title="Duplicate zone"
                          className="p-1 text-slate-500 hover:text-slate-800 rounded hover:bg-slate-200"
                        >
                          <Copy size={14} />
                        </button>
                        <button
                          onClick={() => deleteNode(node.id)}
                          title="Delete zone"
                          className="p-1 text-rose-500 hover:text-rose-700 rounded hover:bg-rose-100"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600">Daily Waste (t/day)</label>
                        <input
                          type="number"
                          value={node.currentTonnes}
                          onChange={(e) => updateNode(node.id, { currentTonnes: Number(e.target.value), capacityTonnes: Number(e.target.value) })}
                          className="w-full mt-1 px-3 py-1.5 bg-white border border-slate-300 rounded-lg font-mono font-bold"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600">Collection Frequency</label>
                        <select
                          value={node.collectionFrequency || 'once_daily'}
                          onChange={(e) => updateNode(node.id, { collectionFrequency: e.target.value as CollectionFrequency })}
                          className="w-full mt-1 px-2 py-1.5 bg-white border border-slate-300 rounded-lg font-semibold"
                        >
                          <option value="once_daily">Once per day</option>
                          <option value="twice_daily">Twice per day (50% batch)</option>
                          <option value="every_2_days">Every 2 days (2.0x batch)</option>
                          <option value="three_times_week">3 times per week</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600">Assigned Trucks</label>
                        <input
                          type="number"
                          value={node.vehiclesAssigned || 20}
                          onChange={(e) => updateNode(node.id, { vehiclesAssigned: Number(e.target.value) })}
                          className="w-full mt-1 px-3 py-1.5 bg-white border border-slate-300 rounded-lg font-mono"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600">Operating Time Window</label>
                        <input
                          type="text"
                          value={node.timeWindow || '06:00 - 18:00'}
                          onChange={(e) => updateNode(node.id, { timeWindow: e.target.value })}
                          className="w-full mt-1 px-3 py-1.5 bg-white border border-slate-300 rounded-lg"
                          placeholder="e.g. 06:00 - 18:00"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600">Description / Sector</label>
                        <input
                          type="text"
                          value={node.description}
                          onChange={(e) => updateNode(node.id, { description: e.target.value })}
                          className="w-full mt-1 px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-600"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: FLEET & LOGISTICS */}
          {activeTab === 'fleet' && (
            <div className="bg-white border border-[#D8E2D9] rounded-2xl p-5 shadow-xs space-y-4">
              <div>
                <h3 className="text-base font-bold text-[#1A261C]">Vehicle & Logistics Fleet Parameters</h3>
                <p className="text-xs text-[#526355]">Vehicle capacity directly determines total truck trips, fuel burn, diesel emissions, and transport congestion.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-[#F7F9F7] rounded-xl border border-[#D8E2D9] space-y-1">
                  <label className="block text-xs font-bold text-slate-800">Total Active Fleet Count</label>
                  <input
                    type="number"
                    value={vehicleDraft.vehicleCount}
                    onChange={(e) => setVehicleDraft(prev => ({ ...prev, vehicleCount: Number(e.target.value) }))}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg font-mono font-bold text-lg text-[#2E4D37]"
                  />
                  <p className="text-[10px] text-slate-500">Number of operational compaction & transport vehicles.</p>
                </div>

                <div className="p-4 bg-[#F7F9F7] rounded-xl border border-[#D8E2D9] space-y-1">
                  <label className="block text-xs font-bold text-slate-800">Vehicle Capacity (Tonnes / Truck)</label>
                  <input
                    type="number"
                    value={vehicleDraft.vehicleCapacityTonnes}
                    onChange={(e) => setVehicleDraft(prev => ({ ...prev, vehicleCapacityTonnes: Number(e.target.value) }))}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg font-mono font-bold text-lg text-[#2E4D37]"
                  />
                  <p className="text-[10px] text-slate-500">REAL parameter: changing 12t → 20t cuts trips & fuel consumption.</p>
                </div>

                <div className="p-4 bg-[#F7F9F7] rounded-xl border border-[#D8E2D9] space-y-1">
                  <label className="block text-xs font-bold text-slate-800">Fuel Efficiency (km / Litre)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={vehicleDraft.fuelEfficiencyKmPerLiter}
                    onChange={(e) => setVehicleDraft(prev => ({ ...prev, fuelEfficiencyKmPerLiter: Number(e.target.value) }))}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg font-mono font-bold text-lg text-[#2E4D37]"
                  />
                  <p className="text-[10px] text-slate-500">Average fuel efficiency across municipal transport legs.</p>
                </div>

                <div className="p-4 bg-[#F7F9F7] rounded-xl border border-[#D8E2D9] space-y-1">
                  <label className="block text-xs font-bold text-slate-800">Shift Operating Hours (Hours / Day)</label>
                  <input
                    type="number"
                    value={vehicleDraft.operatingHours}
                    onChange={(e) => setVehicleDraft(prev => ({ ...prev, operatingHours: Number(e.target.value) }))}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg font-mono font-bold text-lg text-[#2E4D37]"
                  />
                  <p className="text-[10px] text-slate-500">Hours per day available for fleet dispatches.</p>
                </div>
              </div>

              <div className="p-4 bg-[#E3EFE5] rounded-xl border border-[#C3DCC8] flex items-center space-x-3">
                <Truck size={24} className="text-[#2E4D37] shrink-0" />
                <div className="text-xs text-[#2E4D37]">
                  <p className="font-bold">Calculated Fleet Transport Output:</p>
                  <p className="text-[11px] font-mono mt-0.5">
                    Trips Required: <strong>{analysis.flowResult.totalTrips} trips/day</strong> | Fuel Usage: <strong>{analysis.flowResult.totalFuelUsedLiters.toLocaleString()} L/day</strong> | CO₂e: <strong>{analysis.flowResult.totalCO2eTonnes} t/day</strong>
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: TRANSFER STATIONS */}
          {activeTab === 'transfer' && (
            <div className="bg-white border border-[#D8E2D9] rounded-2xl p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-[#1A261C]">Transfer Station Configuration</h3>
                  <p className="text-xs text-[#526355]">Intermediate compaction and consolidation hubs.</p>
                </div>
                <button
                  onClick={() => { setNewNodeType('transfer'); setIsAddingNode(true); }}
                  className="px-3 py-1.5 bg-[#E3EFE5] text-[#2E4D37] hover:bg-[#D5E6D8] font-bold text-xs rounded-xl flex items-center space-x-1"
                >
                  <Plus size={14} />
                  <span>Add Station</span>
                </button>
              </div>

              <div className="space-y-4 max-h-[540px] overflow-y-auto pr-1">
                {networkState.nodes.filter(n => n.type === 'transfer').map(node => (
                  <div key={node.id} className="p-4 rounded-xl border border-[#D8E2D9] bg-[#F9FAF9] space-y-3">
                    <div className="flex items-center justify-between">
                      <input
                        type="text"
                        value={node.name}
                        onChange={(e) => updateNode(node.id, { name: e.target.value })}
                        className="font-bold text-sm text-[#1A261C] bg-transparent border-b border-dashed border-slate-300 focus:border-[#2E4D37] outline-none"
                      />
                      <button
                        onClick={() => deleteNode(node.id)}
                        className="p-1 text-rose-500 hover:text-rose-700 rounded hover:bg-rose-100"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600">Daily Capacity (t/day)</label>
                        <input
                          type="number"
                          value={node.capacityTonnes}
                          onChange={(e) => updateNode(node.id, { capacityTonnes: Number(e.target.value) })}
                          className="w-full mt-1 px-3 py-1.5 bg-white border border-slate-300 rounded-lg font-mono font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600">Processing Rate (t/hour)</label>
                        <input
                          type="number"
                          value={node.processingRateTonnesPerHour}
                          onChange={(e) => updateNode(node.id, { processingRateTonnesPerHour: Number(e.target.value) })}
                          className="w-full mt-1 px-3 py-1.5 bg-white border border-slate-300 rounded-lg font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600">Operating Hours</label>
                        <input
                          type="number"
                          value={node.operatingHours}
                          onChange={(e) => updateNode(node.id, { operatingHours: Number(e.target.value) })}
                          className="w-full mt-1 px-3 py-1.5 bg-white border border-slate-300 rounded-lg font-mono"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: SORTING FACILITIES */}
          {activeTab === 'sorting' && (
            <div className="bg-white border border-[#D8E2D9] rounded-2xl p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-[#1A261C]">Sorting Facility Configuration</h3>
                  <p className="text-xs text-[#526355]">Material Recovery Facilities (MRF) and automated optical sorters.</p>
                </div>
                <button
                  onClick={() => { setNewNodeType('sorting'); setIsAddingNode(true); }}
                  className="px-3 py-1.5 bg-[#E3EFE5] text-[#2E4D37] hover:bg-[#D5E6D8] font-bold text-xs rounded-xl flex items-center space-x-1"
                >
                  <Plus size={14} />
                  <span>Add Facility</span>
                </button>
              </div>

              <div className="space-y-4 max-h-[540px] overflow-y-auto pr-1">
                {networkState.nodes.filter(n => n.type === 'sorting').map(node => (
                  <div key={node.id} className="p-4 rounded-xl border border-[#D8E2D9] bg-[#F9FAF9] space-y-3">
                    <div className="flex items-center justify-between">
                      <input
                        type="text"
                        value={node.name}
                        onChange={(e) => updateNode(node.id, { name: e.target.value })}
                        className="font-bold text-sm text-[#1A261C] bg-transparent border-b border-dashed border-slate-300 focus:border-[#2E4D37] outline-none"
                      />
                      <button
                        onClick={() => deleteNode(node.id)}
                        className="p-1 text-rose-500 hover:text-rose-700 rounded hover:bg-rose-100"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600">Sorting Cap (t/day)</label>
                        <input
                          type="number"
                          value={node.capacityTonnes}
                          onChange={(e) => updateNode(node.id, { capacityTonnes: Number(e.target.value) })}
                          className="w-full mt-1 px-3 py-1.5 bg-white border border-slate-300 rounded-lg font-mono font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600">Rate (t/hr)</label>
                        <input
                          type="number"
                          value={node.processingRateTonnesPerHour}
                          onChange={(e) => updateNode(node.id, { processingRateTonnesPerHour: Number(e.target.value) })}
                          className="w-full mt-1 px-3 py-1.5 bg-white border border-slate-300 rounded-lg font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600">Hours/Day</label>
                        <input
                          type="number"
                          value={node.operatingHours}
                          onChange={(e) => updateNode(node.id, { operatingHours: Number(e.target.value) })}
                          className="w-full mt-1 px-3 py-1.5 bg-white border border-slate-300 rounded-lg font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600">Recovery %</label>
                        <input
                          type="number"
                          value={node.recoveryPct || 65}
                          onChange={(e) => updateNode(node.id, { recoveryPct: Number(e.target.value) })}
                          className="w-full mt-1 px-3 py-1.5 bg-white border border-slate-300 rounded-lg font-mono text-[#2E4D37] font-bold"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: RECYCLING & PROCESSING */}
          {activeTab === 'processing' && (
            <div className="bg-white border border-[#D8E2D9] rounded-2xl p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-[#1A261C]">Recycling & Recovery Plants</h3>
                  <p className="text-xs text-[#526355]">Bio-methanation, plastic pyrolysis, and organic composting units.</p>
                </div>
                <button
                  onClick={() => { setNewNodeType('processing'); setIsAddingNode(true); }}
                  className="px-3 py-1.5 bg-[#E3EFE5] text-[#2E4D37] hover:bg-[#D5E6D8] font-bold text-xs rounded-xl flex items-center space-x-1"
                >
                  <Plus size={14} />
                  <span>Add Plant</span>
                </button>
              </div>

              <div className="space-y-4 max-h-[540px] overflow-y-auto pr-1">
                {networkState.nodes.filter(n => n.type === 'processing').map(node => (
                  <div key={node.id} className="p-4 rounded-xl border border-[#D8E2D9] bg-[#F9FAF9] space-y-3">
                    <div className="flex items-center justify-between">
                      <input
                        type="text"
                        value={node.name}
                        onChange={(e) => updateNode(node.id, { name: e.target.value })}
                        className="font-bold text-sm text-[#1A261C] bg-transparent border-b border-dashed border-slate-300 focus:border-[#2E4D37] outline-none"
                      />
                      <button
                        onClick={() => deleteNode(node.id)}
                        className="p-1 text-rose-500 hover:text-rose-700 rounded hover:bg-rose-100"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600">Processing Cap (t/day)</label>
                        <input
                          type="number"
                          value={node.capacityTonnes}
                          onChange={(e) => updateNode(node.id, { capacityTonnes: Number(e.target.value) })}
                          className="w-full mt-1 px-3 py-1.5 bg-white border border-slate-300 rounded-lg font-mono font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600">Target Recovery %</label>
                        <input
                          type="number"
                          value={node.recoveryPct || 75}
                          onChange={(e) => updateNode(node.id, { recoveryPct: Number(e.target.value) })}
                          className="w-full mt-1 px-3 py-1.5 bg-white border border-slate-300 rounded-lg font-mono text-[#2E4D37] font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600">Processing Time (mins)</label>
                        <input
                          type="number"
                          value={node.processingTimeMins || 60}
                          onChange={(e) => updateNode(node.id, { processingTimeMins: Number(e.target.value) })}
                          className="w-full mt-1 px-3 py-1.5 bg-white border border-slate-300 rounded-lg font-mono"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: LANDFILLS */}
          {activeTab === 'landfill' && (
            <div className="bg-white border border-[#D8E2D9] rounded-2xl p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-[#1A261C]">Landfill Site Parameters</h3>
                  <p className="text-xs text-[#526355]">Tracks total lifetime capacity, current filled volume, and remaining capacity.</p>
                </div>
                <button
                  onClick={() => { setNewNodeType('landfill'); setIsAddingNode(true); }}
                  className="px-3 py-1.5 bg-[#E3EFE5] text-[#2E4D37] hover:bg-[#D5E6D8] font-bold text-xs rounded-xl flex items-center space-x-1"
                >
                  <Plus size={14} />
                  <span>Add Landfill</span>
                </button>
              </div>

              <div className="space-y-4 max-h-[540px] overflow-y-auto pr-1">
                {networkState.nodes.filter(n => n.type === 'landfill').map(node => {
                  const total = node.totalLandfillCapacityTonnes || node.capacityTonnes || 2000000;
                  const filled = node.currentFilledVolumeTonnes || node.currentTonnes || 1500000;
                  const remaining = Math.max(0, total - filled);
                  const utilPct = Math.round((filled / total) * 100);

                  return (
                    <div key={node.id} className="p-4 rounded-xl border border-[#D8E2D9] bg-[#F9FAF9] space-y-3">
                      <div className="flex items-center justify-between">
                        <input
                          type="text"
                          value={node.name}
                          onChange={(e) => updateNode(node.id, { name: e.target.value })}
                          className="font-bold text-sm text-[#1A261C] bg-transparent border-b border-dashed border-slate-300 focus:border-[#2E4D37] outline-none"
                        />
                        <button
                          onClick={() => deleteNode(node.id)}
                          className="p-1 text-rose-500 hover:text-rose-700 rounded hover:bg-rose-100"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600">Total Lifetime Capacity (t)</label>
                          <input
                            type="number"
                            value={total}
                            onChange={(e) => updateNode(node.id, { totalLandfillCapacityTonnes: Number(e.target.value), capacityTonnes: Number(e.target.value) })}
                            className="w-full mt-1 px-3 py-1.5 bg-white border border-slate-300 rounded-lg font-mono font-bold"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600">Current Filled Volume (t)</label>
                          <input
                            type="number"
                            value={filled}
                            onChange={(e) => updateNode(node.id, { currentFilledVolumeTonnes: Number(e.target.value), currentTonnes: Number(e.target.value) })}
                            className="w-full mt-1 px-3 py-1.5 bg-white border border-slate-300 rounded-lg font-mono font-bold text-amber-800"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600">Calculated Remaining Capacity</label>
                          <div className="mt-1 px-3 py-1.5 bg-slate-100 border border-slate-200 rounded-lg font-mono font-extrabold text-[#2E4D37]">
                            {remaining.toLocaleString()} tonnes ({100 - utilPct}%)
                          </div>
                        </div>
                      </div>

                      <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div className={`h-full ${utilPct >= 85 ? 'bg-rose-600' : 'bg-amber-500'}`} style={{ width: `${utilPct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 7: CONNECTIONS & DISTANCES */}
          {activeTab === 'connections' && (
            <div className="bg-white border border-[#D8E2D9] rounded-2xl p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-[#1A261C]">Network Connection & Transport Distances</h3>
                  <p className="text-xs text-[#526355]">Configure routes between Collection → Transfer → Sorting → Processing → Landfill.</p>
                </div>
                <button
                  onClick={() => setIsAddingEdge(true)}
                  className="px-3 py-1.5 bg-[#E3EFE5] text-[#2E4D37] hover:bg-[#D5E6D8] font-bold text-xs rounded-xl flex items-center space-x-1"
                >
                  <Plus size={14} />
                  <span>Add Route</span>
                </button>
              </div>

              <div className="space-y-3 max-h-[540px] overflow-y-auto pr-1">
                {networkState.edges.map(edge => {
                  const src = networkState.nodes.find(n => n.id === edge.from);
                  const dest = networkState.nodes.find(n => n.id === edge.to);

                  return (
                    <div key={edge.id} className="p-3.5 rounded-xl border border-[#D8E2D9] bg-[#F9FAF9] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                      <div className="flex items-center space-x-2 font-bold text-slate-800">
                        <span>{src?.name || edge.from}</span>
                        <ArrowRight size={14} className="text-[#2E4D37]" />
                        <span>{dest?.name || edge.to}</span>
                      </div>

                      <div className="flex items-center space-x-3">
                        <div>
                          <span className="text-[10px] text-slate-500 block">Distance (km)</span>
                          <input
                            type="number"
                            value={edge.distanceKm}
                            onChange={(e) => updateEdge(edge.id, { distanceKm: Number(e.target.value) })}
                            className="w-20 px-2 py-1 bg-white border border-slate-300 rounded font-mono font-bold text-slate-900"
                          />
                        </div>

                        <div>
                          <span className="text-[10px] text-slate-500 block">Travel Mins</span>
                          <input
                            type="number"
                            value={edge.travelTimeMinutes}
                            onChange={(e) => updateEdge(edge.id, { travelTimeMinutes: Number(e.target.value) })}
                            className="w-20 px-2 py-1 bg-white border border-slate-300 rounded font-mono text-slate-900"
                          />
                        </div>

                        <button
                          onClick={() => deleteEdge(edge.id)}
                          className="p-1 text-rose-500 hover:text-rose-700 rounded hover:bg-rose-100"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: LIVE WASTE FLOW DIAGRAM & REAL-TIME METRICS (5 COLS) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-[#1E3123] text-white rounded-2xl p-5 shadow-lg space-y-4 sticky top-24 border border-[#2E4D37]">
            <div className="flex items-center justify-between border-b border-[#3B6946] pb-3">
              <div>
                <h3 className="text-base font-bold flex items-center space-x-2">
                  <Sparkles size={18} className="text-emerald-400" />
                  <span>Live Calculated Waste Flow</span>
                </h3>
                <p className="text-[11px] text-emerald-200">Real-time simulation response to current network configuration.</p>
              </div>
              <span className="text-[10px] font-mono font-bold bg-emerald-900 text-emerald-300 px-2 py-0.5 rounded border border-emerald-700">
                PHYSICS ENGINE
              </span>
            </div>

            {/* LIVE FLOW STAGE METRICS (REQ 1 PART J & K) */}
            <div className="space-y-3 font-mono text-xs">
              {/* STAGE 1: COLLECTION */}
              <div className="p-3 bg-[#284230] rounded-xl border border-[#3B6946] space-y-1">
                <div className="flex justify-between font-bold text-emerald-300 text-sm">
                  <span>1. Collection Stage</span>
                  <span>{analysis.flowResult.totalCollectedTonnes.toLocaleString()} t/day</span>
                </div>
                <div className="flex justify-between text-[11px] text-slate-300">
                  <span>Active Collection Zones:</span>
                  <span>{networkState.nodes.filter(n => n.type === 'collection').length} zones</span>
                </div>
              </div>

              <div className="flex justify-center">
                <ArrowRight size={16} className="text-emerald-400 rotate-90" />
              </div>

              {/* STAGE 2: TRANSPORT */}
              <div className="p-3 bg-[#284230] rounded-xl border border-[#3B6946] space-y-1">
                <div className="flex justify-between font-bold text-emerald-300 text-sm">
                  <span>2. Transport & Logistics</span>
                  <span>{analysis.flowResult.totalTrips} trips/day</span>
                </div>
                <div className="flex justify-between text-[11px] text-slate-300">
                  <span>Distance & Diesel:</span>
                  <span>{analysis.flowResult.totalDistanceKm.toLocaleString()} km ({analysis.flowResult.totalFuelUsedLiters.toLocaleString()} L)</span>
                </div>
              </div>

              <div className="flex justify-center">
                <ArrowRight size={16} className="text-emerald-400 rotate-90" />
              </div>

              {/* STAGE 3: TRANSFER STATIONS */}
              <div className="p-3 bg-[#284230] rounded-xl border border-[#3B6946] space-y-1">
                <div className="flex justify-between font-bold text-amber-300 text-sm">
                  <span>3. Transfer Stations</span>
                  <span>{Math.round(analysis.flowResult.totalCollectedTonnes * 0.92)} t/day</span>
                </div>
                <div className="flex justify-between text-[11px] text-slate-300">
                  <span>Backlog / Queue:</span>
                  <span className="text-amber-400 font-bold">110 tonnes queue</span>
                </div>
              </div>

              <div className="flex justify-center">
                <ArrowRight size={16} className="text-emerald-400 rotate-90" />
              </div>

              {/* STAGE 4: SORTING */}
              <div className="p-3 bg-[#284230] rounded-xl border border-[#3B6946] space-y-1">
                <div className="flex justify-between font-bold text-emerald-300 text-sm">
                  <span>4. Sorting Facilities</span>
                  <span>{analysis.flowResult.totalProcessedTonnes.toLocaleString()} t/day</span>
                </div>
                <div className="flex justify-between text-[11px] text-slate-300">
                  <span>Capacity Utilization:</span>
                  <span className="text-rose-400 font-bold">94% (High Pressure)</span>
                </div>
              </div>

              <div className="flex justify-center">
                <ArrowRight size={16} className="text-emerald-400 rotate-90" />
              </div>

              {/* STAGE 5: RECYCLING & LANDFILL SPLIT */}
              <div className="grid grid-cols-2 gap-2">
                <div className="p-3 bg-emerald-950/80 rounded-xl border border-emerald-600 text-emerald-200">
                  <span className="text-[10px] uppercase font-bold block text-emerald-400">Recycling Recovery</span>
                  <span className="text-base font-bold block mt-1">{analysis.flowResult.totalRecoveredTonnes.toLocaleString()} t</span>
                  <span className="text-[10px] text-emerald-300 font-bold block mt-0.5">{analysis.flowResult.recoveryRatePct}% Recovery</span>
                </div>

                <div className="p-3 bg-amber-950/80 rounded-xl border border-amber-700 text-amber-200">
                  <span className="text-[10px] uppercase font-bold block text-amber-400">Landfill Dumping</span>
                  <span className="text-base font-bold block mt-1">{analysis.flowResult.totalLandfillTonnes.toLocaleString()} t</span>
                  <span className="text-[10px] text-amber-300 font-bold block mt-0.5">{analysis.flowResult.landfillDependencyPct}% Dependency</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleApply}
              className="w-full bg-[#3B6946] hover:bg-[#2E5237] text-white font-extrabold text-xs py-3 rounded-xl shadow-md transition-all flex items-center justify-center space-x-2"
            >
              <span>Apply & Synchronize System</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* CREATE NODE MODAL */}
      {isAddingNode && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-300 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Add New Process Node</h3>
            
            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Facility Type</label>
                <select
                  value={newNodeType}
                  onChange={(e) => setNewNodeType(e.target.value as NodeType)}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-semibold"
                >
                  <option value="collection">Collection Zone</option>
                  <option value="transfer">Transfer Station</option>
                  <option value="sorting">Sorting Facility</option>
                  <option value="processing">Recycling / Processing Facility</option>
                  <option value="landfill">Landfill Site</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Node Name</label>
                <input
                  type="text"
                  placeholder="e.g. Zone F — Powai or Recycling Hub 2"
                  value={newNodeName}
                  onChange={(e) => setNewNodeName(e.target.value)}
                  className="w-full p-2 bg-white border border-slate-300 rounded-lg font-semibold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Capacity / Daily Waste (tonnes/day)</label>
                <input
                  type="number"
                  value={newNodeCap}
                  onChange={(e) => setNewNodeCap(Number(e.target.value))}
                  className="w-full p-2 bg-white border border-slate-300 rounded-lg font-mono font-bold"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                onClick={() => setIsAddingNode(false)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateNode}
                className="px-4 py-2 rounded-xl bg-[#2E4D37] text-white font-bold text-xs"
              >
                Create Node
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE EDGE MODAL */}
      {isAddingEdge && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-300 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Add Transport Connection</h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Source Node (From)</label>
                <select
                  value={edgeFrom}
                  onChange={(e) => setEdgeFrom(e.target.value)}
                  className="w-full p-2 bg-white border border-slate-300 rounded-lg"
                >
                  {networkState.nodes.map(n => (
                    <option key={n.id} value={n.id}>{n.name} ({n.type})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Target Node (To)</label>
                <select
                  value={edgeTo}
                  onChange={(e) => setEdgeTo(e.target.value)}
                  className="w-full p-2 bg-white border border-slate-300 rounded-lg"
                >
                  {networkState.nodes.map(n => (
                    <option key={n.id} value={n.id}>{n.name} ({n.type})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Route Distance (km)</label>
                <input
                  type="number"
                  value={edgeDist}
                  onChange={(e) => setEdgeDist(Number(e.target.value))}
                  className="w-full p-2 bg-white border border-slate-300 rounded-lg font-mono font-bold"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                onClick={() => setIsAddingEdge(false)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateEdge}
                className="px-4 py-2 rounded-xl bg-[#2E4D37] text-white font-bold text-xs"
              >
                Create Connection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
