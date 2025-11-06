import React, { useEffect, useState, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '../../../storeHooks';
import {
  fetchChartData,
  deleteWidget,
  fetchIndividualWidgetData,
  fetchDashboardList,
  saveWidgets,
} from '../notivixDashboardActions';
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
  Divider,
  Avatar,
  TableContainer,
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
  BarElement,
  RadialLinearScale,
  ChartData,
  ChartEvent,
  ActiveElement,
  ChartDataset,
} from 'chart.js';
import { Line, Pie, Bar, Doughnut, Radar, PolarArea, Scatter } from 'react-chartjs-2';
import { ChartResponse, Dashboard } from '../types';
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
import { Theme } from '../../createTheme/types';

import { NotivixAddChartModal, ChartFormData } from './NotivixAddChartModal';
import { resetChartAndWidgetData } from '../notivixDashboardReducer';
import { SaveWidgetModel } from '../../naturalLanguage/saveWidgetModel';
import { STYLE_GUIDE } from '../../../styles';
import { useUnifiedTheme } from '../../../hooks/useUnifiedTheme';
import { useComponentTypography } from '../../../hooks/useComponentTypography';
import { MetricCards } from './MetricCard';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  BarElement,
  RadialLinearScale
);

interface ChartGridProps {
  dashboardId: string;
  dashboardFilters: any;
  isEditMode: boolean;
  onEditChart: (chart: ChartResponse) => void;
  isAddChartModalOpen: boolean;
  isEditChartModalOpen: boolean;
  gridColumns: number;
  currentDashboard?: Dashboard;
  startVersionValue?: string;
  endVersionValue?: string;
  versionValue?: string;
  isTrend?: boolean;
  isNaturalLangauage?: boolean;
}

interface ChartDataItem {
  name: string;
  data: number;
  [key: string]: string | number;
}

type DrillDownPayload = {
  dataSourceId?: string;
  entityId?: string;
  conditions?: Record<string, unknown>[];
  dimensions?: Record<string, unknown>[];
  groupBy?: Record<string, unknown>[];
  page?: number;
  limit?: number;
};

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
  fontSize: STYLE_GUIDE.TYPOGRAPHY.fontSize.large,
  fontWeight: STYLE_GUIDE.TYPOGRAPHY.fontWeight.semiBold,
  color: theme.palette.text.primary,
  marginBottom: theme.spacing(2),
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: theme.spacing(1),
}));

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
  '&.table-chart': {
    minHeight: 400,
    padding: theme.spacing(2),
    overflow: 'auto',
    '& .MuiTableContainer-root': {
      height: '100%',
      width: '100%',
      overflow: 'auto',
    },
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

const NumberValue = styled(Typography, {
  shouldForwardProp: (prop) => prop !== 'widgetTheme',
})<{ widgetTheme?: Theme | null }>(({ theme, widgetTheme }) => ({
  fontSize: STYLE_GUIDE.TYPOGRAPHY.fontSize.xxxl,
  fontWeight: STYLE_GUIDE.TYPOGRAPHY.fontWeight.semiBold,
  color: widgetTheme?.colors?.[0] || theme.palette.primary.main,
  lineHeight: STYLE_GUIDE.TYPOGRAPHY.lineHeight.tight,
}));

const NumberLabel = styled(Typography)(({ theme }) => ({
  fontSize: '1rem',
  color: theme.palette.text.secondary,
  textAlign: 'center',
}));

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

const sliceLabelsPlugin = {
  id: 'sliceLabels',
  afterDraw(chart: ChartJS) {
    const { ctx } = chart;
    const dataset = chart.data.datasets[0];
    const meta = chart.getDatasetMeta(0);
    const total = (dataset.data as number[]).reduce((a, b) => a + b, 0);

    meta.data.forEach((element, index) => {
      const point = element as PointElement;
      if (!point || typeof point.tooltipPosition !== 'function') return;
      const value = dataset.data[index] as number;
      const label = chart.data.labels?.[index] ?? '';
      const percent = value / total;

      const { x, y } = point.tooltipPosition(Boolean(chart.chartArea));
      const text = `${label}: ${value}`;
      ctx.save();
      ctx.font = percent < 0.1 ? 'bold 10px sans-serif' : 'bold 12px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const paddingX = 8;
      const paddingY = 4;
      const textMetrics = ctx.measureText(text);
      const textWidth = textMetrics.width;
      const textHeight = 16;
      const rectX = x - textWidth / 2 - paddingX;
      const rectY = y - textHeight / 2 - paddingY;
      const rectWidth = textWidth + paddingX * 2;
      const rectHeight = textHeight + paddingY * 2;
      const radius = 6;

      ctx.beginPath();
      ctx.moveTo(rectX + radius, rectY);
      ctx.lineTo(rectX + rectWidth - radius, rectY);
      ctx.quadraticCurveTo(rectX + rectWidth, rectY, rectX + rectWidth, rectY + radius);
      ctx.lineTo(rectX + rectWidth, rectY + rectHeight - radius);
      ctx.quadraticCurveTo(rectX + rectWidth, rectY + rectHeight, rectX + rectWidth - radius, rectY + rectHeight);
      ctx.lineTo(rectX + radius, rectY + rectHeight);
      ctx.quadraticCurveTo(rectX, rectY + rectHeight, rectX, rectY + rectHeight - radius);
      ctx.lineTo(rectX, rectY + radius);
      ctx.quadraticCurveTo(rectX, rectY, rectX + radius, rectY);
      ctx.closePath();

      ctx.fillStyle = '#fff';
      ctx.globalAlpha = 0.85;
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.strokeStyle = '#888';
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.fillStyle = '#000';
      ctx.fillText(text, x, y);
      ctx.restore();
    });
  },
};

const ChartTitleText = styled(Typography)({
  flexGrow: 1,
});

const pointLabelsPlugin = {
  id: 'pointLabels',
  afterDraw(chart: ChartJS) {
    const { ctx } = chart;
    const datasets = chart.data.datasets;
    const meta = chart.getDatasetMeta(0);

    meta.data.forEach((element, index) => {
      const point = element as PointElement;
      if (!point || typeof point.tooltipPosition !== 'function') return;
      const { x, y } = point.tooltipPosition(Boolean(chart.chartArea));
      const value = datasets[0].data[index] as number;
      const text = `${value}`;
      ctx.save();
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const offset = 18;
      const labelY = y - offset;
      const paddingX = 8;
      const paddingY = 4;
      const textMetrics = ctx.measureText(text);
      const textWidth = textMetrics.width;
      const textHeight = 16;
      const rectX = x - textWidth / 2 - paddingX;
      const rectY = labelY - textHeight / 2 - paddingY;
      const rectWidth = textWidth + paddingX * 2;
      const rectHeight = textHeight + paddingY * 2;
      const radius = 6;
      ctx.beginPath();
      ctx.moveTo(rectX + radius, rectY);
      ctx.lineTo(rectX + rectWidth - radius, rectY);
      ctx.quadraticCurveTo(rectX + rectWidth, rectY, rectX + rectWidth, rectY + radius);
      ctx.lineTo(rectX + rectWidth, rectY + rectHeight - radius);
      ctx.quadraticCurveTo(rectX + rectWidth, rectY + rectHeight, rectX + rectWidth - radius, rectY + rectHeight);
      ctx.lineTo(rectX + radius, rectY + rectHeight);
      ctx.quadraticCurveTo(rectX, rectY + rectHeight, rectX, rectY + rectHeight - radius);
      ctx.lineTo(rectX, rectY + radius);
      ctx.quadraticCurveTo(rectX, rectY, rectX + radius, rectY);
      ctx.closePath();
      ctx.fillStyle = '#fff';
      ctx.globalAlpha = 0.85;
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.strokeStyle = '#888';
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.fillStyle = '#000';
      ctx.fillText(text, x, labelY);
      ctx.restore();
    });
  },
};

const barLabelsPlugin = {
  id: 'barLabels',
  afterDraw(chart: ChartJS) {
    const { ctx } = chart;
    const datasets = chart.data.datasets;
    const meta = chart.getDatasetMeta(0);

    meta.data.forEach((element, index) => {
      const bar = element as BarElement;
      if (!bar || typeof bar.tooltipPosition !== 'function') return;
      const { x, y } = bar.tooltipPosition(Boolean(chart.chartArea));
      const value = datasets[0].data[index] as number;
      const text = `${value}`;

      ctx.save();
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const offset = 18;
      const labelY = y - offset;
      const paddingX = 8;
      const paddingY = 4;
      const textMetrics = ctx.measureText(text);
      const textWidth = textMetrics.width;
      const textHeight = 16;
      const rectX = x - textWidth / 2 - paddingX;
      const rectY = labelY - textHeight / 2 - paddingY;
      const rectWidth = textWidth + paddingX * 2;
      const rectHeight = textHeight + paddingY * 2;
      const radius = 6;
      ctx.beginPath();
      ctx.moveTo(rectX + radius, rectY);
      ctx.lineTo(rectX + rectWidth - radius, rectY);
      ctx.quadraticCurveTo(rectX + rectWidth, rectY, rectX + rectWidth, rectY + radius);
      ctx.lineTo(rectX + rectWidth, rectY + rectHeight - radius);
      ctx.quadraticCurveTo(rectX + rectWidth, rectY + rectHeight, rectX + rectWidth - radius, rectY + rectHeight);
      ctx.lineTo(rectX + radius, rectY + rectHeight);
      ctx.quadraticCurveTo(rectX, rectY + rectHeight, rectX, rectY + rectHeight - radius);
      ctx.lineTo(rectX, rectY + radius);
      ctx.quadraticCurveTo(rectX, rectY, rectX + radius, rectY);
      ctx.closePath();
      ctx.fillStyle = '#fff';
      ctx.globalAlpha = 0.85;
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.strokeStyle = '#888';
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.fillStyle = '#000';
      ctx.fillText(text, x, labelY);
      ctx.restore();
    });
  },
};

const polarAreaLabelsPlugin = {
  id: 'polarAreaLabels',
  afterDraw(chart: ChartJS) {
    const { ctx } = chart;
    const datasets = chart.data.datasets;
    const meta = chart.getDatasetMeta(0);

    meta.data.forEach((element, index) => {
      const arc = element as ArcElement;
      if (!arc || typeof arc.tooltipPosition !== 'function') return;
      const { x, y } = arc.tooltipPosition(Boolean(chart.chartArea));
      const value = datasets[0].data[index] as number;
      const label = chart.data.labels?.[index] ?? '';
      const text = `${label}: ${value}`;
      ctx.save();
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const offset = 18;
      const labelY = y - offset;
      const paddingX = 8;
      const paddingY = 4;
      const textMetrics = ctx.measureText(text);
      const textWidth = textMetrics.width;
      const textHeight = 16;
      const rectX = x - textWidth / 2 - paddingX;
      const rectY = labelY - textHeight / 2 - paddingY;
      const rectWidth = textWidth + paddingX * 2;
      const rectHeight = textHeight + paddingY * 2;
      const radius = 6;
      ctx.beginPath();
      ctx.moveTo(rectX + radius, rectY);
      ctx.lineTo(rectX + rectWidth - radius, rectY);
      ctx.quadraticCurveTo(rectX + rectWidth, rectY, rectX + rectWidth, rectY + radius);
      ctx.lineTo(rectX + rectWidth, rectY + rectHeight - radius);
      ctx.quadraticCurveTo(rectX + rectWidth, rectY + rectHeight, rectX + rectWidth - radius, rectY + rectHeight);
      ctx.lineTo(rectX + radius, rectY + rectHeight);
      ctx.quadraticCurveTo(rectX, rectY + rectHeight, rectX, rectY + rectHeight - radius);
      ctx.lineTo(rectX, rectY + radius);
      ctx.quadraticCurveTo(rectX, rectY, rectX + radius, rectY);
      ctx.closePath();
      ctx.fillStyle = '#fff';
      ctx.globalAlpha = 0.85;
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.strokeStyle = '#888';
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.fillStyle = '#000';
      ctx.fillText(text, x, labelY);
      ctx.restore();
    });
  },
};

export const ChartGrid: React.FC<ChartGridProps> = ({
  dashboardId,
  dashboardFilters,
  isEditMode,
  onEditChart,
  isAddChartModalOpen,
  isEditChartModalOpen,
  gridColumns,
  currentDashboard,
  startVersionValue,
  endVersionValue,
  versionValue,
  isTrend,
  isNaturalLangauage,
}) => {
  const dispatch = useAppDispatch();
  const theme = useTheme();
  const themeUnified = useUnifiedTheme();
  const { getTableSx, getCardSx } = useComponentTypography();
  const chartRefs = useRef<{ [key: string]: ChartJS | null }>({});
  const { charts, widgetTypes, temporaryCharts, chartsLoading, chartsError, widgetData, dashboards } = useAppSelector(
    (state) => ({
      charts: state.dashboard.charts,
      temporaryCharts: state.dashboard.temporaryCharts,
      chartsLoading: state.dashboard.chartsLoading,
      chartsError: state.dashboard.chartsError,
      widgetData: state.dashboard.widgetData,
      widgetTypes: state.dashboard.widgetTypes,
      dashboards: state.dashboard.dashboards || [],
    })
  );

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
  const [drillDownPayload, setDrillDownPayload] = useState<DrillDownPayload | null>(null);
  const [openSaveChart, setOpenSaveChart] = useState(false);
  const [chartSaveSettingData, setChartSaveSettingData] = useState<any>({});
  const [chartSaveDashboardId, setChartSaveDashboardId] = useState('');
  const [newSaveChartName, setNewSaveChartName] = useState('');
  const [isChartSaving, setIsChartSaving] = useState(false);
  const itemsPerPage = 10;

  const allCharts = [...charts, ...temporaryCharts];

  const bottomRef: any = isNaturalLangauage ? useRef<HTMLDivElement | null>(null) : '';

  useEffect(() => {
    if (isNaturalLangauage) {
      bottomRef?.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chartsLoading, isNaturalLangauage]);

  const widgetTheme = useAppSelector((state) => state.dashboard.widgetTheme);

  useEffect(() => {
    if (!dashboards.length) {
      dispatch(fetchDashboardList());
    }
  }, [dispatch, dashboards.length]);

  useEffect(() => {
    if (dashboardId) {
      if (isNaturalLangauage) {
        dispatch(resetChartAndWidgetData());
      } else {
        dispatch(
          fetchChartData({
            dashboardId,
            dashboardType: currentDashboard?.settings?.dashboardType,
            filters: dashboardFilters,
          })
        );
      }
    }
  }, [dispatch, dashboardId, currentDashboard?.settings?.dashboardType, dashboardFilters]);

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
        dispatch(
          fetchChartData({
            dashboardId,
            dashboardType: currentDashboard?.settings?.dashboardType,
            filters: dashboardFilters,

          })
        );
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

      let csvContent = 'data:text/csv;charset=utf-8,';

      const headers = [
        'Category',
        ...datasets.map((dataset, i) =>
          'label' in dataset ? (dataset as { label: string }).label : `Series ${i + 1}`
        ),
      ];
      csvContent += headers.join(',') + '\n';

      labels?.forEach((label, index) => {
        const row = [label, ...datasets.map((dataset) => dataset.data[index])];
        csvContent += row.join(',') + '\n';
      });

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
    if (chart.widgetTypeId?.chartType === 'tabular') {
      handleDownload(chart);
      return;
    }
    setExportMenuAnchorEl(event.currentTarget);
    setSelectedChart(chart);
  };

  const handleExportMenuClose = () => {
    setExportMenuAnchorEl(null);
    setSelectedChart(null);
  };

  const handleChartClick = async (chart: ChartResponse, elements: ActiveElement[]) => {
    if (!elements || !elements.length) return;
console.log('Chart clicked222222:', chart, elements);
    setSelectedChart(chart);

    const clickedElement = elements[0];
    const chartData = widgetData[chart._id]?.data?.widgetData || chart.data || [];

    const clickedData = chartData.find((item: ChartDataItem) => {
      const dataIndex = clickedElement.index;
      if (dataIndex >= 0 && dataIndex < chartData.length) {
        return item.name === chartData[dataIndex].name;
      }
      return false;
    });

    if (clickedData) {
      setDrillDownTitle(`${chart.name} - ${clickedData.name}`);
      setDrillDownOpen(true);
      setCurrentPage(1);
      setIsDrillDownLoading(true);

      try {
        const dimensions = chart.dimensions
          ? Array.isArray(chart.dimensions)
            ? chart.dimensions.map((dim) => ({ [dim]: clickedData.name }))
            : [{ [chart.dimensions]: clickedData.name }]
          : [];

        const groupBy = chart.groupBy
          ? Array.isArray(chart.groupBy)
            ? chart.groupBy.map((group) => {
                return { [group]: clickedData[group] };
              })
            : [{ [chart.groupBy]: clickedData.name }]
          : [];

        const payload = {
          dataSourceId: chart.dataSourceId?._id,
          entityId: chart.dataSourceId?.entityId,
          conditions: chart.conditions || [],
          dimensions: isTrend
            ? [
                {
                  versionValue: clickedData.name,
                },
              ]
            : dimensions,
          dashboardFilters: {
            startVersionValue: startVersionValue,
            endVersionValue: endVersionValue,
            versionValue: versionValue,
          },
          groupBy,
          page: 1,
          limit: itemsPerPage,
          dashBoardType: currentDashboard?.settings?.dashboardType,
        };

        setDrillDownPayload(payload);

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
    if (!isNaturalLangauage) {
      return (
        <ErrorContainer>
          <Typography color="error" variant="h6">
            {chartsError}
          </Typography>
        </ErrorContainer>
      );
    }
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
    const newFormData = {
      ...formData,
      chartType: widgetTypes.find((data) => data._id === formData.widgetTypeId)?.chartType,
    };

    await dispatch(
      fetchIndividualWidgetData({
        chart: newFormData,
        dashboardType: currentDashboard?.settings?.dashboardType,
      })
    );
  };

  const handleSaveWidget = async () => {
    setIsChartSaving(true);
    try {
      const result = await dispatch(
        saveWidgets({
          widgets: [
            {
              dashboardId: chartSaveDashboardId,
              widgetTypeId: chartSaveSettingData.widgetTypeId?._id || '',
              name: newSaveChartName,
              dimensions: chartSaveSettingData.dimensions.join(','),
              groupBy: chartSaveSettingData.groupBy,
              aggregation: chartSaveSettingData.aggregation,
              position: chartSaveSettingData.position || { x: 0, y: 0, index: 0 },
              conditions: chartSaveSettingData.conditions,
              dataSourceId: chartSaveSettingData.dataSourceId?._id || chartSaveSettingData.dataSourceId,
              entityId: chartSaveSettingData.dataSourceId?.entityId || chartSaveSettingData.entityId,
              isIncremental: chartSaveSettingData.isIncremental || false,
            },
          ],
        })
      ).unwrap();

      if (result.success) {
        toast.success('Charts saved successfully!');
        setOpenSaveChart(false);
        setIsChartSaving(false);
      } else {
        toast.error(result.message || 'Failed to save charts');
        setIsChartSaving(false);
      }
    } catch (error) {
      if (typeof error === 'object' && error !== null && 'message' in error) {
        toast.error(error.message as string);
      } else {
        toast.error('Failed to save charts');
      }
      setIsChartSaving(false);
    }
  };

  const getChartData = (chart: ChartResponse) => {
    console.log(chart, 'ChartResp');
    const createDefaultDataset = (data: number[] = []): ChartDataset => ({
      label: chart.name,
      data,
      borderColor: theme.palette.primary.main,
      backgroundColor: theme.palette.primary.light,
      tension: 0.1,
      fill: chart.widgetTypeId?.chartType === 'area' ? 'start' : false,
      pointRadius: 5,
      pointHoverRadius: 9,
      pointHitRadius: 20,
    });
    const chartData = widgetData[chart._id]?.data?.widgetData || chart.data || [];
    console.log(chartData, 'chartData', widgetData);

    if (!chartData.length || chartData.every((item: ChartDataItem) => item.data === 0)) {
      return {
        labels: [],
        datasets: [createDefaultDataset()],
        isEmpty: true,
      };
    }
    const chartType = chart.widgetTypeId?.chartType || 'line';
    const groupBy = chart.groupBy || [];

    if (chartType === 'polarArea' && groupBy.length > 0) {
      const groupByField = groupBy[0];
      const uniqueGroups = Array.from(new Set(chartData.map((item: ChartDataItem) => item[groupByField] as string)));
      const uniqueNames = Array.from(new Set(chartData.map((item: ChartDataItem) => item.name)));
      let uniqueNameDataMap: any = {};
      const datasets = uniqueGroups.map((group, index) => {
        let totalDataBasedOnGroup = 0;
        const groupData = uniqueNames.map((name) => {
          const dataPoint = chartData.find((item) => item.name === name && item[groupByField] === group);
          const data = dataPoint ? dataPoint.data : 0;
          totalDataBasedOnGroup = totalDataBasedOnGroup + data;
          if (uniqueNameDataMap[name]) {
            uniqueNameDataMap[name] = uniqueNameDataMap[name] + data;
          } else {
            uniqueNameDataMap[name] = data;
          }
          return dataPoint ? dataPoint.data : 0;
        });

        return {
          label: group,
          data: groupData,
          color: widgetTheme?.colors,
          backgroundColor: widgetTheme?.backgroundColor[index % widgetTheme?.backgroundColor.length],
          borderColor: widgetTheme?.borderColor,
          borderWidth: 2,
          pointRadius: 5,
          pointHoverRadius: 9,
          pointHitRadius: 20,
        };
      });

      return {
        labels: uniqueNames,
        datasets,
      };
    }

    if (chartType === 'polarArea') {
      const polarLabels = Array.from(new Set(chartData.map((item: ChartDataItem) => `${item.name}-${item.data}`)));
      const values = chartData.map((item: ChartDataItem) => item.data);

      return {
        labels: polarLabels,
        datasets: [
          {
            data: values,
            color: widgetTheme?.colors,
            backgroundColor: widgetTheme?.backgroundColor,
            borderColor: widgetTheme?.borderColor,
            borderWidth: 2,
            pointRadius: 5,
            pointHoverRadius: 9,
            pointHitRadius: 20,
          },
        ],
      };
    }

    if (chartType === 'horizontalBar' && groupBy.length > 0) {
      const groupByField = groupBy[0];
      const uniqueGroups = Array.from(new Set(chartData.map((item) => item[groupByField] as string)));
      const uniqueNames = Array.from(new Set(chartData.map((item) => item.name)));
      let uniqueNameDataMap: any = {};
      const datasets = uniqueGroups.map((group, index) => {
        let totalDataBasedOnGroup = 0;
        const groupData = uniqueNames.map((name) => {
          const dataPoint = chartData.find((item) => item.name === name && item[groupByField] === group);
          const data = dataPoint ? dataPoint.data : 0;
          totalDataBasedOnGroup = totalDataBasedOnGroup + data;
          if (uniqueNameDataMap[name]) {
            uniqueNameDataMap[name] = uniqueNameDataMap[name] + data;
          } else {
            uniqueNameDataMap[name] = data;
          }
          return dataPoint ? dataPoint.data : 0;
        });

        return {
          label: group,
          data: groupData,
          color: widgetTheme?.colors,
          backgroundColor: widgetTheme?.backgroundColor[index % widgetTheme?.backgroundColor.length],
          borderColor: widgetTheme?.borderColor,
          borderWidth: 1,
          pointRadius: 5,
          pointHoverRadius: 9,
          pointHitRadius: 20,
        };
      });

      return {
        labels: uniqueNames,
        datasets,
      };
    }

    if (chartType === 'horizontalBar') {
      const labels = chartData.map((item: ChartDataItem) => `${item.name}-${item.data}`);
      const values = chartData.map((item: ChartDataItem) => item.data);

      return {
        labels,
        datasets: [
          {
            label: labels,
            data: values,
            color: widgetTheme?.colors,
            backgroundColor: widgetTheme?.backgroundColor,
            borderColor: widgetTheme?.borderColor,
            borderWidth: 1,
            pointRadius: 5,
            pointHoverRadius: 9,
            pointHitRadius: 20,
          },
        ],
      };
    }

    if (chartType === 'verticalBar' || chartType === 'stackedBar' || chartType === 'multiSeriesPie') {
      const barLabels = Array.from(new Set(chartData.map((item: ChartDataItem) => item.name)));

      if (groupBy.length > 0) {
        const groupByField = groupBy[0];
        const uniqueGroups = Array.from(new Set(chartData.map((item) => item[groupByField] as string)));
        let uniqueNameDataMap: any = {};
        const datasets = uniqueGroups.map((group, index) => {
          let totalDataBasedOnGroup = 0;
          const groupData = barLabels.map((name) => {
            const dataPoint = chartData.find((item) => item.name === name && item[groupByField] === group);
            const data = dataPoint ? dataPoint.data : 0;
            totalDataBasedOnGroup = totalDataBasedOnGroup + data;
            if (uniqueNameDataMap[name]) {
              uniqueNameDataMap[name] = uniqueNameDataMap[name] + data;
            } else {
              uniqueNameDataMap[name] = data;
            }
            return dataPoint ? dataPoint.data : 0;
          });

          return {
            label: group,
            data: groupData,
            color: widgetTheme?.colors,
            backgroundColor: widgetTheme?.backgroundColor[index % widgetTheme?.backgroundColor.length],
            borderColor: widgetTheme?.borderColor,
            borderWidth: 1,
            pointRadius: 5,
            pointHoverRadius: 9,
            pointHitRadius: 20,
          };
        });

        return { labels: barLabels, datasets };
      }

      const values = Array.from(new Set(chartData.map((item: ChartDataItem) => item.data)));
      const barLabelsName = Array.from(
        new Set(chartData.map((item: ChartDataItem) => `${item.name}(Total:${item.data})`))
      );
      return {
        labels: barLabelsName,
        datasets: [
          {
            label: barLabels,
            data: values,
            color: widgetTheme?.colors,
            backgroundColor: widgetTheme?.backgroundColor,
            borderColor: widgetTheme?.borderColor,
            borderWidth: 1,
            pointRadius: 5,
            pointHoverRadius: 9,
            pointHitRadius: 20,
          },
        ],
      };
    }

    if (chartType === 'pie' || chartType === 'doughnut') {
      const pieLabels = Array.from(new Set(chartData.map((item: ChartDataItem) => `${item.name}(Total:${item.data})`)));
      const values = chartData.map((item: ChartDataItem) => item.data);

      if (groupBy.length > 0) {
        const groupByField = groupBy[0];
        const uniqueGroups = Array.from(new Set(chartData.map((item) => item[groupByField] as string)));
        const uniqueNames = Array.from(new Set(chartData.map((item) => item.name)));
        let uniqueNameDataMap: any = {};
        const datasets = uniqueGroups.map((group, index) => {
          let totalDataBasedOnGroup = 0;
          const groupData = uniqueNames.map((name) => {
            const dataPoint = chartData.find((item) => item.name === name && item[groupByField] === group);
            const data = dataPoint ? dataPoint.data : 0;
            totalDataBasedOnGroup = totalDataBasedOnGroup + data;
            if (uniqueNameDataMap[name]) {
              uniqueNameDataMap[name] = uniqueNameDataMap[name] + data;
            } else {
              uniqueNameDataMap[name] = data;
            }
            return dataPoint ? dataPoint.data : 0;
          });

          return {
            label: group,
            data: groupData,
            backgroundColor: widgetTheme?.backgroundColor[index % widgetTheme?.backgroundColor.length],
            borderColor: widgetTheme?.borderColor,
            borderWidth: 2,
            pointRadius: 5,
            pointHoverRadius: 9,
            pointHitRadius: 20,
          };
        });

        return {
          labels: uniqueNames,
          datasets,
        };
      }

      return {
        labels: pieLabels,
        datasets: [
          {
            data: values,
            backgroundColor: widgetTheme?.backgroundColor,
            borderColor: widgetTheme?.borderColor,
            borderWidth: 2,
            pointRadius: 5,
            pointHoverRadius: 9,
            pointHitRadius: 20,
          },
        ],
      };
    }

    if (chartType === 'radar') {
      const radarLabels = Array.from(
        new Set(chartData.map((item: ChartDataItem) => `${item.name}(Total:${item.data})`))
      );

      if (groupBy.length > 0) {
        const groupByField = groupBy[0];
        const uniqueGroups = Array.from(new Set(chartData.map((item) => item[groupByField] as string)));
        const uniqueNames = Array.from(new Set(chartData.map((item) => item.name)));
        let uniqueNameDataMap: any = {};
        const datasets = uniqueGroups.map((group, index) => {
          let totalDataBasedOnGroup = 0;
          const groupData = uniqueNames.map((name) => {
            const dataPoint = chartData.find((item) => item.name === name && item[groupByField] === group);

            const data = dataPoint ? dataPoint.data : 0;
            totalDataBasedOnGroup = totalDataBasedOnGroup + data;
            if (uniqueNameDataMap[name]) {
              uniqueNameDataMap[name] = uniqueNameDataMap[name] + data;
            } else {
              uniqueNameDataMap[name] = data;
            }
            return dataPoint ? dataPoint.data : 0;
          });

          return {
            label: group,
            data: groupData,
            color: widgetTheme?.colors,
            backgroundColor: widgetTheme?.backgroundColor[index % widgetTheme?.backgroundColor.length],
            pointBackgroundColor: widgetTheme?.colors,
            pointBorderColor: widgetTheme?.borderColor,
            pointHoverBackgroundColor: widgetTheme?.backgroundColor,
            pointHoverBorderColor: widgetTheme?.borderColor,
            tension: 0.1,
            pointRadius: 5,
            pointHoverRadius: 9,
            pointHitRadius: 20,
          };
        });

        return {
          labels: uniqueNames.map((name) => `${name}(Total:${uniqueNameDataMap[name]})`),
          datasets,
        };
      }

      const values = chartData.map((item: ChartDataItem) => item.data);
      return {
        labels: radarLabels,
        datasets: [
          {
            label: chart.name,
            data: values,
            color: widgetTheme?.colors,
            backgroundColor: widgetTheme?.backgroundColor,
            pointBackgroundColor: widgetTheme?.backgroundColor,
            pointBorderColor: widgetTheme?.borderColor,
            pointHoverBackgroundColor: widgetTheme?.backgroundColor,
            pointHoverBorderColor: widgetTheme?.borderColor,
            tension: 0.1,
            pointRadius: 5,
            pointHoverRadius: 9,
            pointHitRadius: 20,
          },
        ],
      };
    }

    if (chartType === 'scatter') {
      if (groupBy.length > 0) {
        const groupByField = groupBy[0];
        const uniqueGroups = Array.from(new Set(chartData.map((item) => item[groupByField])));
        const datasets = uniqueGroups.map((group, index) => {
          const groupData = chartData
            .filter((item) => item[groupByField] === group)
            .map((item) => ({
              x: parseFloat(item.name) || 0,
              y: item.data,
            }));

          return {
            label: group,
            data: groupData,
            backgroundColor: widgetTheme?.backgroundColor[index % widgetTheme?.backgroundColor.length],
            borderColor: widgetTheme?.borderColor[index % widgetTheme?.borderColor.length],
            pointRadius: 5,
            pointHoverRadius: 9,
            pointHitRadius: 20,
          };
        });

        return {
          datasets,
        };
      } else {
        const scatterData = chartData.map((item) => ({
          x: parseFloat(item.name) || 0,
          y: item.data,
        }));

        return {
          datasets: [
            {
              label: chart.name,
              data: scatterData,
              backgroundColor: widgetTheme?.backgroundColor[0],
              borderColor: widgetTheme?.borderColor[0],
              pointRadius: 5,
              pointHoverRadius: 9,
              pointHitRadius: 20,
            },
          ],
        };
      }
    }

    if (chartType === 'multiAxis') {
      if (groupBy.length > 0) {
        const groupByField = groupBy[0];
        const uniqueGroups = Array.from(new Set(chartData.map((item) => item[groupByField])));
        const uniqueNames = Array.from(new Set(chartData.map((item) => item.name)));

        const datasets = uniqueGroups.map((group, index) => {
          const groupData = uniqueNames.map((name) => {
            const dataPoint = chartData.find((item) => item.name === name && item[groupByField] === group);
            return dataPoint ? dataPoint.data : 0;
          });

          return {
            label: group,
            data: groupData,
            borderColor: widgetTheme?.borderColor[index % widgetTheme?.borderColor.length],
            backgroundColor: widgetTheme?.backgroundColor[index % widgetTheme?.backgroundColor.length],
            tension: 0.1,
            pointRadius: 5,
            pointHoverRadius: 9,
            pointHitRadius: 20,
            yAxisID: index === 0 ? 'y' : 'y1',
          };
        });

        return {
          labels: uniqueNames,
          datasets,
        };
      } else {
        const lineLabels = Array.from(new Set(chartData.map((item: ChartDataItem) => item.name)));
        const values = chartData.map((item: ChartDataItem) => item.data);

        const secondaryValues = values.map((val, index) => val * (0.5 + Math.random() * 0.5));

        return {
          labels: lineLabels,
          datasets: [
            {
              label: chart.name,
              data: values,
              borderColor: widgetTheme?.borderColor[0],
              backgroundColor: widgetTheme?.backgroundColor[0],
              tension: 0.1,
              pointRadius: 5,
              pointHoverRadius: 9,
              pointHitRadius: 20,
              yAxisID: 'y',
            },
            {
              label: `${chart.name} (Secondary)`,
              data: secondaryValues,
              borderColor: widgetTheme?.borderColor[1] || widgetTheme?.borderColor[0],
              backgroundColor: widgetTheme?.backgroundColor[1] || widgetTheme?.backgroundColor[0],
              tension: 0.1,
              pointRadius: 5,
              pointHoverRadius: 9,
              pointHitRadius: 20,
              yAxisID: 'y1',
            },
          ],
        };
      }
    }

    if (chartType === 'area' || chartType === 'line') {
      if (groupBy.length > 0) {
        const groupByField = groupBy[0];
        const uniqueGroups = Array.from(new Set(chartData.map((item) => item[groupByField])));
        const uniqueNames = Array.from(new Set(chartData.map((item) => item.name)));
        let uniqueNameDataMap: any = {};
        const datasets = uniqueGroups.map((group, index) => {
          let totalDataBasedOnGroup = 0;
          const groupData = uniqueNames.map((name) => {
            const dataPoint = chartData.find((item) => item.name === name && item[groupByField] === group);
            const data = dataPoint ? dataPoint.data : 0;
            totalDataBasedOnGroup = totalDataBasedOnGroup + data;
            if (uniqueNameDataMap[name]) {
              uniqueNameDataMap[name] = uniqueNameDataMap[name] + data;
            } else {
              uniqueNameDataMap[name] = data;
            }

            return data;
          });
          return {
            label: `${group || chart.name}(Total:${totalDataBasedOnGroup})`,
            data: groupData,
            color: widgetTheme?.colors[index % widgetTheme?.colors.length],
            borderColor: widgetTheme?.borderColor[index % widgetTheme?.borderColor.length],
            backgroundColor: widgetTheme?.backgroundColor[index % widgetTheme?.backgroundColor.length],
            tension: 0.1,
            fill: chartType === 'area' ? 'start' : false,
            pointRadius: 5,
            pointHoverRadius: 9,
            pointHitRadius: 20,
          };
        });
        return {
          labels: uniqueNames.map((name) => `${name}(Total:${uniqueNameDataMap[name]})`),
          datasets,
        };
      } else {
        const lineLabels = Array.from(
          new Set(chartData.map((item: ChartDataItem) => `${item.name}(Total:${item.data})`))
        );
        const values = chartData.map((item: ChartDataItem) => item.data);
        return {
          labels: lineLabels,
          datasets: [
            {
              label: chart.name,
              data: values,
              color: widgetTheme?.colors[0],
              borderColor: widgetTheme?.borderColor[0],
              backgroundColor: chartType === 'area' ? widgetTheme?.backgroundColor[0] : 'transparent',
              tension: 0.1,
              fill: chartType === 'area' ? 'start' : false,
              pointRadius: 5,
              pointHoverRadius: 9,
              pointHitRadius: 20,
            },
          ],
        };
      }
    } else if (chartType === 'number') {
      //kishan
      return {
        value: chartData.length > 0 ? chartData[0].data : 0,
        label: chart.name,
        backgroundColor: '#9E9E9E', // Add background color
        textColor: '#FFFFFF', // Add text color
      };
    }

    const defaultLabels = Array.from(new Set(chartData.map((item: ChartDataItem) => item.name)));
    const values = chartData.map((item: ChartDataItem) => item.data);

    return {
      labels: defaultLabels,
      datasets: [createDefaultDataset(values)],
      isEmpty: false,
    };
  };

  const getChartOptions = (chartType: string, chart: ChartResponse) => {
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
            usePointStyle: true,
            color: widgetTheme?.legend?.labels?.color ?? theme.palette.text.primary,
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
          display: widgetTheme?.tooltip?.display ?? true,
          backgroundColor: widgetTheme?.tooltip?.backgroundColor ?? theme.palette.background.paper,
          titleColor: widgetTheme?.tooltip?.titleColor ?? theme.palette.text.primary,
          bodyColor: theme.palette.text.secondary,
          borderColor: widgetTheme?.tooltip?.borderColor ?? theme.palette.divider,
          borderWidth: widgetTheme?.tooltip?.borderWidth ?? 1,
          padding: widgetTheme?.tooltip?.padding ?? 12,
          usePointStyle: true,
          displayColors: true,
        },
      },
      layout: {
        autoPadding: true,
        padding: {
          top: widgetTheme?.layout?.padding?.top ?? 10,
          bottom: widgetTheme?.layout?.padding?.bottom ?? 10,
        },
      },
    };

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
              title: {
                color: widgetTheme?.scales?.x?.ticks?.color ?? 'grey',
                display: true,
                text: chart?.aggregation?.attributeName || 'Y-axis',
              },
              display: widgetTheme?.scales?.y?.display ?? true,
              beginAtZero: widgetTheme?.scales?.y?.beginAtZero ?? true,
              grid: {
                display: widgetTheme?.scales?.y?.grid?.display ?? false,
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
              title: {
                color: widgetTheme?.scales?.x?.ticks?.color ?? 'grey',
                display: true,
                text: chart?.dimensions?.[0] || 'X-axis',
              },
              display: widgetTheme?.scales?.x?.display ?? true,
              grid: {
                display: widgetTheme?.scales?.x?.grid?.display ?? false,
                tickColor: widgetTheme?.scales?.x?.ticks?.color ?? 'red',
              },
              ticks: {
                color: widgetTheme?.scales?.x?.ticks?.color ?? theme.palette.text.secondary,
                padding: widgetTheme?.scales?.x?.ticks?.padding ?? 8,
              },
            },
          },
          elements: {
            point: {
              radius: 7,
              hoverRadius: 9,
              hitRadius: 14,
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
              title: {
                color: widgetTheme?.scales?.x?.ticks?.color ?? 'grey',
                display: true,
                text: chart?.aggregation?.attributeName || 'Y-axis',
              },
              stacked: chartType === 'stackedBar',
            },
            x: {
              title: {
                color: widgetTheme?.scales?.x?.ticks?.color ?? 'grey',
                display: true,
                text: chart?.dimensions?.[0] || 'X-axis',
              },
              display: widgetTheme?.scales?.x?.display ?? true,
              grid: {
                display: widgetTheme?.scales?.x?.grid?.display ?? false,
                tickColor: widgetTheme?.scales?.x?.ticks?.color ?? 'red',
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
              type: 'radialLinear' as const,
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

      case 'scatter':
        return {
          ...baseOptions,
          scales: {
            y: {
              title: {
                color: widgetTheme?.scales?.x?.ticks?.color ?? 'grey',
                display: true,
                text: chart?.aggregation?.attributeName || 'Y-axis',
              },
              display: widgetTheme?.scales?.y?.display ?? true,
              beginAtZero: widgetTheme?.scales?.y?.beginAtZero ?? true,
              grid: {
                display: widgetTheme?.scales?.y?.grid?.display ?? false,
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
              title: {
                color: widgetTheme?.scales?.x?.ticks?.color ?? 'grey',
                display: true,
                text: chart?.dimensions?.[0] || 'X-axis',
              },
              display: widgetTheme?.scales?.x?.display ?? true,
              grid: {
                display: widgetTheme?.scales?.x?.grid?.display ?? false,
                tickColor: widgetTheme?.scales?.x?.ticks?.color ?? 'red',
              },
              ticks: {
                color: widgetTheme?.scales?.x?.ticks?.color ?? theme.palette.text.secondary,
                padding: widgetTheme?.scales?.x?.ticks?.padding ?? 8,
              },
            },
          },
          elements: {
            point: {
              radius: 7,
              hoverRadius: 9,
              hitRadius: 14,
            },
          },
        };

      case 'multiAxis':
        return {
          ...baseOptions,
          scales: {
            y: {
              type: 'linear' as const,
              display: widgetTheme?.scales?.y?.display ?? true,
              position: 'left' as const,
              title: {
                color: widgetTheme?.scales?.x?.ticks?.color ?? 'grey',
                display: true,
                text: chart?.aggregation?.attributeName || 'Y-axis',
              },
              grid: {
                display: widgetTheme?.scales?.y?.grid?.display ?? false,
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
            y1: {
              type: 'linear' as const,
              display: true,
              position: 'right' as const,
              title: {
                color: widgetTheme?.scales?.x?.ticks?.color ?? 'grey',
                display: true,
                text: 'Secondary Y-axis',
              },
              grid: {
                drawOnChartArea: false,
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
              title: {
                color: widgetTheme?.scales?.x?.ticks?.color ?? 'grey',
                display: true,
                text: chart?.dimensions?.[0] || 'X-axis',
              },
              display: widgetTheme?.scales?.x?.display ?? true,
              grid: {
                display: widgetTheme?.scales?.x?.grid?.display ?? false,
                tickColor: widgetTheme?.scales?.x?.ticks?.color ?? 'red',
              },
              ticks: {
                color: widgetTheme?.scales?.x?.ticks?.color ?? theme.palette.text.secondary,
                padding: widgetTheme?.scales?.x?.ticks?.padding ?? 8,
              },
            },
          },
          elements: {
            point: {
              radius: 7,
              hoverRadius: 9,
              hitRadius: 14,
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

    const dimensionField =
      Array.isArray(chart.dimensions) && chart.dimensions.length > 0
        ? chart.dimensions[0]
        : typeof chart.dimensions === 'string'
        ? chart.dimensions
        : 'name';

    const aggregationField = chart.aggregation?.attributeName || 'data';

    const chartType = chart.widgetTypeId?.chartType || 'line';
    const options = getChartOptions(chartType, chart);
    const chartId = `chart-${chart._id}`;
    const numberValue = chartData.datasets[0]?.data[0] || 0;

    if (chartData.isEmpty) {
      return (
        <Typography color="text.secondary" variant="h6">
          No data present for this set of data :|
        </Typography>
      );
    }

    const createChartProps = (chartType: string) => {
      const chartSpecificOptions = getChartOptions(chartType, chart);
      return {
        id: chartId,
        options: {
          ...chartSpecificOptions,
          onClick: (event: ChartEvent, elements: ActiveElement[]) => {
            handleChartClick(chart, elements);
          },
        },
      };
    };

    switch (chartType) {
      case 'number':
        return (
          <NumberDisplay>
            <NumberValue widgetTheme={widgetTheme}>{numberValue.toLocaleString()}</NumberValue>
            <NumberLabel>{chart.name}</NumberLabel>
          </NumberDisplay>
        );
      case 'pie':
        return (
          <Pie
            {...createChartProps(chartType)}
            data={chartData as ChartData<'pie'>}
            plugins={widgetTheme?.showLegendOverlay ? [sliceLabelsPlugin] : undefined}
            ref={(ref) => {
              chartRefs.current[chartId] = ref as ChartJS<'pie'> | null;
            }}
          />
        );
      case 'doughnut':
        return (
          <Doughnut
            {...createChartProps(chartType)}
            data={chartData as ChartData<'doughnut'>}
            ref={(ref) => {
              chartRefs.current[chartId] = ref as ChartJS<'doughnut'> | null;
            }}
            plugins={widgetTheme?.showLegendOverlay ? [sliceLabelsPlugin] : undefined}
          />
        );
      case 'multiSeriesPie':
        return (
          <Pie
            {...createChartProps(chartType)}
            data={chartData as ChartData<'pie'>}
            ref={(ref) => {
              chartRefs.current[chartId] = ref as ChartJS<'pie'> | null;
            }}
          />
        );
      case 'bar':
        return (
          <Bar
            {...createChartProps(chartType)}
            data={chartData as ChartData<'bar'>}
            plugins={widgetTheme?.showLegendOverlay ? [barLabelsPlugin] : undefined}
            ref={(ref) => {
              chartRefs.current[chartId] = ref as ChartJS<'bar'> | null;
            }}
          />
        );
      case 'stackedBar':
        return (
          <Bar
            {...createChartProps(chartType)}
            data={chartData as ChartData<'bar'>}
            plugins={widgetTheme?.showLegendOverlay ? [barLabelsPlugin] : undefined}
            ref={(ref) => {
              chartRefs.current[chartId] = ref as ChartJS<'bar'> | null;
            }}
          />
        );
      case 'scatter':
        return (
          <Scatter
            {...createChartProps(chartType)}
            data={chartData as ChartData<'scatter'>}
            plugins={widgetTheme?.showLegendOverlay ? [pointLabelsPlugin] : undefined}
            ref={(ref) => {
              chartRefs.current[chartId] = ref as ChartJS<'scatter'> | null;
            }}
          />
        );
      case 'multiAxis':
        return (
          <Line
            {...createChartProps(chartType)}
            data={chartData as ChartData<'line'>}
            plugins={widgetTheme?.showLegendOverlay ? [pointLabelsPlugin] : undefined}
            ref={(ref) => {
              chartRefs.current[chartId] = ref as ChartJS<'line'> | null;
            }}
          />
        );
      case 'radar':
        return (
          <Radar
            {...createChartProps(chartType)}
            data={chartData as ChartData<'radar'>}
            ref={(ref) => {
              chartRefs.current[chartId] = ref as ChartJS<'radar'> | null;
            }}
          />
        );
      case 'polarArea':
        return (
          <PolarArea
            id={chartId}
            options={getChartOptions(chartType, chart)}
            data={chartData as ChartData<'polarArea'>}
            plugins={widgetTheme?.showLegendOverlay ? [polarAreaLabelsPlugin] : undefined}
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
            {...createChartProps(chartType)}
            data={chartData as ChartData<'line'>}
            plugins={widgetTheme?.showLegendOverlay ? [pointLabelsPlugin] : undefined}
            ref={(ref) => {
              chartRefs.current[chartId] = ref as ChartJS<'line'> | null;
            }}
          />
        );
      case 'tabular':
        const chartDataArray = widgetData[chart._id]?.data?.widgetData || chart.data || [];

        const columns =
          chartDataArray.length > 0
            ? Object.keys(chartDataArray[0]).map((col) => {
                if (col === 'name') return dimensionField;
                if (col === 'data') return aggregationField;
                return col;
              })
            : [];

        return (
          <TableContainer
            component={Paper}
            sx={{
              ...getTableSx(),
              maxHeight: 400,
              overflow: 'auto',
              backgroundColor: themeUnified.palette.background.paper || STYLE_GUIDE.COLORS.white,
            }}
          >
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  {columns.map((column) => (
                    <TableCell
                      key={column}
                      sx={{
                        backgroundColor:
                          themeUnified.palette.table?.headerBackground || STYLE_GUIDE.COLORS.backgroundLightGray,
                        fontWeight: STYLE_GUIDE.TYPOGRAPHY.fontWeight.semiBold,
                        fontSize: '14px',
                        color: themeUnified.palette.table?.headerText || STYLE_GUIDE.COLORS.textGray,
                        borderBottom: `2px solid ${themeUnified.palette.divider}`,
                        padding: '12px 16px',
                      }}
                    >
                      {column}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {chartDataArray?.map((row, rowIndex) => (
                  <TableRow
                    key={rowIndex}
                    sx={{
                      backgroundColor:
                        rowIndex % 2 === 0
                          ? themeUnified.palette.table?.rowEvenBackground || STYLE_GUIDE.COLORS.white
                          : themeUnified.palette.table?.rowOddBackground || STYLE_GUIDE.COLORS.backgroundDefault,
                      '&:hover': {
                        backgroundColor:
                          themeUnified.palette.table?.rowHoverBackground || STYLE_GUIDE.COLORS.backgroundHover,
                      },
                    }}
                  >
                    {columns.map((column) => {
                      let value;
                      if (column === dimensionField && 'name' in row) value = row['name'];
                      else if (column === aggregationField && 'data' in row) value = row['data'];
                      else value = row[column];

                      return (
                        <TableCell
                          key={`${rowIndex}-${column}`}
                          sx={{
                            padding: '12px 16px',
                            borderBottom: `1px solid ${themeUnified.palette.divider}`,
                            color: themeUnified.palette.table?.rowText || STYLE_GUIDE.COLORS.textDarkGray,
                          }}
                        >
                          {typeof value === 'number' ? value.toLocaleString() : value}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
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
          <StyledTableContainer sx={{ flex: 1, overflow: 'auto', ...getTableSx() }}>
            <DrillDownTable>
              <TableHead>
                <TableRow>
                  {columns.map((column) => (
                    <TableCell
                      key={column}
                      sx={{
                        fontWeight: STYLE_GUIDE.TYPOGRAPHY.fontWeight.semiBold,
                        backgroundColor:
                          themeUnified.palette.table?.headerBackground || STYLE_GUIDE.COLORS.backgroundLightGray,
                        color: themeUnified.palette.table?.headerText || STYLE_GUIDE.COLORS.textGray,
                      }}
                    >
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
                    <TableRow
                      key={index}
                      sx={{
                        backgroundColor:
                          index % 2 === 0
                            ? themeUnified.palette.table?.rowEvenBackground || STYLE_GUIDE.COLORS.white
                            : themeUnified.palette.table?.rowOddBackground || STYLE_GUIDE.COLORS.backgroundDefault,
                        '&:hover': {
                          backgroundColor:
                            themeUnified.palette.table?.rowHoverBackground || STYLE_GUIDE.COLORS.backgroundHover,
                        },
                      }}
                    >
                      {columns.map((column) => (
                        <TableCell
                          key={column}
                          sx={{
                            color: themeUnified.palette.table?.rowText || STYLE_GUIDE.COLORS.textDarkGray,
                          }}
                        >
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

  const handleDownload = (chart: ChartResponse) => {
    const chartType = chart.widgetTypeId?.chartType || 'line';

    if (chartType === 'tabular') {
      const chartDataArray = widgetData[chart._id]?.data?.widgetData || chart.data || [];
      if (chartDataArray.length === 0) {
        toast.error('No data available to download');
        return;
      }

      // Convert data to CSV
      const columns = Object.keys(chartDataArray[0]);
      const csvContent = [
        columns.join(','),
        ...chartDataArray.map((row) =>
          columns
            .map((column) => {
              const value = row[column];
              return typeof value === 'number' ? value : `"${value}"`;
            })
            .join(',')
        ),
      ].join('\n');

      // Create and trigger download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `${chart.name || 'chart'}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      return;
    }

    const chartInstance = chartRefs.current[`chart-${chart._id}`];
    if (!chartInstance) {
      toast.error('Chart instance not found');
      return;
    }
  };

  return (
    //kishan
    <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
      <MetricCards
        metrics={allCharts
          ?.filter((chart: any) => chart.widgetTypeId?.chartType === 'number')
          .map((chart: any) => getChartData(chart))}
      />
      <div>
        <Grid
          container
          spacing={STYLE_GUIDE.SPACING.s4}
          sx={{
            height: '100%',
            alignContent: 'flex-start',
            p: STYLE_GUIDE.SPACING.s6,
            '& .MuiGrid-item': {
              display: 'flex',
              '& > *': {
                width: '100%',
              },
            },
          }}
        >
          {allCharts
            ?.filter((chart: any) => chart.widgetTypeId?.chartType !== 'number')
            .map((chart: any) => (
              <>
                <Grid
                  item
                  xs={12}
                  md={
                    isAddChartModalOpen || isEditChartModalOpen
                      ? 12
                      : gridColumns === 1
                      ? 12
                      : gridColumns === 2
                      ? 6
                      : 4
                  }
                >
                  <StyledCard sx={{ ...getCardSx() }}>
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
                            : (chart.widgetTypeId?.chartType || 'line') === 'horizontalBar'
                            ? 'horizontal-bar-chart'
                            : (chart.widgetTypeId?.chartType || 'line') === 'tabular'
                            ? 'table-chart'
                            : (chart.widgetTypeId?.chartType || 'line') === 'multiSeriesPie'
                            ? 'pie-chart'
                            : 'line-chart'
                        }
                        onWheel={handleWheel}
                      >
                        {renderChart(chart)}
                      </ChartContainer>
                      <Box sx={{ mt: 'auto', textAlign: 'right', fontWeight: 'bold', color: 'primary.main' }}>
                        Total:{widgetData[chart._id]?.data?.totalCount}
                      </Box>
                    </CardContent>
                  </StyledCard>
                </Grid>
              </>
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
      </div>
    </Box>
  );
};
