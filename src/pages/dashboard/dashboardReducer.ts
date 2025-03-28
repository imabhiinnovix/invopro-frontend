import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { DashboardListResponse, WidgetTypeResponse, DataSourceResponse, DashboardSliceState } from './types';
import { fetchDashboardList, fetchWidgetTypes, fetchDataSources } from './dashboardActions';

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
      })
      .addCase(fetchDataSources.rejected, (state, action) => {
        state.dataSourcesLoading = false;
        state.dataSourcesError = action.error.message || 'Failed to fetch data sources';
      });
  },
});

export default dashboardSlice.reducer; 