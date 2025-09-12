import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slice/authSlice';
import classReducer from "./slice/classAndSectionbysearch";
import { manageUserReducer } from './slice/manageuserSlice'; // Adjust path as needed
import userReducer from './slice/userSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
        user: userReducer,
         manageUser: manageUserReducer,
 class: classReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
