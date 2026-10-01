import React from 'react';
import { OPTIMIZATION_INTERVENTIONS } from '../data/wasteData';

export const InterventionROI: React.FC = () => {
  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#D8E2D9] pb-3">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-black tracking-tight text-[#1A261C] uppercase font-mono">
              INTERVENTION ROI RANKING MATRIX
            </h1>
            <span className="text-xs bg-[#E3EFE5] text-[#2E4D37] border border-[#C3DCC8] px-2 py-0.5 rounded font-mono font-bold">
              CAPITAL ALLOCATION EFFICIENCY
            </span>
          </div>
          <p className="text-xs text-[#526355] font-mono mt-0.5">
            Carbon payback efficiency ranking (t CO₂e mitigated per Lakh Rupee capex/opex)
          </p>
        </div>
      </div>

      {/* MATRIX TABLE */}
      <div className="bg-white border border-[#D8E2D9] rounded-2xl p-6 shadow-xs space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead>
              <tr className="border-b border-[#F0F4F0] text-[#526355] text-[10px] uppercase font-bold">
                <th className="pb-3">Rank & Intervention</th>
                <th className="pb-3 text-center">Category</th>
                <th className="pb-3 text-center">Capex (₹ Lakhs)</th>
                <th className="pb-3 text-center">Monthly CO₂e Saved</th>
                <th className="pb-3 text-center text-[#2E4D37]">ROI Efficiency</th>
                <th className="pb-3 text-right">Payback Period</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0F4F0]">
              {OPTIMIZATION_INTERVENTIONS.map((item) => (
                <tr key={item.rank} className="hover:bg-[#F7F9F7] transition-colors">
                  <td className="py-4">
                    <div className="flex items-center space-x-3">
                      <span className="w-6 h-6 rounded bg-[#E3EFE5] text-[#2E4D37] font-bold flex items-center justify-center text-xs">
                        #{item.rank}
                      </span>
                      <div>
                        <p className="font-bold text-[#1A261C] font-sans">{item.title}</p>
                        <p className="text-[10px] text-slate-500 font-sans">{item.description}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 text-center">
                    <span className="bg-[#F7F9F7] px-2 py-0.5 rounded text-slate-700 border border-slate-300 text-[10px]">
                      {item.category}
                    </span>
                  </td>
                  <td className="py-4 text-center font-bold text-[#1A261C]">₹{item.investmentInrLakhs} L</td>
                  <td className="py-4 text-center font-bold text-[#2E4D37]">{item.co2SavedMonthlyTonnes} t/mo</td>
                  <td className="py-4 text-center font-bold text-[#2E4D37] text-sm">
                    {item.roiRatio} t CO₂e / ₹L
                  </td>
                  <td className="py-4 text-right font-bold text-[#D9822B]">{item.paybackMonths} Months</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
