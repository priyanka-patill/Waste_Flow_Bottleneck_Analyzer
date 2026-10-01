import React, { useState } from 'react';
import { 
  AlertCircle, CheckCircle2, CloudRain, RefreshCw, X, Maximize2, 
  Trash2, Truck, ArrowLeftRight, Cog, Recycle, Mountain, Zap
} from 'lucide-react';
import { useNetworkState } from '../state/networkState';

export type FlowyState = 'NORMAL' | 'BOTTLENECK' | 'SIMULATING' | 'RESTORED' | 'MONSOON';

interface FlowyProps {
  initialState?: FlowyState;
  currentNodeName?: string;
  currentUtilization?: number;
  onSimulateFix?: () => void;
  onInspectBottleneck?: () => void;
}

export const FlowyNarrator: React.FC<FlowyProps> = ({
  initialState,
  currentNodeName,
  currentUtilization,
  onSimulateFix,
  onInspectBottleneck
}) => {
  const { analysis, networkState } = useNetworkState();
  const [isOpen, setIsOpen] = useState(true);

  // Derived initial state if not explicitly overridden
  const topBottleneck = analysis.bottlenecks[0];
  const activeScenario = networkState.activeScenarioId;

  let computedDefaultState: FlowyState = 'NORMAL';
  if (activeScenario === 'monsoon' || activeScenario === 'heavy-rain') {
    computedDefaultState = 'MONSOON';
  } else if (topBottleneck && topBottleneck.severity === 'CRITICAL') {
    computedDefaultState = 'BOTTLENECK';
  }

  const [state, setState] = useState<FlowyState>(initialState || computedDefaultState);
  const [activeStep, setActiveStep] = useState(3); // 0: Col, 1: Transp, 2: Transf, 3: Sort, 4: Proc, 5: Landfill

  const nodeName = currentNodeName || topBottleneck?.title || 'Sorting Facility B — Kanjurmarg';
  const utilization = currentUtilization ?? (topBottleneck?.utilization || 94);

  // Cycle through states for demonstration when "Toggle State" is clicked
  const handleToggleState = () => {
    const states: FlowyState[] = ['NORMAL', 'BOTTLENECK', 'SIMULATING', 'RESTORED', 'MONSOON'];
    const nextIdx = (states.indexOf(state) + 1) % states.length;
    const nextState = states[nextIdx];
    setState(nextState);
    if (nextState === 'BOTTLENECK') setActiveStep(3);
    if (nextState === 'MONSOON') setActiveStep(1);
    if (nextState === 'NORMAL') setActiveStep(0);
  };

  const handleSimulate = () => {
    setState('SIMULATING');
    if (onSimulateFix) onSimulateFix();
    setTimeout(() => {
      setState('RESTORED');
    }, 2000);
  };

  // Pipeline stages definition
  const stages = [
    { label: 'Collection', icon: Trash2, node: 'Zone A' },
    { label: 'Transport', icon: Truck, node: 'Route M-17' },
    { label: 'Transfer', icon: ArrowLeftRight, node: 'Kurla TS' },
    { label: 'Sorting', icon: Cog, node: 'Facility B' },
    { label: 'Processing', icon: Recycle, node: 'MRF Hub' },
    { label: 'Landfill', icon: Mountain, node: 'Kanjurmarg' }
  ];

  return (
    <div className="fixed bottom-5 right-5 z-50 font-sans select-none">
      {/* ---------------- COLLAPSED FLOATING AVATAR ---------------- */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="relative group flex items-center justify-center w-16 h-16 bg-[#2C4A3E] text-white rounded-full shadow-2xl hover:scale-105 transition-all duration-300 border-2 border-[#A3B899]/50"
          title="Open Flowy Narrator"
        >
          <MascotSvg expression={state === 'MONSOON' ? 'MONSOON' : state === 'BOTTLENECK' ? 'CONCERNED' : 'HAPPY'} size={42} />
          <span className={`absolute top-0 right-0 w-4 h-4 rounded-full border-2 border-white ${
            state === 'BOTTLENECK' ? 'bg-red-500 animate-ping' : 'bg-emerald-400'
          }`} />
        </button>
      )}

      {/* ---------------- EXPANDED CARD WIDGET ---------------- */}
      {isOpen && (
        <div className="w-[420px] max-w-[92vw] bg-[#F7FAF7] border border-[#C5D5CC] rounded-2xl shadow-2xl overflow-hidden transition-all duration-300">
          
          {/* 1. TOP HEADER BAR */}
          <div className="bg-[#2C4A3E] text-white px-4 py-3 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-full bg-[#3B6352] flex items-center justify-center border border-[#A3B899]/40 overflow-hidden">
                <MascotSvg expression={state === 'MONSOON' ? 'MONSOON' : state === 'BOTTLENECK' ? 'CONCERNED' : 'HAPPY'} size={28} />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-extrabold tracking-wider text-sm text-[#F0F5F2]">FLOWY</span>
                  <span className="bg-[#3B6352] text-[#D8E6DF] text-[10px] font-bold px-2 py-0.5 rounded-full tracking-wider">
                    SYSTEM NARRATOR
                  </span>
                </div>
                <div className="text-[11px] font-medium text-[#B8CFC2] flex items-center space-x-1.5 mt-0.5">
                  <span>STATE:</span>
                  <span className={`font-bold ${
                    state === 'BOTTLENECK' ? 'text-red-300' :
                    state === 'RESTORED' ? 'text-emerald-300' :
                    state === 'MONSOON' ? 'text-amber-300' : 'text-emerald-200'
                  }`}>
                    {state}
                  </span>
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center space-x-1.5 text-[#B8CFC2]">
              <button 
                onClick={() => setState(state === 'MONSOON' ? 'NORMAL' : 'MONSOON')} 
                className="p-1.5 hover:bg-[#3B6352] rounded-lg transition-colors"
                title="Toggle Weather Mode"
              >
                <CloudRain className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setIsOpen(false)} 
                className="p-1.5 hover:bg-[#3B6352] rounded-lg transition-colors"
                title="Minimize"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* 2. PIPELINE STEPPER */}
          <div className="bg-[#EBF2EE] px-4 py-3 border-b border-[#D5E3DB]">
            <div className="flex items-center justify-between text-[11px] font-bold text-[#2C4A3E] tracking-wider mb-2">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#3B6352]" />
                WASTE-FLOW TRAVERSAL
              </span>
              <span className="text-gray-600 font-semibold">
                {stages[activeStep].label} ({utilization}%)
              </span>
            </div>

            <div className="relative flex items-center justify-between px-2 py-1">
              {/* Connecting Line */}
              <div className="absolute top-1/2 left-4 right-4 h-1 bg-[#CBDCD3] -translate-y-1/2 z-0" />
              
              {stages.map((stg, idx) => {
                const Icon = stg.icon;
                const isActive = idx === activeStep;
                const isPast = idx < activeStep;

                return (
                  <button
                    key={stg.label}
                    onClick={() => setActiveStep(idx)}
                    className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                      isActive 
                        ? 'bg-[#2C4A3E] text-white ring-4 ring-[#A3B899]/60 scale-110' 
                        : isPast 
                          ? 'bg-[#A3B899] text-[#2C4A3E]' 
                          : 'bg-white text-gray-400 border border-[#C5D5CC]'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {isActive && (
                      <span className="absolute -top-1 right-0 w-2.5 h-2.5 bg-emerald-400 border-2 border-[#2C4A3E] rounded-full animate-pulse" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. MASCOT AVATAR & DYNAMIC SPEECH BUBBLE */}
          <div className="p-4 flex items-start space-x-3">
            <div className="relative flex-shrink-0">
              <MascotSvg 
                expression={
                  state === 'MONSOON' ? 'MONSOON' : 
                  state === 'BOTTLENECK' ? 'CONCERNED' : 
                  state === 'SIMULATING' ? 'WORKING' : 
                  state === 'RESTORED' ? 'HAPPY' : 'CALM'
                } 
                size={82} 
              />
              {state === 'BOTTLENECK' && (
                <div className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-black animate-bounce shadow">
                  !
                </div>
              )}
            </div>

            {/* Speech Bubble */}
            <div className="flex-1 bg-white border border-[#D5E3DB] rounded-2xl p-3.5 shadow-sm relative text-xs leading-relaxed text-gray-700">
              <div className="absolute top-4 -left-2 w-3 h-3 bg-white border-l border-b border-[#D5E3DB] transform rotate-45" />
              
              {state === 'BOTTLENECK' && (
                <div>
                  <p className="font-extrabold text-sm text-gray-900 mb-1">
                    "Something's slowing the flow."
                  </p>
                  <p className="text-gray-600">
                    Bottleneck detected at <span className="font-semibold text-gray-800">{nodeName}</span> ({utilization}% utilization).
                  </p>
                </div>
              )}

              {state === 'SIMULATING' && (
                <div>
                  <p className="font-extrabold text-sm text-[#2C4A3E] mb-1 flex items-center gap-1.5">
                    <RefreshCw className="w-4 h-4 animate-spin text-emerald-600" />
                    "Optimizing network parameters..."
                  </p>
                  <p className="text-gray-600">
                    Simulating counterfactual re-routing and throughput balancing...
                  </p>
                </div>
              )}

              {state === 'RESTORED' && (
                <div>
                  <p className="font-extrabold text-sm text-emerald-700 mb-1 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    "Flow restored ✓"
                  </p>
                  <p className="text-gray-600">
                    Capacity balanced! Waste diversion increased by +150 t/day and landfill risk cleared.
                  </p>
                </div>
              )}

              {state === 'MONSOON' && (
                <div>
                  <p className="font-extrabold text-sm text-amber-800 mb-1 flex items-center gap-1.5">
                    <CloudRain className="w-4 h-4 text-amber-600" />
                    "Monsoon inundation active."
                  </p>
                  <p className="text-gray-600">
                    Heavy rainfall slowing Western Express fleet transit speeds by 45%.
                  </p>
                </div>
              )}

              {state === 'NORMAL' && (
                <div>
                  <p className="font-extrabold text-sm text-[#2C4A3E] mb-1">
                    "All systems nominal."
                  </p>
                  <p className="text-gray-600">
                    Waste flow operating cleanly across collection, transfer, and processing hubs.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* 4. EVIDENCE & ACTION CARD (Shown during Bottleneck) */}
          {state === 'BOTTLENECK' && (
            <div className="mx-4 mb-4 bg-[#FFF5F5] border border-[#FEB2B2] rounded-xl p-3.5 space-y-2.5 text-xs">
              <div className="flex items-center justify-between border-b border-red-200 pb-2">
                <span className="font-extrabold text-red-800 flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-red-600" />
                  {nodeName}
                </span>
                <span className="bg-red-600 text-white font-extrabold px-2 py-0.5 rounded text-[10px] tracking-wide">
                  {utilization}% CAPACITY
                </span>
              </div>

              <div className="space-y-1.5 text-gray-700">
                <p>
                  <strong className="text-gray-900">Cause:</strong> Incoming waste inflow (1,450 t/day) exceeds processing throughput capacity (1,200 t/day).
                </p>
                <p>
                  <strong className="text-gray-900">Impact:</strong> 380 t queue backlog; +42 t CO₂e methane buildup rate.
                </p>
                <p>
                  <strong className="text-gray-900">Recommended Fix:</strong> Activate Secondary Sorting Line & divert 150 t to Deonar Facility C.
                </p>
              </div>

              <button
                onClick={handleSimulate}
                className="w-full mt-2 bg-[#2C4A3E] hover:bg-[#1E362D] text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center gap-2 shadow transition-all duration-200 text-xs"
              >
                <Zap className="w-4 h-4 text-amber-300" />
                Simulate Fix & Restore Flow
              </button>
            </div>
          )}

          {/* 5. FOOTER QUICK CONTROLS */}
          <div className="bg-[#EBF2EE] px-4 py-2.5 border-t border-[#D5E3DB] flex items-center justify-between text-[11px] font-semibold text-gray-600">
            <button
              onClick={onInspectBottleneck}
              className="flex items-center gap-1 text-[#2C4A3E] hover:underline"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              Inspect Bottlenecks
            </button>
            <button
              onClick={handleToggleState}
              className="text-gray-500 hover:text-gray-800 transition-colors"
            >
              Toggle State
            </button>
          </div>

        </div>
      )}
    </div>
  );
};

// ---------------- EMBEDDED 3D MASCOT ARTWORK ----------------
const MascotSvg: React.FC<{ expression: 'CALM' | 'CONCERNED' | 'WORKING' | 'HAPPY' | 'MONSOON'; size: number }> = ({ expression, size }) => {
  return (
    <div className="relative inline-block" style={{ width: size, height: size }}>
      <img
        src="/flowy_mascot.png"
        alt="Flowy Sprout Mascot"
        className="w-full h-full object-contain drop-shadow-md transition-all duration-300"
      />
      {expression === 'CONCERNED' && (
        <span className="absolute -bottom-1 -right-1 bg-rose-500 text-white font-black text-[10px] w-4 h-4 rounded-full flex items-center justify-center shadow-md animate-pulse">
          !
        </span>
      )}
      {expression === 'MONSOON' && (
        <span className="absolute -top-1 -left-1 bg-amber-500 text-white font-bold text-[9px] px-1 py-0.2 rounded-full shadow-md">
          ☔
        </span>
      )}
      {expression === 'WORKING' && (
        <span className="absolute -bottom-1 -right-1 bg-emerald-600 text-white font-bold text-[9px] w-4 h-4 rounded-full flex items-center justify-center shadow-md animate-spin">
          ⚙
        </span>
      )}
      {expression === 'HAPPY' && (
        <span className="absolute -top-1 -right-1 text-emerald-600 font-bold text-xs animate-bounce">
          ✨
        </span>
      )}
    </div>
  );
};

export default FlowyNarrator;
