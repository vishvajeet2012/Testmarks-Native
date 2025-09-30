import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { bulkUpdateMarks, getMyTestMarks, updateStudentMarks } from '../../thunk/teacher/marks';

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

interface MarksState {
  marks: MarksData[];
  loading: boolean;
  error: string | null;
  updateLoading: boolean;
  updateError: string | null;
  bulkUpdateLoading: boolean;
  bulkUpdateError: string | null;
  lastUpdateResult: any;
  bulkUpdateResult: any;
}

const initialState: MarksState = {
  marks: [],
  loading: false,
  error: null,
  updateLoading: false,
  updateError: null,
  bulkUpdateLoading: false,
  bulkUpdateError: null,
  lastUpdateResult: null,
  bulkUpdateResult: null,
};

const marksSlice = createSlice({
  name: 'marks',
  initialState,
  reducers: {
    clearMarks: (state) => {
      state.marks = [];
      state.error = null;
    },
    clearUpdateResult: (state) => {
      state.lastUpdateResult = null;
      state.updateError = null;
    },
    clearBulkUpdateResult: (state) => {
      state.bulkUpdateResult = null;
      state.bulkUpdateError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get My Test Marks
      .addCase(getMyTestMarks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getMyTestMarks.fulfilled, (state, action: PayloadAction<{ data: MarksData[]; total: number }>) => {
        state.loading = false;
        state.marks = action.payload.data;
      })
      .addCase(getMyTestMarks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Update Student Marks
      .addCase(updateStudentMarks.pending, (state) => {
        state.updateLoading = true;
        state.updateError = null;
      })
      .addCase(updateStudentMarks.fulfilled, (state, action: PayloadAction<any>) => {
        state.updateLoading = false;
        state.lastUpdateResult = action.payload;
        // Update the marks in the list if it exists
        const updatedMark = action.payload.data;
        if (updatedMark) {
          const index = state.marks.findIndex(mark => mark.marks_id === updatedMark.marks_id);
          if (index !== -1) {
            state.marks[index] = { ...state.marks[index], ...updatedMark };
          }
        }
      })
      .addCase(updateStudentMarks.rejected, (state, action) => {
        state.updateLoading = false;
        state.updateError = action.payload as string;
      })
      // Bulk Update Marks
      .addCase(bulkUpdateMarks.pending, (state) => {
        state.bulkUpdateLoading = true;
        state.bulkUpdateError = null;
      })
      .addCase(bulkUpdateMarks.fulfilled, (state, action: PayloadAction<any>) => {
        state.bulkUpdateLoading = false;
        state.bulkUpdateResult = action.payload;
      })
      .addCase(bulkUpdateMarks.rejected, (state, action) => {
        state.bulkUpdateLoading = false;
        state.bulkUpdateError = action.payload as string;
      });
  },
});

export const { clearMarks, clearUpdateResult, clearBulkUpdateResult } = marksSlice.actions;
export default marksSlice.reducer;
