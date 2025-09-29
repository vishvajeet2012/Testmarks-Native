import { Teacher_URL } from '@/utils/baseUrl';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

export const getTeacherDashboard = createAsyncThunk(
  'teacher/getTeacherDashboard',
  async (_, { rejectWithValue }) => {
    try {
      const savedToken = await AsyncStorage.getItem("token");
      if (!savedToken) {
        return rejectWithValue("No authentication token found");
      }

      const response = await axios.get(`${Teacher_URL}/getTeacherDashboardData`, {
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
