import { createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../services/axiosInstance';
import { CustomReportSettingsResponse } from '../../services/customReports';

export const fetchCustomReportSettings = createAsyncThunk(
  'customReports/fetchSettings',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get<CustomReportSettingsResponse>(
        '/customReports/listSettings?paginate=true'
      );
      if (!data.success) {
        return rejectWithValue(data.message || 'Failed to fetch report settings');
      }
      return data;
    } catch (error: any) {
      return rejectWithValue(error?.response?.data?.message || 'Failed to fetch report settings');
    }
  }
);