import { createAsyncThunk } from "@reduxjs/toolkit";
import { GET, POST } from "../../services/apiRoutes";
import {
  DashboardListResponse,
  WidgetTypeResponse,
  DataSourceResponse,
  ChartDataResponse,
  WidgetDataResponse,
  CombinedWidgetData,
} from "./types";
import { Theme } from "../createTheme/types";
import axiosInstance from "../../services/axiosInstance";
import axios from "axios";

export const fetchDashboardList = createAsyncThunk(
  "dashboard/fetchList",
  async () => {
    const { data } = await axiosInstance.get<DashboardListResponse>(
      GET.DASHBOARD_LIST
    );
    return data;
  }
);

export const createDashboard = createAsyncThunk(
  "dashboard/create",
  async (
    payload: {
      name: string;
      dashboardType: "normal" | "trend";
      dynamicVersionValue: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const { data } = await axiosInstance.post<DashboardListResponse>(
        POST.CREATE_DASHBOARD,
        {
          name: payload.name,
          settings: {
            dashboardType: payload.dashboardType,
            dynamicVersionValue: payload.dynamicVersionValue,
          },
        }
      );
      if (!data.success) {
        return rejectWithValue({
          message: data.message || "Failed to create dashboard",
        });
      }
      return data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.data) {
        return rejectWithValue(error.response.data);
      }
      return rejectWithValue({
        message: "Failed to create dashboard. Please try again.",
      });
    }
  }
);

export const deleteDashboard = createAsyncThunk(
  "dashboard/deleteDashboard",
  async (dashboardId: string, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.post(
        `${POST.DELETE_DASHBOARD}/${dashboardId}`,
        {}
      );
      return data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.data) {
        return rejectWithValue(error.response.data);
      }
      return rejectWithValue({
        message: "Failed to delete dashboard. Please try again.",
      });
    }
  }
);

export const setDashboardList = (
  dashboards: DashboardListResponse["data"]
) => ({
  type: "dashboard/setList",
  payload: dashboards,
});

interface CreateWidgetPayload {
  name: string;
  dimensions: string;
  groupBy: string;
  aggregation: {
    type: string;
    attributeName: string;
  };
  position: {
    x: number;
    y: number;
    index: number;
  };
  conditions: {
    field: string;
    operator: string;
    value: string;
  }[];
  dataSourceId: string;
  widgetTypeId: string;
  dashboardId: string;
}

interface CreateWidgetResponse {
  success: boolean;
  message: string;
  data: {
    _id: string;
    createdBy: string;
    dashboardId: string;
    organizationId: string;
    widgetTypeId: string;
    name: string;
    dimensions: string;
    groupBy: string;
    aggregation: {
      type: string;
      attributeName: string;
    };
    position: {
      x: number;
      y: number;
      index: number;
    };
    conditions: {
      field: string;
      operator: string;
      value: string;
      _id: string;
    }[];
    dataSourceId: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
  };
}

export const createWidget = createAsyncThunk(
  "dashboard/createWidget",
  async (payload: CreateWidgetPayload, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.post<CreateWidgetResponse>(
        POST.CREATE_WIDGET,
        payload
      );
      if (data.success) {
        return data;
      }
      return rejectWithValue(data);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.data) {
        return rejectWithValue(error.response.data);
      }
      return rejectWithValue({
        message: "Failed to create widget. Please try again.",
      });
    }
  }
);

export const fetchWidgetTypes = createAsyncThunk(
  "dashboard/fetchWidgetTypes",
  async () => {
    const { data } = await axiosInstance.get<WidgetTypeResponse>(
      GET.WIDGET_TYPE_LIST
    );
    return data;
  }
);

export const fetchDataSources = createAsyncThunk(
  "dashboard/fetchDataSources",
  async (page: number = 1, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get<DataSourceResponse>(
        `${GET.DATA_SOURCE_LIST}?paginate=true&page=${page}&limit=10`
      );
      return data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.data) {
        return rejectWithValue(error.response.data);
      }
      return rejectWithValue({ message: "Failed to fetch data sources" });
    }
  }
);

export const fetchAllDataSources = createAsyncThunk(
  "dashboard/fetchAllDataSources",
  async (_, { rejectWithValue }) => {
    try {
      // First fetch the first page to get total count
      const firstPageResponse = await axiosInstance.get<DataSourceResponse>(
        `${GET.DATA_SOURCE_LIST}?paginate=true&page=1&limit=10`
      );

      const { data: firstPageData, totalCount } = firstPageResponse.data;
      let allDataSources = [...firstPageData];

      // Calculate how many additional pages we need to fetch
      const totalPages = Math.ceil(totalCount / 10);

      // If there are more pages, fetch them
      if (totalPages > 1) {
        const additionalPagePromises = [];

        for (let page = 2; page <= totalPages; page++) {
          additionalPagePromises.push(
            axiosInstance.get<DataSourceResponse>(
              `${GET.DATA_SOURCE_LIST}?paginate=true&page=${page}&limit=10`
            )
          );
        }

        const additionalResponses = await Promise.all(additionalPagePromises);

        // Combine all data sources
        additionalResponses.forEach((response) => {
          allDataSources = [...allDataSources, ...response.data.data];
        });
      }

      return {
        success: true,
        message: "All data sources fetched successfully",
        data: allDataSources,
        totalCount,
      };
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.data) {
        return rejectWithValue(error.response.data);
      }
      return rejectWithValue({ message: "Failed to fetch all data sources" });
    }
  }
);

export const loadMoreDataSources = createAsyncThunk(
  "dashboard/loadMoreDataSources",
  async (page: number, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get<DataSourceResponse>(
        `${GET.DATA_SOURCE_LIST}?paginate=true&page=${page}&limit=10`
      );
      return data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.data) {
        return rejectWithValue(error.response.data);
      }
      return rejectWithValue({ message: "Failed to load more data sources" });
    }
  }
);

export const storeWidgetData = (payload: {
  widgetId: string;
  data: CombinedWidgetData;
}) => ({
  type: "dashboard/storeWidgetData",
  payload,
});

export const fetchChartData = createAsyncThunk(
  "dashboard/fetchChartData",
  async (
    {
      dashboardId,
      versionValue,
      startVersionValue,
      endVersionValue,
      dashboardType,
    }: {
      dashboardId: string;
      versionValue?: string;
      startVersionValue?: string;
      endVersionValue?: string;
      dashboardType?: string;
    },
    { dispatch }
  ) => {
    const response = await axiosInstance.get<ChartDataResponse>(
      `${GET.DASHBOARD_WIDGET_GET_CHART_DATA}/${dashboardId}`
    );

    // Make additional API calls for each chart
    if (response.data.success && response.data.data) {
      await Promise.all(
        response.data.data.map(async (chart) => {
          try {
            const widgetResponse = await axiosInstance.post<WidgetDataResponse>(
              GET.DASHBOARD_WIDGET_DATA,
              {
                dataSourceId: chart.dataSourceId?._id,
                entityId: chart.dataSourceId?.entityId,
                dimensions: chart.dimensions,
                groupBy: chart.groupBy,
                conditions: chart.conditions,
                aggregation: chart.aggregation,
                widgetType: chart.widgetTypeId?.chartType,
                dashboardFilters: {
                  startVersionValue: startVersionValue || "",
                  endVersionValue: endVersionValue || "",
                  versionValue: versionValue || "",
                },
                dashBoardType: dashboardType || "normal",
              }
            );
            if (widgetResponse.data.success) {
              // Combine the chart metadata with the new data
              const combinedData = {
                ...chart,
                data: widgetResponse.data.data,
              };
              dispatch(
                storeWidgetData({ widgetId: chart._id, data: combinedData })
              );
            }
          } catch (error) {
            console.error(
              `Failed to fetch widget data for chart ${chart._id}:`,
              error
            );
          }
        })
      );
    }

    return response.data;
  }
);

export const deleteWidget = createAsyncThunk(
  "dashboard/deleteWidget",
  async (widgetId: string, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.post(
        `${POST.DELETE_WIDGET}/${widgetId}`,
        {}
      );
      return data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.data) {
        return rejectWithValue(error.response.data);
      }
      return rejectWithValue({
        message: "Failed to delete widget. Please try again.",
      });
    }
  }
);

interface UpdateWidgetPayload extends CreateWidgetPayload {
  _id: string;
}

interface UpdateWidgetResponse {
  success: boolean;
  message: string;
  data: CreateWidgetResponse["data"];
}

export const updateWidget = createAsyncThunk(
  "dashboard/updateWidget",
  async (payload: UpdateWidgetPayload, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.post<UpdateWidgetResponse>(
        `${POST.UPDATE_WIDGET}/${payload._id}`,
        payload
      );
      if (data.success) {
        return data;
      }
      return rejectWithValue(data);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.data) {
        return rejectWithValue(error.response.data);
      }
      return rejectWithValue({
        message: "Failed to update widget. Please try again.",
      });
    }
  }
);

interface SaveWidgetsPayload {
  widgets: {
    dashboardId: string;
    widgetTypeId: string;
    name: string;
    dimensions: string;
    groupBy: string[];
    aggregation: {
      type: string;
      attributeName: string;
    };
    position: {
      x: number;
      y: number;
      index: number;
    };
    conditions: {
      field: string;
      operator: string;
      value: string;
    }[];
    dataSourceId: string;
    entityId: string;
  }[];
}

export const saveWidgets = createAsyncThunk(
  "dashboard/saveWidgets",
  async (payload: SaveWidgetsPayload) => {
    const { data } = await axiosInstance.post<CreateWidgetResponse>(
      POST.SAVE_WIDGETS,
      payload
    );
    return data;
  }
);

export const fetchDashboardShareUsers = createAsyncThunk(
  "dashboard/fetchShareUsers",
  async (dashboardId: string) => {
    const { data } = await axiosInstance.get<{
      success: boolean;
      message: string;
      data: string[];
    }>(`/dashboardShare/list/${dashboardId}`);
    return data;
  }
);

interface ShareDashboardPayload {
  receiverEmails: string[];
  dashboardId: string;
  isShareble: boolean;
}

export const shareDashboard = createAsyncThunk(
  "dashboard/share",
  async (payload: ShareDashboardPayload, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.post<{
        success: boolean;
        message: string;
      }>("/dashboardShare/create", payload);
      if (!data.success) {
        return rejectWithValue({
          message: data.message || "Failed to share dashboard",
        });
      }
      return data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.data) {
        return rejectWithValue(error.response.data);
      }
      return rejectWithValue({
        message: "Failed to share dashboard. Please try again.",
      });
    }
  }
);

export const fetchWidgetTheme = createAsyncThunk(
  "dashboard/fetchWidgetTheme",
  async (dashboardWidgetThemeId: string) => {
    const { data } = await axiosInstance.get<{
      success: boolean;
      message: string;
      data: Theme;
    }>(`${GET.WIDGET_THEME}/${dashboardWidgetThemeId}`);
    return data;
  }
);

export const updateDashboardVersion = createAsyncThunk(
  "dashboard/updateVersion",
  async (
    {
      dashboardId,
      versionValue,
      dynamicVersionValue,
      startVersionValue,
      endVersionValue,
    }: {
      dashboardId: string;
      versionValue?: string;
      dynamicVersionValue?: string;
      startVersionValue?: string;
      endVersionValue?: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const { data } = await axiosInstance.post(
        `${POST.UPDATE_DASHBOARD}/${dashboardId}`,
        {
          versionValue,
          ...(dynamicVersionValue && { dynamicVersionValue }),
          ...(startVersionValue && { startVersionValue }),
          ...(endVersionValue && { endVersionValue }),
        }
      );
      if (!data.success) {
        return rejectWithValue({
          message: data.message || "Failed to update dashboard version",
        });
      }
      return data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.data) {
        return rejectWithValue(error.response.data);
      }
      return rejectWithValue({
        message: "Failed to update dashboard version. Please try again.",
      });
    }
  }
);
