import { Box } from '@mui/material';
import { Outlet } from 'react-router-dom';
import SideNav from '../../atom/sideNav/sideNav';

const CommonLayout = () => {
  return (
    <Box 
      sx={{ 
        display: 'flex',
        width: '100%',
        height: '100vh',
        backgroundColor: '#f1f5f9',
        overflow: 'hidden',
        position: 'fixed', // Fix the main container
        top: 0,
        left: 0,
        right: 0,
        bottom: 0
      }}
    >
      <Box 
        sx={{ 
          height: '100%',
          backgroundColor: '#fff',
          boxShadow: '1px 0px 10px rgba(0,0,0,0.05)'
        }}
      >
        <SideNav />
      </Box>
      <Box 
        sx={{ 
          flex: 1,
          height: '100%',
          p: 3,
          overflowY: 'auto',
          overflowX: 'hidden',
          '&::-webkit-scrollbar': {
            width: '8px',
            backgroundColor: 'transparent',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: '#cbd5e1',
            borderRadius: '4px',
          },
          '&::-webkit-scrollbar-track': {
            backgroundColor: 'transparent',
          },
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};

export default CommonLayout;
