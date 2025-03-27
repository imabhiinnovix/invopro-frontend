import { createAsyncThunk } from '@reduxjs/toolkit';
import { GET, POST } from '../../services/apiRoutes';
import { DashboardListResponse } from './types';
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
  dashboardId: string;
  widgetTypeId: string;
}

interface CreateWidgetResponse {
  success: boolean;
  message: string;
  data: any; // You can type this based on the actual response
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