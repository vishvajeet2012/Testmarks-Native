import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { createTestAndNotifyStudents } from '../../thunk/teacherScreen/createTestAndNotify';

interface CreateTestData {
  message: string;
  test: any; // Adjust type based on test object structure if known
}

interface CreateTestState {
  loading: boolean;
  error: string | null;
  data: CreateTestData | null;
}

const initialState: CreateTestState = {
  loading: false,
  error: null,
  data: null,
};

const createTestSlice = createSlice({
  name: 'createTest',
  initialState,
  reducers: {
    resetCreateTestState: (state) => {
      state.loading = false;
      state.error = null;
      state.data = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createTestAndNotifyStudents.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createTestAndNotifyStudents.fulfilled, (state, action: PayloadAction<CreateTestData>) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(createTestAndNotifyStudents.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { resetCreateTestState } = createTestSlice.actions;
export default createTestSlice.reducer;
