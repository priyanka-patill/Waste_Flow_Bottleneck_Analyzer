import React from 'react';
import { GitBranch, FileText } from 'lucide-react';
import { useNetworkState } from '../state/networkState';

export const RootCauseAnalysis: React.FC = () => {
  const { analysis } = useNetworkState();
  const { causes, evidenceLogs, diagnosticFinding } = analysis.rootCauses;

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#D8E2D9] pb-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#1A261C]">
            WHY IS IT HAPPENING?
          </h1>
          <p className="text-xs text-[#526355] mt-0.5 font-medium">
            Transparent probabilistic tree & telemetry evidence for active focal bottleneck
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* VISUAL CAUSAL TREE (7 COLS) */}
        <div className="lg:col-span-7 bg-white border border-[#D8E2D9] rounded-2xl p-6 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-[#F0F4F0] pb-3">
            <div className="flex items-center space-x-2">
              <GitBranch size={18} className="text-[#2E4D37]" />
              <span className="text-xs font-bold text-[#1A261C] uppercase tracking-wider">
                CAUSAL PROBABILITY BREAKDOWN
              </span>
            </div>
            <span className="text-[10px] font-mono text-[#526355]">TELEMETRY MATCH & DUAL LEVERAGE</span>
          </div>

          <div className="space-y-4">
            {causes.map((c, i) => (
              <div key={i} className="bg-[#F7F9F7] border border-[#D8E2D9] rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="font-bold text-[#1A261C]">{c.title}</span>
                  <span className="font-bold text-[#2E4D37]">{c.pct}% Contribution</span>
                </div>

                <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${c.color} transition-all duration-1000`}
                    style={{ width: `${c.pct}%` }}
                  />
                </div>

                <p className="text-[11px] text-slate-600 font-sans">{c.note}</p>
              </div>
            ))}
          </div>
        </div>

        {/* EVIDENCE LOG & EXPLAINABILITY (5 COLS) */}
        <div className="lg:col-span-5 bg-white border border-[#D8E2D9] rounded-2xl p-6 shadow-xs space-y-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-[#F0F4F0] pb-3">
              <div className="flex items-center space-x-2">
                <FileText size={18} className="text-[#3A7CA5]" />
                <span className="text-xs font-bold text-[#1A261C] uppercase tracking-wider">
                  TELEMETRY EVIDENCE LOG
                </span>
              </div>
              <span className="text-[10px] font-mono text-[#2E4D37] font-bold">EXPLAINABLE LOGIC</span>
            </div>

            <div className="mt-4 space-y-3">
              {evidenceLogs.map((log, idx) => (
                <div key={idx} className="bg-[#F7F9F7] border border-[#D8E2D9] p-3.5 rounded-xl space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-[#2E4D37] font-bold">{log.time}</span>
                    <span className="text-[9px] font-mono bg-white px-2 py-0.5 rounded text-slate-700 border border-slate-300">
                      {log.badge}
                    </span>
                  </div>
                  <p className="text-xs text-slate-800 leading-relaxed font-sans font-medium">
                    "{log.text}"
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#F5F3F8] p-4 rounded-xl border border-purple-200 text-xs space-y-1 font-mono">
            <p className="text-purple-900 font-bold uppercase">💡 KEY DIAGNOSTIC FINDING</p>
            <p className="text-slate-700 text-[11px] font-sans">
              {diagnosticFinding}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
