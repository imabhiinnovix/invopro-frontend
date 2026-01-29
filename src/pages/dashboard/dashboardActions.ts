import { createAsyncThunk } from "@reduxjs/toolkit";
import { GET, POST } from "../../services/apiRoutes";
import {
  DashboardListResponse,
  WidgetTypeResponse,
  DataSourceResponse,
  ChartDataResponse,
  WidgetDataResponse,
  CombinedWidgetData,
  ChartResponse,
} from "./types";
import { CreateWidgetResponse } from "../../types/dashboard";
import { Theme } from "../createTheme/types";
import axiosInstance from "../../services/axiosInstance";
import axios from "axios";
import { updateChartsData } from "./dashboardReducer";

export const fetchDashboardList = createAsyncThunk(
  "dashboard/fetchList",
  async () => {
    const { data } = await axiosInstance.get<DashboardListResponse>(
      GET.DASHBOARD_LIST,
    );
    return data;
  },
);

export const createDashboard = createAsyncThunk(
  "dashboard/create",
  async (
    payload: {
      name: string;
      dashboardType: "normal" | "trend" | "fixed";
      dynamicVersionValue: string;
      dataSourceId?: string;
    },
    { rejectWithValue },
  ) => {
    try {
      const requestPayload = {
        name: payload.name,
        settings: {
          dashboardType: payload.dashboardType,
          dynamicVersionValue: payload.dynamicVersionValue,
          ...(payload.dashboardType === "fixed" && {
            dataSourceId: payload.dataSourceId || "",
          }),
        },
      };
      const { data } = await axiosInstance.post<DashboardListResponse>(
        POST.CREATE_DASHBOARD,
        requestPayload,
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
  },
);

export const deleteDashboard = createAsyncThunk(
  "dashboard/deleteDashboard",
  async (dashboardId: string, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.post(
        `${POST.DELETE_DASHBOARD}/${dashboardId}`,
        {},
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
  },
);

export const setDashboardList = (
  dashboards: DashboardListResponse["data"],
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

export const createWidget = createAsyncThunk(
  "dashboard/createWidget",
  async (payload: CreateWidgetPayload, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.post<CreateWidgetResponse>(
        POST.CREATE_WIDGET,
        payload,
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
  },
);

export const fetchWidgetTypes = createAsyncThunk(
  "dashboard/fetchWidgetTypes",
  async () => {
    const { data } = await axiosInstance.get<WidgetTypeResponse>(
      GET.WIDGET_TYPE_LIST,
    );
    return data;
  },
);

export const fetchDataSources = createAsyncThunk(
  "dashboard/fetchDataSources",
  async (page: number = 1, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get<DataSourceResponse>(
        `${GET.DATA_SOURCE_LIST}?paginate=true&page=${page}&limit=10`,
      );
      return data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.data) {
        return rejectWithValue(error.response.data);
      }
      return rejectWithValue({ message: "Failed to fetch data sources" });
    }
  },
);

export const fetchAllDataSources = createAsyncThunk(
  "dashboard/fetchAllDataSources",
  async (_, { rejectWithValue }) => {
    try {
      // First fetch the first page to get total count
      const firstPageResponse = await axiosInstance.get<DataSourceResponse>(
        `${GET.DATA_SOURCE_LIST}?paginate=true&page=1&limit=10`,
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
              `${GET.DATA_SOURCE_LIST}?paginate=true&page=${page}&limit=10`,
            ),
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
  },
);

export const loadMoreDataSources = createAsyncThunk(
  "dashboard/loadMoreDataSources",
  async (page: number, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get<DataSourceResponse>(
        `${GET.DATA_SOURCE_LIST}?paginate=true&page=${page}&limit=10`,
      );
      return data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.data) {
        return rejectWithValue(error.response.data);
      }
      return rejectWithValue({ message: "Failed to load more data sources" });
    }
  },
);

//TODO
// export const storeWidgetData = (payload: {
//   widgetId: string;
//   data: CombinedWidgetData;
// }) => ({
//   type: "dashboard/storeWidgetData",
//   payload,
// });
export const storeWidgetData = (payload: {
  widgetId: string;
  data: CombinedWidgetData;
  shouldCache?: boolean;
}) => {
  return {
    type: "dashboard/storeWidgetData",
    payload,
  };
};

export const fetchChartData = createAsyncThunk(
  "dashboard/fetchChartData",
  async (
    {
      dashboardId,
      versionValue,
      startVersionValue,
      endVersionValue,
      dashboardType,
      dynamicVersionValue,
      dashboardFilters = {},
      isDefaultNotivix = false,
    }: {
      dashboardId: string;
      versionValue?: string;
      startVersionValue?: string;
      endVersionValue?: string;
      dashboardType?: string;
      dynamicVersionValue?: string;
      dashboardFilters: any;
      isDefaultNotivix?: boolean;
    },
    { dispatch, signal },
  ) => {
    if (!dashboardType && isDefaultNotivix) return [];

    if (dashboardFilters.__reset) {
      const { __reset, ...cleanFilters } = dashboardFilters;
      dashboardFilters = cleanFilters;
    }

    let response;
    try {
      response = await axiosInstance.get<ChartDataResponse>(
        `${GET.DASHBOARD_WIDGET_GET_CHART_DATA}/${dashboardId}`,
        { signal },
      );
    } catch (error: any) {
      if (
        axios.isCancel(error) ||
        error?.code === "ERR_CANCELED" ||
        (error instanceof Error && error.message === "canceled")
      ) {
        throw error;
      }
      throw error;
    }

    // Make additional API calls for each chart
    // if (response.data.success && response.data.data) {
    //   // Process charts in batches of 3 to avoid overwhelming the system
    //   const batchSize = 3;
    //   const charts = response.data.data;
    //   // console.log('response22222222', charts);

    //   for (let i = 0; i < charts.length; i += batchSize) {
    //     if (signal?.aborted) {
    //       const abortError = new Error("Request aborted");
    //       abortError.name = "AbortError";
    //       throw abortError;
    //     }

    //     const batch = charts.slice(i, i + batchSize);
    //     await Promise.all(
    //       batch.map(async (chart) => {
    //         try {
    //           if (signal?.aborted) {
    //             const abortError = new Error("Request aborted");
    //             abortError.name = "AbortError";
    //             throw abortError;
    //           }

    //           const widgetResponse =
    //             await axiosInstance.post<WidgetDataResponse>(
    //               GET.DASHBOARD_WIDGET_DATA,
    //               {
    //                 dataSourceId: chart.dataSourceId?._id,
    //                 dataSourceFieldSettings: chart.dataSourceId?.fieldSettings,
    //                 entityId: chart.dataSourceId?.entityId,
    //                 dimensions: chart.dimensions,
    //                 groupBy: chart.groupBy,
    //                 plotType: chart.plotType,
    //                 conditions: chart.conditions,
    //                 aggregation: chart.aggregation,
    //                 widgetType: chart.widgetTypeId?.chartType,
    //                 dashboardFilters: {
    //                   startVersionValue:
    //                     dashboardType === "trend"
    //                       ? startVersionValue || ""
    //                       : "",
    //                   endVersionValue:
    //                     dashboardType === "trend" ? endVersionValue || "" : "",
    //                   versionValue:
    //                     dashboardType === "trend" ? "" : versionValue || "",
    //                   dynamicVersionValue:
    //                     dashboardType === "trend"
    //                       ? ""
    //                       : versionValue
    //                       ? ""
    //                       : "1m",
    //                   filters: { ...dashboardFilters },
    //                 },
    //                 dashBoardType: dashboardType || "normal",
    //                 isIncremental: chart.isIncremental,
    //               },
    //               { signal }
    //             );

    //           if (widgetResponse.data.success) {
    //             // Only store essential data
    //             const essentialData = {
    //               _id: chart._id,
    //               createdBy: chart.createdBy,
    //               dataSourceFieldSettings: chart.dataSourceId?.fieldSettings,

    //               dashboardId: chart.dashboardId,
    //               organizationId: chart.organizationId,
    //               name: chart.name,
    //               position: chart.position,
    //               dimensions: chart.dimensions,
    //               groupBy: chart.groupBy,
    //               plotType: chart.plotType,
    //               aggregation: chart.aggregation,
    //               conditions: chart.conditions,
    //               isActive: chart.isActive,
    //               createdAt: chart.createdAt,
    //               updatedAt: chart.updatedAt,
    //               widgetTypeId: chart.widgetTypeId,
    //               dataSourceId: chart.dataSourceId,
    //               data: {
    //                 label: widgetResponse.data.data.label,
    //                 dataSourceFieldSettings: chart.dataSourceId?.fieldSettings,

    //                 widgetData: widgetResponse.data.data.widgetData.map(
    //                   (item) => {
    //                     return {
    //                       ...item,
    //                     };
    //                   }
    //                 ),
    //                 totalCount: widgetResponse.data.data.totalCount,
    //               },
    //             };
    //             dispatch(
    //               storeWidgetData({ widgetId: chart._id, data: essentialData })
    //             );
    //           }
    //         } catch (error: any) {
    //           if (axios.isCancel(error) || error?.code === 'ERR_CANCELED' || (error instanceof Error && (error.message === "Request aborted" || error.message === "canceled"))) {
    //             return;
    //           }
    //           console.error(
    //             `Failed to fetch widget data for chart ${chart._id}:`,
    //             error
    //           );
    //         }
    //       })
    //     );
    //   }
    // }

    return response.data;
  },
);

export const fetchWidgetDataLazy = createAsyncThunk(
  "dashboard/fetchWidgetDataLazy",
  async (
    {
      chart,
      dashboardType,
      startVersionValue,
      endVersionValue,
      versionValue,
      dashboardFilters,
      isDefaultNotivix,
    }: {
      chart: any;
      dashboardType?: string;
      startVersionValue?: string;
      endVersionValue?: string;
      versionValue?: string;
      dashboardFilters?: any;
      isDefaultNotivix?: boolean;
    },
    { dispatch, signal },
  ) => {
    try {
      if (signal?.aborted) {
        throw new Error("Request aborted");
      }

      if (chart.widgetKind === "image") {
        const imageResponse = await axiosInstance.get(
          `${GET.DASHBOARD_WIDGET_IMAGE}/${chart._id}`,
          {
            headers: {
              Authorization:
                axiosInstance.defaults.headers.common.Authorization,
            },
            signal,
          },
        );

        if (imageResponse.data.success) {
          const essentialData = {
            _id: chart._id,
            createdBy: chart.createdBy,
            dashboardId: chart.dashboardId,
            organizationId: chart.organizationId,
            name: chart.name,
            position: chart.position,
            widgetKind: chart.widgetKind,
            dimensions: chart.dimensions || [],
            groupBy: chart.groupBy || [],
            plotType: chart.plotType || [],
            aggregation: chart.aggregation,
            conditions: chart.conditions || [],
            isActive: chart.isActive,
            createdAt: chart.createdAt,
            updatedAt: chart.updatedAt,
            widgetTypeId: chart.widgetTypeId,
            dataSourceId: chart.dataSourceId,
            data: imageResponse.data.data,
          };

          dispatch(
            storeWidgetData({
              widgetId: chart._id,
              data: essentialData,
              shouldCache: !isDefaultNotivix,
            }),
          );
          return imageResponse.data;
        }
      }

      const widgetResponse = await axiosInstance.post<WidgetDataResponse>(
        GET.DASHBOARD_WIDGET_DATA,
        {
          dataSourceId: chart.dataSourceId?._id,
          dataSourceFieldSettings: chart.dataSourceId?.fieldSettings,
          entityId: chart.dataSourceId?.entityId,
          dimensions: chart.dimensions,
          groupBy: chart.groupBy,
          plotType: chart.plotType,
          conditions: chart.conditions,
          aggregation: chart.aggregation,
          widgetType: chart.widgetTypeId?.chartType,
          dashboardFilters: {
            startVersionValue:
              dashboardType === "trend" ? startVersionValue || "" : "",
            endVersionValue:
              dashboardType === "trend" ? endVersionValue || "" : "",
            versionValue: dashboardType === "trend" ? "" : versionValue || "",
            dynamicVersionValue:
              dashboardType === "trend" ? "" : versionValue ? "" : "1m",
            filters: { ...dashboardFilters },
          },
          dashBoardType: dashboardType || "normal",
          isIncremental: chart.isIncremental,
        },
        { signal },
      );

      if (widgetResponse.data.success) {
        const essentialData = {
          _id: chart._id,
          createdBy: chart.createdBy,
          dataSourceFieldSettings: chart.dataSourceId?.fieldSettings,
          dashboardId: chart.dashboardId,
          organizationId: chart.organizationId,
          name: chart.name,
          position: chart.position,
          dimensions: chart.dimensions,
          groupBy: chart.groupBy,
          plotType: chart.plotType,
          aggregation: chart.aggregation,
          conditions: chart.conditions,
          isActive: chart.isActive,
          createdAt: chart.createdAt,
          updatedAt: chart.updatedAt,
          widgetTypeId: chart.widgetTypeId,
          dataSourceId: chart.dataSourceId,
          data: {
            label: widgetResponse.data.data.label,
            dataSourceFieldSettings: chart.dataSourceId?.fieldSettings,
            widgetData: widgetResponse.data.data.widgetData.map((item) => ({
              ...item,
            })),
            totalCount: widgetResponse.data.data.totalCount,
          },
        };
        dispatch(
          storeWidgetData({
            widgetId: chart._id,
            data: essentialData,
            shouldCache: !isDefaultNotivix,
          }),
        );
      }
      return widgetResponse.data;
    } catch (error: any) {
      if (
        axios.isCancel(error) ||
        error?.code === "ERR_CANCELED" ||
        (error instanceof Error &&
          (error.message === "Request aborted" || error.message === "canceled"))
      ) {
        throw error;
      }
      console.error(
        `Failed to fetch widget data for chart ${chart._id}:`,
        error,
      );
      throw error;
    }
  },
);
export const fetchIndividualWidgetData = createAsyncThunk(
  "nlQuery/getIndividualData",
  async (chart: any, { rejectWithValue, dispatch }) => {
    try {
      const widgetResponse = await axiosInstance.post<WidgetDataResponse>(
        GET.DASHBOARD_WIDGET_DATA,
        {
          dataSourceId: chart.dataSourceId,
          entityId: chart.entityId,
          dimensions: [chart.dimensions],
          groupBy: chart.groupBy ? [chart.groupBy] : [],
          conditions: chart.conditions,
          aggregation: chart.aggregation,
          widgetType: chart.chartType,
        },
      );
      if (widgetResponse.data.success) {
        // Combine the chart metadata with the new data
        const combinedData = {
          ...chart,
          data: widgetResponse.data.data,
        };

        dispatch(storeWidgetData({ widgetId: chart._id, data: combinedData }));
        dispatch(updateChartsData({ widgetId: chart._id, data: combinedData }));
      }
      return widgetResponse.data.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.data) {
        return rejectWithValue(error.response.data);
      }
      return rejectWithValue({ message: "Failed to fetch query result" });
    }
  },
);

export const fetchWidgetSettingBasedOnNaturalLanguage = createAsyncThunk(
  "nlQuery/getData",
  async (userQuery: string, { rejectWithValue, dispatch }) => {
    try {
      const { data } = await axiosInstance.get<ChartResponse>(
        `${GET.NL_Query}/getData?userQuery=${encodeURIComponent(userQuery)}`,
      );

      const finalData: any = data?.data || {};

      dispatch(storeWidgetData({ widgetId: finalData?._id, data: finalData }));
      return data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.data) {
        return rejectWithValue(error.response.data);
      }
      return rejectWithValue({ message: "Failed to fetch query result" });
    }
  },
);

export const deleteWidget = createAsyncThunk(
  "dashboard/deleteWidget",
  async (widgetId: string, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.post(
        `${POST.DELETE_WIDGET}/${widgetId}`,
        {},
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
  },
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
        payload,
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
  },
);

interface SaveWidgetsPayload {
  widgets: {
    dashboardId: string;
    widgetTypeId: string;
    name: string;
    description?: string;
    dimensions: string[];
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
    isIncremental?: boolean;
  }[];
}

export const saveWidgets = createAsyncThunk(
  "dashboard/saveWidgets",
  async (payload: SaveWidgetsPayload) => {
    try {
      const { data } = await axiosInstance.post<CreateWidgetResponse>(
        POST.SAVE_WIDGETS,
        payload,
      );
      return data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.data) {
        return error.response.data;
      }
      return "Failed to share dashboard. Please try again.";
    }
  },
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
  },
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
  },
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
  },
);

export const selectDashboardTheme = createAsyncThunk(
  "dashboard/selectTheme",
  async ({
    dashboardId,
    widgetThemeId,
  }: {
    dashboardId: string;
    widgetThemeId: string;
  }) => {
    const { data } = await axiosInstance.post(
      `/common/dashboard/selectTheme/${dashboardId}`,
      { widgetThemeId },
    );
    return data;
  },
);
