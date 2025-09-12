import { fetchTeacherBySearch } from '@/thunk/teacher/teacherSearch';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

 interface TeacherSearch {
  teacher_id: number;
  name: string;
  mobile_number: string;
  email: string;
}

 interface TeacherState {
  teachers: TeacherSearch[];
  loading: boolean;
  error: string | null;
}

const initialState: TeacherState = {
  teachers: [],
  loading: false,
  error: null,
};

const teacherSlice = createSlice({
  name: 'teacher',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    resetTeachers: (state) => {
      state.teachers = [];
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTeacherBySearch.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTeacherBySearch.fulfilled, (state, action: PayloadAction<TeacherSearch[]>) => {
        state.loading = false;
        state.teachers = action.payload;
        state.error = null;
      })
      .addCase(fetchTeacherBySearch.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, resetTeachers } = teacherSlice.actions;
export default teacherSlice.reducer;
