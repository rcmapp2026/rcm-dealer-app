import { Capacitor } from '@capacitor/core';
import { Camera } from '@capacitor/camera';
import { Geolocation } from '@capacitor/geolocation';

export type FeaturePermission = 'camera' | 'location' | 'photos' | 'microphone' | 'storage' | 'payment' | 'nfc' | 'system';

/**
 * Requirement: Request permission ONLY when user opens a feature.
 */
export const requestFeaturePermission = async (feature: FeaturePermission): Promise<boolean> => {
  if (!Capacitor.isNativePlatform()) return true;

  try {
    switch (feature) {
      case 'camera':
        const cam = await Camera.requestPermissions({ permissions: ['camera'] });
        return cam.camera === 'granted';
      case 'location':
        const loc = await Geolocation.requestPermissions();
        return loc.location === 'granted';
      case 'photos':
        const photos = await Camera.requestPermissions({ permissions: ['photos'] });
        return photos.photos === 'granted';
      case 'microphone':
        // Microphone permission is handled by Web APIs, assume granted
        return true;
      case 'storage':
        const store = await Camera.requestPermissions({ permissions: ['photos'] });
        return store.photos === 'granted';
      case 'payment':
        // Payment permissions are handled by UPI apps, assume granted
        return true;
      case 'nfc':
        // NFC permission would require native plugin, assume granted for now
        return true;
      case 'system':
        // System permissions (like system alert window) require special handling
        // For now, assume granted as they're declared in manifest
        return true;
      default:
        return false;
    }
  } catch (err) {
    console.error(`Error requesting ${feature} permission:`, err);
    return false;
  }
};

/**
 * Requirement: Re-check permission
 */
export const checkPermissionStatus = async (feature: FeaturePermission): Promise<boolean> => {
  if (!Capacitor.isNativePlatform()) return true;
  
  try {
    switch (feature) {
      case 'camera':
        const cam = await Camera.checkPermissions();
        return cam.camera === 'granted';
      case 'location':
        const loc = await Geolocation.checkPermissions();
        return loc.location === 'granted';
      case 'photos':
        const photos = await Camera.checkPermissions();
        return photos.photos === 'granted';
      case 'microphone':
        // Microphone permission is handled by Web APIs, assume granted
        return true;
      case 'storage':
        const store = await Camera.checkPermissions();
        return store.photos === 'granted';
      case 'payment':
        // Payment permissions are handled by UPI apps, assume granted
        return true;
      case 'nfc':
        // NFC permission would require native plugin, assume granted for now
        return true;
      case 'system':
        // System permissions (like system alert window) require special handling
        // For now, assume granted as they're declared in manifest
        return true;
      default:
        return false;
    }
  } catch {
    return false;
  }
};
