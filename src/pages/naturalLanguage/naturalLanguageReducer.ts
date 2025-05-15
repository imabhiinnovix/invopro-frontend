import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ChartResponse } from '../dashboard/types';
import { fetchWidgetSettingBasedOnNaturalLanguage } from './naturalLanguageAction';

interface NaturalLanguageSliceState {
  widgetSettingsHistory: ChartResponse[]; // Array to hold all previous responses
  widgetSettingsLoading: boolean;
  widgetSettingsError: string | null;
}

const initialState: NaturalLanguageSliceState = {
  widgetSettingsHistory: [],
  widgetSettingsLoading: false,
  widgetSettingsError: null,
};

const naturalLanguageSlice = createSlice({
  name: 'naturalLanguage',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchWidgetSettingBasedOnNaturalLanguage.pending, (state) => {
        state.widgetSettingsLoading = true;
        state.widgetSettingsError = null;
      })
      .addCase(fetchWidgetSettingBasedOnNaturalLanguage.fulfilled, (state, action: PayloadAction<ChartResponse>) => {
        state.widgetSettingsLoading = false;
        state.widgetSettingsHistory.push(action.payload); // Store each response in history
      })
      .addCase(fetchWidgetSettingBasedOnNaturalLanguage.rejected, (state, action) => {
        state.widgetSettingsLoading = false;
        state.widgetSettingsError = action.error.message || 'Failed to fetch data sources';
      });
  },
});

export default naturalLanguageSlice.reducer;
