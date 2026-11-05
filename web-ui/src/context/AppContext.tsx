import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { ReelEvent, AccountabilityPartner, DispatchedAlert, AppSettings, NativeStats } from '../types';
import { fetchNativeStats, savePartnersToNative, recordNativeSwipe, isNativeAndroid, NativeScrollGuard } from '../lib/nativeBridge';

interface AppContextType {
  events: ReelEvent[];
  partners: AccountabilityPartner[];
  partner: AccountabilityPartner; // Primary selected partner
  selectedPartners: AccountabilityPartner[];
  settings: AppSettings;
  alerts: DispatchedAlert[];
  nativeStats: NativeStats | null;
  currentReelIndex: number;
  isSimulatorActive: boolean;
  instagramCount: number;
  youtubeCount: number;
  addReelEvent: (event: ReelEvent) => void;
  addPartner: (partner: Omit<AccountabilityPartner, 'id'>) => void;
  removePartner: (id: string) => void;
  updatePartner: (id: string, updates: Partial<AccountabilityPartner>) => void;
  togglePartnerSelected: (id: string) => void;
  selectPreset: (preset: 'all' | 'friends' | 'parents' | 'none') => void;
  updateSettings: (settings: Partial<AppSettings>) => void;
  triggerManualAlert: () => Promise<void>;
  resetToday: () => void;
  setIsSimulatorActive: (active: boolean) => void;
  setCurrentReelIndex: (idx: number) => void;
  syncNativeStats: () => Promise<void>;
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

const INITIAL_PARTNERS: AccountabilityPartner[] = [
  {
    id: 'partner_1',
    name: 'Sarah (Mom)',
    phone: '+1 (555) 382-9014',
    role: 'Parent',
    relationshipTag: 'Mom',
    selected: true,
    customTemplate: '🚨 NeuroGuard Alert: {user} just exceeded their daily limit of {limit} Reels ({watched} watched today). Please check in!'
  },
  {
    id: 'partner_2',
    name: 'Alex (Best Friend)',
    phone: '+1 (555) 987-6543',
    role: 'Best Friend',
    relationshipTag: 'Best Friend',
    selected: true,
    customTemplate: '🚨 NeuroGuard Alert: Your friend reached their {limit} reel quota! Average focus: {avg_span}s ({boredom_pct}% boredom skips). Tell them to put their phone down!'
  },
  {
    id: 'partner_3',
    name: 'Dad',
    phone: '+1 (555) 234-5678',
    role: 'Parent',
    relationshipTag: 'Dad',
    selected: false,
    customTemplate: ''
  },
  {
    id: 'partner_4',
    name: 'Maya (Partner)',
    phone: '+1 (555) 876-5432',
    role: 'Partner',
    relationshipTag: 'Partner',
    selected: false,
    customTemplate: ''
  }
];

const INITIAL_SETTINGS: AppSettings = {
  dailyReelLimit: 20,
  maxDailyMinutes: 30,
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

  const [partners, setPartners] = useState<AccountabilityPartner[]>(() => {
    const saved = localStorage.getItem('neuroguard_partners_list');
    return saved ? JSON.parse(saved) : INITIAL_PARTNERS;
  });

  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem('neuroguard_settings');
    return saved ? JSON.parse(saved) : INITIAL_SETTINGS;
  });

  const [alerts, setAlerts] = useState<DispatchedAlert[]>(() => {
    const saved = localStorage.getItem('neuroguard_alerts');
    return saved ? JSON.parse(saved) : [];
  });

  const [nativeStats, setNativeStats] = useState<NativeStats | null>(null);
  const [currentReelIndex, setCurrentReelIndex] = useState(0);
  const [isSimulatorActive, setIsSimulatorActive] = useState(false);

  // Sync with native Android on launch and every 3 seconds
  const syncNativeStats = useCallback(async () => {
    const stats = await fetchNativeStats();
    if (stats) {
      setNativeStats(stats);
      if (stats.dailyLimit && stats.dailyLimit !== settings.dailyReelLimit) {
        setSettings((prev) => ({ ...prev, dailyReelLimit: stats.dailyLimit }));
      }
    }
  }, [settings.dailyReelLimit]);

  useEffect(() => {
    syncNativeStats();
    const interval = setInterval(syncNativeStats, 3000);
    return () => clearInterval(interval);
  }, [syncNativeStats]);

  // Persist local state
  useEffect(() => {
    localStorage.setItem('neuroguard_events', JSON.stringify(events));
  }, [events]);

  useEffect(() => {
    localStorage.setItem('neuroguard_partners_list', JSON.stringify(partners));
    // Also save to native Android shared prefs
    savePartnersToNative(JSON.stringify(partners));
  }, [partners]);

  useEffect(() => {
    localStorage.setItem('neuroguard_settings', JSON.stringify(settings));
    if (isNativeAndroid()) {
      NativeScrollGuard.setDailyLimit({ limit: settings.dailyReelLimit }).catch(() => {});
    }
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('neuroguard_alerts', JSON.stringify(alerts));
  }, [alerts]);

  const selectedPartners = partners.filter((p) => p.selected);
  const partner = selectedPartners[0] || partners[0] || INITIAL_PARTNERS[0];

  const instagramCount = events.filter((e) => e.platform === 'Instagram Reels').length;
  const youtubeCount = events.filter((e) => e.platform === 'YouTube Shorts').length;

  const addReelEvent = (event: ReelEvent) => {
    setEvents((prev) => {
      const updated = [event, ...prev];
      if (updated.length === settings.dailyReelLimit) {
        dispatchAlertsToAllSelected(updated.length, selectedPartners, settings, updated);
      }
      return updated;
    });

    // Sync simulated swipe to native Android if on device
    if (isNativeAndroid()) {
      recordNativeSwipe(event.platform);
    }
  };

  const dispatchAlertsToAllSelected = async (
    count: number,
    recipients: AccountabilityPartner[],
    currentSettings: AppSettings,
    allEvents: ReelEvent[]
  ) => {
    const totalDwell = allEvents.reduce((acc, curr) => acc + curr.dwellDurationMs, 0);
    const avgSpan = (totalDwell / (allEvents.length || 1) / 1000).toFixed(1);
    const boredomCount = allEvents.filter((e) => e.wasSkippedEarly).length;
    const boredomPct = Math.round((boredomCount / (allEvents.length || 1)) * 100);

    const targetList = recipients.length > 0 ? recipients : [partners[0]];
    const newAlerts: DispatchedAlert[] = [];

    for (const p of targetList) {
      if (!p.phone || p.phone.trim() === '') continue;

      const template = p.customTemplate && p.customTemplate.trim() !== ''
        ? p.customTemplate
        : `🚨 NeuroGuard Alert: Your partner hit their quota of ${currentSettings.dailyReelLimit} reels (${count} watched today: ${instagramCount} IG, ${youtubeCount} YT). Attention span: ${avgSpan}s (${boredomPct}% boredom). Please call them!`;

      const messageText = template
        .replace('{user}', 'Your partner')
        .replace('{limit}', currentSettings.dailyReelLimit.toString())
        .replace('{watched}', count.toString())
        .replace('{avg_span}', avgSpan)
        .replace('{boredom_pct}', boredomPct.toString());

      newAlerts.push({
        id: `alert_${Date.now()}_${p.id}`,
        timestamp: Date.now(),
        partnerName: p.name,
        partnerRole: p.role,
        partnerPhone: p.phone,
        reelsWatched: count,
        dailyLimit: currentSettings.dailyReelLimit,
        avgAttentionSec: Number(avgSpan),
        boredomRate: boredomPct,
        messageText,
        status: 'DELIVERED'
      });
    }

    if (newAlerts.length > 0) {
      setAlerts((prev) => [...newAlerts, ...prev]);
    }

    // Trigger native SMS dispatch via Android SmsManager
    if (isNativeAndroid()) {
      try {
        await NativeScrollGuard.triggerTestAlert();
      } catch (e) {
        console.warn('Native alert dispatch error:', e);
      }
    }
  };

  const triggerManualAlert = async () => {
    await dispatchAlertsToAllSelected(events.length, selectedPartners, settings, events);
  };

  const addPartner = (newP: Omit<AccountabilityPartner, 'id'>) => {
    const created: AccountabilityPartner = {
      ...newP,
      id: `partner_${Date.now()}`
    };
    setPartners((prev) => [...prev, created]);
  };

  const removePartner = (id: string) => {
    setPartners((prev) => prev.filter((p) => p.id !== id));
  };

  const updatePartner = (id: string, updates: Partial<AccountabilityPartner>) => {
    setPartners((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
    );
  };

  const togglePartnerSelected = (id: string) => {
    setPartners((prev) =>
      prev.map((p) => (p.id === id ? { ...p, selected: !p.selected } : p))
    );
  };

  const selectPreset = (preset: 'all' | 'friends' | 'parents' | 'none') => {
    setPartners((prev) =>
      prev.map((p) => {
        if (preset === 'all') return { ...p, selected: true };
        if (preset === 'none') return { ...p, selected: false };
        if (preset === 'friends') return { ...p, selected: p.role === 'Best Friend' || p.role === 'Partner' };
        if (preset === 'parents') return { ...p, selected: p.role === 'Parent' };
        return p;
      })
    );
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
        partners,
        partner,
        selectedPartners,
        settings,
        alerts,
        nativeStats,
        currentReelIndex,
        isSimulatorActive,
        instagramCount,
        youtubeCount,
        addReelEvent,
        addPartner,
        removePartner,
        updatePartner,
        togglePartnerSelected,
        selectPreset,
        updateSettings,
        triggerManualAlert,
        resetToday,
        setIsSimulatorActive,
        setCurrentReelIndex,
        syncNativeStats
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
