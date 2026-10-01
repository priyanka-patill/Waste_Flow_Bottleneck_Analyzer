import React from 'react';
import { 
  Activity, 
  Cpu, 
  Share2, 
  AlertTriangle, 
  GitBranch, 
  Sliders, 
  Zap, 
  Leaf, 
  Bookmark, 
  DollarSign, 
  History, 
  ChevronLeft, 
  ChevronRight,
  Flame,
  ShieldAlert,
  ChevronDown
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  openRecoveryModal: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  collapsed,
  setCollapsed,
  openRecoveryModal
}) => {
  const navItems = [
    { id: 'command', label: 'Dashboard', icon: Activity },
    { id: 'process-config', label: 'Process Config', icon: Sliders, badge: 'SETUP' },
    { id: 'live-network', label: 'Live Network', icon: Share2 },
    { id: 'bottlenecks', label: 'Bottlenecks', icon: AlertTriangle, badge: '1 CRITICAL' },
    { id: 'root-cause', label: 'Root Cause', icon: GitBranch },
    { id: 'what-if', label: 'What-If Lab', icon: Sliders },
    { id: 'optimization', label: 'Optimization', icon: Zap },
    { id: 'environmental', label: 'Environmental Impact', icon: Leaf },
    { id: 'landfill-runway', label: 'Landfill Runway', icon: Flame },
    { id: 'counterfactual', label: 'Counterfactual', icon: History },
    { id: 'scenarios', label: 'Scenario Library', icon: Bookmark },
    { id: 'intervention-roi', label: 'Intervention ROI', icon: DollarSign },
    { id: 'chaos-monkey', label: 'Chaos Monkey', icon: ShieldAlert, highlight: true }
  ];

  return (
    <aside 
      className={`fixed top-0 left-0 bottom-0 z-40 bg-gradient-to-b from-[#C5D5C5] via-[#BDCEBF] to-[#B2C5B3] border-r border-[#B0C2B2] transition-all duration-300 flex flex-col justify-between shadow-sm ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Top Header & Logo */}
      <div>
        <div className="h-20 flex items-center justify-between px-4 border-b border-[#B2C5B3]/60">
          {!collapsed && (
            <div className="flex items-center space-x-2.5 cursor-pointer" onClick={() => setActiveTab('command')}>
              <div className="w-9 h-9 rounded-xl bg-[#2E4D37] flex items-center justify-center text-white shadow-sm shrink-0">
                <Leaf size={20} className="fill-white" />
              </div>
              <div>
                <h1 className="font-extrabold tracking-tight text-[#1E3123] text-lg leading-tight">
                  WASTE<span className="text-[#3B6946]">WISE</span>
                </h1>
                <p className="text-[10px] text-[#485C4B] font-medium tracking-wide">
                  City Waste Intelligence
                </p>
              </div>
            </div>
          )}

          {collapsed && (
            <div className="w-9 h-9 rounded-xl bg-[#2E4D37] flex items-center justify-center text-white mx-auto">
              <Leaf size={20} className="fill-white" />
            </div>
          )}

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="text-[#2F4333] hover:text-[#1E3123] p-1 rounded hover:bg-[#B2C5B3]/50 transition-colors"
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>

        {/* Navigation List */}
        <nav className="p-3 space-y-1.5 overflow-y-auto max-h-[calc(100vh-210px)]">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center px-3 py-2.5 rounded-xl text-xs font-semibold transition-all group relative ${
                  isActive 
                    ? 'bg-[#2E4D37] text-white shadow-md' 
                    : item.highlight
                      ? 'text-rose-800 hover:bg-[#B2C5B3]/60'
                      : 'text-[#2F4333] hover:bg-[#B2C5B3]/50 hover:text-[#1E3123]'
                }`}
              >
                <Icon size={18} className={`shrink-0 ${isActive ? 'text-white' : item.highlight ? 'text-rose-700' : 'text-[#3B4E3E]'}`} />
                
                {!collapsed && (
                  <span className="ml-3 truncate tracking-wide">{item.label}</span>
                )}

                {!collapsed && item.badge && (
                  <span className="ml-auto bg-rose-600 text-white text-[9px] px-1.5 py-0.5 rounded font-mono font-bold animate-pulse">
                    {item.badge}
                  </span>
                )}

                {collapsed && (
                  <div className="absolute left-16 bg-[#1E3123] text-white px-2 py-1 rounded text-xs whitespace-nowrap z-50 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-xl">
                    {item.label}
                  </div>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom System Status & Profile */}
      <div className="p-3 border-t border-[#B2C5B3]/60 space-y-2">
        {!collapsed ? (
          <div className="space-y-2">
            {/* System Operational Card */}
            <div className="bg-[#D9E4DA]/80 border border-[#B8C8B9] rounded-xl p-2.5 flex items-center justify-between text-xs text-[#2F4333]">
              <div className="flex items-center space-x-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#3B6946] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#3B6946]"></span>
                </span>
                <span className="text-[11px] font-bold text-[#1E3123]">System Operational</span>
              </div>
              <span className="text-[9px] text-[#5C6E60] font-mono">2 min ago</span>
            </div>

            {/* Municipal Ops User Card */}
            <div className="bg-[#D9E4DA]/90 border border-[#B8C8B9] rounded-xl p-2.5 flex items-center justify-between cursor-pointer hover:bg-[#D0DDD0] transition-colors">
              <div className="flex items-center space-x-2.5 truncate">
                <div className="w-7 h-7 rounded-lg bg-[#2E4D37] flex items-center justify-center text-xs font-bold text-white shrink-0">
                  J
                </div>
                <div className="truncate">
                  <p className="text-[11px] font-bold text-[#1E3123] truncate">Municipal Ops</p>
                  <p className="text-[9px] text-[#5C6E60]">Mumbai Region</p>
                </div>
              </div>
              <ChevronRight size={14} className="text-[#3B4E3E] shrink-0" />
            </div>
          </div>
        ) : (
          <div className="flex justify-center">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#3B6946] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-[#3B6946]"></span>
            </span>
          </div>
        )}
      </div>
    </aside>
  );
};
