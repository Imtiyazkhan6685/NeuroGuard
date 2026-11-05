import React from 'react';
import { Activity, Users, LineChart, Sliders } from 'lucide-react';

export type TabKey = 'activity' | 'accountability' | 'trends' | 'settings';

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
    { key: 'activity', label: 'Activity', icon: Activity, badge: `${reelsCount}/${limit}` },
    { key: 'accountability', label: 'Sharing', icon: Users },
    { key: 'trends', label: 'Trends', icon: LineChart },
    { key: 'settings', label: 'Settings', icon: Sliders },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto z-40 px-4 pb-6 pt-2 pointer-events-none">
      <div className="pointer-events-auto rounded-[32px] bg-[#121214]/90 backdrop-blur-2xl p-1.5 flex items-center justify-around shadow-2xl border border-white/[0.08]">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => onChangeTab(tab.key)}
              className={`relative flex flex-col items-center justify-center py-2 px-5 rounded-2xl transition-all duration-200 ${
                isActive ? 'text-white bg-white/10 shadow-sm' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110' : 'scale-100'}`} />
                {tab.badge && (
                  <span className={`absolute -top-1.5 -right-3 text-[9px] font-bold px-1.5 py-0.2 rounded-full border border-black ${
                    reelsCount >= limit ? 'bg-[#FA114F] text-white animate-pulse' : 'bg-zinc-700 text-zinc-200'
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className={`text-[10px] mt-1 tracking-tight font-medium ${isActive ? 'text-white font-bold' : 'text-zinc-500'}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
