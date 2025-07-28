import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  IconButton,
  Tooltip,
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
  ArcElement,
  BarElement,
  RadialLinearScale,
  ChartData,
} from 'chart.js';
import { Line, Pie, Bar, Doughnut, Radar } from 'react-chartjs-2';
import { useAppDispatch, useAppSelector } from '../../../storeHooks';
import { fetchNotivixChartData } from '../notivixDashboardActions';
import { STYLE_GUIDE } from '../../../styles';
import { useUnifiedTheme } from '../../../hooks/useUnifiedTheme';
import { useComponentTypography } from '../../../hooks/useComponentTypography';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  ChartTooltip,
  Legend,
  ArcElement,
  BarElement,
  RadialLinearScale
);

const chartTypes = [
  { value: 'bar', label: 'Bar Chart' },
  { value: 'line', label: 'Line Chart' },
  { value: 'pie', label: 'Pie Chart' },
  { value: 'doughnut', label: 'Doughnut Chart' },
  { value: 'radar', label: 'Radar Chart' },
];

const NotivixChartGrid: React.FC = () => {
  const theme = useUnifiedTheme();
  const { getHeadingSx } = useComponentTypography();
  const dispatch = useAppDispatch();
  
  const [selectedChartType, setSelectedChartType] = useState('bar');
  const [displayLimit, setDisplayLimit] = useState(10);

  const { chartData, loading, error } = useAppSelector((state) => ({
    chartData: state.notivixDashboard?.chartData,
    loading: state.notivixDashboard?.loading || false,
    error: state.notivixDashboard?.error || null,
  }));

  useEffect(() => {
    dispatch(fetchNotivixChartData('notivix-dashboard'));
  }, [dispatch]);

  const handleRefresh = () => {
    dispatch(fetchNotivixChartData('notivix-dashboard'));
  };

  const handleChartTypeChange = (event: any) => {
    setSelectedChartType(event.target.value);
  };

  const handleDisplayLimitChange = (event: any) => {
    setDisplayLimit(event.target.value);
  };

  const getChartData = (): ChartData<any> => {
    if (!chartData?.data?.widgetData) {
      return {
        labels: [],
        datasets: [{ data: [], label: 'No Data' }],
      };
    }

    const sortedData = [...chartData.data.widgetData]
      .sort((a, b) => b.data - a.data)
      .slice(0, displayLimit);

    const labels = sortedData.map(item => item.name);
    const data = sortedData.map(item => item.data);

    const colors = [
      '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
      '#FF9F40', '#FF6384', '#C9CBCF', '#4BC0C0', '#FF6384',
      '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'
    ];

    const baseDataset = {
      data,
      backgroundColor: colors.slice(0, data.length),
      borderColor: colors.slice(0, data.length),
      borderWidth: 2,
    };

    switch (selectedChartType) {
      case 'line':
        return {
          labels,
          datasets: [{
            ...baseDataset,
            label: 'Business Units',
            fill: false,
            tension: 0.1,
            pointRadius: 5,
            pointHoverRadius: 8,
          }],
        };

      case 'pie':
      case 'doughnut':
        return {
          labels,
          datasets: [{
            ...baseDataset,
            label: 'Business Units',
          }],
        };

      case 'radar':
        return {
          labels,
          datasets: [{
            ...baseDataset,
            label: 'Business Units',
            fill: true,
            backgroundColor: 'rgba(54, 162, 235, 0.2)',
            borderColor: 'rgba(54, 162, 235, 1)',
            pointBackgroundColor: 'rgba(54, 162, 235, 1)',
            pointBorderColor: '#fff',
            pointHoverBackgroundColor: '#fff',
            pointHoverBorderColor: 'rgba(54, 162, 235, 1)',
          }],
        };

      case 'bar':
      default:
        return {
          labels,
          datasets: [{
            ...baseDataset,
            label: 'Business Units',
            backgroundColor: colors.slice(0, data.length),
          }],
        };
    }
  };

  const getChartOptions = () => {
    const baseOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top' as const,
          labels: {
            color: theme.palette.text.primary,
            font: {
              size: 12,
            },
          },
        },
        title: {
          display: true,
          text: `Top ${displayLimit} Business Units - ${chartData?.data?.label || '2025-05'}`,
          color: theme.palette.text.primary,
          font: {
            size: 16,
            weight: 'bold' as const,
          },
        },
        tooltip: {
          backgroundColor: theme.palette.background.paper,
          titleColor: theme.palette.text.primary,
          bodyColor: theme.palette.text.secondary,
          borderColor: theme.palette.divider,
          borderWidth: 1,
        },
      },
      scales: selectedChartType !== 'pie' && selectedChartType !== 'doughnut' && selectedChartType !== 'radar' ? {
        x: {
          ticks: {
            color: theme.palette.text.secondary,
            maxRotation: 45,
            minRotation: 0,
          },
          grid: {
            color: theme.palette.divider,
          },
        },
        y: {
          ticks: {
            color: theme.palette.text.secondary,
          },
          grid: {
            color: theme.palette.divider,
          },
        },
      } : undefined,
    };

    return baseOptions;
  };

  const renderChart = () => {
    const chartData = getChartData();
    const options = getChartOptions();

    switch (selectedChartType) {
      case 'line':
        return <Line data={chartData} options={options} />;
      case 'pie':
        return <Pie data={chartData} options={options} />;
      case 'doughnut':
        return <Doughnut data={chartData} options={options} />;
      case 'radar':
        return <Radar data={chartData} options={options} />;
      case 'bar':
      default:
        return <Bar data={chartData} options={options} />;
    }
  };

  if (error) {
    return (
      <Card sx={{ p: STYLE_GUIDE.SPACING.s4, backgroundColor: theme.palette.error.light }}>
        <Typography color="error" variant="h6">
          Error loading chart data: {error}
        </Typography>
      </Card>
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
      {/* Controls */}
      <Card sx={{ mb: STYLE_GUIDE.SPACING.s4, backgroundColor: theme.palette.background.paper }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth size="small">
                <InputLabel>Chart Type</InputLabel>
                <Select
                  value={selectedChartType}
                  label="Chart Type"
                  onChange={handleChartTypeChange}
                >
                  {chartTypes.map((type) => (
                    <MenuItem key={type.value} value={type.value}>
                      {type.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth size="small">
                <InputLabel>Display Limit</InputLabel>
                <Select
                  value={displayLimit}
                  label="Display Limit"
                  onChange={handleDisplayLimitChange}
                >
                  <MenuItem value={5}>Top 5</MenuItem>
                  <MenuItem value={10}>Top 10</MenuItem>
                  <MenuItem value={15}>Top 15</MenuItem>
                  <MenuItem value={20}>Top 20</MenuItem>
                  <MenuItem value={50}>Top 50</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <Box display="flex" justifyContent="flex-end">
                <Tooltip title="Refresh Data">
                  <IconButton 
                    onClick={handleRefresh}
                    disabled={loading}
                    sx={{ 
                      backgroundColor: theme.palette.primary.main,
                      color: theme.palette.primary.contrastText,
                      '&:hover': {
                        backgroundColor: theme.palette.primary.dark,
                      }
                    }}
                  >
                    <RefreshIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Chart */}
      <Card sx={{ backgroundColor: theme.palette.background.paper }}>
        <CardContent>
          <Box sx={{ height: 500, position: 'relative' }}>
            {loading ? (
              <Box 
                display="flex" 
                justifyContent="center" 
                alignItems="center" 
                height="100%"
              >
                <Typography variant="h6" color="text.secondary">
                  Loading chart data...
                </Typography>
              </Box>
            ) : (
              renderChart()
            )}
          </Box>
        </CardContent>
      </Card>

      {/* Summary */}
      {chartData && (
        <Card sx={{ mt: STYLE_GUIDE.SPACING.s4, backgroundColor: theme.palette.background.paper }}>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ ...getHeadingSx() }}>
              Data Summary
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <Typography variant="body2" color="text.secondary">
                  Total Records
                </Typography>
                <Typography variant="h6" color="primary">
                  {chartData.data.totalCount.toLocaleString()}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Typography variant="body2" color="text.secondary">
                  Period
                </Typography>
                <Typography variant="h6" color="primary">
                  {chartData.data.label}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Typography variant="body2" color="text.secondary">
                  Business Units
                </Typography>
                <Typography variant="h6" color="primary">
                  {chartData.data.widgetData.length}
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default NotivixChartGrid; 