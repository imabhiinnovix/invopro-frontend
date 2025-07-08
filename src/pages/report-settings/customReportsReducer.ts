import { createSlice } from '@reduxjs/toolkit';
import { fetchCustomReportSettings } from './customReportsActions';
import { CustomReportSettings } from '../../services/customReports';

interface State {
  settings: CustomReportSettings[];
  loading: boolean;
  error: string | null;
}

const initialState: State = {
  settings: [],
  loading: false,
  error: null,
};

const customReportsSlice = createSlice({
  name: 'customReports',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCustomReportSettings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCustomReportSettings.fulfilled, (state, action) => {
        state.loading = false;
        state.settings = action.payload.data;
      })
      .addCase(fetchCustomReportSettings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default customReportsSlice.reducer;