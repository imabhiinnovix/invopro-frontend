import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { DashboardListResponse, WidgetTypeResponse, DataSourceResponse, DashboardSliceState, ChartDataResponse, ChartResponse } from './types';
import { fetchDashboardList, fetchWidgetTypes, fetchDataSources, loadMoreDataSources, fetchChartData, deleteWidget, updateWidget, createWidget, fetchAllDataSources } from './dashboardActions';

interface Condition {
  field: string;
  operator: string;
  value: string;
  _id?: string;
}

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
      // Fetch all data sources
      .addCase(fetchAllDataSources.pending, (state) => {
        state.dataSourcesLoading = true;
        state.dataSourcesError = null;
      })
      .addCase(fetchAllDataSources.fulfilled, (state, action: PayloadAction<DataSourceResponse>) => {
        state.dataSourcesLoading = false;
        state.dataSources = action.payload.data;
        state.dataSourcesTotalCount = action.payload.totalCount;
        state.dataSourcesHasMore = false;
        state.dataSourcesPage = 1;
      })
      .addCase(fetchAllDataSources.rejected, (state, action) => {
        state.dataSourcesLoading = false;
        state.dataSourcesError = action.error.message || 'Failed to fetch all data sources';
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
      })
      // Create widget actions
      .addCase(createWidget.pending, (state) => {
        state.chartsLoading = true;
        state.chartsError = null;
      })
      .addCase(createWidget.fulfilled, (state, action) => {
        state.chartsLoading = false;
        if (action.payload.success) {
          const chartData = {
            ...action.payload.data,
            dimensions: Array.isArray(action.payload.data.dimensions) 
              ? action.payload.data.dimensions 
              : [action.payload.data.dimensions],
            groupBy: Array.isArray(action.payload.data.groupBy) 
              ? action.payload.data.groupBy 
              : [action.payload.data.groupBy],
            conditions: action.payload.data.conditions.map((condition: Condition) => ({
              ...condition,
              _id: condition._id || ''
            }))
          };
          state.charts = [...state.charts, chartData];
        }
      })
      .addCase(createWidget.rejected, (state, action) => {
        state.chartsLoading = false;
        state.chartsError = action.error.message || 'Failed to create widget';
      })
      // Update widget actions
      .addCase(updateWidget.pending, (state) => {
        state.chartsLoading = true;
        state.chartsError = null;
      })
      .addCase(updateWidget.fulfilled, (state, action) => {
        state.chartsLoading = false;
        if (action.payload.success) {
          const updatedWidget = action.meta.arg;
          state.charts = state.charts.map(chart => 
            chart._id === updatedWidget._id ? {
              ...chart,
              name: updatedWidget.name,
              dimensions: Array.isArray(updatedWidget.dimensions) ? updatedWidget.dimensions : [updatedWidget.dimensions],
              groupBy: Array.isArray(updatedWidget.groupBy) ? updatedWidget.groupBy : [updatedWidget.groupBy],
              aggregation: updatedWidget.aggregation,
              position: updatedWidget.position,
              conditions: updatedWidget.conditions.map((condition: Condition) => {
                const existingCondition = chart.conditions.find(c => c.field === condition.field);
                return {
                  field: condition.field,
                  operator: condition.operator,
                  value: condition.value,
                  _id: existingCondition?._id || condition._id || ''
                };
              }),
              dataSourceId: updatedWidget.dataSourceId,
              widgetTypeId: updatedWidget.widgetTypeId,
            } : chart
          );
        }
      })
      .addCase(updateWidget.rejected, (state, action) => {
        state.chartsLoading = false;
        state.chartsError = action.error.message || 'Failed to update widget';
      });
  },
});

export default dashboardSlice.reducer; 