import React, { useState } from 'react';
import { 
  AlertTriangle, 
  ArrowRight, 
  ShieldAlert,
  Zap,
  CheckCircle2,
  ChevronRight
} from 'lucide-react';
import { useNetworkState } from '../state/networkState';

interface BottleneckIntelligenceProps {
  onSimulateFix: () => void;
}

export const BottleneckIntelligence: React.FC<BottleneckIntelligenceProps> = ({ onSimulateFix }) => {
  const { analysis } = useNetworkState();
  const bottlenecks = analysis.bottlenecks;
  const [selectedBottleneckId, setSelectedBottleneckId] = useState<string>(bottlenecks[0]?.id || 'b1');

  const selectedBottleneck = bottlenecks.find(b => b.id === selectedBottleneckId) || bottlenecks[0] || {
    id: 'b1',
    rank: 1,
    title: 'Sorting Facility B — Kanjurmarg',
    severity: 'CRITICAL',
    utilization: 94,
    queueGrowthRate: '+14.2% / hr',
    downstreamImpact: 'Transfer Station 2 gridlock, 18 vehicle queues',
    co2Impact: '+42 t CO₂e',
    confidenceScore: 94.8,
    causalChain: ['Sorting Facility B (94% Cap)', 'Transfer Station 2 Congestion', 'Fleet Queue Growth']
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#D8E2D9] pb-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#D94E48]">
            WHERE IS THE SYSTEM BREAKING?
          </h1>
          <p className="text-xs text-[#526355] mt-0.5 font-medium">
            Real-time causal identification & cascading failure prediction across city corridors
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: RANKED BOTTLENECKS LIST (5 COLS) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="text-xs font-bold text-[#526355] uppercase tracking-wider px-1">
            RANKED SYSTEM BREAK POINTS ({bottlenecks.length} ACTIVE)
          </div>

          {bottlenecks.map((item) => {
            const isSelected = selectedBottleneckId === item.id;
            return (
              <div
                key={item.id}
                onClick={() => setSelectedBottleneckId(item.id)}
                className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                  item.severity === 'CRITICAL'
                    ? isSelected 
                      ? 'bg-[#FDF2F2] border-2 border-[#D94E48] shadow-sm'
                      : 'bg-white border-[#F8C8C6] hover:border-[#D94E48]'
                    : isSelected 
                      ? 'bg-[#FFF8EE] border-2 border-[#D9822B]'
                      : 'bg-white border-[#D8E2D9] hover:border-[#D9822B]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-mono font-bold text-slate-400">0{item.rank}</span>
                    <h3 className="text-sm font-bold text-[#1A261C]">{item.title}</h3>
                  </div>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                    item.severity === 'CRITICAL' ? 'bg-[#D94E48] text-white' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {item.severity}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 mt-3 text-xs font-mono">
                  <div className="bg-[#F7F9F7] p-2 rounded-xl border border-slate-200">
                    <span className="text-slate-500 text-[9px] uppercase block">Utilization</span>
                    <span className={`font-bold ${item.utilization >= 90 ? 'text-rose-600' : 'text-amber-600'}`}>
                      {item.utilization}%
                    </span>
                  </div>
                  <div className="bg-[#F7F9F7] p-2 rounded-xl border border-slate-200">
                    <span className="text-slate-500 text-[9px] uppercase block">Queue Growth</span>
                    <span className="text-slate-800 font-bold">{item.queueGrowthRate}</span>
                  </div>
                  <div className="bg-[#F7F9F7] p-2 rounded-xl border border-slate-200">
                    <span className="text-slate-500 text-[9px] uppercase block">CO₂ Impact</span>
                    <span className="text-rose-600 font-bold">{item.co2Impact}</span>
                  </div>
                </div>

                <p className="text-xs text-slate-600 mt-2 line-clamp-1 font-medium">
                  Impact: {item.downstreamImpact}
                </p>
              </div>
            );
          })}
        </div>

        {/* RIGHT COLUMN: INTERACTIVE IMPACT RIPPLE CAUSAL CHAIN (7 COLS) */}
        <div className="lg:col-span-7 bg-white border border-[#D8E2D9] rounded-2xl p-6 shadow-xs space-y-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-[#F0F4F0] pb-3">
              <div className="flex items-center space-x-2">
                <ShieldAlert size={18} className="text-[#D94E48]" />
                <span className="text-xs font-bold text-[#1A261C] uppercase tracking-wider">
                  INTERACTIVE IMPACT RIPPLE PROPAGATION
                </span>
              </div>
              <span className="text-[10px] font-mono text-[#2E4D37] bg-[#E3EFE5] px-2 py-0.5 rounded border border-[#C3DCC8] font-bold">
                CONFIDENCE: {selectedBottleneck.confidenceScore}%
              </span>
            </div>

            <p className="text-xs text-slate-600 mt-3 font-medium">
              Selected Focal Point: <strong className="text-[#1A261C]">{selectedBottleneck.title}</strong>
            </p>

            {/* Ripple Causal Chain Diagram */}
            <div className="mt-6 space-y-3 relative">
              <div className="absolute left-6 top-6 bottom-6 w-0.5 bg-gradient-to-b from-rose-500 via-amber-500 to-emerald-600" />

              {selectedBottleneck.causalChain.map((step, idx) => (
                <div 
                  key={idx}
                  className="relative z-10 pl-12 pr-4 py-3 bg-[#F7F9F7] border border-[#D8E2D9] hover:border-[#2E4D37] rounded-xl transition-all flex items-center justify-between group"
                >
                  <div className="absolute left-4 w-4 h-4 rounded-full bg-white border-2 border-rose-500 flex items-center justify-center text-[9px] font-mono text-rose-700 font-bold">
                    {idx + 1}
                  </div>

                  <div>
                    <p className="text-xs font-bold text-[#1A261C]">{step}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      Stage {idx + 1} • Cascading Latency Ripple
                    </p>
                  </div>

                  <ArrowRight size={14} className="text-slate-400 group-hover:text-[#2E4D37] transition-colors" />
                </div>
              ))}
            </div>
          </div>

          {/* Action Footer */}
          <div className="pt-4 border-t border-[#F0F4F0] flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-[#1A261C]">Estimated Avoidable Carbon Spillover</p>
              <p className="text-xs text-rose-600 font-mono font-bold mt-0.5">+42 tonnes CO₂e per month</p>
            </div>

            <button
              onClick={onSimulateFix}
              className="bg-[#2E4D37] hover:bg-[#233D2B] text-white font-extrabold text-xs px-5 py-2.5 rounded-xl shadow-xs transition-all flex items-center space-x-2"
            >
              <Zap size={15} />
              <span>Simulate Lowest-Impact Fix</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
