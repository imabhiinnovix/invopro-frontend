import React, { useEffect, useState, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '../../../storeHooks';
import { fetchChartData, deleteWidget } from '../dashboardActions';
import { Grid, Card, CardContent, Typography, Box, CircularProgress, useTheme, IconButton, Menu, MenuItem, Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement, Filler, BarElement, RadialLinearScale } from 'chart.js';
import { Line, Pie, Bar, Doughnut, Radar, PolarArea, ChartProps } from 'react-chartjs-2';
import { ChartResponse, ChartData } from '../types';
import { styled } from '@mui/material/styles';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import CloseIcon from '@mui/icons-material/Close';
import ImageIcon from '@mui/icons-material/Image';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import DownloadIcon from '@mui/icons-material/Download';
import TableChartIcon from '@mui/icons-material/TableChart';
import { toast } from 'react-toastify';
import jsPDF from 'jspdf';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Filler,
  BarElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend
);

interface ChartGridProps {
  dashboardId: string;
  isEditMode: boolean;
  onEditChart: (chart: ChartResponse) => void;
  isAddChartModalOpen: boolean;
  isEditChartModalOpen: boolean;
}

const StyledCard = styled(Card)(({ theme }) => ({
  height: '100%',
  minHeight: 400,
  maxHeight: 500,
  display: 'flex',
  flexDirection: 'column',
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[1],
  transition: 'all 0.3s ease-in-out',
  backgroundColor: theme.palette.background.paper,
  border: `1px solid ${theme.palette.divider}`,
  '&:hover': {
    boxShadow: theme.shadows[3],
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
  justifyContent: 'space-between',
  gap: theme.spacing(1),
}));

const ChartTitleText = styled(Typography)({
  flexGrow: 1,
});

const ChartContainer = styled(Box)(({ theme }) => ({
  flex: 1,
  minHeight: 300,
  maxHeight: 400,
  height: '400px',
  padding: theme.spacing(2),
  backgroundColor: '#ffffff',
  borderRadius: theme.shape.borderRadius,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  position: 'relative',
  overflow: 'hidden',
  '& canvas': {
    maxWidth: '100% !important',
    maxHeight: '100% !important',
    width: '100% !important',
    height: '100% !important',
    objectFit: 'contain',
  },
  '&.pie-chart': {
    minHeight: 350,
    maxHeight: 450,
    height: '450px',
  },
  '&.line-chart': {
    minHeight: 350,
    maxHeight: 450,
    height: '450px',
  },
  '&.horizontal-bar-chart': {
    minHeight: 350,
    maxHeight: 450,
    height: '450px',
  },
  '&.number-chart': {
    minHeight: 200,
    maxHeight: 250,
    height: '250px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing(2),
  },
  '&:hover': {
    overflow: 'hidden',
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

const FullScreenModal = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    margin: theme.spacing(2),
    width: 'calc(100% - 32px)',
    height: 'calc(100% - 32px)',
    maxWidth: 'calc(100% - 32px)',
    maxHeight: 'calc(100% - 32px)',
    borderRadius: '12px',
  },
}));

const FullScreenChartContainer = styled(Box)(({ theme }) => ({
  height: '100%',
  padding: theme.spacing(3),
  backgroundColor: '#f8f9fa',
  display: 'flex',
  flexDirection: 'column',
  '& canvas': {
    flexGrow: 1,
    padding: theme.spacing(1),
  },
}));

const NumberDisplay = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: theme.spacing(1),
}));

const NumberValue = styled(Typography)(({ theme }) => ({
  fontSize: '3.5rem',
  fontWeight: 600,
  color: theme.palette.primary.main,
  lineHeight: 1.2,
}));

const NumberLabel = styled(Typography)(({ theme }) => ({
  fontSize: '1rem',
  color: theme.palette.text.secondary,
  textAlign: 'center',
}));

export const ChartGrid: React.FC<ChartGridProps> = ({ dashboardId, isEditMode, onEditChart, isAddChartModalOpen, isEditChartModalOpen }) => {
  const dispatch = useAppDispatch();
  const theme = useTheme();
  const chartRefs = useRef<{ [key: string]: ChartJS | null }>({});
  const { charts, temporaryCharts, chartsLoading, chartsError, widgetData } = useAppSelector((state) => ({
    charts: state.dashboard.charts,
    temporaryCharts: state.dashboard.temporaryCharts,
    chartsLoading: state.dashboard.chartsLoading,
    chartsError: state.dashboard.chartsError,
    widgetData: state.dashboard.widgetData
  }));
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedChart, setSelectedChart] = useState<ChartResponse | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [fullViewOpen, setFullViewOpen] = useState(false);
  const [exportMenuAnchorEl, setExportMenuAnchorEl] = useState<null | HTMLElement>(null);

  // Combine permanent and temporary charts
  const allCharts = [...charts, ...temporaryCharts];

  useEffect(() => {
    if (dashboardId) {
      dispatch(fetchChartData(dashboardId));
    }
  }, [dispatch, dashboardId]);

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, chart: ChartResponse) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setSelectedChart(chart);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedChart(null);
  };

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
    setAnchorEl(null);
  };

  const handleDeleteConfirm = async () => {
    console.log("🚀 ~ handleDeleteConfirm ~ selectedChart:", selectedChart)
    if (!selectedChart) return;
    
    try {
      setIsDeleting(true);
      const result = await dispatch(deleteWidget(selectedChart._id)).unwrap();
      
      if (result.success) {
        toast.success('Chart deleted successfully!');
        dispatch(fetchChartData(dashboardId));
      } else {
        toast.error(result.message || 'Failed to delete chart');
      }
    } catch (error) {
      if (typeof error === 'object' && error !== null && 'message' in error) {
        toast.error(error.message as string);
      } else {
        toast.error('Failed to delete chart');
      }
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
  };

  const handleEditClick = () => {
    if (selectedChart) {
      onEditChart(selectedChart);
    }
    handleMenuClose();
  };

  const handleFullViewClick = (chart: ChartResponse) => {
    setSelectedChart(chart);
    setFullViewOpen(true);
  };

  const handleFullViewClose = () => {
    setFullViewOpen(false);
    setSelectedChart(null);
  };

  const handleExportImage = async (format: 'png' | 'jpg') => {
    if (!selectedChart) return;

    try {
      const chartId = `chart-${selectedChart._id}`;
      const chartInstance = chartRefs.current[chartId];
      
      if (!chartInstance) {
        toast.error('Chart instance not found');
        return;
      }

      const dataUrl = chartInstance.toBase64Image();
      const link = document.createElement('a');
      link.download = `${selectedChart.name}.${format}`;
      link.href = dataUrl;
      link.click();

      toast.success(`Chart exported as ${format.toUpperCase()} successfully!`);
    } catch (error) {
      toast.error('Failed to export chart');
      console.error('Export error:', error);
    }
  };

  const handleExportPDF = async () => {
    if (!selectedChart) return;

    try {
      const chartId = `chart-${selectedChart._id}`;
      const chartInstance = chartRefs.current[chartId];
      
      if (!chartInstance) {
        toast.error('Chart instance not found');
        return;
      }

      const imgData = chartInstance.toBase64Image();
      const pdf = new jsPDF('landscape');
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${selectedChart.name}.pdf`);

      toast.success('Chart exported as PDF successfully!');
    } catch (error) {
      toast.error('Failed to export chart as PDF');
      console.error('PDF export error:', error);
    }
  };

  const handleExportData = () => {
    if (!selectedChart) return;

    try {
      const chartData = getChartData(selectedChart);
      const { labels, datasets } = chartData;
      
      // Create CSV content
      let csvContent = "data:text/csv;charset=utf-8,";
      
      // Add header row
      const headers = ["Category", ...datasets.map(dataset => dataset.label)];
      csvContent += headers.join(",") + "\n";
      
      // Add data rows
      labels.forEach((label, index) => {
        const row = [label, ...datasets.map(dataset => dataset.data[index])];
        csvContent += row.join(",") + "\n";
      });
      
      // Create download link
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `${selectedChart.name}_data.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('Chart data exported successfully!');
    } catch (error) {
      console.error('Error exporting data:', error);
      toast.error('Failed to export chart data');
    }
  };

  const handleExportMenuClick = (event: React.MouseEvent<HTMLElement>, chart: ChartResponse) => {
    event.stopPropagation();
    setExportMenuAnchorEl(event.currentTarget);
    setSelectedChart(chart);
  };

  const handleExportMenuClose = () => {
    setExportMenuAnchorEl(null);
    setSelectedChart(null);
  };

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

  if (!allCharts || allCharts.length === 0) {
    return (
      <EmptyContainer>
        <Typography color="text.secondary" variant="h6">
          No charts available
        </Typography>
      </EmptyContainer>
    );
  }

  const getChartData = (chart: ChartResponse) => {
    const createDefaultDataset = (data: number[] = []) => ({
      label: chart.name,
      data,
      borderColor: theme.palette.primary.main,
      backgroundColor: theme.palette.primary.light,
      tension: 0.1,
      fill: chart.widgetTypeId?.chartType === 'area' ? 'start' : false,
    });

    // Get widget data from the store
    const chartData = widgetData[chart._id]?.data || chart.data || [];

    if (!chartData.length) {
      return {
        labels: [],
        datasets: [createDefaultDataset()],
      };
    }

    const chartType = chart.widgetTypeId?.chartType || 'line';
    const groupBy = chart.groupBy || [];

    // Handle polar area chart with grouping
    if (chartType === 'polarArea' && groupBy.length > 0) {
      const groupByField = groupBy[0]; // Take the first groupBy field
      const uniqueGroups = Array.from(new Set(chartData.map(item => item[groupByField] as string)));
      const uniqueNames = Array.from(new Set(chartData.map(item => item.name)));

      // Generate vibrant colors with transparency
      const colors = [
        '#FF149330', // Deep Pink
        '#00BFFF30', // Deep Sky Blue
        '#FFD70030', // Gold
        '#00FF7F30', // Spring Green
        '#9370DB30', // Medium Purple
        '#FF450030', // Orange Red
        '#FF69B430', // Hot Pink
        '#32CD3230', // Lime Green
        '#FF634730', // Tomato
        '#1E90FF30', // Dodger Blue
        '#FF8C0030', // Dark Orange
        '#20B2AA30'  // Light Sea Green
      ];

      // Create a dataset for each unique group
      const datasets = uniqueGroups.map((group, index) => {
        const groupData = uniqueNames.map(name => {
          const dataPoint = chartData.find(item => 
            item.name === name && item[groupByField] === group
          );
          return dataPoint ? dataPoint.data : 0;
        });

        return {
          label: group,
          data: groupData,
          backgroundColor: colors[index % colors.length],
          borderColor: 'white',
          borderWidth: 2,
        };
      });

      return {
        labels: uniqueNames,
        datasets,
      };
    }

    // Handle non-grouped polar area chart
    if (chartType === 'polarArea') {
      const labels = chartData.map((item: ChartData) => item.name);
      const values = chartData.map((item: ChartData) => item.data);
      
      return {
        labels,
        datasets: [{
          data: values,
          backgroundColor: [
            '#FF149330', // Deep Pink
            '#00BFFF30', // Deep Sky Blue
            '#FFD70030', // Gold
            '#00FF7F30', // Spring Green
            '#9370DB30', // Medium Purple
            '#FF450030', // Orange Red
            '#FF69B430', // Hot Pink
            '#32CD3230', // Lime Green
            '#FF634730', // Tomato
            '#1E90FF30', // Dodger Blue
            '#FF8C0030', // Dark Orange
            '#20B2AA30'  // Light Sea Green
          ],
          borderColor: 'white',
          borderWidth: 2,
        }],
      };
    }

    // Handle grouped horizontal bar chart
    if (chartType === 'horizontalBar' && groupBy.length > 0) {
      const groupByField = groupBy[0]; // Take the first groupBy field
      const uniqueGroups = Array.from(new Set(chartData.map(item => item[groupByField] as string)));
      const uniqueNames = Array.from(new Set(chartData.map(item => item.name)));

      // Generate colors for each group
      const colors = [
        '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40',
        '#FF99E6', '#99FF99', '#FF9999', '#99CCFF', '#FF99CC', '#99FFCC'
      ];

      // Create a dataset for each unique group
      const datasets = uniqueGroups.map((group, index) => {
        const groupData = uniqueNames.map(name => {
          const dataPoint = chartData.find(item => 
            item.name === name && item[groupByField] === group
          );
          return dataPoint ? dataPoint.data : 0;
        });

        return {
          label: group,
          data: groupData,
          backgroundColor: colors[index % colors.length],
          borderColor: colors[index % colors.length],
          borderWidth: 1,
        };
      });

      return {
        labels: uniqueNames,
        datasets,
      };
    }

    // Handle non-grouped horizontal bar chart
    if (chartType === 'horizontalBar') {
      const labels = chartData.map((item: ChartData) => item.name);
      const values = chartData.map((item: ChartData) => item.data);

      return {
        labels,
        datasets: [{
          label: chart.name,
          data: values,
          backgroundColor: theme.palette.primary.main,
          borderColor: theme.palette.primary.main,
          borderWidth: 1,
        }],
      };
    }

    // Handle vertical bar chart (both grouped and non-grouped)
    if (chartType === 'verticalBar' || chartType === 'stackedBar' || chartType === 'multiSeriesBar') {
      const labels = chartData.map((item: ChartData) => item.name);
      
      if (groupBy.length > 0) {
        const groupByField = groupBy[0];
        const uniqueGroups = Array.from(new Set(chartData.map(item => item[groupByField] as string)));
        
        const colors = [
          '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40',
          '#FF99E6', '#99FF99', '#FF9999', '#99CCFF', '#FF99CC', '#99FFCC'
        ];

        const datasets = uniqueGroups.map((group, index) => {
          const groupData = labels.map(name => {
            const dataPoint = chartData.find(item => 
              item.name === name && item[groupByField] === group
            );
            return dataPoint ? dataPoint.data : 0;
          });

          return {
            label: group,
            data: groupData,
            backgroundColor: colors[index % colors.length],
            borderColor: colors[index % colors.length],
            borderWidth: 1,
          };
        });

        return { labels, datasets };
      }

      // Handle non-grouped data
      const values = chartData.map((item: ChartData) => item.data);
      return {
        labels,
        datasets: [{
          label: chart.name,
          data: values,
          backgroundColor: theme.palette.primary.main,
          borderColor: theme.palette.primary.main,
          borderWidth: 1,
        }],
      };
    }

    // Handle pie chart or doughnut chart
    if (chartType === 'pie' || chartType === 'doughnut') {
      const labels = chartData.map((item: ChartData) => item.name);
      const values = chartData.map((item: ChartData) => item.data);
      
      // Handle grouped data
      if (groupBy.length > 0) {
        const groupByField = groupBy[0]; // Take the first groupBy field
        const uniqueGroups = Array.from(new Set(chartData.map(item => item[groupByField] as string)));
        const uniqueNames = Array.from(new Set(chartData.map(item => item.name)));

        const colors = [
          '#FF6384', // Pink
          '#36A2EB', // Blue
          '#FFCE56', // Yellow
          '#4BC0C0', // Teal
          '#9966FF', // Purple
          '#FF9F40', // Orange
          '#FF99E6', // Light Pink
          '#99FF99', // Light Green
          '#FF9999', // Light Red
          '#99CCFF', // Light Blue
          '#FF99CC', // Rose
          '#99FFCC', // Mint
        ];

        // Create datasets for each group
        const datasets = uniqueGroups.map((group, index) => {
          const groupData = uniqueNames.map(name => {
            const dataPoint = chartData.find(item => 
              item.name === name && item[groupByField] === group
            );
            return dataPoint ? dataPoint.data : 0;
          });

          return {
            label: group,
            data: groupData,
            backgroundColor: colors[index % colors.length],
            borderColor: 'white',
            borderWidth: 2,
          };
        });

        return {
          labels: uniqueNames,
          datasets,
        };
      }

      // Handle non-grouped data
      return {
        labels,
        datasets: [
          {
            data: values,
            backgroundColor: [
              '#FF6384', // Pink
              '#36A2EB', // Blue
              '#FFCE56', // Yellow
              '#4BC0C0', // Teal
              '#9966FF', // Purple
              '#FF9F40', // Orange
              '#FF99E6', // Light Pink
              '#99FF99', // Light Green
              '#FF9999', // Light Red
              '#99CCFF', // Light Blue
              '#FF99CC', // Rose
              '#99FFCC', // Mint
            ],
            borderColor: 'white',
            borderWidth: 2,
          },
        ],
      };
    }

    // Handle radar chart
    if (chartType === 'radar') {
      const labels = chartData.map((item: ChartData) => item.name);
      
      if (groupBy.length > 0) {
        const groupByField = groupBy[0]; // Take the first groupBy field
        const uniqueGroups = Array.from(new Set(chartData.map(item => item[groupByField] as string)));
        const uniqueNames = Array.from(new Set(chartData.map(item => item.name)));

        // Generate colors for each group
        const colors = [
          '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40',
          '#FF99E6', '#99FF99', '#FF9999', '#99CCFF', '#FF99CC', '#99FFCC'
        ];

        // Create a dataset for each unique group
        const datasets = uniqueGroups.map((group, index) => {
          const groupData = uniqueNames.map(name => {
            const dataPoint = chartData.find(item => 
              item.name === name && item[groupByField] === group
            );
            return dataPoint ? dataPoint.data : 0;
          });

          return {
            label: group,
            data: groupData,
            borderColor: colors[index % colors.length],
            backgroundColor: `${colors[index % colors.length]}40`,
            pointBackgroundColor: colors[index % colors.length],
            pointBorderColor: '#fff',
            pointHoverBackgroundColor: '#fff',
            pointHoverBorderColor: colors[index % colors.length],
            tension: 0.1,
          };
        });

        return {
          labels: uniqueNames,
          datasets,
        };
      }

      // Handle non-grouped data
      const values = chartData.map((item: ChartData) => item.data);
      return {
        labels,
        datasets: [{
          label: chart.name,
          data: values,
          borderColor: theme.palette.primary.main,
          backgroundColor: `${theme.palette.primary.main}40`,
          pointBackgroundColor: theme.palette.primary.main,
          pointBorderColor: '#fff',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: theme.palette.primary.main,
          tension: 0.1,
        }],
      };
    }

    // Handle grouped line/area chart
    if ((chartType === 'line' || chartType === 'area') && groupBy.length > 0) {
      const groupByField = groupBy[0]; // Take the first groupBy field
      const uniqueGroups = Array.from(new Set(chartData.map(item => item[groupByField] as string)));
      const uniqueNames = Array.from(new Set(chartData.map(item => item.name)));

      // Generate colors for each group
      const colors = [
        '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40',
        '#FF99E6', '#99FF99', '#FF9999', '#99CCFF', '#FF99CC', '#99FFCC'
      ];

      // Create a dataset for each unique group
      const datasets = uniqueGroups.map((group, index) => {
        const groupData = uniqueNames.map(name => {
          const dataPoint = chartData.find(item => 
            item.name === name && item[groupByField] === group
          );
          return dataPoint ? dataPoint.data : 0;
        });

        return {
          label: group,
          data: groupData,
          borderColor: colors[index % colors.length],
          backgroundColor: `${colors[index % colors.length]}20`,
          tension: 0.1,
          fill: chartType === 'area' ? 'start' : false,
        };
      });

      return {
        labels: uniqueNames,
        datasets,
      };
    }

    // Default single line/area chart (no grouping)
    const labels = chartData.map((item: ChartData) => item.name);
    const values = chartData.map((item: ChartData) => item.data);

    return {
      labels,
      datasets: [createDefaultDataset(values)],
    };
  };

  const getChartOptions = (chartType: string, chart: ChartResponse) => {
    const baseOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom' as const,
          labels: {
            usePointStyle: true,
            padding: 15,
            font: {
              size: 12,
            },
            boxWidth: 10,
            boxHeight: 10,
          },
          maxHeight: 100,
          display: true,
        },
        tooltip: {
          backgroundColor: theme.palette.background.paper,
          titleColor: theme.palette.text.primary,
          bodyColor: theme.palette.text.secondary,
          borderColor: theme.palette.divider,
          borderWidth: 1,
          padding: 12,
          usePointStyle: true,
          displayColors: true,
        },
      },
    };

    if (chartType === 'pie' || chartType === 'doughnut' || chartType === 'polarArea') {
      return {
        ...baseOptions,
        plugins: {
          ...baseOptions.plugins,
          legend: {
            ...baseOptions.plugins.legend,
            position: 'bottom' as const,
          },
        },
        layout: {
          padding: {
            bottom: 10,
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
            ...baseOptions.plugins.legend,
            position: 'bottom' as const,
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
        interaction: {
          mode: 'index' as const,
          intersect: false,
        },
      };
    }

    if (chartType === 'horizontalBar') {
      return {
        ...baseOptions,
        indexAxis: 'y' as const,
        scales: {
          x: {
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
          y: {
            grid: {
              display: false,
              drawBorder: false,
            },
            ticks: {
              color: theme.palette.text.secondary,
              padding: 8,
            },
          },
        },
      };
    }

    if (chartType === 'verticalBar' || chartType === 'stackedBar' || chartType === 'multiSeriesBar') {
      return {
        ...baseOptions,
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
            stacked: chartType === 'stackedBar',
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
            stacked: chartType === 'stackedBar',
          },
        },
      };
    }

    if (chartType === 'radar') {
      return {
        ...baseOptions,
        scales: {
          r: {
            beginAtZero: true,
            grid: {
              color: theme.palette.divider,
            },
            angleLines: {
              color: theme.palette.divider,
            },
            pointLabels: {
              color: theme.palette.text.secondary,
            },
            ticks: {
              color: theme.palette.text.secondary,
              backdropColor: 'transparent',
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
    const chartType = chart.widgetTypeId?.chartType || 'line';
    const options = getChartOptions(chartType, chart);
    const chartId = `chart-${chart._id}`;
    const numberValue = chartData.datasets[0]?.data[0] || 0;

    const chartProps: ChartProps = {
      id: chartId,
      data: chartData,
      options: options,
      ref: (ref: ChartJS | null) => {
        chartRefs.current[chartId] = ref;
      }
    };

    switch (chartType) {
      case 'number':
        return (
          <NumberDisplay>
            <NumberValue>{numberValue.toLocaleString()}</NumberValue>
            <NumberLabel>{chart.name}</NumberLabel>
          </NumberDisplay>
        );
      case 'pie':
        return <Pie {...chartProps} />;
      case 'doughnut':
        return <Doughnut {...chartProps} />;
      case 'horizontalBar':
      case 'verticalBar':
      case 'stackedBar':
      case 'multiSeriesBar':
        return <Bar {...chartProps} />;
      case 'radar':
        return <Radar {...chartProps} />;
      case 'polarArea':
        return <PolarArea {...chartProps} />;
      case 'area':
      case 'line':
      default:
        return <Line {...chartProps} />;
    }
  };

  return (
    <>
      <Grid 
        container 
        spacing={3} 
        sx={{ 
          mt: 2, 
          p: 2,
          height: '100%',
          alignContent: 'flex-start',
          '& > .MuiGrid-item': {
            display: 'flex',
            flexDirection: 'column',
            height: 'fit-content'
          }
        }}
      >
        {allCharts.map((chart) => (
          <Grid 
            item 
            xs={12} 
            md={(isAddChartModalOpen || isEditChartModalOpen) ? 12 : 6} 
            key={chart._id}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              height: 'fit-content'
            }}
          >
            <StyledCard>
              <CardContent sx={{ 
                flexGrow: 1, 
                p: 3, 
                display: 'flex', 
                flexDirection: 'column',
                height: '100%'
              }}>
                <ChartTitle>
                  <ChartTitleText>
                    {chart.name}
                  </ChartTitleText>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <IconButton
                      size="small"
                      onClick={() => handleFullViewClick(chart)}
                      sx={{ 
                        opacity: 0.7,
                        '&:hover': { opacity: 1 }
                      }}
                    >
                      <FullscreenIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={(e) => handleExportMenuClick(e, chart)}
                      sx={{ 
                        opacity: 0.7,
                        '&:hover': { opacity: 1 }
                      }}
                    >
                      <DownloadIcon />
                    </IconButton>
                    {isEditMode && (
                      <IconButton
                        size="small"
                        onClick={(e) => handleMenuClick(e, chart)}
                        sx={{ 
                          opacity: 0.7,
                          '&:hover': { opacity: 1 }
                        }}
                      >
                        <MoreVertIcon />
                      </IconButton>
                    )}
                  </Box>
                </ChartTitle>
                <ChartContainer 
                  className={
                    (chart.widgetTypeId?.chartType || 'line') === 'pie' 
                      ? 'pie-chart' 
                      : (chart.widgetTypeId?.chartType || 'line') === 'number'
                      ? 'number-chart'
                      : (chart.widgetTypeId?.chartType || 'line') === 'horizontalBar'
                      ? 'horizontal-bar-chart'
                      : 'line-chart'
                  }
                  onWheel={handleWheel}
                >
                  {renderChart(chart)}
                </ChartContainer>
              </CardContent>
            </StyledCard>
          </Grid>
        ))}
      </Grid>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        onClick={(e) => e.stopPropagation()}
      >
        <MenuItem onClick={handleEditClick}>
          <EditIcon sx={{ mr: 1, fontSize: 20 }} />
          Edit
        </MenuItem>
        <MenuItem onClick={handleDeleteClick} sx={{ color: 'error.main' }}>
          <DeleteIcon sx={{ mr: 1, fontSize: 20 }} />
          Delete
        </MenuItem>
      </Menu>

      <Menu
        anchorEl={exportMenuAnchorEl}
        open={Boolean(exportMenuAnchorEl)}
        onClose={handleExportMenuClose}
        onClick={(e) => e.stopPropagation()}
      >
        <MenuItem onClick={() => handleExportImage('png')}>
          <ImageIcon sx={{ mr: 1, fontSize: 20 }} />
          Export as PNG
        </MenuItem>
        <MenuItem onClick={() => handleExportImage('jpg')}>
          <ImageIcon sx={{ mr: 1, fontSize: 20 }} />
          Export as JPG
        </MenuItem>
        <MenuItem onClick={handleExportPDF}>
          <PictureAsPdfIcon sx={{ mr: 1, fontSize: 20 }} />
          Export as PDF
        </MenuItem>
        <MenuItem onClick={handleExportData}>
          <TableChartIcon sx={{ mr: 1, fontSize: 20 }} />
          Export Data (CSV)
        </MenuItem>
      </Menu>

      {deleteDialogOpen && <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        aria-labelledby="delete-dialog-title"
      >
        <DialogTitle id="delete-dialog-title">Delete Chart</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this chart? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>Cancel</Button>
          <Button 
            onClick={handleDeleteConfirm} 
            color="error" 
            variant="contained"
            disabled={isDeleting}
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>}

      <FullScreenModal
        open={fullViewOpen}
        onClose={handleFullViewClose}
        fullScreen
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          borderBottom: `1px solid ${theme.palette.divider}`,
          p: 2
        }}>
          <Typography variant="h6">{selectedChart?.name}</Typography>
          <IconButton 
            onClick={handleFullViewClose} 
            size="small"
            sx={{
              color: theme.palette.text.secondary,
              '&:hover': {
                color: theme.palette.text.primary,
                backgroundColor: theme.palette.action.hover
              }
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <FullScreenChartContainer>
          {selectedChart && renderChart(selectedChart)}
        </FullScreenChartContainer>
      </FullScreenModal>
    </>
  );
}; 