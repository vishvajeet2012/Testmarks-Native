import { USER_URL } from "@/utils/baseUrl";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createAsyncThunk } from "@reduxjs/toolkit";
import axios, { AxiosError } from "axios";
export interface User {
  user_id: number;
  name: string;
  email: string;
  mobile_number: string;
  profile_picture?: string;
  role: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface ManageUserRequest {
  user_id: number;
  status?: string;
  mobile_number?: string;
  role?: string;
  name?: string;
  email?: string;
}   

export interface ManageUserResponse {
  message: string;
  status: boolean;
  data?: User;
}

export interface ManageUserState {
  loading: boolean;
  success: boolean;
  error: string | null;
  updatedUser: User | null;

}



export const manageStudentUser = createAsyncThunk<
  ManageUserResponse,
  ManageUserRequest,
  { rejectValue: string }
>("user/manageStudentUser", async (userData, { rejectWithValue }) => {
  try {
    console.log(userData)
    const savedToken = await AsyncStorage.getItem("token");
    if (!savedToken) {
      return rejectWithValue("No authentication token found");
    }
    
const response = await axios.post(
  `${USER_URL}/manageuser`,
  userData,
  {headers: {
      Authorization: `Bearer ${savedToken}`,
      "Content-Type": "application/json",
    },
    timeout: 10000,
  }
);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<{ message: string; status: boolean }>;
      
      if (axiosError.response?.data?.message) {
        return rejectWithValue(axiosError.response.data.message);
      }
      
      if (axiosError.response?.status === 401) {
        return rejectWithValue("Authentication failed. Please login again.");
      }
      
      if (axiosError.response?.status === 403) {
        return rejectWithValue("You cannot change role to admin — permission not allowed.");
      }
      
      if (axiosError.response?.status === 404) {
        return rejectWithValue("User not found");
      }
      
      return rejectWithValue(axiosError.message || "Network error occurred");
    }
    
    return rejectWithValue("An unexpected error occurred");
  }
});



export const savePushToken = createAsyncThunk<
  { message: string },
  string,
  { rejectValue: string }
>("user/savePushToken", async (pushToken, { rejectWithValue }) => {
  try {
    const savedToken = await AsyncStorage.getItem("token");
    if (!savedToken) {
      return rejectWithValue("No authentication token found");
    }

    const response = await axios.post(
      `${USER_URL}/save-push-token`,
      { pushToken },
      {
        headers: {
          Authorization: `Bearer ${savedToken}`,
          "Content-Type": "application/json",
        },
        timeout: 10000,
      }
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<{ message: string }>;
      return rejectWithValue(axiosError.response?.data?.message || axiosError.message || "Failed to save push token");
    }
    return rejectWithValue("An unexpected error occurred");
  }
});

export const removePushToken = createAsyncThunk<
  { message: string },
  void,
  { rejectValue: string }
>("user/removePushToken", async (_, { rejectWithValue }) => {
  try {
    const savedToken = await AsyncStorage.getItem("token");
    if (!savedToken) {
      return rejectWithValue("No authentication token found");
    }

    const response = await axios.delete(
      `${USER_URL}/remove-push-token`,
      {
        headers: {
          Authorization: `Bearer ${savedToken}`,
          "Content-Type": "application/json",
        },
        timeout: 10000,
      }
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<{ message: string }>;
      return rejectWithValue(axiosError.response?.data?.message || axiosError.message || "Failed to remove push token");
    }
    return rejectWithValue("An unexpected error occurred");
  }
});

export const selectManageUserLoading = (state: { manageUser: ManageUserState }) => state.manageUser.loading;
export const selectManageUserSuccess = (state: { manageUser: ManageUserState }) => state.manageUser.success;
export const selectManageUserError = (state: { manageUser: ManageUserState }) => state.manageUser.error;
export const selectUpdatedUser = (state: { manageUser: ManageUserState }) => state.manageUser.updatedUser;
