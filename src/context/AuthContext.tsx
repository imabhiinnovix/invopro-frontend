import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useEffect,
  useState,
  useCallback,
  useRef,
} from "react";
import { useIdleTimer } from "react-idle-timer";
import { clearLocalStorage, getAuthToken } from "../utils/handleLocalStorage";
import useGet from "../hooks/useGet";
import { GET } from "../services/apiRoutes";
import { queryClient } from "../main";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../store";
import {
  setCurrentUser,
  clearCurrentUser,
  setPermissions,
} from "../reducers/userSlice";
import { NewBackendPermission } from "../utils/utils";

interface AuthProviderProps {
  children: ReactNode;
}

type searchTerms = {
  query: string;
  colorCode?: string;
  matchType: "partial" | "exact";
  count?: number;
  proximity: boolean;
  proximityInfo: { type: string; value: string };
  synonyms?: {
    term: string;
    dictionary: string;
    _id?: string;
  }[];
};

export type UserResponse = {
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
    permissionIds: string[];
    password: string;
    role: string;
    roleId: number;
    imagePath?: string;
    roleIds: Array<{
      _id: string;
      name: string;
      isSuperUser?: boolean;
    }>;
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
  logout: () => void;
  refreshUserDetails: () => void;
  isSuperUser: () => boolean;
  getOrganizationIdForUsers: () => string | null;
  orgLogo: string | null;
}

const defaultAuthContext: AuthContextType = {
  initialization: () => {},
  userDetails: undefined,
  setIsAuthUser: () => {},
  isAuthUser: false,
  clearAuthContext: () => {},
  logout: () => {},
  refreshUserDetails: () => {},
  isSuperUser: () => false,
  getOrganizationIdForUsers: () => null,
  orgLogo: null,
};

export const AuthContext = createContext<AuthContextType>(defaultAuthContext);

const AuthProvider = ({ children }: AuthProviderProps) => {
  const [isAuthUser, setIsAuthUser] = useState(false);
  const [userDetails, setUserDetails] = useState<UserResponse | undefined>(
    undefined,
  );
  const [orgLogo, setOrgLogo] = useState<string | null>(null);
  const dispatch = useDispatch<AppDispatch>();
  const { currentUser } = useSelector(
    (state: RootState) => state.userPermission,
  );

  const userDetailsAPI = useGet<UserResponse>(
    ["userDetails"],
    GET.USER_DETAILS,
    !!isAuthUser,
  );

  const orgId = userDetailsAPI.data?.data?.organizationId?._id;

  const orgDetailsAPI = useGet<{ success: boolean; data: { logo?: string } }>(
    ["orgDetails", orgId || ""],
    `/common/organization/${orgId}`,
    !!orgId && isAuthUser,
  );

  useEffect(() => {
    if (orgDetailsAPI.isSuccess && orgDetailsAPI.data?.data?.logo) {
      setOrgLogo(orgDetailsAPI.data.data.logo);
    }
  }, [orgDetailsAPI.isSuccess, orgDetailsAPI.data]);

  useEffect(() => {
    if (userDetailsAPI.isLoading) {
      return;
    }
    if (userDetailsAPI.isSuccess && userDetailsAPI.data && isAuthUser) {
      setUserDetails(userDetailsAPI.data);
      if (!currentUser) {
        dispatch(setCurrentUser(userDetailsAPI.data.data));
        dispatch(
          setPermissions(
            userDetailsAPI.data.data
              .permissionIds as unknown as NewBackendPermission[],
          ),
        );
      }
    }
    if (userDetailsAPI.isError) {
      console.error("Failed to fetch user details:", userDetailsAPI.error);
    }
  }, [userDetailsAPI, isAuthUser, dispatch, currentUser]);

  useEffect(() => {
    const isAuthenticated = getAuthToken();
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
    setOrgLogo(null);
    setIsAuthUser(false);
    dispatch(clearCurrentUser());
    queryClient.clear();
  };

  const refreshUserDetails = () => {
    if (isAuthUser) {
      userDetailsAPI.refetch();
    }
  };

  const logout = useCallback(() => {
    clearLocalStorage();
    clearAuthContext();
    // navigate to login
    window.location.href = "/login";
  }, [clearAuthContext]);

  const idleTimeoutMs = 30 * 60 * 1000; // 30 minutes
  const hiddenTimerRef = useRef<number | null>(null);

  const _hasToken = Boolean(getAuthToken());
  const _hasLocalToken = Boolean(localStorage.getItem("token"));
  useIdleTimer({
    timeout: idleTimeoutMs,
    onIdle: () => {
      if (isAuthUser && _hasToken) {
        // alert("You have been logged out due to inactivity.");
        logout();
      }
    },
    events: ["mousemove", "keydown", "mousedown", "touchstart", "scroll"],
    debounce: 500,
    crossTab: _hasLocalToken,
  });

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        hiddenTimerRef.current = window.setTimeout(() => {
          if (isAuthUser) {
            // alert("You have been logged out due to inactivity.");
            logout();
          }
        }, idleTimeoutMs);
      } else {
        if (hiddenTimerRef.current) {
          clearTimeout(hiddenTimerRef.current);
          hiddenTimerRef.current = null;
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    const handleStorage = (e: StorageEvent) => {
      if (e.key === "token") {
        if (e.newValue === null) {
          clearAuthContext();
          window.location.href = "/login";
        } else {
          if (!isAuthUser) {
            initialization();
          }
        }
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("storage", handleStorage);
      if (hiddenTimerRef.current) {
        clearTimeout(hiddenTimerRef.current);
        hiddenTimerRef.current = null;
      }
    };
  }, [logout, isAuthUser]);

  const isSuperUser = () => {
    const hasSuperUserRole =
      userDetails?.data?.roleIds?.some((role) => role.isSuperUser === true) ||
      false;
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
        logout,
        refreshUserDetails,
        isSuperUser,
        getOrganizationIdForUsers,
        orgLogo,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
