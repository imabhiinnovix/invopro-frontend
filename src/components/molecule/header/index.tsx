import { AppBar, Toolbar, IconButton, Box } from '@mui/material';

import { useLocation } from 'react-router-dom';

import logo from '../../../assets/Searchivix-Logo-TRANS-V1.png';
import { AccountPopover } from '../../atom/accountPopover/accountPopover';
import { Menu as MenuIcon } from '@mui/icons-material';
import { useNav } from '../../../context/NavContext';

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
        color="transparent"
        elevation={2} // Disable default elevation shadow
        sx={{ height: 70 }}
      >
        <Toolbar>
          <Box
            component="a"
            // href="/"
            gap={1}
            sx={{
              display: 'flex',
              alignContent: 'center',
              justifyContent: 'space-between', // Adjust layout based on screen size
              width: '100%', // Ensure Box takes up full width
            }}
          >
            <Box gap={0} display="flex" alignItems="center">
              {!['/login', '/otp-login', '/otp-login/otp'].includes(pathname) && (
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
              )}
              <img src={logo} alt="Logo" style={{ height: '40px', transform: 'rotate(-1deg)' }} />
            </Box>
            <Box>{!['/login', '/otp-login', '/otp-login/otp'].includes(pathname) && <AccountPopover />}</Box>
          </Box>
        </Toolbar>
      </AppBar>
    </>
  );
};

export default Header;
