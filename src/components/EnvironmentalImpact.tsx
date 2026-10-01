import React from 'react';
import { Leaf, Wind, Info, Truck, Fuel } from 'lucide-react';
import { useNetworkState } from '../state/networkState';

export const EnvironmentalImpact: React.FC = () => {
  const { networkState, analysis, dataServiceStatus } = useNetworkState();
  const { healthScore, co2MitigatedMonthlyTonnes, emissionSources } = analysis.environmentalMetrics;
  const recoveryRate = analysis.flowResult.recoveryRatePct;
  const airQuality = networkState.airQuality;
  const aqStatus = dataServiceStatus.airQuality;

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#D8E2D9] pb-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#2E4D37]">
            ENVIRONMENTAL IMPACT DASHBOARD
          </h1>
          <p className="text-xs text-[#526355] mt-0.5 font-medium">
            Decarbonization analytics, transport emissions & ambient air quality context
          </p>
        </div>
      </div>

      {/* AMBIENT AIR QUALITY CONTEXT CARD (API #4 OPENAQ) */}
      <div className="bg-white border border-[#D8E2D9] rounded-2xl p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Wind size={18} className="text-emerald-700" />
            <h3 className="font-extrabold text-[#1A261C] text-sm uppercase tracking-wider">
              LOCAL AMBIENT AIR QUALITY CONTEXT
            </h3>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
            {aqStatus.status === 'live' ? 'LIVE OpenAQ' : 'AMBIENT BASELINE'}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div className="bg-[#EDF2EE] border border-[#D5E0D5] p-3 rounded-xl text-center">
            <span className="text-[10px] text-slate-500 block uppercase font-mono">PM2.5</span>
            <span className="text-lg font-black text-[#1A261C] font-mono-num">{airQuality?.pm2_5 || 48.5} µg/m³</span>
          </div>
          <div className="bg-[#EDF2EE] border border-[#D5E0D5] p-3 rounded-xl text-center">
            <span className="text-[10px] text-slate-500 block uppercase font-mono">PM10</span>
            <span className="text-lg font-black text-[#1A261C] font-mono-num">{airQuality?.pm10 || 86.2} µg/m³</span>
          </div>
          <div className="bg-[#EDF2EE] border border-[#D5E0D5] p-3 rounded-xl text-center">
            <span className="text-[10px] text-slate-500 block uppercase font-mono">NO₂</span>
            <span className="text-lg font-black text-[#1A261C] font-mono-num">{airQuality?.no2 || 34.1} µg/m³</span>
          </div>
          <div className="bg-[#EDF2EE] border border-[#D5E0D5] p-3 rounded-xl text-center">
            <span className="text-[10px] text-slate-500 block uppercase font-mono">CO</span>
            <span className="text-lg font-black text-[#1A261C] font-mono-num">{airQuality?.co || 0.85} mg/m³</span>
          </div>
          <div className="bg-[#EDF2EE] border border-[#D5E0D5] p-3 rounded-xl text-center">
            <span className="text-[10px] text-slate-500 block uppercase font-mono">Status</span>
            <span className="text-sm font-extrabold text-emerald-700 block mt-0.5">{airQuality?.label || 'Moderate'}</span>
          </div>
        </div>

        <div className="flex items-center space-x-1.5 text-[11px] text-slate-500 bg-slate-50 p-2 rounded-lg border border-slate-200">
          <Info size={14} className="text-slate-400 shrink-0" />
          <span>
            <strong>Disclaimer:</strong> {airQuality?.disclaimer || 'Ambient air-quality context observation. Transport and facility emissions correlate with environmental context without direct causal attribution.'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* SCORE GAUGE (5 COLS) */}
        <div className="lg:col-span-5 bg-white border border-[#D8E2D9] rounded-2xl p-6 shadow-xs flex flex-col items-center justify-center text-center space-y-4">
          <div className="text-xs font-bold text-[#526355] uppercase tracking-wider">
            ENVIRONMENTAL HEALTH SCORE
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
                strokeDashoffset={452 - (452 * healthScore) / 100}
                strokeLinecap="round"
                className="transition-all duration-1000"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-black text-[#1A261C] font-mono-num">{healthScore}</span>
              <span className="text-xs text-slate-500 font-mono">/ 100</span>
            </div>
          </div>

          <div className="bg-[#F7F9F7] p-3 rounded-xl border border-[#D8E2D9] text-xs font-sans space-y-1 w-full">
            <p className="text-[#2E4D37] font-bold uppercase">GRADE: EXCELLENT RECOVERY</p>
            <p className="text-slate-600 text-[11px]">
              {recoveryRate}% material diversion rate mitigates {co2MitigatedMonthlyTonnes.toLocaleString()} tonnes CO₂e per month.
            </p>
          </div>
        </div>

        {/* EMISSIONS BREAKDOWN (7 COLS) */}
        <div className="lg:col-span-7 bg-white border border-[#D8E2D9] rounded-2xl p-6 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-[#F0F4F0] pb-3">
            <div className="flex items-center space-x-2">
              <Leaf size={18} className="text-[#2E4D37]" />
              <span className="text-xs font-bold text-[#1A261C] uppercase tracking-wider">
                WHERE EMISSIONS COME FROM
              </span>
            </div>
            <span className="text-[10px] font-mono text-slate-500">TOTAL: {co2MitigatedMonthlyTonnes.toLocaleString()} t CO₂e</span>
          </div>

          <div className="space-y-4">
            {emissionSources.map((source, i) => (
              <div key={i} className="bg-[#F7F9F7] border border-[#D8E2D9] rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between text-xs font-sans">
                  <span className="font-bold text-slate-800">{source.label}</span>
                  <span className="font-bold text-[#1A261C]">{source.pct}%</span>
                </div>

                <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${source.color} transition-all duration-1000`}
                    style={{ width: `${source.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* OSRM Transport Distance & Fuel Metrics */}
          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-[#F0F4F0]">
            <div className="bg-[#EDF2EE] p-3 rounded-xl flex items-center space-x-3">
              <Truck size={18} className="text-[#2E4D37]" />
              <div>
                <span className="text-[10px] text-slate-500 block">Fleet Distance (OSRM)</span>
                <span className="text-sm font-bold text-[#1A261C]">{analysis.flowResult.totalDistanceKm.toLocaleString()} km/day</span>
              </div>
            </div>
            <div className="bg-[#EDF2EE] p-3 rounded-xl flex items-center space-x-3">
              <Fuel size={18} className="text-[#2E4D37]" />
              <div>
                <span className="text-[10px] text-slate-500 block">Diesel Burn</span>
                <span className="text-sm font-bold text-[#1A261C]">{analysis.flowResult.totalFuelUsedLiters.toLocaleString()} L/day</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
