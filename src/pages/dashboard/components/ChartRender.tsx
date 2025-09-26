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
import { Box, Table, TableCell, TableHead, TableRow, Typography } from "@mui/material";
import { useAppSelector } from "../../../storeHooks";
import { ChartDataItem, ChartResponse } from "../types";
import { STYLE_GUIDE } from "../../../styles";
import { ChartContainer, NumberDisplay, NumberValue, NumberLabel } from "./ChartStyles";

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

interface ChartRenderProps {
  chart: ChartResponse;
  handleChartClick: (chart: ChartResponse, elements: ActiveElement[]) => void;
  chartRefs: React.MutableRefObject<{ [key: string]: ChartJS | null }>;
}

export const ChartRender: React.FC<ChartRenderProps> = ({
  chart,
  handleChartClick,
  chartRefs,
}) => {
  const widgetTheme = useAppSelector((state) => state.dashboard.widgetTheme);
  const theme = useAppSelector((state) => state.theme);

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
      useAppSelector((state) => state.dashboard.widgetData[chart._id]?.data?.widgetData) ||
      chart.data ||
      [];

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

    // Handle stacked bar-line chart
    if (chartType === "line") {
      const barLabels = Array.from(
        new Set(chartData.map((item: ChartDataItem) => item.name))
      );

      if (groupBy.length > 0) {
        const groupByField = groupBy[0];
        const uniqueGroups = Array.from(
          new Set(chartData.map((item) => item[groupByField] as string))
        );
        let uniqueNameDataMap: any = {};

        const datasets = uniqueGroups.map((group, index) => {
          let totalDataBasedOnGroup = 0;
          const groupData = barLabels.map((name) => {
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
            return dataPoint ? dataPoint.data : 0;
          });

          if (index === 0) {
            return {
              label: group,
              data: groupData,
              type: "line" as const,
              borderColor:
                widgetTheme?.colors?.[0] || theme.palette.primary.main,
              backgroundColor: "transparent",
              tension: 0.1,
              fill: false,
              pointRadius: 5,
              pointHoverRadius: 9,
              pointHitRadius: 20,
              yAxisID: "y1",
            };
          } else {
            return {
              label: group,
              data: groupData,
              type: "bar" as const,
              backgroundColor:
                widgetTheme?.backgroundColor[
                  (index - 1) % widgetTheme?.backgroundColor.length
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

      const values = Array.from(
        new Set(chartData.map((item: ChartDataItem) => item.data))
      );
      const barLabelsName = Array.from(
        new Set(
          chartData.map(
            (item: ChartDataItem) => `${item.name}(Total:${item.data})`
          )
        )
      );
      return {
        labels: barLabelsName,
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
        let uniqueNameDataMap: any = {};

        const datasets = uniqueGroups.map((group, index) => {
          let totalDataBasedOnGroup = 0;
          const groupData = barLabels.map((name) => {
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
            return dataPoint ? dataPoint.data : 0;
          });

          if (index === 0) {
            return {
              label: group,
              data: groupData,
              type: "line" as const,
              borderColor:
                widgetTheme?.colors?.[0] || theme.palette.primary.main,
              backgroundColor: "transparent",
              tension: 0.1,
              fill: false,
              pointRadius: 5,
              pointHoverRadius: 9,
              pointHitRadius: 20,
              yAxisID: "y1",
            };
          } else {
            return {
              label: group,
              data: groupData,
              type: "bar" as const,
              backgroundColor:
                widgetTheme?.backgroundColor[
                  (index - 1) % widgetTheme?.backgroundColor.length
                ],
              borderColor: widgetTheme?.borderColor,
              borderWidth: 1,
              yAxisID: "y",
            };
          }
        });

        return { labels: barLabels, datasets };
      }

      const values = Array.from(
        new Set(chartData.map((item: ChartDataItem) => item.data))
      );
      const barLabelsName = Array.from(
        new Set(
          chartData.map(
            (item: ChartDataItem) => `${item.name}(Total:${item.data})`
          )
        )
      );
      return {
        labels: barLabelsName,
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

    // Handle polar area chart with grouping
    if (chartType === "polarArea" && groupBy.length > 0) {
      const groupByField = groupBy[0];
      const uniqueGroups = Array.from(
        new Set(
          chartData.map((item: ChartDataItem) => item[groupByField] as string)
        )
      );
      const uniqueNames = Array.from(
        new Set(chartData.map((item: ChartDataItem) => item.name))
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
          return dataPoint ? dataPoint.data : 0;
        });

        return {
          label: group,
          data: groupData,
          color: widgetTheme?.colors,
          backgroundColor:
            widgetTheme?.backgroundColor[
              index % widgetTheme?.backgroundColor.length
            ],
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

    // Handle non-grouped polar area chart
    if (chartType === "polarArea") {
      const polarLabels = Array.from(
        new Set(
          chartData.map((item: ChartDataItem) => `${item.name}-${item.data}`)
        )
      );
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

    // Handle horizontal bar chart
    if (chartType === "horizontalBar") {
      // For non-grouped horizontal bar charts
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

      // For grouped horizontal bar charts
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
            widgetTheme?.backgroundColor?.[index % (widgetTheme?.backgroundColor?.length || 1)] ||
            theme.palette.primary.main,
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

    // Handle vertical bar chart (both grouped and non-grouped)
    if (
      chartType === "verticalBar" ||
      chartType === "stackedBar" ||
      chartType === "multiSeriesPie"
    ) {
      const barLabels = Array.from(
        new Set(chartData.map((item: ChartDataItem) => item.name))
      );

      if (groupBy.length > 0) {
        const groupByField = groupBy[0];
        const uniqueGroups = Array.from(
          new Set(chartData.map((item) => item[groupByField] as string))
        );
        let uniqueNameDataMap: any = {};

        const datasets = uniqueGroups.map((group, index) => {
          let totalDataBasedOnGroup = 0;
          const groupData = barLabels.map((name) => {
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
            return dataPoint ? dataPoint.data : 0;
          });

          return {
            label: group,
            data: groupData,
            backgroundColor:
              widgetTheme?.backgroundColor[
                index % widgetTheme?.backgroundColor.length
              ],
            borderColor: widgetTheme?.borderColor,
            borderWidth: 1,
            borderRadius: 4,
          };
        });

        return { labels: barLabels, datasets };
      }

      const values = Array.from(
        new Set(chartData.map((item: ChartDataItem) => item.data))
      );
      const barLabelsName = Array.from(
        new Set(
          chartData.map(
            (item: ChartDataItem) => `${item.name}(Total:${item.data})`
          )
        )
      );
      return {
        labels: barLabelsName,
        datasets: [
          {
            label: barLabels,
            data: values,
            backgroundColor: widgetTheme?.backgroundColor,
            borderColor: widgetTheme?.borderColor,
            borderWidth: 1,
            borderRadius: 4,
          },
        ],
      };
    }

    // Handle pie chart or doughnut chart
    if (chartType === "pie" || chartType === "doughnut") {
      const pieLabels = Array.from(
        new Set(
          chartData.map(
            (item: ChartDataItem) => `${item.name}(Total:${item.data})`
          )
        )
      );
      const values = chartData.map((item: ChartDataItem) => item.data);

      if (groupBy.length > 0) {
        const groupByField = groupBy[0];
        const uniqueGroups = Array.from(
          new Set(chartData.map((item) => item[groupByField] as string))
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
            return dataPoint ? dataPoint.data : 0;
          });

          return {
            label: group,
            data: groupData,
            backgroundColor:
              widgetTheme?.backgroundColor[
                index % widgetTheme?.backgroundColor.length
              ],
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

    // Handle radar chart
    if (chartType === "radar") {
      const radarLabels = Array.from(
        new Set(
          chartData.map(
            (item: ChartDataItem) => `${item.name}(Total:${item.data})`
          )
        )
      );

      if (groupBy.length > 0) {
        const groupByField = groupBy[0];
        const uniqueGroups = Array.from(
          new Set(chartData.map((item) => item[groupByField] as string))
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
            return dataPoint ? dataPoint.data : 0;
          });

          return {
            label: group,
            data: groupData,
            color: widgetTheme?.colors,
            backgroundColor:
              widgetTheme?.backgroundColor[
                index % widgetTheme?.backgroundColor.length
              ],
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
          labels: uniqueNames.map(
            (name) => `${name}(Total:${uniqueNameDataMap[name]})`
          ),
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

    // Handle grouped line/area chart
    if (chartType === "area" || chartType === "line") {
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
              widgetTheme?.borderColor[index % widgetTheme?.borderColor.length],
            backgroundColor:
              chartType === "area"
                ? widgetTheme?.backgroundColor[
                    index % widgetTheme?.backgroundColor.length
                  ]
                : "transparent",
            tension: 0.1,
            fill: chartType === "area" ? "start" : false,
            pointRadius: 5,
            pointHoverRadius: 9,
            pointHitRadius: 20,
          };
        });
        return {
          labels: uniqueNames.map(
            (name) => `${name}(Total:${uniqueNameDataMap[name]})`
          ),
          datasets,
        };
      } else {
        const lineLabels = Array.from(
          new Set(
            chartData.map(
              (item: ChartDataItem) => `${item.name}(Total:${item.data})`
            )
          )
        );
        const values = chartData.map((item: ChartDataItem) => item.data);
        return {
          labels: lineLabels,
          datasets: [
            {
              label: chart.name,
              data: values,
              borderColor: widgetTheme?.borderColor[0],
              backgroundColor:
                chartType === "area"
                  ? widgetTheme?.backgroundColor[0]
                  : "transparent",
              tension: 0.1,
              fill: chartType === "area" ? "start" : false,
              pointRadius: 5,
              pointHoverRadius: 9,
              pointHitRadius: 20,
            },
          ],
        };
      }
    }

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
  const options = getChartOptions(chartType, chart);
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
      const chartDataArray =
        useAppSelector((state) => state.dashboard.widgetData[chart._id]?.data?.widgetData) ||
        chart.data ||
        [];

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