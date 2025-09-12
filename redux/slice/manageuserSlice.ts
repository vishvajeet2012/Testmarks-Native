import { manageStudentUser, ManageUserResponse, ManageUserState } from "@/thunk/user/userMange";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";



const initialState: ManageUserState = {
  loading: false,
  success: false,
  error: null,
  updatedUser: null,
};

const manageUserSlice = createSlice({
  name: "manageUser",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(manageStudentUser.pending, (state) => {
        state.loading = true;
        state.success = false;
        state.error = null;
      })
      .addCase(manageStudentUser.fulfilled, (state, action: PayloadAction<ManageUserResponse>) => {
        state.loading = false;
        state.success = true;
        state.error = null;
        state.updatedUser = action.payload.data || null;
      })
      .addCase(manageStudentUser.rejected, (state, action) => {
        state.loading = false;
        state.success = false;
        state.error = action.payload || "Failed to manage user";
        state.updatedUser = null;
      });
  },
})

export default manageUserSlice.reducer;
export const manageUserReducer = manageUserSlice.reducer;
