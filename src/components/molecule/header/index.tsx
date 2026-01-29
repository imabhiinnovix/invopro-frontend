import { AppBar, Toolbar, Box, IconButton, Typography } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { useLocation } from "react-router-dom";
import { AccountPopover } from "../../atom/accountPopover/accountPopover";
import { useNav } from "../../../context/NavContext";
import { STYLE_GUIDE } from "../../../styles";
import { useUnifiedTheme } from "../../../hooks/useUnifiedTheme";
import UserDropdown from "./UserDropdown";
import { jwtDecode } from "jwt-decode";
import { getAuthToken } from "../../../utils/handleLocalStorage";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../../context/AuthContext";
import { ThemeSwitcherButton } from "../../common/ThemeSwitcher/ThemeSwitcher";
import logo from "../../../assets/reportiVix-logo-2.png";

const HEADER_TITLE = "Analytics Dashboard";
const FAVICON_SRC = "/Reportivix-fav-32.png";

const Header = () => {
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const { pathname } = useLocation();
  const theme = useUnifiedTheme();
  const token = getAuthToken();
  const { userDetails } = useContext(AuthContext);
  const { openNav, setOpenNav } = useNav();

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

  const handleMenuClick = () => {
    setOpenNav(!openNav);
  };

  const isPublicRoute = ["/login", "/otp-login", "/otp-login/otp"].includes(
    pathname
  );

  return (
    <>
      <AppBar
        position="sticky"
        color="inherit"
        elevation={2}
        sx={{
          bgcolor: theme.palette.background.paper,
          borderBottom: `1px solid ${theme.palette.divider}`,
          boxShadow: "none",
        }}
      >
        <Toolbar
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            width: "100%",
            pl: { xs: 0, sm: 0 },
            pr: { xs: 2, sm: 2.5 }
          }}
        >
          {/* Left: Logo (full when sidebar open, favicon when collapsed) */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-start",
              gap: 1.5,
              width: {
                xs: "auto",
                sm: openNav ? "250px" : `calc(${theme.spacing(7)} + 1px)`,
              },
              flexShrink: 0,
              pl: { xs: 0, sm: openNav ? 2.5 : 1 },
              pr: { xs: 0, sm: openNav ? 0 : 1 },
              height: 64,
              borderRight: `1px solid ${theme.palette.divider}`,
              transition: "width 225ms ease-in-out",
            }}
          >
            {!isPublicRoute && (
              <Box
                component="img"
                src={openNav ? logo : FAVICON_SRC}
                alt="Reportivix Logo"
                sx={{
                  height: "auto",
                  width: openNav ? "150px" : 32,
                  maxHeight: 40,
                  objectFit: "contain",
                  transition: "width 225ms ease-in-out",
                }}
              />
            )}
          </Box>

          {/* Right: Page Title (over content area) */}
          {!isPublicRoute && (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-start",
                flex: 1,
                pl: {xs: 0, sm: 2}
              }}
            >
              <IconButton
                edge="start"
                color="inherit"
                aria-label="menu"
                onClick={handleMenuClick}
                sx={{
                  color: STYLE_GUIDE.COLORS.textPrimary,
                  ml: { xs: 0, sm: 0},
                  "&:hover": {
                    backgroundColor: STYLE_GUIDE.COLORS.backgroundHover,
                  },
                }}
              >
                <MenuIcon />
              </IconButton>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 600,
                  ml: { xs: 0, sm: 2 },
                  color: STYLE_GUIDE.COLORS.textPrimary,
                  fontSize: { xs: "1rem", sm: "1.125rem" },
                }}
              >
                {HEADER_TITLE}
              </Typography>
            </Box>
          )}

          {/* Right: User Actions */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
              gap: 2,
              flex: 1,
            }}
          >
            {!isPublicRoute && (
              <>
                <ThemeSwitcherButton />
                {showUserDropdown && <UserDropdown />}
                <AccountPopover />
              </>
            )}
          </Box>
        </Toolbar>
      </AppBar>
    </>
  );
};

export default Header;
