import { AppBar, Toolbar, Box } from "@mui/material";

import { useLocation } from "react-router-dom";

import logo from "../../../assets/logo.png";
import { AccountPopover } from "../../atom/accountPopover/accountPopover";
// import { Menu as MenuIcon } from "@mui/icons-material";
// import { useNav } from "../../../context/NavContext";
import { STYLE_GUIDE } from "../../../styles";
import { useUnifiedTheme } from "../../../hooks/useUnifiedTheme";
import UserDropdown from "./UserDropdown";
import { jwtDecode } from "jwt-decode";
import { getAuthToken } from "../../../utils/handleLocalStorage";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../../context/AuthContext";

const Header = () => {
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const { pathname } = useLocation();
  const theme = useUnifiedTheme();
  const token = getAuthToken();
  const { userDetails } = useContext(AuthContext);

  useEffect(() => {
    if (token) {
      try {
        const decoded: any = jwtDecode(token);
        setShowUserDropdown(
          !!(decoded.isImpersonation && decoded.impersonatorUserId) ||
            userDetails?.data.roleIds[0].name === "Super Admin" ||
            userDetails?.data.roleIds[0].name === "Admin"
        );
      } catch (error) {
        console.error("Error decoding token:", error);
      }
    }
  }, [userDetails?.data]);

  return (
    <>
      <AppBar
        position="sticky"
        color="inherit"
        elevation={2}
        sx={{
          height: 60,
          bgcolor: "#f9f9f9",
          borderBottom: `1px solid ${theme.palette.divider}`,
          boxShadow: "none",
        }}
      >
        <Toolbar>
          <Box
            component="a"
            // href="/"
            gap={STYLE_GUIDE.SPACING.s2}
            sx={{
              display: "flex",
              alignContent: "center",
              justifyContent: "space-between", // Adjust layout based on screen size
              width: "100%", // Ensure Box takes up full width
            }}
          >
            <Box gap={0} display="flex" alignItems="center">
              {/* {!["/login", "/otp-login", "/otp-login/otp"].includes(
                pathname
              ) && (
                <IconButton
                  edge="start"
                  color="inherit"
                  aria-label="menu"
                  onClick={(event) => {
                    event.preventDefault(); // Prevents any default behavior (like page reload)
                    handleClick(); // Toggles the nav state
                  }}
                >
                  <MenuIcon />
                </IconButton>
              )} */}
              <Box
                component="img"
                src={logo}
                alt="Logo"
                sx={{ width: "auto", height: 60 }}
              />
              {/* <img src={logo} alt="Logo" /> */}
            </Box>
            <Box
              display="flex"
              alignItems="center"
              justifyContent="center"
              gap={2}
            >
              {!["/login", "/otp-login", "/otp-login/otp"].includes(
                pathname
              ) && (
                <>
                  {showUserDropdown && <UserDropdown />}
                  <AccountPopover />
                </>
              )}
            </Box>
          </Box>
        </Toolbar>
      </AppBar>
    </>
  );
};

export default Header;
