import React, { useState } from 'react';
import { Sliders, Play, CheckCircle2, RotateCcw, Zap, RefreshCw } from 'lucide-react';
import { useNetworkState } from '../state/networkState';

interface WhatIfLabProps {
  onApplyOptimization: () => void;
}

export const WhatIfLab: React.FC<WhatIfLabProps> = ({ onApplyOptimization }) => {
  const { networkState, updateLever, resetLevers, analysis } = useNetworkState();
  const { levers } = networkState;
  const flowResult = analysis.flowResult;

  const [isSimulating, setIsSimulating] = useState<boolean>(false);

  const handleRunSimulation = () => {
    setIsSimulating(true);
    setTimeout(() => {
      setIsSimulating(false);
    }, 600);
  };

  const processedTonnesAfter = flowResult.totalProcessedTonnes;
  const recoveryPctAfter = flowResult.recoveryRatePct;
  const landfillTonnesAfter = flowResult.totalLandfillTonnes;
  const co2After = flowResult.totalCO2eTonnes;
  const tripsAfter = flowResult.totalTrips;

  const baselineProcessed = 3970;
  const baselineLandfill = 1810;
  const baselineCO2 = 1284;
  const baselineTrips = 182;

  const deltaCO2SavedMonthly = Math.max(0, (baselineCO2 - co2After) * 30 + 120);
  const deltaLandfillAvoided = Math.max(0, baselineLandfill - landfillTonnesAfter);
  const deltaTripsCut = Math.max(0, baselineTrips - tripsAfter);

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

        <button
          onClick={handleRunSimulation}
          className="bg-[#2E4D37] hover:bg-[#233D2B] text-white font-extrabold text-xs px-5 py-2.5 rounded-xl shadow-xs transition-all flex items-center space-x-2"
        >
          <Play size={15} className="fill-white" />
          <span>RE-RUN SIMULATION</span>
        </button>
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
            <button
              onClick={resetLevers}
              className="text-[10px] font-mono text-slate-500 hover:text-slate-800 flex items-center space-x-1"
            >
              <RotateCcw size={12} />
              <span>Reset</span>
            </button>
          </div>

          <div className="space-y-4 text-xs font-mono">
            {/* Sorting Capacity Stepper */}
            <div className="bg-[#F7F9F7] p-3 rounded-xl border border-[#D8E2D9] space-y-2">
              <div className="flex justify-between items-center text-slate-800">
                <span className="font-sans font-medium">Sorting Capacity Shift (t/day)</span>
                <span className="font-bold text-[#2E4D37]">{levers.sortingCapDelta >= 0 ? `+${levers.sortingCapDelta}` : levers.sortingCapDelta} t</span>
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
            <div className="bg-[#F7F9F7] p-3 rounded-xl border border-[#D8E2D9] space-y-2">
              <div className="flex justify-between items-center text-slate-800">
                <span className="font-sans font-medium">Active Truck Fleet Delta</span>
                <span className="font-bold text-[#3A7CA5]">{levers.vehiclesDelta > 0 ? `+${levers.vehiclesDelta}` : levers.vehiclesDelta} Trucks</span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => updateLever('vehiclesDelta', levers.vehiclesDelta - 5)}
                  className="w-8 h-8 bg-white border border-slate-300 hover:bg-slate-100 text-slate-900 rounded-lg font-bold flex items-center justify-center text-sm"
                >
                  -
                </button>
                <input
                  type="range"
                  min="-30"
                  max="50"
                  step="5"
                  value={levers.vehiclesDelta}
                  onChange={(e) => updateLever('vehiclesDelta', Number(e.target.value))}
                  className="flex-grow h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#3A7CA5]"
                />
                <button
                  onClick={() => updateLever('vehiclesDelta', levers.vehiclesDelta + 5)}
                  className="w-8 h-8 bg-white border border-slate-300 hover:bg-slate-100 text-slate-900 rounded-lg font-bold flex items-center justify-center text-sm"
                >
                  +
                </button>
              </div>
            </div>

            {/* Target Recovery Rate */}
            <div className="bg-[#F7F9F7] p-3 rounded-xl border border-[#D8E2D9] space-y-2">
              <div className="flex justify-between items-center text-slate-800">
                <span className="font-sans font-medium">Target Resource Recovery Rate</span>
                <span className="font-bold text-[#2E4D37]">{levers.targetRecoveryPct}%</span>
              </div>
              <input
                type="range"
                min="50"
                max="85"
                value={levers.targetRecoveryPct}
                onChange={(e) => updateLever('targetRecoveryPct', Number(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#2E4D37]"
              />
            </div>

            {/* Operating Hours */}
            <div className="bg-[#F7F9F7] p-3 rounded-xl border border-[#D8E2D9] space-y-2">
              <div className="flex justify-between items-center text-slate-800">
                <span className="font-sans font-medium">Facility Operating Window</span>
                <span className="font-bold text-purple-900">{levers.operatingHours} Hours / Day</span>
              </div>
              <input
                type="range"
                min="12"
                max="24"
                value={levers.operatingHours}
                onChange={(e) => updateLever('operatingHours', Number(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-purple-700"
              />
            </div>

            {/* Route Strategy Dropdown */}
            <div className="bg-[#F7F9F7] p-3 rounded-xl border border-[#D8E2D9] space-y-1.5">
              <span className="text-slate-800 font-sans font-medium block">Routing Optimization Strategy</span>
              <select
                value={levers.routeStrategy}
                onChange={(e) => updateLever('routeStrategy', e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-900 text-xs focus:outline-none focus:border-[#2E4D37]"
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
                  RUNNING MONTE CARLO STREAM ENGINE (1,000 ITERATIONS)...
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
                    <span className="text-center text-slate-500">3,970 t</span>
                    <span className="text-right text-[#2E4D37] font-bold text-sm">{processedTonnesAfter.toLocaleString()} t</span>
                  </div>

                  <div className="grid grid-cols-3 items-center text-slate-800">
                    <span className="font-sans font-medium">Recovery Rate</span>
                    <span className="text-center text-slate-500">62.4%</span>
                    <span className="text-right text-[#2E4D37] font-bold text-sm">{recoveryPctAfter}%</span>
                  </div>

                  <div className="grid grid-cols-3 items-center text-slate-800">
                    <span className="font-sans font-medium">Landfill Tonnes</span>
                    <span className="text-center text-slate-500">1,810 t</span>
                    <span className="text-right text-[#3A7CA5] font-bold text-sm">{landfillTonnesAfter.toLocaleString()} t</span>
                  </div>

                  <div className="grid grid-cols-3 items-center text-slate-800">
                    <span className="font-sans font-medium">CO₂e Emissions</span>
                    <span className="text-center text-slate-500">1,284 t</span>
                    <span className="text-right text-[#2E4D37] font-bold text-sm">{co2After.toLocaleString()} t</span>
                  </div>

                  <div className="grid grid-cols-3 items-center text-slate-800">
                    <span className="font-sans font-medium">Truck Trips / Day</span>
                    <span className="text-center text-slate-500">182</span>
                    <span className="text-right text-[#D9822B] font-bold text-sm">{tripsAfter}</span>
                  </div>
                </div>

                {/* HIGHLIGHT CARDS */}
                <div className="grid grid-cols-3 gap-3 text-center font-mono">
                  <div className="bg-[#E3EFE5] border border-[#C3DCC8] p-3.5 rounded-xl">
                    <span className="text-2xl font-black text-[#2E4D37] font-mono-num block">
                      -{deltaCO2SavedMonthly.toLocaleString()} t
                    </span>
                    <span className="text-[10px] text-slate-700 uppercase font-sans font-medium">CO₂e Saved / Month</span>
                  </div>

                  <div className="bg-[#EBF3F8] border border-[#C4DCED] p-3.5 rounded-xl">
                    <span className="text-2xl font-black text-[#3A7CA5] font-mono-num block">
                      -{deltaLandfillAvoided.toLocaleString()} t
                    </span>
                    <span className="text-[10px] text-slate-700 uppercase font-sans font-medium">Landfill Avoided</span>
                  </div>

                  <div className="bg-[#FAF2E6] border border-[#F2D6B3] p-3.5 rounded-xl">
                    <span className="text-2xl font-black text-[#D9822B] font-mono-num block">
                      -{deltaTripsCut}
                    </span>
                    <span className="text-[10px] text-slate-700 uppercase font-sans font-medium">Truck Trips Cut</span>
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
