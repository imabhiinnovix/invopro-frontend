import { useState, useContext, useEffect } from "react";
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

const UserDropdown = () => {
  const { userDetails } = useContext(AuthContext);
  const [selectedUser, setSelectedUser] = useState<string>(
    userDetails?.data?._id || ""
  );
  const [decodedToken, setDecodedToken] = useState({});
  const navigate = useNavigate();
  const token = getAuthToken();

  useEffect(() => {
    if (userDetails?.data?._id) {
      setSelectedUser(userDetails.data._id);
    }
  }, [userDetails]);

  const usersQuery = useGet<UserListResponse>(
    ["users"],
    GET.USER_LIST,
    sessionStorage.getItem("Users") ? false : true
  );

  const assumeSessionMutation = usePost<
    { accessUserId: string },
    { success: boolean; message: string; data: { token: string } }
  >(
    [""],
    (data) => {
      console.log(data);
      setAuthToken(data?.data?.token);
      navigate("/dashboard");
      window.location.reload();
    },
    true
  );

  const originalUserId = decodedToken?.impersonatorUserId;

  useEffect(() => {
    if (token) {
      try {
        const decoded: any = jwtDecode(token);
        setDecodedToken(decoded);
      } catch (error) {
        console.error("Error decoding token:", error);
      }
    }
  }, [userDetails?.data]);

  const userIdToMatch = originalUserId ?? userDetails?.data?._id;

  useEffect(() => {
    if (!usersQuery.data?.data) return;
    const { currentUser, otherUsers } = usersQuery.data?.data?.reduce(
      (acc, user) => {
        if (user._id === userIdToMatch) {
          acc.currentUser.push(user);
        } else {
          acc.otherUsers.push(user);
        }
        return acc;
      },
      { currentUser: [], otherUsers: [] }
    ) ?? { currentUser: [], otherUsers: [] };

    const filteredOtherUsers = otherUsers.filter((user) => {
      return (
        user?.roleIds[0]?.name === "User" ||
        user?.roleIds[0]?.roleType?.name === "User"
      );
    });

    const tempUsers = [...currentUser, ...filteredOtherUsers].map((user) => {
      return {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
      };
    });

    if (!decodedToken?.isImpersonation) {
      sessionStorage.setItem("Users", JSON.stringify(tempUsers));
    }
  }, [usersQuery.data?.data]);

  const handleChange = (event: SelectChangeEvent<string>) => {
    const userId = event.target.value;
    setSelectedUser(userId);

    // if (userId === decodedToken?.impersonatorUserId) {
    //   sessionStorage.removeItem("Users");
    // }

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
          {JSON.parse(sessionStorage.getItem("Users") || "[]").map((user) => (
            <MenuItem key={user._id} value={user._id}>
              {user.firstName} {user.lastName}{" "}
              {(originalUserId
                ? originalUserId === user._id
                : userDetails?.data._id === user._id) && "(Current User)"}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
};

export default UserDropdown;
