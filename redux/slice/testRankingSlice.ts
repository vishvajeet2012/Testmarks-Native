import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { getTestRanking } from '../../thunk/teacher/testRanking';

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

interface TestRankingData {
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

interface TestRankingState {
  data: TestRankingData | null;
  loading: boolean;
  error: string | null;
}

const initialState: TestRankingState = {
  data: null,
  loading: false,
  error: null,
};

const testRankingSlice = createSlice({
  name: 'testRanking',
  initialState,
  reducers: {
    clearTestRanking: (state) => {
      state.data = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getTestRanking.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getTestRanking.fulfilled, (state, action: PayloadAction<TestRankingData>) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(getTestRanking.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearTestRanking } = testRankingSlice.actions;
export default testRankingSlice.reducer;
