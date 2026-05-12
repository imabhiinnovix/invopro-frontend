import { combineReducers } from 'redux';
import dataSourceReducer from '../pages/dataSources/dataSourceReducer';
import dashboardReducer from '../pages/dashboard/dashboardReducer';
// import naturalLanguageReducer from '../pages/naturalLanguage/naturalLanguageReducer';
import themeReducer from '../pages/createTheme/themeSlice';
import dashboardThemeReducer from './dashboardThemeSlice';
import { configureStore } from '@reduxjs/toolkit';
import customReportsReducer from '../pages/report-settings/customReportsReducer';
import userReducer from './userSlice';
import notivixDashboardReducer from '../pages/notivixDashboard/notivixDashboardReducer'; 
import invoiceSliceReducer from './invoiceSlice';
// 👇 Explicitly define the shape of your Redux state
const rootReducer = combineReducers({
  dataSource: dataSourceReducer,
  dashboard: dashboardReducer,
  theme: themeReducer,
  dashboardTheme: dashboardThemeReducer,
  customReports: customReportsReducer,
  userPermission: userReducer,
  notivixDashboard: notivixDashboardReducer,
  invoice: invoiceSliceReducer

  // naturalLanguageReducer: naturalLanguageReducer,
});

export const store = configureStore({
  reducer: rootReducer,
});

export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = typeof store.dispatch;

export default rootReducer;
