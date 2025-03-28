import { createAsyncThunk } from '@reduxjs/toolkit';
import { GET, POST } from '../../services/apiRoutes';
import { DashboardListResponse, WidgetTypeResponse, DataSourceResponse, ChartDataResponse } from './types';
import axiosInstance from '../../services/axiosInstance';
import axios from 'axios';

export const fetchDashboardList = createAsyncThunk(
  'dashboard/fetchList',
  async () => {
    const { data } = await axiosInstance.get<DashboardListResponse>(GET.DASHBOARD_LIST);
    return data;
  }
);

export const createDashboard = createAsyncThunk(
  'dashboard/create',
  async (name: string, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.post<DashboardListResponse>(POST.CREATE_DASHBOARD, {
        name,
      });
      return data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.data) {
        return rejectWithValue(error.response.data);
      }
      return rejectWithValue({ message: 'Failed to create dashboard. Please try again.' });
    }
  }
);

export const deleteDashboard = createAsyncThunk(
  'dashboard/deleteDashboard',
  async (dashboardId: string, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.post(`${POST.DELETE_DASHBOARD}/${dashboardId}`, {});
      return data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.data) {
        return rejectWithValue(error.response.data);
      }
      return rejectWithValue({ message: 'Failed to delete dashboard. Please try again.' });
    }
  }
);

export const setDashboardList = (dashboards: DashboardListResponse['data']) => ({
  type: 'dashboard/setList',
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
    createdAt: string;
    updatedAt: string;
  };
}

export const createWidget = createAsyncThunk(
  'dashboard/createWidget',
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
      return rejectWithValue({ message: 'Failed to create widget. Please try again.' });
    }
  }
);

export const fetchWidgetTypes = createAsyncThunk(
  'dashboard/fetchWidgetTypes',
  async () => {
    const { data } = await axiosInstance.get<WidgetTypeResponse>(GET.WIDGET_TYPE_LIST);
    return data;
  }
);

export const fetchDataSources = createAsyncThunk(
  'dashboard/fetchDataSources',
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
      return rejectWithValue({ message: 'Failed to fetch data sources' });
    }
  }
);

export const loadMoreDataSources = createAsyncThunk(
  'dashboard/loadMoreDataSources',
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
      return rejectWithValue({ message: 'Failed to load more data sources' });
    }
  }
);

export const fetchChartData = createAsyncThunk(
  'dashboard/fetchChartData',
  async (dashboardId: string) => {
    const response = await axiosInstance.get<ChartDataResponse>(
      `${GET.DASHBOARD_WIDGET_GET_CHART_DATA}/${dashboardId}`
    );
    return response.data;
  }
); 