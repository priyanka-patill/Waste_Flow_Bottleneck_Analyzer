import React from 'react';
import { 
  MapPin, 
  CloudRain, 
  Wind,
  Bell, 
  Sparkles, 
  Play, 
  Calendar,
  Layers,
  Home,
  User,
  ChevronDown
} from 'lucide-react';
import { useNetworkState } from '../state/networkState';

interface TopBarProps {
  onOpenCopilot: () => void;
  onStartDemo: () => void;
  collapsed: boolean;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  onOpenCopilot,
  onStartDemo,
  collapsed,
  activeTab,
  setActiveTab
}) => {
  const { networkState, dataServiceStatus } = useNetworkState();
  const weather = networkState.weather;
  const weatherStatus = dataServiceStatus.weather;

  const formattedTime = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  const formattedDate = new Date().toLocaleDateString('en-IN', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' });

  return (
    <header className={`fixed top-0 right-0 z-30 h-16 bg-[#EDF2EE]/90 backdrop-blur-md border-b border-[#D8E2D9] transition-all duration-300 flex items-center justify-between px-6 ${
      collapsed ? 'left-16' : 'left-64'
    }`}>
      {/* Left Region & Telemetry Metadata */}
      <div className="flex items-center space-x-4">
        {/* Location Picker */}
        <button className="flex items-center space-x-2 bg-white border border-[#D5E0D5] px-3.5 py-1.5 rounded-xl shadow-xs text-xs font-bold text-[#1A261C] hover:bg-slate-50 transition-colors">
          <MapPin size={14} className="text-[#2E4D37]" />
          <span>Mumbai Metropolitan Region</span>
          <ChevronDown size={14} className="text-slate-500" />
        </button>

        {/* Date & Time display */}
        <div className="hidden md:flex items-center space-x-3 text-xs font-mono text-[#526355] bg-white/70 border border-[#D5E0D5] px-3 py-1.5 rounded-xl">
          <div className="flex items-center space-x-1.5">
            <Calendar size={13} className="text-[#3B6946]" />
            <span>{formattedDate}</span>
          </div>
          <span className="text-slate-300">|</span>
          <span className="font-bold text-[#1A261C]">{formattedTime}</span>
        </div>
      </div>

      {/* Right Header Metadata & Actions */}
      <div className="flex items-center space-x-3">
        {/* Live Weather Status from Open-Meteo */}
        <div className="hidden lg:flex items-center space-x-2.5 text-xs font-medium text-[#2E4D37] bg-white border border-[#D5E0D5] px-3 py-1.5 rounded-xl shadow-xs" title={weatherStatus.note}>
          <CloudRain size={16} className="text-sky-600 shrink-0" />
          <div className="flex flex-col text-left">
            <div className="flex items-center space-x-1.5">
              <span className="font-bold text-[#1A261C]">{weather ? `${weather.temperature}°C` : '28°C'}</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded font-mono font-bold bg-sky-100 text-sky-800">
                {weatherStatus.status === 'live' ? 'LIVE Open-Meteo' : 'CACHED'}
              </span>
            </div>
            <div className="flex items-center space-x-2 text-[10px] text-slate-500">
              <span>{weather ? weather.conditionLabel : 'Monsoon Light Rain'}</span>
              <span>•</span>
              <span>Rain: {weather ? `${weather.rainMm} mm` : '4.2 mm'}</span>
              <span>•</span>
              <span className="flex items-center space-x-0.5"><Wind size={10} className="inline" /> {weather ? `${weather.windSpeedKmH} km/h` : '14 km/h'}</span>
            </div>
          </div>
        </div>

        {/* Landing Switcher */}
        <button
          onClick={() => setActiveTab(activeTab === 'landing' ? 'command' : 'landing')}
          className="flex items-center space-x-1.5 bg-white hover:bg-slate-50 border border-[#D5E0D5] text-[#2E4D37] text-xs px-3 py-1.5 rounded-xl font-semibold transition-colors shadow-xs"
        >
          {activeTab === 'landing' ? (
            <>
              <Layers size={14} className="text-[#2E4D37]" />
              <span>Dashboard View</span>
            </>
          ) : (
            <>
              <Home size={14} className="text-slate-600" />
              <span>Landing Page</span>
            </>
          )}
        </button>

        {/* Demo Mode Button */}
        <button
          onClick={onStartDemo}
          className="flex items-center space-x-1.5 bg-[#2E4D37] hover:bg-[#233D2B] text-white font-extrabold text-xs px-3.5 py-1.5 rounded-xl shadow-sm transition-all transform hover:scale-105"
        >
          <Play size={13} className="fill-white" />
          <span className="tracking-wide uppercase font-mono">⚡ HACKATHON DEMO</span>
        </button>

        {/* AI Copilot Button */}
        <button
          onClick={onOpenCopilot}
          className="flex items-center space-x-1.5 bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-900 text-xs px-3.5 py-1.5 rounded-xl transition-all shadow-xs"
        >
          <Sparkles size={14} className="text-purple-600" />
          <span className="font-bold font-mono uppercase">✦ ASK WASTEWISE</span>
        </button>

        {/* Alerts Bell */}
        <button className="relative p-2 bg-white hover:bg-slate-50 text-slate-700 rounded-xl border border-[#D5E0D5] transition-colors shadow-xs">
          <Bell size={16} />
          <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white text-[9px] font-bold font-mono rounded-full flex items-center justify-center">
            3
          </span>
        </button>

        {/* User Profile Avatar */}
        <button className="w-8 h-8 rounded-full bg-[#2E4D37] text-white flex items-center justify-center text-xs font-bold shadow-xs">
          <User size={16} />
        </button>
      </div>
    </header>
  );
};
