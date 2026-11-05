import React, { createContext, useContext, useState, useEffect } from 'react';
import { ReelEvent, AccountabilityPartner, DispatchedAlert, AppSettings } from '../types';

interface AppContextType {
  events: ReelEvent[];
  partner: AccountabilityPartner;
  settings: AppSettings;
  alerts: DispatchedAlert[];
  currentReelIndex: number;
  isSimulatorActive: boolean;
  addReelEvent: (event: ReelEvent) => void;
  updatePartner: (partner: Partial<AccountabilityPartner>) => void;
  updateSettings: (settings: Partial<AppSettings>) => void;
  triggerManualAlert: () => Promise<void>;
  resetToday: () => void;
  setIsSimulatorActive: (active: boolean) => void;
  setCurrentReelIndex: (idx: number) => void;
}

const INITIAL_EVENTS: ReelEvent[] = [
  { id: '1', platform: 'Instagram Reels', timestamp: Date.now() - 3600000 * 2.5, dwellDurationMs: 3200, estimatedLengthMs: 60000, wasSkippedEarly: true, isMicroSkip: false, topic: 'Viral Dance Trend' },
  { id: '2', platform: 'Instagram Reels', timestamp: Date.now() - 3600000 * 2.4, dwellDurationMs: 1800, estimatedLengthMs: 60000, wasSkippedEarly: true, isMicroSkip: true, topic: 'Street Interview' },
  { id: '3', platform: 'Instagram Reels', timestamp: Date.now() - 3600000 * 2.3, dwellDurationMs: 8400, estimatedLengthMs: 60000, wasSkippedEarly: true, isMicroSkip: false, topic: 'Cooking Hack' },
  { id: '4', platform: 'Instagram Reels', timestamp: Date.now() - 3600000 * 2.2, dwellDurationMs: 2100, estimatedLengthMs: 60000, wasSkippedEarly: true, isMicroSkip: true, topic: 'Meme Compilation' },
  { id: '5', platform: 'YouTube Shorts', timestamp: Date.now() - 3600000 * 1.8, dwellDurationMs: 42000, estimatedLengthMs: 60000, wasSkippedEarly: false, isMicroSkip: false, topic: 'Science Explained' },
  { id: '6', platform: 'YouTube Shorts', timestamp: Date.now() - 3600000 * 1.7, dwellDurationMs: 4600, estimatedLengthMs: 60000, wasSkippedEarly: true, isMicroSkip: false, topic: 'Tech Review' },
  { id: '7', platform: 'Instagram Reels', timestamp: Date.now() - 3600000 * 1.1, dwellDurationMs: 1400, estimatedLengthMs: 60000, wasSkippedEarly: true, isMicroSkip: true, topic: 'Cat Video' },
  { id: '8', platform: 'Instagram Reels', timestamp: Date.now() - 3600000 * 1.0, dwellDurationMs: 6200, estimatedLengthMs: 60000, wasSkippedEarly: true, isMicroSkip: false, topic: 'Workout Routine' },
  { id: '9', platform: 'Instagram Reels', timestamp: Date.now() - 3600000 * 0.9, dwellDurationMs: 2900, estimatedLengthMs: 60000, wasSkippedEarly: true, isMicroSkip: true, topic: 'Standup Comedy Clip' },
  { id: '10', platform: 'Instagram Reels', timestamp: Date.now() - 3600000 * 0.8, dwellDurationMs: 15400, estimatedLengthMs: 60000, wasSkippedEarly: false, isMicroSkip: false, topic: 'Documentary Short' },
  { id: '11', platform: 'YouTube Shorts', timestamp: Date.now() - 3600000 * 0.5, dwellDurationMs: 2200, estimatedLengthMs: 60000, wasSkippedEarly: true, isMicroSkip: true, topic: 'Gaming Stream highlight' },
  { id: '12', platform: 'YouTube Shorts', timestamp: Date.now() - 3600000 * 0.4, dwellDurationMs: 5100, estimatedLengthMs: 60000, wasSkippedEarly: true, isMicroSkip: false, topic: 'History Trivia' },
  { id: '13', platform: 'Instagram Reels', timestamp: Date.now() - 3600000 * 0.2, dwellDurationMs: 3800, estimatedLengthMs: 60000, wasSkippedEarly: true, isMicroSkip: false, topic: 'Luxury Cars' },
  { id: '14', platform: 'Instagram Reels', timestamp: Date.now() - 3600000 * 0.1, dwellDurationMs: 1900, estimatedLengthMs: 60000, wasSkippedEarly: true, isMicroSkip: true, topic: 'Celebrity Gossip' },
];

const INITIAL_PARTNER: AccountabilityPartner = {
  name: 'Sarah (Mom)',
  phone: '+1 (555) 382-9014',
  role: 'Parent',
  relationshipTag: 'Mom',
  customTemplate: '🚨 NeuroGuard Alert: {user} just exceeded their daily limit of {limit} Reels ({watched} watched today). Their average attention span dropped to {avg_span}s with {boredom_pct}% skipped out of boredom. Please call them to keep them focused!',
  autoSmsEnabled: true,
  whatsappEnabled: true
};

const INITIAL_SETTINGS: AppSettings = {
  dailyReelLimit: 15,
  maxDailyMinutes: 20,
  hardLockoutAfterLimit: true,
  enableFloatingHud: true,
  vibrateOnScroll: true,
  hudPosition: { x: 24, y: 140 }
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [events, setEvents] = useState<ReelEvent[]>(() => {
    const saved = localStorage.getItem('neuroguard_events');
    return saved ? JSON.parse(saved) : INITIAL_EVENTS;
  });

  const [partner, setPartner] = useState<AccountabilityPartner>(() => {
    const saved = localStorage.getItem('neuroguard_partner');
    return saved ? JSON.parse(saved) : INITIAL_PARTNER;
  });

  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem('neuroguard_settings');
    return saved ? JSON.parse(saved) : INITIAL_SETTINGS;
  });

  const [alerts, setAlerts] = useState<DispatchedAlert[]>(() => {
    const saved = localStorage.getItem('neuroguard_alerts');
    return saved ? JSON.parse(saved) : [];
  });

  const [currentReelIndex, setCurrentReelIndex] = useState(0);
  const [isSimulatorActive, setIsSimulatorActive] = useState(false);

  useEffect(() => {
    localStorage.setItem('neuroguard_events', JSON.stringify(events));
  }, [events]);

  useEffect(() => {
    localStorage.setItem('neuroguard_partner', JSON.stringify(partner));
  }, [partner]);

  useEffect(() => {
    localStorage.setItem('neuroguard_settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('neuroguard_alerts', JSON.stringify(alerts));
  }, [alerts]);

  const addReelEvent = (event: ReelEvent) => {
    setEvents((prev) => {
      const updated = [event, ...prev];
      // Check if threshold reached
      if (updated.length === settings.dailyReelLimit) {
        dispatchAlert(updated.length, partner, settings, updated);
      }
      return updated;
    });
  };

  const dispatchAlert = async (
    count: number,
    currentPartner: AccountabilityPartner,
    currentSettings: AppSettings,
    allEvents: ReelEvent[]
  ) => {
    const totalDwell = allEvents.reduce((acc, curr) => acc + curr.dwellDurationMs, 0);
    const avgSpan = (totalDwell / allEvents.length / 1000).toFixed(1);
    const boredomCount = allEvents.filter((e) => e.wasSkippedEarly).length;
    const boredomPct = Math.round((boredomCount / allEvents.length) * 100);

    const messageText = currentPartner.customTemplate
      .replace('{user}', 'You')
      .replace('{limit}', currentSettings.dailyReelLimit.toString())
      .replace('{watched}', count.toString())
      .replace('{avg_span}', avgSpan)
      .replace('{boredom_pct}', boredomPct.toString());

    const newAlert: DispatchedAlert = {
      id: `alert_${Date.now()}`,
      timestamp: Date.now(),
      partnerName: currentPartner.name,
      partnerRole: currentPartner.role,
      partnerPhone: currentPartner.phone,
      reelsWatched: count,
      dailyLimit: currentSettings.dailyReelLimit,
      avgAttentionSec: Number(avgSpan),
      boredomRate: boredomPct,
      messageText,
      status: 'DELIVERED'
    };

    setAlerts((prev) => [newAlert, ...prev]);

    // Send to optional backend webhook if reachable
    try {
      await fetch('http://localhost:3001/api/accountability/alert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          partnerName: currentPartner.name,
          partnerPhone: currentPartner.phone,
          partnerRole: currentPartner.role,
          totalWatched: count,
          dailyLimit: currentSettings.dailyReelLimit,
          averageAttentionSpanSec: Number(avgSpan),
          boredomRate: boredomPct,
          message: messageText,
          timestamp: Date.now()
        })
      });
    } catch {
      // Backend optional for local UI demo
    }
  };

  const triggerManualAlert = async () => {
    await dispatchAlert(events.length, partner, settings, events);
  };

  const updatePartner = (updates: Partial<AccountabilityPartner>) => {
    setPartner((prev) => ({ ...prev, ...updates }));
  };

  const updateSettings = (updates: Partial<AppSettings>) => {
    setSettings((prev) => ({ ...prev, ...updates }));
  };

  const resetToday = () => {
    setEvents([]);
  };

  return (
    <AppContext.Provider
      value={{
        events,
        partner,
        settings,
        alerts,
        currentReelIndex,
        isSimulatorActive,
        addReelEvent,
        updatePartner,
        updateSettings,
        triggerManualAlert,
        resetToday,
        setIsSimulatorActive,
        setCurrentReelIndex
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
