import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { getAdminAnalytics } from '../../../thunk/admin/adminAnalytics';

interface AdminAnalyticsData {
  overall_statistics: {
    total_students: number;
    active_students: number;
    total_teachers: number;
    active_teachers: number;
    total_classes: number;
    total_sections: number;
    total_subjects: number;
    total_tests: number;
    test_completion_rate: number;
    student_participation_rate: number;
  };
  enrollment_trend: Array<{
    month: string;
    student_count: number;
  }>;
  class_performance: Array<{
    class_id: number;
    class_name: string;
    total_students: number;
    total_tests: number;
    average_percentage: number;
    total_marks_obtained: number;
    total_max_marks: number;
  }>;
  subject_performance: Array<{
    subject_id: number;
    subject_name: string;
    test_count: number;
    average_percentage: number;
    total_students_attempted: number;
  }>;
  teacher_performance: Array<{
    teacher_id: number;
    teacher_name: string;
    teacher_email: string;
    tests_created: number;
    feedback_given: number;
    sections_assigned: number;
  }>;
  top_students: Array<{
    student_id: number;
    student_name: string;
    roll_number: string;
    class: string;
    section: string;
    total_tests: number;
    average_percentage: number;
  }>;
  monthly_test_trend: Array<{
    month: string;
    test_count: number;
  }>;
  grade_distribution: Array<{
    grade: string;
    count: number;
    color: string;
  }>;
  recent_activities: {
    tests_created: number;
    feedback_given: number;
    marks_approved: number;
    new_enrollments: number;
  };
  pending_actions: {
    marks_pending_approval: number;
    pending_by_class: Array<{
      class_name: string;
      pending_count: number;
    }>;
  };
}

interface AdminAnalyticsState {
  data: AdminAnalyticsData | null;
  loading: boolean;
  error: string | null;
}

const initialState: AdminAnalyticsState = {
  data: null,
  loading: false,
  error: null,
};

const adminAnalyticsSlice = createSlice({
  name: 'adminAnalytics',
  initialState,
  reducers: {
    clearAdminAnalytics: (state) => {
      state.data = null;
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getAdminAnalytics.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAdminAnalytics.fulfilled, (state, action: PayloadAction<AdminAnalyticsData>) => {
        state.loading = false;
        state.data = action.payload;
        state.error = null;
      })
      .addCase(getAdminAnalytics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearAdminAnalytics } = adminAnalyticsSlice.actions;
export default adminAnalyticsSlice.reducer;
