import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { DashboardListResponse, WidgetTypeResponse, DataSourceResponse, DashboardSliceState } from './types';
import { fetchDashboardList, fetchWidgetTypes, fetchDataSources, loadMoreDataSources } from './dashboardActions';

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
      });
  },
});

export default dashboardSlice.reducer; 