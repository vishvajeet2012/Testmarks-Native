import { fetchAllClasses } from "@/thunk/classandsection/getallClassbysection";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

 interface Teacher {
  teacher_id: number | null;
  name: string | null;
  email: string | null;
  assigned_subjects: string[] | null;
  class_assignments: string[] | null;
  created_at: string | null;
  updated_at: string | null;
}

 interface Section {
  section_id: number;
  section_name: string;
  total_students: number;
  class_teacher_id: number | null;
  section_created_at: string;
  section_updated_at: string;
}
interface ClassData {
  class_id: number;
  class_name: string;
  description: string;
  class_created_at: string;
  class_updated_at: string;
  sections: Section[];
  class_teacher: Teacher;
}

 interface ClassesResponse {
  message: string;
  data: ClassData[];
} interface ClassesState {
  classes: ClassData[];
  loading: boolean;
  error: string | null;
}

const initialState: ClassesState = {
  classes: [],
  loading: false,
  error: null,
};

const classesSlice = createSlice({
  name: 'classes',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearClasses: (state) => {
      state.classes = [];
      state.error = null;
      state.loading = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllClasses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchAllClasses.fulfilled,
        (state, action: PayloadAction<ClassData[]>) => {
          state.loading = false;
          state.classes = action.payload;
          state.error = null;
        }
      )
      .addCase(fetchAllClasses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch classes';
      });
  },
});

export const { clearError, clearClasses } = classesSlice.actions;
export default classesSlice.reducer;
