import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { DashboardListResponse, WidgetTypeResponse, DataSourceResponse, DashboardSliceState, ChartResponse, ChartDataResponse } from './types';
import { fetchDashboardList, fetchWidgetTypes, fetchDataSources, loadMoreDataSources, fetchChartData, deleteWidget } from './dashboardActions';

const initialState: DashboardSliceState = {
  dashboards: [],
  loading: false,
  error: null,
  widgetTypes: [],
  dataSources: [],
  widgetTypesLoading: false,
  dataSourcesLoading: false,
  widgetTypesError: null,
  dataSourcesError: null,
  dataSourcesPage: 1,
  dataSourcesHasMore: true,
  dataSourcesTotalCount: 0,
  charts: [],
  chartsLoading: false,
  chartsError: null,
};

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Dashboard list actions
      .addCase(fetchDashboardList.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDashboardList.fulfilled, (state, action: PayloadAction<DashboardListResponse>) => {
        state.loading = false;
        state.dashboards = action.payload.data;
      })
      .addCase(fetchDashboardList.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch dashboards';
      })
      // Widget types actions
      .addCase(fetchWidgetTypes.pending, (state) => {
        state.widgetTypesLoading = true;
        state.widgetTypesError = null;
      })
      .addCase(fetchWidgetTypes.fulfilled, (state, action: PayloadAction<WidgetTypeResponse>) => {
        state.widgetTypesLoading = false;
        state.widgetTypes = action.payload.data;
      })
      .addCase(fetchWidgetTypes.rejected, (state, action) => {
        state.widgetTypesLoading = false;
        state.widgetTypesError = action.error.message || 'Failed to fetch widget types';
      })
      // Data sources actions
      .addCase(fetchDataSources.pending, (state) => {
        state.dataSourcesLoading = true;
        state.dataSourcesError = null;
      })
      .addCase(fetchDataSources.fulfilled, (state, action: PayloadAction<DataSourceResponse>) => {
        state.dataSourcesLoading = false;
        state.dataSources = action.payload.data;
        state.dataSourcesTotalCount = action.payload.totalCount;
        state.dataSourcesHasMore = action.payload.data.length === 10;
      })
      .addCase(fetchDataSources.rejected, (state, action) => {
        state.dataSourcesLoading = false;
        state.dataSourcesError = action.error.message || 'Failed to fetch data sources';
      })
      // Load more data sources
      .addCase(loadMoreDataSources.pending, (state) => {
        state.dataSourcesLoading = true;
        state.dataSourcesError = null;
      })
      .addCase(loadMoreDataSources.fulfilled, (state, action: PayloadAction<DataSourceResponse>) => {
        state.dataSourcesLoading = false;
        state.dataSources = [...state.dataSources, ...action.payload.data];
        state.dataSourcesTotalCount = action.payload.totalCount;
        state.dataSourcesHasMore = action.payload.data.length === 10;
        state.dataSourcesPage += 1;
      })
      .addCase(loadMoreDataSources.rejected, (state, action) => {
        state.dataSourcesLoading = false;
        state.dataSourcesError = action.error.message || 'Failed to load more data sources';
      })
      // Chart data actions
      .addCase(fetchChartData.pending, (state) => {
        state.chartsLoading = true;
        state.chartsError = null;
      })
      .addCase(fetchChartData.fulfilled, (state, action: PayloadAction<ChartDataResponse>) => {
        state.chartsLoading = false;
        state.charts = action.payload.data;
      })
      .addCase(fetchChartData.rejected, (state, action) => {
        state.chartsLoading = false;
        state.chartsError = action.error.message || 'Failed to fetch chart data';
      })
      // Delete widget actions
      .addCase(deleteWidget.pending, (state) => {
        state.chartsLoading = true;
        state.chartsError = null;
      })
      .addCase(deleteWidget.fulfilled, (state, action) => {
        state.chartsLoading = false;
        if (action.payload.success) {
          state.charts = state.charts.filter(chart => chart._id !== action.meta.arg);
        }
      })
      .addCase(deleteWidget.rejected, (state, action) => {
        state.chartsLoading = false;
        state.chartsError = action.error.message || 'Failed to delete widget';
      });
  },
});

export default dashboardSlice.reducer; 