import { createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

export const getStudentAnalytics = createAsyncThunk(
  'studentAnalytics/getStudentAnalytics',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('/getStudentAnalytics');
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);
