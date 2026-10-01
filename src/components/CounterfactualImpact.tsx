import React from 'react';
import { AlertTriangle, ShieldCheck } from 'lucide-react';
import { useNetworkState } from '../state/networkState';

export const CounterfactualImpact: React.FC = () => {
  const { analysis } = useNetworkState();
  const { baseline, counterfactual, delta } = analysis.counterfactual;

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#D8E2D9] pb-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#1A261C]">
            WHAT DID THE BOTTLENECK COST US?
          </h1>
          <p className="text-xs text-[#526355] mt-0.5 font-medium">
            Side-by-side simulation comparison between current unmitigated state and optimized state
          </p>
        </div>
      </div>

      {/* TWO WORLDS COMPARISON GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* WORLD 1: BASELINE (BOTTLENECK EXISTS) */}
        <div className="lg:col-span-6 bg-white border-2 border-rose-300 rounded-2xl p-6 shadow-xs space-y-4 relative overflow-hidden">
          <div className="flex items-center justify-between border-b border-rose-100 pb-3">
            <div className="flex items-center space-x-2">
              <AlertTriangle size={18} className="text-[#D94E48]" />
              <span className="text-xs font-bold text-rose-900 uppercase tracking-wider">
                BASELINE WORLD — BOTTLENECK ACTIVE
              </span>
            </div>
            <span className="text-[10px] font-mono bg-rose-100 text-rose-800 px-2 py-0.5 rounded font-bold">UNMITIGATED</span>
          </div>

          <p className="text-xs text-slate-600 font-medium">
            Active bottleneck node operates at capacity with queue backlog and unmitigated spillover.
          </p>

          <div className="space-y-3 font-mono text-xs">
            <div className="bg-[#F7F9F7] p-3 rounded-xl border border-slate-200 flex justify-between">
              <span className="text-slate-600 font-sans">Monthly CO₂e Emissions</span>
              <span className="text-rose-700 font-bold">{baseline.co2EmissionsTonnes.toLocaleString()} tonnes</span>
            </div>
            <div className="bg-[#F7F9F7] p-3 rounded-xl border border-slate-200 flex justify-between">
              <span className="text-slate-600 font-sans">Monthly Landfill Dumping</span>
              <span className="text-rose-700 font-bold">{baseline.landfillDumpingTonnes.toLocaleString()} tonnes</span>
            </div>
            <div className="bg-[#F7F9F7] p-3 rounded-xl border border-slate-200 flex justify-between">
              <span className="text-slate-600 font-sans">Monthly Fleet Diesel Burn</span>
              <span className="text-rose-700 font-bold">{baseline.fleetDieselLiters.toLocaleString()} Litres</span>
            </div>
            <div className="bg-[#F7F9F7] p-3 rounded-xl border border-slate-200 flex justify-between">
              <span className="text-slate-600 font-sans">Total Monthly Truck Trips</span>
              <span className="text-rose-700 font-bold">{baseline.truckTrips.toLocaleString()} Trips</span>
            </div>
          </div>
        </div>

        {/* WORLD 2: COUNTERFACTUAL (BOTTLENECK REMOVED) */}
        <div className="lg:col-span-6 bg-white border-2 border-[#C3DCC8] rounded-2xl p-6 shadow-xs space-y-4 relative overflow-hidden">
          <div className="flex items-center justify-between border-b border-[#E3EFE5] pb-3">
            <div className="flex items-center space-x-2">
              <ShieldCheck size={18} className="text-[#2E4D37]" />
              <span className="text-xs font-bold text-[#2E4D37] uppercase tracking-wider">
                COUNTERFACTUAL WORLD — BOTTLENECK REMOVED
              </span>
            </div>
            <span className="text-[10px] font-mono bg-[#E3EFE5] text-[#2E4D37] px-2 py-0.5 rounded font-bold">OPTIMIZED</span>
          </div>

          <p className="text-xs text-slate-600 font-medium">
            180 t/day reallocated to Facility C with dynamic freeway dispatch.
          </p>

          <div className="space-y-3 font-mono text-xs">
            <div className="bg-[#F7F9F7] p-3 rounded-xl border border-slate-200 flex justify-between">
              <span className="text-slate-600 font-sans">Monthly CO₂e Emissions</span>
              <span className="text-[#2E4D37] font-bold">{counterfactual.co2EmissionsTonnes.toLocaleString()} tonnes (-{delta.co2SavedTonnes}t)</span>
            </div>
            <div className="bg-[#F7F9F7] p-3 rounded-xl border border-slate-200 flex justify-between">
              <span className="text-slate-600 font-sans">Monthly Landfill Dumping</span>
              <span className="text-[#2E4D37] font-bold">{counterfactual.landfillDumpingTonnes.toLocaleString()} tonnes (-{delta.landfillAvoidedTonnes}t)</span>
            </div>
            <div className="bg-[#F7F9F7] p-3 rounded-xl border border-slate-200 flex justify-between">
              <span className="text-slate-600 font-sans">Monthly Fleet Diesel Burn</span>
              <span className="text-[#2E4D37] font-bold">{counterfactual.fleetDieselLiters.toLocaleString()} Litres (-{delta.dieselSavedLiters.toLocaleString()}L)</span>
            </div>
            <div className="bg-[#F7F9F7] p-3 rounded-xl border border-slate-200 flex justify-between">
              <span className="text-slate-600 font-sans">Total Monthly Truck Trips</span>
              <span className="text-[#2E4D37] font-bold">{counterfactual.truckTrips.toLocaleString()} Trips (-{delta.tripsCut} trips)</span>
            </div>
          </div>
        </div>
      </div>

      {/* AVOIDABLE WASTE BANNER */}
      <div className="bg-white border border-[#D8E2D9] rounded-2xl p-6 shadow-xs space-y-4">
        <div className="text-xs font-bold text-[#1A261C] uppercase tracking-wider border-b border-[#F0F4F0] pb-2">
          MEASURABLE NET AVOIDABLE IMPACT
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center font-mono">
          <div className="bg-[#E3EFE5] border border-[#C3DCC8] p-4 rounded-xl">
            <span className="text-2xl font-black text-[#2E4D37] font-mono-num block">+{delta.co2SavedTonnes} t</span>
            <span className="text-[10px] text-slate-700 uppercase font-sans font-medium">Avoidable CO₂e Emissions</span>
          </div>

          <div className="bg-[#EBF3F8] border border-[#C4DCED] p-4 rounded-xl">
            <span className="text-2xl font-black text-[#3A7CA5] font-mono-num block">+{delta.landfillAvoidedTonnes} t</span>
            <span className="text-[10px] text-slate-700 uppercase font-sans font-medium">Avoidable Landfill Waste</span>
          </div>

          <div className="bg-[#FAF2E6] border border-[#F2D6B3] p-4 rounded-xl">
            <span className="text-2xl font-black text-[#D9822B] font-mono-num block">+{delta.dieselSavedLiters.toLocaleString()} L</span>
            <span className="text-[10px] text-slate-700 uppercase font-sans font-medium">Extra Fuel Wasted</span>
          </div>

          <div className="bg-purple-50 border border-purple-200 p-4 rounded-xl">
            <span className="text-2xl font-black text-purple-900 font-mono-num block">+{delta.tripsCut}</span>
            <span className="text-[10px] text-slate-700 uppercase font-sans font-medium">Extra Truck Trips</span>
          </div>
        </div>
      </div>
    </div>
  );
};
