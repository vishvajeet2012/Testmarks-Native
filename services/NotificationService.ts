import AsyncStorage from '@react-native-async-storage/async-storage';
import messaging from '@react-native-firebase/messaging';
import axios from 'axios';
import { Serverurl } from '../utils/baseUrl';

class NotificationService {
  private static fcmToken: string | null = null;
  private static pendingPushToken: string | null = null;

  static async initialize(): Promise<void> {
    try {
      console.log('🔄 Initializing NotificationService with Firebase FCM...');

      // Request permission
      const permissionGranted = await this.requestPermission();
      if (!permissionGranted) {
        console.log('❌ Notification permission denied');
        return;
      }

      // Get FCM token
      const token = await this.getFCMToken();
      if (token) {
        console.log('✅ FCM token obtained:', token.substring(0, 20) + '...');
        await AsyncStorage.setItem('fcmToken', token);
        this.fcmToken = token;
      }

      // Set up listeners
      this.setupListeners();

      console.log('✅ NotificationService initialized successfully');
    } catch (error) {
      console.error('❌ Error initializing NotificationService:', error);
    }
  }

  private static async requestPermission(): Promise<boolean> {
    try {
      const authStatus = await messaging().requestPermission();

      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      if (enabled) {
        console.log('✅ Notification permission granted:', authStatus);
      }
      return enabled;
    } catch (error) {
      console.error('❌ Error requesting permission:', error);
      return false;
    }
  }

  static async getFCMToken(): Promise<string | null> {
    try {
      // Get FCM token from Firebase
      const token = await messaging().getToken();
      console.log('🔑 FCM Token:', token);
      return token;
    } catch (error) {
      console.error('❌ Error getting FCM token:', error);
      return null;
    }
  }

  private static setupListeners(): void {
    console.log('🎧 Setting up FCM listeners...');

    // Foreground message handler
    messaging().onMessage(async (remoteMessage) => {
      console.log('📨 Foreground notification:', remoteMessage);

      // You can display local notification here if needed
      // Or handle the message data directly in your app
    });

    // Token refresh handler
    messaging().onTokenRefresh(async (newToken) => {
      console.log('🔄 FCM Token refreshed:', newToken);
      this.fcmToken = newToken;
      await AsyncStorage.setItem('fcmToken', newToken);
      await this.updateTokenOnServer(newToken);
    });

    // Background notification opened app
    messaging().onNotificationOpenedApp((remoteMessage) => {
      console.log('📱 App opened from notification (background):', remoteMessage);
      // Handle navigation based on remoteMessage.data
    });

    // App opened from quit state
    messaging()
      .getInitialNotification()
      .then((remoteMessage) => {
        if (remoteMessage) {
          console.log('📱 App opened from notification (quit state):', remoteMessage);
          // Handle navigation based on remoteMessage.data
        }
      });

    console.log('✅ FCM listeners setup complete');
  }

  static async updateTokenOnServer(token: string): Promise<void> {
    try {
      const authToken = await AsyncStorage.getItem('token');
      if (!authToken) {
        console.log('⚠️ No auth token, saving push token as pending');
        await AsyncStorage.setItem('pendingPushToken', token);
        this.pendingPushToken = token;
        return;
      }

      console.log('📤 Updating FCM token on server...');
      const response = await axios.post(
        `$${Serverurl}/api/auth//update-push-token`,
        { push_token: token }, // Changed from pushToken to push_token
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.status === 200 || response.data.success) {
        console.log('✅ FCM token updated on server');
        await AsyncStorage.removeItem('pendingPushToken');
        this.pendingPushToken = null;
      }
    } catch (error) {
      console.error('❌ Error updating token on server:', error);
    }
  }

  static async removePushToken(): Promise<void> {
    try {
      const authToken = await AsyncStorage.getItem('token');
      if (!authToken) {
        console.log('⚠️ No auth token for token removal');
        return;
      }

      console.log('🗑️ Removing FCM token from server...');
      await axios.post(
        `${Serverurl}/api/auth/remove-push-token`,
        {},
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      console.log('✅ FCM token removed from server');
      await AsyncStorage.removeItem('fcmToken');
      await AsyncStorage.removeItem('pendingPushToken');
      this.fcmToken = null;
      this.pendingPushToken = null;
    } catch (error) {
      console.error('❌ Error removing token from server:', error);
    }
  }

  static async clearBadge(): Promise<void> {
    try {
      // Firebase doesn't have built-in badge clearing
      // You might need a separate package for this
      console.log('ℹ️ Badge clearing not implemented for Firebase FCM');
    } catch (error) {
      console.error('❌ Error clearing badge:', error);
    }
  }

  static getToken(): string | null {
    return this.fcmToken;
  }
}

export default NotificationService;
