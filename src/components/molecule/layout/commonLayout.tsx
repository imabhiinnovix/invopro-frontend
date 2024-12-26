import { Box } from '@mui/material';
import { Outlet } from 'react-router-dom';
import SideNav from '../../atom/sideNav/sideNav';

const CommonLayout = () => {
  return (
    <Box display="flex" gap={1}>
      <SideNav />
      <Outlet />
    </Box>
  );
};

export default CommonLayout;
