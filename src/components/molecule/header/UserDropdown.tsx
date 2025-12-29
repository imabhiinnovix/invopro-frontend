import { useState, useContext, useEffect, useMemo } from "react";
import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Box,
  SelectChangeEvent,
} from "@mui/material";
import { GET, POST } from "../../../services/apiRoutes";
import useGet from "../../../hooks/useGet";
import usePost from "../../../hooks/usePost";
import { UserListResponse } from "../../../pages/users/types";
import { getAuthToken, setAuthToken } from "../../../utils/handleLocalStorage";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../../context/AuthContext";
import { jwtDecode } from "jwt-decode";

// ------------------------------------------------------------------------

const USERS_STORAGE_KEY = "Users";
const REFETCH_USERS_FLAG = "RefetchUsers";

interface DecodedToken {
  impersonatorUserId?: string;
  isImpersonation?: boolean;
  userId?: string;
  [key: string]: unknown;
}

interface SimplifiedUser {
  _id: string;
  firstName: string;
  lastName: string;
}

// ------------------------------------------------------------------------

const getUsersFromStorage = (): SimplifiedUser[] => {
  try {
    const stored = sessionStorage.getItem(USERS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error("Error parsing users from sessionStorage:", error);
    return [];
  }
};

const setUsersInStorage = (users: SimplifiedUser[]): void => {
  try {
    sessionStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  } catch (error) {
    console.error("Error storing users in sessionStorage:", error);
  }
};

const decodeAuthToken = (token: string): DecodedToken | null => {
  try {
    return jwtDecode<DecodedToken>(token);
  } catch (error) {
    console.error("Error decoding token:", error);
    return null;
  }
};

const hasUserRole = (user: any): boolean => {
  return (
    user?.roleIds?.[0]?.name === "User" ||
    user?.roleIds?.[0]?.roleType?.name === "User"
  );
};

// ------------------------------------------------------------------------

const UserDropdown = () => {
  const { userDetails } = useContext(AuthContext);
  const navigate = useNavigate();
  const token = getAuthToken();

  const [selectedUser, setSelectedUser] = useState<string>("");
  const [cachedUsers, setCachedUsers] = useState<SimplifiedUser[]>([]);

  const decodedToken = useMemo<DecodedToken | null>(() => {
    return token ? decodeAuthToken(token) : null;
  }, [token]);

  const originalUserId =
    decodedToken?.impersonatorUserId ?? userDetails?.data?._id;

  const usersQuery = useGet<UserListResponse>(
    ["users"],
    GET.USER_LIST,
    !sessionStorage.getItem(USERS_STORAGE_KEY)
  );

  const assumeSessionMutation = usePost<
    { accessUserId: string },
    { success: boolean; message: string; data: { token: string } }
  >(
    [""],
    (data) => {
      if (data?.data?.token) {
        setAuthToken(data.data.token);
        navigate("/dashboard");
        window.location.reload();
      }
    },
    true
  );

  const processedUsers = useMemo<SimplifiedUser[]>(() => {
    if (!usersQuery.data?.data) return [];

    const users = usersQuery.data.data;
    const currentUserList: any[] = [];
    const otherUsersList: any[] = [];

    users.forEach((user) => {
      if (user._id === originalUserId) {
        currentUserList.push(user);
      } else {
        otherUsersList.push(user);
      }
    });

    const filteredOtherUsers = otherUsersList.filter(hasUserRole);

    return [...currentUserList, ...filteredOtherUsers].map((user) => ({
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
    }));
  }, [usersQuery.data?.data, originalUserId]);

  useEffect(() => {
    if (userDetails?.data?._id) {
      setSelectedUser(userDetails.data._id);
    }
  }, [userDetails?.data?._id]);

  useEffect(() => {
    if (processedUsers.length > 0 && !decodedToken?.isImpersonation) {
      setUsersInStorage(processedUsers);
      setCachedUsers(processedUsers);
    }
  }, [processedUsers, decodedToken?.isImpersonation]);

  useEffect(() => {
    const storedUsers = getUsersFromStorage();
    if (storedUsers.length > 0) {
      setCachedUsers(storedUsers);
    }
  }, []);

  useEffect(() => {
    const shouldRefetch = sessionStorage.getItem(REFETCH_USERS_FLAG);

    if (shouldRefetch === "true") {
      sessionStorage.removeItem(REFETCH_USERS_FLAG);

      sessionStorage.removeItem(USERS_STORAGE_KEY);
      setCachedUsers([]);

      usersQuery.refetch();
    }
  }, []);

  const displayUsers = cachedUsers.length > 0 ? cachedUsers : processedUsers;

  const handleChange = (event: SelectChangeEvent<string>) => {
    const userId = event.target.value;
    setSelectedUser(userId);

    if (userId === originalUserId) {
      sessionStorage.setItem(REFETCH_USERS_FLAG, "true");
    }

    if (userId) {
      assumeSessionMutation.mutate({
        url: POST.ASSUME_SESSION,
        payload: { accessUserId: userId },
      });
    }
  };

  return (
    <Box sx={{ minWidth: 200 }}>
      <FormControl fullWidth size="small">
        <InputLabel id="user-select-label">User</InputLabel>
        <Select
          labelId="user-select-label"
          id="user-select"
          value={selectedUser}
          label="User"
          onChange={handleChange}
        >
          {displayUsers.map((user) => (
            <MenuItem key={user._id} value={user._id}>
              {user.firstName} {user.lastName}
              {originalUserId === user._id && " (Current User)"}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
};

export default UserDropdown;
