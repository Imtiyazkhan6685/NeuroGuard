import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { ReelEvent, AccountabilityPartner, DispatchedAlert, AppSettings, NativeStats } from '../types';
import {
  fetchNativeStats,
  savePartnersToNative,
  recordNativeSwipe,
  resetNativeToday,
  isNativeAndroid,
  NativeScrollGuard
} from '../lib/nativeBridge';

interface AppContextType {
  events: ReelEvent[];
  partners: AccountabilityPartner[];
  partner: AccountabilityPartner;
  selectedPartners: AccountabilityPartner[];
  settings: AppSettings;
  alerts: DispatchedAlert[];
  nativeStats: NativeStats | null;
  currentReelIndex: number;
  isSimulatorActive: boolean;
  totalReels: number;
  instagramCount: number;
  youtubeCount: number;
  totalMinutes: number;
  streakDays: number;
  isPro: boolean;
  setIsPro: (pro: boolean) => void;
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

const INITIAL_PARTNERS: AccountabilityPartner[] = [
  {
    id: 'partner_1',
    name: 'Sarah (Mom)',
    phone: '+1 (555) 382-9014',
    role: 'Parent',
    relationshipTag: 'Mom',
    selected: true,
    customTemplate: '🚨 NeuroGuard Alert: {user} just reached their limit of {limit} Reels ({watched} watched today). Please check in!'
  },
  {
    id: 'partner_2',
    name: 'Alex (Best Friend)',
    phone: '+1 (555) 987-6543',
    role: 'Best Friend',
    relationshipTag: 'Best Friend',
    selected: true,
    customTemplate: '🚨 NeuroGuard Alert: Your friend hit their {limit} reel quota! Average focus: {avg_span}s ({boredom_pct}% boredom skips). Tell them to put their phone down!'
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
    return saved ? JSON.parse(saved) : [];
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

  const [isPro, setIsPro] = useState<boolean>(() => {
    return localStorage.getItem('neuroguard_is_pro') === 'true';
  });

  const [nativeStats, setNativeStats] = useState<NativeStats | null>(null);
  const [currentReelIndex, setCurrentReelIndex] = useState(0);
  const [isSimulatorActive, setIsSimulatorActive] = useState(false);

  // Sync with native Android on launch and every 2.5 seconds
  const syncNativeStats = useCallback(async () => {
    const stats = await fetchNativeStats();
    if (stats) {
      setNativeStats(stats);
      if (stats.dailyLimit && stats.dailyLimit !== settings.dailyReelLimit) {
        setSettings((prev) => ({ ...prev, dailyReelLimit: stats.dailyLimit }));
      }
      if (stats.maxDailyMinutes && stats.maxDailyMinutes !== settings.maxDailyMinutes) {
        setSettings((prev) => ({ ...prev, maxDailyMinutes: stats.maxDailyMinutes || 30 }));
      }
    }
  }, [settings.dailyReelLimit, settings.maxDailyMinutes]);

  useEffect(() => {
    syncNativeStats();
    const interval = setInterval(syncNativeStats, 2500);
    return () => clearInterval(interval);
  }, [syncNativeStats]);

  // Persist state
  useEffect(() => {
    localStorage.setItem('neuroguard_events', JSON.stringify(events));
  }, [events]);

  useEffect(() => {
    localStorage.setItem('neuroguard_partners_list', JSON.stringify(partners));
    savePartnersToNative(JSON.stringify(partners));
  }, [partners]);

  useEffect(() => {
    localStorage.setItem('neuroguard_settings', JSON.stringify(settings));
    if (isNativeAndroid()) {
      NativeScrollGuard.setDailyLimit({ limit: settings.dailyReelLimit }).catch(() => {});
      NativeScrollGuard.setMaxDailyMinutes({ minutes: settings.maxDailyMinutes }).catch(() => {});
    }
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('neuroguard_alerts', JSON.stringify(alerts));
  }, [alerts]);

  useEffect(() => {
    localStorage.setItem('neuroguard_is_pro', isPro ? 'true' : 'false');
  }, [isPro]);

  const selectedPartners = partners.filter((p) => p.selected);
  const partner = selectedPartners[0] || partners[0] || INITIAL_PARTNERS[0];

  // Live unified calculations
  const totalReels = (nativeStats && nativeStats.reelsWatched !== undefined && isNativeAndroid())
    ? nativeStats.reelsWatched
    : events.length;

  const instagramCount = (nativeStats && nativeStats.instagramCount !== undefined && isNativeAndroid())
    ? nativeStats.instagramCount
    : events.filter((e) => e.platform === 'Instagram Reels').length;

  const youtubeCount = (nativeStats && nativeStats.youtubeCount !== undefined && isNativeAndroid())
    ? nativeStats.youtubeCount
    : events.filter((e) => e.platform === 'YouTube Shorts').length;

  const totalDwellMs = events.reduce((acc, curr) => acc + curr.dwellDurationMs, 0);
  const totalMinutes = (nativeStats && nativeStats.totalMinutes !== undefined && isNativeAndroid())
    ? nativeStats.totalMinutes
    : Math.round(totalDwellMs / 60000);

  const streakDays = (nativeStats && nativeStats.streakDays !== undefined && isNativeAndroid())
    ? nativeStats.streakDays
    : 3;

  const addReelEvent = (event: ReelEvent) => {
    setEvents((prev) => {
      const updated = [event, ...prev];
      if (updated.length === settings.dailyReelLimit) {
        dispatchAlertsToAllSelected(updated.length, selectedPartners, settings, updated);
      }
      return updated;
    });

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
        : `🚨 NeuroGuard Alert: Your partner reached their daily quota of ${currentSettings.dailyReelLimit} reels (${count} watched today: ${instagramCount} IG, ${youtubeCount} YT). Please call them!`;

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

    if (isNativeAndroid()) {
      try {
        await NativeScrollGuard.triggerTestAlert();
      } catch (e) {
        console.warn('Native alert dispatch error:', e);
      }
    }
  };

  const triggerManualAlert = async () => {
    await dispatchAlertsToAllSelected(totalReels, selectedPartners, settings, events);
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
    resetNativeToday();
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
        totalReels,
        instagramCount,
        youtubeCount,
        totalMinutes,
        streakDays,
        isPro,
        setIsPro,
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
