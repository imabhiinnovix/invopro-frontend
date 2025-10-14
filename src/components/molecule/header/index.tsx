import { AppBar, Toolbar, IconButton, Box } from "@mui/material";

import { useLocation } from "react-router-dom";

import logo from "../../../assets/ReportiVix-logo.png";
import { AccountPopover } from "../../atom/accountPopover/accountPopover";
import { Menu as MenuIcon } from "@mui/icons-material";
import { useNav } from "../../../context/NavContext";
import { STYLE_GUIDE } from "../../../styles";

const Header = () => {
  const { pathname } = useLocation();
  const { openNav, setOpenNav } = useNav();
  const handleClick = () => {
    // Use the functional update form correctly
    setOpenNav(!openNav); // This toggles the value of `openNav`
  };

  return (
    <>
      <AppBar
        position="sticky"
        color="inherit"
        elevation={2}
        sx={{
          height: 70,
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
                sx={{ width: 150, height: "auto" }}
              />
              {/* <img src={logo} alt="Logo" /> */}
            </Box>
            <Box display="flex" alignItems="center" justifyContent="center">
              {!["/login", "/otp-login", "/otp-login/otp"].includes(
                pathname
              ) && <AccountPopover />}
            </Box>
          </Box>
        </Toolbar>
      </AppBar>
    </>
  );
};

export default Header;
