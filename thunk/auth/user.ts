import { USER_URL } from '@/utils/baseUrl';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createAsyncThunk } from "@reduxjs/toolkit";
import axios, { AxiosError } from "axios";

// Updated interfaces
interface User {
  user_id: number;
  name: string;
  email: string;
  mobile_number: string | null;
  role: string;
  status: string;
  profile_picture: string | null;
  created_at: string;
  updated_at: string;
}

interface getRolebaseUserResponse {
  count: number;
  message: string;
  status: boolean;
  user: User[];
}

interface getalrolebaseCredentials {
  role: string;
}

export const getRolebaseuser = createAsyncThunk<
  getRolebaseUserResponse,
  getalrolebaseCredentials,
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
