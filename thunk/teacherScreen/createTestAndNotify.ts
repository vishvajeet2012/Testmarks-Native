import { Teacher_URL } from '@/utils/baseUrl';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

interface CreateTestPayload {
  class_id: number;
  section_id: number;
  subject_id: number;
  test_name: string;
  date_conducted: string;
  max_marks: number;
}

export const createTestAndNotifyStudents = createAsyncThunk(
  'createTest/createTestAndNotifyStudents',
  async (payload: CreateTestPayload, { rejectWithValue }) => {
    try {
      const savedToken = await AsyncStorage.getItem("token");
      if (!savedToken) {
        return rejectWithValue("No authentication token found");
      }

      const response = await axios.post(`${Teacher_URL}/createTestAndNotifyStudents`, payload, {
        headers: {
          Authorization: `Bearer ${savedToken}`,
          "Content-Type": "application/json",
        },
        timeout: 10000,
      });

      return response.data;
    } catch (error) {
      return rejectWithValue((error as any).response?.data?.error || 'An error occurred');
    }
  }
);
