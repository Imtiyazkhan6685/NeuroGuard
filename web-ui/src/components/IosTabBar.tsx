import React from 'react';
import { LayoutDashboard, BrainCircuit, PlaySquare, ShieldAlert, Sliders } from 'lucide-react';

export type TabKey = 'dashboard' | 'analytics' | 'simulator' | 'accountability' | 'settings';

interface IosTabBarProps {
  activeTab: TabKey;
  onChangeTab: (tab: TabKey) => void;
  reelsCount: number;
  limit: number;
}

export const IosTabBar: React.FC<IosTabBarProps> = ({
  activeTab,
  onChangeTab,
  reelsCount,
  limit
}) => {
  const tabs: { key: TabKey; label: string; icon: React.FC<{ className?: string }>; badge?: string }[] = [
    { key: 'dashboard', label: 'Overview', icon: LayoutDashboard },
    { key: 'analytics', label: 'Attention', icon: BrainCircuit },
    { key: 'simulator', label: 'Live Test', icon: PlaySquare, badge: `${reelsCount}/${limit}` },
    { key: 'accountability', label: 'Partner', icon: ShieldAlert },
    { key: 'settings', label: 'Limits', icon: Sliders },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto z-40 px-4 pb-6 pt-2 pointer-events-none">
      <div className="pointer-events-auto ios-glass rounded-3xl p-1.5 flex items-center justify-around shadow-2xl border border-white/10">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => onChangeTab(tab.key)}
              className={`relative flex flex-col items-center justify-center py-2 px-3 rounded-2xl transition-all duration-200 ${
                isActive ? 'text-purple-400 bg-white/10 shadow-sm' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110' : 'scale-100'}`} />
                {tab.badge && (
                  <span className={`absolute -top-1.5 -right-3 text-[9px] font-bold px-1.5 py-0.2 rounded-full border border-black ${
                    reelsCount >= limit ? 'bg-red-500 text-white animate-pulse' : 'bg-purple-600 text-white'
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-1 font-medium tracking-tight">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
