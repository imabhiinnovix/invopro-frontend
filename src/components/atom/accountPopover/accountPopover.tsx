import { useState, useCallback, useContext, useEffect } from "react";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Avatar from "@mui/material/Avatar";
import Popover from "@mui/material/Popover";
import Divider from "@mui/material/Divider";
import MenuList from "@mui/material/MenuList";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import MenuItem, { menuItemClasses } from "@mui/material/MenuItem";
import { AuthContext } from "../../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { clearLocalStorage } from "../../../utils/handleLocalStorage";
import { STYLE_GUIDE } from "../../../styles";

interface MenuItem {
  label: string;
}

export function AccountPopover() {
  const menuData: MenuItem[] = [];
  const navigate = useNavigate();
  const [openPopover, setOpenPopover] = useState<HTMLButtonElement | null>(
    null
  );
  const { userDetails, initialization, clearAuthContext, isAuthUser } =
    useContext(AuthContext);
  const { imagePath } = userDetails?.data || {};
  const handleOpenPopover = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();
      setOpenPopover(event.currentTarget);
    },
    []
  );

  const handleClosePopover = useCallback(() => {
    setOpenPopover(null);
  }, []);

  const logout = useCallback(() => {
    clearAuthContext();
    clearLocalStorage();
    handleClosePopover();
    navigate("/login");
  }, [clearAuthContext, handleClosePopover, navigate]);

  useEffect(() => {
    if (!isAuthUser) {
      initialization();
    }
  }, [initialization, isAuthUser]);

  function getInitials() {
    try {
      return (
        userDetails?.data?.firstName?.charAt(0).toUpperCase() +
        userDetails?.data?.lastName?.charAt(0).toUpperCase()
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
          src={imagePath}
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

        <Divider sx={{ borderStyle: "dashed" }} />

        {/* <MenuList
          disablePadding
          sx={{
            p: STYLE_GUIDE.SPACING.s2,
            gap: STYLE_GUIDE.SPACING.s1,
            display: "flex",
            flexDirection: "column",
            [`& .${menuItemClasses.root}`]: {
              px: STYLE_GUIDE.SPACING.s2,
              gap: STYLE_GUIDE.SPACING.s4,
              borderRadius: 0.75,
              color: STYLE_GUIDE.COLORS.textMediumGray,
              "&:hover": { color: STYLE_GUIDE.COLORS.textDarkGray },
              [`&.${menuItemClasses.selected}`]: {
                color: STYLE_GUIDE.COLORS.textDarkGray,
                bgcolor: STYLE_GUIDE.COLORS.backgroundHover,
                fontWeight: STYLE_GUIDE.TYPOGRAPHY.fontWeight.semiBold,
              },
            },
          }}
        >
          {menuData?.map((option) => (
            <MenuItem
              key={option.label}
            >
              {option.label}
            </MenuItem>
          ))}
        </MenuList> */}

        <Box sx={{ p: STYLE_GUIDE.SPACING.s2 }}>
          <Button
            fullWidth
            color="error"
            variant="text"
            onClick={logout}
            sx={{ height: 30 }}
          >
            Logout
          </Button>
        </Box>
      </Popover>
    </>
  );
}
