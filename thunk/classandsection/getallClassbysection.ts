export interface Teacher {
  teacher_id: number | null;
  name: string | null;
  email: string | null;
  assigned_subjects: string[] | null;
  class_assignments: string[] | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface Section {
  section_id: number;
  section_name: string;
  total_students: number;
  class_teacher_id: number | null;
  section_created_at: string;
  section_updated_at: string;
}
           export interface ClassData {
  class_id: number;
  class_name: string;
  description: string;
  class_created_at: string;
  class_updated_at: string;
  sections: Section[];
  class_teacher: Teacher;
}

export interface ClassesResponse {
  message: string;
  data: ClassData[];
}export interface ClassesState {
  classes: ClassData[];
  loading: boolean;
  error: string | null;
}


import { USER_URL } from '@/utils/baseUrl';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';




export const fetchAllClasses = createAsyncThunk<
  ClassData[],
  void,
  { rejectValue: string }
>(
  'classes/fetchAllClasses',
  async (_, { rejectWithValue }) => {
    try {
      const savedToken = await AsyncStorage.getItem("token");
      
      if (!savedToken) {
        return rejectWithValue("No authentication token found");
      }

      const response = await axios.get<ClassesResponse>(
        `${USER_URL}/getAllClassbysection`,
        {
          headers: {
            Authorization: `Bearer ${savedToken}`,
            "Content-Type": "application/json",
          },
          timeout: 10000,
        }
      );

      return response.data.data;
    } catch (error: any) {
      if (error.response) {
        return rejectWithValue(
          error.response.data.message || 'Failed to fetch classes'
        );
      } else if (error.request) {
        return rejectWithValue('Network error - please check your connection');
      } else {
        return rejectWithValue('Something went wrong');
      }
    }
  }
);