import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { getTeacherDashboard } from '../../thunk/teacherScreen/teacherDashbord';

interface TeacherDetails {
  user_id: number;
  name: string;
  email: string;
  profile_picture: string | null;
}

interface Subject {
  subjectId: number;
  subjectName: string;
}

interface Student {
  studentId: number;
  name: string;
  email: string;
  rollNumber: string;
  profilePicture: string;
}

interface CreatedBy {
  teacherId: number;
  teacherName: string;
  teacherEmail: string;
}

interface Test {
  testId: number;
  testName: string;
  subjectName: string;
  dateConducted: string;
  maxMarks: number;
  testRank: number | null;
  createdBy: CreatedBy;
  studentMarks: any[];
  totalStudents: number;
  averageMarks: number;
}

interface Section {
  sectionId: number;
  sectionName: string;
  isClassTeacher: boolean;
  studentCount: number;
  students: Student[];
  tests: Test[];
  totalTests: number;
}

interface AssignedClass {
  classId: number;
  className: string;
  description: string | null;
  subjects: Subject[];
  sections: Section[];
}

interface TeacherDashboardData {
  teacherDetails: TeacherDetails;
  assignedClasses: AssignedClass[];
}

interface TeacherDashbordState {
  data: TeacherDashboardData | null;
  loading: boolean;
  error: string | null;
}

const initialState: TeacherDashbordState = {
  data: null,
  loading: false,
  error: null,
};

const teacherDashbordSlice = createSlice({
  name: 'teacherDashbord',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getTeacherDashboard.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getTeacherDashboard.fulfilled, (state, action: PayloadAction<TeacherDashboardData>) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(getTeacherDashboard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default teacherDashbordSlice.reducer;
