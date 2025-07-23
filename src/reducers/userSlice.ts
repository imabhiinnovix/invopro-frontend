
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface User {
  createdAt: string;
  email: string;
  firstName: string;
  lastLogin: string;
  lastName: string;
  lastWorkspaceId: {
    _id: string;
    name: string;
  };
  organizationId: {
    _id: string;
    name: string;
  };
  role: string;
  roleId: number;
  settings: {
    RPPos: 'left' | 'right' | 'bottom' | 'top';
    showOccurrenceCount: boolean;
    showOccurrenceCountTerm: boolean;
    RPDimensions: {
      left: { width: string; height: string; _id: string };
      right: { width: string; height: string; _id: string };
      bottom: { width: string; height: string; _id: string };
      top: { width: string; height: string; _id: string };
    };
  };
  updatedAt: string;
  __v: number;
  _id: string;
  lastSearchHistoryId: {
    _id: string;
    userId: string;
    workspaceId: string;
    searchTerms: {
      query: string;
      colorCode?: string;
      matchType: 'partial' | 'exact';
      count?: number;
      proximity: boolean;
      proximityInfo: { type: string; value: string };
      synonyms?: { term: string; dictionary: string; _id?: string }[];
    }[];
    name: string;
    matchAllKeywords: boolean;
    organizationId: string;
    isGlobal: boolean;
    createdAt: string;
    updatedAt: string;
    __v: number;
  };
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
});

export const { setCurrentUser, clearCurrentUser } = userSlice.actions;
export default userSlice.reducer;