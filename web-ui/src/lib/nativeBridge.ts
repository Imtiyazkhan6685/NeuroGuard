import { registerPlugin, Capacitor } from '@capacitor/core';

interface ScrollGuardPluginInterface {
  getNativeStats(): Promise<{
    reelsWatched: number;
    dailyLimit: number;
    avgAttentionSpan: number;
    boredomRate: number;
    microSkips: number;
    hasOverlayPermission: boolean;
    hasSmsPermission: boolean;
  }>;
  requestOverlayPermission(): Promise<void>;
  requestAccessibilityPermission(): Promise<void>;
  toggleFloatingHud(options: { show: boolean }): Promise<void>;
  saveAccountabilityPartner(options: {
    name: string;
    phone: string;
    role: string;
    customTemplate?: string;
  }): Promise<void>;
  triggerTestAlert(): Promise<void>;
  setDailyLimit(options: { limit: number }): Promise<void>;
}

export const NativeScrollGuard = registerPlugin<ScrollGuardPluginInterface>('ScrollGuard');

export const isNativeAndroid = () => {
  return Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'android';
};

export const requestAndroidOverlayPermission = async () => {
  if (isNativeAndroid()) {
    try {
      await NativeScrollGuard.requestOverlayPermission();
      return true;
    } catch (e) {
      console.error('Failed to request overlay permission:', e);
      return false;
    }
  }
  return false;
};

export const requestAndroidAccessibility = async () => {
  if (isNativeAndroid()) {
    try {
      await NativeScrollGuard.requestAccessibilityPermission();
      return true;
    } catch (e) {
      console.error('Failed to request accessibility:', e);
      return false;
    }
  }
  return false;
};

export const toggleAndroidFloatingHud = async (show: boolean) => {
  if (isNativeAndroid()) {
    try {
      await NativeScrollGuard.toggleFloatingHud({ show });
      return true;
    } catch (e) {
      console.error('Failed to toggle native HUD:', e);
      return false;
    }
  }
  return false;
};
