import { combineReducers } from 'redux';
import dataSourceReducer from '../pages/dataSources/dataSourceReducer';
import dashboardReducer from '../pages/dashboard/dashboardReducer';
import naturalLanguageReducer from '../pages/naturalLanguage/naturalLanguageReducer';
import themeReducer from '../pages/createTheme/themeSlice';
import { configureStore } from '@reduxjs/toolkit';

// 👇 Explicitly define the shape of your Redux state
const rootReducer = combineReducers({
  dataSource: dataSourceReducer,
  dashboard: dashboardReducer,
  theme: themeReducer,
  naturalLanguageReducer: naturalLanguageReducer,
});

export const store = configureStore({
  reducer: rootReducer,
});

export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = typeof store.dispatch;

export default rootReducer;
