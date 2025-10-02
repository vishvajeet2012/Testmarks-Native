import { getStudentAnalytics } from '@/thunk/studentscreen/studentAnalytics';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface SubjectWisePerformance {
  subject: string;
  average_marks: number;
  total_tests: number;
  average_percentage: number;
}

interface PerformanceTrend {
  month: string;
  average_marks: number;
  total_tests: number;
  average_percentage: number;
}

interface GradeDistribution {
  excellent: number;
  good: number;
  average: number;
  below_average: number;
  poor: number;
}

interface ClassComparison {
  subject: string;
  student_average: number;
  class_average: number;
  total_students: number;
}

interface RecentTest {
  test_name: string;
  subject: string;
  marks_obtained: number;
  max_marks: number;
  percentage: number;
  date: string;
}

interface Overview {
  total_tests: number;
  total_marks_obtained: number;
  total_max_marks: number;
  overall_percentage: number;
  completion_rate: number;
  completed_tests: number;
  pending_tests: number;
}

interface StudentAnalyticsData {
  overview: Overview;
  subject_wise_performance: SubjectWisePerformance[];
  performance_trend: PerformanceTrend[];
  grade_distribution: GradeDistribution;
  class_comparison: ClassComparison[];
  recent_tests: RecentTest[];
}

interface StudentAnalyticsState {
  data: StudentAnalyticsData | null;
  loading: boolean;
  error: string | null;
}

const initialState: StudentAnalyticsState = {
  data: null,
  loading: false,
  error: null,
};

const studentAnalyticsSlice = createSlice({
  name: 'studentAnalytics',
  initialState,
  reducers: {
    clearStudentAnalytics: (state) => {
      state.data = null;
      state.error = null;
      state.loading = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getStudentAnalytics.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getStudentAnalytics.fulfilled, (state, action: PayloadAction<StudentAnalyticsData>) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(getStudentAnalytics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearStudentAnalytics } = studentAnalyticsSlice.actions;
export default studentAnalyticsSlice.reducer;
