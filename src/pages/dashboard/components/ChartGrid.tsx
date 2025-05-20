import React, { useEffect, useState, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '../../../storeHooks';
import { fetchChartData, deleteWidget, fetchIndividualWidgetData } from '../dashboardActions';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  CircularProgress,
  useTheme,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
  Pagination,
} from '@mui/material';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler,
  BarElement,
  RadialLinearScale,
  ChartDataset,
  ChartData,
  ChartEvent,
  ActiveElement,
} from 'chart.js';
import { Line, Pie, Bar, Doughnut, Radar, PolarArea } from 'react-chartjs-2';
import { ChartResponse } from '../types';
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
import axiosInstance from '../../../services/axiosInstance';
import { AddChartModal, ChartFormData } from './AddChartModal';
import { resetChartAndWidgetData } from '../dashboardReducer';

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
  gridColumns: number;
  isNaturalLangauage?: boolean;
}

interface ChartDataItem {
  name: string;
  data: number;
  [key: string]: string | number;
}

const StyledCard = styled(Card)(({ theme }) => ({
  height: '100%',
  minHeight: 500,
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
  minHeight: 400,
  height: '100%',
  // padding: theme.spacing(4),
  backgroundColor: '#ffffff',
  borderRadius: theme.shape.borderRadius,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  position: 'relative',
  overflow: 'hidden',
  '& canvas': {
    width: '100% !important',
    height: '100% !important',
  },
  '&.pie-chart': {
    minHeight: 450,
    '& canvas': {
      maxWidth: '95% !important',
      maxHeight: '95% !important',
    },
  },
  '&.line-chart': {
    minHeight: 500,
    padding: theme.spacing(4, 2, 6, 4),
    '& canvas': {
      maxWidth: '98% !important',
      maxHeight: '90% !important',
    },
  },
  '&.horizontal-bar-chart': {
    minHeight: 450,
    '& canvas': {
      maxWidth: '98% !important',
      maxHeight: '90% !important',
    },
  },
  '&.number-chart': {
    minHeight: 250,
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

// Add new styled components for drill-down dialog
const DrillDownDialog = styled(Dialog)({
  '& .MuiDialog-paper': {
    width: 'calc(100% - 32px)',
    height: 'calc(100% - 32px)',
    margin: 16,
    maxWidth: 'calc(100% - 32px)',
    maxHeight: 'calc(100% - 32px)',
  },
});

const DrillDownTable = styled(Table)(({ theme }) => ({
  '& .MuiTableCell-root': {
    padding: theme.spacing(1.5),
    fontSize: '0.875rem',
  },
  '& .MuiTableHead-root': {
    backgroundColor: theme.palette.background.default,
    '& .MuiTableCell-root': {
      fontWeight: 600,
      color: theme.palette.text.primary,
      borderBottom: `2px solid ${theme.palette.divider}`,
    },
  },
  '& .MuiTableBody-root': {
    '& .MuiTableRow-root': {
      transition: 'background-color 0.2s',
      '&:hover': {
        backgroundColor: theme.palette.action.hover,
      },
      '&:last-child td': {
        borderBottom: 0,
      },
    },
    '& .MuiTableCell-root': {
      color: theme.palette.text.secondary,
      borderBottom: `1px solid ${theme.palette.divider}`,
    },
  },
}));

const StyledTableContainer = styled(Paper)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[1],
  overflow: 'hidden',
}));

export const ChartGrid: React.FC<ChartGridProps> = ({
  dashboardId,
  isEditMode,
  onEditChart,
  isAddChartModalOpen,
  isEditChartModalOpen,
  gridColumns,
  isNaturalLangauage,
}) => {
  const dispatch = useAppDispatch();
  const theme = useTheme();
  const chartRefs = useRef<{ [key: string]: ChartJS | null }>({});
  const { charts, widgetTypes, temporaryCharts, chartsLoading, chartsError, widgetData } = useAppSelector((state) => ({
    charts: state.dashboard.charts,
    temporaryCharts: state.dashboard.temporaryCharts,
    chartsLoading: state.dashboard.chartsLoading,
    chartsError: state.dashboard.chartsError,
    widgetData: state.dashboard.widgetData,
    widgetTypes: state.dashboard.widgetTypes,
  }));

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedChart, setSelectedChart] = useState<ChartResponse | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [fullViewOpen, setFullViewOpen] = useState(false);
  const [exportMenuAnchorEl, setExportMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [drillDownOpen, setDrillDownOpen] = useState(false);
  const [drillDownData, setDrillDownData] = useState<ChartDataItem[]>([]);
  const [drillDownTitle, setDrillDownTitle] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [, setTotalRecords] = useState(0);
  const [isDrillDownLoading, setIsDrillDownLoading] = useState(false);
  const [drillDownPayload, setDrillDownPayload] = useState<any>(null);
  const itemsPerPage = 10;

  // Combine permanent and temporary charts
  const allCharts = [...charts, ...temporaryCharts];

  const widgetTheme = useAppSelector((state) => state.dashboard.widgetTheme);

  useEffect(() => {
    if (dashboardId) {
      if (isNaturalLangauage) {
        dispatch(resetChartAndWidgetData());
      } else {
        dispatch(fetchChartData(dashboardId));
      }
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
      let csvContent = 'data:text/csv;charset=utf-8,';

      // Add header row
      const headers = ['Category', ...datasets.map((dataset) => dataset.label)];
      csvContent += headers.join(',') + '\n';

      // Add data rows
      labels.forEach((label, index) => {
        const row = [label, ...datasets.map((dataset) => dataset.data[index])];
        csvContent += row.join(',') + '\n';
      });

      // Create download link
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `${selectedChart.name}_data.csv`);
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

  const handleChartClick = async (chart: ChartResponse, elements: ActiveElement[]) => {
    if (!elements || !elements.length) return;

    setSelectedChart(chart);

    const clickedElement = elements[0];
    const chartData = widgetData[chart._id]?.data?.widgetData || chart.data || [];

    // Get the clicked data point details
    const clickedData = chartData.find((item: ChartDataItem) => {
      const dataIndex = clickedElement.index;
      if (dataIndex >= 0 && dataIndex < chartData.length) {
        return item.name === chartData[dataIndex].name;
      }
      return false;
    });

    if (clickedData) {
      // Open modal immediately
      setDrillDownTitle(`${chart.name} - ${clickedData.name}`);
      setDrillDownOpen(true);
      setCurrentPage(1);
      setIsDrillDownLoading(true);

      try {
        // Prepare the request payload
        const dimensions = chart.dimensions
          ? Array.isArray(chart.dimensions)
            ? chart.dimensions.map((dim) => ({ [dim]: clickedData.name }))
            : [{ [chart.dimensions]: clickedData.name }]
          : [];

        const groupBy = chart.groupBy
          ? Array.isArray(chart.groupBy)
            ? chart.groupBy.map((group) => {
                console.log('🚀 ~ handleChartClick ~ group:', group, clickedData, clickedData[group]);
                return { [group]: clickedData[group] };
              })
            : [{ [chart.groupBy]: clickedData.name }]
          : [];

        const payload = {
          dataSourceId: chart.dataSourceId?._id,
          entityId: chart.dataSourceId?.entityId,
          conditions: chart.conditions || [],
          dimensions,
          groupBy,
          page: 1,
          limit: itemsPerPage,
        };

        // Save the payload for pagination
        setDrillDownPayload(payload);

        // Make the API call
        const response = await axiosInstance.post('/dataSource/getWidgetDataByFilter', payload);

        if (response.data.success) {
          setDrillDownData(response.data.data);
          setTotalPages(response.data.pagination.totalPages);
          setTotalRecords(response.data.pagination.totalRecords);
        } else {
          toast.error(response.data.message || 'Failed to fetch detailed data');
        }
      } catch (error) {
        console.error('Error fetching detailed data:', error);
        toast.error('Failed to fetch detailed data');
      } finally {
        setIsDrillDownLoading(false);
      }
    }
  };

  const handleDrillDownClose = () => {
    setDrillDownOpen(false);
    setDrillDownData([]);
    setDrillDownTitle('');
    setDrillDownPayload(null);
  };

  const handlePageChange = async (event: React.ChangeEvent<unknown>, value: number) => {
    if (!selectedChart || !drillDownPayload) return;

    try {
      // Use the saved payload and just update the page number
      const payload = {
        ...drillDownPayload,
        page: value,
      };

      const response = await axiosInstance.post('/dataSource/getWidgetDataByFilter', payload);

      if (response.data.success) {
        setDrillDownData(response.data.data);
        setTotalPages(response.data.pagination.totalPages);
        setTotalRecords(response.data.pagination.totalRecords);
        setCurrentPage(value);
      } else {
        toast.error(response.data.message || 'Failed to fetch detailed data');
      }
    } catch (error) {
      console.error('Error fetching detailed data:', error);
      toast.error('Failed to fetch detailed data');
    }
  };

  if (chartsLoading && !isNaturalLangauage) {
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

  if ((!allCharts || allCharts.length === 0) && !isNaturalLangauage) {
    return (
      <EmptyContainer>
        <Typography color="text.secondary" variant="h6">
          No charts available
        </Typography>
      </EmptyContainer>
    );
  }

  const handleChartUpdate = async (formData: ChartFormData) => {
    console.log('formData', formData);

    const newFormData = {
      ...formData,
      chartType: widgetTypes.find((data) => data._id === formData.widgetTypeId)?.chartType,
    };

    await dispatch(fetchIndividualWidgetData(newFormData));

    // if (!selectedChart) return;
    // try {
    //   const result = await dispatch(
    //     updateWidget({
    //       ...formData,
    //       _id: selectedChart._id,
    //       dashboardId: dashboardId || '',
    //     })
    //   ).unwrap();
    //   if (result.success) {
    //     toast.success('Chart updated successfully!');
    //     handleCloseEditModal();
    //   } else {
    //     toast.error(result.message || 'Failed to update chart');
    //   }
    // } catch (error) {
    //   if (typeof error === 'object' && error !== null && 'message' in error) {
    //     toast.error(error.message as string);
    //   } else {
    //     toast.error('Failed to update chart');
    //   }
    // }
  };
  const getChartData = (chart: ChartResponse) => {
    const createDefaultDataset = (data: number[] = []): ChartDataset => ({
      label: chart.name,
      data,
      borderColor: theme.palette.primary.main,
      backgroundColor: theme.palette.primary.light,
      tension: 0.1,
      fill: chart.widgetTypeId?.chartType === 'area' ? 'start' : false,
    });

    // Get widget data from the store
    const chartData = widgetData[chart._id]?.data?.widgetData || chart.data || [];

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
      const groupByField = groupBy[0];
      const uniqueGroups = Array.from(new Set(chartData.map((item: ChartDataItem) => item[groupByField] as string)));
      const uniqueNames = Array.from(new Set(chartData.map((item: ChartDataItem) => item.name)));

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
        '#20B2AA30', // Light Sea Green
      ];

      // Create a dataset for each unique group
      const datasets = uniqueGroups.map((group, index) => {
        const groupData = uniqueNames.map((name) => {
          const dataPoint = chartData.find((item) => item.name === name && item[groupByField] === group);
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
      const labels = chartData.map((item: ChartDataItem) => item.name);
      const values = chartData.map((item: ChartDataItem) => item.data);

      return {
        labels,
        datasets: [
          {
            data: values,
            backgroundColor: [
              '#FF149330',
              '#00BFFF30',
              '#FFD70030',
              '#00FF7F30',
              '#9370DB30',
              '#FF450030',
              '#FF69B430',
              '#32CD3230',
              '#FF634730',
              '#1E90FF30',
              '#FF8C0030',
              '#20B2AA30',
            ],
            borderColor: 'white',
            borderWidth: 2,
          },
        ],
      };
    }

    // Handle grouped horizontal bar chart
    if (chartType === 'horizontalBar' && groupBy.length > 0) {
      const groupByField = groupBy[0]; // Take the first groupBy field
      const uniqueGroups = Array.from(new Set(chartData.map((item) => item[groupByField] as string)));
      const uniqueNames = Array.from(new Set(chartData.map((item) => item.name)));

      // Generate colors for each group
      const colors = [
        '#FF6384',
        '#36A2EB',
        '#FFCE56',
        '#4BC0C0',
        '#9966FF',
        '#FF9F40',
        '#FF99E6',
        '#99FF99',
        '#FF9999',
        '#99CCFF',
        '#FF99CC',
        '#99FFCC',
      ];

      // Create a dataset for each unique group
      const datasets = uniqueGroups.map((group, index) => {
        const groupData = uniqueNames.map((name) => {
          const dataPoint = chartData.find((item) => item.name === name && item[groupByField] === group);
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
      const labels = chartData.map((item: ChartDataItem) => item.name);
      const values = chartData.map((item: ChartDataItem) => item.data);

      return {
        labels,
        datasets: [
          {
            label: chart.name,
            data: values,
            backgroundColor: theme.palette.primary.main,
            borderColor: theme.palette.primary.main,
            borderWidth: 1,
          },
        ],
      };
    }

    // Handle vertical bar chart (both grouped and non-grouped)
    if (chartType === 'verticalBar' || chartType === 'stackedBar' || chartType === 'multiSeriesBar') {
      const labels = chartData.map((item: ChartDataItem) => item.name);

      if (groupBy.length > 0) {
        const groupByField = groupBy[0];
        const uniqueGroups = Array.from(new Set(chartData.map((item) => item[groupByField] as string)));

        const colors = [
          '#FF6384',
          '#36A2EB',
          '#FFCE56',
          '#4BC0C0',
          '#9966FF',
          '#FF9F40',
          '#FF99E6',
          '#99FF99',
          '#FF9999',
          '#99CCFF',
          '#FF99CC',
          '#99FFCC',
        ];

        const datasets = uniqueGroups.map((group, index) => {
          const groupData = labels.map((name: any) => {
            const dataPoint = chartData.find((item: any) => item.name === name && item[groupByField] === group);
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
      const values = chartData.map((item: ChartDataItem) => item.data);
      return {
        labels,
        datasets: [
          {
            label: chart.name,
            data: values,
            backgroundColor: theme.palette.primary.main,
            borderColor: theme.palette.primary.main,
            borderWidth: 1,
          },
        ],
      };
    }

    // Handle pie chart or doughnut chart
    if (chartType === 'pie' || chartType === 'doughnut') {
      const labels = chartData.map((item: ChartDataItem) => item.name);
      const values = chartData.map((item: ChartDataItem) => item.data);

      // Handle grouped data
      if (groupBy.length > 0) {
        const groupByField = groupBy[0]; // Take the first groupBy field
        const uniqueGroups = Array.from(new Set(chartData.map((item) => item[groupByField] as string)));
        const uniqueNames = Array.from(new Set(chartData.map((item) => item.name)));

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
          const groupData = uniqueNames.map((name) => {
            const dataPoint = chartData.find((item) => item.name === name && item[groupByField] === group);
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
      const labels = chartData.map((item: ChartDataItem) => item.name);

      if (groupBy.length > 0) {
        const groupByField = groupBy[0]; // Take the first groupBy field
        const uniqueGroups = Array.from(new Set(chartData.map((item) => item[groupByField] as string)));
        const uniqueNames = Array.from(new Set(chartData.map((item) => item.name)));

        // Generate colors for each group
        const colors = [
          '#FF6384',
          '#36A2EB',
          '#FFCE56',
          '#4BC0C0',
          '#9966FF',
          '#FF9F40',
          '#FF99E6',
          '#99FF99',
          '#FF9999',
          '#99CCFF',
          '#FF99CC',
          '#99FFCC',
        ];

        // Create a dataset for each unique group
        const datasets = uniqueGroups.map((group, index) => {
          const groupData = uniqueNames.map((name) => {
            const dataPoint = chartData.find((item) => item.name === name && item[groupByField] === group);
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
      const values = chartData.map((item: ChartDataItem) => item.data);
      return {
        labels,
        datasets: [
          {
            label: chart.name,
            data: values,
            borderColor: theme.palette.primary.main,
            backgroundColor: `${theme.palette.primary.main}40`,
            pointBackgroundColor: theme.palette.primary.main,
            pointBorderColor: '#fff',
            pointHoverBackgroundColor: '#fff',
            pointHoverBorderColor: theme.palette.primary.main,
            tension: 0.1,
          },
        ],
      };
    }

    // Handle grouped line/area chart
    if ((chartType === 'line' || chartType === 'area') && groupBy.length > 0) {
      const groupByField = groupBy[0]; // Take the first groupBy field
      const uniqueGroups = Array.from(new Set(chartData.map((item) => item[groupByField] as string)));
      const uniqueNames = Array.from(new Set(chartData.map((item) => item.name)));

      // Generate colors for each group
      const colors = [
        '#FF6384',
        '#36A2EB',
        '#FFCE56',
        '#4BC0C0',
        '#9966FF',
        '#FF9F40',
        '#FF99E6',
        '#99FF99',
        '#FF9999',
        '#99CCFF',
        '#FF99CC',
        '#99FFCC',
      ];

      // Create a dataset for each unique group
      const datasets = uniqueGroups.map((group, index) => {
        const groupData = uniqueNames.map((name) => {
          const dataPoint = chartData.find((item) => item.name === name && item[groupByField] === group);
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
    const labels = chartData.map((item: ChartDataItem) => item.name);
    const values = chartData.map((item: ChartDataItem) => item.data);

    return {
      labels,
      datasets: [createDefaultDataset(values)],
    };
  };

  const getChartOptions = (chartType: string) => {
    const baseOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: (widgetTheme?.legend?.position ?? 'bottom') as
            | 'bottom'
            | 'right'
            | 'center'
            | 'top'
            | 'left'
            | 'chartArea',
          display: widgetTheme?.legend?.display ?? true,
          align: 'start' as const,
          labels: {
            usePointStyle: widgetTheme?.legend?.labels?.usePointStyle ?? true,
            padding: widgetTheme?.legend?.labels?.padding ?? 15,
            font: {
              size: widgetTheme?.legend?.labels?.font?.size ?? 12,
            },
            boxWidth: widgetTheme?.legend?.labels?.boxWidth ?? 10,
            boxHeight: widgetTheme?.legend?.labels?.boxHeight ?? 10,
          },
          maxHeight: 100,
        },
        tooltip: {
          enabled: true,
          display: widgetTheme?.tooltip?.display ?? true,
          backgroundColor: widgetTheme?.tooltip?.backgroundColor ?? theme.palette.background.paper,
          titleColor: widgetTheme?.tooltip?.titleColor ?? theme.palette.text.primary,
          bodyColor: theme.palette.text.secondary,
          borderColor: widgetTheme?.tooltip?.borderColor ?? theme.palette.divider,
          borderWidth: widgetTheme?.tooltip?.borderWidth ?? 1,
          padding: widgetTheme?.tooltip?.padding ?? 12,
          usePointStyle: widgetTheme?.tooltip?.usePointStyle ?? true,
          displayColors: widgetTheme?.tooltip?.displayColors ?? true,
        },
      },
      layout: {
        padding: {
          top: widgetTheme?.layout?.padding?.top ?? 10,
          bottom: widgetTheme?.layout?.padding?.bottom ?? 10,
          left: widgetTheme?.layout?.padding?.left ?? 10,
          right: widgetTheme?.layout?.padding?.right ?? 10,
        },
      },
      interaction: {
        mode: (widgetTheme?.interaction?.mode ?? 'nearest') as 'nearest' | 'y' | 'x' | 'index' | 'dataset' | 'point',
        intersect: widgetTheme?.interaction?.intersect ?? false,
      },
    };

    // Apply chart type specific options
    switch (chartType) {
      case 'pie':
      case 'doughnut':
      case 'polarArea':
        return {
          ...baseOptions,
          plugins: {
            ...baseOptions.plugins,
            legend: {
              ...baseOptions.plugins.legend,
              position: (widgetTheme?.legend?.position ?? 'right') as
                | 'bottom'
                | 'right'
                | 'center'
                | 'top'
                | 'left'
                | 'chartArea',
            },
          },
        };

      case 'line':
      case 'area':
        return {
          ...baseOptions,
          scales: {
            y: {
              display: widgetTheme?.scales?.y?.display ?? true,
              beginAtZero: widgetTheme?.scales?.y?.beginAtZero ?? true,
              grid: {
                color: widgetTheme?.scales?.y?.grid?.color ?? theme.palette.divider,
                drawBorder: widgetTheme?.scales?.y?.grid?.drawBorder ?? false,
              },
              ticks: {
                padding: widgetTheme?.scales?.y?.ticks?.padding ?? 15,
                maxRotation: 0,
                minRotation: 0,
                font: {
                  size: 11,
                },
              },
            },
            x: {
              display: widgetTheme?.scales?.x?.display ?? true,
              grid: {
                display: widgetTheme?.scales?.x?.grid?.display ?? false,
                drawBorder: widgetTheme?.scales?.x?.grid?.drawBorder ?? false,
              },
              ticks: {
                padding: widgetTheme?.scales?.x?.ticks?.padding ?? 15,
                maxRotation: widgetTheme?.scales?.x?.ticks?.maxRotation ?? 45,
                minRotation: widgetTheme?.scales?.x?.ticks?.minRotation ?? 45,
                autoSkip: true,
              },
            },
          },
        };

      case 'horizontalBar':
      case 'verticalBar':
      case 'stackedBar':
      case 'multiSeriesBar':
        return {
          ...baseOptions,
          scales: {
            y: {
              display: widgetTheme?.scales?.y?.display ?? true,
              beginAtZero: widgetTheme?.scales?.y?.beginAtZero ?? true,
              grid: {
                color: widgetTheme?.scales?.y?.grid?.color ?? theme.palette.divider,
                drawBorder: widgetTheme?.scales?.y?.grid?.drawBorder ?? false,
              },
              ticks: {
                padding: widgetTheme?.scales?.y?.ticks?.padding ?? 8,
              },
              stacked: chartType === 'stackedBar',
            },
            x: {
              display: widgetTheme?.scales?.x?.display ?? true,
              grid: {
                display: widgetTheme?.scales?.x?.grid?.display ?? false,
                drawBorder: widgetTheme?.scales?.x?.grid?.drawBorder ?? false,
              },
              ticks: {
                color: widgetTheme?.scales?.x?.ticks?.color ?? theme.palette.text.secondary,
                padding: widgetTheme?.scales?.x?.ticks?.padding ?? 8,
              },
              stacked: chartType === 'stackedBar',
            },
          },
        };

      case 'radar':
        return {
          ...baseOptions,
          scales: {
            r: {
              beginAtZero: widgetTheme?.scales?.y?.beginAtZero ?? true,
              grid: {
                color: widgetTheme?.scales?.y?.grid?.color ?? theme.palette.divider,
              },
              angleLines: {
                color: widgetTheme?.scales?.y?.grid?.color ?? theme.palette.divider,
              },
              pointLabels: {
                color: widgetTheme?.scales?.x?.ticks?.color ?? theme.palette.text.secondary,
              },
              ticks: {
                backdropColor: 'transparent',
              },
            },
          },
        };

      default:
        return baseOptions;
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.stopPropagation();
  };

  const renderChart = (chart: ChartResponse) => {
    const chartData = getChartData(chart);
    const chartType = chart.widgetTypeId?.chartType || 'line';
    const options = getChartOptions(chartType);
    const chartId = `chart-${chart._id}`;
    const numberValue = chartData.datasets[0]?.data[0] || 0;

    const baseChartProps = {
      id: chartId,
      options: {
        ...options,
        onClick: (event: ChartEvent, elements: ActiveElement[]) => {
          handleChartClick(chart, elements);
        },
      },
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
        return (
          <Pie
            {...baseChartProps}
            data={chartData as ChartData<'pie'>}
            ref={(ref) => {
              chartRefs.current[chartId] = ref as ChartJS<'pie'> | null;
            }}
          />
        );
      case 'doughnut':
        return (
          <Doughnut
            {...baseChartProps}
            data={chartData as ChartData<'doughnut'>}
            ref={(ref) => {
              chartRefs.current[chartId] = ref as ChartJS<'doughnut'> | null;
            }}
          />
        );
      case 'multiSeriesPie':
        return (
          <Pie
            {...baseChartProps}
            data={chartData as ChartData<'pie'>}
            ref={(ref) => {
              chartRefs.current[chartId] = ref as ChartJS<'pie'> | null;
            }}
          />
        );
      case 'horizontalBar':
      case 'verticalBar':
      case 'stackedBar':
      case 'multiSeriesBar':
        return (
          <Bar
            {...baseChartProps}
            data={chartData as ChartData<'bar'>}
            ref={(ref) => {
              chartRefs.current[chartId] = ref as ChartJS<'bar'> | null;
            }}
          />
        );
      case 'radar':
        return (
          <Radar
            {...baseChartProps}
            data={chartData as ChartData<'radar'>}
            ref={(ref) => {
              chartRefs.current[chartId] = ref as ChartJS<'radar'> | null;
            }}
          />
        );
      case 'polarArea':
        return (
          <PolarArea
            {...baseChartProps}
            data={chartData as ChartData<'polarArea'>}
            ref={(ref) => {
              chartRefs.current[chartId] = ref as ChartJS<'polarArea'> | null;
            }}
          />
        );
      case 'area':
      case 'line':
      default:
        return (
          <Line
            {...baseChartProps}
            data={chartData as ChartData<'line'>}
            ref={(ref) => {
              chartRefs.current[chartId] = ref as ChartJS<'line'> | null;
            }}
          />
        );
    }
  };

  const renderDrillDownDialog = () => {
    const columns = drillDownData.length > 0 ? Object.keys(drillDownData[0]).filter((key) => key !== '_id') : [];

    return (
      <DrillDownDialog open={drillDownOpen} onClose={handleDrillDownClose} aria-labelledby="drill-down-dialog-title">
        <DialogTitle
          id="drill-down-dialog-title"
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: `1px solid ${theme.palette.divider}`,
            p: 2,
          }}
        >
          <Typography variant="h6">{drillDownTitle}</Typography>
          <IconButton
            onClick={handleDrillDownClose}
            size="small"
            sx={{
              color: theme.palette.text.secondary,
              '&:hover': {
                color: theme.palette.text.primary,
                backgroundColor: theme.palette.action.hover,
              },
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent
          sx={{
            p: 3,
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
          }}
        >
          <StyledTableContainer sx={{ flex: 1, overflow: 'auto' }}>
            <DrillDownTable>
              <TableHead>
                <TableRow>
                  {columns.map((column) => (
                    <TableCell key={column} sx={{ fontWeight: 'bold' }}>
                      {column}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {isDrillDownLoading ? (
                  // Skeleton loading rows
                  Array.from({ length: 5 }).map((_, index) => (
                    <TableRow key={index}>
                      {columns.map((column) => (
                        <TableCell key={column}>
                          <Box
                            sx={{
                              width: '100%',
                              height: 20,
                              bgcolor: 'grey.200',
                              borderRadius: 1,
                            }}
                          />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : drillDownData.length > 0 ? (
                  drillDownData.map((row, index) => (
                    <TableRow key={index}>
                      {columns.map((column) => (
                        <TableCell key={column}>
                          {typeof row[column] === 'number' ? row[column].toLocaleString() : row[column]}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={columns.length} align="center">
                      No data available
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </DrillDownTable>
          </StyledTableContainer>
          {!isDrillDownLoading && drillDownData.length > 0 && (
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                mt: 'auto',
                pt: 3,
                pb: 2,
                borderTop: `1px solid ${theme.palette.divider}`,
              }}
            >
              <Pagination count={totalPages} page={currentPage} onChange={handlePageChange} color="primary" />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDrillDownClose}>Close</Button>
        </DialogActions>
      </DrillDownDialog>
    );
  };

  return (
    <>
      <Grid
        container
        spacing={3}
        sx={{
          height: '100%',
          alignContent: 'flex-start',
          '& .MuiGrid-item': {
            display: 'flex',
            '& > *': {
              width: '100%',
            },
          },
        }}
      >
        {allCharts?.map((chart, index) => (
          <>
            {isNaturalLangauage && (
              <Typography fontWeight="bold" color="text.secondary" p={3}>
                Query: <span style={{ color: '#000' }}>{chart?.userQuery}</span>
              </Typography>
            )}
            <Grid
              item
              xs={12}
              md={isAddChartModalOpen || isEditChartModalOpen ? 12 : gridColumns === 1 ? 12 : gridColumns === 2 ? 6 : 4}
              key={chart._id}
              gap={isNaturalLangauage ? 4 : 0}
              p={isNaturalLangauage ? 2 : 0}
            >
              {isNaturalLangauage && (
                <AddChartModal
                  open={true}
                  onClose={() => {}}
                  isSubmitting={false}
                  dashboardId={''}
                  initialData={chart}
                  isNaturalLangauage={true}
                  onSave={(formData) => handleChartUpdate({ ...chart, ...formData })}
                />
              )}
              <StyledCard>
                <CardContent
                  sx={{
                    flexGrow: 1,
                    p: 3,
                    display: 'flex',
                    flexDirection: 'column',
                    height: '100%',
                  }}
                >
                  <ChartTitle>
                    <ChartTitleText>
                      {chart.name}
                      {widgetData[chart._id]?.data?.label && ` (${widgetData[chart._id]?.data?.label})`}
                    </ChartTitleText>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <IconButton
                        size="small"
                        onClick={() => handleFullViewClick(chart)}
                        sx={{
                          opacity: 0.7,
                          '&:hover': { opacity: 1 },
                        }}
                      >
                        <FullscreenIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={(e) => handleExportMenuClick(e, chart)}
                        sx={{
                          opacity: 0.7,
                          '&:hover': { opacity: 1 },
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
                            '&:hover': { opacity: 1 },
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
                        : (chart.widgetTypeId?.chartType || 'line') === 'multiSeriesPie'
                        ? 'pie-chart'
                        : 'line-chart'
                    }
                    onWheel={handleWheel}
                  >
                    {renderChart(chart)}
                  </ChartContainer>
                </CardContent>
              </StyledCard>
            </Grid>
          </>
        ))}

        {chartsLoading && isNaturalLangauage && (
          <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
            <LoadingContainer>
              <CircularProgress />
            </LoadingContainer>
          </Grid>
        )}
      </Grid>

      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose} onClick={(e) => e.stopPropagation()}>
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

      {deleteDialogOpen && (
        <Dialog open={deleteDialogOpen} onClose={handleDeleteCancel} aria-labelledby="delete-dialog-title">
          <DialogTitle id="delete-dialog-title">Delete Chart</DialogTitle>
          <DialogContent>
            <Typography>Are you sure you want to delete this chart? This action cannot be undone.</Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleDeleteCancel}>Cancel</Button>
            <Button onClick={handleDeleteConfirm} color="error" variant="contained" disabled={isDeleting}>
              {isDeleting ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogActions>
        </Dialog>
      )}

      <FullScreenModal open={fullViewOpen} onClose={handleFullViewClose} fullScreen>
        <DialogTitle
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: `1px solid ${theme.palette.divider}`,
            p: 2,
          }}
        >
          <Typography variant="h6">{selectedChart?.name}</Typography>
          <IconButton
            onClick={handleFullViewClose}
            size="small"
            sx={{
              color: theme.palette.text.secondary,
              '&:hover': {
                color: theme.palette.text.primary,
                backgroundColor: theme.palette.action.hover,
              },
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <FullScreenChartContainer>{selectedChart && renderChart(selectedChart)}</FullScreenChartContainer>
      </FullScreenModal>

      {renderDrillDownDialog()}
    </>
  );
};
