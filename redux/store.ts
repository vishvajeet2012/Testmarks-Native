import { configureStore } from '@reduxjs/toolkit';
import addSectionTeacher from '../thunk/section/addSectionTeacher';
import subjectReducer from '../thunk/subject/searchSubject';
import teacherSearchReducer from "../thunk/teacher/teacherSearch";
import adminAnalyticsReducer from './slice/admin/adminAnalyticsSlice';
import auditLogReducer from './slice/admin/auditLogSlice';
import adminTestMarksReducer from './slice/adminTestMarksSlice';
import authReducer from './slice/authSlice';
import classReducer from "./slice/classAndSectionbysearch";
import createClassReducer from "./slice/createClass";
import createTestReducer from './slice/createTestSlice';
import feedbackReducer from './slice/feedbackSlice';
import classesgetallReducer from './slice/getAllClassbysection';
import getFeedbackReducer from './slice/getFeedbackSlice';
import { manageUserReducer } from './slice/manageuserSlice';
import marksReducer from './slice/marksSlice';
import notificationReducer from './slice/notificationSlice';
import sectionReducer from "./slice/sectionSlice/getSectionSlice";
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
    addSectionTeacher: addSectionTeacher,
    marks: marksReducer,
    adminTestMarks: adminTestMarksReducer,
    testRanking: testRankingSlice,
    studentDashboard: studentDashboardReducer,
    adminAnalytics: adminAnalyticsReducer,
    auditLog: auditLogReducer,

    studentAnalytics: studentAnalyticsReducer,
    notifications: notificationReducer,
    feedback: feedbackReducer,
    getFeedback: getFeedbackReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
