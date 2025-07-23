// import { getCurrentUser } from './userSlice';
// import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
// import { GET } from '../services/apiRoutes';

// // Define the shape of the user object
// export interface User {
//   id: string;
//   name: string;
//   email: string;
//   // Add more fields as needed
// }

// interface UserState {
//   currentUser: User | null;
//   loading: boolean;
//   error: string | null;
// }

// const initialState: UserState = {
//   currentUser: null,
//   loading: false,
//   error: null,
// };

// // // Async thunk to fetch current user (replace with real API call)
// // export const getCurrentUser = createAsyncThunk<User, void, { rejectValue: string }>(
// //   '/common/user/get-current-user',
// //   async (_, { rejectWithValue }) => {
// //     console.log("Fetching current user...");
// //     try {
// //           console.log("Fetching current user.2222..");

// //       // Use the correct API endpoint from GET.USER_DETAILS
// //       const response = await fetch(GET.USER_DETAILS);
// //       console.log("response",response)
// //       if (!response.ok) throw new Error('Failed to fetch user');
// //       const data = await response.json();
// //       return data as User;
// //     } catch (error: any) {
// //                 console.log("Fetching current user.333..");

// //       return rejectWithValue(error.message || 'Unknown error');
// //     }
// //   }
// // );

// export const fetchAuthUser = createAsyncThunk<User, void, { rejectValue: string }>(
//   '/common/user/fetch-auth-user',
//   async (_, { dispatch, rejectWithValue }) => {
//     try {
//       // Call the existing getCurrentUser thunk
//       const result = await dispatch(getCurrentUser()).unwrap();
//       // Since getCurrentUser expects a User, but API returns UserResponse,
//       // we need to fetch directly if the response structure doesn't match
//       const response = await fetch(GET.USER_DETAILS);
//       if (!response.ok) throw new Error('Failed to fetch user');
//       const data = await response.json();
//       if (!data.success) throw new Error(data.message || 'Failed to fetch user');

//       // Map UserResponse.data to User
//       const user: User = {
//         id: data.data._id,
//         name: `${data.data.firstName} ${data.data.lastName}`,
//         email: data.data.email,
//       };
//       return user;
//     } catch (error: any) {
//       console.log('Error fetching auth user:', error);
//       return rejectWithValue(error.message || 'Unknown error');
//     }
//   }
// );

// const userSlice = createSlice({
//   name: 'user',
//   initialState,
//   reducers: {
//     setCurrentUser(state, action: PayloadAction<User | null>) {
//       state.currentUser = action.payload;
//     },
//     clearCurrentUser(state) {
//       state.currentUser = null;
//     },
//   },
//   extraReducers: (builder) => {
//     builder
//       .addCase(getCurrentUser.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(getCurrentUser.fulfilled, (state, action) => {
//         state.loading = false;
//         state.currentUser = action.payload;
//       })
//       .addCase(getCurrentUser.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload || 'Failed to fetch user';
//       });
//   },
// });

// export const { setCurrentUser, clearCurrentUser } = userSlice.actions;
// export default userSlice.reducer; 

// import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
// import { GET } from '../services/apiRoutes';

// // Define the shape of the user object to match UserResponse.data
// export interface User {
//   createdAt: string;
//   email: string;
//   firstName: string;
//   lastLogin: string;
//   lastName: string;
//   lastWorkspaceId: {
//     _id: string;
//     name: string;
//   };
//   organizationId: {
//     _id: string;
//     name: string;
//   };
//   role: string;
//   roleId: number;
//   settings: {
//     RPPos: 'left' | 'right' | 'bottom' | 'top';
//     showOccurrenceCount: boolean;
//     showOccurrenceCountTerm: boolean;
//     RPDimensions: {
//       left: { width: string; height: string; _id: string };
//       right: { width: string; height: string; _id: string };
//       bottom: { width: string; height: string; _id: string };
//       top: { width: string; height: string; _id: string };
//     };
//   };
//   updatedAt: string;
//   __v: number;
//   _id: string;
//   lastSearchHistoryId: {
//     _id: string;
//     userId: string;
//     workspaceId: string;
//     searchTerms: {
//       query: string;
//       colorCode?: string;
//       matchType: 'partial' | 'exact';
//       count?: number;
//       proximity: boolean;
//       proximityInfo: { type: string; value: string };
//       synonyms?: { term: string; dictionary: string; _id?: string }[];
//     }[];
//     name: string;
//     matchAllKeywords: boolean;
//     organizationId: string;
//     isGlobal: boolean;
//     createdAt: string;
//     updatedAt: string;
//     __v: number;
//   };
// }

// interface UserState {
//   currentUser: User | null;
//   loading: boolean;
//   error: string | null;
// }

// const initialState: UserState = {
//   currentUser: null,
//   loading: false,
//   error: null,
// };

// // Kept for compatibility, but unused in this solution
// export const fetchAuthUser = createAsyncThunk<User, void, { rejectValue: string }>(
//   '/common/user/fetch-auth-user',
//   async (_, { rejectWithValue }) => {
//     console.log('Fetching auth user...');
//     try {
//       const response = await fetch(GET.USER_DETAILS);
//       console.log('Response:', response);
//       if (!response.ok) throw new Error('Failed to fetch user');
//       const data = await response.json();
//       if (!data.success) throw new Error(data.message || 'Failed to fetch user');
//       return data.data as User; // Updated to return full User interface
//     } catch (error: any) {
//       console.log('Error fetching auth user:', error);
//       return rejectWithValue(error.message || 'Unknown error');
//     }
//   }
// );

// const userSlice = createSlice({
//   name: 'user',
//   initialState,
//   reducers: {
//     setCurrentUser(state, action: PayloadAction<User | null>) {
//       state.currentUser = action.payload;
//     },
//     clearCurrentUser(state) {
//       state.currentUser = null;
//     },
//   },
//   extraReducers: (builder) => {
//     builder
//       .addCase(fetchAuthUser.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(fetchAuthUser.fulfilled, (state, action) => {
//         state.loading = false;
//         state.currentUser = action.payload;
//       })
//       .addCase(fetchAuthUser.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload || 'Failed to fetch user';
//       });
//   },
// });

// export const { setCurrentUser, clearCurrentUser } = userSlice.actions;
// export default userSlice.reducer;



import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Define the shape of the user object to match UserResponse.data
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