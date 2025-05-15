import { createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../services/axiosInstance';
import { ChartResponse } from '../dashboard/types';
import axios from 'axios';
import { GET } from '../../services/apiRoutes';

export const fetchWidgetSettingBasedOnNaturalLanguage = createAsyncThunk(
  'nlQuery/getData',
  async (userQuery: string, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get<ChartResponse>(`${GET.NL_Query}/getData?userQuery=${userQuery}`);

      return data?.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.data) {
        return rejectWithValue(error.response.data);
      }
      return rejectWithValue({ message: 'Failed to fetch query result' });
    }
  }
);
