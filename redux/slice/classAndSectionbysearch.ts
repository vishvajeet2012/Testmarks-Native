import { ClassData, searchClassBySectionWithQuery } from '@/thunk/classandsection/getClassSectionBySearch';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ClassState {
  classes: ClassData[];
  loading: boolean;
  error: string | null;
  searchQuery: string;
}

const initialState: ClassState = {
  classes: [],
  loading: false,
  error: null,
  searchQuery: '',
};

const classSlice = createSlice({
  name: 'class',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearClasses: (state) => {
      state.classes = [];
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(searchClassBySectionWithQuery.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchClassBySectionWithQuery.fulfilled, (state, action) => {
        state.loading = false;
        state.classes = action.payload.data;
        state.error = null;
      })
      .addCase(searchClassBySectionWithQuery.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to search classes';
        state.classes = [];
      });
  },
});

export const { clearError, clearClasses, setSearchQuery } = classSlice.actions;
export default classSlice.reducer;
