import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import * as Notifications from 'expo-notifications';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';
import { Provider, useSelector } from 'react-redux';

import LoadingScreen from '@/components/Loading';
import { useAppDispatch } from '@/hooks/reduxhooks';
import { useColorScheme } from '@/hooks/useColorScheme';
import { loadToken } from '@/redux/slice/authSlice';
import { store } from '@/redux/store';
import { savePushToken } from '@/thunk/user/userMange';
import { disconnectSocket, initializeSocket } from '../thunk/NotificationService/notifcationThunk';

import AsyncStorage from '@react-native-async-storage/async-storage';

function RootLayoutContent() {
  const colorScheme = useColorScheme();
  const [isReady, setIsReady] = useState(false);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState<boolean | null>(null);
  const dispatch = useAppDispatch();
  const router = useRouter();
  const segments = useSegments();
  
  // Refs to prevent multiple initializations
  const socketInitializedRef = useRef(false);
  const pushTokenRegisteredRef = useRef(false);
  const navigationHandledRef = useRef(false);

  const authState = useSelector((state: any) => state.auth);
  const { token, user, isLoading } = authState;

  // Initialize auth on mount
  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        await dispatch(loadToken());

        if (mounted) {
          setIsReady(true);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        if (mounted) {
          setIsReady(true);
        }
      }
    };

    initializeAuth();

    return () => {
      mounted = false;
    };
  }, [dispatch]);

  // Register for push notifications
  const registerForPushNotificationsAsync = async () => {
    if (Platform.OS === 'web') {
      console.log('Push notifications not supported on web');
      return;
    }

    if (pushTokenRegisteredRef.current) {
      return;
    }

    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('Push notification permission denied');
        return;
      }

      const pushToken = (await Notifications.getExpoPushTokenAsync()).data;
      console.log('Expo push token:', pushToken);

      await dispatch(savePushToken(pushToken));
      pushTokenRegisteredRef.current = true;
      console.log('✅ Push token registered successfully');
    } catch (error) {
      console.error('Error registering for push notifications:', error);
    }
  };

  // Check onboarding status on mount
  useEffect(() => {
    const checkOnboardingStatus = async () => {
      try {
        const value = await AsyncStorage.getItem('hasSeenOnboarding');
        setHasSeenOnboarding(value === 'true');
      } catch (error) {
        console.error('Error reading onboarding status:', error);
        setHasSeenOnboarding(false);
      }
    };
    
    checkOnboardingStatus();
  }, []);

  // Handle navigation after everything is ready
  useEffect(() => {
    if (!isReady || isLoading || hasSeenOnboarding === null) {
      return;
    }

    if (navigationHandledRef.current) {
      return;
    }

    // Determine where to navigate
    let targetRoute: string | null = null;

    if (!hasSeenOnboarding) {
      targetRoute = '/onboarding';
    } else if (!token || !user) {
      targetRoute = '/login';
    } else {
      // User is authenticated, navigate based on role
      switch (user.role) {
        case 'Teacher':
          targetRoute = '/teacherHomeScreen';
          break;
        case 'Student':
          targetRoute = '/studentHomeScreen';
          break;
        case 'Admin':
          targetRoute = '/adminHomeScreen';
          break;
        default:
          targetRoute = '/login';
      }
    }

    // Get current route path
    const currentPath = segments.length > 0 ? `/${segments.join('/')}` : '/';

    // Only navigate if we're not already at the target
    if (targetRoute && currentPath !== targetRoute) {
      navigationHandledRef.current = true;
      
      // Use setTimeout to ensure navigation happens after mount
      setTimeout(() => {
        router.replace(targetRoute as any);
      }, 100);
    }
  }, [isReady, isLoading, hasSeenOnboarding, token, user, segments, router]);

  // Initialize socket and push notifications when authenticated
  useEffect(() => {
    const setupConnections = async () => {
      if (token && user && !socketInitializedRef.current) {
        console.log('Setting up connections for user:', user.email);
        
        socketInitializedRef.current = true;

        try {
          await initializeSocket(dispatch);
          console.log('✅ Socket initialized');

          await registerForPushNotificationsAsync();
        } catch (error) {
          console.error('Error setting up connections:', error);
          socketInitializedRef.current = false;
        }
      }
    };

    setupConnections();

    return () => {
      if (!token && socketInitializedRef.current) {
        console.log('Cleaning up socket connection...');
        disconnectSocket();
        socketInitializedRef.current = false;
        pushTokenRegisteredRef.current = false;
        navigationHandledRef.current = false;
      }
    };
  }, [token, user, dispatch]);

  // Handle notification listeners
  useEffect(() => {
    if (Platform.OS === 'web') {
      return;
    }

    const notificationListener = Notifications.addNotificationReceivedListener(notification => {
      console.log('📬 Notification received:', notification);
    });

    const responseListener = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('👆 Notification tapped:', response);
    });

    return () => {
      notificationListener.remove();
      responseListener.remove();
    };
  }, []);

  // Show loading screen while initializing
  if (!isReady || isLoading || hasSeenOnboarding === null) {
    return <LoadingScreen />;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="login" />
        <Stack.Screen name='adduserbyadmin' />
        <Stack.Screen name="Signup" />
        <Stack.Screen name="studentHomeScreen" />
        <Stack.Screen name="teacherHomeScreen" />
        <Stack.Screen name="manageUser" />
        <Stack.Screen name="classmanagement" />
        <Stack.Screen name="forgetPassowrd" />
        <Stack.Screen name="sectionmanagement" />
        <Stack.Screen name="setting" />
        <Stack.Screen name="adminHomeScreen" />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <Provider store={store}>
      <RootLayoutContent />
    </Provider>
  );
}
