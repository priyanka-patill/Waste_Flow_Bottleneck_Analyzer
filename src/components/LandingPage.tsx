import React, { useState, useEffect } from 'react';
import { Play, Activity, AlertTriangle, ArrowRight, ShieldCheck, Zap, Globe, Cpu, Leaf } from 'lucide-react';

interface LandingPageProps {
  onLaunchDigitalTwin: () => void;
  onExploreLiveNetwork: () => void;
  onStartDemo: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onLaunchDigitalTwin,
  onExploreLiveNetwork,
  onStartDemo
}) => {
  const [animStep, setAnimStep] = useState<number>(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setAnimStep((prev) => (prev + 1) % 4);
    }, 2800);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-[#EDF2EE] text-slate-900 flex flex-col justify-between relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-[#2E4D37]/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[500px] h-[500px] bg-[#3A7CA5]/5 rounded-full blur-[140px] pointer-events-none" />

      {/* Navbar */}
      <nav className="max-w-7xl mx-auto w-full px-6 py-6 flex items-center justify-between relative z-10">
        <div className="flex items-center space-x-3 cursor-pointer" onClick={onLaunchDigitalTwin}>
          <div className="w-10 h-10 rounded-xl bg-[#2E4D37] flex items-center justify-center font-black text-white text-lg shadow-sm">
            <Leaf size={22} className="fill-white" />
          </div>
          <div>
            <h1 className="font-black tracking-tight text-[#1E3123] text-xl">
              WASTE<span className="text-[#3B6946]">WISE</span>
            </h1>
            <p className="text-[10px] text-[#485C4B] font-mono tracking-widest uppercase">
              MUNICIPAL DIGITAL TWIN PLATFORM
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <button
            onClick={onStartDemo}
            className="hidden sm:flex items-center space-x-2 bg-[#FAF2E6] border border-[#F2D6B3] text-[#D9822B] font-mono text-xs px-4 py-2.5 rounded-xl transition-all font-bold"
          >
            <Play size={14} className="fill-[#D9822B]" />
            <span>3-MIN DEMO MODE</span>
          </button>
          
          <button
            onClick={onLaunchDigitalTwin}
            className="bg-[#2E4D37] hover:bg-[#233D2B] text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-xs transition-all flex items-center space-x-2"
          >
            <span>LAUNCH DASHBOARD</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </nav>

      {/* Hero Content */}
      <main className="max-w-7xl mx-auto w-full px-6 py-8 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10 my-auto">
        <div className="lg:col-span-6 space-y-6 text-left">
          <div className="inline-flex items-center space-x-2 bg-white border border-[#C3DCC8] rounded-full px-3 py-1 text-[11px] font-mono text-[#2E4D37] font-bold shadow-xs">
            <span className="w-2 h-2 rounded-full bg-[#2E4D37] animate-ping" />
            <span>MUNICIPAL DECISION INTELLIGENCE</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-black tracking-tight text-[#1A261C] leading-tight">
            Waste doesn’t disappear. <br />
            <span className="text-[#2E4D37]">
              It moves.
            </span>
          </h1>

          <p className="text-[#526355] text-base md:text-lg leading-relaxed max-w-xl font-medium">
            Model your city's waste network as a living digital twin. Detect bottlenecks before they become crises — and simulate the lowest-impact fix in real time.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <button
              onClick={onLaunchDigitalTwin}
              className="bg-[#2E4D37] hover:bg-[#233D2B] text-white font-extrabold text-sm px-6 py-3.5 rounded-xl shadow-md transition-all flex items-center space-x-2 transform hover:-translate-y-0.5"
            >
              <Cpu size={18} />
              <span>Launch Digital Twin</span>
            </button>

            <button
              onClick={onExploreLiveNetwork}
              className="bg-white hover:bg-slate-50 border border-[#D8E2D9] text-[#1A261C] font-semibold text-sm px-6 py-3.5 rounded-xl transition-all flex items-center space-x-2 shadow-xs"
            >
              <Activity size={18} className="text-[#3A7CA5]" />
              <span>Explore Live Network</span>
            </button>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-4 pt-8 border-t border-[#D8E2D9]">
            <div>
              <p className="text-2xl font-black text-[#1A261C] font-mono-num">4,820 <span className="text-xs text-slate-500 font-sans">t/day</span></p>
              <p className="text-[11px] text-[#526355] uppercase tracking-wider font-mono font-bold">Waste Tracked</p>
            </div>
            <div>
              <p className="text-2xl font-black text-[#2E4D37] font-mono-num">62.4%</p>
              <p className="text-[11px] text-[#526355] uppercase tracking-wider font-mono font-bold">Recovery Rate</p>
            </div>
            <div>
              <p className="text-2xl font-black text-[#3A7CA5] font-mono-num">-18.2%</p>
              <p className="text-[11px] text-[#526355] uppercase tracking-wider font-mono font-bold">CO₂e Avoided</p>
            </div>
          </div>
        </div>

        {/* Right Interactive Card */}
        <div className="lg:col-span-6">
          <div className="bg-white border border-[#D8E2D9] rounded-2xl p-6 shadow-xl relative overflow-hidden group">
            <div className="flex items-center justify-between border-b border-[#F0F4F0] pb-4 mb-4">
              <div className="flex items-center space-x-2">
                <Globe size={16} className="text-[#2E4D37]" />
                <span className="text-xs font-mono text-[#1A261C] font-bold uppercase tracking-wider">
                  MUMBAI METRO DIGITAL TWIN — SIMULATOR
                </span>
              </div>
              <span className="text-[10px] font-mono bg-[#E3EFE5] px-2 py-0.5 rounded text-[#2E4D37] font-bold border border-[#C3DCC8]">
                CYCLE STEP {animStep + 1}/4
              </span>
            </div>

            {/* Waste Node Sequence */}
            <div className="relative py-6 space-y-6">
              <div className="grid grid-cols-5 gap-2 text-center text-xs relative z-10 font-sans">
                <div className="bg-[#E3EFE5] border border-[#C3DCC8] p-2.5 rounded-xl">
                  <p className="text-[9px] text-[#526355] uppercase font-mono">01 ZONE</p>
                  <p className="font-bold text-[#1A261C] text-[11px] truncate">Colaba A</p>
                  <p className="text-[10px] text-[#2E4D37] font-mono font-bold mt-1">680 t/d</p>
                </div>

                <div className="bg-[#E3EFE5] border border-[#C3DCC8] p-2.5 rounded-xl">
                  <p className="text-[9px] text-[#526355] uppercase font-mono">02 TRUCK</p>
                  <p className="font-bold text-[#1A261C] text-[11px] truncate">Fleet Beta</p>
                  <p className="text-[10px] text-[#3A7CA5] font-mono font-bold mt-1">18 Vehicles</p>
                </div>

                <div className="bg-[#FAF2E6] border border-[#F2D6B3] p-2.5 rounded-xl">
                  <p className="text-[9px] text-[#526355] uppercase font-mono">03 TRANSFER</p>
                  <p className="font-bold text-[#1A261C] text-[11px] truncate">TS-2 Kurla</p>
                  <p className="text-[10px] text-[#D9822B] font-mono font-bold mt-1">87% Cap</p>
                </div>

                <div className={`p-2.5 rounded-xl transition-all duration-500 ${
                  animStep >= 1 
                    ? 'bg-[#FDE8E8] border-2 border-[#D94E48] shadow-xs animate-pulse' 
                    : 'bg-[#E3EFE5] border border-[#C3DCC8]'
                }`}>
                  <p className="text-[9px] text-[#526355] uppercase font-mono">04 SORTING</p>
                  <p className="font-bold text-[#1A261C] text-[11px] truncate">Facility B</p>
                  <p className={`text-[10px] font-mono mt-1 ${animStep >= 1 ? 'text-[#D94E48] font-bold' : 'text-[#2E4D37]'}`}>
                    {animStep >= 1 ? '94% CRITICAL' : '78% Normal'}
                  </p>
                </div>

                <div className="bg-[#F7ECE5] border border-[#E8D1C5] p-2.5 rounded-xl">
                  <p className="text-[9px] text-[#526355] uppercase font-mono">05 LANDFILL</p>
                  <p className="font-bold text-[#1A261C] text-[11px] truncate">Deonar Site</p>
                  <p className="text-[10px] text-[#A46843] font-mono font-bold mt-1">143 Days</p>
                </div>
              </div>
            </div>

            {/* Banner */}
            <div className="mt-4 pt-4 border-t border-[#F0F4F0]">
              {animStep >= 1 ? (
                <div className="bg-[#FDF2F2] border border-[#F8C8C6] rounded-xl p-3.5 flex items-start space-x-3 text-left">
                  <AlertTriangle size={18} className="text-[#D94E48] shrink-0 mt-0.5 animate-bounce" />
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-[#D94E48] uppercase">
                        ⚠ BOTTLENECK DETECTED — SORTING B
                      </span>
                    </div>
                    <p className="text-xs text-slate-700 font-medium">
                      Processing queue (+182t) causing 18 truck delays at TS-2 Kurla. Carbon overflow estimate: +42 t CO₂e.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="bg-[#F7F9F7] border border-[#D8E2D9] rounded-xl p-3.5 flex items-center justify-between text-xs text-slate-700 font-medium">
                  <span className="font-mono text-[#2E4D37] font-bold">● FLOW TELEMETRY STABLE</span>
                  <span className="text-slate-500">Monitoring 182 network nodes...</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto w-full px-6 py-6 border-t border-[#D8E2D9] flex flex-col md:flex-row items-center justify-between text-xs text-[#526355] gap-4 relative z-10 font-medium">
        <div className="flex items-center space-x-2">
          <ShieldCheck size={16} className="text-[#2E4D37]" />
          <span>Deployed for Municipal Authorities & Sustainability Teams</span>
        </div>
        <p className="font-mono text-[11px]">WASTEWISE DIGITAL TWIN PLATFORM © 2026 — ALL RIGHTS RESERVED</p>
      </footer>
    </div>
  );
};
