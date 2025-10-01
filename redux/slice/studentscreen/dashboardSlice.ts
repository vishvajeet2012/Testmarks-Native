import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { getStudentDashboard } from '../../../thunk/studentscreen/dashboard';

interface Student {
  name: string;
  email: string;
  profile_picture: string | null;
  roll_number: string;
  class: string;
  section: string;
}

interface Teacher {
  name: string;
  email: string;
  profile_picture: string | null;
}

interface Feedback {
  feedback_id: number;
  message: string;
  created_at: string;
  updated_at: string;
  teacher: Teacher;
  student: {
    name: string;
    email: string;
    profile_picture: string | null;
  };
}

interface CompletedTest {
  test_id: number;
  test_name: string;
  subject: string;
  date_conducted: string;
  max_marks: number;
  marks_obtained: number;
  status: string;
  test_rank: number | null;
  teacher: Teacher;
  feedback: Feedback[];
}

interface PendingTest {
  test_id: number;
  test_name: string;
  subject: string;
  date_conducted: string;
  max_marks: number;
  marks_obtained: number | null;
  status: string;
  test_rank: number | null;
  teacher: Teacher;
}

interface UpcomingTest {
  test_id: number;
  test_name: string;
  subject: string;
  date_conducted: string;
  max_marks: number;
  test_rank: number | null;
  teacher: Teacher;
}

interface Summary {
  total_completed: number;
  total_pending: number;
  total_upcoming: number;
}

interface DashboardData {
  student: Student;
  completed_tests: CompletedTest[];
  pending_tests: PendingTest[];
  upcoming_tests: UpcomingTest[];
  summary: Summary;
}

interface StudentDashboardState {
  data: DashboardData | null;
  loading: boolean;
  error: string | null;
}

const initialState: StudentDashboardState = {
  data: null,
  loading: false,
  error: null,
};

const dashboardSlice = createSlice({
  name: 'studentDashboard',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getStudentDashboard.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getStudentDashboard.fulfilled, (state, action: PayloadAction<{ success: boolean; data: DashboardData }>) => {
        state.loading = false;
        state.data = action.payload.data;
      })
      .addCase(getStudentDashboard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default dashboardSlice.reducer;
