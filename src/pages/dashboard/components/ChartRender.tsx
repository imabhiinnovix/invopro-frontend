import React from "react";
import { mapGroupLabel, sortGroupValues, sliceLabelsPlugin, barLabelsPlugin, pointLabelsPlugin, polarAreaLabelsPlugin } from "../../../utils/utils";
import noDataImage from "../../../assets/no-data-available.jpeg";
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
  TableBody,
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
        const uniqueGroups = sortGroupValues(groupBy[0], Array.from(
          new Set(chartData.map((item) => item[groupField] || "Unknown")),
        ));

        const datasets = uniqueGroups.map((group, index) => {
          const groupData = labels.map((label) => {
            const dataPoint = chartData.find(
              (item: ChartDataItem) =>
                item.name === label && (item[groupField] || "Unknown") === group,
            );
            return dataPoint ? dataPoint.data : 0;
          });
          const displayLabel = mapGroupLabel(groupBy[0], group as string);

          return {
            label: displayLabel,
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
        const uniqueGroups = sortGroupValues(groupBy[0], Array.from(
          new Set(
            chartData.map((item) => item[groupField]).filter(Boolean),
          ),
        ));

        const datasets = uniqueGroups.map((group, i) => {
          const values = labels.map((label) => {
            const found = chartData.find(
              (item: ChartDataItem) =>
                item.name === label && item[groupField] === group,
            );
            return found ? found.data : 0;
          });
          const displayLabel = mapGroupLabel(groupBy[0], group as string);

          return {
            label: displayLabel,
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
        const uniqueGroups = sortGroupValues(groupBy[0], Array.from(
          new Set(
            chartData.map(
              (item) => (item[groupField] as string) ?? "Unknown"
            )
          )
        ));

        const datasets = uniqueGroups.map((group, groupIndex) => {
          const values = labels.map((label) => {
            const found = chartData.find(
              (item: ChartDataItem) =>
                item.name === label &&
                ((item[groupField] as string) ?? "Unknown") === group
            );
            return found ? found.data : 0;
          });
          const displayLabel = mapGroupLabel(groupBy[0], group as string);

          return {
            label: displayLabel,
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
        const uniqueGroups = sortGroupValues(groupBy[0], Array.from(
          new Set(
            chartData.map(
              (item) => (item[groupField] as string) ?? "Unknown"
            )
          )
        ));

        const datasets = uniqueGroups.map((group, groupIndex) => {
          const values = labels.map((label) => {
            const found = chartData.find(
              (item: ChartDataItem) =>
                item.name === label &&
                ((item[groupField] as string) ?? "Unknown") === group
            );
            return found ? found.data : 0;
          });
          const displayLabel = mapGroupLabel(groupBy[0], group as string);

          return {
            label: displayLabel,
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
        const uniqueGroups = sortGroupValues(groupBy[0], Array.from(
          new Set(
            chartData.map((item) => item[groupField]).filter(Boolean),
          ),
        ));

        const datasets = uniqueGroups.map((group, i) => {
          const values = labels.map((label) => {
            const found = chartData.find(
              (item: ChartDataItem) =>
                item.name === label && item[groupField] === group,
            );
            return found ? found.data : 0;
          });
          const displayLabel = mapGroupLabel(groupBy[0], group as string);

          return {
            label: displayLabel,
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

      const attributeFieldKey = chart?.aggregation?.attributeName;
      const matchedAttributeField = (chart.dataSourceId as any)?.fieldSettings?.find(
        (f: any) => f.mappedAttributeName === attributeFieldKey,
      );
      const resolvedAttributeLabel = matchedAttributeField
        ? matchedAttributeField.label
        : attributeFieldKey;

      if (groupBy.length > 0) {
        const groupField = resolveGroupField(groupBy);
        const uniqueGroups = sortGroupValues(groupBy[0], Array.from(
          new Set(chartData.map((item) => item[groupField]).filter(Boolean)),
        ));

        const barDatasets = uniqueGroups.map((group, i) => {
          const values = labels.map((label) => {
            const found = chartData.find(
              (item: ChartDataItem) =>
                item.name === label && item[groupField] === group,
            );
            return found ? found.data : 0;
          });
          const displayLabel = mapGroupLabel(groupBy[0], group as string);

          return {
            type: "bar" as const,
            label: displayLabel,
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
          label: `${resolvedAttributeLabel || chart?.aggregation?.attributeName || chart.name || "Total"}`,
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
        label: `${resolvedAttributeLabel || chart?.aggregation?.attributeName || chart.name || "Total"}`,
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
        const uniqueGroups = sortGroupValues(groupBy[0], Array.from(
          new Set(chartData.map((item) => item[groupField]).filter(Boolean)),
        ));

        const datasets = uniqueGroups.map((group, i) => {
          const groupData = chartData
            .filter((item: ChartDataItem) => item[groupField] === group)
            .map((item: ChartDataItem, index: number) => ({
              x: item.x ?? index,
              y: item.y ?? item.data,
            }));
          const displayLabel = mapGroupLabel(groupBy[0], group as string);

          return {
            label: displayLabel,
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
        const uniqueGroups = sortGroupValues(groupBy[0], Array.from(
          new Set(
            chartData.map((item) => item[groupField] ?? "Unknown"),
          ),
        ));

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
          const displayLabel = mapGroupLabel(groupBy[0], group as string);

          return {
            label: displayLabel,
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

  const getLabelForField = (
    field: string | undefined,
    fieldSettings: any[] = [],
  ): string | undefined => {
    if (!field) return field;
    const matched = fieldSettings?.find(
      (fs: any) => fs.mappedAttributeName === field,
    );
    return matched?.label || field;
  };

  const getChartOptions = (chartType: string, chart: ChartResponse) => {
    const fieldSettings = (chart.dataSourceId as any)?.fieldSettings || [];
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
            font: {
              size: widgetTheme?.legend?.labels?.font?.size ?? 12,
            },
            boxWidth: widgetTheme?.legend?.labels?.boxWidth ?? 10,
            boxHeight: widgetTheme?.legend?.labels?.boxHeight ?? 10,
          },
          maxHeight: 100,
        },
        tooltip: {
          enabled: false,
          external: function (context: any) {
            let tooltipEl = document.getElementById("chartjs-tooltip");

            if (!tooltipEl) {
              tooltipEl = document.createElement("div");
              tooltipEl.id = "chartjs-tooltip";
              tooltipEl.style.background =
                widgetTheme?.tooltip?.backgroundColor ??
                theme.palette.background.paper;
              tooltipEl.style.borderRadius = "6px";
              tooltipEl.style.border = `${
                widgetTheme?.tooltip?.borderWidth ?? 1
              }px solid ${
                widgetTheme?.tooltip?.borderColor ?? theme.palette.divider
              }`;
              tooltipEl.style.color = theme.palette.text.secondary;
              tooltipEl.style.opacity = "1";
              tooltipEl.style.pointerEvents = "auto";
              tooltipEl.style.position = "absolute";
              tooltipEl.style.transform = "translate(-50%, 0)";
              tooltipEl.style.transition = "opacity .15s ease";
              tooltipEl.style.fontSize = "12px";
              tooltipEl.style.padding = `${
                widgetTheme?.tooltip?.padding ?? 12
              }px`;
              tooltipEl.style.boxShadow = "0 2px 8px rgba(0,0,0,0.15)";
              tooltipEl.style.zIndex = "10000";

              (tooltipEl as any).isHovered = false;

              tooltipEl.addEventListener("mouseenter", function () {
                (this as any).isHovered = true;
              });

              tooltipEl.addEventListener("mouseleave", function () {
                (this as any).isHovered = false;
                this.style.opacity = "0";
              });

              document.body.appendChild(tooltipEl);
            }

            const tooltipModel = context.tooltip;
            if (tooltipModel.opacity === 0) {
              if (!(tooltipEl as any).isHovered) {
                tooltipEl.style.opacity = "0";
              }
              return;
            }

            tooltipEl.classList.remove("above", "below", "no-transform");
            if (tooltipModel.yAlign) {
              tooltipEl.classList.add(tooltipModel.yAlign);
            } else {
              tooltipEl.classList.add("no-transform");
            }

            function getBody(bodyItem: any) {
              return bodyItem.lines;
            }

            if (tooltipModel.body) {
              const titleLines = tooltipModel.title || [];
              const bodyLines = tooltipModel.body.map(getBody);

              let innerHtml =
                '<div style="max-height: 300px; overflow-y: auto; overflow-x: hidden; padding-right: 4px;">';

              titleLines.forEach(function (title: string) {
                innerHtml += `<div style="font-weight: bold; margin-bottom: 4px; color: ${
                  widgetTheme?.tooltip?.titleColor ??
                  theme.palette.text.primary
                };">${title}</div>`;
              });

              bodyLines.forEach(function (body: string[], i: number) {
                const colors = tooltipModel.labelColors[i];
                const style = `background:${colors.backgroundColor}; border-color:${colors.borderColor}; border-width: 2px; border-style: solid; width: 10px; height: 10px; display: inline-block; margin-right: 6px; border-radius: 50%;`;
                innerHtml += `<div style="display: flex; align-items: center; margin-bottom: 2px;"><span style="${style}"></span>${body}</div>`;
              });

              innerHtml += "</div>";
              tooltipEl.innerHTML = innerHtml;
            }

            const position = context.chart.canvas.getBoundingClientRect();
            tooltipEl.style.opacity = "1";
            tooltipEl.style.left =
              position.left +
              window.pageXOffset +
              tooltipModel.caretX +
              "px";
            tooltipEl.style.top =
              position.top +
              window.pageYOffset +
              tooltipModel.caretY +
              "px";
            tooltipEl.style.font = tooltipModel.options.bodyFont.string;
          },
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
                color: "black",
                display: true,
                text: yLabel,
                font: { size: 14, weight: "bold" as const },
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
                color: "black",
                display: true,
                text: xLabel,
                font: { size: 14, weight: "bold" as const },
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
                color: "black",
                font: { size: 14, weight: "bold" as const },
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
                text: yLabel,
                color: widgetTheme?.scales?.y?.ticks?.color || theme.palette.text.primary,
                font: { size: 14, weight: "bold" as const },
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
              display: false,
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
                color: "black",
                display: true,
                text: xLabel,
                font: { size: 14, weight: "bold" as const },
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
                color: "black",
                display: true,
                text: yLabel,
                font: { size: 14, weight: "bold" as const },
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
                color: "black",
                display: true,
                text: yLabel,
                font: { size: 14, weight: "bold" as const },
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
                color: "black",
                display: true,
                text: `Total ${yLabel}`,
                font: { size: 14, weight: "bold" as const },
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
                font: { size: 14, weight: "bold" as const },
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
                color: "black",
                font: { size: 14, weight: "bold" as const },
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
                color: "black",
                font: { size: 14, weight: "bold" as const },
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
                font: { size: 14, weight: "bold" as const },
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
              position: "bottom" as const,
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
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", width: "100%", height: "100%" }}>
        <img src={noDataImage} alt="No Data Available" style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} />
      </Box>
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