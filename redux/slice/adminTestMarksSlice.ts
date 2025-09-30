import { approveMarks, bulkApproveMarks, getAllMarks, getPendingMarks, rejectMarks } from '@/thunk/admin/testMarks';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

interface MarksData {
  marks_id: number;
  test_name: string;
  subject_name: string;
  class_name: string;
  section_name: string;
  student_name: string;
  student_email: string;
  marks_obtained: number;
  max_marks: number;
  percentage: string;
  status: string;
  approved_by: string | null;
  approved_at: string | null;
  created_at: string;
  updated_at: string;
}

interface AdminTestMarksState {
  marksData: MarksData[];
  pendingMarks: MarksData[];
  loading: boolean;
  error: string | null;
  filters: {
    status: string;
    test_id: string;
    class_id: string;
    section_id: string;
  };
}

const initialState: AdminTestMarksState = {
  marksData: [],
  pendingMarks: [],
  loading: false,
  error: null,
  filters: {
    status: '',
    test_id: '',
    class_id: '',
    section_id: ''
  }
};

// Async thunks
export const fetchAllMarksAsync = createAsyncThunk(
  'adminTestMarks/fetchAllMarks',
  async (filters: any, { rejectWithValue }) => {
    try {
      const response = await getAllMarks(filters);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchPendingMarksAsync = createAsyncThunk(
  'adminTestMarks/fetchPendingMarks',
  async (_, { rejectWithValue }) => {
    try {
      const response = await getPendingMarks();
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const approveMarkAsync = createAsyncThunk(
  'adminTestMarks/approveMark',
  async (marks_id: number, { rejectWithValue }) => {
    try {
      const response = await approveMarks({ marks_id });
      return { response, marks_id };
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const rejectMarkAsync = createAsyncThunk(
  'adminTestMarks/rejectMark',
  async ({ marks_id, reason }: { marks_id: number; reason?: string }, { rejectWithValue }) => {
    try {
      const response = await rejectMarks({ marks_id, reason });
      return { response, marks_id };
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const bulkApproveMarksAsync = createAsyncThunk(
  'adminTestMarks/bulkApproveMarks',
  async (marks_ids: number[], { rejectWithValue }) => {
    try {
      const response = await bulkApproveMarks({ marks_ids });
      return { response, marks_ids };
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const adminTestMarksSlice = createSlice({
  name: 'adminTestMarks',
  initialState,
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearError: (state) => {
      state.error = null;
    },
    resetState: (state) => {
      state.marksData = [];
      state.pendingMarks = [];
      state.loading = false;
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch All Marks
      .addCase(fetchAllMarksAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllMarksAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.marksData = action.payload.data || [];
      })
      .addCase(fetchAllMarksAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Fetch Pending Marks
      .addCase(fetchPendingMarksAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPendingMarksAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.pendingMarks = action.payload.data || [];
      })
      .addCase(fetchPendingMarksAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Approve Mark
      .addCase(approveMarkAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(approveMarkAsync.fulfilled, (state, action) => {
        state.loading = false;
        // Remove approved mark from pending list
        state.pendingMarks = state.pendingMarks.filter(
          mark => mark.marks_id !== action.payload.marks_id
        );
        // Update status in all marks list
        state.marksData = state.marksData.map(mark =>
          mark.marks_id === action.payload.marks_id
            ? { ...mark, status: 'approved' }
            : mark
        );
      })
      .addCase(approveMarkAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Reject Mark
      .addCase(rejectMarkAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(rejectMarkAsync.fulfilled, (state, action) => {
        state.loading = false;
        // Remove rejected mark from pending list
        state.pendingMarks = state.pendingMarks.filter(
          mark => mark.marks_id !== action.payload.marks_id
        );
        // Update status in all marks list
        state.marksData = state.marksData.map(mark =>
          mark.marks_id === action.payload.marks_id
            ? { ...mark, status: 'rejected' }
            : mark
        );
      })
      .addCase(rejectMarkAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Bulk Approve Marks
      .addCase(bulkApproveMarksAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(bulkApproveMarksAsync.fulfilled, (state, action) => {
        state.loading = false;
        // Remove approved marks from pending list
        state.pendingMarks = state.pendingMarks.filter(
          mark => !action.payload.marks_ids.includes(mark.marks_id)
        );
        // Update status in all marks list
        state.marksData = state.marksData.map(mark =>
          action.payload.marks_ids.includes(mark.marks_id)
            ? { ...mark, status: 'approved' }
            : mark
        );
      })
      .addCase(bulkApproveMarksAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  }
});

export const { setFilters, clearError, resetState } = adminTestMarksSlice.actions;
export default adminTestMarksSlice.reducer;
