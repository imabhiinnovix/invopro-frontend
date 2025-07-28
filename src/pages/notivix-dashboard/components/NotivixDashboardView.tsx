import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
} from '@mui/material';
import NotivixChartGrid from './NotivixChartGrid';
import { STYLE_GUIDE } from '../../../styles';
import { useUnifiedTheme } from '../../../hooks/useUnifiedTheme';
import { useComponentTypography } from '../../../hooks/useComponentTypography';

const NotivixDashboardView: React.FC = () => {
  const theme = useUnifiedTheme();
  const { getHeadingSx } = useComponentTypography();

  return (
    <Box sx={{ width: '100%' }}>
      {/* Dashboard Header */}
      <Card 
        sx={{ 
          mb: STYLE_GUIDE.SPACING.s4,
          backgroundColor: theme.palette.background.paper,
          boxShadow: theme.shadows[2]
        }}
      >
        <CardContent>
          <Typography 
            variant="h4" 
            sx={{ 
              ...getHeadingSx(),
              color: theme.palette.text.primary,
              mb: 1
            }}
          >
            Notivix Analytics Dashboard
          </Typography>
          <Typography 
            variant="body1" 
            color="text.secondary"
          >
            Real-time analytics and insights for Notivix platform - Business Units Performance Overview
          </Typography>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <Grid container spacing={3} sx={{ mb: STYLE_GUIDE.SPACING.s4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ backgroundColor: theme.palette.primary.light }}>
            <CardContent>
              <Typography variant="h6" color="primary.contrastText">
                Total Business Units
              </Typography>
              <Typography variant="h4" color="primary.contrastText">
                67
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ backgroundColor: theme.palette.secondary.light }}>
            <CardContent>
              <Typography variant="h6" color="secondary.contrastText">
                Total Records
              </Typography>
              <Typography variant="h4" color="secondary.contrastText">
                22,924
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ backgroundColor: theme.palette.success.light }}>
            <CardContent>
              <Typography variant="h6" color="success.contrastText">
                Top Performer
              </Typography>
              <Typography variant="h6" color="success.contrastText">
                ETP (3,604)
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ backgroundColor: theme.palette.info.light }}>
            <CardContent>
              <Typography variant="h6" color="info.contrastText">
                Period
              </Typography>
              <Typography variant="h6" color="info.contrastText">
                2025-05
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Chart Grid */}
      <NotivixChartGrid />
    </Box>
  );
};

export default NotivixDashboardView; 