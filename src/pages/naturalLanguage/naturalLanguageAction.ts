// import { createAsyncThunk } from '@reduxjs/toolkit';
// import axiosInstance from '../../services/axiosInstance';
// import { ChartResponse } from '../dashboard/types';
// import axios from 'axios';
// import { GET } from '../../services/apiRoutes';
// import { storeWidgetData } from '../dashboard/dashboardActions';

// export const fetchWidgetSettingBasedOnNaturalLanguage = createAsyncThunk(
//   'nlQuery/getData',
//   async (userQuery: string, { rejectWithValue, dispatch }) => {
//     try {
//       const { data } = await axiosInstance.get<ChartResponse>(
//         `${GET.NL_Query}/getData?userQuery=${encodeURIComponent(userQuery)}`
//       );

//       const finalData: any = data?.data || {};
//       dispatch(storeWidgetData({ widgetId: finalData?._id, data: finalData }));
//       return finalData; // Important: return the result so it’s passed to `.fulfilled`
//     } catch (error) {
//       if (axios.isAxiosError(error) && error.response?.data) {
//         return rejectWithValue(error.response.data);
//       }
//       return rejectWithValue({ message: 'Failed to fetch query result' });
//     }
//   }
// );
