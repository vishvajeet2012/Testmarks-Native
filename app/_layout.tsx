import LoadingScreen from '@/components/Loading';
import { useAppDispatch } from '@/hooks/reduxhooks';
import { useColorScheme } from '@/hooks/useColorScheme';
import { loadToken } from '@/redux/slice/authSlice';
import NotificationService from '@/services/NotificationService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef, useState } from 'react';
import { Alert } from 'react-native';
import { Provider, useSelector } from 'react-redux';
import { store } from '../redux/store';

function RootLayoutContent() {
  const colorScheme = useColorScheme();
  const [isReady, setIsReady] = useState(false);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState<boolean | null>(null);
  const dispatch = useAppDispatch();
  const router = useRouter();
  const segments = useSegments();
  
  const navigationHandledRef = useRef(false);
  const fcmInitializedRef = useRef(false);

  const authState = useSelector((state: any) => state.auth);
  const { token, user, isLoading, getMeError } = authState;

  // ✅ Initialize Firebase FCM + Expo Notifications on app start
  useEffect(() => {
    const initializeFirebase = async () => {
      if (!fcmInitializedRef.current) {
        fcmInitializedRef.current = true;
        await NotificationService.initialize();
      }
    };

    initializeFirebase();
  }, []);

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

  // ✅ FIXED: Reset navigationHandledRef when token or onboarding status changes
  useEffect(() => {
    navigationHandledRef.current = false;
  }, [token, hasSeenOnboarding]);

  // Handle navigation after everything is ready
  useEffect(() => {
    if (!isReady || isLoading || hasSeenOnboarding === null) {
      return;
    }

    if (navigationHandledRef.current) {
      return;
    }

    let targetRoute: string | null = null;

    // ✅ FIXED: Priority order - Onboarding first, then auth
    if (!hasSeenOnboarding) {
      // Show onboarding if user hasn't seen it, regardless of token
      targetRoute = '/onboarding';
    } else if (!token || !user) {
      // User has seen onboarding but not logged in
      targetRoute = '/login';
    } else {
      // User is authenticated, route based on role
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

    const currentPath = segments.length > 0 ? `/${segments.join('/')}` : '/';

    if (targetRoute && currentPath !== targetRoute) {
      navigationHandledRef.current = true;
      
      setTimeout(() => {
        router.replace(targetRoute as any);
      }, 100);
    }
  }, [isReady, isLoading, hasSeenOnboarding, token, user, segments, router]);

  // ✅ Update FCM token on server when user logs in
  useEffect(() => {
    const updateFCMToken = async () => {
      if (token && user) {
        console.log('📱 User authenticated, checking FCM token...');
        
        const pendingToken = await AsyncStorage.getItem('pendingPushToken');

        if (pendingToken) {
          console.log('📤 Sending pending FCM token to server...');
          await NotificationService.updateTokenOnServer(pendingToken);
        } else {
          const currentToken = await AsyncStorage.getItem('fcmToken');
          if (currentToken) {
            await NotificationService.updateTokenOnServer(currentToken);
          }
        }
      }
    };

    updateFCMToken();
  }, [token, user]);

  // Handle getMe error
  useEffect(() => {
    if (getMeError) {
      Alert.alert('Authentication Error', getMeError);
    }
  }, [getMeError]);

  // Show loading screen while initializing
  if (!isReady || isLoading || hasSeenOnboarding === null) {
    return <LoadingScreen />;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="login" />
        <Stack.Screen name="adduserbyadmin" />
        <Stack.Screen name="Signup" />
        <Stack.Screen name="add-class" />
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
