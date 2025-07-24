import { createContext, Dispatch, ReactNode, SetStateAction, useEffect, useState } from 'react';
import useGet from '../hooks/useGet';
import { GET } from '../services/apiRoutes';
import { queryClient } from '../main';

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
    roleIds: Array<{
      _id: string;
      name: string;
      isSuperUser?: boolean;
    }>;
    settings: {
      RPPos: 'left' | 'right' | 'bottom' | 'top';
      showOccurrenceCount: boolean;
      showOccurrenceCountTerm: boolean;
      RPDimensions: {
        left: {
          width: string;
          height: string;
          _id: string;
        };
        right: {
          width: string;
          height: string;
          _id: string;
        };
        bottom: {
          width: string;
          height: string;
          _id: string;
        };
        top: {
          width: string;
          height: string;
          _id: string;
        };
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
  refreshUserDetails: () => void;
  isSuperUser: () => boolean;
  getOrganizationIdForUsers: () => string | null;
}

const defaultAuthContext: AuthContextType = {
  initialization: () => {},
  userDetails: undefined,
  setIsAuthUser: () => {},
  isAuthUser: false,
  clearAuthContext: () => {},
  refreshUserDetails: () => {},
  isSuperUser: () => false,
  getOrganizationIdForUsers: () => null,
};

export const AuthContext = createContext<AuthContextType>(defaultAuthContext);

const AuthProvider = ({ children }: AuthProviderProps) => {
  const [isAuthUser, setIsAuthUser] = useState(false);
  const [userDetails, setUserDetails] = useState<UserResponse | undefined>(undefined);

  const userDetailsAPI = useGet<UserResponse>(['userDetails'], GET.USER_DETAILS, !!isAuthUser);

  useEffect(() => {
    if (userDetailsAPI.isSuccess && userDetailsAPI.data && isAuthUser) {
      setUserDetails(userDetailsAPI.data);
    }
  }, [userDetailsAPI, isAuthUser]);

  useEffect(() => {
    const isAuthenticated = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (isAuthenticated && !isAuthUser) {
      initialization();
    }
  }, []);

  const initialization = () => {
    setIsAuthUser(true);
    userDetailsAPI.refetch();
  };

  const clearAuthContext = () => {
    setUserDetails(undefined);
    setIsAuthUser(false);
    queryClient.clear();
  };

  const refreshUserDetails = () => {
    if (isAuthUser) {
      userDetailsAPI.refetch();
    }
  };

  const isSuperUser = () => {
    const hasSuperUserRole = userDetails?.data?.roleIds?.some(role => role.isSuperUser === true) || false;
    return hasSuperUserRole;
  };

  const getOrganizationIdForUsers = () => {
    return userDetails?.data?.organizationId?._id || null;
  };

  return (
    <AuthContext.Provider
      value={{
        initialization,
        userDetails,
        setIsAuthUser,
        clearAuthContext,
        isAuthUser,
        refreshUserDetails,
        isSuperUser,
        getOrganizationIdForUsers,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
