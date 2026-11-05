import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { IosHeader } from './components/IosHeader';
import { IosTabBar, TabKey } from './components/IosTabBar';
import { DashboardView } from './components/DashboardView';
import { AttentionAnalyticsView } from './components/AttentionAnalyticsView';
import { AccountabilityView } from './components/AccountabilityView';
import { SettingsView } from './components/SettingsView';

const MainContainer: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabKey>('activity');
  const { events, settings } = useApp();

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-start sm:py-6 selection:bg-[#FA114F]">
      {/* Mobile Device Container Frame */}
      <div className="w-full max-w-md min-h-screen sm:min-h-[860px] sm:max-h-[920px] bg-black sm:rounded-[52px] sm:border-[10px] sm:border-zinc-900 shadow-[0_25px_80px_-15px_rgba(0,0,0,0.95)] flex flex-col relative overflow-hidden ring-1 ring-white/10">
        
        {/* iOS Dynamic Island & Status Bar */}
        <IosHeader />

        {/* Tab Content Container */}
        <main className="flex-1 overflow-y-auto px-5 pt-3 pb-16 no-scrollbar">
          {activeTab === 'activity' && (
            <DashboardView
              onOpenAnalytics={() => setActiveTab('trends')}
              onOpenPartner={() => setActiveTab('accountability')}
            />
          )}

          {activeTab === 'trends' && <AttentionAnalyticsView />}

          {activeTab === 'accountability' && <AccountabilityView />}

          {activeTab === 'settings' && <SettingsView />}
        </main>

        {/* iOS Apple Fitness Style Tab Bar */}
        <IosTabBar
          activeTab={activeTab}
          onChangeTab={setActiveTab}
          reelsCount={events.length}
          limit={settings.dailyReelLimit}
        />

        {/* iOS Bottom Home Bar Indicator */}
        <div className="w-full flex justify-center pb-2 pt-1 pointer-events-none z-50">
          <div className="w-32 h-1 bg-white/20 rounded-full" />
        </div>
      </div>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AppProvider>
      <MainContainer />
    </AppProvider>
  );
};

export default App;
