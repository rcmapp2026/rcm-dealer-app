
import { supabaseService } from '../services/supabaseService';
import { PushNotifications } from '@capacitor/push-notifications';

// Action: Register for push notifications
export const registerPush = async () => {
  let permStatus = await PushNotifications.checkPermissions();

  if (permStatus.receive === 'prompt') {
    permStatus = await PushNotifications.requestPermissions();
  }

  if (permStatus.receive !== 'granted') {
    throw new Error('User denied permissions!');
  }

  await PushNotifications.register();
};

// Action: Save FCM token to Supabase
export const saveFCMToken = async (token: string, dealerId: string) => {
  if (!token || !dealerId) {
    console.error('FCM token or Dealer ID is missing');
    return;
  }

  const { error } = await supabaseService.supabase
    .from('dealer_devices')
    .upsert({ fcm_token: token, dealer_id: dealerId }, { onConflict: 'fcm_token' });

  if (error) {
    console.error('Supabase: Error saving FCM token:', error);
  } else {
    console.log(`Supabase: FCM token saved successfully for dealer ${dealerId}`);
  }
};

// Action: Delete FCM token from Supabase
export const deleteFCMToken = async (token: string) => {
  if (!token) {
    console.error('FCM token is missing, cannot delete');
    return;
  }

  const { error } = await supabaseService.supabase
    .from('dealer_devices')
    .delete()
    .eq('fcm_token', token);

  if (error) {
    console.error('Supabase: Error deleting FCM token:', error);
  } else {
    console.log('Supabase: FCM token deleted successfully on logout.');
  }
};
