import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { IosHeader } from './components/IosHeader';
import { IosTabBar, TabKey } from './components/IosTabBar';
import { DashboardView } from './components/DashboardView';
import { AttentionAnalyticsView } from './components/AttentionAnalyticsView';
import { AccountabilityView } from './components/AccountabilityView';
import { SettingsView } from './components/SettingsView';
import { OnboardingModal } from './components/OnboardingModal';
import { ProModal } from './components/ProModal';
import { isNativeAndroid } from './lib/nativeBridge';

const MainContainer: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabKey>('activity');
  const [showProModal, setShowProModal] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(() => {
    return localStorage.getItem('neuroguard_onboarding_completed') !== 'true';
  });

  const { totalReels, settings } = useApp();

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-start sm:py-6 selection:bg-[#FA114F]">
      {/* Mobile Device Frame */}
      <div className="w-full max-w-md min-h-screen sm:min-h-[860px] sm:max-h-[920px] bg-black sm:rounded-[52px] sm:border-[10px] sm:border-zinc-900 shadow-[0_25px_80px_-15px_rgba(0,0,0,0.95)] flex flex-col relative overflow-hidden ring-1 ring-white/10">
        
        {/* Sleek App Header with Streak & Brand */}
        <IosHeader onOpenPro={() => setShowProModal(true)} />

        {/* Tab Content Container */}
        <main className="flex-1 overflow-y-auto px-5 pt-3 pb-16 no-scrollbar">
          {activeTab === 'activity' && (
            <DashboardView
              onOpenAnalytics={() => setActiveTab('trends')}
              onOpenPartner={() => setActiveTab('accountability')}
              onOpenPro={() => setShowProModal(true)}
            />
          )}

          {activeTab === 'trends' && <AttentionAnalyticsView />}

          {activeTab === 'accountability' && <AccountabilityView />}

          {activeTab === 'settings' && (
            <SettingsView
              onOpenPro={() => setShowProModal(true)}
              onOpenOnboarding={() => setShowOnboarding(true)}
            />
          )}
        </main>

        {/* Apple Fitness Style Navigation Bar */}
        <IosTabBar
          activeTab={activeTab}
          onChangeTab={setActiveTab}
          reelsCount={totalReels}
          limit={settings.dailyReelLimit}
        />

        {/* Onboarding Flow Overlay */}
        {showOnboarding && (
          <OnboardingModal onComplete={() => setShowOnboarding(false)} />
        )}

        {/* Pro Monetization Modal */}
        {showProModal && (
          <ProModal onClose={() => setShowProModal(false)} />
        )}
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
