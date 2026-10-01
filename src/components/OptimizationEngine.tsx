import React from 'react';
import { ArrowRight } from 'lucide-react';
import { useNetworkState } from '../state/networkState';

interface OptimizationEngineProps {
  onApplyIntervention: (rank: number) => void;
}

export const OptimizationEngine: React.FC<OptimizationEngineProps> = ({ onApplyIntervention: parentApply }) => {
  const { analysis, applyIntervention } = useNetworkState();
  const interventions = analysis.optimizationInterventions;

  const handleApply = (rank: number) => {
    applyIntervention(rank);
    parentApply(rank);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#D8E2D9] pb-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#1A261C]">
            FIND THE BEST FIX
          </h1>
          <p className="text-xs text-[#526355] mt-0.5 font-medium">
            Interventions ranked by environmental ROI (tonnes CO₂e saved per Lakh Rupee invested)
          </p>
        </div>
      </div>

      {/* RANKED INTERVENTIONS CARDS */}
      <div className="space-y-4">
        {interventions.map((item) => (
          <div
            key={item.rank}
            className="bg-white border border-[#D8E2D9] hover:border-[#2E4D37] rounded-2xl p-5 shadow-xs transition-all flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6"
          >
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 rounded-xl bg-[#E3EFE5] border border-[#C3DCC8] flex items-center justify-center text-[#2E4D37] font-black text-xl font-mono shrink-0">
                #{item.rank}
              </div>

              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <h3 className="text-base font-bold text-[#1A261C]">{item.title}</h3>
                  <span className="text-[10px] font-mono bg-[#F7F9F7] px-2 py-0.5 rounded text-slate-700 border border-slate-300">
                    {item.category}
                  </span>
                </div>
                <p className="text-xs text-slate-600 max-w-xl font-sans">{item.description}</p>
              </div>
            </div>

            {/* Metrics Breakdown Strip */}
            <div className="flex flex-wrap items-center gap-6 text-xs font-mono border-t lg:border-t-0 lg:border-l border-[#F0F4F0] pt-3 lg:pt-0 lg:pl-6">
              <div>
                <span className="text-slate-500 text-[10px] uppercase block font-sans">CO₂e Saved</span>
                <span className="text-[#2E4D37] font-extrabold text-base">{item.co2SavedMonthlyTonnes} t/mo</span>
              </div>

              <div>
                <span className="text-slate-500 text-[10px] uppercase block font-sans">Investment</span>
                <span className="text-[#1A261C] font-extrabold text-base">₹{item.investmentInrLakhs}L</span>
              </div>

              <div className="bg-[#E3EFE5] p-2.5 rounded-xl border border-[#C3DCC8]">
                <span className="text-[#2E4D37] text-[9px] uppercase block font-bold font-sans">ROI Ratio</span>
                <span className="text-[#2E4D37] font-extrabold text-sm">{item.roiRatio} t CO₂e / ₹L</span>
              </div>

              <button
                onClick={() => handleApply(item.rank)}
                className="bg-[#2E4D37] hover:bg-[#233D2B] text-white font-extrabold text-xs px-4 py-2.5 rounded-xl transition-colors flex items-center space-x-1"
              >
                <span>Deploy Intervention</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
