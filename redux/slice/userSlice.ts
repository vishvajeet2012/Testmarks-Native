import { getRolebaseuser } from "@/thunk/auth/user";
import { createSlice } from "@reduxjs/toolkit";

interface UserProfile {
  teacher_id?: number;
  student_id?: number;
  assigned_subjects?: string[];
  class_assignments?: string[];
  roll_number?: string;
  class_id?: number;
  section_id?: number;
  dob?: string;
  guardian_name?: string;
  guardian_mobile_number?: string;
  student_mobile_number?: string;
  class_name?: string;
  section_name?: string;
  created_at: string;
  updated_at: string;
}

interface User {
  user_id: number;
  name: string;
  email: string;
  mobile_number: string | null;
  profile_picture: string | null;
  role: string;
  status: string;
  created_at: string;
  updated_at: string;
  profile: UserProfile | null;
}

interface UserState {
  users: User[];
  count: number;
  isLoading: boolean;
  error: string | null;
  success: boolean;
}

const initialState: UserState = {
  users: [],
  count: 0,
  isLoading: false,
  error: null,
  success: false,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    clearUserError: (state) => {
      state.error = null;
    },
    clearUsers: (state) => {
      state.users = [];
      state.count = 0;
      state.success = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getRolebaseuser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(getRolebaseuser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.success = true;
        state.error = null;
        state.users = action.payload.users;
        state.count = action.payload.count;
      })
      .addCase(getRolebaseuser.rejected, (state, action) => {
        state.isLoading = false;
        state.success = false;
        state.error = action.payload || "Failed to fetch users";
        state.users = [];
        state.count = 0;
      });
  },
});

export const { clearUserError, clearUsers } = userSlice.actions;
export default userSlice.reducer;
