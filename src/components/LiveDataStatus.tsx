import React from 'react';
import { Activity, RefreshCw, CheckCircle2, AlertTriangle, ShieldCheck, Database, Navigation, CloudSun, Wind, Truck } from 'lucide-react';
import { useNetworkState } from '../state/networkState';

export const LiveDataStatus: React.FC = () => {
  const { dataServiceStatus, refreshApiData } = useNetworkState();
  const [isRefreshing, setIsRefreshing] = React.useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshApiData();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'live':
        return (
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
            <span>LIVE</span>
          </span>
        );
      case 'cached':
        return (
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-100 text-amber-800 border border-amber-300">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-600"></span>
            <span>CACHED</span>
          </span>
        );
      case 'simulated':
        return (
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-sky-100 text-sky-800 border border-sky-300">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-600"></span>
            <span>SIMULATED</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-slate-100 text-slate-700 border border-slate-300">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-500"></span>
            <span>FALLBACK</span>
          </span>
        );
    }
  };

  const services = [
    {
      name: 'Weather Observations',
      icon: CloudSun,
      provider: dataServiceStatus.weather.provider,
      status: dataServiceStatus.weather.status,
      note: dataServiceStatus.weather.note || 'Open-Meteo API'
    },
    {
      name: 'Road Network & Matrix',
      icon: Navigation,
      provider: dataServiceStatus.routing.provider,
      status: dataServiceStatus.routing.status,
      note: dataServiceStatus.routing.note || 'OSRM Routing Engine'
    },
    {
      name: 'Municipal Waste Data',
      icon: Database,
      provider: dataServiceStatus.wasteData.provider,
      status: dataServiceStatus.wasteData.status,
      note: dataServiceStatus.wasteData.note || 'data.gov.in / CPCB'
    },
    {
      name: 'Ambient Air Quality',
      icon: Wind,
      provider: dataServiceStatus.airQuality.provider,
      status: dataServiceStatus.airQuality.status,
      note: dataServiceStatus.airQuality.note || 'OpenAQ Sensor Layer'
    },
    {
      name: 'Traffic & Corridor Speed',
      icon: Truck,
      provider: dataServiceStatus.traffic.provider,
      status: dataServiceStatus.traffic.status,
      note: dataServiceStatus.traffic.note || 'Simulated Traffic Provider'
    }
  ];

  return (
    <div className="bg-white rounded-2xl p-5 border border-[#D5E0D5] shadow-xs hover:shadow-sm transition-all">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Activity size={18} className="text-[#2E4D37]" />
          <h3 className="font-extrabold text-[#1A261C] text-sm tracking-tight">LIVE DATA INTEGRATION PIPELINE</h3>
        </div>
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="flex items-center space-x-1.5 text-xs text-[#2E4D37] hover:text-[#1A261C] bg-[#EDF2EE] hover:bg-[#E2EBE3] px-2.5 py-1 rounded-lg font-semibold transition-all border border-[#D5E0D5]"
        >
          <RefreshCw size={13} className={isRefreshing ? 'animate-spin' : ''} />
          <span>Sync APIs</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
        {services.map((svc, idx) => {
          const IconComp = svc.icon;
          return (
            <div key={idx} className="bg-[#EDF2EE]/60 border border-[#D8E2D9] rounded-xl p-3 flex flex-col justify-between space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1.5 text-xs font-bold text-[#1A261C]">
                  <IconComp size={14} className="text-[#2E4D37]" />
                  <span className="truncate">{svc.name}</span>
                </div>
              </div>
              <div className="text-[11px] font-mono text-slate-600 truncate" title={svc.provider}>
                {svc.provider}
              </div>
              <div className="flex items-center justify-between pt-1 border-t border-[#D5E0D5]/50">
                {getStatusBadge(svc.status)}
                <span className="text-[10px] text-slate-500 font-mono">OK</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
