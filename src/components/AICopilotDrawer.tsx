import React, { useState } from 'react';
import { X, Sparkles, Send, Play, CornerDownLeft } from 'lucide-react';

interface AICopilotDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onTriggerScenario: (scenarioId: string) => void;
}

export const AICopilotDrawer: React.FC<AICopilotDrawerProps> = ({
  isOpen,
  onClose,
  onTriggerScenario
}) => {
  const [query, setQuery] = useState<string>('');
  const [activeResponse, setActiveResponse] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);

  if (!isOpen) return null;

  const examplePrompts = [
    "What if Kanjurmarg shuts down for 3 days?",
    "How can we cut landfill dependency below 30%?",
    "What if monsoon rainfall delays transport legs by 45 minutes?"
  ];

  const handleSend = (textToSend?: string) => {
    const promptText = textToSend || query;
    if (!promptText.trim()) return;

    setLoading(true);
    setActiveResponse(null);

    setTimeout(() => {
      setLoading(false);
      setActiveResponse({
        rawQuery: promptText,
        detectedScenario: "Sorting Facility B (Kanjurmarg) Outage",
        duration: "72 Hours (3 Days)",
        impacts: [
          { label: "Diverted Waste Surge", value: "+1,240 tonnes", color: "text-[#2E4D37]" },
          { label: "Transfer Station Queue", value: "+38% Congestion", color: "text-rose-600" },
          { label: "Additional Truck Trips", value: "+210 Trips", color: "text-[#D9822B]" },
          { label: "Carbon Spillover", value: "+96 t CO₂e", color: "text-[#3A7CA5]" }
        ],
        recommendation: "Pre-divert 500 t/day to Facility C (Taloja) and initiate night shift at Mahim MRF."
      });
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-lg bg-white border-l border-[#D8E2D9] h-full flex flex-col justify-between p-6 shadow-2xl animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div>
          <div className="flex items-center justify-between border-b border-[#F0F4F0] pb-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-purple-100 border border-purple-200 flex items-center justify-center text-purple-800">
                <Sparkles size={18} />
              </div>
              <div>
                <h2 className="text-sm font-bold text-[#1A261C] uppercase font-mono tracking-wider">
                  ASK WASTEWISE — NATURAL LANGUAGE ENGINE
                </h2>
                <p className="text-[10px] text-[#526355]">Converts natural text queries into live digital twin simulations</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1 text-slate-500 hover:text-slate-900 rounded hover:bg-slate-100"
            >
              <X size={18} />
            </button>
          </div>

          {/* Preset Example Buttons */}
          <div className="mt-4 space-y-2">
            <p className="text-[10px] font-mono text-slate-500 uppercase tracking-wider font-bold">SUGGESTED QUERY COMMANDS</p>
            <div className="space-y-1.5">
              {examplePrompts.map((p, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setQuery(p);
                    handleSend(p);
                  }}
                  className="w-full text-left text-xs text-slate-800 bg-[#F7F9F7] hover:bg-[#EBF2EC] border border-[#D8E2D9] rounded-xl p-2.5 transition-colors font-sans flex items-center justify-between group"
                >
                  <span>"{p}"</span>
                  <CornerDownLeft size={12} className="text-slate-400 group-hover:text-[#2E4D37]" />
                </button>
              ))}
            </div>
          </div>

          {/* Response Container */}
          {loading && (
            <div className="py-12 text-center space-y-3">
              <Sparkles size={32} className="text-purple-600 animate-spin mx-auto" />
              <p className="text-xs font-mono text-slate-600 uppercase">Parsing Natural Language → Scenario Parameters...</p>
            </div>
          )}

          {activeResponse && !loading && (
            <div className="mt-6 bg-[#F7F9F7] border border-purple-200 rounded-2xl p-4 space-y-4 font-mono text-xs shadow-xs">
              <div className="flex items-center justify-between border-b border-purple-200 pb-2">
                <span className="text-purple-900 font-bold uppercase">SCENARIO DETECTED</span>
                <span className="text-[10px] bg-purple-100 px-2 py-0.5 rounded text-purple-900">AI PARSED</span>
              </div>

              <div>
                <p className="text-slate-500 text-[10px] uppercase font-sans">Target Facility & Outage Duration</p>
                <p className="text-[#1A261C] font-bold text-sm mt-0.5">{activeResponse.detectedScenario} ({activeResponse.duration})</p>
              </div>

              {/* Impact Grid */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                {activeResponse.impacts.map((imp: any, i: number) => (
                  <div key={i} className="bg-white p-2.5 rounded-xl border border-slate-200">
                    <span className="text-slate-500 text-[9px] block uppercase font-sans">{imp.label}</span>
                    <span className={`font-bold text-sm ${imp.color}`}>{imp.value}</span>
                  </div>
                ))}
              </div>

              <div className="bg-white p-3 rounded-xl border border-slate-200">
                <span className="text-slate-500 text-[10px] uppercase block font-bold font-sans">Recommended Mitigation Strategy</span>
                <p className="text-slate-800 mt-1 font-sans font-medium">{activeResponse.recommendation}</p>
              </div>

              <button
                onClick={() => {
                  onTriggerScenario('facility-shutdown');
                  onClose();
                }}
                className="w-full bg-[#2E4D37] hover:bg-[#233D2B] text-white font-extrabold text-xs py-2.5 rounded-xl shadow-xs transition-all flex items-center justify-center space-x-2"
              >
                <Play size={14} className="fill-white" />
                <span>SIMULATE DETECTED SCENARIO NOW</span>
              </button>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="pt-4 border-t border-[#F0F4F0]">
          <div className="relative flex items-center">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask WasteWise anything about city waste flow..."
              className="w-full bg-[#F7F9F7] border border-slate-300 focus:border-[#2E4D37] rounded-xl py-3 pl-4 pr-12 text-slate-900 text-xs font-sans focus:outline-none placeholder-slate-400"
            />
            <button
              onClick={() => handleSend()}
              className="absolute right-2 p-2 bg-[#2E4D37] hover:bg-[#233D2B] text-white rounded-lg transition-colors"
            >
              <Send size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
