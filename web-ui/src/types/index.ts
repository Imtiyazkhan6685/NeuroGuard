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
  name: string;
  phone: string;
  role: PartnerRole;
  relationshipTag: string;
  customTemplate: string;
  autoSmsEnabled: boolean;
  whatsappEnabled: boolean;
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
