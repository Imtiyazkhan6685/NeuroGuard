import { registerPlugin, Capacitor } from '@capacitor/core';
import { NativeStats } from '../types';

interface ScrollGuardPluginInterface {
  getNativeStats(): Promise<NativeStats>;
  requestOverlayPermission(): Promise<void>;
  requestAccessibilityPermission(): Promise<void>;
  openAppDetailsSettings(): Promise<void>;
  toggleFloatingHud(options: { show: boolean }): Promise<{ needsPermission?: boolean }>;
  savePartners(options: { partnersJson: string }): Promise<void>;
  getPartners(): Promise<{ partnersJson: string }>;
  triggerTestAlert(): Promise<void>;
  setDailyLimit(options: { limit: number }): Promise<void>;
  setMaxDailyMinutes(options: { minutes: number }): Promise<void>;
  resetToday(): Promise<void>;
  recordSimulatedSwipe(options: { platform: string }): Promise<void>;
  openSmsIntent(options: { phone: string; message: string }): Promise<void>;
  openWhatsAppIntent(options: { phone: string; message: string }): Promise<void>;
}

export const NativeScrollGuard = registerPlugin<ScrollGuardPluginInterface>('ScrollGuard');

export const isNativeAndroid = () => {
  return Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'android';
};

export const fetchNativeStats = async (): Promise<NativeStats | null> => {
  if (isNativeAndroid()) {
    try {
      return await NativeScrollGuard.getNativeStats();
    } catch (e) {
      console.warn('Native stats not available:', e);
      return null;
    }
  }
  return null;
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

export const openAndroidAppDetails = async () => {
  if (isNativeAndroid()) {
    try {
      await NativeScrollGuard.openAppDetailsSettings();
      return true;
    } catch (e) {
      console.error('Failed to open app details:', e);
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

export const savePartnersToNative = async (partnersJson: string) => {
  if (isNativeAndroid()) {
    try {
      await NativeScrollGuard.savePartners({ partnersJson });
      return true;
    } catch (e) {
      console.error('Failed to save partners to native:', e);
      return false;
    }
  }
  return false;
};

export const resetNativeToday = async () => {
  if (isNativeAndroid()) {
    try {
      await NativeScrollGuard.resetToday();
      return true;
    } catch (e) {
      console.error('Failed to reset native today:', e);
      return false;
    }
  }
  return false;
};

export const recordNativeSwipe = async (platform: string) => {
  if (isNativeAndroid()) {
    try {
      await NativeScrollGuard.recordSimulatedSwipe({ platform });
      return true;
    } catch (e) {
      console.error('Failed to record native swipe:', e);
      return false;
    }
  }
  return false;
};

export const openNativeSms = async (phone: string, message: string) => {
  if (isNativeAndroid()) {
    try {
      await NativeScrollGuard.openSmsIntent({ phone, message });
      return true;
    } catch (e) {
      console.error('Failed to open native SMS intent:', e);
    }
  }
  // Browser fallback
  window.open(`sms:${phone}?body=${encodeURIComponent(message)}`, '_blank');
  return true;
};

export const openNativeWhatsApp = async (phone: string, message: string) => {
  if (isNativeAndroid()) {
    try {
      await NativeScrollGuard.openWhatsAppIntent({ phone, message });
      return true;
    } catch (e) {
      console.error('Failed to open native WhatsApp:', e);
    }
  }
  // Browser fallback
  const cleanPhone = phone.replace(/[^0-9]/g, '');
  window.open(`https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(message)}`, '_blank');
  return true;
};
