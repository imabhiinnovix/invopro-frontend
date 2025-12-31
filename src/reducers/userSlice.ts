import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  BackendPermission,
  formatPermissions,
  PermissionMap,
} from "../utils/utils"; // Adjust path

// Define the User interface (unchanged)
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

  permissionIds: [];
  settings: {
    RPPos: "left" | "right" | "bottom" | "top";
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
      matchType: "partial" | "exact";
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

// Define Permission interface for backward compatibility
interface Permission {
  _id: string;
  name: string;
  resourceType: string;
  status: "active" | "inactive";
  dataSourceId: string;
  method: string;
  organizationId: string;
  isSuperUser: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

// Extend UserState to include permissions as PermissionMap
interface UserState {
  currentUser: User | null;
  permissions: PermissionMap | null;
  loading: boolean;
  error: string | null;
  isUserListStale: boolean;
}

const initialState: UserState = {
  currentUser: null,
  permissions: null,
  loading: false,
  error: null,
  isUserListStale: false,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setCurrentUser(state, action: PayloadAction<User | null>) {
      state.currentUser = action.payload;
    },
    clearCurrentUser(state) {
      state.currentUser = null;
      state.permissions = null;
    },
    setPermissions(state, action: PayloadAction<BackendPermission[]>) {
      // Skip if payload is invalid
      if (!action.payload || !Array.isArray(action.payload)) {
        state.error = "Invalid permissions data";
        return;
      }
      // state.permissions = formatPermissions(action.payload);

      state.permissions = formatPermissions(action.payload);
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
    setError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
    },
    setUserListStale(state, action: PayloadAction<boolean>) {
      state.isUserListStale = action.payload;
    },
  },
});

export const {
  setCurrentUser,
  clearCurrentUser,
  setPermissions,
  setLoading,
  setError,
  setUserListStale,
} = userSlice.actions;
export default userSlice.reducer;
