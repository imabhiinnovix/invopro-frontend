import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { GET } from '../services/apiRoutes';

// Define the shape of the user object
export interface User {
  id: string;
  name: string;
  email: string;
  // Add more fields as needed
}

interface UserState {
  currentUser: User | null;
  loading: boolean;
  error: string | null;
}

const initialState: UserState = {
  currentUser: null,
  loading: false,
  error: null,
};

// Async thunk to fetch current user (replace with real API call)
export const getCurrentUser = createAsyncThunk<User, void, { rejectValue: string }>(
  'user/getCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      // Use the correct API endpoint from GET.USER_DETAILS
      const response = await fetch(GET.USER_DETAILS);
      if (!response.ok) throw new Error('Failed to fetch user');
      const data = await response.json();
      return data as User;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Unknown error');
    }
  }
);

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setCurrentUser(state, action: PayloadAction<User | null>) {
      state.currentUser = action.payload;
    },
    clearCurrentUser(state) {
      state.currentUser = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getCurrentUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getCurrentUser.fulfilled, (state, action) => {
        state.loading = false;
        state.currentUser = action.payload;
      })
      .addCase(getCurrentUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch user';
      });
  },
});

export const { setCurrentUser, clearCurrentUser } = userSlice.actions;
export default userSlice.reducer; 