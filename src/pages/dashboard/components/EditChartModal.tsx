import React, { useRef, useEffect, Component, ErrorInfo, ReactNode } from "react";
import { Dialog, DialogContent, Box, Typography, CircularProgress } from "@mui/material";
import { useAppDispatch, useAppSelector } from "../../../storeHooks";
import { fetchWidgetDataLazy } from "../dashboardActions";
import { Chart as ChartJS } from "chart.js";
import { ChartResponse, Dashboard } from "../types";
import { ChartFormData } from "./AddChartModal";
import { ChartRender } from "./ChartRender";
import { ChartContainer } from "./ChartGrid";
import { AddChartModal } from "./AddChartModal";
import { STYLE_GUIDE } from "../../../styles";

/** Same className logic as ChartGrid so preview matches view mode layout/colors */
function getChartContainerClassName(chartType: string | undefined): string {
  const type = (chartType || "line").toString().toLowerCase();
  if (type === "pie") return "pie-chart";
  if (type === "horizontalbar") return "horizontal-bar-chart";
  if (type === "tabular") return "table-chart";
  if (type === "multiseriespie") return "pie-chart";
  if (type === "stackedbarline" || type === "combobarline") return "combo-chart";
  if (type === "number") return "number-chart";
  return "line-chart";
}

/** Default number chart colors (match ChartGrid SABIC_COLORS_NUMBER) for fallback preview */
const NUMBER_CHART_COLORS = ["#939598", "#FFCD00", "#009FDF"];

function isNumberChart(chart: ChartResponse | null): boolean {
  if (!chart?.widgetTypeId?.chartType) return false;
  return (chart.widgetTypeId.chartType as string).toString().toLowerCase() === "number";
}

class ChartPreviewErrorBoundary extends Component<
  { children: ReactNode; chartName: string },
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.warn("Chart preview failed:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: 320,
            p: 3,
            backgroundColor: "action.hover",
            borderRadius: 1,
          }}
        >
          <Typography color="text.secondary" textAlign="center">
            Chart preview for &quot;{this.props.chartName}&quot; could not be
            loaded. You can still edit the settings on the right.
          </Typography>
        </Box>
      );
    }
    return this.props.children;
  }
}

export interface EditChartModalProps {
  open: boolean;
  chart: ChartResponse | null;
  chartPreviewRenderer?: ((chart: ChartResponse) => React.ReactNode) | null;
  numberChartColor?: string;
  onClose: () => void;
  onSave: (formData: ChartFormData) => Promise<void>;
  dashboardId: string;
  isTrend?: boolean;
  currentDashboard?: Dashboard;
  startVersionValue?: string;
  endVersionValue?: string;
  versionValue?: string;
  dashboardFilters?: Record<string, unknown>;
  isUpdating?: boolean;
}

const MODAL_MIN_HEIGHT = 560;
const CHART_PANEL_MIN_HEIGHT = 380;
const FORM_PANEL_WIDTH = 480;

export const EditChartModal: React.FC<EditChartModalProps> = ({
  open,
  chart,
  chartPreviewRenderer,
  numberChartColor,
  onClose,
  onSave,
  dashboardId,
  isTrend,
  currentDashboard,
  startVersionValue,
  endVersionValue,
  versionValue,
  dashboardFilters = {},
  isUpdating = false,
}) => {
  const chartPreviewRef = useRef<{ [key: string]: ChartJS | null }>({});
  const initialFetchDoneRef = useRef(false);
  const dispatch = useAppDispatch();
  const widgetData = useAppSelector((state) => state.dashboard.widgetData);
  const hasChartData = chart ? !!widgetData[chart._id]?.data?.widgetData : false;
  const [isLoadingChart, setIsLoadingChart] = React.useState(false);

  // Reset initial fetch flag when modal closes
  useEffect(() => {
    if (!open) {
      initialFetchDoneRef.current = false;
    }
  }, [open]);

  // Sync loading state with whether chart data is available
  // After an update, widgetData gets cleared then re-fetched by the parent
  useEffect(() => {
    if (!open || !chart) return;
    if (hasChartData) {
      setIsLoadingChart(false);
    } else if (initialFetchDoneRef.current) {
      // Data was cleared after an update — parent handles re-fetch, just show loading
      setIsLoadingChart(true);
    }
  }, [open, chart, hasChartData]);

  // Fetch widget data only on initial modal open if not already in store
  useEffect(() => {
    if (!open || !chart) return;
    if (hasChartData || initialFetchDoneRef.current) return;
    initialFetchDoneRef.current = true;
    const dashboardType = currentDashboard?.settings?.dashboardType || "normal";
    let cancelled = false;
    setIsLoadingChart(true);
    dispatch(
      fetchWidgetDataLazy({
        chart,
        dashboardType,
        startVersionValue,
        endVersionValue,
        versionValue,
        dashboardFilters,
        isDefaultNotivix: currentDashboard?.isDefaultNotivix || false,
      }),
    )
      .finally(() => {
        if (!cancelled) setIsLoadingChart(false);
      });
    return () => {
      cancelled = true;
    };
  }, [
    open,
    chart,
    hasChartData,
    dispatch,
    currentDashboard?.settings?.dashboardType,
    currentDashboard?.isDefaultNotivix,
    startVersionValue,
    endVersionValue,
    versionValue,
    dashboardFilters,
  ]);

  if (!open || !chart) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={false}
      PaperProps={{
        sx: {
          width: "95vw",
          maxWidth: 1200,
          height: "85vh",
          minHeight: MODAL_MIN_HEIGHT,
          maxHeight: 800,
          borderRadius: 2,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        },
      }}
    >
      <DialogContent
        sx={{
          flex: 1,
          p: 0,
          display: "flex",
          flexDirection: "row",
          overflow: "hidden",
          minHeight: 0,
        }}
      >
        {/* Left: Chart preview */}
        <Box
          sx={{
            width: "60%",
            minWidth: 320,
            minHeight: CHART_PANEL_MIN_HEIGHT,
            borderRight: "1px solid",
            borderColor: "divider",
            display: "flex",
            flexDirection: "column",
            backgroundColor: "background.default",
            overflow: "hidden",
          }}
        >
          <Box
            sx={{
              px: 2,
              py: 1.5,
              borderBottom: "1px solid",
              borderColor: "divider",
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Typography
              variant="h6"
              sx={{
                fontWeight: STYLE_GUIDE.TYPOGRAPHY.fontWeight.semiBold,
              }}
            >
              {chart.name}
            </Typography>
          </Box>
          <Box
            sx={{
              flex: 1,
              minHeight: CHART_PANEL_MIN_HEIGHT - 56,
              p: 2,
              display: "flex",
              flexDirection: "column",
              overflow: "auto",
              backgroundColor: "#fafafa",
            }}
          >
            {isNumberChart(chart) && numberChartColor ? (
              <>
                <Box
                  sx={{
                    width: "100%",
                    minHeight: 140,
                    borderRadius: 1,
                    backgroundColor: numberChartColor,
                    p: 2,
                    flexShrink: 0,
                  }}
                >
                  <ChartContainer
                    className="number-chart"
                    sx={{
                      flex: 1,
                      minHeight: 0,
                      display: "flex",
                      flexDirection: "column",
                      width: "100%",
                      backgroundColor: "transparent",
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        width: "100%",
                        height: "100%",
                      }}
                    >
                      <Box sx={{ flex: 1, minHeight: 0, width: "100%" }}>
                        <ChartPreviewErrorBoundary chartName={chart.name}>
                          <ChartRender
                            chart={chart}
                            handleChartClick={() => {}}
                            chartRefs={chartPreviewRef}
                            useHtmlLegend={true}
                            htmlLegendContainerId={`legend-container-${chart._id}`}
                            useDashboardPalette={true}
                          />
                        </ChartPreviewErrorBoundary>
                      </Box>
                      <Box sx={{ flexShrink: 0, width: "100%" }}>
                        <div
                          id={`legend-container-${chart._id}`}
                          style={{ marginTop: "8px" }}
                        />
                      </Box>
                    </Box>
                  </ChartContainer>
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "flex-end",
                    alignItems: "center",
                    mt: 1,
                    px: 1,
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{ fontWeight: "bold", color: "#4D4D4D" }}
                  >
                    Total: {widgetData[chart._id]?.data?.totalCount ?? "—"}
                  </Typography>
                </Box>
              </>
            ) : chartPreviewRenderer ? (
              <ChartPreviewErrorBoundary chartName={chart.name}>
                {chartPreviewRenderer(chart)}
              </ChartPreviewErrorBoundary>
            ) : isLoadingChart || isUpdating ? (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  minHeight: CHART_PANEL_MIN_HEIGHT - 56,
                  width: "100%",
                }}
              >
                <CircularProgress />
              </Box>
            ) : (
              <>
                {isNumberChart(chart) ? (
                  <Box
                    sx={{
                      width: "100%",
                      minHeight: 140,
                      borderRadius: 1,
                      backgroundColor: NUMBER_CHART_COLORS[0],
                      p: 2,
                      flexShrink: 0,
                    }}
                  >
                    <ChartContainer
                      className={getChartContainerClassName(
                        chart.widgetTypeId?.chartType,
                      )}
                      sx={{
                        flex: 1,
                        minHeight: 0,
                        display: "flex",
                        flexDirection: "column",
                        width: "100%",
                        backgroundColor: "transparent",
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          width: "100%",
                          height: "100%",
                        }}
                      >
                        <Box sx={{ flex: 1, minHeight: 0, width: "100%" }}>
                          <ChartPreviewErrorBoundary chartName={chart.name}>
                            <ChartRender
                              chart={chart}
                              handleChartClick={() => {}}
                              chartRefs={chartPreviewRef}
                              useHtmlLegend={true}
                              htmlLegendContainerId={`legend-container-${chart._id}`}
                              useDashboardPalette={true}
                            />
                          </ChartPreviewErrorBoundary>
                        </Box>
                        <Box sx={{ flexShrink: 0, width: "100%" }}>
                          <div
                            id={`legend-container-${chart._id}`}
                            style={{ marginTop: "8px" }}
                          />
                        </Box>
                      </Box>
                    </ChartContainer>
                  </Box>
                ) : (
                  <ChartContainer
                    className={getChartContainerClassName(
                      chart.widgetTypeId?.chartType,
                    )}
                    sx={{
                      flex: 1,
                      minHeight: 0,
                      display: "flex",
                      flexDirection: "column",
                      width: "100%",
                      borderRadius: 1,
                      border: "1px solid",
                      borderColor: "divider",
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        width: "100%",
                        height: "100%",
                      }}
                    >
                      <Box sx={{ flex: 1, minHeight: 0, width: "100%" }}>
                        <Box sx={{ height: "400px", width: "100%" }}>
                          <ChartPreviewErrorBoundary chartName={chart.name}>
                            <ChartRender
                              chart={chart}
                              handleChartClick={() => {}}
                              chartRefs={chartPreviewRef}
                              useHtmlLegend={true}
                              htmlLegendContainerId={`legend-container-${chart._id}`}
                              useDashboardPalette={true}
                            />
                          </ChartPreviewErrorBoundary>
                        </Box>
                      </Box>
                      <Box sx={{ flexShrink: 0, width: "100%" }}>
                        <div
                          id={`legend-container-${chart._id}`}
                          style={{ marginTop: "8px" }}
                        />
                      </Box>
                    </Box>
                  </ChartContainer>
                )}
                <Box
                  sx={{
                    flexShrink: 0,
                    width: "100%",
                    display: "flex",
                    justifyContent: "flex-end",
                    alignItems: "center",
                    mt: 1,
                    px: 1,
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{ fontWeight: "bold", color: "#4D4D4D" }}
                  >
                    Total: {widgetData[chart._id]?.data?.totalCount ?? "—"}
                  </Typography>
                </Box>
              </>
            )}
          </Box>
        </Box>

        {/* Right: Edit form */}
        <Box
          sx={{
            width: FORM_PANEL_WIDTH,
            flexShrink: 0,
            minHeight: MODAL_MIN_HEIGHT,
            display: "flex",
            flexGrow: 1,
            flexDirection: "column",
            overflow: "hidden",
            backgroundColor: "background.paper",
          }}
        >
          <AddChartModal
            open={true}
            onClose={onClose}
            isSubmitting={false}
            dashboardId={dashboardId}
            initialData={chart as Parameters<typeof AddChartModal>[0]["initialData"]}
            onSave={onSave}
            isTrend={isTrend}
            currentDashboard={currentDashboard}
            startVersionValue={startVersionValue}
            endVersionValue={endVersionValue}
            versionValue={versionValue}
          />
        </Box>
      </DialogContent>
    </Dialog>
  );
};
