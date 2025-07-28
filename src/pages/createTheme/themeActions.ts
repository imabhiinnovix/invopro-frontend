import { createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../services/axiosInstance';
import { ThemeListResponse } from './types';

export const fetchThemeList = createAsyncThunk(
  'theme/fetchList',
  async () => {
    const { data } = await axiosInstance.get<ThemeListResponse>('/common/widgetTheme/list');
    return data;
  }
); 