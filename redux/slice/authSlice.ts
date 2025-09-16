import { Serverurl } from "@/utils/baseUrl";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import axios, { AxiosError } from "axios";

interface User {
  id: string;
  name: string;
  mobileNumber: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  
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
}

interface LoadTokenResponse {
  token: string;
  user: any;
}

interface RegisterResponse {
  token: string;
  user: User;
  message?: string; }

export const loadToken = createAsyncThunk<
  LoadTokenResponse | null,
  void,
  { rejectValue: string }
>("auth/loadToken", async (_, { rejectWithValue }) => {
  try {
//await AsyncStorage.removeItem('token');
    const savedToken = await AsyncStorage.getItem("token");
   console.log(savedToken ," toekn check")
    if (!savedToken) return null;
    const res = await axios.get<{ user: User }>(`https://serversql-brown.vercel.app/api/auth/me`, {
      headers: {
        Authorization: `Bearer ${savedToken}`,
        "Content-Type": "application/json",
      },
    });
    return { token: savedToken, user: res.data.user };


  } catch (err) {
    const error = err as AxiosError;
    return rejectWithValue(error.message || "Failed to load token");
  }
});

export const login = createAsyncThunk<
  LoginResponse,
  LoginCredentials,
  { rejectValue: string }
>("auth/login", async ({ email, password, role }, { rejectWithValue }) => {
  try {
    const res = await axios.post<LoginResponse>(`${Serverurl}/api/auth/login`, { 
      email, 
      password,
      role
    });

    const { token, user, message } = res.data;
 
    await AsyncStorage.setItem("token", token);
    return { token, user, message };

  } catch (err) {
    const error = err as AxiosError;
    return rejectWithValue(error.message || "Login failed");
  } 
});

export const register = createAsyncThunk<
  RegisterResponse,
  RegisterCredentials,
  { rejectValue: string }
>("auth/register", async ({ name, email, password, mobileNumber }, { rejectWithValue }) => {
  try {
    const res = await axios.post<RegisterResponse>(`${Serverurl}/api/auth/register`, {
      name,
      email,
      mobileNumber,
      password,
    });
   const { token, user, message } = res.data;
  
 
   await AsyncStorage.setItem("token", token);

    return { token, user, message };
  } catch (err) {
    console.log(err);
    const error = err as AxiosError;
    return rejectWithValue(error.message || "Registration failed");
  }
});

export const logout = createAsyncThunk<null, void>("auth/logout", async () => {
  await AsyncStorage.removeItem("token");
  return null;
});

const initialState: AuthState = {
  user: null,
  token: null,
  loading: false,
  
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
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadToken.pending, (state) => {
        state.loading = true;
        state.getMeError = null; 
      })
      .addCase(loadToken.fulfilled, (state, action: PayloadAction<LoadTokenResponse | null>) => {
        state.loading = false;
        state.getMeError = null; 
        if (action.payload) {
          state.token = action.payload.token;
          state.user = action.payload.user;
        }
      })
      .addCase(loadToken.rejected, (state, action) => {
        state.loading = false;
        state.getMeError = action.payload || "Failed to load token"; // Set only getMeError
      })
      
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.loginError = null; 
      })
      .addCase(login.fulfilled, (state, action: PayloadAction<LoginResponse>) => {
        state.loading = false;
        state.loginError = null; 
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.message = action.payload.message;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.loginError = action.payload || "Login failed";   
      })
      
      // Register
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.registerError = null; 
      })
      .addCase(register.fulfilled, (state, action: PayloadAction<RegisterResponse>) => {
        state.loading = false;
        state.registerError = null; 
        state.message = action.payload.message;
        state.user = action.payload.user;
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.registerError = action.payload || "Registration failed"; 
      })
      
      // Logout
      .addCase(logout.fulfilled, (state) => {
        state.token = null;
        state.user = null;
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
  clearMessage 
} = authSlice.actions;

export default authSlice.reducer;