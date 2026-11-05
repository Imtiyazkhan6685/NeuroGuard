export type Platform = 'Instagram Reels' | 'YouTube Shorts';

export interface ReelEvent {
  id: string;
  platform: Platform;
  timestamp: number;
  dwellDurationMs: number;
  estimatedLengthMs: number; // e.g. 60000 ms
  wasSkippedEarly: boolean;   // < 10s
  isMicroSkip: boolean;       // < 3s (compulsive dopamine flick)
  topic?: string;
}

export type PartnerRole = 'Parent' | 'Best Friend' | 'Partner' | 'Sibling' | 'Mentor';

export interface AccountabilityPartner {
  id: string;
  name: string;
  phone: string;
  role: PartnerRole;
  relationshipTag: string;
  selected: boolean; // whether this contact will receive automated alerts
  customTemplate?: string;
}

export interface DispatchedAlert {
  id: string;
  timestamp: number;
  partnerName: string;
  partnerRole: string;
  partnerPhone: string;
  reelsWatched: number;
  dailyLimit: number;
  avgAttentionSec: number;
  boredomRate: number;
  messageText: string;
  status: 'DELIVERED' | 'QUEUED' | 'SIMULATED';
}

export interface AppSettings {
  dailyReelLimit: number;
  maxDailyMinutes: number;
  hardLockoutAfterLimit: boolean;
  enableFloatingHud: boolean;
  vibrateOnScroll: boolean;
  hudPosition: { x: number; y: number };
}

export interface NativeStats {
  reelsWatched: number;
  instagramCount: number;
  youtubeCount: number;
  dailyLimit: number;
  totalMinutes?: number;
  maxDailyMinutes?: number;
  streakDays?: number;
  history7Days?: string;
  avgAttentionSpan: number;
  boredomRate: number;
  microSkips: number;
  hasOverlayPermission: boolean;
  hasAccessibilityPermission: boolean;
  hasSmsPermission: boolean;
  partnersJson?: string;
}
