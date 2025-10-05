import { USER_URL } from "@/utils/baseUrl";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createAsyncThunk } from "@reduxjs/toolkit";
import axios, { AxiosError } from "axios";

// Types
export interface Feedback {
  id: number;
  message: string;
  created_at: string;
  // Add other fields as needed
}

export interface FeedbackState {
  loading: boolean;
  success: boolean;
  error: string | null;
  feedback: Feedback | null;
  feedbacks: Feedback[];
}

// 1️⃣ Universal Get Test Feedbacks (Role-based)
export const getTestFeedbacks = createAsyncThunk(
  "feedback/getTestFeedbacks",
  async (_, { rejectWithValue }) => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        return rejectWithValue("No authentication token found");
      }

      const response = await axios.post(
        `${USER_URL}/test-feedbacks`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          timeout: 10000,
        }
      );

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<{ error: string }>;
        return rejectWithValue(
          axiosError.response?.data?.error || axiosError.message || "Failed to get test feedbacks"
        );
      }
      return rejectWithValue("An unexpected error occurred");
    }
  }
);

// 2️⃣ Create Feedback (Admin/Teacher)
export const createFeedback = createAsyncThunk(
  "feedback/createFeedback",
  async (
    {
      test_id,
      student_id,
      message,
    }: { test_id: number; student_id: number; message: string },
    { rejectWithValue }
  ) => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        return rejectWithValue("No authentication token found");
      }

      const response = await axios.post(
        `${USER_URL}/create-feedback`,
        { test_id, student_id, message },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          timeout: 10000,
        }
      );

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<{ error: string }>;
        return rejectWithValue(
          axiosError.response?.data?.error || axiosError.message || "Failed to create feedback"
        );
      }
      return rejectWithValue("An unexpected error occurred");
    }
  }
);

// 3️⃣ Edit Feedback (Admin/Teacher)
export const editFeedback = createAsyncThunk(
  "feedback/editFeedback",
  async (
    { feedback_id, message }: { feedback_id: number; message: string },
    { rejectWithValue }
  ) => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        return rejectWithValue("No authentication token found");
      }

      const response = await axios.post(
        `${USER_URL}/edit-feedback`,
        { feedback_id, message },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          timeout: 10000,
        }
      );

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<{ error: string }>;
        return rejectWithValue(
          axiosError.response?.data?.error || axiosError.message || "Failed to edit feedback"
        );
      }
      return rejectWithValue("An unexpected error occurred");
    }
  }
);

// 4️⃣ Reply to Feedback (Student)
export const replyToFeedback = createAsyncThunk(
  "feedback/replyToFeedback",
  async (
    { feedback_id, message }: { feedback_id: number; message: string },
    { rejectWithValue }
  ) => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        return rejectWithValue("No authentication token found");
      }

      const response = await axios.post(
        `${USER_URL}/reply-feedback`,
        { feedback_id, message },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          timeout: 10000,
        }
      );

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<{ error: string }>;
        return rejectWithValue(
          axiosError.response?.data?.error || axiosError.message || "Failed to reply to feedback"
        );
      }
      return rejectWithValue("An unexpected error occurred");
    }
  }
);

// 5️⃣ Get My All Feedbacks (Student)
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
        timeout: 10000,
      });

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
