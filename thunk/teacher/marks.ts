import { Teacher_URL } from '@/utils/baseUrl';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

interface UpdateMarksRequest {
  test_id: number;
  student_id: number;
  marks_obtained: number;
}

interface BulkUpdateMarksRequest {
  test_id: number;
  marks_data: Array<{
    student_id: number;
    marks_obtained: number;
  }>;
}

interface MarksData {
  marks_id: number;
  test_name: string;
  student_name: string;
  student_email: string;
  class_name: string;
  section_name: string;
  marks_obtained: number;
  max_marks: number;
  percentage: string;
  status: string;
  approved_by: string | null;
  approved_at: string | null;
  created_at: string;
  updated_at: string;
}

export const updateStudentMarks = createAsyncThunk(
  'marks/updateStudentMarks',
  async (data: UpdateMarksRequest, { rejectWithValue }) => {
    try {
      const savedToken = await AsyncStorage.getItem("token");
      if (!savedToken) {
        return rejectWithValue("No authentication token found");
      }

      const response = await axios.post(
        `${Teacher_URL}/marks/updateStudentMarks`,
        data,
        {
          headers: {
            Authorization: `Bearer ${savedToken}`,
            "Content-Type": "application/json",
          },
          timeout: 10000,
        }
      );

      return response.data;
    } catch (error: any) {
      if (error.response) {
        return rejectWithValue(error.response.data.error || 'Failed to update marks');
      } else if (error.request) {
        return rejectWithValue('Network error - please check your connection');
      } else {
        return rejectWithValue('Something went wrong');
      }
    }
  }
);

export const getMyTestMarks = createAsyncThunk(
  'marks/getMyTestMarks',
  async (params: { test_id?: number; status?: string } = {}, { rejectWithValue }) => {
    try {
      const savedToken = await AsyncStorage.getItem("token");
      if (!savedToken) {
        return rejectWithValue("No authentication token found");
      }

      const queryParams = new URLSearchParams();
      if (params?.test_id) queryParams.append('test_id', params.test_id.toString());
      if (params?.status) queryParams.append('status', params.status);

      const url = `${Teacher_URL}/marks/getMyTestMarks${queryParams.toString() ? '?' + queryParams.toString() : ''}`;

      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${savedToken}`,
          "Content-Type": "application/json",
        },
        timeout: 10000,
      });

      return response.data;
    } catch (error: any) {
      if (error.response) {
        return rejectWithValue(error.response.data.error || 'Failed to fetch marks');
      } else if (error.request) {
        return rejectWithValue('Network error - please check your connection');
      } else {
        return rejectWithValue('Something went wrong');
      }
    }
  }
);

export const bulkUpdateMarks = createAsyncThunk(
  'marks/bulkUpdateMarks',
  async (data: BulkUpdateMarksRequest, { rejectWithValue }) => {
    try {
      const savedToken = await AsyncStorage.getItem("token");
      if (!savedToken) {
        return rejectWithValue("No authentication token found");
      }

      const response = await axios.post(
        `${Teacher_URL}/marks/bulkUpdateMarks`,
        data,
        {
          headers: {
            Authorization: `Bearer ${savedToken}`,
            "Content-Type": "application/json",
          },
          timeout: 10000,
        }
      );

      return response.data;
    } catch (error: any) {
      if (error.response) {
        return rejectWithValue(error.response.data.error || 'Failed to bulk update marks');
      } else if (error.request) {
        return rejectWithValue('Network error - please check your connection');
      } else {
        return rejectWithValue('Something went wrong');
      }
    }
  }
);
