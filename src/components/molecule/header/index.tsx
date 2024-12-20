import { AppBar, Toolbar, IconButton, Box, useMediaQuery, useTheme } from '@mui/material';
import { Menu as MenuIcon } from '@mui/icons-material';
import { useLocation } from 'react-router-dom';

import logo from '../../../assets/Searchivix-Logo-TRANS-V1.png';

const Header = () => {
  const { pathname } = useLocation();
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm')); // Check if screen size is small (e.g., xs, sm)

  return (
    <>
      <AppBar
        position="sticky"
        color="transparent"
        elevation={2} // Disable default elevation shadow
      >
        <Toolbar>
          <Box
            component="a"
            href="/"
            sx={{
              display: 'flex',
              alignContent: 'center',
              gap: '16px', // Add some gap between logo and icon
              justifyContent: isSmallScreen ? 'space-between' : 'flex-start', // Adjust layout based on screen size
              width: '100%', // Ensure Box takes up full width
            }}
          >
            <img src={logo} alt="Logo" style={{ height: '40px', transform: 'rotate(-1deg)' }} />
            {!['/login', '/otp-login'].includes(pathname) && (
              <IconButton edge="start" color="inherit" aria-label="menu">
                <MenuIcon />
              </IconButton>
            )}
          </Box>
        </Toolbar>
      </AppBar>
    </>
  );
};

export default Header;
