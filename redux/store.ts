import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slice/authSlice';
import classReducer from "./slice/classAndSectionbysearch";
import createClassReducer from "./slice/createClass";
import classesgetallReducer from './slice/getAllClassbysection';
import { manageUserReducer } from './slice/manageuserSlice';
import userReducer from './slice/userSlice';

import sectionReducer from "../redux/slice/sectionSlice/getSectionSlice";



export const store = configureStore({
  reducer: {
    auth: authReducer,
    user: userReducer,
    manageUser: manageUserReducer,
    class: classReducer,
    classesGetAll: classesgetallReducer,
    createClass: createClassReducer,
    section: sectionReducer,//// get all seciton addmin ka hai 


  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
