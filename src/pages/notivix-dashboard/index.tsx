import React from 'react';
import { Box } from '@mui/material';
import NotivixDashboardView from './components/NotivixDashboardView';
import { STYLE_GUIDE } from '../../styles';
import { useUnifiedTheme } from '../../hooks/useUnifiedTheme';

const NotivixDashboard: React.FC = () => {
  const theme = useUnifiedTheme();

  return (
    <Box
      sx={{
        backgroundColor: theme.palette.background.default,
        minHeight: '100vh',
        padding: STYLE_GUIDE.SPACING.s4,
      }}
    >
      <NotivixDashboardView />
    </Box>
  );
};

export default NotivixDashboard; 