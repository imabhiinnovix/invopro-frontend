import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { mockNotivixChartData } from './mockData';
import { NotivixChartResponse } from './types';

// Mock chart data action
export const fetchNotivixChartData = createAsyncThunk(
  'notivixDashboard/fetchChartData',
  async (dashboardId: string) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Return mock data
    return mockNotivixChartData;
  }
);

interface NotivixDashboardState {
  chartData: NotivixChartResponse | null;
  loading: boolean;
  error: string | null;
}

const initialState: NotivixDashboardState = {
  chartData: null,
  loading: false,
  error: null,
};

const notivixDashboardSlice = createSlice({
  name: 'notivixDashboard',
  initialState,
  reducers: {
    clearNotivixChartData: (state) => {
      state.chartData = null;
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotivixChartData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNotivixChartData.fulfilled, (state, action: PayloadAction<NotivixChartResponse>) => {
        state.loading = false;
        state.chartData = action.payload;
        state.error = null;
      })
      .addCase(fetchNotivixChartData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch chart data';
      });
  },
});

export const { clearNotivixChartData } = notivixDashboardSlice.actions;
export default notivixDashboardSlice.reducer; 