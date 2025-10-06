import notifee, { AndroidImportance } from '@notifee/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import messaging from '@react-native-firebase/messaging';
import { Platform } from 'react-native';

// ✅ Your production URL from Render.com
const API_URL = 'https://serversql-ek4h.onrender.com';

class NotificationService {
  
  static async initialize() {
    console.log('📱 Initializing Firebase Notifications...');
    console.log('🌐 API URL:', API_URL);
    
    await this.createNotificationChannel();
    const hasPermission = await this.requestPermission();
    
    if (hasPermission) {
      await this.getFCMToken();
      this.setupListeners();
    }
    
    console.log('✅ Firebase Notifications initialized');
  }

  static async createNotificationChannel() {
    if (Platform.OS === 'android') {
      await notifee.createChannel({
        id: 'default_channel',
        name: 'Default Notifications',
        importance: AndroidImportance.HIGH,
        sound: 'default',
        vibration: true,
      });
      
      console.log('📢 Notification channel created');
    }
  }

  static async requestPermission(): Promise<boolean> {
    try {
      const authStatus = await messaging().requestPermission();
      
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      if (enabled) {
        console.log('✅ Notification permission granted');
      } else {
        console.log('❌ Notification permission denied');
      }

      return enabled;
    } catch (error) {
      console.error('Error requesting permission:', error);
      return false;
    }
  }

  static async getFCMToken(): Promise<string | null> {
    try {
      const token = await messaging().getToken();
      
      console.log('🔑 FCM Token:', token);
      console.log('📝 Token Length:', token.length);
      
      await AsyncStorage.setItem('fcmToken', token);
      
      const authToken = await AsyncStorage.getItem('authToken');
      
      if (authToken) {
        await this.updateTokenOnServer(token);
      } else {
        await AsyncStorage.setItem('pendingFcmToken', token);
        console.log('⏳ Token saved for after login');
      }
      
      return token;
    } catch (error) {
      console.error('❌ Error getting FCM token:', error);
      return null;
    }
  }

  static async updateTokenOnServer(token: string) {
    try {
      const authToken = await AsyncStorage.getItem('authToken');
      
      if (!authToken) {
        console.log('⚠️  Not logged in, saving token for later');
        await AsyncStorage.setItem('pendingFcmToken', token);
        return { success: false, reason: 'Not authenticated' };
      }

      console.log('📤 Sending FCM token to server...');
      console.log('🔗 API Endpoint:', `${API_URL}/api/user/update-push-token`);

      const response = await fetch(`${API_URL}/api/user/update-push-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify({ push_token: token }),
      });

      const data = await response.json();
      
      console.log('📥 Server response:', data);
      
      if (data.success) {
        console.log('✅ FCM token updated on server');
        await AsyncStorage.removeItem('pendingFcmToken');
      } else {
        console.log('❌ Failed to update token:', data.message || data.error);
      }

      return data;
    } catch (error: any) {
      console.error('❌ Error updating token on server:', error.message);
      return { success: false, error: error.message };
    }
  }

  static setupListeners() {
    console.log('🎧 Setting up FCM listeners...');

    // Foreground message
    messaging().onMessage(async (remoteMessage) => {
      console.log('📨 Foreground notification:', remoteMessage);
      
      await notifee.displayNotification({
        title: remoteMessage.notification?.title || 'Notification',
        body: remoteMessage.notification?.body || '',
        android: {
          channelId: 'default_channel',
          smallIcon: 'ic_notification',
          pressAction: { id: 'default' },
          sound: 'default',
        },
        data: remoteMessage.data,
      });
    });

    // Token refresh
    messaging().onTokenRefresh((newToken) => {
      console.log('🔄 Token refreshed:', newToken);
      AsyncStorage.setItem('fcmToken', newToken);
      this.updateTokenOnServer(newToken);
    });

    // Notification opened app from background
    messaging().onNotificationOpenedApp((remoteMessage) => {
      console.log('📱 App opened from notification (background):', remoteMessage);
      // Handle navigation based on remoteMessage.data
      if (remoteMessage.data?.type) {
        console.log('📍 Notification type:', remoteMessage.data.type);
        // TODO: Add navigation logic here
      }
    });

    // App opened from quit state
    messaging().getInitialNotification().then((remoteMessage) => {
      if (remoteMessage) {
        console.log('📱 App opened from notification (quit state):', remoteMessage);
        // Handle navigation based on remoteMessage.data
        if (remoteMessage.data?.type) {
          console.log('📍 Notification type:', remoteMessage.data.type);
          // TODO: Add navigation logic here
        }
      }
    });

    console.log('✅ FCM listeners setup complete');
  }

  static async clearBadge() {
    try {
      await notifee.setBadgeCount(0);
      console.log('✅ Badge cleared');
    } catch (error) {
      console.error('Error clearing badge:', error);
    }
  }

  static async setBadgeCount(count: number) {
    try {
      await notifee.setBadgeCount(count);
      console.log(`✅ Badge count set to ${count}`);
    } catch (error) {
      console.error('Error setting badge count:', error);
    }
  }

  static async removePushToken() {
    try {
      const authToken = await AsyncStorage.getItem('authToken');
      
      if (!authToken) {
        console.log('⚠️  No auth token found');
        return;
      }

      console.log('🗑️  Removing push token from server...');

      const response = await fetch(`${API_URL}/api/user/remove-push-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
      });

      const data = await response.json();
      
      if (data.success) {
        console.log('✅ Push token removed from server');
      } else {
        console.log('❌ Failed to remove token:', data.message);
      }

      // Clear local storage
      await AsyncStorage.multiRemove(['fcmToken', 'pendingFcmToken']);
      
      return data;
    } catch (error: any) {
      console.error('❌ Error removing token:', error.message);
      return { success: false, error: error.message };
    }
  }
}

export default NotificationService;
