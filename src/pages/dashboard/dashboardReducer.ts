import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { DashboardState, DashboardListResponse } from './types';
import { fetchDashboardList } from './dashboardActions';

const initialState: DashboardState = {
  dashboards: [],
  loading: false,
  error: null,
};

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardList.pending, (state: DashboardState) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDashboardList.fulfilled, (state: DashboardState, action: PayloadAction<DashboardListResponse>) => {
        state.loading = false;
        state.dashboards = action.payload.data;
      })
      .addCase(fetchDashboardList.rejected, (state: DashboardState, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch dashboards';
      });
  },
});

export default dashboardSlice.reducer; 