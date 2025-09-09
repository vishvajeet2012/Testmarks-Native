import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import 'react-native-reanimated';
import { Provider, useSelector } from 'react-redux';

import LoadingScreen from '@/components/Loading';
import { useAppDispatch } from '@/hooks/reduxhooks';
import { useColorScheme } from '@/hooks/useColorScheme';
import { loadToken } from '@/redux/slice/authSlice';
import { store } from '@/redux/store';

function RootLayoutContent() {
  const colorScheme = useColorScheme();
  const [initialScreen, setInitialScreen] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  const dispatch = useAppDispatch();
  
  const authState = useSelector((state: any) => state.auth);
  const { token, user, isLoading } = authState;
  
  

  const determineInitialScreen = useCallback(() => {
    console.log('Determining initial screen with:', { hasToken: !!token, userRole: user?.role });

    if (!token) {
      console.log('No token, setting initial screen to Signup');
      return 'Signup';
    }

    if (!user || !user.role) {
      console.log('Token exists but no user role, setting initial screen to Signup');
      return 'Signup';
    }

    // Determine screen based on user role
    switch (user.role) {
      case 'Teacher':
        return 'teacherHomeScreen';
      case 'Student':
        return 'studentHomeScreen';
      case 'Admin':
        return 'adminHomeScreen';
      default:
        return 'Signup';
    }
  }, [token, user]);

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        console.log('Dispatching loadToken...');
        const result = await dispatch(loadToken());
        
        console.log('LoadToken result:', result);
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

  useEffect(() => {
    if (isReady && !isLoading) {
      const screen = determineInitialScreen();
      setInitialScreen(screen);
    }
  }, [isReady, isLoading, determineInitialScreen]);

  if (!isReady || isLoading || !initialScreen) {
    return (
     <LoadingScreen/>
    );
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack initialRouteName={initialScreen}>
                        <Stack.Screen name="login" options={{ headerShown: false }} />

        <Stack.Screen name="Signup" options={{ headerShown: false }} />
        <Stack.Screen name="studentHomeScreen" options={{ headerShown: false }} />
        <Stack.Screen name="teacherHomeScreen" options={{ headerShown: false }} />
        <Stack.Screen name="manageUser" options={{headerShown:false}}/>
        <Stack.Screen 
          name="adminHomeScreen" 
          initialParams={user } 
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