import React, { useEffect, useState, useRef } from "react";
import { useAppDispatch, useAppSelector } from "../../../storeHooks";
import {
  fetchChartData,
  deleteWidget,
  fetchIndividualWidgetData,
  fetchDashboardList,
  saveWidgets,
} from "../dashboardActions";
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
} from "@mui/material";
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
} from "chart.js";
import {
  Line,
  Pie,
  Bar,
  Doughnut,
  Radar,
  PolarArea,
  Chart,
} from "react-chartjs-2";
import {
  ChartDataItem,
  ChartGridProps,
  ChartResponse,
  Dashboard,
  DrillDownPayload,
} from "../types";
import { styled } from "@mui/material/styles";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import FullscreenIcon from "@mui/icons-material/Fullscreen";
import CloseIcon from "@mui/icons-material/Close";
import ImageIcon from "@mui/icons-material/Image";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import DownloadIcon from "@mui/icons-material/Download";
import TableChartIcon from "@mui/icons-material/TableChart";
import { toast } from "react-toastify";
import jsPDF from "jspdf";
import axiosInstance from "../../../services/axiosInstance";
import { Theme } from "../../createTheme/types";

import { AddChartModal, ChartFormData } from "./AddChartModal";
import { resetChartAndWidgetData } from "../dashboardReducer";
import { SaveWidgetModel } from "../../naturalLanguage/saveWidgetModel";
import { STYLE_GUIDE } from "../../../styles";
import { useUnifiedTheme } from "../../../hooks/useUnifiedTheme";
import { useComponentTypography } from "../../../hooks/useComponentTypography";

// Register ChartJS components
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

const StyledCard = styled(Card)(({ theme }) => ({
  height: "100%",
  minHeight: 500,
  display: "flex",
  flexDirection: "column",
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[1],
  transition: "all 0.3s ease-in-out",
  backgroundColor: theme.palette.background.paper,
  border: `1px solid ${theme.palette.divider}`,
  "&:hover": {
    boxShadow: theme.shadows[3],
    transform: "translateY(-2px)",
  },
}));

const NumberCard = styled(Card, {
  shouldForwardProp: (prop) => prop !== "backgroundColor",
})<{ backgroundColor: string }>(({ theme, backgroundColor }) => ({
  height: 110,
  display: "flex",
  flexDirection: "column",
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[1],
  transition: "all 0.3s ease-in-out",
  backgroundColor: backgroundColor, // Use dynamic background color
  // border: `1px solid ${theme.palette.divider}`,
  overflow: "hidden",
  "&:hover": {
    boxShadow: theme.shadows[3],
    transform: "translateY(-2px)",
  },
}));
const ChartTitle = styled(Typography)(({ theme }) => ({
  fontSize: STYLE_GUIDE.TYPOGRAPHY.fontSize.large,
  fontWeight: STYLE_GUIDE.TYPOGRAPHY.fontWeight.semiBold,
  color: theme.palette.text.primary,
  marginBottom: theme.spacing(2),
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: theme.spacing(1),
}));

const ChartContainer = styled(Box)(({ theme }) => ({
  flex: 1,
  height: "100%",
  backgroundColor: "#ffffff",
  borderRadius: theme.shape.borderRadius,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  position: "relative",
  overflow: "auto",
  "& canvas": {
    width: "100% !important",
    height: "100% !important",
  },
  "&.pie-chart": {
    minHeight: 450,
    "& canvas": {
      maxWidth: "95% !important",
      maxHeight: "95% !important",
    },
  },
  "&.line-chart": {
    minHeight: 500,
    padding: theme.spacing(4, 2, 6, 4),
    "& canvas": {
      maxWidth: "98% !important",
      maxHeight: "90% !important",
    },
  },
  "&.horizontal-bar-chart": {
    minHeight: 450,
    "& canvas": {
      maxWidth: "98% !important",
      maxHeight: "90% !important",
    },
  },
  "&.combo-chart": {
    minHeight: 450,
    padding: theme.spacing(2),
    "& canvas": {
      maxWidth: "98% !important",
      maxHeight: "90% !important",
    },
  },
  "&.number-chart": {
    flexDirection: "column",
    gap: theme.spacing(2),
  },
  "&.table-chart": {
    minHeight: 400,
    padding: theme.spacing(2),
    overflow: "auto",
    "& .MuiTableContainer-root": {
      height: "100%",
      width: "100%",
      overflow: "auto",
    },
  },
  "&:hover": {
    overflow: "hidden",
  },
  "&::-webkit-scrollbar": {
    width: "8px",
    height: "8px",
  },
  "&::-webkit-scrollbar-thumb": {
    backgroundColor: theme.palette.divider,
    borderRadius: "4px",
  },
}));

const LoadingContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  minHeight: "400px",
  backgroundColor: "#ffffff",
  borderRadius: "12px",
  border: `1px solid ${theme.palette.divider}`,
}));

const ErrorContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  minHeight: "400px",
  backgroundColor: "#ffffff",
  borderRadius: "12px",
  border: `1px solid ${theme.palette.divider}`,
}));

const EmptyContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  minHeight: "400px",
  backgroundColor: "#ffffff",
  borderRadius: "12px",
  border: `1px solid ${theme.palette.divider}`,
}));

const FullScreenModal = styled(Dialog)(({ theme }) => ({
  "& .MuiDialog-paper": {
    margin: theme.spacing(2),
    width: "calc(100% - 32px)",
    height: "calc(100% - 32px)",
    maxWidth: "calc(100% - 32px)",
    maxHeight: "calc(100% - 32px)",
    borderRadius: "12px",
  },
}));

const FullScreenChartContainer = styled(Box)(({ theme }) => ({
  height: "100%",
  padding: theme.spacing(3),
  backgroundColor: "#f8f9fa",
  display: "flex",
  flexDirection: "column",
  "& canvas": {
    flexGrow: 1,
    padding: theme.spacing(1),
  },
}));

const DrillDownDialog = styled(Dialog)({
  "& .MuiDialog-paper": {
    width: "calc(100% - 32px)",
    height: "calc(100% - 32px)",
    margin: 16,
    maxWidth: "calc(100% - 32px)",
    maxHeight: "calc(100% - 32px)",
  },
});

const DrillDownTable = styled(Table)(({ theme }) => ({
  "& .MuiTableCell-root": {
    padding: theme.spacing(1.5),
    fontSize: "0.875rem",
  },
  "& .MuiTableHead-root": {
    backgroundColor: theme.palette.background.default,
    "& .MuiTableCell-root": {
      fontWeight: 600,
      color: theme.palette.text.primary,
      borderBottom: `2px solid ${theme.palette.divider}`,
    },
  },
  "& .MuiTableBody-root": {
    "& .MuiTableRow-root": {
      transition: "background-color 0.2s",
      "&:hover": {
        backgroundColor: theme.palette.action.hover,
      },
      "&:last-child td": {
        borderBottom: 0,
      },
    },
    "& .MuiTableCell-root": {
      color: theme.palette.text.secondary,
      borderBottom: `1px solid ${theme.palette.divider}`,
    },
  },
}));

const StyledTableContainer = styled(Paper)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[1],
  overflow: "hidden",
}));

const ChartTitleText = styled(Typography)({
  flexGrow: 1,
});

export const ChartGrid: React.FC<ChartGridProps> = ({
  dashboardId,
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
  dashboardFilters,
}) => {
  const dispatch = useAppDispatch();
  const theme = useTheme();
  const themeUnified = useUnifiedTheme();
  const { getTableSx, getCardSx } = useComponentTypography();
  const chartRefs = useRef<{ [key: string]: ChartJS | null }>({});
  const {
    charts,
    widgetTypes,
    temporaryCharts,
    chartsLoading,
    chartsError,
    widgetData,
    dashboards,
  } = useAppSelector((state) => ({
    charts: state.dashboard.charts,
    temporaryCharts: state.dashboard.temporaryCharts,
    chartsLoading: state.dashboard.chartsLoading,
    chartsError: state.dashboard.chartsError,
    widgetData: state.dashboard.widgetData,
    widgetTypes: state.dashboard.widgetTypes,
    dashboards: state.dashboard.dashboards || [],
  }));

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedChart, setSelectedChart] = useState<ChartResponse | null>(
    null
  );
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [fullViewOpen, setFullViewOpen] = useState(false);
  const [exportMenuAnchorEl, setExportMenuAnchorEl] =
    useState<null | HTMLElement>(null);
  const [drillDownOpen, setDrillDownOpen] = useState(false);
  const [drillDownData, setDrillDownData] = useState<ChartDataItem[]>([]);
  const [drillDownTitle, setDrillDownTitle] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [, setTotalRecords] = useState(0);
  const [isDrillDownLoading, setIsDrillDownLoading] = useState(false);
  const [drillDownPayload, setDrillDownPayload] =
    useState<DrillDownPayload | null>(null);

  const [openSaveChart, setOpenSaveChart] = useState(false);
  const [chartSaveSettingData, setChartSaveSettingData] = useState<any>({});
  const [chartSaveDashboardId, setChartSaveDashboardId] = useState("");
  const [newSaveChartName, setNewSaveChartName] = useState("");
  const [isChartSaving, setIsChartSaving] = useState(false);
  const itemsPerPage = 10;

  const allCharts = [...charts, ...temporaryCharts];
  const numberCharts = allCharts.filter(
    (chart) => chart.widgetTypeId?.chartType === "number"
  );
  const otherCharts = allCharts.filter(
    (chart) => chart.widgetTypeId?.chartType !== "number"
  );

  const bottomRef: any = isNaturalLangauage
    ? useRef<HTMLDivElement | null>(null)
    : "";

  useEffect(() => {
    if (isNaturalLangauage) {
      bottomRef?.current?.scrollIntoView({ behavior: "smooth" });
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
        dispatch(fetchChartData({ dashboardId, dashboardFilters }));
      }
    }
  }, [dispatch, dashboardId, dashboardFilters]);

  const handleMenuClick = (
    event: React.MouseEvent<HTMLElement>,
    chart: ChartResponse
  ) => {
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
        toast.success("Chart deleted successfully!");
        dispatch(fetchChartData({ dashboardId, dashboardFilters }));
      } else {
        toast.error(result.message || "Failed to delete chart");
      }
    } catch (error) {
      if (typeof error === "object" && error !== null && "message" in error) {
        toast.error(error.message as string);
      } else {
        toast.error("Failed to delete chart");
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

  const handleExportImage = async (format: "png" | "jpg") => {
    if (!selectedChart) return;

    try {
      const chartId = `chart-${selectedChart._id}`;
      const chartInstance = chartRefs.current[chartId];

      if (!chartInstance) {
        toast.error("Chart instance not found");
        return;
      }

      const dataUrl = chartInstance.toBase64Image();
      const link = document.createElement("a");
      link.download = `${selectedChart.name}.${format}`;
      link.href = dataUrl;
      link.click();

      toast.success(`Chart exported as ${format.toUpperCase()} successfully!`);
    } catch (error) {
      toast.error("Failed to export chart");
      console.error("Export error:", error);
    }
  };

  const handleExportPDF = async () => {
    if (!selectedChart) return;

    try {
      const chartId = `chart-${selectedChart._id}`;
      const chartInstance = chartRefs.current[chartId];

      if (!chartInstance) {
        toast.error("Chart instance not found");
        return;
      }

      const imgData = chartInstance.toBase64Image();
      const pdf = new jsPDF("landscape");
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${selectedChart.name}.pdf`);

      toast.success("Chart exported as PDF successfully!");
    } catch (error) {
      toast.error("Failed to export chart as PDF");
      console.error("PDF export error:", error);
    }
  };

  const handleExportData = () => {
    if (!selectedChart) return;

    try {
      const chartData = getChartData(selectedChart);
      const { labels, datasets } = chartData;

      let csvContent = "data:text/csv;charset=utf-8,";

      const headers = [
        "Category",
        ...datasets.map((dataset, i) =>
          "label" in dataset
            ? (dataset as { label: string }).label
            : `Series ${i + 1}`
        ),
      ];
      csvContent += headers.join(",") + "\n";

      labels.forEach((label, index) => {
        const row = [label, ...datasets.map((dataset) => dataset.data[index])];
        csvContent += row.join(",") + "\n";
      });

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `${selectedChart.name}_data.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success("Chart data exported successfully!");
    } catch (error) {
      console.error("Error exporting data:", error);
      toast.error("Failed to export chart data");
    }
  };

  const handleExportMenuClick = (
    event: React.MouseEvent<HTMLElement>,
    chart: ChartResponse
  ) => {
    event.stopPropagation();
    if (chart.widgetTypeId?.chartType === "tabular") {
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

  const handleChartClick = async (
    chart: ChartResponse,
    elements: ActiveElement[]
  ) => {
    if (!elements || !elements.length) return;

    setSelectedChart(chart);

    const clickedElement = elements[0];
    const chartData =
      widgetData[chart._id]?.data?.widgetData || chart.data || [];

    const clickedData = chartData?.find((item: ChartDataItem) => {
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
        console.log("Clicked Data:", chart.groupBy);

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
            ? [{ versionValue: clickedData.name }]
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

        const response = await axiosInstance.post(
          "/common/dataSource/getWidgetDataByFilter",
          payload
        );

        if (response.data.success) {
          setDrillDownData(response.data.data);
          setTotalPages(response.data.pagination.totalPages);
          setTotalRecords(response.data.pagination.totalRecords);
        } else {
          toast.error(response.data.message || "Failed to fetch detailed data");
        }
      } catch (error) {
        console.error("Error fetching detailed data:", error);
        toast.error("Failed to fetch detailed data");
      } finally {
        setIsDrillDownLoading(false);
      }
    }
  };

  const handleDrillDownClose = () => {
    setDrillDownOpen(false);
    setDrillDownData([]);
    setDrillDownTitle("");
    setDrillDownPayload(null);
  };

  const handlePageChange = async (
    event: React.ChangeEvent<unknown>,
    value: number
  ) => {
    if (!selectedChart || !drillDownPayload) return;

    try {
      const payload = {
        ...drillDownPayload,
        page: value,
      };

      const response = await axiosInstance.post(
        "/common/dataSource/getWidgetDataByFilter",
        payload
      );

      if (response.data.success) {
        setDrillDownData(response.data.data);
        setTotalPages(response.data.pagination.totalPages);
        setTotalRecords(response.data.pagination.totalRecords);
        setCurrentPage(value);
      } else {
        toast.error(response.data.message || "Failed to fetch detailed data");
      }
    } catch (error) {
      console.error("Error fetching detailed data:", error);
      toast.error("Failed to fetch detailed data");
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
      chartType: widgetTypes?.find(
        (data) => data?._id === formData.widgetTypeId
      )?.chartType,
    };

    await dispatch(fetchIndividualWidgetData(newFormData));
  };

  const handleSaveWidget = async () => {
    setIsChartSaving(true);
    try {
      const result = await dispatch(
        saveWidgets({
          widgets: [
            {
              dashboardId: chartSaveDashboardId,
              widgetTypeId: chartSaveSettingData.widgetTypeId?._id || "",
              name: newSaveChartName,
              dimensions: chartSaveSettingData.dimensions.join(","),
              groupBy: chartSaveSettingData.groupBy,
              aggregation: chartSaveSettingData.aggregation,
              position: chartSaveSettingData.position || {
                x: 0,
                y: 0,
                index: 0,
              },
              conditions: chartSaveSettingData.conditions,
              dataSourceId:
                chartSaveSettingData.dataSourceId?._id ||
                chartSaveSettingData.dataSourceId,
              entityId:
                chartSaveSettingData.dataSourceId?.entityId ||
                chartSaveSettingData.entityId,
              isIncremental: chartSaveSettingData.isIncremental || false,
            },
          ],
        })
      ).unwrap();

      if (result.success) {
        toast.success("Charts saved successfully!");
        setOpenSaveChart(false);
        setIsChartSaving(false);
      } else {
        toast.error(result.message || "Failed to save charts");
        setIsChartSaving(false);
      }
    } catch (error) {
      if (typeof error === "object" && error !== null && "message" in error) {
        toast.error(error.message as string);
      } else {
        toast.error("Failed to save charts");
      }
      setIsChartSaving(false);
    }
  };

  // SABIC Brand Colors
  const SABIC_COLORS = [
    "#009FDF", // SABIC Cyan
    "#FFCD00", // SABIC Orange
    "#333333", // Neutral Dark Gray
    "#004B87", // SABIC Blue
  ];
  function resolveGroupField(groupBy: string[], chart: any): string {
    if (!groupBy || groupBy.length === 0) return "";
    const groupFieldKey = groupBy[0];

    const matchedField = chart?.dataSourceId?.fieldSettings?.find(
      (f: any) => f.mappedAttributeName === groupFieldKey
    );

    return matchedField ? matchedField.label : groupFieldKey;
  }

  const SABIC_COLORS_NUMBER = ["#939598", "#FFCD00", "#009FDF"];

  // Helper: pick color by index
  const getColor = (index: number) => SABIC_COLORS[index % SABIC_COLORS.length];

  const getChartData = (chart: ChartResponse) => {
    const chartData =
      widgetData[chart._id]?.data?.widgetData || chart.data || [];
    const chartType = chart.widgetTypeId?.chartType || "line";
    const groupBy = chart.groupBy || [];

    // Check for empty data
    if (
      !chartData.length ||
      chartData.every((item: ChartDataItem) => item.data === 0)
    ) {
      return {
        labels: [],
        datasets: [{ label: chart.name, data: [] }],
        isEmpty: true,
      };
    }

    // Universal data processor based on chart type
    switch (chartType) {
      case "line":
      case "area":
        return processLineAreaData(
          chartData,
          groupBy,
          chartType === "area",
          chart,
          ""
        );

      case "verticalBar":
      case "horizontalBar":
      case "stackedBar":
      case "multiSeriesBar":
        return processBarData(chartData, groupBy, chartType, chart);

      case "pie":
      case "doughnut":
      case "multiSeriesPie":
        return processPieData(chartData, groupBy);

      case "radar":
        return processRadarData(chartData, groupBy, chart);

      case "scatter":
        return processScatterData(chartData, groupBy, chart);

      case "bubble":
        return processBubbleData(chartData, groupBy, chart);

      case "polarArea":
        return processPieData(chartData, groupBy);

      // return processPolarAreaData(chartData, groupBy);

      // case "comboBarLine":
      // case "stackedBarLine":
      //   return processComboData(chartData, groupBy, chartType, chart);

      case "comboBarLine":
        return processComboData(chartData, groupBy, chartType, chart);
      case "stackedBarLine":
        return processStackedComboData(chartData, groupBy, chartType, chart);

      case "histogram":
        return processHistogramData(chartData);

      case "timeSeries":
        return processTimeSeriesData(chartData, groupBy);

      case "tabular":
        return {
          data: chartData,
          columns: chartData.length > 0 ? Object.keys(chartData[0]) : [],
        };

      default:
        return processLineAreaData(chartData, groupBy, false, chart, "");
    }

    // ===== Helper Functions =====

    function processLineAreaData(
      data: any[],
      groupBy: string[],
      isArea: boolean,
      chart: any,
      timePeriodLabel: string
    ) {
      const labels = Array.from(new Set(data.map((item) => item.name)));

      if (!groupBy || groupBy.length === 0) {
        // Create one dataset with data for each SBU
        const dataset = {
          label: timePeriodLabel || "Data",
          data: labels.map((label) => {
            const item = data.find((d) => d.name === label);
            return item ? item.data : 0;
          }),
          borderColor: getColor(0),
          backgroundColor: isArea ? getColor(0) + "33" : "transparent",
          fill: isArea ? "start" : false,
          tension: 0.4,
          pointRadius: 5,
          pointHoverRadius: 8,
        };

        return { labels, datasets: [dataset] };
      }

      const groupFieldKey = groupBy[0];

      // Find the field settings for the groupBy field to get the display label
      const matchedField = chart.dataSourceId.fieldSettings?.find(
        (f: any) => f.mappedAttributeName === groupFieldKey
      );

      // Use the field label if found, otherwise use the key
      const groupField = matchedField ? matchedField.label : groupFieldKey;

      // Get all unique group values (e.g., Attorney names)
      const uniqueGroups = Array.from(
        new Set(data.map((item) => item[groupField] || "Unknown"))
      );

      // Create a dataset for each group
      const datasets = uniqueGroups.map((group, index) => {
        // For each SBU (label), get the data point for this group
        const groupData = labels.map((label) => {
          const dataPoint = data.find(
            (item) =>
              item.name === label && (item[groupField] || "Unknown") === group
          );
          return dataPoint ? dataPoint.data : 0;
        });

        return {
          label: group,
          data: groupData,
          borderColor: getColor(index),
          backgroundColor: isArea ? getColor(index) + "33" : "transparent",
          fill: isArea ? "start" : false,
          tension: 0.4,
          pointRadius: 5,
          pointHoverRadius: 8,
        };
      });

      return { labels, datasets };
    }

    function processBarData(
      data: any[],
      groupBy: string[],
      chartType: string,
      chart: any
    ) {
      const labels = Array.from(new Set(data.map((item) => item.name)));

      if (!groupBy || groupBy.length === 0) {
        const datasets = data.map((item, i) => {
          return {
            label: item.name,
            data: labels.map((lbl) => (lbl === item.name ? item.data : 0)),
            backgroundColor: getColor(i),
            borderColor: "#009FDF",
            borderWidth: 1,
            borderRadius: 4,
          };
        });

        return { labels, datasets };
      }

      const groupFieldKey = groupBy[0];

      const matchedField = chart.dataSourceId.fieldSettings?.find(
        (f: any) => f.mappedAttributeName === groupFieldKey
      );

      const groupField = matchedField ? matchedField.label : groupFieldKey;

      const uniqueGroups = Array.from(
        new Set(data.map((item) => item[groupField]).filter(Boolean))
      );

      const datasets = uniqueGroups.map((group, i) => {
        const values = labels.map((label) => {
          const found = data?.find(
            (item) => item?.name === label && item[groupField] === group
          );
          return found ? found.data : 0;
        });
        if (groupFieldKey == "ActionDue.ReportCriticalEvent") {
          group = group == "Y" ? "Critical" : "Other";
        }
        return {
          label: group,
          data: values,
          backgroundColor: getColor(i),
          borderColor: "#009FDF",
          borderWidth: 1,
          borderRadius: 4,
        };
      });

      return { labels, datasets };
    }

    interface PieItem {
      name: string;
      data?: number;
      [key: string]: any;
    }

    function processPieData(
      data: PieItem[],
      groupBy: string[] = [],
      chart?: any
    ) {
      const labels = Array.from(new Set(data.map((item) => item.name)));

      if (!groupBy || groupBy.length === 0) {
        const values = labels?.map((label) => {
          const found = data?.find((item) => item?.name === label);
          return found?.data ?? 0;
        });

        const attributeFieldKey = chart?.aggregation?.attributeName;

        const matchedAttributeField = chart?.dataSourceId.fieldSettings?.find(
          (f: any) => f.mappedAttributeName === attributeFieldKey
        );

        const groupAttributeField = matchedAttributeField
          ? matchedAttributeField.label
          : attributeFieldKey;

        return {
          labels,
          datasets: [
            {
              label:
                groupAttributeField ||
                chart?.aggregation?.attributeName ||
                chart?.name ||
                "Count",
              data: values,
              backgroundColor: labels.map((_, i) => getColor(i)),
              borderColor: "#FFFFFF",
              borderWidth: 2,
            },
          ],
        };
      }

      const groupField = resolveGroupField(groupBy, chart);
      const uniqueGroups = Array.from(
        new Set(data.map((item) => item[groupField] ?? "Unknown"))
      );

      const datasets = uniqueGroups.map((group, groupIndex) => {
        const values = labels?.map((label) => {
          const found = data?.find(
            (item) =>
              item.name === label && (item[groupField] ?? "Unknown") === group
          );
          return found?.data ?? 0;
        });

        return {
          label: group,
          data: values,
          backgroundColor: labels.map((_, i) => getColor(i + groupIndex * 5)),
          borderColor: "#FFFFFF",
          borderWidth: 2,
        };
      });

      return { labels, datasets };
    }

    function processRadarData(data: any[], groupBy: string[], chart: any) {
      const labels = Array.from(new Set(data.map((item) => item.name)));

      if (!groupBy || groupBy.length === 0) {
        const values = data.map((item) => item.data);
        const attributeFieldKey = chart?.aggregation?.attributeName;

        const matchedAttributeField = chart?.dataSourceId.fieldSettings?.find(
          (f: any) => f.mappedAttributeName === attributeFieldKey
        );

        const groupAttributeField = matchedAttributeField
          ? matchedAttributeField.label
          : attributeFieldKey;

        return {
          labels,
          datasets: [
            {
              label:
                groupAttributeField ||
                chart?.aggregation?.attributeName ||
                chart?.name ||
                "Count",
              data: values,
              backgroundColor: getColor(0) + "33",
              borderColor: getColor(0),
              pointBackgroundColor: getColor(0),
              pointBorderColor: "#fff",
            },
          ],
        };
      }

      const groupField = resolveGroupField(groupBy, chart);
      const uniqueGroups = Array.from(
        new Set(data.map((item) => item[groupField]).filter(Boolean))
      );

      const datasets = uniqueGroups.map((group, i) => {
        const values = labels?.map((label) => {
          const found = data?.find(
            (item) => item.name === label && item[groupField] === group
          );
          return found ? found.data : 0;
        });

        return {
          label: group,
          data: values,
          backgroundColor: getColor(i) + "33",
          borderColor: getColor(i),
          pointBackgroundColor: getColor(i),
          pointBorderColor: "#fff",
        };
      });

      return { labels, datasets };
    }

    function processScatterData(data: any[], groupBy: string[], chart: any) {
      if (!groupBy || groupBy.length === 0) {
        const scatterData = data.map((item, index) => ({
          x: item.x ?? index,
          y: item.y ?? item.data,
        }));

        const attributeFieldKey = chart?.aggregation?.attributeName;

        const matchedAttributeField = chart?.dataSourceId.fieldSettings?.find(
          (f: any) => f.mappedAttributeName === attributeFieldKey
        );

        const groupAttributeField = matchedAttributeField
          ? matchedAttributeField.label
          : attributeFieldKey;
        return {
          datasets: [
            {
              label:
                groupAttributeField ||
                chart?.aggregation?.attributeName ||
                chart?.name ||
                "Count",
              data: scatterData,
              backgroundColor: getColor(0),
              borderColor: getColor(0),
            },
          ],
        };
      }

      const groupField = resolveGroupField(groupBy, chart);
      const uniqueGroups = Array.from(
        new Set(data.map((item) => item[groupField]).filter(Boolean))
      );

      const datasets = uniqueGroups.map((group, i) => {
        const groupData = data
          .filter((item) => item[groupField] === group)
          .map((item, index) => ({
            x: item.x ?? index,
            y: item.y ?? item.data,
          }));

        return {
          label: group,
          data: groupData,
          backgroundColor: getColor(i),
          borderColor: getColor(i),
        };
      });

      return { datasets };
    }

    interface BubbleItem {
      x?: number;
      y?: number;
      r?: number;
      data?: number;
      [key: string]: any;
    }

    function processBubbleData(
      data: BubbleItem[],
      groupBy: string[] = [],
      chart: any
    ) {
      if (!groupBy || groupBy.length === 0) {
        const bubbleData = data.map((item, index) => ({
          x: item.x ?? index,
          y: item.y ?? item.data ?? 0,
          r: item.r ?? Math.max(5, (item.data ?? 0) / 10),
        }));

        return {
          datasets: [
            {
              label: chart.name,
              data: bubbleData,
              backgroundColor: getColor(2) + "99",
              borderColor: getColor(0),
            },
          ],
        };
      }

      const groupField = resolveGroupField(groupBy, chart);
      const uniqueGroups = Array.from(
        new Set(data.map((item) => item[groupField] ?? "Unknown"))
      );

      const datasets = uniqueGroups.map((group, index) => {
        const groupData = data
          .filter((item) => (item[groupField] ?? "Unknown") === group)
          .map((item, i) => ({
            x: item.x ?? i,
            y: item.y ?? item.data ?? 0,
            r: item.r ?? Math.max(5, (item.data ?? 0) / 10),
          }));

        return {
          label: group,
          data: groupData,
          backgroundColor: getColor(index + 2) + "99",
          borderColor: getColor(index),
        };
      });

      return { datasets };
    }

    function processComboData(
      data: any[],
      groupBy: string[],
      chartType: string,
      chart: any
    ) {
      const labels = Array.from(new Set(data.map((item) => item.name)));

      if (!groupBy || groupBy.length === 0) {
        const barDatasets = data.map((item, i) => {
          return {
            type: "bar",
            label: item.name,
            data: labels.map((lbl) => (lbl === item.name ? item.data : 0)),
            backgroundColor: getColor(i),
            borderColor: "#FFFFFF",
            borderWidth: 1,
            borderRadius: 4,
            yAxisID: "y",
          };
        });

        const totals = labels?.map((label) => {
          const found = data?.find((item) => item.name === label);
          return found ? found.data : 0;
        });

        const attributeFieldKey = chart?.aggregation?.attributeName;

        const matchedAttributeField = chart?.dataSourceId.fieldSettings?.find(
          (f: any) => f.mappedAttributeName === attributeFieldKey
        );

        const groupAttributeField = matchedAttributeField
          ? matchedAttributeField.label
          : attributeFieldKey;

        const lineDataset = {
          type: "line",
          label: `${groupAttributeField || chart?.aggregation?.attributeName || chart?.name || "Total"}`,
          data: totals,
          borderColor: getColor(data.length),
          backgroundColor: "transparent",
          yAxisID: "y1",
          tension: 0.4,
          fill: false,
          pointRadius: 5,
          pointHoverRadius: 8,
        };

        return {
          labels,
          datasets: [...barDatasets, lineDataset],
        };
      }

      const groupFieldKey = groupBy[0];

      const matchedField = chart?.dataSourceId.fieldSettings?.find(
        (f: any) => f.mappedAttributeName === groupFieldKey
      );

      const groupField = matchedField ? matchedField.label : groupFieldKey;

      const uniqueGroups = Array.from(
        new Set(data?.map((item) => item[groupField]).filter(Boolean))
      );

      const barDatasets = uniqueGroups.map((group, i) => {
        const values = labels?.map((label) => {
          const found = data?.find(
            (item) => item?.name === label && item[groupField] === group
          );
          return found ? found.data : 0;
        });

        return {
          type: "bar",
          label: group,
          data: values,
          backgroundColor: getColor(i),
          borderColor: "#FFFFFF",
          borderWidth: 1,
          borderRadius: 4,
          yAxisID: "y",
        };
      });

      const totals = labels?.map((label) => {
        return uniqueGroups?.reduce((sum, group) => {
          const found = data?.find(
            (item) => item.name === label && item[groupField] === group
          );
          return sum + (found ? found.data : 0);
        }, 0);
      });

      const attributeFieldKey = chart?.aggregation?.attributeName;

      const matchedAttributeField = chart?.dataSourceId.fieldSettings?.find(
        (f: any) => f.mappedAttributeName === attributeFieldKey
      );

      const groupAttributeField = matchedAttributeField
        ? matchedAttributeField.label
        : attributeFieldKey;
      const lineDataset = {
        type: "line",
        label: `${groupAttributeField || chart?.aggregation?.attributeName || chart?.name || "Total"}`,
        data: totals,
        borderColor: getColor(uniqueGroups.length),
        backgroundColor: "transparent",
        yAxisID: "y1",
        tension: 0.4,
        fill: false,
        pointRadius: 5,
        pointHoverRadius: 8,
      };

      return {
        labels,
        datasets: [...barDatasets, lineDataset],
      };
    }

    //singh modification code for stacked bar line chart
    // function processStackedComboData(
    //   data: any[],
    //   groupBy: string[],
    //   chartType: string,
    //   chart: any
    // ) {
    //   console.log("Processing Stacked satcked Data:", { data });
    //   // Check if data has the structure with label and widgetData
    //   const hasWidgetDataStructure = data.length > 0 && data[0].widgetData;

    //   if (hasWidgetDataStructure) {
    //     // Extract all unique months/labels
    //     const labels = data.map((item) => item.label);

    //     // Extract all unique SBU names (or dimension values)
    //     const allSBUNames = new Set<string>();
    //     data.forEach((monthData) => {
    //       monthData.widgetData.forEach((item: any) => {
    //         allSBUNames.add(item.name);
    //       });
    //     });

    //     const uniqueSBUs = Array.from(allSBUNames);

    //     // Create bar datasets for each SBU (stacked)
    //     const barDatasets = uniqueSBUs.map((sbuName, i) => {
    //       const values = labels.map((label) => {
    //         const monthData = data.find((d) => d.label === label);
    //         const sbuData = monthData?.widgetData?.find(
    //           (item: any) => item.name === sbuName
    //         );
    //         return sbuData ? sbuData.data : 0;
    //       });

    //       return {
    //         type: "bar",
    //         label: sbuName,
    //         data: values,
    //         backgroundColor: getColor(i),
    //         borderColor: "#FFFFFF",
    //         borderWidth: 1,
    //         borderRadius: 4,
    //         yAxisID: "y",
    //         stack: "combined", // Important for stacking
    //       };
    //     });

    //     // Calculate totals for line (sum of all SBUs per month)
    //     const totals = labels.map((label) => {
    //       const monthData = data.find((d) => d.label === label);
    //       return monthData?.totalCount || 0;
    //     });

    //     // Get attribute label for line dataset
    //     const attributeFieldKey = chart?.aggregation?.attributeName;
    //     const matchedAttributeField = chart?.dataSourceId?.fieldSettings?.find(
    //       (f: any) => f.mappedAttributeName === attributeFieldKey
    //     );
    //     const groupAttributeField = matchedAttributeField
    //       ? matchedAttributeField.label
    //       : attributeFieldKey;

    //     const lineDataset = {
    //       type: "line",
    //       label: `Total ${groupAttributeField || chart?.aggregation?.attributeName || chart?.name || "Count"}`,
    //       data: totals,
    //       borderColor: getColor(uniqueSBUs.length),
    //       backgroundColor: "transparent",
    //       yAxisID: "y1",
    //       tension: 0.4,
    //       fill: false,
    //       pointRadius: 5,
    //       pointHoverRadius: 8,
    //     };

    //     return {
    //       labels,
    //       datasets: [...barDatasets, lineDataset],
    //     };
    //   }

    //   // Original logic for regular data structure
    //   const barLabels = Array.from(new Set(data.map((item: any) => item.name)));
    //   console.log(" barLabels", barLabels);
    //   // CASE 1: When groupBy has value (grouped data)
    //   if (groupBy && groupBy.length > 0) {
    //     const groupFieldKey = groupBy[0];

    //     const matchedField = chart?.dataSourceId?.fieldSettings?.find(
    //       (f: any) => f.mappedAttributeName === groupFieldKey
    //     );
    //     const groupField = matchedField ? matchedField.label : groupFieldKey;

    //     const uniqueGroups = Array.from(
    //       new Set(
    //         data.map((item) => item[groupField] as string).filter(Boolean)
    //       )
    //     );

    //     let uniqueNameDataMap: any = {};
    //     const totals = barLabels.map((label) => uniqueNameDataMap[label] || 0);

    //     // Get attribute label for line dataset
    //     const attributeFieldKey = chart?.aggregation?.attributeName;
    //     const matchedAttributeField = chart?.dataSourceId?.fieldSettings?.find(
    //       (f: any) => f.mappedAttributeName === attributeFieldKey
    //     );
    //     const groupAttributeField = matchedAttributeField
    //       ? matchedAttributeField.label
    //       : attributeFieldKey;

    //     console.log(
    //       "matchedAttributeField",
    //       matchedAttributeField,
    //       attributeFieldKey
    //     );

    //     // Create bar datasets (stacked) for each group
    //     const barDatasets = uniqueGroups.map((group, index) => {
    //       console.log("Processing group:", group);
    //       const groupData = barLabels.map((name) => {
    //         const dataPoint = data.find(
    //           (item) => item.name === name && item[groupField] === group
    //         );
    //         const dataValue = dataPoint ? dataPoint.data : 0;
    //         // Track total per name for line chart
    //         if (uniqueNameDataMap[name]) {
    //           uniqueNameDataMap[name] = uniqueNameDataMap[name] + dataValue;
    //         } else {
    //           uniqueNameDataMap[name] = dataValue;
    //         }

    //         return dataValue;
    //       });
    //       console.log("groupData", groupData);

    //       if (index === 0) {
    //         return {
    //           type: "bar",
    //           label: group,
    //           // label: ` ${groupAttributeField || chart?.aggregation?.attributeName || chart?.name || "Count"}`,

    //           data: groupData,
    //           backgroundColor: getColor(index),
    //           borderColor: "#FFFFFF",
    //           borderWidth: 1,
    //           borderRadius: 4,
    //           // yAxisID: "y",
    //           stack: "combined", // Same stack for all bars
    //           // scales: {
    //           //   x: { stacked: true },
    //           //   y: { stacked: true, beginAtZero: true },
    //           // },
    //         };
    //       } else {
    //         return {
    //           type: "line",
    //           // label: group,
    //           label: ` ${groupAttributeField || chart?.aggregation?.attributeName || chart?.name || "Count"}`,
    //           data: totals,
    //           borderColor: getColor(uniqueGroups.length),
    //           backgroundColor: "transparent",
    //           // yAxisID: "y1",
    //           tension: 0.4,
    //           fill: false,
    //           pointRadius: 5,
    //           pointHoverRadius: 8,
    //           stack: "combined",
    //           // scales: {
    //           //   x: { stacked: true },
    //           //   y: { stacked: true, beginAtZero: true },
    //           // },
    //         };
    //       }
    //     });
    //     console.log(" barDatasets", barDatasets);

    //     // scales:
    //     //                      {
    //     //                         x: { stacked: true },
    //     //                         y: { stacked: true, beginAtZero: true }
    //     //                     }

    //     // Calculate totals for line (sum of all groups per label)

    //     // const lineDataset = {
    //     //   type: "line",
    //     //   label: `Total ${groupAttributeField || chart?.aggregation?.attributeName || chart?.name || "Count"}`,
    //     //   data: totals,
    //     //   borderColor: getColor(uniqueGroups.length),
    //     //   backgroundColor: "transparent",
    //     //   yAxisID: "y1",
    //     //   tension: 0.4,
    //     //   fill: false,
    //     //   pointRadius: 5,
    //     //   pointHoverRadius: 8,
    //     // };

    //     return {
    //       labels: barLabels,
    //       datasets: [...barDatasets],
    //     };
    //   }

    //   // CASE 2: When groupBy is empty (non-grouped data)
    //   const barDatasets = data.map((item, i) => {
    //     return {
    //       type: "bar",
    //       label: item.name,
    //       data: barLabels.map((lbl) => (lbl === item.name ? item.data : 0)),
    //       backgroundColor: getColor(i),
    //       borderColor: "#FFFFFF",
    //       borderWidth: 1,
    //       borderRadius: 4,
    //       yAxisID: "y",
    //       stack: "stack0",
    //     };
    //   });

    //   const totals = barLabels.map((label) => {
    //     const found = data.find((item) => item.name === label);
    //     return found ? found.data : 0;
    //   });

    //   const attributeFieldKey = chart?.aggregation?.attributeName;
    //   const matchedAttributeField = chart?.dataSourceId?.fieldSettings?.find(
    //     (f: any) => f.mappedAttributeName === attributeFieldKey
    //   );
    //   const groupAttributeField = matchedAttributeField
    //     ? matchedAttributeField.label
    //     : attributeFieldKey;

    //   const lineDataset = {
    //     type: "line",
    //     label: `Total ${groupAttributeField || chart?.aggregation?.attributeName || chart?.name || "Count"}`,
    //     data: totals,
    //     borderColor: getColor(data.length),
    //     backgroundColor: "transparent",
    //     yAxisID: "y1",
    //     tension: 0.4,
    //     fill: false,
    //     pointRadius: 5,
    //     pointHoverRadius: 8,
    //   };

    //   return {
    //     labels: barLabels,
    //     datasets: [...barDatasets, lineDataset],
    //   };
    // }

    // my update code staked bar line chart
    // function processStackedComboData(
    //   data: any[],
    //   groupBy: string[],
    //   chartType: string,
    //   chart: any
    // ) {
    //   console.log("Processing Stacked Bar-Line Data:", { data });

    //   // Check if data has the structure with label and widgetData
    //   const hasWidgetDataStructure = data.length > 0 && data[0].widgetData;

    //   if (hasWidgetDataStructure) {
    //     // Extract all unique months/labels
    //     const labels = data.map((item) => item.label);

    //     // CASE 1: When groupBy has value - Stack by groupBy field (e.g., BU)
    //     if (groupBy && groupBy.length > 0) {
    //       const groupFieldKey = groupBy[0];

    //       // Get field label for groupBy
    //       const matchedGroupField = chart?.dataSourceId?.fieldSettings?.find(
    //         (f: any) => f.mappedAttributeName === groupFieldKey
    //       );
    //       const groupFieldLabel = matchedGroupField
    //         ? matchedGroupField.label
    //         : groupFieldKey;

    //       // Extract all unique groupBy values (e.g., all BU values)
    //       const allGroupValues = new Set<string>();
    //       data.forEach((monthData) => {
    //         monthData.widgetData.forEach((item: any) => {
    //           if (item[groupFieldLabel]) {
    //             allGroupValues.add(item[groupFieldLabel]);
    //           }
    //         });
    //       });

    //       const uniqueGroupValues = Array.from(allGroupValues);

    //       // Create STACKED bar datasets for each groupBy value
    //       const barDatasets = uniqueGroupValues.map((groupValue, i) => {
    //         const values = labels.map((label) => {
    //           const monthData = data.find((d) => d.label === label);
    //           if (!monthData) return 0;

    //           // Sum all data for this groupBy value across all dimensions
    //           const groupTotal = monthData.widgetData
    //             .filter((item: any) => item[groupFieldLabel] === groupValue)
    //             .reduce((sum: number, item: any) => sum + (item.data || 0), 0);

    //           return groupTotal;
    //         });

    //         return {
    //           type: "bar",
    //           label: groupValue,
    //           data: values,
    //           backgroundColor: getColor(i),
    //           borderColor: "#FFFFFF",
    //           borderWidth: 1,
    //           borderRadius: 4,
    //           stack: "combined", // Important: All bars in same stack
    //         };
    //       });

    //       // Calculate totals for line
    //       const totals = labels.map((label) => {
    //         const monthData = data.find((d) => d.label === label);
    //         return monthData?.totalCount || 0;
    //       });

    //       // Get dimension label for line dataset (reverse of combo)
    //       const dimensionFieldKey = chart?.dimensions?.[0];
    //       const matchedDimensionField =
    //         chart?.dataSourceId?.fieldSettings?.find(
    //           (f: any) => f.mappedAttributeName === dimensionFieldKey
    //         );
    //       const dimensionLabel = matchedDimensionField
    //         ? matchedDimensionField.label
    //         : dimensionFieldKey;

    //       const lineDataset = {
    //         type: "line",
    //         label: `${dimensionLabel || "Count"}`,
    //         data: totals,
    //         borderColor: getColor(uniqueGroupValues.length),
    //         backgroundColor: "transparent",
    //         yAxisID: "y1",
    //         tension: 0.4,
    //         fill: false,
    //         pointRadius: 5,
    //         pointHoverRadius: 8,
    //       };

    //       return {
    //         labels,
    //         datasets: [...barDatasets, lineDataset],
    //       };
    //     }

    //     // CASE 2: When groupBy is empty - Stack by dimension values (e.g., SBU)
    //     const allDimensionValues = new Set<string>();
    //     data.forEach((monthData) => {
    //       monthData.widgetData.forEach((item: any) => {
    //         allDimensionValues.add(item.name);
    //       });
    //     });

    //     const uniqueDimensionValues = Array.from(allDimensionValues);

    //     // Create STACKED bar datasets for each dimension value
    //     const barDatasets = uniqueDimensionValues.map((dimensionValue, i) => {
    //       const values = labels.map((label) => {
    //         const monthData = data.find((d) => d.label === label);
    //         const itemData = monthData?.widgetData?.find(
    //           (item: any) => item.name === dimensionValue
    //         );
    //         return itemData ? itemData.data : 0;
    //       });

    //       return {
    //         type: "bar",
    //         label: dimensionValue,
    //         data: values,
    //         backgroundColor: getColor(i),
    //         borderColor: "#FFFFFF",
    //         borderWidth: 1,
    //         borderRadius: 4,
    //         stack: "combined",
    //       };
    //     });

    //     // Calculate totals for line
    //     const totals = labels.map((label) => {
    //       const monthData = data.find((d) => d.label === label);
    //       return monthData?.totalCount || 0;
    //     });

    //     // Get groupBy label for line dataset (reverse of combo)
    //     const groupFieldKey = groupBy?.[0];
    //     const matchedGroupField = chart?.dataSourceId?.fieldSettings?.find(
    //       (f: any) => f.mappedAttributeName === groupFieldKey
    //     );
    //     const groupFieldLabel = matchedGroupField
    //       ? matchedGroupField.label
    //       : groupFieldKey;

    //     const lineDataset = {
    //       type: "line",
    //       label: `${groupFieldLabel || "Count"}`,
    //       data: totals,
    //       borderColor: getColor(uniqueDimensionValues.length),
    //       backgroundColor: "transparent",
    //       yAxisID: "y1",
    //       tension: 0.4,
    //       fill: false,
    //       pointRadius: 5,
    //       pointHoverRadius: 8,
    //     };

    //     return {
    //       labels,
    //       datasets: [...barDatasets, lineDataset],
    //     };
    //   }

    //   // ============================================================
    //   // LEGACY: Original logic for regular data structure (non-widgetData)
    //   // ============================================================
    //   const labels = Array.from(new Set(data.map((item: any) => item.name)));

    //   // CASE 1: When groupBy has value (grouped data) - Stack by groupBy
    //   if (groupBy && groupBy.length > 0) {
    //     const groupFieldKey = groupBy[0];
    //     const matchedField = chart?.dataSourceId?.fieldSettings?.find(
    //       (f: any) => f.mappedAttributeName === groupFieldKey
    //     );
    //     const groupField = matchedField ? matchedField.label : groupFieldKey;

    //     const uniqueGroups = Array.from(
    //       new Set(
    //         data.map((item) => item[groupField] as string).filter(Boolean)
    //       )
    //     );

    //     // Create STACKED bar datasets for each group
    //     const barDatasets = uniqueGroups.map((group, index) => {
    //       const groupData = labels.map((name) => {
    //         const dataPoint = data.find(
    //           (item) => item.name === name && item[groupField] === group
    //         );
    //         return dataPoint ? dataPoint.data : 0;
    //       });

    //       return {
    //         type: "bar",
    //         label: group,
    //         data: groupData,
    //         backgroundColor: getColor(index),
    //         borderColor: "#FFFFFF",
    //         borderWidth: 1,
    //         borderRadius: 4,
    //         stack: "combined", // All bars stacked together
    //       };
    //     });

    //     // Calculate totals for line (sum across all groups per label)
    //     const totals = labels.map((label) => {
    //       return data
    //         .filter((item) => item.name === label)
    //         .reduce((sum, item) => sum + (item.data || 0), 0);
    //     });

    //     // Get dimension label for line dataset (reverse of combo)
    //     const dimensionFieldKey = chart?.dimensions?.[0];
    //     const matchedDimensionField = chart?.dataSourceId?.fieldSettings?.find(
    //       (f: any) => f.mappedAttributeName === dimensionFieldKey
    //     );
    //     const dimensionLabel = matchedDimensionField
    //       ? matchedDimensionField.label
    //       : dimensionFieldKey;

    //     const lineDataset = {
    //       type: "line",
    //       label: `${dimensionLabel || "Count"}`,
    //       data: totals,
    //       borderColor: getColor(uniqueGroups.length),
    //       backgroundColor: "transparent",
    //       yAxisID: "y1",
    //       tension: 0.4,
    //       fill: false,
    //       pointRadius: 5,
    //       pointHoverRadius: 8,
    //     };

    //     return {
    //       labels,
    //       datasets: [...barDatasets, lineDataset],
    //     };
    //   }

    //   // CASE 2: When groupBy is empty (non-grouped data) - Stack by dimension
    //   const barDatasets = data.map((item, i) => {
    //     return {
    //       type: "bar",
    //       label: item.name,
    //       data: labels.map((lbl) => (lbl === item.name ? item.data : 0)),
    //       backgroundColor: getColor(i),
    //       borderColor: "#FFFFFF",
    //       borderWidth: 1,
    //       borderRadius: 4,
    //       stack: "combined",
    //     };
    //   });

    //   const totals = labels.map((label) => {
    //     const found = data.find((item) => item.name === label);
    //     return found ? found.data : 0;
    //   });

    //   // Get groupBy label for line dataset (if no groupBy, use dimension)
    //   const groupFieldKey = groupBy?.[0];
    //   const dimensionFieldKey = chart?.dimensions?.[0];

    //   const lineFieldKey = groupFieldKey || dimensionFieldKey;
    //   const matchedLineField = chart?.dataSourceId?.fieldSettings?.find(
    //     (f: any) => f.mappedAttributeName === lineFieldKey
    //   );
    //   const lineLabel = matchedLineField
    //     ? matchedLineField.label
    //     : lineFieldKey;

    //   const lineDataset = {
    //     type: "line",
    //     label: `${lineLabel || "Count"}`,
    //     data: totals,
    //     borderColor: getColor(data.length),
    //     backgroundColor: "transparent",
    //     yAxisID: "y1",
    //     tension: 0.4,
    //     fill: false,
    //     pointRadius: 5,
    //     pointHoverRadius: 8,
    //   };

    //   return {
    //     labels,
    //     datasets: [...barDatasets, lineDataset],
    //   };
    // }
    

    function processStackedComboData(
  data: any[],
  groupBy: string[],
  chartType: string,
  chart: any
) {
  console.log("Processing Stacked Bar-Line Data:", { data });

  // Check if data has the structure with label and widgetData
  const hasWidgetDataStructure = data.length > 0 && data[0].widgetData;

  if (hasWidgetDataStructure) {
    // Extract all unique months/labels
    const labels = data.map((item) => item.label);

    // Get dimension field (e.g., SBU)
    const dimensionFieldKey = chart?.dimensions?.[0];
    const matchedDimensionField = chart?.dataSourceId?.fieldSettings?.find(
      (f: any) => f.mappedAttributeName === dimensionFieldKey
    );
    const dimensionLabel = matchedDimensionField
      ? matchedDimensionField.label
      : dimensionFieldKey;

    // Extract all unique dimension values (e.g., SBU values)
    const allDimensionValues = new Set<string>();
    data.forEach((monthData) => {
      monthData.widgetData.forEach((item: any) => {
        allDimensionValues.add(item.name);
      });
    });

    const uniqueDimensionValues = Array.from(allDimensionValues);

    // CASE 1: When groupBy has value - Create stacked bars for dimensions + multiple lines for groupBy
    if (groupBy && groupBy.length > 0) {
      const groupFieldKey = groupBy[0];

      // Get field label for groupBy
      const matchedGroupField = chart?.dataSourceId?.fieldSettings?.find(
        (f: any) => f.mappedAttributeName === groupFieldKey
      );
      const groupFieldLabel = matchedGroupField
        ? matchedGroupField.label
        : groupFieldKey;

      // Create STACKED bar datasets for each dimension value (SBU)
      const barDatasets = uniqueDimensionValues.map((dimensionValue, i) => {
        const values = labels.map((label) => {
          const monthData = data.find((d) => d.label === label);
          if (!monthData) return 0;

          // Sum all data for this dimension across all groupBy values
          const dimensionTotal = monthData.widgetData
            .filter((item: any) => item.name === dimensionValue)
            .reduce((sum: number, item: any) => sum + (item.data || 0), 0);

          return dimensionTotal;
        });

        return {
          type: "bar",
          label: dimensionValue,
          data: values,
          backgroundColor: getColor(i),
          borderColor: "#FFFFFF",
          borderWidth: 1,
          borderRadius: 4,
          stack: "combined", // All bars stacked
        };
      });

      // Extract all unique groupBy values (e.g., BU values)
      const allGroupValues = new Set<string>();
      data.forEach((monthData) => {
        monthData.widgetData.forEach((item: any) => {
          if (item[groupFieldLabel]) {
            allGroupValues.add(item[groupFieldLabel]);
          }
        });
      });

      const uniqueGroupValues = Array.from(allGroupValues);

      // Create multiple LINE datasets for each groupBy value (BU)
      const lineDatasets = uniqueGroupValues.map((groupValue, i) => {
        const values = labels.map((label) => {
          const monthData = data.find((d) => d.label === label);
          if (!monthData) return 0;

          // Sum all data for this groupBy value
          const groupTotal = monthData.widgetData
            .filter((item: any) => item[groupFieldLabel] === groupValue)
            .reduce((sum: number, item: any) => sum + (item.data || 0), 0);

          return groupTotal;
        });

        return {
          type: "line",
          label: groupValue,
          data: values,
          borderColor: getColor(uniqueDimensionValues.length + i),
          backgroundColor: "transparent",
          yAxisID: "y1",
          tension: 0.4,
          fill: false,
          pointRadius: 5,
          pointHoverRadius: 8,
        };
      });

      return {
        labels,
        datasets: [...barDatasets, ...lineDatasets],
      };
    }

    // CASE 2: When groupBy is empty - Create stacked bars for dimensions + single total line
    const barDatasets = uniqueDimensionValues.map((dimensionValue, i) => {
      const values = labels.map((label) => {
        const monthData = data.find((d) => d.label === label);
        const itemData = monthData?.widgetData?.find(
          (item: any) => item.name === dimensionValue
        );
        return itemData ? itemData.data : 0;
      });

      return {
        type: "bar",
        label: dimensionValue,
        data: values,
        backgroundColor: getColor(i),
        borderColor: "#FFFFFF",
        borderWidth: 1,
        borderRadius: 4,
        stack: "combined",
      };
    });

    // Calculate totals for single line
    const totals = labels.map((label) => {
      const monthData = data.find((d) => d.label === label);
      return monthData?.totalCount || 0;
    });

    const lineDataset = {
      type: "line",
      label: `Total ${dimensionLabel || "Count"}`,
      data: totals,
      borderColor: getColor(uniqueDimensionValues.length),
      backgroundColor: "transparent",
      yAxisID: "y1",
      tension: 0.4,
      fill: false,
      pointRadius: 5,
      pointHoverRadius: 8,
    };

    return {
      labels,
      datasets: [...barDatasets, lineDataset],
    };
  }

  // ============================================================
  // LEGACY: Original logic for regular data structure (non-widgetData)
  // ============================================================
  const labels = Array.from(new Set(data.map((item: any) => item.name)));

  // CASE 1: When groupBy has value - Stacked bars by dimensions + multiple lines for groupBy
  if (groupBy && groupBy.length > 0) {
    const groupFieldKey = groupBy[0];
    const matchedField = chart?.dataSourceId?.fieldSettings?.find(
      (f: any) => f.mappedAttributeName === groupFieldKey
    );
    const groupField = matchedField ? matchedField.label : groupFieldKey;

    const uniqueGroups = Array.from(
      new Set(
        data.map((item) => item[groupField] as string).filter(Boolean)
      )
    );

    // Get dimension field
    const dimensionFieldKey = chart?.dimensions?.[0];
    const matchedDimensionField = chart?.dataSourceId?.fieldSettings?.find(
      (f: any) => f.mappedAttributeName === dimensionFieldKey
    );
    const dimensionLabel = matchedDimensionField
      ? matchedDimensionField.label
      : dimensionFieldKey;

    // Create stacked bar datasets for each dimension (labels = dimensions)
    const barDatasets = labels.map((dimensionValue, index) => {
      const values = labels.map((name) => {
        if (name === dimensionValue) {
          // Sum all data for this dimension across all groups
          return data
            .filter((item) => item.name === dimensionValue)
            .reduce((sum, item) => sum + (item.data || 0), 0);
        }
        return 0;
      });

      return {
        type: "bar",
        label: dimensionValue,
        data: values,
        backgroundColor: getColor(index),
        borderColor: "#FFFFFF",
        borderWidth: 1,
        borderRadius: 4,
        stack: "combined",
      };
    });

    // Create multiple line datasets for each group (BU)
    const lineDatasets = uniqueGroups.map((group, i) => {
      const values = labels.map((name) => {
        const dataPoint = data.find(
          (item) => item.name === name && item[groupField] === group
        );
        return dataPoint ? dataPoint.data : 0;
      });

      return {
        type: "line",
        label: group,
        data: values,
        borderColor: getColor(labels.length + i),
        backgroundColor: "transparent",
        yAxisID: "y1",
        tension: 0.4,
        fill: false,
        pointRadius: 5,
        pointHoverRadius: 8,
      };
    });

    return {
      labels,
      datasets: [...barDatasets, ...lineDatasets],
    };
  }

  // CASE 2: When groupBy is empty - Stacked bars by dimension + single total line
  const barDatasets = data.map((item, i) => {
    return {
      type: "bar",
      label: item.name,
      data: labels.map((lbl) => (lbl === item.name ? item.data : 0)),
      backgroundColor: getColor(i),
      borderColor: "#FFFFFF",
      borderWidth: 1,
      borderRadius: 4,
      stack: "combined",
    };
  });

  const totals = labels.map((label) => {
    const found = data.find((item) => item.name === label);
    return found ? found.data : 0;
  });

  const dimensionFieldKey = chart?.dimensions?.[0];
  const matchedDimensionField = chart?.dataSourceId?.fieldSettings?.find(
    (f: any) => f.mappedAttributeName === dimensionFieldKey
  );
  const dimensionLabel = matchedDimensionField
    ? matchedDimensionField.label
    : dimensionFieldKey;

  const lineDataset = {
    type: "line",
    label: `Total ${dimensionLabel || "Count"}`,
    data: totals,
    borderColor: getColor(data.length),
    backgroundColor: "transparent",
    yAxisID: "y1",
    tension: 0.4,
    fill: false,
    pointRadius: 5,
    pointHoverRadius: 8,
  };

  return {
    labels,
    datasets: [...barDatasets, lineDataset],
  };
}
    function processHistogramData(data: any[]) {
      const values = data.map((item) => item.data).sort((a, b) => a - b);
      return {
        labels: values,
        datasets: [
          {
            label: "Frequency",
            data: values,
            backgroundColor: getColor(0),
            borderColor: "#FFFFFF",
          },
        ],
      };
    }

    interface TimeSeriesItem {
      timestamp?: string | number;
      date?: string | number;
      name?: string;
      data?: number;
      [key: string]: any;
    }

    function processTimeSeriesData(
      data: TimeSeriesItem[],
      groupBy: string[] = [],
      chart?: any
    ) {
      if (!groupBy || groupBy.length === 0) {
        const timeData = data.map((item) => ({
          x: item.timestamp ?? item.date ?? item.name,
          y: item.data ?? 0,
        }));

        return {
          datasets: [
            {
              label: chart?.name || "Time Series",
              data: timeData,
              borderColor: getColor(0),
              backgroundColor: "transparent",
              tension: 0.4,
            },
          ],
        };
      }

      const groupField = resolveGroupField(groupBy, chart);
      const uniqueGroups = Array.from(
        new Set(data.map((item) => item[groupField] ?? "Unknown"))
      );

      const datasets = uniqueGroups.map((group, index) => {
        const groupData = data
          .filter((item) => (item[groupField] ?? "Unknown") === group)
          .map((item) => ({
            x: item.timestamp ?? item.date ?? item.name,
            y: item.data ?? 0,
          }));

        return {
          label: group,
          data: groupData,
          borderColor: getColor(index),
          backgroundColor: "transparent",
          tension: 0.4,
        };
      });

      return { datasets };
    }
  };

  // Enhanced renderChart function that handles ALL chart types
  const renderChart = (chart: ChartResponse) => {
    const chartData = getChartData(chart);
    const chartType = chart.widgetTypeId?.chartType || "line";
    const options = getChartOptions(chartType, chart);
    const chartId = `chart-${chart._id}`;

    // Handle empty data
    if (chartData.isEmpty) {
      return (
        <Typography
          color="text.secondary"
          variant="h6"
          sx={{ textAlign: "center", p: 4 }}
        >
          No data available for this chart
        </Typography>
      );
    }

    const baseChartProps = {
      id: chartId,
      data: chartData,
      options: {
        ...options,
        onClick: (event: ChartEvent, elements: ActiveElement[]) => {
          handleChartClick(chart, elements);
        },
      },
      ref: (ref: any) => {
        chartRefs.current[chartId] = ref;
      },
    };

    switch (chartType) {
      // Number widget
      case "number":
        const numberValue = chartData.datasets?.[0]?.data?.[0] || 0;
        return (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              justifyContent: "flex-start",
              height: "100%",
              textAlign: "left",
            }}
          >
            <Typography
              variant="h2"
              sx={{
                fontWeight: "bold",
                color: "#4D4D4D",
                mb: 1,
              }}
            >
              {typeof numberValue === "number"
                ? numberValue.toLocaleString()
                : numberValue}
            </Typography>
            {/* <Typography variant="h6" color="#4D4D4D">
              {chart.name}
            </Typography> */}
            <Typography
              variant="subtitle2" // smaller than h6
              color="#4D4D4D"
              // sx={{ fontSize: "0.85rem" }} // adjust as needed
            >
              {chart.name}
            </Typography>
          </Box>
        );

      // Line charts (including area, multi-series, time-series)
      case "line":
      case "area":
      case "multiSeriesLine":
      case "timeSeries":
        return <Line {...baseChartProps} />;

      // Bar charts (all variations)
      case "bar":
      case "verticalBar":
      case "horizontalBar":
      case "stackedBar":
      case "multiSeriesBar":
      case "histogram":
        return <Bar {...baseChartProps} />;

      // Pie charts (all variations)
      case "pie":
      case "multiSeriesPie":
        return <Pie {...baseChartProps} />;

      // Doughnut chart
      case "doughnut":
        return <Doughnut {...baseChartProps} />;

      // Radar chart
      case "radar":
        return <Radar {...baseChartProps} />;

      // Polar area chart
      case "polarArea":
        return <PolarArea {...baseChartProps} />;

      // Scatter plot
      case "scatter":
        return <Scatter {...baseChartProps} />;

      // Bubble chart
      case "bubble":
        return <Bubble {...baseChartProps} />;

      // Mixed/Combo charts
      case "comboBarLine":
      case "stackedBarLine":
        return <Chart type="bar" {...baseChartProps} />;
      //    case "stackedBarLine":
      // // case "comboBarLine":

      //   return (
      //     <Chart
      //       type="bar"
      //       data={chartData as ChartData<"bar">}
      //       options={options}
      //       ref={(ref) => {
      //         chartRefs.current[chartId] = ref as ChartJS | null;
      //       }}
      //     />
      //   );

      // Advanced charts (placeholders for future implementation)
      case "gantt":
      case "heatmap":
      case "treemap":
      case "sankey":
      case "funnel":
      case "waterfall":
      case "candlestick":
      case "boxPlot":
      case "violin":
      case "network":
        return (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
              background: "#f5f5f5",
              borderRadius: 2,
              p: 3,
            }}
          >
            <Box sx={{ textAlign: "center" }}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                {chartType.charAt(0).toUpperCase() + chartType.slice(1)} Chart
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Advanced chart type - requires additional library integration
              </Typography>
              <Typography variant="body2" color="primary" sx={{ mt: 1 }}>
                Coming soon...
              </Typography>
            </Box>
          </Box>
        );

      // Tabular data
      case "tabular":
        const tableData = chartData.data || [];
        const columns = chartData.columns || [];

        return (
          <TableContainer
            component={Paper}
            sx={{ maxHeight: 400, overflow: "auto" }}
          >
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  {columns.map((column: string) => (
                    <TableCell
                      key={column}
                      sx={{
                        fontWeight: "bold",
                        backgroundColor: theme.palette.grey[100],
                      }}
                    >
                      {column}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {tableData.map((row: any, index: number) => (
                  <TableRow key={index} hover>
                    {columns.map((column: string) => (
                      <TableCell key={column}>
                        {typeof row[column] === "number"
                          ? row[column].toLocaleString()
                          : row[column]}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        );

      // Default fallback
      default:
        console.warn(`Unsupported chart type: ${chartType}`);
        return <Line {...baseChartProps} />;
    }
  };

  type FieldSetting = {
    attributeId: string;
    refAttributeId: string[];
    label: string;
    mappedAttributeName: string;
  };

  const getLabelForField = (
    field: string | undefined,
    fieldSettings: FieldSetting[] = []
  ): string | undefined => {
    if (!field) return field;

    // direct match by mappedAttributeName
    const matched = fieldSettings?.find(
      (fs) => fs.mappedAttributeName === field
    );
    return matched?.label || field;
  };

  const getChartOptions = (chartType: string, chart: ChartResponse) => {
    const fieldSettings = chart.dataSourceId?.fieldSettings || [];
    const xLabel =
      getLabelForField(chart?.dimensions?.[0], fieldSettings) || "X-axis";
    const yLabel =
      getLabelForField(chart?.aggregation?.attributeName, fieldSettings) ||
      "Y-axis";

    const baseOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: (widgetTheme?.legend?.position ?? "bottom") as
            | "bottom"
            | "right"
            | "center"
            | "top"
            | "left"
            | "chartArea",
          display: widgetTheme?.legend?.display ?? true,
          align: "start" as const,
          labels: {
            usePointStyle: true,
            color:
              widgetTheme?.legend?.labels?.color ?? theme.palette.text.primary,
            padding: widgetTheme?.legend?.labels?.padding ?? 15,
            font: { size: widgetTheme?.legend?.labels?.font?.size ?? 12 },
            boxWidth: widgetTheme?.legend?.labels?.boxWidth ?? 10,
            boxHeight: widgetTheme?.legend?.labels?.boxHeight ?? 10,
          },
          maxHeight: 100,
        },
        tooltip: {
          display: widgetTheme?.tooltip?.display ?? true,
          backgroundColor:
            widgetTheme?.tooltip?.backgroundColor ??
            theme.palette.background.paper,
          titleColor:
            widgetTheme?.tooltip?.titleColor ?? theme.palette.text.primary,
          bodyColor: theme.palette.text.secondary,
          borderColor:
            widgetTheme?.tooltip?.borderColor ?? theme.palette.divider,
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
      case "pie":
      case "doughnut":
      case "polarArea":
        return {
          ...baseOptions,
          plugins: {
            ...baseOptions.plugins,
            legend: {
              ...baseOptions.plugins.legend,
              position: (widgetTheme?.legend?.position ?? "right") as
                | "bottom"
                | "right"
                | "center"
                | "top"
                | "left"
                | "chartArea",
            },
          },
        };

      case "line":
      case "area":
        return {
          ...baseOptions,
          scales: {
            y: {
              title: {
                color: widgetTheme?.scales?.x?.ticks?.color ?? "grey",
                display: true,
                text: yLabel,
              },
              display: widgetTheme?.scales?.y?.display ?? true,
              beginAtZero: widgetTheme?.scales?.y?.beginAtZero ?? true,
              grid: {
                display: widgetTheme?.scales?.y?.grid?.display ?? false,
                color:
                  widgetTheme?.scales?.y?.grid?.color ?? theme.palette.divider,
                drawBorder: widgetTheme?.scales?.y?.grid?.drawBorder ?? false,
              },
              ticks: {
                padding: widgetTheme?.scales?.y?.ticks?.padding ?? 15,
                maxRotation: 0,
                minRotation: 0,
                font: { size: 11 },
              },
            },
            x: {
              title: {
                color: widgetTheme?.scales?.x?.ticks?.color ?? "grey",
                display: true,
                text: xLabel,
              },
              display: widgetTheme?.scales?.x?.display ?? true,
              grid: {
                display: widgetTheme?.scales?.x?.grid?.display ?? false,
                tickColor: widgetTheme?.scales?.x?.ticks?.color ?? "red",
              },
              ticks: {
                color:
                  widgetTheme?.scales?.x?.ticks?.color ??
                  theme.palette.text.secondary,
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

      case "horizontalBar":
        return {
          ...baseOptions,
          indexAxis: "y" as const,
          scales: {
            x: {
              title: {
                display: true,
                text: xLabel,
                color:
                  widgetTheme?.scales?.x?.ticks?.color ||
                  theme.palette.text.primary,
                font: { size: 14, weight: "bold" as const },
              },
              display: widgetTheme?.scales?.x?.display ?? true,
              beginAtZero: widgetTheme?.scales?.y?.beginAtZero ?? true,
              grid: {
                display: widgetTheme?.scales?.x?.grid?.display ?? true,
                color:
                  widgetTheme?.scales?.x?.grid?.color || theme.palette.divider,
                drawBorder: widgetTheme?.scales?.x?.grid?.drawBorder ?? false,
              },
              ticks: {
                color:
                  widgetTheme?.scales?.x?.ticks?.color ||
                  theme.palette.text.secondary,
                padding: widgetTheme?.scales?.x?.ticks?.padding ?? 8,
                font: { size: 12 },
              },
            },
            y: {
              title: {
                display: true,
                text: yLabel,
                color:
                  widgetTheme?.scales?.y?.ticks?.color ||
                  theme.palette.text.primary,
                font: { size: 14, weight: "bold" },
              },
              display: widgetTheme?.scales?.y?.display ?? true,
              grid: {
                display: widgetTheme?.scales?.y?.grid?.display ?? false,
                color:
                  widgetTheme?.scales?.y?.grid?.color || theme.palette.divider,
                drawBorder: widgetTheme?.scales?.y?.grid?.drawBorder ?? false,
              },
              ticks: {
                color:
                  widgetTheme?.scales?.y?.ticks?.color ||
                  theme.palette.text.secondary,
                padding: widgetTheme?.scales?.y?.ticks?.padding ?? 8,
                font: { size: 12 },
              },
            },
          },
          plugins: {
            ...baseOptions.plugins,
            legend: {
              position: "top" as const,
              labels: {
                usePointStyle: true,
                color:
                  widgetTheme?.legend?.labels?.color ||
                  theme.palette.text.primary,
                padding: widgetTheme?.legend?.labels?.padding ?? 15,
                font: { size: widgetTheme?.legend?.labels?.font?.size ?? 12 },
                boxWidth: widgetTheme?.legend?.labels?.boxWidth ?? 10,
                boxHeight: widgetTheme?.legend?.labels?.boxHeight ?? 10,
              },
            },
          },
        };

      case "verticalBar":
      case "stackedBar":
      case "multiSeriesBar":
        const isStacked = chartType === "stackedBar";
        return {
          ...baseOptions,
          scales: {
            x: {
              title: {
                color: widgetTheme?.scales?.x?.ticks?.color ?? "grey",
                display: true,
                text: xLabel,
              },
              display: widgetTheme?.scales?.x?.display ?? true,
              grid: {
                display: widgetTheme?.scales?.x?.grid?.display ?? false,
                color:
                  widgetTheme?.scales?.x?.grid?.color ?? theme.palette.divider,
                drawBorder: widgetTheme?.scales?.x?.grid?.drawBorder ?? false,
              },
              ticks: {
                color:
                  widgetTheme?.scales?.x?.ticks?.color ??
                  theme.palette.text.secondary,
                padding: widgetTheme?.scales?.x?.ticks?.padding ?? 8,
              },
              stacked: isStacked,
            },
            y: {
              title: {
                color: widgetTheme?.scales?.x?.ticks?.color ?? "grey",
                display: true,
                text: yLabel,
              },
              display: widgetTheme?.scales?.y?.display ?? true,
              beginAtZero: widgetTheme?.scales?.y?.beginAtZero ?? true,
              grid: {
                display: widgetTheme?.scales?.y?.grid?.display ?? false,
                color:
                  widgetTheme?.scales?.y?.grid?.color ?? theme.palette.divider,
                drawBorder: widgetTheme?.scales?.y?.grid?.drawBorder ?? false,
              },
              ticks: {
                padding: widgetTheme?.scales?.y?.ticks?.padding ?? 8,
              },
              stacked: isStacked,
            },
          },
        };

      // case "stackedBarLine":
      //   return {
      //     ...baseOptions,
      //     scales: {
      //       y: {
      //         type: "linear" as const,
      //         display: widgetTheme?.scales?.y?.display ?? true,
      //         position: "left" as const,
      //         beginAtZero: widgetTheme?.scales?.y?.beginAtZero ?? true,
      //         grid: {
      //           color:
      //             widgetTheme?.scales?.y?.grid?.color ?? theme.palette.divider,
      //           drawBorder: widgetTheme?.scales?.y?.grid?.drawBorder ?? false,
      //         },
      //         stacked: true,
      //         title: {
      //           color: widgetTheme?.scales?.x?.ticks?.color ?? "grey",
      //           display: true,
      //           text: yLabel,
      //         },
      //         ticks: {
      //           padding: widgetTheme?.scales?.y?.ticks?.padding ?? 8,
      //         },
      //       },
      //       y1: {
      //         type: "linear" as const,
      //         display: true,
      //         position: "right" as const,
      //         beginAtZero: widgetTheme?.scales?.y?.beginAtZero ?? true,
      //         grid: {
      //           drawOnChartArea: false,
      //         },
      //         title: {
      //           color: widgetTheme?.scales?.x?.ticks?.color ?? "grey",
      //           display: true,
      //           text: yLabel,
      //         },
      //         ticks: {
      //           padding: widgetTheme?.scales?.y?.ticks?.padding ?? 8,
      //         },
      //       },
      //       x: {
      //         title: {
      //           color: widgetTheme?.scales?.x?.ticks?.color ?? "grey",
      //           display: true,
      //           text: xLabel,
      //         },
      //         display: widgetTheme?.scales?.x?.display ?? true,
      //         grid: {
      //           display: widgetTheme?.scales?.x?.grid?.display ?? false,
      //           tickColor: widgetTheme?.scales?.x?.ticks?.color ?? "red",
      //         },
      //         ticks: {
      //           color:
      //             widgetTheme?.scales?.x?.ticks?.color ??
      //             theme.palette.text.secondary,
      //           padding: widgetTheme?.scales?.x?.ticks?.padding ?? 8,
      //         },
      //       },
      //     },
      //   };

      case "stackedBarLine":
        return {
          ...baseOptions,
          scales: {
            // x: { stacked: true },
            // y: { stacked: true, beginAtZero: true },

            y: {
              type: "linear" as const,
              display: widgetTheme?.scales?.y?.display ?? true,
              position: "left" as const,
              beginAtZero: widgetTheme?.scales?.y?.beginAtZero ?? true,
              grid: {
                color:
                  widgetTheme?.scales?.y?.grid?.color ?? theme.palette.divider,
                drawBorder: widgetTheme?.scales?.y?.grid?.drawBorder ?? false,
              },
              stacked: true,
              title: {
                color: widgetTheme?.scales?.x?.ticks?.color ?? "grey",
                display: true,
                text: yLabel,
              },
              ticks: {
                padding: widgetTheme?.scales?.y?.ticks?.padding ?? 8,
              },
            },
            y1: {
              type: "linear" as const,
              display: true,
              position: "right" as const,
              beginAtZero: widgetTheme?.scales?.y?.beginAtZero ?? true,
              grid: {
                drawOnChartArea: false,
              },
              title: {
                color: widgetTheme?.scales?.x?.ticks?.color ?? "grey",
                display: true,
                text: `Total ${yLabel}`, // Line axis label - differentiate from bar
              },
              ticks: {
                padding: widgetTheme?.scales?.y?.ticks?.padding ?? 8,
              },
            },
            x: {
              title: {
                color: widgetTheme?.scales?.x?.ticks?.color ?? "grey",
                display: true,
                text: xLabel,
              },
              display: widgetTheme?.scales?.x?.display ?? true,
              grid: {
                display: widgetTheme?.scales?.x?.grid?.display ?? false,
                tickColor: widgetTheme?.scales?.x?.ticks?.color ?? "red",
              },
              stacked: true,
              ticks: {
                color:
                  widgetTheme?.scales?.x?.ticks?.color ??
                  theme.palette.text.secondary,
                padding: widgetTheme?.scales?.x?.ticks?.padding ?? 8,
              },
            },
          },
        };

      case "comboBarLine":
        return {
          ...baseOptions,
          interaction: {
            intersect: false,
            mode: "index" as const,
          },
          scales: {
            x: {
              title: {
                display: true,
                text: xLabel,
                color:
                  widgetTheme?.scales?.x?.ticks?.color ||
                  theme.palette.text.primary,
                font: { size: 14, weight: "bold" },
              },
              display: widgetTheme?.scales?.x?.display ?? true,
              grid: {
                display: widgetTheme?.scales?.x?.grid?.display ?? true,
                color:
                  widgetTheme?.scales?.x?.grid?.color || theme.palette.divider,
              },
              ticks: {
                color:
                  widgetTheme?.scales?.x?.ticks?.color ||
                  theme.palette.text.secondary,
                padding: widgetTheme?.scales?.x?.ticks?.padding ?? 8,
              },
            },
            y: {
              type: "linear" as const,
              display: true,
              position: "left" as const,
              beginAtZero: true,
              title: {
                display: true,
                text: yLabel,
                color:
                  widgetTheme?.scales?.y?.ticks?.color ||
                  theme.palette.text.primary,
                font: { size: 14, weight: "bold" },
              },
              grid: {
                display: true,
                color:
                  widgetTheme?.scales?.y?.grid?.color || theme.palette.divider,
                drawBorder: false,
              },
              ticks: {
                color:
                  widgetTheme?.scales?.y?.ticks?.color ||
                  theme.palette.text.secondary,
                padding: 8,
              },
            },
            y1: {
              type: "linear" as const,
              display: true,
              position: "right" as const,
              beginAtZero: true,
              title: {
                display: true,
                text: yLabel,
                color:
                  widgetTheme?.scales?.y?.ticks?.color ||
                  theme.palette.text.primary,
                font: { size: 14, weight: "bold" },
              },
              grid: {
                drawOnChartArea: false,
              },
              ticks: {
                color:
                  widgetTheme?.scales?.y?.ticks?.color ||
                  theme.palette.text.secondary,
                padding: 8,
              },
            },
          },
          plugins: {
            ...baseOptions.plugins,
            legend: {
              display: true,
              position: "top" as const,
              labels: {
                usePointStyle: true,
                color:
                  widgetTheme?.legend?.labels?.color ||
                  theme.palette.text.primary,
                padding: 15,
                font: { size: 12 },
                boxWidth: 10,
                boxHeight: 10,
              },
            },
            tooltip: {
              ...baseOptions.plugins.tooltip,
              callbacks: {
                label: function (context) {
                  let label = context.dataset.label || "";
                  if (label) {
                    label += ": ";
                  }
                  label += context.parsed.y;
                  return label;
                },
              },
            },
          },
        };

      case "radar":
        return {
          ...baseOptions,
          scales: {
            r: {
              beginAtZero: widgetTheme?.scales?.y?.beginAtZero ?? true,
              grid: {
                color:
                  widgetTheme?.scales?.y?.grid?.color ?? theme.palette.divider,
              },
              angleLines: {
                color:
                  widgetTheme?.scales?.y?.grid?.color ?? theme.palette.divider,
              },
              pointLabels: {
                color:
                  widgetTheme?.scales?.x?.ticks?.color ??
                  theme.palette.text.secondary,
              },
              ticks: {
                backdropColor: "transparent",
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

  const renderDrillDownDialog = () => {
    const columns =
      drillDownData.length > 0
        ? Object.keys(drillDownData[0]).filter((key) => key !== "_id")
        : [];

    return (
      <DrillDownDialog
        open={drillDownOpen}
        onClose={handleDrillDownClose}
        aria-labelledby="drill-down-dialog-title"
      >
        <DialogTitle
          id="drill-down-dialog-title"
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
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
              "&:hover": {
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
            display: "flex",
            flexDirection: "column",
            height: "100%",
          }}
        >
          <StyledTableContainer
            sx={{ flex: 1, overflow: "auto", ...getTableSx() }}
          >
            <DrillDownTable>
              <TableHead>
                <TableRow>
                  {columns.map((column) => (
                    <TableCell
                      key={column}
                      sx={{
                        fontWeight: STYLE_GUIDE.TYPOGRAPHY.fontWeight.semiBold,
                        backgroundColor:
                          themeUnified.palette.table?.headerBackground ||
                          STYLE_GUIDE.COLORS.backgroundLightGray,
                        color:
                          themeUnified.palette.table?.headerText ||
                          STYLE_GUIDE.COLORS.textGray,
                      }}
                    >
                      {column}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {isDrillDownLoading ? (
                  Array.from({ length: 5 }).map((_, index) => (
                    <TableRow key={index}>
                      {columns.map((column) => (
                        <TableCell key={column}>
                          <Box
                            sx={{
                              width: "100%",
                              height: 20,
                              bgcolor: "grey.200",
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
                            ? themeUnified.palette.table?.rowEvenBackground ||
                              STYLE_GUIDE.COLORS.white
                            : themeUnified.palette.table?.rowOddBackground ||
                              STYLE_GUIDE.COLORS.backgroundDefault,
                        "&:hover": {
                          backgroundColor:
                            themeUnified.palette.table?.rowHoverBackground ||
                            STYLE_GUIDE.COLORS.backgroundHover,
                        },
                      }}
                    >
                      {columns.map((column) => (
                        <TableCell
                          key={column}
                          sx={{
                            color:
                              themeUnified.palette.table?.rowText ||
                              STYLE_GUIDE.COLORS.textDarkGray,
                          }}
                        >
                          {typeof row[column] === "number"
                            ? row[column].toLocaleString()
                            : row[column]}
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
                display: "flex",
                justifyContent: "center",
                mt: "auto",
                pt: 3,
                pb: 2,
                borderTop: `1px solid ${theme.palette.divider}`,
              }}
            >
              <Pagination
                count={totalPages}
                page={currentPage}
                onChange={handlePageChange}
                color="primary"
              />
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
    const chartType = chart.widgetTypeId?.chartType || "line";

    if (chartType === "tabular") {
      const chartDataArray =
        widgetData[chart._id]?.data?.widgetData || chart.data || [];
      if (chartDataArray.length === 0) {
        toast.error("No data available to download");
        return;
      }

      const columns = Object.keys(chartDataArray[0]);
      const csvContent = [
        columns.join(","),
        ...chartDataArray.map((row) =>
          columns
            .map((column) => {
              const value = row[column];
              return typeof value === "number" ? value : `"${value}"`;
            })
            .join(",")
        ),
      ].join("\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", `${chart.name || "chart"}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      return;
    }

    const chartInstance = chartRefs.current[`chart-${chart._id}`];
    if (!chartInstance) {
      toast.error("Chart instance not found");
      return;
    }
  };

  return (
    <>
      <Grid
        container
        spacing={STYLE_GUIDE.SPACING.s4}
        sx={{
          height: "100%",
          alignContent: "flex-start",
          p: STYLE_GUIDE.SPACING.s6,
          "& .MuiGrid-item": {
            display: "flex",
            "& > *": {
              width: "100%",
            },
          },
        }}
      >
        {numberCharts.length > 0 && (
          <Grid item xs={12}>
            <Grid container spacing={STYLE_GUIDE.SPACING.s4}>
              {numberCharts.map((chart: any, index: number) => (
                <Grid item xs={12} md={4} key={chart._id}>
                  <NumberCard
                    sx={{ ...getCardSx() }}
                    backgroundColor={
                      SABIC_COLORS_NUMBER[index % SABIC_COLORS_NUMBER.length]
                    } // Cycle through colors
                  >
                    <CardContent>
                      <ChartTitle
                        sx={{
                          color:
                            SABIC_COLORS_NUMBER[
                              index % SABIC_COLORS_NUMBER.length
                            ] === "#939598"
                              ? "#FFFFFF" // White text for Neutral Dark Gray background
                              : "#939598", // Neutral Dark Gray for other backgrounds
                        }}
                      >
                        {/* <ChartTitleText>
                          {chart.name}
                          {widgetData[chart._id]?.data?.label &&
                            ` (${widgetData[chart._id]?.data?.label})`}
                        </ChartTitleText> */}
                        {/* <Box sx={{ display: "flex", gap: 1 }}>
                          <IconButton
                            size="small"
                            onClick={() => handleFullViewClick(chart)}
                            sx={{
                              opacity: 0.7,
                              "&:hover": { opacity: 1 },
                              color:
                                SABIC_COLORS[index % SABIC_COLORS.length] ===
                                "#333333"
                                  ? "#FFFFFF" // White icon for Neutral Dark Gray background
                                  : "#333333", // Neutral Dark Gray for other backgrounds
                            }}
                          >
                            <FullscreenIcon />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={(e) => handleExportMenuClick(e, chart)}
                            sx={{
                              opacity: 0.7,
                              "&:hover": { opacity: 1 },
                              color:
                                SABIC_COLORS[index % SABIC_COLORS.length] ===
                                "#333333"
                                  ? "#FFFFFF" // White icon for Neutral Dark Gray background
                                  : "#333333", // Neutral Dark Gray for other backgrounds
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
                                "&:hover": { opacity: 1 },
                                color:
                                  SABIC_COLORS[index % SABIC_COLORS.length] ===
                                  "#333333"
                                    ? "#FFFFFF" // White icon for Neutral Dark Gray background
                                    : "#333333", // Neutral Dark Gray for other backgrounds
                              }}
                            >
                              <MoreVertIcon />
                            </IconButton>
                          )}
                        </Box> */}
                      </ChartTitle>
                      <ChartContainer
                        className="number-chart"
                        onWheel={handleWheel}
                        sx={{
                          mt: -2,
                          backgroundColor: "transparent",
                          display: "flex",
                          flexDirection: "column", // stack elements vertically if needed
                          justifyContent: "flex-start", // align to top
                          alignItems: "flex-start", // LEFT align
                          width: "100%",
                        }} // Remove fixed white background
                      >
                        {renderChart(chart)}
                      </ChartContainer>
                    </CardContent>
                  </NumberCard>
                </Grid>
              ))}
            </Grid>
          </Grid>
        )}

        {otherCharts?.map((chart: any) => (
          <>
            {isNaturalLangauage && (
              <>
                <Divider
                  sx={{ width: "100%", mt: 2, borderBottomWidth: "2px" }}
                />
                <Divider
                  sx={{ width: "100%", mt: 0.2, borderBottomWidth: "2px" }}
                />
                <Grid item xs={12}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "flex-end",
                      width: "100%",
                      mt: 2,
                    }}
                  >
                    <Box display="flex" alignItems="center" gap={1}>
                      <Box
                        sx={{
                          backgroundColor: "#e0f7fa",
                          color: "#000",
                          padding: "12px 16px",
                          borderRadius: "16px",
                          wordBreak: "break-word",
                          flexShrink: 1,
                        }}
                      >
                        <Typography
                          variant="body2"
                          fontWeight={STYLE_GUIDE.TYPOGRAPHY.fontWeight.regular}
                        >
                          {chart?.userQuery}
                        </Typography>
                      </Box>
                      <Avatar
                        sx={{
                          bgcolor: "purple",
                          width: 40,
                          height: 40,
                          fontSize: 20,
                        }}
                      >
                        U
                      </Avatar>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={12}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "flex-start",
                      width: "100%",
                      mt: 2,
                    }}
                  >
                    <Box display="flex" alignItems="center" gap={1}>
                      <Avatar
                        sx={{
                          bgcolor: "green",
                          width: 40,
                          height: 40,
                          fontSize: 20,
                        }}
                      >
                        AI
                      </Avatar>
                      <Box
                        sx={{
                          backgroundColor: "lightgray",
                          color: "#000",
                          padding: "12px 16px",
                          borderRadius: "16px",
                          wordBreak: "break-word",
                          flexShrink: 1,
                        }}
                      >
                        <Typography
                          variant="body2"
                          fontWeight={STYLE_GUIDE.TYPOGRAPHY.fontWeight.regular}
                        >
                          Here's the result based on your query:{" "}
                          {chart?.userQuery}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </Grid>

                <SaveWidgetModel
                  open={openSaveChart}
                  onClose={() => {
                    setOpenSaveChart(false);
                  }}
                  onNameChange={setNewSaveChartName}
                  dashboardList={dashboards}
                  newChartName={newSaveChartName}
                  dashBoardId={chartSaveDashboardId}
                  onDashboardChange={setChartSaveDashboardId}
                  onCreate={handleSaveWidget}
                  isCreating={isChartSaving}
                />
              </>
            )}
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
              gap={isNaturalLangauage ? 4 : 0}
              p={isNaturalLangauage ? 2 : 0}
            >
              {isNaturalLangauage && (
                <AddChartModal
                  open={true}
                  onClose={() => {}}
                  isSubmitting={false}
                  dashboardId={""}
                  initialData={chart}
                  isNaturalLangauage={true}
                  onSave={(formData) =>
                    handleChartUpdate({ ...chart, ...formData })
                  }
                  setOpenSaveChart={setOpenSaveChart}
                  setChartSaveSettingData={setChartSaveSettingData}
                  setNewSaveChartName={setNewSaveChartName}
                />
              )}
              <StyledCard sx={{ ...getCardSx() }}>
                <CardContent
                  sx={{
                    flexGrow: 1,
                    p: 3,
                    display: "flex",
                    flexDirection: "column",
                    height: "100%",
                  }}
                >
                  
                  <ChartTitle>
                    <ChartTitleText>
                      {chart.name}
                      {/* {widgetData[chart._id]?.data?.label &&
                        ` (${widgetData[chart._id]?.data?.label})`} */}
                    </ChartTitleText>
                    <Box sx={{ display: "flex", gap: 1 }}>
                      <IconButton
                        size="small"
                        onClick={() => handleFullViewClick(chart)}
                        sx={{
                          opacity: 0.7,
                          "&:hover": { opacity: 1 },
                        }}
                      >
                        <FullscreenIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={(e) => handleExportMenuClick(e, chart)}
                        sx={{
                          opacity: 0.7,
                          "&:hover": { opacity: 1 },
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
                            "&:hover": { opacity: 1 },
                          }}
                        >
                          <MoreVertIcon />
                        </IconButton>
                      )}
                    </Box>
                  </ChartTitle>
                  <Divider
                    sx={{ width: "100%", mt: 0.2, borderBottomWidth: "2px" }}
                  />
                  <ChartContainer
                    className={
                      (chart.widgetTypeId?.chartType || "line") === "pie"
                        ? "pie-chart"
                        : (chart.widgetTypeId?.chartType || "line") ===
                            "horizontalBar"
                          ? "horizontal-bar-chart"
                          : (chart.widgetTypeId?.chartType || "line") ===
                              "tabular"
                            ? "table-chart"
                            : (chart.widgetTypeId?.chartType || "line") ===
                                "multiSeriesPie"
                              ? "pie-chart"
                              : (chart.widgetTypeId?.chartType || "line") ===
                                    "stackedBarLine" ||
                                  (chart.widgetTypeId?.chartType || "line") ===
                                    "comboBarLine"
                                ? "combo-chart"
                                : "line-chart"
                    }
                    onWheel={handleWheel}
                  >
                    {renderChart(chart)}
                  </ChartContainer>
                  <Box
                    sx={{
                      mt: "auto",
                      textAlign: "right",
                      fontWeight: "bold",
                      color: "primary.main",
                    }}
                  >
                    Total:{widgetData[chart._id]?.data?.totalCount}
                  </Box>
                </CardContent>
              </StyledCard>
            </Grid>
          </>
        ))}

        {chartsLoading && isNaturalLangauage && (
          <Grid
            item
            xs={12}
            sx={{ display: "flex", justifyContent: "center", p: 2 }}
          >
            <LoadingContainer>
              <CircularProgress />
            </LoadingContainer>
          </Grid>
        )}
        {isNaturalLangauage && <Box ref={bottomRef} />}
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
        <MenuItem onClick={handleDeleteClick} sx={{ color: "error.main" }}>
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
        <MenuItem onClick={() => handleExportImage("png")}>
          <ImageIcon sx={{ mr: 1, fontSize: 20 }} />
          Export as PNG
        </MenuItem>
        <MenuItem onClick={() => handleExportImage("jpg")}>
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
        <Dialog
          open={deleteDialogOpen}
          onClose={handleDeleteCancel}
          aria-labelledby="delete-dialog-title"
        >
          <DialogTitle id="delete-dialog-title">Delete Chart</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to delete this chart? This action cannot be
              undone.
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
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogActions>
        </Dialog>
      )}

      <FullScreenModal
        open={fullViewOpen}
        onClose={handleFullViewClose}
        fullScreen
      >
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
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
              "&:hover": {
                color: theme.palette.text.primary,
                backgroundColor: theme.palette.action.hover,
              },
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <FullScreenChartContainer>
          {selectedChart && renderChart(selectedChart)}
        </FullScreenChartContainer>
      </FullScreenModal>

      {renderDrillDownDialog()}
    </>
  );
};
