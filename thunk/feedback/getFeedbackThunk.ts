import { USER_URL } from "@/utils/baseUrl";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createAsyncThunk } from "@reduxjs/toolkit";
import axios, { AxiosError } from "axios";

// 1️⃣ Get All Feedbacks (Universal - Role-based)
export const getAllFeedbacks = createAsyncThunk(
  "feedback/getAllFeedbacks",
  async (_, { rejectWithValue }) => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        return rejectWithValue("No authentication token found");
      }

      const response = await axios.get(`${USER_URL}/my-feedbacks`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
  
      });

      console.log('getAllFeedbacks response:', response.data);

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<{ error: string }>;
        return rejectWithValue(
          axiosError.response?.data?.error || axiosError.message || "Failed to get all feedbacks"
        );
      }
      return rejectWithValue("An unexpected error occurred");
    }
  }
);

// 2️⃣ Get My All Feedbacks (Student)
export const getMyAllFeedbacks = createAsyncThunk(
  "feedback/getMyAllFeedbacks",
  async (_, { rejectWithValue }) => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        return rejectWithValue("No authentication token found");
      }

      const response = await axios.get(`${USER_URL}/my-feedbacks`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      
      });

      console.log('getMyAllFeedbacks response:', response.data);

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<{ error: string }>;
        return rejectWithValue(
          axiosError.response?.data?.error || axiosError.message || "Failed to get my feedbacks"
        );
      }
      return rejectWithValue("An unexpected error occurred");
    }
  }
);
