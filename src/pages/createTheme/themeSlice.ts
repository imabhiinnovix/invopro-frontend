import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { fetchThemeList } from './themeActions';
import { ThemeListResponse } from './types';

interface ThemeState {
  themes: ThemeListResponse['data'];
  loading: boolean;
  error: string | null;
}

const initialState: ThemeState = {
  themes: [],
  loading: false,
  error: null,
};

const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchThemeList.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchThemeList.fulfilled, (state, action: PayloadAction<ThemeListResponse>) => {
        state.loading = false;
        state.themes = action.payload.data;
      })
      .addCase(fetchThemeList.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch themes';
      });
  },
});

export default themeSlice.reducer; 