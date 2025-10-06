import NotificationService from "@/services/NotificationService"; // ✅ Import FCM service
import { Serverurl } from "@/utils/baseUrl";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import axios, { AxiosError } from "axios";

// ✅ Define error response type
interface ApiErrorResponse {
  error?: string;
  message?: string;
}

interface User {
  id: string;
  name: string;
  mobileNumber: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  hasPushToken: boolean;
  role?: string; // ✅ Added role
}

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  isLoading: boolean; // ✅ Added for compatibility
  
  loginError: string | null;
  registerError: string | null;
  getMeError: string | null;
  
  message?: string;
}

interface LoginCredentials {
  email: string;
  password: string;
  role: string;
}

interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
  mobileNumber: string;
}

interface LoginResponse {
  token: string;
  user: User;
  message?: string;
  success?: boolean;
}

interface LoadTokenResponse {
  token: string;
  user: User;
}

interface RegisterResponse {
  token: string;
  user: User;
  message?: string;
  success?: boolean;
}

// ✅ Load token with proper error handling
export const loadToken = createAsyncThunk<
  LoadTokenResponse | null,
  void,
  { rejectValue: string }
>("auth/loadToken", async (_, { rejectWithValue }) => {
  try {
    const savedToken = await AsyncStorage.getItem("token");
    console.log('🔑 Saved token:', savedToken ? 'Found' : 'Not found');
    
    if (!savedToken) return null;
    
    const res = await axios.get<{ user: User; success?: boolean }>(
      `${Serverurl}/api/auth/me`, 
      {
        headers: {
          Authorization: `Bearer ${savedToken}`,
          "Content-Type": "application/json",
        },
      }
    );
    
    console.log('✅ User data loaded:', res.data.user?.email);
    return { token: savedToken, user: res.data.user };

  } catch (err) {
    const error = err as AxiosError<ApiErrorResponse>;
    const errorMessage = 
      error.response?.data?.error || 
      error.response?.data?.message || 
      error.message || 
      "Failed to load token";
    
    console.error('❌ Load token error:', errorMessage);
    return rejectWithValue(errorMessage);
  }
});

// ✅ Login with FCM token update
export const login = createAsyncThunk<
  LoginResponse,
  LoginCredentials,
  { rejectValue: string }
>("auth/login", async ({ email, password, role }, { rejectWithValue }) => {
  try {
    console.log('🔐 Logging in...', { email, role });
    
    const res = await axios.post<LoginResponse>(
      `${Serverurl}/api/auth/login`, 
      { email, password, role }
    );

    const { token, user, message } = res.data;

    console.log('✅ Login successful:', user.email);
    
    // Save token
    await AsyncStorage.setItem("token", token);
    
    // ✅ Update FCM token on server after login
    try {
      const pendingToken = await AsyncStorage.getItem('pendingFcmToken');
      
      if (pendingToken) {
        console.log('📤 Sending pending FCM token to server...');
        await NotificationService.updateTokenOnServer(pendingToken);
      } else {
        // Get current FCM token
        const fcmToken = await AsyncStorage.getItem('fcmToken');
        if (fcmToken) {
          console.log('📤 Sending current FCM token to server...');
          await NotificationService.updateTokenOnServer(fcmToken);
        } else {
          // Generate new FCM token
          console.log('🔑 Generating new FCM token...');
          const newToken = await NotificationService.getFCMToken();
          if (newToken) {
            await NotificationService.updateTokenOnServer(newToken);
          }
        }
      }
    } catch (fcmError) {
      console.error('⚠️ FCM token update failed (non-blocking):', fcmError);
      // Don't fail login if FCM token update fails
    }

    return { token, user, message };

  } catch (err) {
    console.error('❌ Login error:', err);
    const error = err as AxiosError<ApiErrorResponse>;
    const errorMessage = 
      error.response?.data?.error || 
      error.response?.data?.message || 
      error.message || 
      "Login failed";
    
    return rejectWithValue(errorMessage);
  } 
});

// ✅ Register with proper error handling
export const register = createAsyncThunk<
  RegisterResponse,
  RegisterCredentials,
  { rejectValue: string }
>("auth/register", async ({ name, email, password, mobileNumber }, { rejectWithValue }) => {
  try {
    console.log('📝 Registering user...', { email });
    
    const res = await axios.post<RegisterResponse>(
      `${Serverurl}/api/auth/register`, 
      { name, email, mobileNumber, password }
    );
    
    const { token, user, message } = res.data;
    
    console.log('✅ Registration successful:', user.email);
    
    // Save token
    await AsyncStorage.setItem("token", token);

    // ✅ Update FCM token on server after registration
    try {
      const pendingToken = await AsyncStorage.getItem('pendingFcmToken');
      
      if (pendingToken) {
        await NotificationService.updateTokenOnServer(pendingToken);
      } else {
        const newToken = await NotificationService.getFCMToken();
        if (newToken) {
          await NotificationService.updateTokenOnServer(newToken);
        }
      }
    } catch (fcmError) {
      console.error('⚠️ FCM token update failed (non-blocking):', fcmError);
    }

    return { token, user, message };
    
  } catch (err) {
    console.error('❌ Registration error:', err);
    const error = err as AxiosError<ApiErrorResponse>;
    const errorMessage = 
      error.response?.data?.error || 
      error.response?.data?.message || 
      error.message || 
      "Registration failed";
    
    return rejectWithValue(errorMessage);
  }
});

// ✅ Logout with FCM token cleanup
export const logout = createAsyncThunk<null, void>("auth/logout", async () => {
  try {
    console.log('🚪 Logging out...');
    
    // Remove FCM token from server
    await NotificationService.removePushToken();
    
    // Clear badge
    await NotificationService.clearBadge();
    
    // Remove auth token
    await AsyncStorage.removeItem("token");
    
    console.log('✅ Logout successful');
    
  } catch (error) {
    console.error('⚠️ Logout error (non-blocking):', error);
    // Still remove local token even if server call fails
    await AsyncStorage.removeItem("token");
  }
  
  return null;
});

const initialState: AuthState = {
  user: null,
  token: null,
  loading: false,
  isLoading: false, // ✅ Added
  
  loginError: null,
  registerError: null,
  getMeError: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearLoginError: (state) => {
      state.loginError = null;
    },
    clearRegisterError: (state) => {
      state.registerError = null;
    },
    clearGetMeError: (state) => {
      state.getMeError = null;
    },
    clearAllErrors: (state) => {
      state.loginError = null;
      state.registerError = null;
      state.getMeError = null;
    },
    clearMessage: (state) => {
      state.message = undefined;
    },
    // ✅ Added for manual login success (if needed)
    loginSuccess: (state, action: PayloadAction<{ token: string; user: User }>) => {
      state.token = action.payload.token;
      state.user = action.payload.user;
      state.loading = false;
      state.isLoading = false;
      state.loginError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Load Token
      .addCase(loadToken.pending, (state) => {
        state.loading = true;
        state.isLoading = true;
        state.getMeError = null; 
      })
      .addCase(loadToken.fulfilled, (state, action: PayloadAction<LoadTokenResponse | null>) => {
        state.loading = false;
        state.isLoading = false;
        state.getMeError = null; 
        if (action.payload) {
          state.token = action.payload.token;
          state.user = action.payload.user;
        }
      })
      .addCase(loadToken.rejected, (state, action) => {
        state.loading = false;
        state.isLoading = false;
        state.getMeError = action.payload || "Failed to load token";
      })
      
      // Login
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.isLoading = true;
        state.loginError = null; 
      })
      .addCase(login.fulfilled, (state, action: PayloadAction<LoginResponse>) => {
        state.loading = false;
        state.isLoading = false;
        state.loginError = null; 
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.message = action.payload.message;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.isLoading = false;
        state.loginError = action.payload || "Login failed";   
      })
      
      // Register
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.isLoading = true;
        state.registerError = null; 
      })
      .addCase(register.fulfilled, (state, action: PayloadAction<RegisterResponse>) => {
        state.loading = false;
        state.isLoading = false;
        state.registerError = null;
        state.token = action.payload.token;
        state.message = action.payload.message;
        state.user = action.payload.user;
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.isLoading = false;
        state.registerError = action.payload || "Registration failed"; 
      })
      
      // Logout
      .addCase(logout.fulfilled, (state) => {
        state.token = null;
        state.user = null;
        state.loading = false;
        state.isLoading = false;
        state.loginError = null;
        state.registerError = null;
        state.getMeError = null;
        state.message = undefined;
      });
  },
});

export const { 
  clearLoginError, 
  clearRegisterError, 
  clearGetMeError, 
  clearAllErrors, 
  clearMessage,
  loginSuccess, // ✅ Export new action
} = authSlice.actions;

export default authSlice.reducer;
