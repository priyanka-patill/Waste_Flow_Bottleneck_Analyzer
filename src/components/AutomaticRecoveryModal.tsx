import React, { useState } from 'react';
import { X, AlertTriangle, ShieldCheck, CheckCircle2, Sliders } from 'lucide-react';
import confetti from 'canvas-confetti';

interface AutomaticRecoveryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSimulateFirst: () => void;
}

export const AutomaticRecoveryModal: React.FC<AutomaticRecoveryModalProps> = ({
  isOpen,
  onClose,
  onSimulateFirst
}) => {
  const [applied, setApplied] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleApply = () => {
    setApplied(true);
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });
    setTimeout(() => {
      setApplied(false);
      onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white border-2 border-[#D94E48] rounded-2xl p-6 shadow-2xl space-y-6 relative overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Modal Top Banner */}
        <div className="flex items-center justify-between border-b border-rose-100 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-rose-100 border border-rose-200 flex items-center justify-center text-rose-700">
              <AlertTriangle size={22} className="animate-bounce" />
            </div>
            <div>
              <h2 className="text-base font-black text-rose-900 uppercase font-mono tracking-wider">
                ⚠ AUTOMATIC RECOVERY AVAILABLE
              </h2>
              <p className="text-xs text-rose-700 font-medium">Critical Bottleneck at Sorting Facility B (94% utilization)</p>
            </div>
          </div>

          <button onClick={onClose} className="text-slate-400 hover:text-slate-800 p-1 rounded hover:bg-slate-100">
            <X size={18} />
          </button>
        </div>

        {applied ? (
          <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-[#E3EFE5] border-2 border-[#2E4D37] flex items-center justify-center text-[#2E4D37] animate-bounce">
              <CheckCircle2 size={36} />
            </div>
            <h3 className="text-xl font-black text-[#1A261C]">RECOVERY PLAN APPLIED SUCCESSFULLY!</h3>
            <p className="text-xs font-mono text-[#2E4D37] font-bold">
              180 t/day redirected to Facility C • 7 trucks rerouted • System health restored to 94/100
            </p>
          </div>
        ) : (
          <>
            {/* 3-Point Action Plan */}
            <div className="space-y-3">
              <div className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                RECOMMENDED 3-STEP DISPATCH PLAN
              </div>

              <div className="space-y-2 text-xs font-sans">
                <div className="bg-[#F7F9F7] p-3.5 rounded-xl border border-[#D8E2D9] flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="w-6 h-6 rounded-full bg-[#E3EFE5] text-[#2E4D37] font-bold flex items-center justify-center text-xs">
                      1
                    </span>
                    <span className="text-[#1A261C] font-bold">Redirect 180 t/day → Facility C (Taloja)</span>
                  </div>
                  <span className="text-[10px] text-[#2E4D37] bg-[#E3EFE5] px-2 py-0.5 rounded font-bold">22% Spare Cap</span>
                </div>

                <div className="bg-[#F7F9F7] p-3.5 rounded-xl border border-[#D8E2D9] flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="w-6 h-6 rounded-full bg-sky-100 text-sky-800 font-bold flex items-center justify-center text-xs">
                      2
                    </span>
                    <span className="text-[#1A261C] font-bold">Reroute 7 Fleet Beta trucks via Eastern Freeway</span>
                  </div>
                  <span className="text-[10px] text-[#D9822B] bg-[#FAF2E6] px-2 py-0.5 rounded font-bold">-18 min delay</span>
                </div>

                <div className="bg-[#F7F9F7] p-3.5 rounded-xl border border-[#D8E2D9] flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="w-6 h-6 rounded-full bg-purple-100 text-purple-800 font-bold flex items-center justify-center text-xs">
                      3
                    </span>
                    <span className="text-[#1A261C] font-bold">Increase Facility C operating window by 2.0 hours</span>
                  </div>
                  <span className="text-[10px] text-purple-900 bg-purple-50 px-2 py-0.5 rounded font-bold">Night Shift</span>
                </div>
              </div>
            </div>

            {/* Expected Impact Summary Cards */}
            <div className="grid grid-cols-3 gap-3 text-center font-mono">
              <div className="bg-rose-50 border border-rose-200 p-3 rounded-xl">
                <span className="text-xl font-extrabold text-rose-700 block">-41%</span>
                <span className="text-[9px] text-slate-600 uppercase font-sans">Queue Reduction</span>
              </div>

              <div className="bg-[#E3EFE5] border border-[#C3DCC8] p-3 rounded-xl">
                <span className="text-xl font-extrabold text-[#2E4D37] block">-31 t</span>
                <span className="text-[9px] text-slate-600 uppercase font-sans">CO₂e / Month</span>
              </div>

              <div className="bg-sky-50 border border-sky-200 p-3 rounded-xl">
                <span className="text-xl font-extrabold text-sky-800 block">-120 t</span>
                <span className="text-[9px] text-slate-600 uppercase font-sans">Landfill Waste</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-3 pt-2">
              <button
                onClick={handleApply}
                className="flex-grow bg-[#2E4D37] hover:bg-[#233D2B] text-white font-extrabold text-xs py-3 rounded-xl shadow-xs transition-all flex items-center justify-center space-x-2"
              >
                <ShieldCheck size={16} />
                <span>APPLY RECOVERY PLAN NOW</span>
              </button>

              <button
                onClick={() => {
                  onClose();
                  onSimulateFirst();
                }}
                className="bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 text-xs px-4 py-3 rounded-xl font-medium flex items-center space-x-1.5 transition-colors"
              >
                <Sliders size={14} />
                <span>SIMULATE FIRST</span>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
