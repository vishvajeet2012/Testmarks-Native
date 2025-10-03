import { configureStore } from '@reduxjs/toolkit';
import sectionReducer from "../redux/slice/sectionSlice/getSectionSlice";
import addSectionTeacehr from '../thunk/section/addSectionTeacher';
import subjectReducer from '../thunk/subject/searchSubject';
import teacherSearchReducer from "../thunk/teacher/teacherSearch";
import adminAnalyticsReducer from './slice/admin/adminAnalyticsSlice';
import adminTestMarksReducer from './slice/adminTestMarksSlice';
import authReducer from './slice/authSlice';
import classReducer from "./slice/classAndSectionbysearch";
import createClassReducer from "./slice/createClass";
import createTestReducer from './slice/createTestSlice';
import classesgetallReducer from './slice/getAllClassbysection';
import { manageUserReducer } from './slice/manageuserSlice';
import marksReducer from './slice/marksSlice';
import notificationReducer from './slice/notificationSlice';
import studentDashboardReducer from './slice/studentscreen/dashboardSlice';
import studentAnalyticsReducer from './slice/studentscreen/studentAnalyticsSlice';
import teacherDashbordReducer from './slice/teacherDashbordSlice';
import testRankingSlice from './slice/testRankingSlice';
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
    teacherDashbord: teacherDashbordReducer,
    createTest: createTestReducer,
    teacherSearch: teacherSearchReducer,
    subject: subjectReducer,
    addSectionTeacher: addSectionTeacehr,
    marks: marksReducer,
    adminTestMarks: adminTestMarksReducer,
    testRanking: testRankingSlice,
    studentDashboard: studentDashboardReducer,
    adminAnalytics: adminAnalyticsReducer,

    studentAnalytics: studentAnalyticsReducer,
    notifications: notificationReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
