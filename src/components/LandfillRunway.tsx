import React from 'react';
import { useNetworkState } from '../state/networkState';

export const LandfillRunway: React.FC = () => {
  const { analysis } = useNetworkState();
  const runway = analysis.environmentalMetrics.landfillRunway;

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#D8E2D9] pb-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#D9822B]">
            LANDFILL RUNWAY PROJECTION
          </h1>
          <p className="text-xs text-[#526355] mt-0.5 font-medium">
            Volumetric airspace depletion modeling & lifetime extension forecast for {runway.siteName}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* CARD (7 COLS) */}
        <div className="lg:col-span-7 bg-white border border-[#D8E2D9] rounded-2xl p-6 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-[#F0F4F0] pb-3">
            <div>
              <h3 className="text-sm font-bold text-[#1A261C] uppercase">{runway.siteName}</h3>
              <p className="text-[10px] text-slate-500 font-mono">Total Capacity: {(runway.totalCapacityTonnes / 1000000).toFixed(1)}M Tonnes | Remaining: {runway.remainingTonnes.toLocaleString()} Tonnes</p>
            </div>
            <span className="text-xs bg-[#FAF2E6] text-[#D9822B] border border-[#F2D6B3] px-2.5 py-1 rounded font-bold font-mono">
              WARNING CAPACITY
            </span>
          </div>

          <div className="bg-[#F7F9F7] border border-[#D8E2D9] rounded-xl p-4 space-y-4">
            <div className="flex items-center justify-between text-xs font-sans">
              <span className="text-rose-700 flex items-center font-bold">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-600 mr-1.5" />
                Baseline Trajectory: Full in {runway.baselineDaysRemaining} Days
              </span>
              <span className="text-[#2E4D37] flex items-center font-bold">
                <span className="w-2.5 h-2.5 rounded-full bg-[#2E4D37] mr-1.5" />
                Optimized Trajectory: Full in {runway.optimizedDaysRemaining} Days (+{runway.extensionDays} Days!)
              </span>
            </div>

            {/* SVG Depletion Curves */}
            <div className="h-52 relative">
              <svg className="w-full h-full text-slate-300" viewBox="0 0 500 200">
                <line x1="0" y1="40" x2="500" y2="40" stroke="#E5ECE6" strokeDasharray="4 4" />
                <line x1="0" y1="90" x2="500" y2="90" stroke="#E5ECE6" strokeDasharray="4 4" />
                <line x1="0" y1="140" x2="500" y2="140" stroke="#E5ECE6" strokeDasharray="4 4" />

                <path
                  d="M 10 40 Q 250 120 320 190"
                  fill="none"
                  stroke="#D94E48"
                  strokeWidth="3.5"
                  className="animate-flow-dash"
                />

                <path
                  d="M 10 40 Q 280 60 480 190"
                  fill="none"
                  stroke="#2E4D37"
                  strokeWidth="3.5"
                  className="animate-flow-dash"
                />

                <circle cx="320" cy="190" r="5" fill="#D94E48" />
                <text x="270" y="175" fill="#D94E48" fontSize="10" fontFamily="monospace" fontWeight="bold">Day {runway.baselineDaysRemaining} (Baseline)</text>

                <circle cx="480" cy="190" r="5" fill="#2E4D37" />
                <text x="400" y="175" fill="#2E4D37" fontSize="10" fontFamily="monospace" fontWeight="bold">Day {runway.optimizedDaysRemaining} (+{runway.extensionDays}d)</text>
              </svg>
            </div>
          </div>
        </div>

        {/* METRICS (5 COLS) */}
        <div className="lg:col-span-5 bg-white border border-[#D8E2D9] rounded-2xl p-6 shadow-xs space-y-6 flex flex-col justify-between">
          <div>
            <div className="border-b border-[#F0F4F0] pb-3">
              <span className="text-xs font-bold text-[#1A261C] uppercase tracking-wider">
                AIRSPACE LIFETIME EXTENSION
              </span>
            </div>

            <div className="mt-6 space-y-4 font-mono">
              <div className="bg-[#F7F9F7] p-4 rounded-xl border border-slate-200 space-y-1">
                <span className="text-slate-500 text-xs uppercase block font-sans">Baseline Capacity Depletion</span>
                <span className="text-rose-700 font-extrabold text-2xl font-mono-num">{runway.baselineDaysRemaining} DAYS</span>
                <p className="text-[10px] text-slate-500 font-sans">Predicted exhaustion: {runway.baselineDepletionDate}</p>
              </div>

              <div className="bg-[#E3EFE5] p-4 rounded-xl border border-[#C3DCC8] space-y-1">
                <span className="text-[#2E4D37] text-xs uppercase block font-bold font-sans">Optimized Runway Extension</span>
                <span className="text-[#2E4D37] font-extrabold text-2xl font-mono-num">{runway.optimizedDaysRemaining} DAYS</span>
                <p className="text-[10px] text-[#2E4D37] font-bold font-sans">+{runway.extensionDays} Days airspace preserved</p>
              </div>
            </div>
          </div>

          <div className="bg-[#EBF3F8] p-4 rounded-xl border border-[#C4DCED] text-xs font-sans space-y-1">
            <span className="text-[#3A7CA5] font-bold uppercase block">💡 POLICY INSIGHT</span>
            <p className="text-slate-700 text-[11px]">
              By diverting 180 t/day to waste-to-energy and MRF sorting, municipal landfill lifespan is extended by {(runway.extensionDays / 30).toFixed(1)} months, delaying expensive new quarry acquisition by ₹42 Crore.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
