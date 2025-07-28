import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  DashboardListResponse,
  WidgetTypeResponse,
  DataSourceResponse,
  ChartDataResponse,
  ChartResponse,
  WidgetResponse,
  TemporaryChart,
  Dashboard,
  WidgetType,
  DataSource,
} from './types';
import { Theme } from '../createTheme/types';
import {
  fetchDashboardList,
  fetchWidgetTypes,
  fetchDataSources,
  loadMoreDataSources,
  fetchChartData,
  deleteWidget,
  updateWidget,
  createWidget,
  fetchAllDataSources,
  saveWidgets,
  fetchDashboardShareUsers,
  fetchWidgetTheme,
  fetchWidgetSettingBasedOnNaturalLanguage,
} from './notivixDashboardActions';
import { WritableDraft } from 'immer';

interface Condition {
  field: string;
  operator: string;
  value: string;
  _id?: string;
}

interface DashboardSliceState {
  dashboards: Dashboard[];
  loading: boolean;
  error: string | null;
  widgetTypes: WidgetType[];
  dataSources: DataSource[];
  widgetTypesLoading: boolean;
  dataSourcesLoading: boolean;
  widgetTypesError: string | null;
  dataSourcesError: string | null;
  dataSourcesHasMore: boolean;
  dataSourcesPage: number;
  dataSourcesTotalCount: number;
  charts: ChartResponse[];
  temporaryCharts: TemporaryChart[];
  chartsLoading: boolean;
  chartsError: string | null;
  widgetData: Record<string, WidgetResponse['data']>;
  shareUsers: string[];
  shareUsersLoading: boolean;
  shareUsersError: string | null;
  widgetTheme: Theme | null;
  widgetThemeLoading: boolean;
  widgetThemeError: string | null;
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
  temporaryCharts: [],
  chartsLoading: false,
  chartsError: null,
  widgetData: {},
  shareUsers: [],
  shareUsersLoading: false,
  shareUsersError: null,
  widgetTheme: null,
  widgetThemeLoading: false,
  widgetThemeError: null,
};

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    storeWidgetData: (state, action: PayloadAction<{ widgetId: string; data: WidgetResponse['data'] }>) => {
      state.widgetData[action.payload.widgetId] = action.payload.data;
    },
    resetChartAndWidgetData: (state) => {
      state.widgetData = {};
      state.charts = [];
    },
    updateChartsData: (state, action: PayloadAction<{ widgetId: string; data: WidgetResponse['data'] }>) => {
      state.charts = state.charts.map((chart) =>
        chart._id === action.payload.widgetId
          ? {
              ...chart,
              name: action.payload.data.name,
              dimensions: Array.isArray(action.payload.data.dimensions)
                ? action.payload.data.dimensions
                : [action.payload.data.dimensions],
              groupBy: Array.isArray(action.payload.data.groupBy)
                ? action.payload.data.groupBy
                : [action.payload.data.groupBy],
              aggregation: action.payload.data.aggregation,
              position: action.payload.data.position,
              conditions: action.payload.data.conditions.map((condition: Condition) => {
                const existingCondition = chart.conditions.find((c) => c.field === condition.field);
                return {
                  field: condition.field,
                  operator: condition.operator,
                  value: condition.value,
                  _id: existingCondition?._id || condition._id || '',
                };
              }),
              dataSourceId: action.payload.data.dataSourceId,
              widgetTypeId: {
                _id: action.payload.data.widgetTypeId as string,
                chartType: action.payload.data?.chartType || 'line',
              },
            }
          : chart
      );
    },
    addTemporaryChart: (state, action: PayloadAction<TemporaryChart>) => {
      state.temporaryCharts.push(action.payload);
    },
    updateTemporaryChart: (state, action: PayloadAction<{ id: string; chart: TemporaryChart }>) => {
      const index = state.temporaryCharts.findIndex((chart) => chart._id === action.payload.id);
      if (index !== -1) {
        state.temporaryCharts[index] = action.payload.chart;
      }
    },
    removeTemporaryChart: (state, action: PayloadAction<string>) => {
      state.temporaryCharts = state.temporaryCharts.filter((chart) => chart._id !== action.payload);
    },
    clearTemporaryCharts: (state) => {
      state.temporaryCharts = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Dashboard list actions
      .addCase(fetchDashboardList.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDashboardList.fulfilled, (state, action: PayloadAction<DashboardListResponse>) => {
        state.loading = false;
        state.dashboards = Array.isArray(action.payload.data) ? action.payload.data : [action.payload.data];
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
      //chartdata from nlquery
      .addCase(fetchWidgetSettingBasedOnNaturalLanguage.pending, (state) => {
        state.chartsLoading = true;
        state.chartsError = null;
      })
      .addCase(fetchWidgetSettingBasedOnNaturalLanguage.fulfilled, (state, action: PayloadAction<any>) => {
        console.log('action', action);
        state.chartsLoading = false;
        state.charts.push(action.payload.data as any);
      })
      .addCase(fetchWidgetSettingBasedOnNaturalLanguage.rejected, (state, action) => {
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
          state.charts = state.charts.filter((chart) => chart._id !== action.meta.arg);
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
              _id: condition._id || '',
            })),
          };
          state.charts = [...(state.charts as any), chartData];
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
          state.charts = state.charts.map((chart) =>
            chart._id === updatedWidget._id
              ? {
                  ...chart,
                  name: updatedWidget.name,
                  dimensions: Array.isArray(updatedWidget.dimensions)
                    ? updatedWidget.dimensions
                    : [updatedWidget.dimensions],
                  groupBy: Array.isArray(updatedWidget.groupBy) ? updatedWidget.groupBy : [updatedWidget.groupBy],
                  aggregation: updatedWidget.aggregation,
                  position: updatedWidget.position,
                  conditions: updatedWidget.conditions.map((condition: Condition) => {
                    const existingCondition = chart.conditions.find((c) => c.field === condition.field);
                    return {
                      field: condition.field,
                      operator: condition.operator,
                      value: condition.value,
                      _id: existingCondition?._id || condition._id || '',
                    };
                  }),
                  dataSourceId: updatedWidget.dataSourceId as any,
                  widgetTypeId: updatedWidget.widgetTypeId as any,
                }
              : chart
          );
        }
      })
      .addCase(updateWidget.rejected, (state, action) => {
        state.chartsLoading = false;
        state.chartsError = action.error.message || 'Failed to update widget';
      })
      .addCase(saveWidgets.pending, (state) => {
        state.chartsLoading = true;
        state.chartsError = null;
      })
      .addCase(saveWidgets.fulfilled, (state) => {
        state.chartsLoading = false;
        // Convert temporary charts to permanent charts
        const convertedCharts: WritableDraft<ChartResponse>[] = state.temporaryCharts.map((chart) => ({
          _id: chart._id,
          createdBy: chart.createdBy,
          dashboardId: chart.dashboardId,
          name: chart.name,
          dimensions: chart.dimensions,
          groupBy: chart.groupBy,
          aggregation: chart.aggregation,
          position: chart.position,
          conditions: chart.conditions,
          dataSourceId: chart.dataSourceId,
          widgetTypeId: chart.widgetTypeId,
          organizationId: chart?.dataSourceId?.organizationId || '',
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          data: chart.data || [],
        }));
        state.charts = [...state.charts, ...convertedCharts];
        state.temporaryCharts = [];
      })
      .addCase(saveWidgets.rejected, (state, action) => {
        state.chartsLoading = false;
        console.log(action);
        state.chartsError = action.error.message || 'Failed to save widgets';
      })
      // Share users actions
      .addCase(fetchDashboardShareUsers.pending, (state) => {
        state.shareUsersLoading = true;
        state.shareUsersError = null;
      })
      .addCase(fetchDashboardShareUsers.fulfilled, (state, action) => {
        state.shareUsersLoading = false;
        state.shareUsers = action.payload.data;
      })
      .addCase(fetchDashboardShareUsers.rejected, (state, action) => {
        state.shareUsersLoading = false;
        state.shareUsersError = action.error.message || 'Failed to fetch share users';
      })
      .addCase(fetchWidgetTheme.pending, (state) => {
        state.widgetThemeLoading = true;
        state.widgetThemeError = null;
      })
      .addCase(fetchWidgetTheme.fulfilled, (state, action) => {
        state.widgetThemeLoading = false;
        state.widgetTheme = action.payload.data;
      })
      .addCase(fetchWidgetTheme.rejected, (state, action) => {
        state.widgetThemeLoading = false;
        state.widgetThemeError = action.error.message || 'Failed to fetch widget theme';
      });
  },
});

export const {
  storeWidgetData,
  updateChartsData,
  addTemporaryChart,
  updateTemporaryChart,
  removeTemporaryChart,
  clearTemporaryCharts,
  resetChartAndWidgetData,
} = dashboardSlice.actions;

export default dashboardSlice.reducer;
