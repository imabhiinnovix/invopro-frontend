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

const NumberCard = styled(Card)(({ theme }) => ({
  height: 160,
  display: "flex",
  flexDirection: "column",
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[1],
  transition: "all 0.3s ease-in-out",
  backgroundColor: theme.palette.background.paper,
  border: `1px solid ${theme.palette.divider}`,
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

const NumberDisplay = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: theme.spacing(1),
}));

const NumberValue = styled(Typography, {
  shouldForwardProp: (prop) => prop !== "widgetTheme",
})<{ widgetTheme?: Theme | null }>(({ theme, widgetTheme }) => ({
  fontSize: STYLE_GUIDE.TYPOGRAPHY.fontSize.xxxl,
  fontWeight: STYLE_GUIDE.TYPOGRAPHY.fontWeight.semiBold,
  color: widgetTheme?.colors?.[0] || theme.palette.primary.main,
  lineHeight: STYLE_GUIDE.TYPOGRAPHY.lineHeight.tight,
}));

const NumberLabel = styled(Typography)(({ theme }) => ({
  fontSize: "1rem",
  color: theme.palette.text.secondary,
  textAlign: "center",
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
  const [selectedChart, setSelectedChart] = useState<ChartResponse | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [fullViewOpen, setFullViewOpen] = useState(false);
  const [exportMenuAnchorEl, setExportMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [drillDownOpen, setDrillDownOpen] = useState(false);
  const [drillDownData, setDrillDownData] = useState<ChartDataItem[]>([]);
  const [drillDownTitle, setDrillDownTitle] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [, setTotalRecords] = useState(0);
  const [isDrillDownLoading, setIsDrillDownLoading] = useState(false);
  const [drillDownPayload, setDrillDownPayload] = useState<DrillDownPayload | null>(null);

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

  const bottomRef: any = isNaturalLangauage ? useRef<HTMLDivElement | null>(null) : "";

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
        dispatch(fetchChartData({ dashboardId }));
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
        toast.success("Chart deleted successfully!");
        dispatch(fetchChartData({ dashboardId }));
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
          "label" in dataset ? (dataset as { label: string }).label : `Series ${i + 1}`
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

  const handleExportMenuClick = (event: React.MouseEvent<HTMLElement>, chart: ChartResponse) => {
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

  const handleChartClick = async (chart: ChartResponse, elements: ActiveElement[]) => {
    if (!elements || !elements.length) return;

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

  const handlePageChange = async (event: React.ChangeEvent<unknown>, value: number) => {
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
      chartType: widgetTypes.find((data) => data._id === formData.widgetTypeId)?.chartType,
    };

    console.log("newFormData", newFormData, widgetTypes);
    await dispatch(fetchIndividualWidgetData(newFormData));
  };

  const handleSaveWidget = async () => {
    console.log(chartSaveSettingData, "chartSaveSettingData");
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



// Complete getChartData function with all chart types
const getChartData = (chart: ChartResponse) => {
  const createDefaultDataset = (data: number[] = []): ChartDataset => ({
    label: chart.name,
    data,
    borderColor: theme.palette.primary.main,
    backgroundColor: theme.palette.primary.light,
    tension: 0.1,
    fill: chart.widgetTypeId?.chartType === "area" ? "start" : false,
    pointRadius: 5,
    pointHoverRadius: 9,
    pointHitRadius: 20,
  });

  const chartData =
    widgetData[chart._id]?.data?.widgetData || chart.data || [];

  if (
    !chartData.length ||
    chartData.every((item: ChartDataItem) => item.data === 0)
  ) {
    return {
      labels: [],
      datasets: [createDefaultDataset()],
      isEmpty: true,
    };
  }

  const chartType = chart.widgetTypeId?.chartType || "line";
  const groupBy = chart.groupBy || [];

  // Handle line chart
  if (chartType === "line") {
    if (groupBy.length > 0) {
      const groupByField = groupBy[0];
      const uniqueGroups = Array.from(
        new Set(chartData.map((item) => item[groupByField]))
      );
      const uniqueNames = Array.from(
        new Set(chartData.map((item) => item.name))
      );
      let uniqueNameDataMap: any = {};

      const datasets = uniqueGroups.map((group, index) => {
        let totalDataBasedOnGroup = 0;
        const groupData = uniqueNames.map((name) => {
          const dataPoint = chartData.find(
            (item) => item.name === name && item[groupByField] === group
          );
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
          borderColor:
            widgetTheme?.borderColor?.[index % widgetTheme?.borderColor.length] ||
            theme.palette.primary.main,
          backgroundColor: "transparent",
          tension: 0.1,
          fill: false,
          pointRadius: 5,
          pointHoverRadius: 9,
          pointHitRadius: 20,
        };
      });
      return {
        labels: uniqueNames,
        datasets,
      };
    } else {
      const lineLabels = chartData.map((item: ChartDataItem) => item.name);
      const values = chartData.map((item: ChartDataItem) => item.data);
      return {
        labels: lineLabels,
        datasets: [
          {
            label: chart.name,
            data: values,
            borderColor: widgetTheme?.borderColor?.[0] || theme.palette.primary.main,
            backgroundColor: "transparent",
            tension: 0.1,
            fill: false,
            pointRadius: 5,
            pointHoverRadius: 9,
            pointHitRadius: 20,
          },
        ],
      };
    }
  }

  // Handle area chart
  if (chartType === "area") {
    if (groupBy.length > 0) {
      const groupByField = groupBy[0];
      const uniqueGroups = Array.from(
        new Set(chartData.map((item) => item[groupByField]))
      );
      const uniqueNames = Array.from(
        new Set(chartData.map((item) => item.name))
      );
      let uniqueNameDataMap: any = {};

      const datasets = uniqueGroups.map((group, index) => {
        let totalDataBasedOnGroup = 0;
        const groupData = uniqueNames.map((name) => {
          const dataPoint = chartData.find(
            (item) => item.name === name && item[groupByField] === group
          );
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
          borderColor:
            widgetTheme?.borderColor?.[index % widgetTheme?.borderColor.length],
          backgroundColor:
            widgetTheme?.backgroundColor?.[index % widgetTheme?.backgroundColor.length],
          tension: 0.1,
          fill: "start",
          pointRadius: 5,
          pointHoverRadius: 9,
          pointHitRadius: 20,
        };
      });
      return {
        labels: uniqueNames,
        datasets,
      };
    } else {
      const areaLabels = chartData.map((item: ChartDataItem) => item.name);
      const values = chartData.map((item: ChartDataItem) => item.data);
      return {
        labels: areaLabels,
        datasets: [
          {
            label: chart.name,
            data: values,
            borderColor: widgetTheme?.borderColor?.[0],
            backgroundColor: widgetTheme?.backgroundColor?.[0],
            tension: 0.1,
            fill: "start",
            pointRadius: 5,
            pointHoverRadius: 9,
            pointHitRadius: 20,
          },
        ],
      };
    }
  }

  // Handle horizontal bar chart
  if (chartType === "horizontalBar") {
    if (!groupBy || groupBy.length === 0) {
      const labels = chartData.map((item: ChartDataItem) => item.name);
      const values = chartData.map((item: ChartDataItem) => item.data);

      return {
        labels,
        datasets: [
          {
            label: chart.aggregation?.attributeName || chart.name || "Count",
            data: values,
            backgroundColor: widgetTheme?.backgroundColor || theme.palette.primary.main,
            borderColor: widgetTheme?.borderColor || theme.palette.primary.dark,
            borderWidth: 1,
            borderRadius: 4,
          },
        ],
      };
    }
    
    const groupByField = groupBy[0];
    const uniqueGroups = Array.from(
      new Set(chartData.map((item) => item[groupByField] as string))
    );
    const uniqueNames = Array.from(
      new Set(chartData.map((item) => item.name))
    );
    
    const datasets = uniqueGroups.map((group, index) => {
      const groupData = uniqueNames.map((name) => {
        const dataPoint = chartData.find(
          (item) => item.name === name && item[groupByField] === group
        );
        return dataPoint ? dataPoint.data : 0;
      });

      return {
        label: group,
        data: groupData,
        backgroundColor: widgetTheme?.backgroundColor?.[index % (widgetTheme?.backgroundColor?.length || 1)] || theme.palette.primary.main,
        borderColor: widgetTheme?.borderColor || theme.palette.primary.dark,
        borderWidth: 1,
        borderRadius: 4,
      };
    });

    return {
      labels: uniqueNames,
      datasets,
    };
  }

  // Handle vertical bar, stacked bar, multi series bar
  if (
    chartType === "verticalBar" ||
    chartType === "stackedBar" ||
    chartType === "multiSeriesBar"
  ) {
    if (!groupBy || groupBy.length === 0) {
      const labels = chartData.map((item: ChartDataItem) => item.name);
      const values = chartData.map((item: ChartDataItem) => item.data);

      return {
        labels,
        datasets: [
          {
            label: chart.aggregation?.attributeName || chart.name || "Count",
            data: values,
            backgroundColor: widgetTheme?.backgroundColor || theme.palette.primary.main,
            borderColor: widgetTheme?.borderColor || theme.palette.primary.dark,
            borderWidth: 1,
            borderRadius: 4,
          },
        ],
      };
    }

    const groupByField = groupBy[0];
    const uniqueGroups = Array.from(
      new Set(chartData.map((item) => item[groupByField] as string))
    );
    const uniqueNames = Array.from(
      new Set(chartData.map((item) => item.name))
    );

    const datasets = uniqueGroups.map((group, index) => {
      const groupData = uniqueNames.map((name) => {
        const dataPoint = chartData.find(
          (item) => item.name === name && item[groupByField] === group
        );
        return dataPoint ? dataPoint.data : 0;
      });

      return {
        label: group,
        data: groupData,
        backgroundColor:
          widgetTheme?.backgroundColor?.[index % (widgetTheme?.backgroundColor?.length || 1)],
        borderColor: widgetTheme?.borderColor,
        borderWidth: 1,
        borderRadius: 4,
      };
    });

    return { labels: uniqueNames, datasets };
  }

  // Handle pie chart, doughnut, multi series pie
  if (chartType === "pie" || chartType === "doughnut" || chartType === "multiSeriesPie") {
    if (groupBy.length > 0) {
      const groupByField = groupBy[0];
      const uniqueGroups = Array.from(
        new Set(chartData.map((item) => item[groupByField] as string))
      );
      const uniqueNames = Array.from(
        new Set(chartData.map((item) => item.name))
      );

      const datasets = uniqueGroups.map((group, index) => {
        const groupData = uniqueNames.map((name) => {
          const dataPoint = chartData.find(
            (item) => item.name === name && item[groupByField] === group
          );
          return dataPoint ? dataPoint.data : 0;
        });

        return {
          label: group,
          data: groupData,
          backgroundColor:
            widgetTheme?.backgroundColor?.[index % (widgetTheme?.backgroundColor?.length || 1)],
          borderColor: widgetTheme?.borderColor,
          borderWidth: 2,
        };
      });

      return {
        labels: uniqueNames,
        datasets,
      };
    }

    const pieLabels = chartData.map((item: ChartDataItem) => item.name);
    const values = chartData.map((item: ChartDataItem) => item.data);

    return {
      labels: pieLabels,
      datasets: [
        {
          data: values,
          backgroundColor: widgetTheme?.backgroundColor,
          borderColor: widgetTheme?.borderColor,
          borderWidth: 2,
        },
      ],
    };
  }

  // Handle bubble chart
  if (chartType === "bubble") {
    const bubbleData = chartData.map((item: ChartDataItem, index) => ({
      x: item.data,
      y: item.data,
      r: Math.max(5, item.data / 10), // Dynamic radius based on data
    }));

    return {
      datasets: [
        {
          label: chart.name,
          data: bubbleData,
          backgroundColor: widgetTheme?.backgroundColor || theme.palette.primary.main,
          borderColor: widgetTheme?.borderColor || theme.palette.primary.dark,
        },
      ],
    };
  }

  // Handle scatter chart
  if (chartType === "scatter") {
    const scatterData = chartData.map((item: ChartDataItem, index) => ({
      x: index,
      y: item.data,
    }));

    return {
      datasets: [
        {
          label: chart.name,
          data: scatterData,
          backgroundColor: widgetTheme?.backgroundColor || theme.palette.primary.main,
          borderColor: widgetTheme?.borderColor || theme.palette.primary.dark,
        },
      ],
    };
  }

  // Handle polar area chart
  if (chartType === "polarArea") {
    if (groupBy.length > 0) {
      const groupByField = groupBy[0];
      const uniqueGroups = Array.from(
        new Set(chartData.map((item: ChartDataItem) => item[groupByField] as string))
      );
      const uniqueNames = Array.from(
        new Set(chartData.map((item: ChartDataItem) => item.name))
      );

      const datasets = uniqueGroups.map((group, index) => {
        const groupData = uniqueNames.map((name) => {
          const dataPoint = chartData.find(
            (item) => item.name === name && item[groupByField] === group
          );
          return dataPoint ? dataPoint.data : 0;
        });

        return {
          label: group,
          data: groupData,
          backgroundColor:
            widgetTheme?.backgroundColor?.[index % (widgetTheme?.backgroundColor?.length || 1)],
          borderColor: widgetTheme?.borderColor,
          borderWidth: 2,
        };
      });

      return {
        labels: uniqueNames,
        datasets,
      };
    }

    const polarLabels = chartData.map((item: ChartDataItem) => item.name);
    const values = chartData.map((item: ChartDataItem) => item.data);

    return {
      labels: polarLabels,
      datasets: [
        {
          data: values,
          backgroundColor: widgetTheme?.backgroundColor,
          borderColor: widgetTheme?.borderColor,
          borderWidth: 2,
        },
      ],
    };
  }

  // Handle radar chart
  if (chartType === "radar") {
    if (groupBy.length > 0) {
      const groupByField = groupBy[0];
      const uniqueGroups = Array.from(
        new Set(chartData.map((item) => item[groupByField] as string))
      );
      const uniqueNames = Array.from(
        new Set(chartData.map((item) => item.name))
      );

      const datasets = uniqueGroups.map((group, index) => {
        const groupData = uniqueNames.map((name) => {
          const dataPoint = chartData.find(
            (item) => item.name === name && item[groupByField] === group
          );
          return dataPoint ? dataPoint.data : 0;
        });

        return {
          label: group,
          data: groupData,
          backgroundColor:
            widgetTheme?.backgroundColor?.[index % (widgetTheme?.backgroundColor?.length || 1)],
          borderColor: widgetTheme?.borderColor?.[index % (widgetTheme?.borderColor?.length || 1)],
          pointBackgroundColor: widgetTheme?.colors,
          pointBorderColor: widgetTheme?.borderColor,
          tension: 0.1,
          pointRadius: 5,
        };
      });

      return {
        labels: uniqueNames,
        datasets,
      };
    }

    const radarLabels = chartData.map((item: ChartDataItem) => item.name);
    const values = chartData.map((item: ChartDataItem) => item.data);
    return {
      labels: radarLabels,
      datasets: [
        {
          label: chart.name,
          data: values,
          backgroundColor: widgetTheme?.backgroundColor?.[0],
          borderColor: widgetTheme?.borderColor?.[0],
          pointBackgroundColor: widgetTheme?.backgroundColor,
          pointBorderColor: widgetTheme?.borderColor,
          tension: 0.1,
          pointRadius: 5,
        },
      ],
    };
  }

  // Handle combo bar-line chart
  if (chartType === "comboBarLine") {
    const barLabels = Array.from(
      new Set(chartData.map((item: ChartDataItem) => item.name))
    );

    if (groupBy.length > 0) {
      const groupByField = groupBy[0];
      const uniqueGroups = Array.from(
        new Set(chartData.map((item) => item[groupByField] as string))
      );

      const datasets = uniqueGroups.map((group, index) => {
        const groupData = barLabels.map((name) => {
          const dataPoint = chartData.find(
            (item) => item.name === name && item[groupByField] === group
          );
          return dataPoint ? dataPoint.data : 0;
        });

        if (index === 0) {
          return {
            label: group,
            data: groupData,
            type: "line" as const,
            borderColor: widgetTheme?.colors?.[0] || theme.palette.primary.main,
            backgroundColor: "transparent",
            tension: 0.1,
            fill: false,
            pointRadius: 5,
            yAxisID: "y1",
          };
        } else {
          return {
            label: group,
            data: groupData,
            type: "bar" as const,
            backgroundColor:
              widgetTheme?.backgroundColor?.[
                (index - 1) % (widgetTheme?.backgroundColor?.length || 1)
              ],
            borderColor: widgetTheme?.borderColor,
            borderWidth: 1,
            yAxisID: "y",
          };
        }
      });

      return { labels: barLabels, datasets };
    }

    const values = chartData.map((item: ChartDataItem) => item.data);
    return {
      labels: barLabels,
      datasets: [
        {
          label: chart.name,
          data: values,
          type: "bar" as const,
          backgroundColor: widgetTheme?.backgroundColor,
          borderColor: widgetTheme?.borderColor,
          borderWidth: 1,
        },
      ],
    };
  }

  // Handle stacked bar-line chart
  if (chartType === "stackedBarLine") {
    const barLabels = Array.from(
      new Set(chartData.map((item: ChartDataItem) => item.name))
    );

    if (groupBy.length > 0) {
      const groupByField = groupBy[0];
      const uniqueGroups = Array.from(
        new Set(chartData.map((item) => item[groupByField] as string))
      );

      const datasets = uniqueGroups.map((group, index) => {
        const groupData = barLabels.map((name) => {
          const dataPoint = chartData.find(
            (item) => item.name === name && item[groupByField] === group
          );
          return dataPoint ? dataPoint.data : 0;
        });

        if (index === 0) {
          return {
            label: group,
            data: groupData,
            type: "line" as const,
            borderColor: widgetTheme?.colors?.[0] || theme.palette.primary.main,
            backgroundColor: "transparent",
            tension: 0.1,
            fill: false,
            pointRadius: 5,
            yAxisID: "y1",
          };
        } else {
          return {
            label: group,
            data: groupData,
            type: "bar" as const,
            backgroundColor:
              widgetTheme?.backgroundColor?.[
                (index - 1) % (widgetTheme?.backgroundColor?.length || 1)
              ],
            borderColor: widgetTheme?.borderColor,
            borderWidth: 1,
            stack: "stack1",
            yAxisID: "y",
          };
        }
      });

      return { labels: barLabels, datasets };
    }

    const values = chartData.map((item: ChartDataItem) => item.data);
    return {
      labels: barLabels,
      datasets: [
        {
          label: chart.name,
          data: values,
          type: "bar" as const,
          backgroundColor: widgetTheme?.backgroundColor,
          borderColor: widgetTheme?.borderColor,
          borderWidth: 1,
        },
      ],
    };
  }

  // Default fallback
  const defaultLabels = chartData.map((item: ChartDataItem) => item.name);
  const values = chartData.map((item: ChartDataItem) => item.data);

  return {
    labels: defaultLabels,
    datasets: [createDefaultDataset(values)],
    isEmpty: false,
  };
};


const renderChart = (chart: ChartResponse) => {
  const chartData = getChartData(chart);

  const dimensionField =
    Array.isArray(chart.dimensions) && chart.dimensions.length > 0
      ? chart.dimensions[0]
      : typeof chart.dimensions === "string"
        ? chart.dimensions
        : "name";

  const aggregationField = chart.aggregation?.attributeName || "data";

  const chartType = chart.widgetTypeId?.chartType || "line";
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
    case "number":
      return (
        <NumberDisplay>
          <NumberValue widgetTheme={widgetTheme}>
            {numberValue.toLocaleString()}
          </NumberValue>
          <NumberLabel>{chart.name}</NumberLabel>
        </NumberDisplay>
      );

    case "pie":
      return (
        <Pie
          {...baseChartProps}
          data={chartData as ChartData<"pie">}
          plugins={
            widgetTheme?.showLegendOverlay ? [sliceLabelsPlugin] : undefined
          }
          ref={(ref) => {
            chartRefs.current[chartId] = ref as ChartJS<"pie"> | null;
          }}
        />
      );

    case "doughnut":
      return (
        <Doughnut
          {...baseChartProps}
          data={chartData as ChartData<"doughnut">}
          ref={(ref) => {
            chartRefs.current[chartId] = ref as ChartJS<"doughnut"> | null;
          }}
          plugins={
            widgetTheme?.showLegendOverlay ? [sliceLabelsPlugin] : undefined
          }
        />
      );

    case "multiSeriesPie":
      return (
        <Pie
          {...baseChartProps}
          data={chartData as ChartData<"pie">}
          ref={(ref) => {
            chartRefs.current[chartId] = ref as ChartJS<"pie"> | null;
          }}
        />
      );

    case "horizontalBar":
      return (
        <Bar
          {...baseChartProps}
          data={chartData as ChartData<"bar">}
          plugins={
            widgetTheme?.showLegendOverlay ? [barLabelsPlugin] : undefined
          }
          ref={(ref) => {
            chartRefs.current[chartId] = ref as ChartJS<"bar"> | null;
          }}
        />
      );

    case "verticalBar":
    case "stackedBar":
    case "multiSeriesBar":
      return (
        <Bar
          {...baseChartProps}
          data={chartData as ChartData<"bar">}
          plugins={
            widgetTheme?.showLegendOverlay ? [barLabelsPlugin] : undefined
          }
          ref={(ref) => {
            chartRefs.current[chartId] = ref as ChartJS<"bar"> | null;
          }}
        />
      );

    // 新增多系列折线图支持
    case "multiSeriesLine":
    case "line":
      return (
        <Line
          {...baseChartProps}
          data={chartData as ChartData<"line">}
          plugins={
            widgetTheme?.showLegendOverlay ? [pointLabelsPlugin] : undefined
          }
          ref={(ref) => {
            chartRefs.current[chartId] = ref as ChartJS<"line"> | null;
          }}
        />
      );

    case "bubble":
      return (
        <Chart
          type="bubble"
          data={chartData as ChartData<"bubble">}
          options={options}
          ref={(ref) => {
            chartRefs.current[chartId] = ref as ChartJS | null;
          }}
        />
      );

    case "scatter":
      return (
        <Chart
          type="scatter"
          data={chartData as ChartData<"scatter">}
          options={options}
          ref={(ref) => {
            chartRefs.current[chartId] = ref as ChartJS | null;
          }}
        />
      );

    case "radar":
      return (
        <Radar
          {...baseChartProps}
          data={chartData as ChartData<"radar">}
          ref={(ref) => {
            chartRefs.current[chartId] = ref as ChartJS<"radar"> | null;
          }}
        />
      );

    case "polarArea":
      return (
        <PolarArea
          {...baseChartProps}
          data={chartData as ChartData<"polarArea">}
          plugins={
            widgetTheme?.showLegendOverlay
              ? [polarAreaLabelsPlugin]
              : undefined
          }
          ref={(ref) => {
            chartRefs.current[chartId] = ref as ChartJS<"polarArea"> | null;
          }}
        />
      );

    case "stackedBarLine":
    case "comboBarLine":
      return (
        <Chart
          type="bar"
          data={chartData as ChartData<"bar">}
          options={options}
          ref={(ref) => {
            chartRefs.current[chartId] = ref as ChartJS | null;
          }}
        />
      );

    case "area":
      return (
        <Line
          {...baseChartProps}
          data={chartData as ChartData<"line">}
          plugins={
            widgetTheme?.showLegendOverlay ? [pointLabelsPlugin] : undefined
          }
          ref={(ref) => {
            chartRefs.current[chartId] = ref as ChartJS<"line"> | null;
          }}
        />
      );

    case "tabular":
      const chartDataArray =
        widgetData[chart._id]?.data?.widgetData || chart.data || [];

      const columns =
        chartDataArray.length > 0
          ? Object.keys(chartDataArray[0]).map((col) => {
              if (col === "name") return dimensionField;
              if (col === "data") return aggregationField;
              return col;
            })
          : [];

      return (
        <TableContainer
          component={Paper}
          sx={{
            ...getTableSx(),
            maxHeight: 400,
            overflow: "auto",
            backgroundColor:
              themeUnified.palette.background.paper ||
              STYLE_GUIDE.COLORS.white,
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
                        themeUnified.palette.table?.headerBackground ||
                        STYLE_GUIDE.COLORS.backgroundLightGray,
                      fontWeight: STYLE_GUIDE.TYPOGRAPHY.fontWeight.semiBold,
                      fontSize: "14px",
                      color:
                        themeUnified.palette.table?.headerText ||
                        STYLE_GUIDE.COLORS.textGray,
                      borderBottom: `2px solid ${themeUnified.palette.divider}`,
                      padding: "12px 16px",
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
                  {columns.map((column) => {
                    let value;
                    if (column === dimensionField && "name" in row)
                      value = row["name"];
                    else if (column === aggregationField && "data" in row)
                      value = row["data"];
                    else value = row[column];

                    return (
                      <TableCell
                        key={`${rowIndex}-${column}`}
                        sx={{
                          padding: "12px 16px",
                          borderBottom: `1px solid ${themeUnified.palette.divider}`,
                          color:
                            themeUnified.palette.table?.rowText ||
                            STYLE_GUIDE.COLORS.textDarkGray,
                        }}
                      >
                        {typeof value === "number"
                          ? value.toLocaleString()
                          : value}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      );

    default:
      // 默认使用折线图
      return (
        <Line
          {...baseChartProps}
          data={chartData as ChartData<"line">}
          plugins={
            widgetTheme?.showLegendOverlay ? [pointLabelsPlugin] : undefined
          }
          ref={(ref) => {
            chartRefs.current[chartId] = ref as ChartJS<"line"> | null;
          }}
        />
      );
  }
};

  const getChartOptions = (chartType: string, chart: ChartResponse) => {
    const baseOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: (widgetTheme?.legend?.position ?? "bottom") as "bottom" | "right" | "center" | "top" | "left" | "chartArea",
          display: widgetTheme?.legend?.display ?? true,
          align: "start" as const,
          labels: {
            usePointStyle: true,
            color: widgetTheme?.legend?.labels?.color ?? theme.palette.text.primary,
            padding: widgetTheme?.legend?.labels?.padding ?? 15,
            font: { size: widgetTheme?.legend?.labels?.font?.size ?? 12 },
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
      case "pie":
      case "doughnut":
      case "polarArea":
        return {
          ...baseOptions,
          plugins: {
            ...baseOptions.plugins,
            legend: {
              ...baseOptions.plugins.legend,
              position: (widgetTheme?.legend?.position ?? "right") as "bottom" | "right" | "center" | "top" | "left" | "chartArea",
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
                text: chart?.aggregation?.attributeName || "Y-axis",
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
                font: { size: 11 },
              },
            },
            x: {
              title: {
                color: widgetTheme?.scales?.x?.ticks?.color ?? "grey",
                display: true,
                text: chart?.dimensions?.[0] || "X-axis",
              },
              display: widgetTheme?.scales?.x?.display ?? true,
              grid: {
                display: widgetTheme?.scales?.x?.grid?.display ?? false,
                tickColor: widgetTheme?.scales?.x?.ticks?.color ?? "red",
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

      case "horizontalBar":
        return {
          ...baseOptions,
          indexAxis: "y" as const,
          scales: {
            x: {
              title: {
                display: true,
                text: chart.aggregation?.attributeName || "Count",
                color: widgetTheme?.scales?.x?.ticks?.color || theme.palette.text.primary,
                font: { size: 14, weight: 'bold' as const },
              },
              display: widgetTheme?.scales?.x?.display ?? true,
              beginAtZero: widgetTheme?.scales?.y?.beginAtZero ?? true,
              grid: {
                display: widgetTheme?.scales?.x?.grid?.display ?? true,
                color: widgetTheme?.scales?.x?.grid?.color || theme.palette.divider,
                drawBorder: widgetTheme?.scales?.x?.grid?.drawBorder ?? false,
              },
              ticks: {
                color: widgetTheme?.scales?.x?.ticks?.color || theme.palette.text.secondary,
                padding: widgetTheme?.scales?.x?.ticks?.padding ?? 8,
                font: { size: 12 },
              },
            },
            y: {
              title: {
                display: true,
                text: chart.dimensions?.[0] || "Category",
                color: widgetTheme?.scales?.y?.ticks?.color || theme.palette.text.primary,
                font: { size: 14, weight: "bold" },
              },
              display: widgetTheme?.scales?.y?.display ?? true,
              grid: {
                display: widgetTheme?.scales?.y?.grid?.display ?? false,
                color: widgetTheme?.scales?.y?.grid?.color || theme.palette.divider,
                drawBorder: widgetTheme?.scales?.y?.grid?.drawBorder ?? false,
              },
              ticks: {
                color: widgetTheme?.scales?.y?.ticks?.color || theme.palette.text.secondary,
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
                color: widgetTheme?.legend?.labels?.color || theme.palette.text.primary,
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
                text: chart?.dimensions?.[0] || "Category",
              },
              display: widgetTheme?.scales?.x?.display ?? true,
              grid: {
                display: widgetTheme?.scales?.x?.grid?.display ?? false,
                color: widgetTheme?.scales?.x?.grid?.color ?? theme.palette.divider,
                drawBorder: widgetTheme?.scales?.x?.grid?.drawBorder ?? false,
              },
              ticks: {
                color: widgetTheme?.scales?.x?.ticks?.color ?? theme.palette.text.secondary,
                padding: widgetTheme?.scales?.x?.ticks?.padding ?? 8,
              },
              stacked: isStacked,
            },
            y: {
              title: {
                color: widgetTheme?.scales?.x?.ticks?.color ?? "grey",
                display: true,
                text: chart?.aggregation?.attributeName || "Value",
              },
              display: widgetTheme?.scales?.y?.display ?? true,
              beginAtZero: widgetTheme?.scales?.y?.beginAtZero ?? true,
              grid: {
                display: widgetTheme?.scales?.y?.grid?.display ?? false,
                color: widgetTheme?.scales?.y?.grid?.color ?? theme.palette.divider,
                drawBorder: widgetTheme?.scales?.y?.grid?.drawBorder ?? false,
              },
              ticks: {
                padding: widgetTheme?.scales?.y?.ticks?.padding ?? 8,
              },
              stacked: isStacked,
            },
          },
        };

      case "stackedBarLine":
        return {
          ...baseOptions,
          scales: {
            y: {
              type: "linear" as const,
              display: widgetTheme?.scales?.y?.display ?? true,
              position: "left" as const,
              beginAtZero: widgetTheme?.scales?.y?.beginAtZero ?? true,
              grid: {
                color: widgetTheme?.scales?.y?.grid?.color ?? theme.palette.divider,
                drawBorder: widgetTheme?.scales?.y?.grid?.drawBorder ?? false,
              },
              stacked: true,
              title: {
                color: widgetTheme?.scales?.x?.ticks?.color ?? "grey",
                display: true,
                text: chart?.aggregation?.attributeName || "Bar Values",
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
                text: chart?.aggregation?.attributeName || "Line Values",
              },
              ticks: {
                padding: widgetTheme?.scales?.y?.ticks?.padding ?? 8,
              },
            },
            x: {
              title: {
                color: widgetTheme?.scales?.x?.ticks?.color ?? "grey",
                display: true,
                text: chart?.dimensions?.[0] || "X-axis",
              },
              display: widgetTheme?.scales?.x?.display ?? true,
              grid: {
                display: widgetTheme?.scales?.x?.grid?.display ?? false,
                tickColor: widgetTheme?.scales?.x?.ticks?.color ?? "red",
              },
              ticks: {
                color: widgetTheme?.scales?.x?.ticks?.color ?? theme.palette.text.secondary,
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
                text: chart.dimensions?.[0] || "Category",
                color: widgetTheme?.scales?.x?.ticks?.color || theme.palette.text.primary,
                font: { size: 14, weight: "bold" },
              },
              display: widgetTheme?.scales?.x?.display ?? true,
              grid: {
                display: widgetTheme?.scales?.x?.grid?.display ?? true,
                color: widgetTheme?.scales?.x?.grid?.color || theme.palette.divider,
              },
              ticks: {
                color: widgetTheme?.scales?.x?.ticks?.color || theme.palette.text.secondary,
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
                text: "Bar Values",
                color: widgetTheme?.scales?.y?.ticks?.color || theme.palette.text.primary,
                font: { size: 14, weight: "bold" },
              },
              grid: {
                display: true,
                color: widgetTheme?.scales?.y?.grid?.color || theme.palette.divider,
                drawBorder: false,
              },
              ticks: {
                color: widgetTheme?.scales?.y?.ticks?.color || theme.palette.text.secondary,
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
                text: "Line Values",
                color: widgetTheme?.scales?.y?.ticks?.color || theme.palette.text.primary,
                font: { size: 14, weight: "bold" },
              },
              grid: {
                drawOnChartArea: false,
              },
              ticks: {
                color: widgetTheme?.scales?.y?.ticks?.color || theme.palette.text.secondary,
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
                color: widgetTheme?.legend?.labels?.color || theme.palette.text.primary,
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
                color: widgetTheme?.scales?.y?.grid?.color ?? theme.palette.divider,
              },
              angleLines: {
                color: widgetTheme?.scales?.y?.grid?.color ?? theme.palette.divider,
              },
              pointLabels: {
                color: widgetTheme?.scales?.x?.ticks?.color ?? theme.palette.text.secondary,
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

  

//   const renderChart = (chart: ChartResponse) => {
//   const chartData = getChartData(chart);

//   const dimensionField =
//     Array.isArray(chart.dimensions) && chart.dimensions.length > 0
//       ? chart.dimensions[0]
//       : typeof chart.dimensions === "string"
//       ? chart.dimensions
//       : "name";

//   const aggregationField = chart.aggregation?.attributeName || "data";
//   const chartType = chart.widgetTypeId?.chartType || "line";
//   const chartId = chart._id;
//   const numberValue = chartData.datasets?.[0]?.data?.[0] || 0;

//   if (chartData.isEmpty) {
//     return (
//       <Typography color="text.secondary" variant="h6">
//         No data present for this set of data :|
//       </Typography>
//     );
//   }

//   const baseChartProps = {
//     id: `chartCanvas_${chartId}`,
//     options: {
//       ...getChartOptions(chartType, chart),
//       onClick: (event: ChartEvent, elements: ActiveElement[]) => {
//         handleChartClick(chart, elements);
//       },
//     },
//   };

//   switch (chartType) {
//     /** ================== NUMBER WIDGET ================== */
//     case "number":
//       return (
//         <div
//           id={`numberWidget_${chartId}`}
//           style={{
//             display: "flex",
//             flexDirection: "column",
//             alignItems: "center",
//             justifyContent: "center",
//             padding: "20px",
//             borderRadius: "12px",
//             background: "#fff",
//             boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
//           }}
//         >
//           <Typography
//             variant="h3"
//             style={{
//               fontWeight: "bold",
//               color: "#333",
//             }}
//           >
//             {numberValue.toLocaleString()}
//           </Typography>
//           <Typography
//             variant="subtitle1"
//             color="textSecondary"
//             style={{ marginTop: "8px" }}
//           >
//             {chart.name}
//           </Typography>
//         </div>
//       );

//     /** ================== PIE ================== */
//     case "pie":
//       return (
//         <Pie
//           {...baseChartProps}
//           data={chartData as ChartData<"pie">}
//           ref={(ref) => {
//             chartRefs.current[chartId] = ref as ChartJS<"pie"> | null;
//           }}
//         />
//       );

//     /** ================== DOUGHNUT ================== */
//     case "doughnut":
//       return (
//         <Doughnut
//           {...baseChartProps}
//           data={chartData as ChartData<"doughnut">}
//           ref={(ref) => {
//             chartRefs.current[chartId] = ref as ChartJS<"doughnut"> | null;
//           }}
//         />
//       );

//     /** ================== BAR TYPES ================== */
//     case "horizontalBar":
//     case "verticalBar":
//     case "stackedBar":
//     case "multiSeriesBar":
//       return (
//         <Bar
//           {...baseChartProps}
//           data={chartData as ChartData<"bar">}
//           ref={(ref) => {
//             chartRefs.current[chartId] = ref as ChartJS<"bar"> | null;
//           }}
//         />
//       );

//     /** ================== LINE / AREA ================== */
//     case "line":
//     case "area":
//       return (
//         <Line
//           {...baseChartProps}
//           data={chartData as ChartData<"line">}
//           ref={(ref) => {
//             chartRefs.current[chartId] = ref as ChartJS<"line"> | null;
//           }}
//         />
//       );

//     /** ================== STACKED BAR + LINE / COMBO ================== */
//     case "stackedBarLine":
//     case "comboBarLine":
//       return (
//         <Chart
//           type="bar"
//           data={chartData as any}
//           options={baseChartProps.options}
//           ref={(ref) => {
//             chartRefs.current[chartId] = ref as ChartJS | null;
//           }}
//         />
//       );

//     /** ================== OTHER TYPES ================== */
//     case "radar":
//       return (
//         <Radar
//           {...baseChartProps}
//           data={chartData as ChartData<"radar">}
//           ref={(ref) => {
//             chartRefs.current[chartId] = ref as ChartJS<"radar"> | null;
//           }}
//         />
//       );

//     case "polarArea":
//       return (
//         <PolarArea
//           {...baseChartProps}
//           data={chartData as ChartData<"polarArea">}
//           ref={(ref) => {
//             chartRefs.current[chartId] = ref as ChartJS<"polarArea"> | null;
//           }}
//         />
//       );

//     case "bubble":
//       return (
//         <Chart
//           type="bubble"
//           data={chartData as ChartData<"bubble">}
//           options={baseChartProps.options}
//           ref={(ref) => {
//             chartRefs.current[chartId] = ref as ChartJS | null;
//           }}
//         />
//       );

//     case "scatter":
//       return (
//         <Chart
//           type="scatter"
//           data={chartData as ChartData<"scatter">}
//           options={baseChartProps.options}
//           ref={(ref) => {
//             chartRefs.current[chartId] = ref as ChartJS | null;
//           }}
//         />
//       );

//     /** ================== TABULAR DATA ================== */
//     case "tabular":
//       const chartDataArray =
//         widgetData[chart._id]?.data?.widgetData || chart.data || [];

//       const columns =
//         chartDataArray.length > 0
//           ? Object.keys(chartDataArray[0]).map((col) => {
//               if (col === "name") return dimensionField;
//               if (col === "data") return aggregationField;
//               return col;
//             })
//           : [];

//       return (
//         <TableContainer
//           component={Paper}
//           sx={{
//             ...getTableSx(),
//             maxHeight: 400,
//             overflow: "auto",
//             backgroundColor:
//               themeUnified.palette.background.paper ||
//               STYLE_GUIDE.COLORS.white,
//           }}
//         >
//           <Table stickyHeader>
//             <TableHead>
//               <TableRow>
//                 {columns.map((column) => (
//                   <TableCell
//                     key={column}
//                     sx={{
//                       backgroundColor:
//                         themeUnified.palette.table?.headerBackground ||
//                         STYLE_GUIDE.COLORS.backgroundLightGray,
//                       fontWeight: STYLE_GUIDE.TYPOGRAPHY.fontWeight.semiBold,
//                       fontSize: "14px",
//                       color:
//                         themeUnified.palette.table?.headerText ||
//                         STYLE_GUIDE.COLORS.textGray,
//                       borderBottom: `2px solid ${themeUnified.palette.divider}`,
//                       padding: "12px 16px",
//                     }}
//                   >
//                     {column}
//                   </TableCell>
//                 ))}
//               </TableRow>
//             </TableHead>
//             <TableBody>
//               {chartDataArray?.map((row, rowIndex) => (
//                 <TableRow
//                   key={rowIndex}
//                   sx={{
//                     backgroundColor:
//                       rowIndex % 2 === 0
//                         ? themeUnified.palette.table?.rowEvenBackground ||
//                           STYLE_GUIDE.COLORS.white
//                         : themeUnified.palette.table?.rowOddBackground ||
//                           STYLE_GUIDE.COLORS.backgroundDefault,
//                     "&:hover": {
//                       backgroundColor:
//                         themeUnified.palette.table?.rowHoverBackground ||
//                         STYLE_GUIDE.COLORS.backgroundHover,
//                     },
//                   }}
//                 >
//                   {columns.map((column) => {
//                     let value;
//                     if (column === dimensionField && "name" in row)
//                       value = row["name"];
//                     else if (column === aggregationField && "data" in row)
//                       value = row["data"];
//                     else value = row[column];

//                     return (
//                       <TableCell
//                         key={`${rowIndex}-${column}`}
//                         sx={{
//                           padding: "12px 16px",
//                           borderBottom: `1px solid ${themeUnified.palette.divider}`,
//                           color:
//                             themeUnified.palette.table?.rowText ||
//                             STYLE_GUIDE.COLORS.textDarkGray,
//                         }}
//                       >
//                         {typeof value === "number"
//                           ? value.toLocaleString()
//                           : value}
//                       </TableCell>
//                     );
//                   })}
//                 </TableRow>
//               ))}
//             </TableBody>
//           </Table>
//         </TableContainer>
//       );

//     /** ================== DEFAULT ================== */
//     default:
//       return (
//         <Line
//           {...baseChartProps}
//           data={chartData as ChartData<"line">}
//           ref={(ref) => {
//             chartRefs.current[chartId] = ref as ChartJS<"line"> | null;
//           }}
//         />
//       );
//   }
// };

  const renderDrillDownDialog = () => {
    const columns = drillDownData.length > 0
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
          <StyledTableContainer sx={{ flex: 1, overflow: "auto", ...getTableSx() }}>
            <DrillDownTable>
              <TableHead>
                <TableRow>
                  {columns.map((column) => (
                    <TableCell
                      key={column}
                      sx={{
                        fontWeight: STYLE_GUIDE.TYPOGRAPHY.fontWeight.semiBold,
                        backgroundColor: themeUnified.palette.table?.headerBackground || STYLE_GUIDE.COLORS.backgroundLightGray,
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
                        backgroundColor: index % 2 === 0
                          ? themeUnified.palette.table?.rowEvenBackground || STYLE_GUIDE.COLORS.white
                          : themeUnified.palette.table?.rowOddBackground || STYLE_GUIDE.COLORS.backgroundDefault,
                        "&:hover": {
                          backgroundColor: themeUnified.palette.table?.rowHoverBackground || STYLE_GUIDE.COLORS.backgroundHover,
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
                          {typeof row[column] === "number" ? row[column].toLocaleString() : row[column]}
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
      const chartDataArray = widgetData[chart._id]?.data?.widgetData || chart.data || [];
      if (chartDataArray.length === 0) {
        toast.error("No data available to download");
        return;
      }

      const columns = Object.keys(chartDataArray[0]);
      const csvContent = [
        columns.join(","),
        ...chartDataArray.map((row) =>
          columns.map((column) => {
            const value = row[column];
            return typeof value === "number" ? value : `"${value}"`;
          }).join(",")
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
              {numberCharts.map((chart: any) => (
                <Grid item xs={12} md={4} key={chart._id}>
                  <NumberCard sx={{ ...getCardSx() }}>
                    <CardContent>
                      <ChartTitle>
                        <ChartTitleText>
                          {chart.name}
                          {widgetData[chart._id]?.data?.label &&
                            ` (${widgetData[chart._id]?.data?.label})`}
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
                      <ChartContainer
                        className="number-chart"
                        onWheel={handleWheel}
                        sx={{ mt: -2 }}
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
                      {widgetData[chart._id]?.data?.label &&
                        ` (${widgetData[chart._id]?.data?.label})`}
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











// import React, { useEffect, useState, useRef } from "react";
// import { useAppDispatch, useAppSelector } from "../../../storeHooks";
// import {
//   fetchChartData,
//   deleteWidget,
//   fetchIndividualWidgetData,
//   fetchDashboardList,
//   saveWidgets,
// } from "../dashboardActions";
// import {
//   Grid,
//   Card,
//   CardContent,
//   Typography,
//   Box,
//   CircularProgress,
//   useTheme,
//   IconButton,
//   Menu,
//   MenuItem,
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   DialogActions,
//   Button,
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableRow,
//   Paper,
//   Pagination,
//   Divider,
//   Avatar,
//   TableContainer,
// } from "@mui/material";
// import {
//   Chart as ChartJS,
//   CategoryScale,
//   LinearScale,
//   PointElement,
//   LineElement,
//   Title,
//   Tooltip,
//   Legend,
//   ArcElement,
//   BarElement,
//   RadialLinearScale,
//   ChartData,
//   ChartEvent,
//   ActiveElement,
// } from "chart.js";
// import { Chart } from "react-chartjs-2";
// import { ChartDataItem, ChartGridProps, ChartResponse, Dashboard, DrillDownPayload } from "../types";
// import { styled } from "@mui/material/styles";
// import MoreVertIcon from "@mui/icons-material/MoreVert";
// import DeleteIcon from "@mui/icons-material/Delete";
// import EditIcon from "@mui/icons-material/Edit";
// import FullscreenIcon from "@mui/icons-material/Fullscreen";
// import CloseIcon from "@mui/icons-material/Close";
// import ImageIcon from "@mui/icons-material/Image";
// import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
// import DownloadIcon from "@mui/icons-material/Download";
// import TableChartIcon from "@mui/icons-material/TableChart";
// import { toast } from "react-toastify";
// import jsPDF from "jspdf";
// import axiosInstance from "../../../services/axiosInstance";
// import { Theme } from "../../createTheme/types";
// import { AddChartModal, ChartFormData } from "./AddChartModal";
// import { resetChartAndWidgetData } from "../dashboardReducer";
// import { SaveWidgetModel } from "../../naturalLanguage/saveWidgetModel";
// import { STYLE_GUIDE } from "../../../styles";
// import { useUnifiedTheme } from "../../../hooks/useUnifiedTheme";
// import { useComponentTypography } from "../../../hooks/useComponentTypography";
// // import Chart from "chart.js/auto";
// // import 'chartjs-plugin-datalabels';

// // Register ChartJS components
// ChartJS.register(
//   CategoryScale,
//   LinearScale,
//   PointElement,
//   LineElement,
//   Title,
//   Tooltip,
//   Legend,
//   ArcElement,
//   BarElement,
//   RadialLinearScale
// );

// // Styled components
// const StyledCard = styled(Card)(({ theme }) => ({
//   height: "100%",
//   minHeight: 500,
//   display: "flex",
//   flexDirection: "column",
//   borderRadius: theme.shape.borderRadius,
//   boxShadow: theme.shadows[1],
//   transition: "all 0.3s ease-in-out",
//   backgroundColor: theme.palette.background.paper,
//   border: `1px solid ${theme.palette.divider}`,
//   "&:hover": {
//     boxShadow: theme.shadows[3],
//     transform: "translateY(-2px)",
//   },
// }));

// const NumberCard = styled(Card)(({ theme }) => ({
//   height: 160,
//   display: "flex",
//   flexDirection: "column",
//   borderRadius: theme.shape.borderRadius,
//   boxShadow: theme.shadows[1],
//   transition: "all 0.3s ease-in-out",
//   backgroundColor: theme.palette.background.paper,
//   border: `1px solid ${theme.palette.divider}`,
//   overflow: "hidden",
//   "&:hover": {
//     boxShadow: theme.shadows[3],
//     transform: "translateY(-2px)",
//   },
// }));

// const ChartTitle = styled(Typography)(({ theme }) => ({
//   fontSize: STYLE_GUIDE.TYPOGRAPHY.fontSize.large,
//   fontWeight: STYLE_GUIDE.TYPOGRAPHY.fontWeight.semiBold,
//   color: theme.palette.text.primary,
//   marginBottom: theme.spacing(2),
//   display: "flex",
//   alignItems: "center",
//   justifyContent: "space-between",
//   gap: theme.spacing(1),
// }));

// const ChartContainer = styled(Box)(({ theme }) => ({
//   flex: 1,
//   height: "100%",
//   backgroundColor: "#ffffff",
//   borderRadius: theme.shape.borderRadius,
//   display: "flex",
//   alignItems: "center",
//   justifyContent: "center",
//   position: "relative",
//   overflow: "auto",
//   "& canvas": {
//     width: "100% !important",
//     height: "100% !important",
//   },
//   "&.pie-chart": {
//     minHeight: 450,
//     "& canvas": {
//       maxWidth: "95% !important",
//       maxHeight: "95% !important",
//     },
//   },
//   "&.line-chart": {
//     minHeight: 500,
//     padding: theme.spacing(4, 2, 6, 4),
//     "& canvas": {
//       maxWidth: "98% !important",
//       maxHeight: "90% !important",
//     },
//   },
//   "&.horizontal-bar-chart": {
//     minHeight: 450,
//     "& canvas": {
//       maxWidth: "98% !important",
//       maxHeight: "90% !important",
//     },
//   },
//   "&.combo-chart": {
//     minHeight: 450,
//     padding: theme.spacing(2),
//     "& canvas": {
//       maxWidth: "98% !important",
//       maxHeight: "90% !important",
//     },
//   },
//   "&.number-chart": {
//     flexDirection: "column",
//     gap: theme.spacing(2),
//   },
//   "&.table-chart": {
//     minHeight: 400,
//     padding: theme.spacing(2),
//     overflow: "auto",
//     "& .MuiTableContainer-root": {
//       height: "100%",
//       width: "100%",
//       overflow: "auto",
//     },
//   },
//   "&:hover": {
//     overflow: "hidden",
//   },
//   "&::-webkit-scrollbar": {
//     width: "8px",
//     height: "8px",
//   },
//   "&::-webkit-scrollbar-thumb": {
//     backgroundColor: theme.palette.divider,
//     borderRadius: "4px",
//   },
// }));

// const LoadingContainer = styled(Box)(({ theme }) => ({
//   display: "flex",
//   justifyContent: "center",
//   alignItems: "center",
//   minHeight: "400px",
//   backgroundColor: "#ffffff",
//   borderRadius: "12px",
//   border: `1px solid ${theme.palette.divider}`,
// }));

// const ErrorContainer = styled(Box)(({ theme }) => ({
//   display: "flex",
//   justifyContent: "center",
//   alignItems: "center",
//   minHeight: "400px",
//   backgroundColor: "#ffffff",
//   borderRadius: "12px",
//   border: `1px solid ${theme.palette.divider}`,
// }));

// const EmptyContainer = styled(Box)(({ theme }) => ({
//   display: "flex",
//   justifyContent: "center",
//   alignItems: "center",
//   minHeight: "400px",
//   backgroundColor: "#ffffff",
//   borderRadius: "12px",
//   border: `1px solid ${theme.palette.divider}`,
// }));

// const FullScreenModal = styled(Dialog)(({ theme }) => ({
//   "& .MuiDialog-paper": {
//     margin: theme.spacing(2),
//     width: "calc(100% - 32px)",
//     height: "calc(100% - 32px)",
//     maxWidth: "calc(100% - 32px)",
//     maxHeight: "calc(100% - 32px)",
//     borderRadius: "12px",
//   },
// }));

// const FullScreenChartContainer = styled(Box)(({ theme }) => ({
//   height: "100%",
//   padding: theme.spacing(3),
//   backgroundColor: "#f8f9fa",
//   display: "flex",
//   flexDirection: "column",
//   "& canvas": {
//     flexGrow: 1,
//     padding: theme.spacing(1),
//   },
// }));

// const NumberDisplay = styled(Box)(({ theme }) => ({
//   display: "flex",
//   flexDirection: "column",
//   alignItems: "center",
//   justifyContent: "center",
//   gap: theme.spacing(1),
// }));

// const NumberValue = styled(Typography, {
//   shouldForwardProp: (prop) => prop !== "widgetTheme",
// })<{ widgetTheme?: Theme | null }>(({ theme, widgetTheme }) => ({
//   fontSize: STYLE_GUIDE.TYPOGRAPHY.fontSize.xxxl,
//   fontWeight: STYLE_GUIDE.TYPOGRAPHY.fontWeight.semiBold,
//   color: widgetTheme?.colors?.[0] || theme.palette.primary.main,
//   lineHeight: STYLE_GUIDE.TYPOGRAPHY.lineHeight.tight,
// }));

// const NumberLabel = styled(Typography)(({ theme }) => ({
//   fontSize: "1rem",
//   color: theme.palette.text.secondary,
//   textAlign: "center",
// }));

// const DrillDownDialog = styled(Dialog)({
//   "& .MuiDialog-paper": {
//     width: "calc(100% - 32px)",
//     height: "calc(100% - 32px)",
//     margin: 16,
//     maxWidth: "calc(100% - 32px)",
//     maxHeight: "calc(100% - 32px)",
//   },
// });

// const DrillDownTable = styled(Table)(({ theme }) => ({
//   "& .MuiTableCell-root": {
//     padding: theme.spacing(1.5),
//     fontSize: "0.875rem",
//   },
//   "& .MuiTableHead-root": {
//     backgroundColor: theme.palette.background.default,
//     "& .MuiTableCell-root": {
//       fontWeight: 600,
//       color: theme.palette.text.primary,
//       borderBottom: `2px solid ${theme.palette.divider}`,
//     },
//   },
//   "& .MuiTableBody-root": {
//     "& .MuiTableRow-root": {
//       transition: "background-color 0.2s",
//       "&:hover": {
//         backgroundColor: theme.palette.action.hover,
//       },
//       "&:last-child td": {
//         borderBottom: 0,
//       },
//     },
//     "& .MuiTableCell-root": {
//       color: theme.palette.text.secondary,
//       borderBottom: `1px solid ${theme.palette.divider}`,
//     },
//   },
// }));

// const StyledTableContainer = styled(Paper)(({ theme }) => ({
//   borderRadius: theme.shape.borderRadius,
//   boxShadow: theme.shadows[1],
//   overflow: "hidden",
// }));

// const ChartTitleText = styled(Typography)({
//   flexGrow: 1,
// });

// // DashboardChart component
// const DashboardChart: React.FC<{
//   chartId: string;
//   type: string;
//   labels: string[];
//   data: any;
//   combineData?: any[];
//   theme: any;
//   title: string;
//   dimension?: string;
//   groupBy?: string;
//   dimensionDisplayMap?: Record<string, string>;
//   groupByDisplayMap?: Record<string, string>;
//   onChartClick?: (chart: ChartResponse, elements: ActiveElement[]) => void;
// }> = ({
//   chartId,
//   type,
//   labels,
//   data,
//   combineData,
//   theme,
//   title,
//   dimension,
//   groupBy,
//   dimensionDisplayMap,
//   groupByDisplayMap,
//   onChartClick,
// }) => {
//   const chartRef = useRef<HTMLCanvasElement | null>(null);
//   const chartInstance = useRef<ChartJS | null>(null);

//   useEffect(() => {
//     if (!chartRef.current) return;

//     const ctx = chartRef.current.getContext("2d");
//     if (!ctx) return;

//     if (chartInstance.current) {
//       chartInstance.current.destroy();
//     }

//     const supportedTypes = ["bar", "line", "pie", "number", "stacked-bar-line", "combo-bar-line", "horizontalBar", "verticalBar", "stackedBar", "multiSeriesBar", "doughnut", "multiSeriesPie", "radar", "polarArea", "bubble", "scatter"];
//     const chartType = supportedTypes.includes(type)
//       ? (type === "stacked-bar-line" || type === "combo-bar-line" ? "bar" : type === "stackedBar" ? "bar" : type === "multiSeriesBar" ? "bar" : type === "verticalBar" ? "bar" : type === "horizontalBar" ? "bar" : type)
//       : "bar";

//     const isGrouped = !!groupBy;

//     const datasets = (() => {
//       if (type === "stacked-bar-line" && isGrouped && combineData) {
//         return combineData.map((item: any, index: number) => {
//           const dataset = { ...item };
//           if (index === 0) {
//             dataset.type = "bar";
//             dataset.stack = "combined";
//           } else {
//             dataset.stack = "combined";
//           }
//           return dataset;
//         });
//       }

//       if (type === "combo-bar-line" && isGrouped && combineData) {
//         return combineData.map((item: any, index: number) => {
//           const dataset = { ...item };
//           if (index === 0) {
//             dataset.type = "line";
//           }
//           return dataset;
//         });
//       }

//       if (isGrouped && combineData) {
//         return combineData;
//       }

//       return [
//         {
//           label: "Critical",
//           data: data.critical || data.map((item: ChartDataItem) => item.data),
//           backgroundColor: chartType === "pie" || chartType === "doughnut" || chartType === "polarArea" || chartType === "multiSeriesPie"
//             ? data.criticalColors || theme.background_color.chart
//             : theme.background_color.chart[0],
//           borderColor: theme.border_color.chart[0],
//           borderWidth: 1,
//           _originalData: data.critical || data.map((item: ChartDataItem) => item.data),
//         },
//         {
//           label: "Other",
//           data: data.other || data.map((item: ChartDataItem) => item.data),
//           backgroundColor: chartType === "pie" || chartType === "doughnut" || chartType === "polarArea" || chartType === "multiSeriesPie"
//             ? data.otherColors || theme.background_color.chart
//             : theme.background_color.chart[1],
//           borderColor: theme.border_color.chart[1],
//           borderWidth: 1,
//           _originalData: data.other || data.map((item: ChartDataItem) => item.data),
//         },
//       ];
//     })();

//     datasets.forEach((dataset: any) => {
//       if (!dataset._originalData) {
//         dataset._originalData = [...dataset.data];
//       }
//     });

//     const config: any = {
//       type: chartType,
//       data: {
//         labels,
//         datasets,
//       },
//       options: {
//         maintainAspectRatio: false,
//         maxBarThickness: 100,
//         plugins: {
//           datalabels: {
//             anchor: "end",
//             align: "end",
//             color: "black",
//             formatter: (value: number) => (value > 0 ? value : ""),
//           },
//           legend: {
//             labels: {
//               generateLabels: (chart: any) => {
//                 if (chart.config.type !== "pie" || isGrouped) {
//                   return ChartJS.defaults.plugins.legend.labels.generateLabels(chart);
//                 }
//                 const labels = chart.data.labels;
//                 const datasets = chart.data.datasets;
//                 const hidden = chart._hiddenSlices || [];
//                 const result: any[] = [];
//                 labels.forEach((label: string, i: number) => {
//                   datasets.forEach((dataset: any, datasetIndex: number) => {
//                     const bgColor = dataset.backgroundColor[i] || "#ccc";
//                     const sliceKey = `${datasetIndex}-${i}`;
//                     result.push({
//                       text: `${label} - ${dataset.label}`,
//                       fillStyle: bgColor,
//                       strokeStyle: bgColor,
//                       hidden: hidden.includes(sliceKey),
//                       index: sliceKey,
//                     });
//                   });
//                 });
//                 return result;
//               },
//             },
//             onClick: (e: any, legendItem: any, legend: any) => {
//               const chart = legend.chart;
//               if (chart.config.type !== "pie" || isGrouped) {
//                 ChartJS.defaults.plugins.legend.onClick(e, legendItem, legend);
//                 return;
//               }
//               const [datasetIndex, dataIndex] = legendItem.index.split("-").map(Number);
//               const sliceKey = `${datasetIndex}-${dataIndex}`;
//               chart._hiddenSlices = chart._hiddenSlices || [];
//               const isHidden = chart._hiddenSlices.includes(sliceKey);
//               if (isHidden) {
//                 chart._hiddenSlices = chart._hiddenSlices.filter((k: string) => k !== sliceKey);
//               } else {
//                 chart._hiddenSlices.push(sliceKey);
//               }
//               const dataset = chart.data.datasets[datasetIndex];
//               dataset.data[dataIndex] = isHidden ? dataset._originalData[dataIndex] : 0;
//               chart.update();
//             },
//           },
//         },
//         onClick: (e: ChartEvent, elements: ActiveElement[]) => {
//           if (onChartClick) {
//             onChartClick({ _id: chartId } as ChartResponse, elements);
//           }
//         },
//         onHover: (event: any, chartElement: any) => {
//           event.native.target.style.cursor = chartElement[0] ? "pointer" : "default";
//         },
//         scales: isGrouped && chartType !== "pie" && type !== "combo-bar-line" && type !== "doughnut" && type !== "polarArea" && type !== "multiSeriesPie"
//           ? {
//               x: { stacked: true, title: { display: true, text: dimensionDisplayMap?.[dimension || ""] || dimension || "Category" } },
//               y: { stacked: true, beginAtZero: true, title: { display: true, text: "Value" } },
//             }
//           : type === "combo-bar-line"
//           ? {
//               x: { title: { display: true, text: dimensionDisplayMap?.[dimension || ""] || dimension || "Category" } },
//               y: { beginAtZero: true, title: { display: true, text: "Bar Values" } },
//               y1: { position: "right", beginAtZero: true, grid: { drawOnChartArea: false }, title: { display: true, text: "Line Values" } },
//             }
//           : type === "horizontalBar"
//           ? {
//               x: { title: { display: true, text: "Value" } },
//               y: { title: { display: true, text: dimensionDisplayMap?.[dimension || ""] || dimension || "Category" } },
//             }
//           : {},
//       },
//     };

//     chartInstance.current = new ChartJS(ctx, config);

//     if (dimension) {
//       chartRef.current.setAttribute("data-dimension-name", dimension);
//     }
//     if (groupBy) {
//       chartRef.current.setAttribute("data-group-by-name", groupBy);
//     }

//     return () => {
//       if (chartInstance.current) {
//         chartInstance.current.destroy();
//       }
//     };
//   }, [chartId, type, labels, data, combineData, theme, title, dimension, groupBy, dimensionDisplayMap, onChartClick]);

//   return (
//     <>
//       <Typography id={`label_${chartId}`} variant="h6" sx={{ textAlign: "center", mb: 2 }}>
//         {/* {title} */}
//       </Typography>
//       <canvas
//         id={`chartCanvas_${chartId}`}
//         ref={chartRef}
//         width="400"
//         height="200"
//       />
//     </>
//   );
// };

// export const ChartGrid: React.FC<ChartGridProps> = ({
//   dashboardId,
//   isEditMode,
//   onEditChart,
//   isAddChartModalOpen,
//   isEditChartModalOpen,
//   gridColumns,
//   currentDashboard,
//   startVersionValue,
//   endVersionValue,
//   versionValue,
//   isTrend,
//   isNaturalLangauage,
// }) => {
//   const dispatch = useAppDispatch();
//   const theme = useTheme();
//   const themeUnified = useUnifiedTheme();
//   const { getTableSx, getCardSx } = useComponentTypography();
//   const chartRefs = useRef<{ [key: string]: ChartJS | null }>({});
//   const {
//     charts,
//     widgetTypes,
//     temporaryCharts,
//     chartsLoading,
//     chartsError,
//     widgetData,
//     dashboards,
//   } = useAppSelector((state) => ({
//     charts: state.dashboard.charts,
//     temporaryCharts: state.dashboard.temporaryCharts,
//     chartsLoading: state.dashboard.chartsLoading,
//     chartsError: state.dashboard.chartsError,
//     widgetData: state.dashboard.widgetData,
//     widgetTypes: state.dashboard.widgetTypes,
//     dashboards: state.dashboard.dashboards || [],
//   }));

//   const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
//   const [selectedChart, setSelectedChart] = useState<ChartResponse | null>(null);
//   const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
//   const [isDeleting, setIsDeleting] = useState(false);
//   const [fullViewOpen, setFullViewOpen] = useState(false);
//   const [exportMenuAnchorEl, setExportMenuAnchorEl] = useState<null | HTMLElement>(null);
//   const [drillDownOpen, setDrillDownOpen] = useState(false);
//   const [drillDownData, setDrillDownData] = useState<ChartDataItem[]>([]);
//   const [drillDownTitle, setDrillDownTitle] = useState<string>("");
//   const [currentPage, setCurrentPage] = useState(1);
//   const [totalPages, setTotalPages] = useState(1);
//   const [totalRecords, setTotalRecords] = useState(0);
//   const [isDrillDownLoading, setIsDrillDownLoading] = useState(false);
//   const [drillDownPayload, setDrillDownPayload] = useState<DrillDownPayload | null>(null);
//   const [itemsPerPage] = useState(10);
//   const [openSaveChart, setOpenSaveChart] = useState(false);
//   const [isChartSaving, setIsChartSaving] = useState(false);
//   const [newSaveChartName, setNewSaveChartName] = useState("");
//   const [chartSaveDashboardId, setChartSaveDashboardId] = useState("");
//   const [chartSaveSettingData, setChartSaveSettingData] = useState<ChartFormData | null>(null);

//   const widgetTheme = useAppSelector((state) => state.dashboard.widgetTheme);

//   useEffect(() => {
//     if (!dashboards.length) {
//       dispatch(fetchDashboardList());
//     }
//   }, [dispatch, dashboards.length]);

//   useEffect(() => {
//     if (dashboardId) {
//       if (isNaturalLangauage) {
//         dispatch(resetChartAndWidgetData());
//       } else {
//         dispatch(fetchChartData({ dashboardId }));
//       }
//     }
//   }, [dispatch, dashboardId, isNaturalLangauage]);

//   const handleMenuClick = (event: React.MouseEvent<HTMLElement>, chart: ChartResponse) => {
//     event.stopPropagation();
//     setAnchorEl(event.currentTarget);
//     setSelectedChart(chart);
//   };

//   const handleMenuClose = () => {
//     setAnchorEl(null);
//     setSelectedChart(null);
//   };

//   const handleDeleteClick = () => {
//     setDeleteDialogOpen(true);
//     setAnchorEl(null);
//   };

//   const handleDeleteConfirm = async () => {
//     if (!selectedChart) return;

//     try {
//       setIsDeleting(true);
//       const result = await dispatch(deleteWidget(selectedChart._id)).unwrap();

//       if (result.success) {
//         toast.success("Chart deleted successfully!");
//         dispatch(fetchChartData({ dashboardId }));
//       } else {
//         toast.error(result.message || "Failed to delete chart");
//       }
//     } catch (error) {
//       if (typeof error === "object" && error !== null && "message" in error) {
//         toast.error(error.message as string);
//       } else {
//         toast.error("Failed to delete chart");
//       }
//     } finally {
//       setIsDeleting(false);
//       setDeleteDialogOpen(false);
//     }
//   };

//   const handleDeleteCancel = () => {
//     setDeleteDialogOpen(false);
//   };

//   const handleEditClick = () => {
//     if (selectedChart) {
//       onEditChart(selectedChart);
//     }
//     handleMenuClose();
//   };

//   const handleFullViewClick = (chart: ChartResponse) => {
//     setSelectedChart(chart);
//     setFullViewOpen(true);
//   };

//   const handleFullViewClose = () => {
//     setFullViewOpen(false);
//     setSelectedChart(null);
//   };

//   const handleExportImage = async (format: "png" | "jpg") => {
//     if (!selectedChart) return;

//     try {
//       const chartId = `chart-${selectedChart._id}`;
//       const chartInstance = chartRefs.current[chartId];

//       if (!chartInstance) {
//         toast.error("Chart instance not found");
//         return;
//       }

//       const dataUrl = chartInstance.toBase64Image();
//       const link = document.createElement("a");
//       link.download = `${selectedChart.name}.${format}`;
//       link.href = dataUrl;
//       link.click();

//       toast.success(`Chart exported as ${format.toUpperCase()} successfully!`);
//     } catch (error) {
//       toast.error("Failed to export chart");
//       console.error("Export error:", error);
//     }
//   };

//   const handleExportPDF = async () => {
//     if (!selectedChart) return;

//     try {
//       const chartId = `chart-${selectedChart._id}`;
//       const chartInstance = chartRefs.current[chartId];

//       if (!chartInstance) {
//         toast.error("Chart instance not found");
//         return;
//       }

//       const imgData = chartInstance.toBase64Image();
//       const pdf = new jsPDF("landscape");
//       const imgProps = pdf.getImageProperties(imgData);
//       const pdfWidth = pdf.internal.pageSize.getWidth();
//       const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

//       pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
//       pdf.save(`${selectedChart.name}.pdf`);

//       toast.success("Chart exported as PDF successfully!");
//     } catch (error) {
//       toast.error("Failed to export chart as PDF");
//       console.error("PDF export error:", error);
//     }
//   };

//   const handleExportData = () => {
//     if (!selectedChart) return;

//     try {
//       const chartData = getChartData(selectedChart);
//       const { labels, datasets } = chartData;

//       let csvContent = "data:text/csv;charset=utf-8,";

//       const headers = [
//         "Category",
//         ...datasets.map((dataset, i) =>
//           "label" in dataset ? (dataset as { label: string }).label : `Series ${i + 1}`
//         ),
//       ];
//       csvContent += headers.join(",") + "\n";

//       labels.forEach((label, index) => {
//         const row = [label, ...datasets.map((dataset) => dataset.data[index])];
//         csvContent += row.join(",") + "\n";
//       });

//       const encodedUri = encodeURI(csvContent);
//       const link = document.createElement("a");
//       link.setAttribute("href", encodedUri);
//       link.setAttribute("download", `${selectedChart.name}_data.csv`);
//       document.body.appendChild(link);
//       link.click();
//       document.body.removeChild(link);

//       toast.success("Chart data exported successfully!");
//     } catch (error) {
//       console.error("Error exporting data:", error);
//       toast.error("Failed to export chart data");
//     }
//   };

//   const handleExportMenuClick = (event: React.MouseEvent<HTMLElement>, chart: ChartResponse) => {
//     event.stopPropagation();
//     if (chart.widgetTypeId?.chartType === "tabular") {
//       handleDownload(chart);
//       return;
//     }
//     setExportMenuAnchorEl(event.currentTarget);
//     setSelectedChart(chart);
//   };

//   const handleExportMenuClose = () => {
//     setExportMenuAnchorEl(null);
//     setSelectedChart(null);
//   };

//   const handleChartClick = async (chart: ChartResponse, elements: ActiveElement[]) => {
//     if (!elements || !elements.length) return;

//     setSelectedChart(chart);

//     const clickedElement = elements[0];
//     const chartData = widgetData[chart._id]?.data?.widgetData || chart.data || [];

//     const clickedData = chartData.find((item: ChartDataItem) => {
//       const dataIndex = clickedElement.index;
//       if (dataIndex >= 0 && dataIndex < chartData.length) {
//         return item.name === chartData[dataIndex].name;
//       }
//       return false;
//     });

//     if (clickedData) {
//       setDrillDownTitle(`${chart.name} - ${clickedData.name}`);
//       setDrillDownOpen(true);
//       setCurrentPage(1);
//       setIsDrillDownLoading(true);

//       try {
//         const dimensions = chart.dimensions
//           ? Array.isArray(chart.dimensions)
//             ? chart.dimensions.map((dim) => ({ [dim]: clickedData.name }))
//             : [{ [chart.dimensions]: clickedData.name }]
//           : [];

//         const groupBy = chart.groupBy
//           ? Array.isArray(chart.groupBy)
//             ? chart.groupBy.map((group) => ({ [group]: clickedData[group] }))
//             : [{ [chart.groupBy]: clickedData.name }]
//           : [];

//         const payload = {
//           dataSourceId: chart.dataSourceId?._id,
//           entityId: chart.dataSourceId?.entityId,
//           conditions: chart.conditions || [],
//           dimensions: isTrend
//             ? [{ versionValue: clickedData.name }]
//             : dimensions,
//           dashboardFilters: {
//             startVersionValue: startVersionValue,
//             endVersionValue: endVersionValue,
//             versionValue: versionValue,
//           },
//           groupBy,
//           page: 1,
//           limit: itemsPerPage,
//           dashBoardType: currentDashboard?.settings?.dashboardType,
//         };

//         setDrillDownPayload(payload);

//         const response = await axiosInstance.post(
//           "/common/dataSource/getWidgetDataByFilter",
//           payload
//         );

//         if (response.data.success) {
//           setDrillDownData(response.data.data);
//           setTotalPages(response.data.pagination.totalPages);
//           setTotalRecords(response.data.pagination.totalRecords);
//         } else {
//           toast.error(response.data.message || "Failed to fetch detailed data");
//         }
//       } catch (error) {
//         console.error("Error fetching detailed data:", error);
//         toast.error("Failed to fetch detailed data");
//       } finally {
//         setIsDrillDownLoading(false);
//       }
//     }
//   };

//   const handleDrillDownClose = () => {
//     setDrillDownOpen(false);
//     setDrillDownData([]);
//     setDrillDownTitle("");
//     setDrillDownPayload(null);
//   };

//   const handlePageChange = async (event: React.ChangeEvent<unknown>, value: number) => {
//     if (!selectedChart || !drillDownPayload) return;

//     try {
//       const payload = {
//         ...drillDownPayload,
//         page: value,
//       };

//       const response = await axiosInstance.post(
//         "/common/dataSource/getWidgetDataByFilter",
//         payload
//       );

//       if (response.data.success) {
//         setDrillDownData(response.data.data);
//         setTotalPages(response.data.pagination.totalPages);
//         setTotalRecords(response.data.pagination.totalRecords);
//         setCurrentPage(value);
//       } else {
//         toast.error(response.data.message || "Failed to fetch detailed data");
//       }
//     } catch (error) {
//       console.error("Error fetching detailed data:", error);
//       toast.error("Failed to fetch detailed data");
//     }
//   };

//   const handleChartUpdate = async (formData: ChartFormData) => {
//     const newFormData = {
//       ...formData,
//       chartType: widgetTypes.find((data) => data._id === formData.widgetTypeId)?.chartType,
//     };
//     await dispatch(fetchIndividualWidgetData(newFormData));
//   };

//   const handleSaveWidget = async () => {
//     setIsChartSaving(true);
//     try {
//       const result = await dispatch(
//         saveWidgets({
//           widgets: [
//             {
//               dashboardId: chartSaveDashboardId,
//               widgetTypeId: chartSaveSettingData?.widgetTypeId?._id || "",
//               name: newSaveChartName,
//               dimensions: chartSaveSettingData?.dimensions.join(",") || "",
//               groupBy: chartSaveSettingData?.groupBy || [],
//               aggregation: chartSaveSettingData?.aggregation,
//               position: chartSaveSettingData?.position || { x: 0, y: 0, index: 0 },
//               conditions: chartSaveSettingData?.conditions || [],
//               dataSourceId: chartSaveSettingData?.dataSourceId?._id || chartSaveSettingData?.dataSourceId || "",
//               entityId: chartSaveSettingData?.dataSourceId?.entityId || chartSaveSettingData?.entityId || "",
//               isIncremental: chartSaveSettingData?.isIncremental || false,
//             },
//           ],
//         })
//       ).unwrap();

//       if (result.success) {
//         toast.success("Charts saved successfully!");
//         setOpenSaveChart(false);
//         setIsChartSaving(false);
//       } else {
//         toast.error(result.message || "Failed to save charts");
//         setIsChartSaving(false);
//       }
//     } catch (error) {
//       if (typeof error === "object" && error !== null && "message" in error) {
//         toast.error(error.message as string);
//       } else {
//         toast.error("Failed to save charts");
//       }
//       setIsChartSaving(false);
//     }
//   };

//   const getChartData = (chart: ChartResponse) => {
//     const chartData = widgetData[chart._id]?.data?.widgetData || chart.data || [];
//     const chartType = chart.widgetTypeId?.chartType || "line";
//     const groupBy = chart.groupBy || [];

//     if (!chartData.length || chartData.every((item: ChartDataItem) => item.data === 0)) {
//       return {
//         labels: [],
//         datasets: [{ label: chart.name, data: [], borderColor: theme.palette.primary.main, backgroundColor: theme.palette.primary.light }],
//         isEmpty: true,
//       };
//     }

//     const labels = chartData.map((item: ChartDataItem) => item.name);
//     const combineData = groupBy.length > 0
//       ? Array.from(new Set(chartData.map((item: any) => item[groupBy[0]]))).map((group, index) => {
//           const groupData = labels.map((name) => {
//             const dataPoint = chartData.find((item: any) => item.name === name && item[groupBy[0]] === group);
//             return dataPoint ? dataPoint.data : 0;
//           });
//           return {
//             label: group || chart.name,
//             data: groupData,
//             backgroundColor: widgetTheme?.backgroundColor?.[index % (widgetTheme?.backgroundColor?.length || 1)] || theme.palette.primary.main,
//             borderColor: widgetTheme?.borderColor?.[index % (widgetTheme?.borderColor?.length || 1)] || theme.palette.primary.dark,
//             borderWidth: 1,
//           };
//         })
//       : undefined;

//     return {
//       labels,
//       datasets: combineData || [{ label: chart.name, data: chartData.map((item: ChartDataItem) => item.data), backgroundColor: widgetTheme?.backgroundColor?.[0], borderColor: widgetTheme?.borderColor?.[0] }],
//       isEmpty: false,
//     };
//   };

//   const renderChart = (chart: ChartResponse) => {
//     const chartData = getChartData(chart);
//     const chartType = chart.widgetTypeId?.chartType || "line";
//     const dimensionField = Array.isArray(chart.dimensions) && chart.dimensions.length > 0 ? chart.dimensions[0] : typeof chart.dimensions === "string" ? chart.dimensions : "name";
//     const aggregationField = chart.aggregation?.attributeName || "data";

//     if (chartType === "number") {
//       const numberValue = chartData.datasets[0]?.data[0] || 0;
//       return (
//         <NumberDisplay>
//           <NumberValue widgetTheme={widgetTheme}>
//             {numberValue.toLocaleString()}
//           </NumberValue>
//           <NumberLabel>{chart.name}</NumberLabel>
//         </NumberDisplay>
//       );
//     }

//     if (chartType === "tabular") {
//       const chartDataArray = widgetData[chart._id]?.data?.widgetData || chart.data || [];
//       const columns = chartDataArray.length > 0
//         ? Object.keys(chartDataArray[0]).map((col) => {
//             if (col === "name") return dimensionField;
//             if (col === "data") return aggregationField;
//             return col;
//           })
//         : [];

//       return (
//         <TableContainer
//           component={Paper}
//           sx={{
//             ...getTableSx(),
//             maxHeight: 400,
//             overflow: "auto",
//             backgroundColor: themeUnified.palette.background.paper || STYLE_GUIDE.COLORS.white,
//           }}
//         >
//           <Table stickyHeader>
//             <TableHead>
//               <TableRow>
//                 {columns.map((column) => (
//                   <TableCell
//                     key={column}
//                     sx={{
//                       backgroundColor: themeUnified.palette.table?.headerBackground || STYLE_GUIDE.COLORS.backgroundLightGray,
//                       fontWeight: STYLE_GUIDE.TYPOGRAPHY.fontWeight.semiBold,
//                       fontSize: "14px",
//                       color: themeUnified.palette.table?.headerText || STYLE_GUIDE.COLORS.textGray,
//                       borderBottom: `2px solid ${themeUnified.palette.divider}`,
//                       padding: "12px 16px",
//                     }}
//                   >
//                     {column}
//                   </TableCell>
//                 ))}
//               </TableRow>
//             </TableHead>
//             <TableBody>
//               {chartDataArray?.map((row: any, rowIndex: number) => (
//                 <TableRow
//                   key={rowIndex}
//                   sx={{
//                     backgroundColor: rowIndex % 2 === 0
//                       ? themeUnified.palette.table?.rowEvenBackground || STYLE_GUIDE.COLORS.white
//                       : themeUnified.palette.table?.rowOddBackground || STYLE_GUIDE.COLORS.backgroundDefault,
//                     "&:hover": {
//                       backgroundColor: themeUnified.palette.table?.rowHoverBackground || STYLE_GUIDE.COLORS.backgroundHover,
//                     },
//                   }}
//                 >
//                   {columns.map((column) => {
//                     let value;
//                     if (column === dimensionField && "name" in row) value = row["name"];
//                     else if (column === aggregationField && "data" in row) value = row["data"];
//                     else value = row[column];
//                     return (
//                       <TableCell
//                         key={`${rowIndex}-${column}`}
//                         sx={{
//                           padding: "12px 16px",
//                           borderBottom: `1px solid ${themeUnified.palette.divider}`,
//                           color: themeUnified.palette.table?.rowText || STYLE_GUIDE.COLORS.textDarkGray,
//                         }}
//                       >
//                         {typeof value === "number" ? value.toLocaleString() : value}
//                       </TableCell>
//                     );
//                   })}
//                 </TableRow>
//               ))}
//             </TableBody>
//           </Table>
//         </TableContainer>
//       );
//     }

//     const themeConfig = {
//       background_color: {
//         chart: widgetTheme?.backgroundColor || ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF", "#FF9F40"],
//       },
//       border_color: {
//         chart: widgetTheme?.borderColor || ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF", "#FF9F40"],
//       },
//     };

//     return (
//       <DashboardChart
//         chartId={`chart-${chart._id}`}
//         type={chartType}
//         labels={chartData.labels}
//         data={chartData.datasets}
//         combineData={chartData.datasets}
//         theme={themeConfig}
//         title={chart.name}
//         dimension={dimensionField}
//         groupBy={chart.groupBy?.[0]}
//         dimensionDisplayMap={{ [dimensionField]: dimensionField }}
//         groupByDisplayMap={chart.groupBy ? { [chart.groupBy[0]]: chart.groupBy[0] } : {}}
//         onChartClick={(c, elements) => handleChartClick(chart, elements)}
//       />
//     );
//   };

//   const renderDrillDownDialog = () => {
//     const columns = drillDownData.length > 0
//       ? Object.keys(drillDownData[0]).filter((key) => key !== "_id")
//       : [];

//     return (
//       <DrillDownDialog
//         open={drillDownOpen}
//         onClose={handleDrillDownClose}
//         aria-labelledby="drill-down-dialog-title"
//       >
//         <DialogTitle
//           id="drill-down-dialog-title"
//           sx={{
//             display: "flex",
//             justifyContent: "space-between",
//             alignItems: "center",
//             borderBottom: `1px solid ${theme.palette.divider}`,
//             p: 2,
//           }}
//         >
//           <Typography variant="h6">{drillDownTitle}</Typography>
//           <IconButton
//             onClick={handleDrillDownClose}
//             size="small"
//             sx={{
//               color: theme.palette.text.secondary,
//               "&:hover": {
//                 color: theme.palette.text.primary,
//                 backgroundColor: theme.palette.action.hover,
//               },
//             }}
//           >
//             <CloseIcon />
//           </IconButton>
//         </DialogTitle>
//         <DialogContent
//           sx={{
//             p: 3,
//             display: "flex",
//             flexDirection: "column",
//             height: "100%",
//           }}
//         >
//           <StyledTableContainer sx={{ flex: 1, overflow: "auto", ...getTableSx() }}>
//             <DrillDownTable>
//               <TableHead>
//                 <TableRow>
//                   {columns.map((column) => (
//                     <TableCell
//                       key={column}
//                       sx={{
//                         fontWeight: STYLE_GUIDE.TYPOGRAPHY.fontWeight.semiBold,
//                         backgroundColor: themeUnified.palette.table?.headerBackground || STYLE_GUIDE.COLORS.backgroundLightGray,
//                         color: themeUnified.palette.table?.headerText || STYLE_GUIDE.COLORS.textGray,
//                       }}
//                     >
//                       {column}
//                     </TableCell>
//                   ))}
//                 </TableRow>
//               </TableHead>
//               <TableBody>
//                 {isDrillDownLoading ? (
//                   Array.from({ length: 5 }).map((_, index) => (
//                     <TableRow key={index}>
//                       {columns.map((column) => (
//                         <TableCell key={column}>
//                           <Box
//                             sx={{
//                               width: "100%",
//                               height: 20,
//                               bgcolor: "grey.200",
//                               borderRadius: 1,
//                             }}
//                           />
//                         </TableCell>
//                       ))}
//                     </TableRow>
//                   ))
//                 ) : drillDownData.length > 0 ? (
//                   drillDownData.map((row, index) => (
//                     <TableRow
//                       key={index}
//                       sx={{
//                         backgroundColor: index % 2 === 0
//                           ? themeUnified.palette.table?.rowEvenBackground || STYLE_GUIDE.COLORS.white
//                           : themeUnified.palette.table?.rowOddBackground || STYLE_GUIDE.COLORS.backgroundDefault,
//                         "&:hover": {
//                           backgroundColor: themeUnified.palette.table?.rowHoverBackground || STYLE_GUIDE.COLORS.backgroundHover,
//                         },
//                       }}
//                     >
//                       {columns.map((column) => (
//                         <TableCell
//                           key={column}
//                           sx={{
//                             color: themeUnified.palette.table?.rowText || STYLE_GUIDE.COLORS.textDarkGray,
//                           }}
//                         >
//                           {typeof row[column] === "number" ? row[column].toLocaleString() : row[column]}
//                         </TableCell>
//                       ))}
//                     </TableRow>
//                   ))
//                 ) : (
//                   <TableRow>
//                     <TableCell colSpan={columns.length} align="center">
//                       No data available
//                     </TableCell>
//                   </TableRow>
//                 )}
//               </TableBody>
//             </DrillDownTable>
//           </StyledTableContainer>
//           {!isDrillDownLoading && drillDownData.length > 0 && (
//             <Box
//               sx={{
//                 display: "flex",
//                 justifyContent: "center",
//                 mt: "auto",
//                 pt: 3,
//                 pb: 2,
//                 borderTop: `1px solid ${theme.palette.divider}`,
//               }}
//             >
//               <Pagination
//                 count={totalPages}
//                 page={currentPage}
//                 onChange={handlePageChange}
//                 color="primary"
//               />
//             </Box>
//           )}
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={handleDrillDownClose}>Close</Button>
//         </DialogActions>
//       </DrillDownDialog>
//     );
//   };

//   const handleDownload = (chart: ChartResponse) => {
//     const chartType = chart.widgetTypeId?.chartType || "line";

//     if (chartType === "tabular") {
//       const chartDataArray = widgetData[chart._id]?.data?.widgetData || chart.data || [];
//       if (chartDataArray.length === 0) {
//         toast.error("No data available to download");
//         return;
//       }

//       const columns = Object.keys(chartDataArray[0]);
//       const csvContent = [
//         columns.join(","),
//         ...chartDataArray.map((row: any) =>
//           columns.map((column) => {
//             const value = row[column];
//             return typeof value === "number" ? value : `"${value}"`;
//           }).join(",")
//         ),
//       ].join("\n");

//       const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
//       const link = document.createElement("a");
//       const url = URL.createObjectURL(blob);
//       link.setAttribute("href", url);
//       link.setAttribute("download", `${chart.name || "chart"}.csv`);
//       document.body.appendChild(link);
//       link.click();
//       document.body.removeChild(link);
//       URL.revokeObjectURL(url);
//       return;
//     }

//     const chartInstance = chartRefs.current[`chart-${chart._id}`];
//     if (!chartInstance) {
//       toast.error("Chart instance not found");
//       return;
//     }
//   };

//   const handleWheel = (e: React.WheelEvent) => {
//     e.stopPropagation();
//   };

//   const allCharts = [...charts, ...temporaryCharts];
//   const numberCharts = allCharts.filter(
//     (chart) => chart.widgetTypeId?.chartType === "number"
//   );
//   const otherCharts = allCharts.filter(
//     (chart) => chart.widgetTypeId?.chartType !== "number"
//   );

//   const bottomRef = isNaturalLangauage ? useRef<HTMLDivElement | null>(null) : null;

//   useEffect(() => {
//     if (isNaturalLangauage && bottomRef?.current) {
//       bottomRef.current.scrollIntoView({ behavior: "smooth" });
//     }
//   }, [chartsLoading, isNaturalLangauage]);

//   // Conditional rendering moved to JSX
//   let content: JSX.Element | null = null;

//   if (chartsLoading && !isNaturalLangauage) {
//     content = (
//       <LoadingContainer>
//         <CircularProgress />
//       </LoadingContainer>
//     );
//   } else if (chartsError && !isNaturalLangauage) {
//     content = (
//       <ErrorContainer>
//         <Typography color="error" variant="h6">
//           {chartsError}
//         </Typography>
//       </ErrorContainer>
//     );
//   } else if ((!allCharts || allCharts.length === 0) && !isNaturalLangauage) {
//     content = (
//       <EmptyContainer>
//         <Typography color="text.secondary" variant="h6">
//           No charts available
//         </Typography>
//       </EmptyContainer>
//     );
//   } else {
//     content = (
//       <Grid
//         container
//         spacing={STYLE_GUIDE.SPACING.s4}
//         sx={{
//           height: "100%",
//           alignContent: "flex-start",
//           p: STYLE_GUIDE.SPACING.s6,
//           "& .MuiGrid-item": {
//             display: "flex",
//             "& > *": {
//               width: "100%",
//             },
//           },
//         }}
//       >
//         {numberCharts.length > 0 && (
//           <Grid item xs={12}>
//             <Grid container spacing={STYLE_GUIDE.SPACING.s4}>
//               {numberCharts.map((chart: any) => (
//                 <Grid item xs={12} md={4} key={chart._id}>
//                   <NumberCard sx={{ ...getCardSx() }}>
//                     <CardContent>
//                       <ChartTitle>
//                         <ChartTitleText>
//                           {chart.name}
//                           {widgetData[chart._id]?.data?.label &&
//                             ` (${widgetData[chart._id]?.data?.label})`}
//                         </ChartTitleText>
//                         <Box sx={{ display: "flex", gap: 1 }}>
//                           <IconButton
//                             size="small"
//                             onClick={() => handleFullViewClick(chart)}
//                             sx={{
//                               opacity: 0.7,
//                               "&:hover": { opacity: 1 },
//                             }}
//                           >
//                             <FullscreenIcon />
//                           </IconButton>
//                           <IconButton
//                             size="small"
//                             onClick={(e) => handleExportMenuClick(e, chart)}
//                             sx={{
//                               opacity: 0.7,
//                               "&:hover": { opacity: 1 },
//                             }}
//                           >
//                             <DownloadIcon />
//                           </IconButton>
//                           {isEditMode && (
//                             <IconButton
//                               size="small"
//                               onClick={(e) => handleMenuClick(e, chart)}
//                               sx={{
//                                 opacity: 0.7,
//                                 "&:hover": { opacity: 1 },
//                               }}
//                             >
//                               <MoreVertIcon />
//                             </IconButton>
//                           )}
//                         </Box>
//                       </ChartTitle>
//                       <ChartContainer
//                         className="number-chart"
//                         onWheel={handleWheel}
//                         sx={{ mt: -2 }}
//                       >
//                         {renderChart(chart)}
//                       </ChartContainer>
//                     </CardContent>
//                   </NumberCard>
//                 </Grid>
//               ))}
//             </Grid>
//           </Grid>
//         )}

//         {otherCharts?.map((chart: any) => (
//           <React.Fragment key={chart._id}>
//             {isNaturalLangauage && (
//               <>
//                 <Divider
//                   sx={{ width: "100%", mt: 2, borderBottomWidth: "2px" }}
//                 />
//                 <Divider
//                   sx={{ width: "100%", mt: 0.2, borderBottomWidth: "2px" }}
//                 />
//                 <Grid item xs={12}>
//                   <Box
//                     sx={{
//                       display: "flex",
//                       justifyContent: "flex-end",
//                       width: "100%",
//                       mt: 2,
//                     }}
//                   >
//                     <Box display="flex" alignItems="center" gap={1}>
//                       <Box
//                         sx={{
//                           backgroundColor: "#e0f7fa",
//                           color: "#000",
//                           padding: "12px 16px",
//                           borderRadius: "16px",
//                           wordBreak: "break-word",
//                           flexShrink: 1,
//                         }}
//                       >
//                         <Typography
//                           variant="body2"
//                           fontWeight={STYLE_GUIDE.TYPOGRAPHY.fontWeight.regular}
//                         >
//                           {chart?.userQuery}
//                         </Typography>
//                       </Box>
//                       <Avatar
//                         sx={{
//                           bgcolor: "purple",
//                           width: 40,
//                           height: 40,
//                           fontSize: 20,
//                         }}
//                       >
//                         U
//                       </Avatar>
//                     </Box>
//                   </Box>
//                 </Grid>
//                 <Grid item xs={12}>
//                   <Box
//                     sx={{
//                       display: "flex",
//                       justifyContent: "flex-start",
//                       width: "100%",
//                       mt: 2,
//                     }}
//                   >
//                     <Box display="flex" alignItems="center" gap={1}>
//                       <Avatar
//                         sx={{
//                           bgcolor: "green",
//                           width: 40,
//                           height: 40,
//                           fontSize: 20,
//                         }}
//                       >
//                         AI
//                       </Avatar>
//                       <Box
//                         sx={{
//                           backgroundColor: "lightgray",
//                           color: "#000",
//                           padding: "12px 16px",
//                           borderRadius: "16px",
//                           wordBreak: "break-word",
//                           flexShrink: 1,
//                         }}
//                       >
//                         <Typography
//                           variant="body2"
//                           fontWeight={STYLE_GUIDE.TYPOGRAPHY.fontWeight.regular}
//                         >
//                           Here's the result based on your query:{" "}
//                           {chart?.userQuery}
//                         </Typography>
//                       </Box>
//                     </Box>
//                   </Box>
//                 </Grid>

//                 <SaveWidgetModel
//                   open={openSaveChart}
//                   onClose={() => {
//                     setOpenSaveChart(false);
//                   }}
//                   onNameChange={setNewSaveChartName}
//                   dashboardList={dashboards}
//                   newChartName={newSaveChartName}
//                   dashBoardId={chartSaveDashboardId}
//                   onDashboardChange={setChartSaveDashboardId}
//                   onCreate={handleSaveWidget}
//                   isCreating={isChartSaving}
//                 />
//               </>
//             )}
//             <Grid
//               item
//               xs={12}
//               md={
//                 isAddChartModalOpen || isEditChartModalOpen
//                   ? 12
//                   : gridColumns === 1
//                     ? 12
//                     : gridColumns === 2
//                       ? 6
//                       : 4
//               }
//               gap={isNaturalLangauage ? 4 : 0}
//               p={isNaturalLangauage ? 2 : 0}
//             >
//               {isNaturalLangauage && (
//                 <AddChartModal
//                   open={true}
//                   onClose={() => {}}
//                   isSubmitting={false}
//                   dashboardId={""}
//                   initialData={chart}
//                   isNaturalLangauage={true}
//                   onSave={(formData) =>
//                     handleChartUpdate({ ...chart, ...formData })
//                   }
//                   setOpenSaveChart={setOpenSaveChart}
//                   setChartSaveSettingData={setChartSaveSettingData}
//                   setNewSaveChartName={setNewSaveChartName}
//                 />
//               )}
//               <StyledCard sx={{ ...getCardSx() }}>
//                 <CardContent
//                   sx={{
//                     flexGrow: 1,
//                     p: 3,
//                     display: "flex",
//                     flexDirection: "column",
//                     height: "100%",
//                   }}
//                 >
//                   <ChartTitle>
//                     <ChartTitleText>
//                       {chart.name}
//                       {widgetData[chart._id]?.data?.label &&
//                         ` (${widgetData[chart._id]?.data?.label})`}
//                     </ChartTitleText>
//                     <Box sx={{ display: "flex", gap: 1 }}>
//                       <IconButton
//                         size="small"
//                         onClick={() => handleFullViewClick(chart)}
//                         sx={{
//                           opacity: 0.7,
//                           "&:hover": { opacity: 1 },
//                         }}
//                       >
//                         <FullscreenIcon />
//                       </IconButton>
//                       <IconButton
//                         size="small"
//                         onClick={(e) => handleExportMenuClick(e, chart)}
//                         sx={{
//                           opacity: 0.7,
//                           "&:hover": { opacity: 1 },
//                         }}
//                       >
//                         <DownloadIcon />
//                       </IconButton>
//                       {isEditMode && (
//                         <IconButton
//                           size="small"
//                           onClick={(e) => handleMenuClick(e, chart)}
//                           sx={{
//                             opacity: 0.7,
//                             "&:hover": { opacity: 1 },
//                           }}
//                         >
//                           <MoreVertIcon />
//                         </IconButton>
//                       )}
//                     </Box>
//                   </ChartTitle>
//                   <ChartContainer
//                     className={
//                       (chart.widgetTypeId?.chartType || "line") === "pie"
//                         ? "pie-chart"
//                         : (chart.widgetTypeId?.chartType || "line") === "horizontalBar"
//                           ? "horizontal-bar-chart"
//                           : (chart.widgetTypeId?.chartType || "line") === "tabular"
//                             ? "table-chart"
//                             : (chart.widgetTypeId?.chartType || "line") === "multiSeriesPie"
//                               ? "pie-chart"
//                               : (chart.widgetTypeId?.chartType || "line") === "stackedBarLine" ||
//                                 (chart.widgetTypeId?.chartType || "line") === "comboBarLine"
//                                 ? "combo-chart"
//                                 : "line-chart"
//                     }
//                     onWheel={handleWheel}
//                   >
//                     {renderChart(chart)}
//                   </ChartContainer>
//                   <Box
//                     sx={{
//                       mt: "auto",
//                       textAlign: "right",
//                       fontWeight: "bold",
//                       color: "primary.main",
//                     }}
//                   >
//                     Total:{widgetData[chart._id]?.data?.totalCount}
//                   </Box>
//                 </CardContent>
//               </StyledCard>
//             </Grid>
//           </React.Fragment>
//         ))}

//         {chartsLoading && isNaturalLangauage && (
//           <Grid
//             item
//             xs={12}
//             sx={{ display: "flex", justifyContent: "center", p: 2 }}
//           >
//             <LoadingContainer>
//               <CircularProgress />
//             </LoadingContainer>
//           </Grid>
//         )}
//         {isNaturalLangauage && <Box ref={bottomRef} />}
//       </Grid>
//     );
//   }

//   return (
//     <>
//       {content}
//       <Menu
//         anchorEl={anchorEl}
//         open={Boolean(anchorEl)}
//         onClose={handleMenuClose}
//         onClick={(e) => e.stopPropagation()}
//       >
//         <MenuItem onClick={handleEditClick}>
//           <EditIcon sx={{ mr: 1, fontSize: 20 }} />
//           Edit
//         </MenuItem>
//         <MenuItem onClick={handleDeleteClick} sx={{ color: "error.main" }}>
//           <DeleteIcon sx={{ mr: 1, fontSize: 20 }} />
//           Delete
//         </MenuItem>
//       </Menu>

//       <Menu
//         anchorEl={exportMenuAnchorEl}
//         open={Boolean(exportMenuAnchorEl)}
//         onClose={handleExportMenuClose}
//         onClick={(e) => e.stopPropagation()}
//       >
//         <MenuItem onClick={() => handleExportImage("png")}>
//           <ImageIcon sx={{ mr: 1, fontSize: 20 }} />
//           Export as PNG
//         </MenuItem>
//         <MenuItem onClick={() => handleExportImage("jpg")}>
//           <ImageIcon sx={{ mr: 1, fontSize: 20 }} />
//           Export as JPG
//         </MenuItem>
//         <MenuItem onClick={handleExportPDF}>
//           <PictureAsPdfIcon sx={{ mr: 1, fontSize: 20 }} />
//           Export as PDF
//         </MenuItem>
//         <MenuItem onClick={handleExportData}>
//           <TableChartIcon sx={{ mr: 1, fontSize: 20 }} />
//           Export Data (CSV)
//         </MenuItem>
//       </Menu>

//       <Dialog
//         open={deleteDialogOpen}
//         onClose={handleDeleteCancel}
//         aria-labelledby="delete-dialog-title"
//       >
//         <DialogTitle id="delete-dialog-title">Delete Chart</DialogTitle>
//         <DialogContent>
//           <Typography>
//             Are you sure you want to delete this chart? This action cannot be undone.
//           </Typography>
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={handleDeleteCancel}>Cancel</Button>
//           <Button
//             onClick={handleDeleteConfirm}
//             color="error"
//             variant="contained"
//             disabled={isDeleting}
//           >
//             {isDeleting ? "Deleting..." : "Delete"}
//           </Button>
//         </DialogActions>
//       </Dialog>

//       <FullScreenModal
//         open={fullViewOpen}
//         onClose={handleFullViewClose}
//         fullScreen
//       >
//         <DialogTitle
//           sx={{
//             display: "flex",
//             justifyContent: "space-between",
//             alignItems: "center",
//             borderBottom: `1px solid ${theme.palette.divider}`,
//             p: 2,
//           }}
//         >
//           <Typography variant="h6">{selectedChart?.name}</Typography>
//           <IconButton
//             onClick={handleFullViewClose}
//             size="small"
//             sx={{
//               color: theme.palette.text.secondary,
//               "&:hover": {
//                 color: theme.palette.text.primary,
//                 backgroundColor: theme.palette.action.hover,
//               },
//             }}
//           >
//             <CloseIcon />
//           </IconButton>
//         </DialogTitle>
//         <FullScreenChartContainer>
//           {selectedChart && renderChart(selectedChart)}
//         </FullScreenChartContainer>
//       </FullScreenModal>

//       {renderDrillDownDialog()}
//     </>
//   );
// };
