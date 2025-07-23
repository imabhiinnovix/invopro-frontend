// import { createContext, Dispatch, ReactNode, SetStateAction, useEffect, useState } from 'react';
// import useGet from '../hooks/useGet';
// import { GET } from '../services/apiRoutes';
// import { queryClient } from '../main';

// interface AuthProviderProps {
//   children: ReactNode;
// }

// type searchTerms = {
//   query: string;
//   colorCode?: string;
//   matchType: 'partial' | 'exact';
//   count?: number;
//   proximity: boolean;
//   proximityInfo: { type: string; value: string };
//   synonyms?: {
//     term: string;
//     dictionary: string;
//     _id?: string;
//   }[];
// };

// type UserResponse = {
//   success: boolean;
//   message: string;
//   data: {
//     createdAt: string;
//     email: string;
//     firstName: string;
//     lastLogin: string;
//     lastName: string;
//     lastWorkspaceId: {
//       _id: string;
//       name: string;
//     };
//     organizationId: {
//       _id: string;
//       name: string;
//     };
//     password: string;
//     role: string;
//     roleId: number;
//     settings: {
//       RPPos: 'left' | 'right' | 'bottom' | 'top';
//       showOccurrenceCount: boolean;
//       showOccurrenceCountTerm: boolean;
//       RPDimensions: {
//         left: {
//           width: string;
//           height: string;
//           _id: string;
//         };
//         right: {
//           width: string;
//           height: string;
//           _id: string;
//         };
//         bottom: {
//           width: string;
//           height: string;
//           _id: string;
//         };
//         top: {
//           width: string;
//           height: string;
//           _id: string;
//         };
//       };
//     };
//     updatedAt: string;
//     __v: number;
//     _id: string;

//     lastSearchHistoryId: {
//       _id: string;
//       userId: string;
//       workspaceId: string;
//       searchTerms: searchTerms[];
//       name: string;
//       matchAllKeywords: boolean;
//       organizationId: string;
//       isGlobal: boolean;
//       createdAt: string;
//       updatedAt: string;
//       __v: number;
//     };
//   };
// };

// export interface AuthContextType {
//   initialization: () => void;
//   userDetails: UserResponse | undefined;
//   setIsAuthUser: Dispatch<SetStateAction<boolean>>;
//   isAuthUser: boolean;
//   clearAuthContext: () => void;
// }

// const defaultAuthContext: AuthContextType = {
//   initialization: () => {},
//   userDetails: undefined,
//   setIsAuthUser: () => {},
//   isAuthUser: false,
//   clearAuthContext: () => {},
// };

// export const AuthContext = createContext<AuthContextType>(defaultAuthContext);

// const AuthProvider = ({ children }: AuthProviderProps) => {
//   const [isAuthUser, setIsAuthUser] = useState(false);
//   const [userDetails, setUserDetails] = useState<UserResponse | undefined>(undefined);

//   const userDetailsAPI = useGet<UserResponse>(['userDetails'], GET.USER_DETAILS, !!isAuthUser);

//   useEffect(() => {
//     if (userDetailsAPI.isSuccess && userDetailsAPI.data && isAuthUser) {
//       setUserDetails(userDetailsAPI.data);
//     }
//   }, [userDetailsAPI, isAuthUser]);

//   const initialization = () => {
//     setIsAuthUser(true);
//   };

//   const clearAuthContext = () => {
//     setUserDetails(undefined);
//     setIsAuthUser(false);
//     queryClient.clear();
//   };

//   return (
//     <AuthContext.Provider
//       value={{
//         initialization,
//         userDetails,
//         setIsAuthUser,
//         clearAuthContext,
//         isAuthUser,
//       }}
//     >
//       {children}
//     </AuthContext.Provider>
//   );
// };

// export default AuthProvider;


// import { createContext, Dispatch, ReactNode, SetStateAction, useEffect, useState } from 'react';
// import useGet from '../hooks/useGet';
// import { GET } from '../services/apiRoutes';
// import { queryClient } from '../main';
// // import { fetchAuthUser, clearCurrentUser } from '../reducers/userSlice'; // Ensure path is correct

// interface AuthProviderProps {
//   children: ReactNode;
// }

// type searchTerms = {
//   query: string;
//   colorCode?: string;
//   matchType: 'partial' | 'exact';
//   count?: number;
//   proximity: boolean;
//   proximityInfo: { type: string; value: string };
//   synonyms?: {
//     term: string;
//     dictionary: string;
//     _id?: string;
//   }[];
// };

// type UserResponse = {
//   success: boolean;
//   message: string;
//   data: {
//     createdAt: string;
//     email: string;
//     firstName: string;
//     lastLogin: string;
//     lastName: string;
//     lastWorkspaceId: {
//       _id: string;
//       name: string;
//     };
//     organizationId: {
//       _id: string;
//       name: string;
//     };
//     password: string;
//     role: string;
//     roleId: number;
//     settings: {
//       RPPos: 'left' | 'right' | 'bottom' | 'top';
//       showOccurrenceCount: boolean;
//       showOccurrenceCountTerm: boolean;
//       RPDimensions: {
//         left: { width: string; height: string; _id: string };
//         right: { width: string; height: string; _id: string };
//         bottom: { width: string; height: string; _id: string };
//         top: { width: string; height: string; _id: string };
//       };
//     };
//     updatedAt: string;
//     __v: number;
//     _id: string;
//     lastSearchHistoryId: {
//       _id: string;
//       userId: string;
//       workspaceId: string;
//       searchTerms: searchTerms[];
//       name: string;
//       matchAllKeywords: boolean;
//       organizationId: string;
//       isGlobal: boolean;
//       createdAt: string;
//       updatedAt: string;
//       __v: number;
//     };
//   };
// };

// export interface AuthContextType {
//   initialization: () => void;
//   userDetails: UserResponse | undefined;
//   setIsAuthUser: Dispatch<SetStateAction<boolean>>;
//   isAuthUser: boolean;
//   clearAuthContext: () => void;
// }

// const defaultAuthContext: AuthContextType = {
//   initialization: () => {},
//   userDetails: undefined,
//   setIsAuthUser: () => {},
//   isAuthUser: false,
//   clearAuthContext: () => {},
// };

// export const AuthContext = createContext<AuthContextType>(defaultAuthContext);

// const AuthProvider = ({ children }: AuthProviderProps) => {
//   const [isAuthUser, setIsAuthUser] = useState(false);
//   const [userDetails, setUserDetails] = useState<UserResponse | undefined>(undefined);
//   // const dispatch = useDispatch<AppDispatch>();
//   // const { currentUser } = useSelector((state: RootState) => state.user);
// console.log('AuthProvider currentUser:', userDetails);
//   const userDetailsAPI = useGet<UserResponse>(['userDetails'], GET.USER_DETAILS, !!isAuthUser);

//   // useEffect(() => {
//   //   console.log('AuthProvider useEffect isAuthUser:', isAuthUser);
//   //   if (isAuthUser && !currentUser) {
//   //     dispatch(fetchAuthUser());
//   //   }
//   // }, [isAuthUser, currentUser, dispatch]);

//   useEffect(() => {
//     if (userDetailsAPI.isSuccess && userDetailsAPI.data && isAuthUser) {
//       setUserDetails(userDetailsAPI.data);
//     }
//   }, [userDetailsAPI, isAuthUser]);

//   const initialization = () => {
//     setIsAuthUser(true);
//   };

//   const clearAuthContext = () => {
//     setUserDetails(undefined);
//     setIsAuthUser(false);
//     // dispatch(clearCurrentUser());
//     queryClient.clear();
//   };

//   return (
//     <AuthContext.Provider
//       value={{
//         initialization,
//         userDetails,
//         setIsAuthUser,
//         clearAuthContext,
//         isAuthUser,
//       }}
//     >
//       {children}
//     </AuthContext.Provider>
//   );
// };

// export default AuthProvider;

//working version

// import { createContext, Dispatch, ReactNode, SetStateAction, useEffect, useState } from 'react';
// import useGet from '../hooks/useGet';
// import { GET } from '../services/apiRoutes';
// import { queryClient } from '../main';
// import { useDispatch, useSelector } from 'react-redux';
// import type { AppDispatch, RootState } from '../store';
// import { setCurrentUser, clearCurrentUser } from '../reducers/userSlice'; // Adjust path if needed

// interface AuthProviderProps {
//   children: ReactNode;
// }

// type searchTerms = {
//   query: string;
//   colorCode?: string;
//   matchType: 'partial' | 'exact';
//   count?: number;
//   proximity: boolean;
//   proximityInfo: { type: string; value: string };
//   synonyms?: {
//     term: string;
//     dictionary: string;
//     _id?: string;
//   }[];
// };

// type UserResponse = {
//   success: boolean;
//   message: string;
//   data: {
//     createdAt: string;
//     email: string;
//     firstName: string;
//     lastLogin: string;
//     lastName: string;
//     lastWorkspaceId: {
//       _id: string;
//       name: string;
//     };
//     organizationId: {
//       _id: string;
//       name: string;
//     };
//     password: string;
//     role: string;
//     roleId: number;
//     settings: {
//       RPPos: 'left' | 'right' | 'bottom' | 'top';
//       showOccurrenceCount: boolean;
//       showOccurrenceCountTerm: boolean;
//       RPDimensions: {
//         left: { width: string; height: string; _id: string };
//         right: { width: string; height: string; _id: string };
//         bottom: { width: string; height: string; _id: string };
//         top: { width: string; height: string; _id: string };
//       };
//     };
//     updatedAt: string;
//     __v: number;
//     _id: string;
//     lastSearchHistoryId: {
//       _id: string;
//       userId: string;
//       workspaceId: string;
//     searchTerms: searchTerms[];
//       name: string;
//       matchAllKeywords: boolean;
//       organizationId: string;
//       isGlobal: boolean;
//       createdAt: string;
//       updatedAt: string;
//       __v: number;
//     };
//   };
// };

// export interface AuthContextType {
//   initialization: () => void;
//   userDetails: UserResponse | undefined;
//   setIsAuthUser: Dispatch<SetStateAction<boolean>>;
//   isAuthUser: boolean;
//   clearAuthContext: () => void;
// }

// const defaultAuthContext: AuthContextType = {
//   initialization: () => {},
//   userDetails: undefined,
//   setIsAuthUser: () => {},
//   isAuthUser: false,
//   clearAuthContext: () => {},
// };

// export const AuthContext = createContext<AuthContextType>(defaultAuthContext);

// const AuthProvider = ({ children }: AuthProviderProps) => {
//   const [isAuthUser, setIsAuthUser] = useState(false);
//   const [userDetails, setUserDetails] = useState<UserResponse | undefined>(undefined);
//   const dispatch = useDispatch<AppDispatch>();
//   const { currentUser } = useSelector((state: RootState) => state.user);

//   const userDetailsAPI = useGet<UserResponse>(['userDetails'], GET.USER_DETAILS, !!isAuthUser);

//   useEffect(() => {
//     console.log('AuthProvider useEffect isAuthUser:', isAuthUser);
//     if (userDetailsAPI.isSuccess && userDetailsAPI.data && isAuthUser && !currentUser) {
//       setUserDetails(userDetailsAPI.data);
//       console.log('Setting current user in Redux:', userDetailsAPI.data);
//       // Map UserResponse to User for Redux
//       const user = {
//         id: userDetailsAPI.data.data._id,
//         name: `${userDetailsAPI.data.data.firstName} ${userDetailsAPI.data.data.lastName}`,
//         email: userDetailsAPI.data.data.email,
//       };
//       dispatch(setCurrentUser(user));
//     }
//   }, [userDetailsAPI, isAuthUser, dispatch, currentUser]);

//   const initialization = () => {
//     setIsAuthUser(true);
//   };

//   const clearAuthContext = () => {
//     setUserDetails(undefined);
//     setIsAuthUser(false);
//     dispatch(clearCurrentUser());
//     queryClient.clear();
//   };

//   return (
//     <AuthContext.Provider
//       value={{
//         initialization,
//         userDetails,
//         setIsAuthUser,
//         clearAuthContext,
//         isAuthUser,
//       }}
//     >
//       {children}
//     </AuthContext.Provider>
//   );
// };

// export default AuthProvider;


import { createContext, Dispatch, ReactNode, SetStateAction, useEffect, useState } from 'react';
import useGet from '../hooks/useGet';
import { GET } from '../services/apiRoutes';
import { queryClient } from '../main';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../store';
import { setCurrentUser, clearCurrentUser } from '../reducers/userSlice'; // Adjust path if needed

interface AuthProviderProps {
  children: ReactNode;
}

type searchTerms = {
  query: string;
  colorCode?: string;
  matchType: 'partial' | 'exact';
  count?: number;
  proximity: boolean;
  proximityInfo: { type: string; value: string };
  synonyms?: {
    term: string;
    dictionary: string;
    _id?: string;
  }[];
};

type UserResponse = {
  success: boolean;
  message: string;
  data: {
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
    password: string;
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
      searchTerms: searchTerms[];
      name: string;
      matchAllKeywords: boolean;
      organizationId: string;
      isGlobal: boolean;
      createdAt: string;
      updatedAt: string;
      __v: number;
    };
  };
};

export interface AuthContextType {
  initialization: () => void;
  userDetails: UserResponse | undefined;
  setIsAuthUser: Dispatch<SetStateAction<boolean>>;
  isAuthUser: boolean;
  clearAuthContext: () => void;
}

const defaultAuthContext: AuthContextType = {
  initialization: () => {},
  userDetails: undefined,
  setIsAuthUser: () => {},
  isAuthUser: false,
  clearAuthContext: () => {},
};

export const AuthContext = createContext<AuthContextType>(defaultAuthContext);

const AuthProvider = ({ children }: AuthProviderProps) => {
  const [isAuthUser, setIsAuthUser] = useState(false);
  const [userDetails, setUserDetails] = useState<UserResponse | undefined>(undefined);
  const dispatch = useDispatch<AppDispatch>();
  const { currentUser } = useSelector((state: RootState) => state.user);

  const userDetailsAPI = useGet<UserResponse>(['userDetails'], GET.USER_DETAILS, !!isAuthUser);

  useEffect(() => {
    console.log('AuthProvider useEffect - isAuthUser:', isAuthUser);
    if (userDetailsAPI.isLoading) {
      console.log('Fetching user details...');
      return;
    }
    if (userDetailsAPI.isSuccess && userDetailsAPI.data && isAuthUser && !currentUser) {
      console.log('User details fetched successfully:', userDetailsAPI.data.data);
      setUserDetails(userDetailsAPI.data);
      // Dispatch the entire userDetailsAPI.data.data to Redux
      dispatch(setCurrentUser(userDetailsAPI.data.data));
    }
    if (userDetailsAPI.isError) {
      console.error('Failed to fetch user details:', userDetailsAPI.error);
    }
  }, [userDetailsAPI, isAuthUser, dispatch, currentUser]);

  const initialization = () => {
    setIsAuthUser(true);
  };

  const clearAuthContext = () => {
    setUserDetails(undefined);
    setIsAuthUser(false);
    dispatch(clearCurrentUser());
    queryClient.clear();
  };

  return (
    <AuthContext.Provider
      value={{
        initialization,
        userDetails,
        setIsAuthUser,
        clearAuthContext,
        isAuthUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;