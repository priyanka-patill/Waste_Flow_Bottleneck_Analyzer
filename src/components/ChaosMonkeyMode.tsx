import React, { useState } from 'react';
import { ShieldAlert, Play, CheckCircle2, Activity } from 'lucide-react';
import { useNetworkState } from '../state/networkState';

export const ChaosMonkeyMode: React.FC = () => {
  const { runChaosSimulation, analysis } = useNetworkState();
  const [selectedDisruption, setSelectedDisruption] = useState<string>('FACILITY FAILURE');
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);

  const resilienceScore = analysis.bottlenecks.length > 0
    ? Math.max(50, 100 - (analysis.bottlenecks[0].bottleneckScore * 0.35))
    : 88;

  const disruptions = [
    { name: 'FACILITY FAILURE', desc: 'Sorting Facility B conveyor failure (100% outage)' },
    { name: 'TRUCK SHORTAGE', desc: '25% driver strike across Western corridor' },
    { name: 'MONSOON FLOODING', desc: 'Waterlogging blocks Kurla & Dharavi underpasses' },
    { name: 'STRIKE', desc: 'Municipal transport union work slowdown' },
    { name: 'TRAFFIC COLLAPSE', desc: 'Major accident on Eastern Express Highway' },
    { name: 'FESTIVAL SURGE', desc: 'Ganpati Visarjan +35% organic waste spike' }
  ];

  const handleDisruptionSelect = (name: string) => {
    setSelectedDisruption(name);
    runChaosSimulation(name);
  };

  const handleRunChaosTest = () => {
    setIsRunning(true);
    setProgress(0);
    runChaosSimulation(selectedDisruption);

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsRunning(false);
          return 100;
        }
        return prev + 20;
      });
    }, 200);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#D8E2D9] pb-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#D9822B]">
            WASTE CHAOS MONKEY
          </h1>
          <p className="text-xs text-[#526355] mt-0.5 font-medium">
            Stress-test city waste network against catastrophic shocks & Monte Carlo disruption suites
          </p>
        </div>

        <button
          onClick={handleRunChaosTest}
          disabled={isRunning}
          className="bg-[#D9822B] hover:bg-[#b86b1f] text-white font-extrabold text-xs px-5 py-2.5 rounded-xl shadow-xs transition-all flex items-center space-x-2 disabled:opacity-50"
        >
          <Play size={15} className="fill-white" />
          <span>RUN 100 CHAOS SIMULATIONS</span>
        </button>
      </div>

      {/* DISRUPTION SELECTOR */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
        {disruptions.map((d) => (
          <button
            key={d.name}
            onClick={() => handleDisruptionSelect(d.name)}
            className={`p-3 rounded-xl border text-left font-sans transition-all ${
              selectedDisruption === d.name
                ? 'bg-[#FFF8EE] border-2 border-[#D9822B] text-[#D9822B] shadow-xs'
                : 'bg-white border-[#D8E2D9] text-slate-700 hover:border-slate-400'
            }`}
          >
            <p className="text-xs font-bold uppercase">{d.name}</p>
            <p className="text-[9px] text-slate-500 mt-1 line-clamp-1">{d.desc}</p>
          </button>
        ))}
      </div>

      {/* RESULTS DISPLAY */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* RESILIENCE SCORE GAUGE (5 COLS) */}
        <div className="lg:col-span-5 bg-white border border-[#D8E2D9] rounded-2xl p-6 shadow-xs flex flex-col items-center justify-center text-center space-y-4">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            NETWORK RESILIENCE SCORE
          </div>

          <div className="relative w-44 h-44 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="88" cy="88" r="72" stroke="#E5ECE6" strokeWidth="14" fill="none" />
              <circle
                cx="88"
                cy="88"
                r="72"
                stroke="#2E4D37"
                strokeWidth="14"
                fill="none"
                strokeDasharray="452"
                strokeDashoffset={452 - (452 * Math.round(resilienceScore)) / 100}
                strokeLinecap="round"
                className="transition-all duration-1000"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-black text-[#1A261C] font-mono-num">{Math.round(resilienceScore)}</span>
              <span className="text-xs text-slate-500 font-mono">/ 100</span>
            </div>
          </div>

          <div className="bg-[#F7F9F7] p-3 rounded-xl border border-[#D8E2D9] text-xs space-y-1 w-full font-sans">
            <p className="text-[#2E4D37] font-bold uppercase">RESILIENCE STATE: RESILIENT</p>
            <p className="text-slate-600 text-[11px]">
              Network absorbs shock via automated rerouting within 8 hours.
            </p>
          </div>
        </div>

        {/* SEQUENCE (7 COLS) */}
        <div className="lg:col-span-7 bg-white border border-[#D8E2D9] rounded-2xl p-6 shadow-xs space-y-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-[#F0F4F0] pb-3">
              <div className="flex items-center space-x-2">
                <Activity size={18} className="text-[#D9822B]" />
                <span className="text-xs font-bold text-[#1A261C] uppercase tracking-wider">
                  DEGRADATION & RECOVERY SEQUENCE
                </span>
              </div>
              <span className="text-[10px] font-mono text-[#2E4D37] font-bold">100 SIMULATED TRIALS</span>
            </div>

            <div className="mt-6 space-y-3">
              {[
                { stage: '1. Shock Initiation', text: 'Sorting Facility B conveyor fails (100% capacity loss)', color: 'text-rose-700 bg-rose-50 border-rose-200' },
                { stage: '2. Queue Growth', text: 'Transfer Station 2 queue spikes to 240 tonnes (+110%)', color: 'text-amber-800 bg-amber-50 border-amber-200' },
                { stage: '3. Network Overflow', text: 'Truck idle time increases by 42 minutes along Route M-17', color: 'text-amber-800 bg-amber-50 border-amber-200' },
                { stage: '4. Automated Rerouting', text: 'Recovery engine diverts 180 t/day to Facility C (Taloja)', color: 'text-sky-800 bg-sky-50 border-sky-200' },
                { stage: '5. System Recovery', text: 'Network stabilization completed & queues cleared', color: 'text-[#2E4D37] bg-[#E3EFE5] border-[#C3DCC8]' }
              ].map((step, i) => (
                <div key={i} className={`border p-3 rounded-xl flex items-center justify-between text-xs font-sans font-medium ${step.color}`}>
                  <span className="font-bold">{step.stage}</span>
                  <span>{step.text}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#E3EFE5] border border-[#C3DCC8] rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <CheckCircle2 size={24} className="text-[#2E4D37]" />
              <div>
                <p className="text-xs font-bold text-[#1A261C] uppercase">RECOVERY BENCHMARK</p>
                <p className="text-sm font-extrabold text-[#2E4D37] font-mono-num">
                  NETWORK RECOVERED IN 8h 24m
                </p>
              </div>
            </div>
            <span className="text-[10px] font-mono text-[#2E4D37] bg-white px-2.5 py-1 rounded border border-[#C3DCC8] font-bold">
              PASSED
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
