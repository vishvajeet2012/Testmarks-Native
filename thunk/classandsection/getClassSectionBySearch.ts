// store/thunks/classThunk.ts
import { USER_URL } from "@/utils/baseUrl";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createAsyncThunk } from "@reduxjs/toolkit";
import axios, { AxiosError } from "axios";

export interface ClassSection {
  section_id: number;
  section_name: string;
}

export interface ClassData {
  class_id: number;
  class_name: string;
  sections: ClassSection[];
}

export interface SearchClassResponse {
  message: string;
  data: ClassData[];
}

export const searchClassBySectionWithQuery = createAsyncThunk<
  SearchClassResponse,
  string,
  { rejectValue: string }
>(
  'class/searchClassBySectionWithQuery',
  async (searchQuery: string, { rejectWithValue }) => {
    try {
      const token = await  AsyncStorage.getItem("token");
      
      const response = await axios.post(
        `${USER_URL}/searchClassBySectionWithQuery`,
        { search: searchQuery },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      if (axiosError.response?.data) {
        return rejectWithValue(
          (axiosError.response.data as any).message || 'Search failed'
        );
      }
      return rejectWithValue('Network error occurred');
    }
  }
);
