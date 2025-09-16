import { APIResponse, fetchSectionDetails, SectionDetailsData } from '@/thunk/section/getsectionDetails';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface SectionState {
  loading: boolean;
  error: string | null;
  success: boolean;
  message: string;
  data: SectionDetailsData | null;
}

const initialState: SectionState = {
  loading: false,
  error: null,
  success: false,
  message: '',
  data: null,
};

const sectionSlice = createSlice({
  name: 'section',
  initialState,
  reducers: {
    resetSectionState: (state) => {
      state.loading = false;
      state.error = null;
      state.success = false;
      state.message = '';
      state.data = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSectionDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSectionDetails.fulfilled, (state, action: PayloadAction<APIResponse>) => {
        state.loading = false;
        state.success = action.payload.success;
        state.message = action.payload.message;
        state.data = action.payload.data;
      })
      .addCase(fetchSectionDetails.rejected, (state, action) => {
        state.loading = false;
        state.error =
          (action.payload as string) ?? action.error.message ?? 'Failed to fetch section details';
      });
  },
});

export const { resetSectionState } = sectionSlice.actions;
export default sectionSlice.reducer;
