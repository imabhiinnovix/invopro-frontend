import React from "react";
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
  Box,
  Table,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  useTheme,
} from "@mui/material";
import { useAppSelector } from "../../../storeHooks";
import { ChartDataItem, ChartResponse } from "../types";
import { STYLE_GUIDE } from "../../../styles";
import { styled } from "@mui/material/styles";
import { ChartContainer } from "./ChartGrid";
import { Theme } from "../../createTheme/types";

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
  color: widgetTheme?.colors?.[0] || "#4D4D4D",
  lineHeight: STYLE_GUIDE.TYPOGRAPHY.lineHeight.tight,
}));

const NumberLabel = styled(Typography)(({ theme }) => ({
  fontSize: "1rem",
  color: theme.palette.text.secondary,
  textAlign: "center",
}));

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

// Same palette as ChartGrid so Edit Chart modal matches dashboard colors
const SABIC_COLORS = [
  "#009FDF",
  "#FFCD00",
  "#333333",
  "#004B87",
];
const getSabicColor = (index: number) =>
  SABIC_COLORS[index % SABIC_COLORS.length];

interface ChartRenderProps {
  chart: ChartResponse;
  handleChartClick: (chart: ChartResponse, elements: ActiveElement[]) => void;
  chartRefs: React.MutableRefObject<{ [key: string]: ChartJS | null }>;
  /** When set, use external HTML legend (rendered below chart) like dashboard view mode */
  useHtmlLegend?: boolean;
  htmlLegendContainerId?: string;
  /** When true, always use dashboard (SABIC) palette so colors match fullscreen/dashboard view */
  useDashboardPalette?: boolean;
}

export const ChartRender: React.FC<ChartRenderProps> = ({
  chart,
  handleChartClick,
  chartRefs,
  useHtmlLegend,
  htmlLegendContainerId,
  useDashboardPalette = false,
}) => {
  const widgetTheme = useAppSelector((state) => state.dashboard.widgetTheme);
  const theme = useTheme();
  const rawWidgetData =
    useAppSelector((state) => state.dashboard.widgetData[chart._id]?.data?.widgetData) ||
    chart.data ||
    [];

  const getDatasetColor = (index: number) =>
    useDashboardPalette
      ? getSabicColor(index)
      : (widgetTheme?.backgroundColor?.[index % (widgetTheme?.backgroundColor?.length || 1)] ??
         getSabicColor(index));
  const getDatasetColors = (count: number) =>
    useDashboardPalette
      ? Array.from({ length: count }, (_, i) => getSabicColor(i))
      : (widgetTheme?.backgroundColor?.length
          ? widgetTheme.backgroundColor
          : Array.from({ length: count }, (_, i) => getSabicColor(i)));

  const getChartData = (chart: ChartResponse) => {
    const createDefaultDataset = (data: number[] = []): ChartDataset => ({
      label: chart.name,
      data,
      borderColor: getSabicColor(0),
      backgroundColor: getSabicColor(0) + "33",
      tension: 0.1,
      fill: chart.widgetTypeId?.chartType === "area" ? "start" : false,
      pointRadius: 5,
      pointHoverRadius: 9,
      pointHitRadius: 20,
    });

    const chartData = rawWidgetData;

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

    // Helper to resolve the groupBy field name (matches ChartGrid's resolveGroupField)
    const resolveGroupField = (gb: string[]) => {
      const groupFieldKey = gb[0];
      const matchedField = (chart.dataSourceId as any)?.fieldSettings?.find(
        (f: any) => f.mappedAttributeName === groupFieldKey,
      );
      return matchedField ? matchedField.label : groupFieldKey;
    };

    // ===== Line / Area =====
    if (chartType === "line" || chartType === "area") {
      const labels = Array.from(
        new Set(chartData.map((item: ChartDataItem) => item.name))
      );
      const isArea = chartType === "area";

      if (groupBy.length > 0) {
        const groupField = resolveGroupField(groupBy);
        const uniqueGroups = Array.from(
          new Set(chartData.map((item) => item[groupField] || "Unknown")),
        );

        const datasets = uniqueGroups.map((group, index) => {
          const groupData = labels.map((label) => {
            const dataPoint = chartData.find(
              (item: ChartDataItem) =>
                item.name === label && (item[groupField] || "Unknown") === group,
            );
            return dataPoint ? dataPoint.data : 0;
          });

          return {
            label: group,
            data: groupData,
            borderColor: getDatasetColor(index),
            backgroundColor: isArea ? getDatasetColor(index) + "33" : "transparent",
            fill: isArea ? "start" : false,
            tension: 0.4,
            pointRadius: 5,
            pointHoverRadius: 8,
          };
        });

        return { labels, datasets };
      }

      const dataset = {
        label: "Data",
        data: labels.map((label) => {
          const item = chartData.find((d: ChartDataItem) => d.name === label);
          return item ? item.data : 0;
        }),
        borderColor: getDatasetColor(0),
        backgroundColor: isArea ? getDatasetColor(0) + "33" : "transparent",
        fill: isArea ? "start" : false,
        tension: 0.4,
        pointRadius: 5,
        pointHoverRadius: 8,
      };

      return { labels, datasets: [dataset] };
    }

    // ===== Vertical Bar / Horizontal Bar / Stacked Bar / multiSeriesBar =====
    if (
      chartType === "verticalBar" ||
      chartType === "horizontalBar" ||
      chartType === "stackedBar" ||
      chartType === "multiSeriesBar" ||
      chartType === "multiSeriesPie"
    ) {
      const labels = Array.from(
        new Set(chartData.map((item: ChartDataItem) => item.name))
      );

      if (groupBy.length > 0) {
        const groupField = resolveGroupField(groupBy);
        const uniqueGroups = Array.from(
          new Set(
            chartData.map((item) => item[groupField]).filter(Boolean),
          ),
        );

        const datasets = uniqueGroups.map((group, i) => {
          const values = labels.map((label) => {
            const found = chartData.find(
              (item: ChartDataItem) =>
                item.name === label && item[groupField] === group,
            );
            return found ? found.data : 0;
          });

          return {
            label: group,
            data: values,
            backgroundColor: getDatasetColor(i),
            borderColor: "#009FDF",
            borderWidth: 1,
            borderRadius: 4,
          };
        });

        return { labels, datasets };
      }

      // No groupBy: one dataset per data item so each bar gets its own color
      const datasets = chartData.map((item: ChartDataItem, i: number) => ({
        label: item.name,
        data: labels.map((lbl) => (lbl === item.name ? item.data : 0)),
        backgroundColor: getDatasetColor(i),
        borderColor: "#009FDF",
        borderWidth: 1,
        borderRadius: 4,
      }));

      return { labels, datasets };
    }

    // ===== Pie / Doughnut =====
    if (chartType === "pie" || chartType === "doughnut") {
      const labels = Array.from(
        new Set(chartData.map((item: ChartDataItem) => item.name))
      );

      if (groupBy.length > 0) {
        const groupField = resolveGroupField(groupBy);
        const uniqueGroups = Array.from(
          new Set(
            chartData.map(
              (item) => (item[groupField] as string) ?? "Unknown"
            )
          )
        );

        const datasets = uniqueGroups.map((group, groupIndex) => {
          const values = labels.map((label) => {
            const found = chartData.find(
              (item: ChartDataItem) =>
                item.name === label &&
                ((item[groupField] as string) ?? "Unknown") === group
            );
            return found ? found.data : 0;
          });

          return {
            label: group,
            data: values,
            backgroundColor: labels.map((_, i) =>
              getDatasetColor(i + groupIndex * 5)
            ),
            borderColor: "#FFFFFF",
            borderWidth: 2,
          };
        });

        return { labels, datasets };
      }

      const values = labels.map((label) => {
        const found = chartData.find(
          (item: ChartDataItem) => item.name === label
        );
        return found ? found.data : 0;
      });

      return {
        labels,
        datasets: [
          {
            data: values,
            backgroundColor: getDatasetColors(values.length),
            borderColor: "#FFFFFF",
            borderWidth: 2,
          },
        ],
      };
    }

    // ===== Polar Area =====
    if (chartType === "polarArea") {
      const labels = Array.from(
        new Set(chartData.map((item: ChartDataItem) => item.name))
      );

      if (groupBy.length > 0) {
        const groupField = resolveGroupField(groupBy);
        const uniqueGroups = Array.from(
          new Set(
            chartData.map(
              (item) => (item[groupField] as string) ?? "Unknown"
            )
          )
        );

        const datasets = uniqueGroups.map((group, groupIndex) => {
          const values = labels.map((label) => {
            const found = chartData.find(
              (item: ChartDataItem) =>
                item.name === label &&
                ((item[groupField] as string) ?? "Unknown") === group
            );
            return found ? found.data : 0;
          });

          return {
            label: group,
            data: values,
            backgroundColor: labels.map((_, i) =>
              getDatasetColor(i + groupIndex * 5)
            ),
            borderColor: "#FFFFFF",
            borderWidth: 2,
          };
        });

        return { labels, datasets };
      }

      const values = labels.map((label) => {
        const found = chartData.find(
          (item: ChartDataItem) => item.name === label
        );
        return found ? found.data : 0;
      });

      return {
        labels,
        datasets: [
          {
            data: values,
            backgroundColor: getDatasetColors(values.length),
            borderColor: "#FFFFFF",
            borderWidth: 2,
          },
        ],
      };
    }

    // ===== Radar =====
    if (chartType === "radar") {
      const labels = Array.from(
        new Set(chartData.map((item: ChartDataItem) => item.name))
      );

      if (groupBy.length > 0) {
        const groupField = resolveGroupField(groupBy);
        const uniqueGroups = Array.from(
          new Set(
            chartData.map((item) => item[groupField]).filter(Boolean),
          ),
        );

        const datasets = uniqueGroups.map((group, i) => {
          const values = labels.map((label) => {
            const found = chartData.find(
              (item: ChartDataItem) =>
                item.name === label && item[groupField] === group,
            );
            return found ? found.data : 0;
          });

          return {
            label: group,
            data: values,
            backgroundColor: getDatasetColor(i) + "33",
            borderColor: getDatasetColor(i),
            pointBackgroundColor: getDatasetColor(i),
            pointBorderColor: "#fff",
          };
        });

        return { labels, datasets };
      }

      const values = labels.map((label) => {
        const found = chartData.find(
          (item: ChartDataItem) => item.name === label
        );
        return found ? found.data : 0;
      });

      return {
        labels,
        datasets: [
          {
            label: chart.name || "Count",
            data: values,
            backgroundColor: getDatasetColor(0) + "33",
            borderColor: getDatasetColor(0),
            pointBackgroundColor: getDatasetColor(0),
            pointBorderColor: "#fff",
          },
        ],
      };
    }

    // ===== Combo Bar-Line =====
    if (chartType === "comboBarLine" || chartType === "stackedBarLine") {
      const labels = Array.from(
        new Set(chartData.map((item: ChartDataItem) => item.name))
      );

      if (groupBy.length > 0) {
        const groupField = resolveGroupField(groupBy);
        const uniqueGroups = Array.from(
          new Set(chartData.map((item) => item[groupField]).filter(Boolean)),
        );

        const barDatasets = uniqueGroups.map((group, i) => {
          const values = labels.map((label) => {
            const found = chartData.find(
              (item: ChartDataItem) =>
                item.name === label && item[groupField] === group,
            );
            return found ? found.data : 0;
          });

          return {
            type: "bar" as const,
            label: group,
            data: values,
            backgroundColor: getDatasetColor(i),
            borderColor: "#FFFFFF",
            borderWidth: 1,
            borderRadius: 4,
            yAxisID: "y",
          };
        });

        const totals = labels.map((label) =>
          uniqueGroups.reduce<number>((sum, group) => {
            const found = chartData.find(
              (item: ChartDataItem) =>
                item.name === label && item[groupField] === group,
            );
            return sum + (found ? Number(found.data) || 0 : 0);
          }, 0),
        );

        const lineDataset = {
          type: "line" as const,
          label: chart.name || "Total",
          data: totals,
          borderColor: getDatasetColor(uniqueGroups.length),
          backgroundColor: "transparent",
          yAxisID: "y1",
          tension: 0.4,
          fill: false,
          pointRadius: 5,
          pointHoverRadius: 8,
        };

        return { labels, datasets: [...barDatasets, lineDataset] };
      }

      const barDatasets = chartData.map((item: ChartDataItem, i: number) => ({
        type: "bar" as const,
        label: item.name,
        data: labels.map((lbl) => (lbl === item.name ? item.data : 0)),
        backgroundColor: getDatasetColor(i),
        borderColor: "#FFFFFF",
        borderWidth: 1,
        borderRadius: 4,
        yAxisID: "y",
      }));

      const totals = labels.map((label) => {
        const found = chartData.find(
          (item: ChartDataItem) => item.name === label
        );
        return found ? found.data : 0;
      });

      const lineDataset = {
        type: "line" as const,
        label: chart.name || "Total",
        data: totals,
        borderColor: getDatasetColor(chartData.length),
        backgroundColor: "transparent",
        yAxisID: "y1",
        tension: 0.4,
        fill: false,
        pointRadius: 5,
        pointHoverRadius: 8,
      };

      return { labels, datasets: [...barDatasets, lineDataset] };
    }

    // ===== Scatter =====
    if (chartType === "scatter") {
      if (groupBy.length > 0) {
        const groupField = resolveGroupField(groupBy);
        const uniqueGroups = Array.from(
          new Set(chartData.map((item) => item[groupField]).filter(Boolean)),
        );

        const datasets = uniqueGroups.map((group, i) => {
          const groupData = chartData
            .filter((item: ChartDataItem) => item[groupField] === group)
            .map((item: ChartDataItem, index: number) => ({
              x: item.x ?? index,
              y: item.y ?? item.data,
            }));

          return {
            label: group,
            data: groupData,
            backgroundColor: getDatasetColor(i),
            borderColor: getDatasetColor(i),
          };
        });

        return { datasets };
      }

      const scatterData = chartData.map(
        (item: ChartDataItem, index: number) => ({
          x: item.x ?? index,
          y: item.y ?? item.data,
        }),
      );

      return {
        datasets: [
          {
            label: chart.name || "Count",
            data: scatterData,
            backgroundColor: getDatasetColor(0),
            borderColor: getDatasetColor(0),
          },
        ],
      };
    }

    // ===== Bubble =====
    if (chartType === "bubble") {
      if (groupBy.length > 0) {
        const groupField = resolveGroupField(groupBy);
        const uniqueGroups = Array.from(
          new Set(
            chartData.map((item) => item[groupField] ?? "Unknown"),
          ),
        );

        const datasets = uniqueGroups.map((group, index) => {
          const groupData = chartData
            .filter(
              (item: ChartDataItem) =>
                (item[groupField] ?? "Unknown") === group,
            )
            .map((item: ChartDataItem, i: number) => ({
              x: item.x ?? i,
              y: item.y ?? item.data ?? 0,
              r: item.r ?? Math.max(5, (item.data ?? 0) / 10),
            }));

          return {
            label: group,
            data: groupData,
            backgroundColor: getDatasetColor(index + 2) + "99",
            borderColor: getDatasetColor(index),
          };
        });

        return { datasets };
      }

      const bubbleData = chartData.map(
        (item: ChartDataItem, index: number) => ({
          x: item.x ?? index,
          y: item.y ?? item.data ?? 0,
          r: item.r ?? Math.max(5, (item.data ?? 0) / 10),
        }),
      );

      return {
        datasets: [
          {
            label: chart.name,
            data: bubbleData,
            backgroundColor: getDatasetColor(2) + "99",
            borderColor: getDatasetColor(0),
          },
        ],
      };
    }

    // ===== Default fallback =====
    const defaultLabels = Array.from(
      new Set(chartData.map((item: ChartDataItem) => item.name))
    );
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
                text: chart?.aggregation?.attributeName || "Y-axis",
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
                font: {
                  size: 11,
                },
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
                text: chart.aggregation?.attributeName || "Count",
                color: widgetTheme?.scales?.x?.ticks?.color || theme.palette.text.primary,
                font: {
                  size: 14,
                  weight: "bold",
                },
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
                font: {
                  size: 12,
                },
              },
            },
            y: {
              title: {
                display: true,
                text: chart.dimensions?.[0] || "Category",
                color: widgetTheme?.scales?.y?.ticks?.color || theme.palette.text.primary,
                font: {
                  size: 14,
                  weight: "bold",
                },
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
                font: {
                  size: 12,
                },
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
                font: {
                  size: widgetTheme?.legend?.labels?.font?.size ?? 12,
                },
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
                text: chart?.aggregation?.attributeName || "Value",
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
                color:
                  widgetTheme?.scales?.y?.grid?.color ?? theme.palette.divider,
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
          scales: {
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
                color:
                  widgetTheme?.scales?.x?.ticks?.color ??
                  theme.palette.text.secondary,
                padding: widgetTheme?.scales?.x?.ticks?.padding ?? 8,
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

  const dimensionField =
    Array.isArray(chart.dimensions) && chart.dimensions.length > 0
      ? chart.dimensions[0]
      : typeof chart.dimensions === "string"
        ? chart.dimensions
        : "name";

  const aggregationField = chart.aggregation?.attributeName || "data";

  const chartType = chart.widgetTypeId?.chartType || "line";
  let options = getChartOptions(chartType, chart);
  if (useHtmlLegend && htmlLegendContainerId) {
    options = {
      ...options,
      plugins: {
        ...options.plugins,
        legend:
          options.plugins?.legend && typeof options.plugins.legend === "object"
            ? { ...options.plugins.legend, display: false }
            : { display: false },
        htmlLegend: { containerID: htmlLegendContainerId },
      },
    };
  }
  const chartData = getChartData(chart);
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
          <NumberValue widgetTheme={null} sx={{ color: "#4D4D4D" }}>
            {numberValue.toLocaleString()}
          </NumberValue>
          <NumberLabel sx={{ color: "#4D4D4D" }}>{chart.name}</NumberLabel>
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

    case "tabular":
      const chartDataArray = rawWidgetData;

      const columns =
        chartDataArray.length > 0
          ? Object.keys(chartDataArray[0]).map((col) => {
              if (col === "name") return dimensionField;
              if (col === "data") return aggregationField;
              return col;
            })
          : [];

      return (
        <ChartContainer
          className="table-chart"
          sx={{
            maxHeight: 400,
            overflow: "auto",
            backgroundColor:
              theme.palette.background.paper ||
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
                        theme.palette.table?.headerBackground ||
                        STYLE_GUIDE.COLORS.backgroundLightGray,
                      fontWeight: STYLE_GUIDE.TYPOGRAPHY.fontWeight.semiBold,
                      fontSize: "14px",
                      color:
                        theme.palette.table?.headerText ||
                        STYLE_GUIDE.COLORS.textGray,
                      borderBottom: `2px solid ${theme.palette.divider}`,
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
                        ? theme.palette.table?.rowEvenBackground ||
                          STYLE_GUIDE.COLORS.white
                        : theme.palette.table?.rowOddBackground ||
                          STYLE_GUIDE.COLORS.backgroundDefault,
                    "&:hover": {
                      backgroundColor:
                        theme.palette.table?.rowHoverBackground ||
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
                          borderBottom: `1px solid ${theme.palette.divider}`,
                          color:
                            theme.palette.table?.rowText ||
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
        </ChartContainer>
      );

    default:
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