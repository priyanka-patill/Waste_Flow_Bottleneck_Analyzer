import React, { useState, useEffect } from 'react';
import { Play, Pause, X, Award } from 'lucide-react';
import confetti from 'canvas-confetti';

interface HackathonDemoOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateTab: (tab: string) => void;
}

export const HackathonDemoOverlay: React.FC<HackathonDemoOverlayProps> = ({
  isOpen,
  onClose,
  onNavigateTab
}) => {
  const [step, setStep] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);

  const demoSteps = [
    {
      title: "1. BASELINE TELEMETRY",
      tab: "command",
      subtitle: "Monitoring 4,820 tonnes/day moving across Mumbai's waste network.",
      highlight: "Network operational, but high load building at central hubs."
    },
    {
      title: "2. BOTTLENECK DETECTED",
      tab: "bottlenecks",
      subtitle: "Sorting Facility B (Kanjurmarg) reaches 94% utilization threshold!",
      highlight: "Queue spikes to 182 tonnes with +42 t CO₂e spillover forecast."
    },
    {
      title: "3. ROOT CAUSE IDENTIFIED",
      tab: "root-cause",
      subtitle: "AI Causal Engine discovers peak arrival compression & shift underutilization.",
      highlight: "Facility operates below 60% capacity during night windows."
    },
    {
      title: "4. WHAT-IF SIMULATION",
      tab: "what-if",
      subtitle: "Simulating dynamic reallocation of 180 t/day to Facility C (Taloja).",
      highlight: "Monte Carlo engine forecasts 182 t CO₂e saved per month."
    },
    {
      title: "5. AUTOMATIC RECOVERY DEPLOYED",
      tab: "optimization",
      subtitle: "Deploying dynamic truck rerouting & extending shift operating hours.",
      highlight: "7 trucks rerouted via Eastern Freeway corridor."
    },
    {
      title: "6. MEASURABLE IMPACT VERIFIED",
      tab: "counterfactual",
      subtitle: "System health restored from 78 → 94 with verified carbon mitigation.",
      highlight: "ONE DECISION. MEASURABLE IMPACT."
    }
  ];

  useEffect(() => {
    if (!isOpen || !isPlaying) return;

    const currentTab = demoSteps[step].tab;
    onNavigateTab(currentTab);

    if (step === demoSteps.length - 1) {
      confetti({
        particleCount: 120,
        spread: 90,
        origin: { y: 0.5 }
      });
    }

    const timer = setTimeout(() => {
      if (step < demoSteps.length - 1) {
        setStep(prev => prev + 1);
      } else {
        setIsPlaying(false);
      }
    }, 4500);

    return () => clearTimeout(timer);
  }, [isOpen, isPlaying, step]);

  if (!isOpen) return null;

  const current = demoSteps[step];
  const isFinal = step === demoSteps.length - 1;

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-2xl bg-white/95 backdrop-blur-md border-2 border-[#2E4D37] rounded-2xl p-5 shadow-2xl text-slate-900 space-y-4 font-sans animate-in slide-in-from-bottom duration-300">
      {/* Top Banner */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
        <div className="flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#2E4D37] animate-ping" />
          <span className="text-xs font-bold text-[#2E4D37] uppercase tracking-wider font-mono">
            ⚡ HACKATHON DEMO WALKTHROUGH ({step + 1}/{demoSteps.length})
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="p-1 bg-slate-100 rounded text-slate-700 hover:bg-slate-200"
          >
            {isPlaying ? <Pause size={14} /> : <Play size={14} />}
          </button>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-700">
            <X size={16} />
          </button>
        </div>
      </div>

      {isFinal ? (
        <div className="py-4 text-center space-y-3">
          <div className="inline-flex items-center space-x-2 bg-[#E3EFE5] border border-[#C3DCC8] px-3 py-1 rounded-full text-[#2E4D37] font-bold text-xs">
            <Award size={14} />
            <span>MEASURABLE SYSTEM OUTCOME</span>
          </div>

          <h2 className="text-2xl font-black tracking-tight text-[#1A261C]">
            ONE DECISION. MEASURABLE IMPACT.
          </h2>

          <div className="grid grid-cols-4 gap-2 text-center text-xs font-mono pt-2">
            <div className="bg-[#F7F9F7] p-2.5 rounded-xl border border-slate-200">
              <span className="text-slate-500 text-[9px] block">SYSTEM HEALTH</span>
              <span className="text-[#2E4D37] font-extrabold text-base">78 → 94</span>
            </div>
            <div className="bg-[#F7F9F7] p-2.5 rounded-xl border border-slate-200">
              <span className="text-slate-500 text-[9px] block">CO₂e REDUCTION</span>
              <span className="text-[#2E4D37] font-extrabold text-base">-18%</span>
            </div>
            <div className="bg-[#F7F9F7] p-2.5 rounded-xl border border-slate-200">
              <span className="text-slate-500 text-[9px] block">LANDFILL REDUCTION</span>
              <span className="text-[#3A7CA5] font-extrabold text-base">-21%</span>
            </div>
            <div className="bg-[#F7F9F7] p-2.5 rounded-xl border border-slate-200">
              <span className="text-slate-500 text-[9px] block">TRUCK TRIPS CUT</span>
              <span className="text-[#D9822B] font-extrabold text-base">-15%</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-1.5">
          <h3 className="text-xs font-bold text-[#2E4D37] font-mono uppercase">{current.title}</h3>
          <p className="text-sm font-bold text-[#1A261C]">{current.subtitle}</p>
          <div className="bg-[#E3EFE5] p-2 rounded-lg border border-[#C3DCC8] text-xs text-[#2E4D37] font-medium">
            👉 {current.highlight}
          </div>
        </div>
      )}

      {/* Progress Bar */}
      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div 
          className="h-full bg-[#2E4D37] transition-all duration-300"
          style={{ width: `${((step + 1) / demoSteps.length) * 100}%` }}
        />
      </div>
    </div>
  );
};
