import {
  getAllFeedbacks,
  getMyAllFeedbacks,
} from "@/thunk/feedback/getFeedbackThunk";
import { createSlice } from "@reduxjs/toolkit";

export interface Feedback {
  feedback_id?: number;
  sender_role?: string;
  sender_name?: string;
  message?: string;
  created_at?: string;
  is_my_reply?: boolean;
}

export interface TestFeedback {
  test_id?: number;
  test_name?: string;
  subject_name?: string;
  teacher_name?: string;
  date_conducted?: string;
  marks_obtained?: number;
  max_marks?: number;
  percentage?: number;
  feedbacks?: Feedback[];
  total_feedbacks?: number;
}

export interface GetFeedbackState {
  loading: boolean;
  success: boolean;
  error: string | null;
  testFeedbacks: TestFeedback[];
}

const initialState: GetFeedbackState = {
  loading: false,
  success: false,
  error: null,
  testFeedbacks: [],
};

const getFeedbackSlice = createSlice({
  name: "getFeedback",
  initialState,
  reducers: {
    clearGetFeedbackError: (state) => {
      state.error = null;
    },
    clearGetFeedbackSuccess: (state) => {
      state.success = false;
    },
    clearGetFeedbackData: (state) => {
      state.testFeedbacks = [];
      state.success = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get All Feedbacks
      .addCase(getAllFeedbacks.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(getAllFeedbacks.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.error = null;
        console.log('getAllFeedbacks fulfilled payload:', action.payload);
        if (action.payload.data && Array.isArray(action.payload.data)) {
          state.testFeedbacks = action.payload.data as TestFeedback[];
        }
      })
      .addCase(getAllFeedbacks.rejected, (state, action) => {
        state.loading = false;
        state.success = false;
        state.error = typeof action.payload === "string" ? action.payload : "Failed to get all feedbacks";
      })

      // Get My All Feedbacks
      .addCase(getMyAllFeedbacks.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(getMyAllFeedbacks.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.error = null;
        console.log('getMyAllFeedbacks fulfilled payload:', action.payload);
        if (action.payload.data && Array.isArray(action.payload.data)) {
          state.testFeedbacks = action.payload.data as TestFeedback[];
        }
      })
      .addCase(getMyAllFeedbacks.rejected, (state, action) => {
        state.loading = false;
        state.success = false;
        state.error = typeof action.payload === "string" ? action.payload : "Failed to get my feedbacks";
      });
  },
});

export const { clearGetFeedbackError, clearGetFeedbackSuccess, clearGetFeedbackData } = getFeedbackSlice.actions;
export default getFeedbackSlice.reducer;
