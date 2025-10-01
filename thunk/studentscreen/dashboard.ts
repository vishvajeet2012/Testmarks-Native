import { Student_URL } from '@/utils/baseUrl';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

export const getStudentDashboard = createAsyncThunk(
  'student/getStudentDashboard',
  async (_, { rejectWithValue }) => {
    try {
      const savedToken = await AsyncStorage.getItem("token");
      if (!savedToken) {
        return rejectWithValue("No authentication token found");
      }

      const response = await axios.get(`${Student_URL}/getStudentDashboard`, {
        headers: {
          Authorization: `Bearer ${savedToken}`,
          "Content-Type": "application/json",
        },
        timeout: 10000,
      });

      return response.data;
    } catch (error) {
      return rejectWithValue((error as any).response?.data || 'An error occurred');
    }
  }
);
