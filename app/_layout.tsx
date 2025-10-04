import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import * as Notifications from 'expo-notifications';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useState } from 'react';
import { Platform, StyleSheet } from 'react-native';
import { Provider, useSelector } from 'react-redux';

import LoadingScreen from '@/components/Loading';
import { useAppDispatch } from '@/hooks/reduxhooks';
import { useColorScheme } from '@/hooks/useColorScheme';
import { loadToken } from '@/redux/slice/authSlice';
import { store } from '@/redux/store';
import { savePushToken } from '@/thunk/user/userMange';
import { initializeSocket } from '../thunk/NotificationService/notifcationThunk';

import AsyncStorage from '@react-native-async-storage/async-storage';

function RootLayoutContent() {
  const colorScheme = useColorScheme();
  const [initialScreen, setInitialScreen] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState<boolean | null>(null);
  const dispatch = useAppDispatch();

  const authState = useSelector((state: any) => state.auth);
  const { token, user, isLoading } = authState;

  const determineInitialScreen = useCallback(() => {
    if (!token) {
      return 'login';
    }

    if (!user || !user.role) {
      return 'login';
    }

    switch (user.role) {
      case 'Teacher':
        return 'teacherHomeScreen';
      case 'Student':
        return 'studentHomeScreen';
      case 'Admin':
        return 'adminHomeScreen';
      default:
        return 'login';
    }
  }, [token, user]);

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        const result = await dispatch(loadToken());

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

  const registerForPushNotificationsAsync = async () => {
    if (Platform.OS === 'web') {
      // Skip push notifications on web as it requires VAPID setup
      return;
    }

    let token;

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      alert('Failed to get push token for push notification!');
      return;
    }

    token = (await Notifications.getExpoPushTokenAsync()).data;

    console.log('Expo push token:', token);

    // Send to backend
    dispatch(savePushToken(token));
  };

  useEffect(() => {
    if (isReady && !isLoading && hasSeenOnboarding !== null) {
      if (hasSeenOnboarding) {
        const screen = determineInitialScreen();
        setInitialScreen(screen);
      } else {
        setInitialScreen('onboarding');
      }
    }
  }, [isReady, isLoading, determineInitialScreen, hasSeenOnboarding]);

  useEffect(() => {
    if (token && user) {
      registerForPushNotificationsAsync();
      initializeSocket(dispatch);
    }
  }, [token, user, dispatch]);

  useEffect(() => {
    const notificationListener = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification received:', notification);
    });

    const responseListener = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notification response:', response);
    });

    return () => {
      notificationListener.remove();
      responseListener.remove();
    };
  }, []);

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

  if (!isReady || isLoading || !initialScreen) {
    return (
      <LoadingScreen />
    );
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack initialRouteName={initialScreen}>
        <Stack.Screen name="onboarding" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name='adduserbyadmin' options={{ headerShown: false }} />
        <Stack.Screen name="Signup" options={{ headerShown: false }} />
        <Stack.Screen name="studentHomeScreen" options={{ headerShown: false }} />
        <Stack.Screen name="teacherHomeScreen" options={{ headerShown: false }} />
        <Stack.Screen name="manageUser" options={{ headerShown: false }} />
        <Stack.Screen name="classmanagement" options={{ headerShown: false }} />
        <Stack.Screen name="forgetPassowrd" options={{ headerShown: false }} />
        <Stack.Screen name="sectionmanagement" options={{ headerShown: false }} />
        <Stack.Screen name="setting" options={{ headerShown: false }} />
        <Stack.Screen
          name="adminHomeScreen"
          initialParams={user}
          options={{ headerShown: false }}
        />
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

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
});
