import React from 'react';
import { Play } from 'lucide-react';
import { SCENARIO_PRESETS } from '../data/wasteData';
import { useNetworkState } from '../state/networkState';

interface ScenarioLibraryProps {
  onRunScenario: (id: string) => void;
}

export const ScenarioLibrary: React.FC<ScenarioLibraryProps> = ({ onRunScenario: parentRun }) => {
  const { selectScenario, networkState } = useNetworkState();
  const currentActive = networkState.activeScenarioId;

  const handleRun = (id: string) => {
    selectScenario(id);
    parentRun(id);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#D8E2D9] pb-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#1A261C]">
            SCENARIO PRESET LIBRARY
          </h1>
          <p className="text-xs text-[#526355] mt-0.5 font-medium">
            Pre-configured municipal stress scenarios, seasonal surges & disaster response models
          </p>
        </div>
      </div>

      {/* SCENARIOS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {SCENARIO_PRESETS.map((scenario) => {
          const isActive = currentActive === scenario.id;
          return (
            <div
              key={scenario.id}
              className={`bg-white border hover:border-[#2E4D37] rounded-2xl p-5 shadow-xs transition-all flex flex-col justify-between space-y-4 group ${
                isActive ? 'border-2 border-[#2E4D37] bg-[#F7FDF8]' : 'border-[#D8E2D9]'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                    scenario.riskLevel === 'CRITICAL' 
                      ? 'bg-rose-100 text-rose-800' 
                      : scenario.riskLevel === 'HIGH' 
                        ? 'bg-amber-100 text-amber-900' 
                        : 'bg-sky-100 text-sky-900'
                  }`}>
                    {scenario.riskLevel} RISK
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">ID: {scenario.id}</span>
                </div>

                <h3 className="text-sm font-bold text-[#1A261C] group-hover:text-[#2E4D37] transition-colors">
                  {scenario.title}
                </h3>

                <p className="text-xs text-slate-600 font-sans leading-relaxed">{scenario.description}</p>

                <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-2">
                  <div className="bg-[#F7F9F7] p-2 rounded-xl border border-slate-200">
                    <span className="text-slate-500 text-[9px] uppercase block font-sans">Waste Spike</span>
                    <span className="text-[#2E4D37] font-bold">+{scenario.wasteIncreasePct}%</span>
                  </div>
                  <div className="bg-[#F7F9F7] p-2 rounded-xl border border-slate-200">
                    <span className="text-slate-500 text-[9px] uppercase block font-sans">Duration</span>
                    <span className="text-slate-800 font-bold">{scenario.durationDays} Days</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleRun(scenario.id)}
                className={`w-full font-extrabold text-xs py-2.5 rounded-xl transition-all flex items-center justify-center space-x-2 ${
                  isActive
                    ? 'bg-[#2E4D37] text-white'
                    : 'bg-[#E3EFE5] hover:bg-[#2E4D37] hover:text-white border border-[#C3DCC8] text-[#2E4D37]'
                }`}
              >
                <Play size={14} className="fill-current" />
                <span>{isActive ? 'SCENARIO ACTIVE' : 'RUN SCENARIO SIMULATION'}</span>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
