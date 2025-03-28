import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../../storeHooks';
import { fetchChartData } from '../dashboardActions';
import { Grid, Card, CardContent, Typography, Box, CircularProgress, useTheme } from '@mui/material';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Line, Pie } from 'react-chartjs-2';
import { ChartResponse, ChartData } from '../types';
import { styled } from '@mui/material/styles';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

interface ChartGridProps {
  dashboardId: string;
}

const StyledCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  borderRadius: '12px',
  boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.05)',
  transition: 'all 0.3s ease-in-out',
  backgroundColor: '#ffffff',
  border: `1px solid ${theme.palette.divider}`,
  '&:hover': {
    boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
    transform: 'translateY(-2px)',
  },
}));

const ChartTitle = styled(Typography)(({ theme }) => ({
  fontSize: '1.1rem',
  fontWeight: 600,
  color: theme.palette.text.primary,
  marginBottom: theme.spacing(2),
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
}));

const ChartContainer = styled(Box)(({ theme }) => ({
  height: 300,
  padding: theme.spacing(1),
  backgroundColor: '#f8f9fa',
  borderRadius: '8px',
  '& canvas': {
    padding: theme.spacing(1),
  },
  '&.pie-chart': {
    height: 400,
    display: 'flex',
    alignItems: 'center',
    overflowX: 'auto',
  },
  '&.line-chart': {
    height: 350,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  '&:hover': {
    overflowY: 'auto',
    isolation: 'isolate',
  },
  '&::-webkit-scrollbar': {
    width: '8px',
    height: '8px',
  },
  '&::-webkit-scrollbar-thumb': {
    backgroundColor: theme.palette.divider,
    borderRadius: '4px',
  },
}));

const LoadingContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  minHeight: '400px',
  backgroundColor: '#ffffff',
  borderRadius: '12px',
  border: `1px solid ${theme.palette.divider}`,
}));

const ErrorContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  minHeight: '400px',
  backgroundColor: '#ffffff',
  borderRadius: '12px',
  border: `1px solid ${theme.palette.divider}`,
}));

const EmptyContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  minHeight: '400px',
  backgroundColor: '#ffffff',
  borderRadius: '12px',
  border: `1px solid ${theme.palette.divider}`,
}));

export const ChartGrid: React.FC<ChartGridProps> = ({ dashboardId }) => {
  const dispatch = useAppDispatch();
  const theme = useTheme();
  const { charts, chartsLoading, chartsError } = useAppSelector((state) => state.dashboard);

  useEffect(() => {
    if (dashboardId) {
      dispatch(fetchChartData(dashboardId));
    }
  }, [dispatch, dashboardId]);

  if (chartsLoading) {
    return (
      <LoadingContainer>
        <CircularProgress />
      </LoadingContainer>
    );
  }

  if (chartsError) {
    return (
      <ErrorContainer>
        <Typography color="error" variant="h6">
          {chartsError}
        </Typography>
      </ErrorContainer>
    );
  }

  if (!charts || charts.length === 0) {
    return (
      <EmptyContainer>
        <Typography color="text.secondary" variant="h6">
          No charts available
        </Typography>
      </EmptyContainer>
    );
  }

  const getChartData = (chart: ChartResponse) => {
    if (!chart.data || chart.data.length === 0) {
      return {
        labels: [],
        datasets: [
          {
            label: chart.name,
            data: [],
            borderColor: theme.palette.primary.main,
            backgroundColor: theme.palette.primary.light,
            tension: 0.1,
            fill: true,
          },
        ],
      };
    }

    const labels = chart.data.map((item: ChartData) => item.name);
    const values = chart.data.map((item: ChartData) => item.data);

    if (chart.widgetDetails.chartType === 'pie') {
      return {
        labels,
        datasets: [
          {
            data: values,
            backgroundColor: [
              '#FF6384',
              '#36A2EB',
              '#FFCE56',
              '#4BC0C0',
              '#9966FF',
              '#FF9F40',
              // Add more colors as needed
            ],
            borderColor: 'white',
            borderWidth: 2,
          },
        ],
      };
    }

    // Default line chart data
    return {
      labels,
      datasets: [
        {
          label: chart.name,
          data: values,
          borderColor: theme.palette.primary.main,
          backgroundColor: theme.palette.primary.light,
          tension: 0.1,
          fill: true,
        },
      ],
    };
  };

  const getChartOptions = (chartType: string) => {
    const baseOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'right' as const,
          labels: {
            usePointStyle: true,
            padding: 4,
            font: {
              size: 11,
            },
            boxWidth: 15,
          },
        },
        tooltip: {
          backgroundColor: theme.palette.background.paper,
          titleColor: theme.palette.text.primary,
          bodyColor: theme.palette.text.secondary,
          borderColor: theme.palette.divider,
          borderWidth: 1,
          padding: 12,
          usePointStyle: true,
        },
      },
    };

    if (chartType === 'pie') {
      return {
        ...baseOptions,
        plugins: {
          ...baseOptions.plugins,
          legend: {
            ...baseOptions.plugins.legend,
            position: 'right' as const,
            align: 'start' as const,
            maxWidth: 200,
            maxHeight: 250,
            overflow: 'auto',
          },
        },
        layout: {
          padding: {
            right: 100,
          },
        },
      };
    }

    if (chartType === 'line') {
      return {
        ...baseOptions,
        plugins: {
          ...baseOptions.plugins,
          legend: {
            display: false, // Hide legend for line chart
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              color: theme.palette.divider,
              drawBorder: false,
            },
            ticks: {
              color: theme.palette.text.secondary,
              padding: 8,
            },
          },
          x: {
            grid: {
              display: false,
              drawBorder: false,
            },
            ticks: {
              color: theme.palette.text.secondary,
              padding: 8,
              maxRotation: 45,
              minRotation: 45,
            },
          },
        },
      };
    }

    return baseOptions;
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.stopPropagation();
  };

  const renderChart = (chart: ChartResponse) => {
    const chartData = getChartData(chart);
    const options = getChartOptions(chart.widgetDetails.chartType);
    const chartId = `chart-${chart._id}`;

    switch (chart.widgetDetails.chartType) {
      case 'pie':
        return <Pie id={chartId} data={chartData} options={options} />;
      case 'line':
      default:
        return <Line id={chartId} data={chartData} options={options} />;
    }
  };

  return (
    <Grid container spacing={3} sx={{ mt: 2, p: 2 }}>
      {charts.map((chart) => (
        <Grid item xs={12} md={6} key={chart._id}>
          <StyledCard>
            <CardContent sx={{ flexGrow: 1, p: 3 }}>
              <ChartTitle>
                {chart.name}
              </ChartTitle>
              <ChartContainer 
                className={chart.widgetDetails.chartType === 'pie' ? 'pie-chart' : 'line-chart'}
                onWheel={handleWheel}
              >
                {renderChart(chart)}
              </ChartContainer>
            </CardContent>
          </StyledCard>
        </Grid>
      ))}
    </Grid>
  );
}; 