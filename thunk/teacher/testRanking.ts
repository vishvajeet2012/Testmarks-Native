import { Teacher_URL } from '@/utils/baseUrl';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

interface TestRankingRequest {
  test_id: string;
}

interface StudentRanking {
  student_id: number;
  student_name: string;
  student_email: string;
  marks_obtained: number;
  max_marks: number;
  percentage: number;
  rank: number;
  status: string;
}

interface TestRankingResponse {
  test_id: number;
  test_name: string;
  class_name: string;
  section_name: string;
  subject_name: string;
  date_conducted: string;
  max_marks: number;
  total_students: number;
  students_attempted: number;
  average_marks: number;
  highest_marks: number;
  lowest_marks: number;
  student_rankings: StudentRanking[];
}

export const getTestRanking = createAsyncThunk(
  'testRanking/getTestRanking',
  async (data: TestRankingRequest, { rejectWithValue }) => {
    try {
      const savedToken = await AsyncStorage.getItem("token");
      if (!savedToken) {
        return rejectWithValue("No authentication token found");
      }

      const response = await axios.post(
        `${Teacher_URL}/test/teaceherrank`,
        data,
        {
          headers: {
            Authorization: `Bearer ${savedToken}`,
            "Content-Type": "application/json",
          },
          timeout: 10000,
        }
      );

      return response.data.data as TestRankingResponse;
    } catch (error: any) {
      if (error.response) {
        return rejectWithValue(error.response.data.error || 'Failed to fetch test ranking');
      } else if (error.request) {
        return rejectWithValue('Network error - please check your connection');
      } else {
        return rejectWithValue('Something went wrong');
      }
    }
  }
);
