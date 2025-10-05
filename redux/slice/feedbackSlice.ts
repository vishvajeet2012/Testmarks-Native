import {
  createFeedback,
  editFeedback,
  Feedback,
  FeedbackState,
  getMyAllFeedbacks,
  getTestFeedbacks,
  replyToFeedback
} from "@/thunk/feedback/feedbackThunk";
import { createSlice } from "@reduxjs/toolkit";

const initialState: FeedbackState = {
  loading: false,
  success: false,
  error: null,
  feedback: null,
  feedbacks: [],
};

const feedbackSlice = createSlice({
  name: "feedback",
  initialState,
  reducers: {
    clearFeedbackError: (state) => {
      state.error = null;
    },
    clearFeedbackSuccess: (state) => {
      state.success = false;
    },
    clearFeedbackData: (state) => {
      state.feedback = null;
      state.feedbacks = [];
      state.success = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // Create Feedback
      .addCase(createFeedback.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createFeedback.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.error = null;
        if (action.payload.data && !Array.isArray(action.payload.data)) {
          state.feedback = action.payload.data as Feedback;
        }
      })
      .addCase(createFeedback.rejected, (state, action) => {
        state.loading = false;
        state.success = false;
        state.error = typeof action.payload === 'string' ? action.payload : "Failed to create feedback";
      })

      // Edit Feedback
      .addCase(editFeedback.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(editFeedback.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.error = null;
        if (action.payload.data && !Array.isArray(action.payload.data)) {
          state.feedback = action.payload.data as Feedback;
        }
      })
      .addCase(editFeedback.rejected, (state, action) => {
        state.loading = false;
        state.success = false;
        state.error = typeof action.payload === 'string' ? action.payload : "Failed to edit feedback";
      })

      // Reply to Feedback
      .addCase(replyToFeedback.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(replyToFeedback.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.error = null;
        if (action.payload.data && !Array.isArray(action.payload.data)) {
          state.feedback = action.payload.data as Feedback;
        }
      })
      .addCase(replyToFeedback.rejected, (state, action) => {
        state.loading = false;
        state.success = false;
        state.error = typeof action.payload === 'string' ? action.payload : "Failed to reply to feedback";
      })

      // Get Test Feedbacks
      .addCase(getTestFeedbacks.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(getTestFeedbacks.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.error = null;
        if (action.payload.data && Array.isArray(action.payload.data)) {
          state.feedbacks = action.payload.data as Feedback[];
        }
      })
      .addCase(getTestFeedbacks.rejected, (state, action) => {
        state.loading = false;
        state.success = false;
        state.error = typeof action.payload === 'string' ? action.payload : "Failed to get test feedbacks";
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
        if (action.payload.data && Array.isArray(action.payload.data)) {
          state.feedbacks = action.payload.data as Feedback[];
        }
      })
      .addCase(getMyAllFeedbacks.rejected, (state, action) => {
        state.loading = false;
        state.success = false;
        state.error = typeof action.payload === 'string' ? action.payload : "Failed to get my feedbacks";
      });
  },
});

export const { clearFeedbackError, clearFeedbackSuccess, clearFeedbackData } = feedbackSlice.actions;
export default feedbackSlice.reducer;
