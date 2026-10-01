import React, { useState, useMemo } from 'react';
import { Sliders, Play, CheckCircle2, RotateCcw, Zap, RefreshCw, ArrowRight, Leaf, Truck, Mountain, Recycle, Cloud } from 'lucide-react';
import { useNetworkState } from '../state/networkState';
import { runCompleteAnalysis } from '../engine/simulation';

interface WhatIfLabProps {
  onApplyOptimization: () => void;
}

export const WhatIfLab: React.FC<WhatIfLabProps> = ({ onApplyOptimization }) => {
  const { networkState, updateLever, resetLevers, analysis } = useNetworkState();
  const { levers } = networkState;

  const [isSimulating, setIsSimulating] = useState<boolean>(false);

  // Compute true baseline analysis (levers set to default baseline 0 / neutral)
  const baselineAnalysis = useMemo(() => {
    return runCompleteAnalysis({
      ...networkState,
      levers: {
        sortingCapDelta: 0,
        vehiclesDelta: 0,
        targetRecoveryPct: 65,
        operatingHours: 16,
        routeStrategy: 'Standard Direct Routing'
      }
    });
  }, [networkState.nodes, networkState.edges, networkState.vehicleConfig]);

  const handleRunSimulation = () => {
    setIsSimulating(true);
    setTimeout(() => {
      setIsSimulating(false);
    }, 500);
  };

  // Baseline Metrics from simulation engine
  const baselineProcessed = baselineAnalysis.flowResult.totalProcessedTonnes;
  const baselineRecoveryPct = Math.min(100, Math.max(0, baselineAnalysis.flowResult.recoveryRatePct));
  const baselineLandfill = baselineAnalysis.flowResult.totalLandfillTonnes;
  const baselineCO2 = baselineAnalysis.flowResult.totalCO2eTonnes;
  const baselineTrips = baselineAnalysis.flowResult.totalTrips;

  // Simulated Metrics from current lever settings in simulation engine
  const flowResult = analysis.flowResult;
  const processedTonnesAfter = flowResult.totalProcessedTonnes;
  const recoveryPctAfter = Math.min(100, Math.max(0, flowResult.recoveryRatePct));
  const landfillTonnesAfter = flowResult.totalLandfillTonnes;
  const co2After = flowResult.totalCO2eTonnes;
  const tripsAfter = flowResult.totalTrips;

  // Dynamic Comparison Deltas (Calculated directly from Baseline vs. Simulated)
  const deltaCO2SavedMonthly = Math.round((baselineCO2 - co2After) * 30);
  const deltaLandfillAvoided = baselineLandfill - landfillTonnesAfter;
  const deltaTripsCut = baselineTrips - tripsAfter;

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#D8E2D9] pb-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#1A261C]">
            WHAT IF WE CHANGED THE SYSTEM?
          </h1>
          <p className="text-xs text-[#526355] mt-0.5 font-medium">
            Test multi-variable system tweaks and forecast real-time mass balance outcomes
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={resetLevers}
            className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 font-bold text-xs flex items-center space-x-1.5 transition-all"
          >
            <RotateCcw size={14} />
            <span>Reset Levers</span>
          </button>
          <button
            onClick={handleRunSimulation}
            className="bg-[#2E4D37] hover:bg-[#233D2B] text-white font-extrabold text-xs px-5 py-2.5 rounded-xl shadow-xs transition-all flex items-center space-x-2"
          >
            <Play size={15} className="fill-white" />
            <span>RE-RUN SIMULATION</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT SIDE: CONTROLS (5 COLS) */}
        <div className="lg:col-span-5 bg-white border border-[#D8E2D9] rounded-2xl p-5 shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-[#F0F4F0] pb-3">
            <div className="flex items-center space-x-2">
              <Sliders size={16} className="text-[#2E4D37]" />
              <span className="text-xs font-bold text-[#1A261C] uppercase tracking-wider">
                NETWORK PARAMETER LEVERS
              </span>
            </div>
            <span className="text-[10px] font-mono text-[#2E4D37] bg-[#E3EFE5] px-2 py-0.5 rounded font-bold">
              LIVE DIGITAL TWIN
            </span>
          </div>

          <div className="space-y-4 text-xs font-mono">
            {/* Sorting Capacity Stepper */}
            <div className="bg-[#F7F9F7] p-3.5 rounded-xl border border-[#D8E2D9] space-y-2">
              <div className="flex justify-between items-center text-slate-800">
                <span className="font-sans font-medium">Sorting Capacity Shift (t/day)</span>
                <span className="font-bold text-[#2E4D37] font-mono-num">{levers.sortingCapDelta >= 0 ? `+${levers.sortingCapDelta}` : levers.sortingCapDelta} t</span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => updateLever('sortingCapDelta', Math.max(-100, levers.sortingCapDelta - 25))}
                  className="w-8 h-8 bg-white border border-slate-300 hover:bg-slate-100 text-slate-900 rounded-lg font-bold flex items-center justify-center text-sm"
                >
                  -
                </button>
                <input
                  type="range"
                  min="-100"
                  max="300"
                  step="25"
                  value={levers.sortingCapDelta}
                  onChange={(e) => updateLever('sortingCapDelta', Number(e.target.value))}
                  className="flex-grow h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#2E4D37]"
                />
                <button
                  onClick={() => updateLever('sortingCapDelta', Math.min(300, levers.sortingCapDelta + 25))}
                  className="w-8 h-8 bg-white border border-slate-300 hover:bg-slate-100 text-slate-900 rounded-lg font-bold flex items-center justify-center text-sm"
                >
                  +
                </button>
              </div>
            </div>

            {/* Vehicle Count Stepper */}
            <div className="bg-[#F7F9F7] p-3.5 rounded-xl border border-[#D8E2D9] space-y-2">
              <div className="flex justify-between items-center text-slate-800">
                <span className="font-sans font-medium">Active Truck Fleet Delta</span>
                <span className="font-bold text-[#3A7CA5] font-mono-num">{levers.vehiclesDelta > 0 ? `+${levers.vehiclesDelta}` : levers.vehiclesDelta} Trucks</span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => updateLever('vehiclesDelta', Math.max(-50, levers.vehiclesDelta - 5))}
                  className="w-8 h-8 bg-white border border-slate-300 hover:bg-slate-100 text-slate-900 rounded-lg font-bold flex items-center justify-center text-sm"
                >
                  -
                </button>
                <input
                  type="range"
                  min="-50"
                  max="50"
                  step="5"
                  value={levers.vehiclesDelta}
                  onChange={(e) => updateLever('vehiclesDelta', Number(e.target.value))}
                  className="flex-grow h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#3A7CA5]"
                />
                <button
                  onClick={() => updateLever('vehiclesDelta', Math.min(50, levers.vehiclesDelta + 5))}
                  className="w-8 h-8 bg-white border border-slate-300 hover:bg-slate-100 text-slate-900 rounded-lg font-bold flex items-center justify-center text-sm"
                >
                  +
                </button>
              </div>
            </div>

            {/* Target Recovery Rate */}
            <div className="bg-[#F7F9F7] p-3.5 rounded-xl border border-[#D8E2D9] space-y-2">
              <div className="flex justify-between items-center text-slate-800">
                <span className="font-sans font-medium">Target Resource Recovery Rate</span>
                <span className="font-bold text-[#2E4D37] font-mono-num">{levers.targetRecoveryPct}%</span>
              </div>
              <input
                type="range"
                min="40"
                max="95"
                step="1"
                value={levers.targetRecoveryPct}
                onChange={(e) => updateLever('targetRecoveryPct', Math.min(100, Math.max(0, Number(e.target.value))))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#2E4D37]"
              />
            </div>

            {/* Operating Hours */}
            <div className="bg-[#F7F9F7] p-3.5 rounded-xl border border-[#D8E2D9] space-y-2">
              <div className="flex justify-between items-center text-slate-800">
                <span className="font-sans font-medium">Facility Operating Window</span>
                <span className="font-bold text-purple-900 font-mono-num">{levers.operatingHours} Hours / Day</span>
              </div>
              <input
                type="range"
                min="12"
                max="24"
                step="1"
                value={levers.operatingHours}
                onChange={(e) => updateLever('operatingHours', Number(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-purple-700"
              />
            </div>

            {/* Route Strategy Dropdown */}
            <div className="bg-[#F7F9F7] p-3.5 rounded-xl border border-[#D8E2D9] space-y-1.5">
              <span className="text-slate-800 font-sans font-medium block">Routing Optimization Strategy</span>
              <select
                value={levers.routeStrategy}
                onChange={(e) => updateLever('routeStrategy', e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-900 text-xs focus:outline-none focus:border-[#2E4D37] font-semibold"
              >
                <option value="Dynamic Freeway Rerouting">Dynamic Eastern Freeway Rerouting</option>
                <option value="Staggered Peak Hours">Staggered Monsoon Shift Times</option>
                <option value="Direct Express Corridor">Direct Express Transfer Link</option>
              </select>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE: LIVE RESULTS (7 COLS) */}
        <div className="lg:col-span-7 bg-white border border-[#D8E2D9] rounded-2xl p-6 shadow-xs flex flex-col justify-between space-y-6">
          <div>
            <div className="flex items-center justify-between border-b border-[#F0F4F0] pb-3">
              <div className="flex items-center space-x-2">
                <Zap size={18} className="text-[#2E4D37]" />
                <span className="text-xs font-bold text-[#1A261C] uppercase tracking-wider">
                  LIVE SIMULATION RESULT FORECAST
                </span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded font-bold bg-[#E3EFE5] text-[#2E4D37] border border-[#C3DCC8]">
                {isSimulating ? 'SIMULATING...' : 'RESULT READY'}
              </span>
            </div>

            {isSimulating ? (
              <div className="py-20 flex flex-col items-center justify-center space-y-4">
                <RefreshCw size={36} className="text-[#2E4D37] animate-spin" />
                <p className="text-xs font-mono text-slate-600 tracking-wider">
                  RECALCULATING DIGITAL TWIN SIMULATION ENGINE...
                </p>
              </div>
            ) : (
              <div className="mt-4 space-y-6">
                {/* BEFORE VS AFTER TABLE */}
                <div className="bg-[#F7F9F7] border border-[#D8E2D9] rounded-xl p-4 space-y-3 font-mono text-xs">
                  <div className="grid grid-cols-3 text-slate-500 text-[10px] uppercase border-b border-slate-300 pb-2 font-bold">
                    <span>Metric</span>
                    <span className="text-center">Baseline</span>
                    <span className="text-right text-[#2E4D37]">Simulated After</span>
                  </div>

                  <div className="grid grid-cols-3 items-center text-slate-800">
                    <span className="font-sans font-medium">Waste Processed</span>
                    <span className="text-center text-slate-500 font-mono-num">{baselineProcessed.toLocaleString()} t</span>
                    <span className="text-right text-[#2E4D37] font-bold text-sm font-mono-num">{processedTonnesAfter.toLocaleString()} t</span>
                  </div>

                  <div className="grid grid-cols-3 items-center text-slate-800">
                    <span className="font-sans font-medium">Recovery Rate</span>
                    <span className="text-center text-slate-500 font-mono-num">{baselineRecoveryPct}%</span>
                    <span className="text-right text-[#2E4D37] font-bold text-sm font-mono-num">{recoveryPctAfter}%</span>
                  </div>

                  <div className="grid grid-cols-3 items-center text-slate-800">
                    <span className="font-sans font-medium">Landfill Tonnes</span>
                    <span className="text-center text-slate-500 font-mono-num">{baselineLandfill.toLocaleString()} t</span>
                    <span className="text-right text-[#3A7CA5] font-bold text-sm font-mono-num">{landfillTonnesAfter.toLocaleString()} t</span>
                  </div>

                  <div className="grid grid-cols-3 items-center text-slate-800">
                    <span className="font-sans font-medium">CO₂e Emissions</span>
                    <span className="text-center text-slate-500 font-mono-num">{baselineCO2.toLocaleString()} t</span>
                    <span className="text-right text-[#2E4D37] font-bold text-sm font-mono-num">{co2After.toLocaleString()} t</span>
                  </div>

                  <div className="grid grid-cols-3 items-center text-slate-800">
                    <span className="font-sans font-medium">Truck Trips / Day</span>
                    <span className="text-center text-slate-500 font-mono-num">{baselineTrips}</span>
                    <span className="text-right text-[#D9822B] font-bold text-sm font-mono-num">{tripsAfter}</span>
                  </div>
                </div>

                {/* HIGHLIGHT COMPARISON DELTA CARDS (RECALCULATED FROM BASELINE VS SIMULATED) */}
                <div className="grid grid-cols-3 gap-3 text-center font-mono">
                  <div className={`p-3.5 rounded-xl border ${
                    deltaCO2SavedMonthly >= 0 
                      ? 'bg-[#E3EFE5] border-[#C3DCC8] text-[#2E4D37]' 
                      : 'bg-[#FDF2F2] border-[#F8C8C6] text-rose-800'
                  }`}>
                    <span className="text-xl font-black font-mono-num block">
                      {deltaCO2SavedMonthly >= 0 ? `-${deltaCO2SavedMonthly.toLocaleString()} t` : `+${Math.abs(deltaCO2SavedMonthly).toLocaleString()} t`}
                    </span>
                    <span className="text-[10px] text-slate-700 uppercase font-sans font-medium block mt-1">
                      {deltaCO2SavedMonthly >= 0 ? 'CO₂e Saved / Month' : 'CO₂e Increase / Month'}
                    </span>
                  </div>

                  <div className={`p-3.5 rounded-xl border ${
                    deltaLandfillAvoided >= 0 
                      ? 'bg-[#EBF3F8] border-[#C4DCED] text-[#3A7CA5]' 
                      : 'bg-amber-50 border-amber-200 text-amber-900'
                  }`}>
                    <span className="text-xl font-black font-mono-num block">
                      {deltaLandfillAvoided >= 0 ? `-${deltaLandfillAvoided.toLocaleString()} t` : `+${Math.abs(deltaLandfillAvoided).toLocaleString()} t`}
                    </span>
                    <span className="text-[10px] text-slate-700 uppercase font-sans font-medium block mt-1">
                      {deltaLandfillAvoided >= 0 ? 'Landfill Avoided / Day' : 'Extra Landfill / Day'}
                    </span>
                  </div>

                  <div className={`p-3.5 rounded-xl border ${
                    deltaTripsCut >= 0 
                      ? 'bg-[#FAF2E6] border-[#F2D6B3] text-[#D9822B]' 
                      : 'bg-slate-100 border-slate-300 text-slate-800'
                  }`}>
                    <span className="text-xl font-black font-mono-num block">
                      {deltaTripsCut >= 0 ? `-${deltaTripsCut}` : `+${Math.abs(deltaTripsCut)}`}
                    </span>
                    <span className="text-[10px] text-slate-700 uppercase font-sans font-medium block mt-1">
                      {deltaTripsCut >= 0 ? 'Truck Trips Cut' : 'Extra Trips Added'}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={onApplyOptimization}
            className="w-full bg-[#2E4D37] hover:bg-[#233D2B] text-white font-extrabold text-xs py-3 rounded-xl shadow-xs transition-all flex items-center justify-center space-x-2"
          >
            <CheckCircle2 size={16} />
            <span>APPLY TO OPTIMIZATION ENGINE</span>
          </button>
        </div>
      </div>
    </div>
  );
};
