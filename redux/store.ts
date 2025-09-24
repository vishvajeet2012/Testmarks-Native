import { configureStore } from '@reduxjs/toolkit';
import sectionReducer from "../redux/slice/sectionSlice/getSectionSlice";
import teacherSearchReducer from "../thunk/teacher/teacherSearch";
import authReducer from './slice/authSlice';
import classReducer from "./slice/classAndSectionbysearch";
import createClassReducer from "./slice/createClass";
import classesgetallReducer from './slice/getAllClassbysection';
import { manageUserReducer } from './slice/manageuserSlice';
import userReducer from './slice/userSlice';


export const store = configureStore({
  reducer: {
    auth: authReducer,
    user: userReducer,
    manageUser: manageUserReducer,
    class: classReducer,
    classesGetAll: classesgetallReducer,
    createClass: createClassReducer,
    section: sectionReducer,
    teacherSearch:teacherSearchReducer

  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
