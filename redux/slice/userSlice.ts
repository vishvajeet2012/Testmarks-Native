import { getRolebaseuser } from '@/thunk/auth/user'; // Import the thunk
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface User {
  user_id: number;
  name: string;
  email: string;
  mobile_number: string | null;
  role: string;
  status: string;
  profile_picture: string | null;
  created_at: string;
  updated_at: string;
}

interface UserState {
  users: User[];
  count: number;
  isLoading: boolean;
  error: string | null;
  message: string | null;
}

const initialState: UserState = {
  users: [],
  count: 0,
  isLoading: false,
  error: null,
  message: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    // ✅ These actions are defined here in the slice
    clearError: (state) => {
      state.error = null;
    },
    clearMessage: (state) => {
      state.message = null;
    },
    clearUsers: (state) => {
      state.users = [];
      state.count = 0;
      state.error = null;
      state.message = null;
    },
    setUsers: (state, action: PayloadAction<User[]>) => {
      state.users = action.payload;
      state.count = action.payload.length;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getRolebaseuser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getRolebaseuser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.users = action.payload.user;
        state.count = action.payload.count;
        state.message = action.payload.message;
        state.error = null;
      })
      .addCase(getRolebaseuser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to fetch users';
        state.users = [];
        state.count = 0;
      });
  },
});

// ✅ Export actions from the slice
export const { clearError, clearMessage, clearUsers, setUsers } = userSlice.actions;

// ✅ Export the reducer as default
export default userSlice.reducer;
