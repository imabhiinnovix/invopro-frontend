import { useState, useCallback, useContext, useEffect, useMemo } from "react";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Avatar from "@mui/material/Avatar";
import Popover from "@mui/material/Popover";
import Divider from "@mui/material/Divider";

import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";

import { AuthContext } from "../../../context/AuthContext";

import { STYLE_GUIDE } from "../../../styles";
import { RootState } from "../../../store";
import { checkPermission } from "../../../utils/utils";
import { PermissionsMap } from "../../../utils/constants";
import { useSelector } from "react-redux";
import { jwtDecode } from "jwt-decode";
import { getAuthToken } from "../../../utils/handleLocalStorage";

interface DecodedToken {
  impersonatorUserId?: string;
  isImpersonation?: boolean;
  userId?: string;
  [key: string]: unknown;
}

const decodeAuthToken = (token: string): DecodedToken | null => {
  try {
    return jwtDecode<DecodedToken>(token);
  } catch (error) {
    console.error("Error decoding token:", error);
    return null;
  }
};

export function AccountPopover() {
  const [openPopover, setOpenPopover] = useState<HTMLButtonElement | null>(
    null,
  );
  const { userDetails, initialization, logout, isAuthUser } =
    useContext(AuthContext);
  const permissions = useSelector(
    (state: RootState) => state.userPermission.permissions,
  );
  const shouldAllowProfilePictureView = checkPermission(
    permissions,
    PermissionsMap.USER_PROFILE_IMAGE,
    "get",
  );
  const token = getAuthToken();

  const decodedToken = useMemo<DecodedToken | null>(() => {
    return token ? decodeAuthToken(token) : null;
  }, [token]);

  const originalUserId =
    decodedToken?.impersonatorUserId ?? userDetails?.data?._id;

  const { imagePath } = userDetails?.data || {};
  const handleOpenPopover = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();
      setOpenPopover(event.currentTarget);
    },
    [],
  );

  const handleClosePopover = useCallback(() => {
    setOpenPopover(null);
  }, []);

  const handleLogoutClick = useCallback(() => {
    logout();
    handleClosePopover();
  }, [logout, handleClosePopover]);

  useEffect(() => {
    if (!isAuthUser) {
      initialization();
    }
  }, [initialization, isAuthUser]);

  function getInitials() {
    try {
      const firstName = userDetails?.data?.firstName || "";
      const lastName = userDetails?.data?.lastName || "";
      return (
        (firstName.charAt(0)?.toUpperCase() || "") +
        (lastName.charAt(0)?.toUpperCase() || "")
      );
    } catch (error) {
      console.error("Error getting initials:", error);
      return "A";
    }
  }

  if (!isAuthUser) {
    return null;
  }

  return (
    <>
      <IconButton
        onClick={handleOpenPopover}
        sx={{
          width: 35,
          height: 35,
        }}
      >
        <Avatar
          alt={userDetails?.data?.firstName?.[0]?.toUpperCase()}
          sx={{
            width: 35,
            height: 35,
            fontSize: 14,
            objectFit: "cover",
            backgroundColor: "white",
            border: "1px solid #f0f0f0",
            color: STYLE_GUIDE.COLORS.textMediumGray,
          }}
          src={
            shouldAllowProfilePictureView && imagePath
              ? `${imagePath}?t=${
                  userDetails?.data?.updatedAt
                    ? new Date(userDetails.data.updatedAt).getTime()
                    : Date.now()
                }`
              : undefined
          }
        >
          {getInitials()}
        </Avatar>
      </IconButton>

      <Popover
        open={!!openPopover}
        anchorEl={openPopover}
        onClose={handleClosePopover}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        slotProps={{
          paper: {
            sx: { width: 200 },
          },
        }}
      >
        <Box sx={{ p: STYLE_GUIDE.SPACING.s4, pb: STYLE_GUIDE.SPACING.s2 }}>
          <Typography variant="subtitle2" noWrap fontSize={12}>
            {`${userDetails?.data?.firstName} ${userDetails?.data?.lastName}`}
          </Typography>

          <Typography
            variant="body2"
            sx={{ color: STYLE_GUIDE.COLORS.textMediumGray }}
            fontSize={12}
            noWrap
          >
            {userDetails?.data?.email}
          </Typography>
        </Box>

        {originalUserId === userDetails?.data?._id ? (
          <>
            <Divider sx={{ borderStyle: "dashed" }} />

            <Box sx={{ p: STYLE_GUIDE.SPACING.s2 }}>
              <Button
                fullWidth
                color="error"
                variant="text"
                onClick={handleLogoutClick}
                sx={{ height: 30 }}
              >
                Logout
              </Button>
            </Box>
          </>
        ) : null}
      </Popover>
    </>
  );
}
