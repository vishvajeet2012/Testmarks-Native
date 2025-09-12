import { USER_URL } from '@/utils/baseUrl';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createAsyncThunk } from "@reduxjs/toolkit";
import axios, { AxiosError } from "axios";

interface UserProfile {
  teacher_id?: number;
  student_id?: number;
  assigned_subjects?: string[];
  class_assignments?: string[];
  roll_number?: string;
  class_id?: number;
  section_id?: number;
  dob?: string;
  guardian_name?: string;
  guardian_mobile_number?: string;
  student_mobile_number?: string;
  class_name?: string;
  section_name?: string;
  created_at: string;
  updated_at: string;
}

interface User {
  user_id: number;
  name: string;
  email: string;
  mobile_number: string | null;
  profile_picture: string | null;
  role: string;
  status: string;
  created_at: string;
  updated_at: string;
  profile: UserProfile | null;
}

interface getRolebaseUserResponse {
  count: number;
  message: string;
  status: boolean;
  users: User[]; // Changed from 'user' to 'users' to match your JSON
}

interface getRolebaseCredentials {
  role: string;
}

export const getRolebaseuser = createAsyncThunk<
  getRolebaseUserResponse,
  getRolebaseCredentials,
  { rejectValue: string }
>("user/getRolebaseUser", async ({ role }, { rejectWithValue }) => {
  try {
    const savedToken = await AsyncStorage.getItem("token");
    
    if (!savedToken) {
      return rejectWithValue("No authentication token found");
    }
    
    const res = await axios.post<getRolebaseUserResponse>(
      `${USER_URL}/getrolebaseuser`,
      { role },
      {
        headers: {
          Authorization: `Bearer ${savedToken}`,
          "Content-Type": "application/json",
        },
        timeout: 10000,
      }
    );
    
    console.log(res.data);
    return res.data; 
  } catch (err) {
    const error = err as AxiosError<{ message: string }>;
    
    return rejectWithValue(
      error.response?.data?.message || 
      error.message || 
      "Network error occurred"
    );
  }
});
