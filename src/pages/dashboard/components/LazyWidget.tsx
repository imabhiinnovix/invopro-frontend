import React, { useEffect, useRef, useState, useCallback } from "react";
import { useAppDispatch, useAppSelector } from "../../../storeHooks";
import { fetchWidgetDataLazy, storeWidgetData } from "../dashboardActions";
import { Box, CircularProgress, Stack, Typography } from "@mui/material";
import { ChartResponse, CombinedWidgetData } from "../types";

interface LazyWidgetProps {
  chart: ChartResponse;
  dashboardType?: string;
  startVersionValue?: string;
  endVersionValue?: string;
  versionValue?: string;
  dashboardFilters?: any;
  hasData: boolean;
  children: React.ReactNode;
  isBatchReady?: boolean;
  onLoadStart?: () => void;
  onLoadComplete?: () => void;
  loaderHeight?: number;
  isDefaultNotivix?: boolean;
}

const LazyWidget = ({
  chart,
  dashboardType,
  startVersionValue,
  endVersionValue,
  versionValue,
  dashboardFilters,
  hasData,
  children,
  isBatchReady = true,
  onLoadStart,
  onLoadComplete,
  loaderHeight = 450,
  isDefaultNotivix,
}: LazyWidgetProps) => {
  const dispatch = useAppDispatch();
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInViewport, setIsInViewport] = useState(false);

  const cachedWidgetData = useAppSelector((state) =>
    state.dashboard.storeWidgetData.find((item) => item.widgetId === chart._id),
  );

  const loadData = useCallback(async () => {
    setIsLoading(true);
    onLoadStart?.();
    try {
      await dispatch(
        fetchWidgetDataLazy({
          chart,
          dashboardType,
          startVersionValue,
          endVersionValue,
          versionValue,
          dashboardFilters,
          isDefaultNotivix,
        }),
      ).unwrap();
    } catch (err) {
      console.error("Failed to load widget data:", err);
    } finally {
      setIsLoading(false);
      onLoadComplete?.();
    }
  }, [
    dispatch,
    chart,
    dashboardType,
    startVersionValue,
    endVersionValue,
    versionValue,
    dashboardFilters,
    onLoadStart,
    onLoadComplete,
    isDefaultNotivix,
  ]);

  useEffect(() => {
    if (hasData || isLoading || !isInViewport || !isBatchReady) return;
    loadData();
  }, [isBatchReady, isInViewport, hasData, isLoading, loadData]);

  useEffect(() => {
    if (hasData) return;

    if (cachedWidgetData) {
      dispatch(
        storeWidgetData({
          widgetId: chart._id,
          data: cachedWidgetData.data as unknown as CombinedWidgetData,
        }),
      );
      return;
    }

    let observer: IntersectionObserver | null = null;
    const currentContainer = containerRef.current;

    observer = new IntersectionObserver(
      ([entry]) => {
        setIsInViewport(entry.isIntersecting);
        if (entry.isIntersecting && !isLoading && !hasData && isBatchReady) {
          loadData();
        }
      },
      {
        root: null,
        rootMargin: "100px",
        threshold: 0.1,
      },
    );

    if (currentContainer) {
      observer.observe(currentContainer);
    }

    return () => {
      if (currentContainer && observer) {
        observer.unobserve(currentContainer);
      }
    };
  }, [
    hasData,
    isLoading,
    dispatch,
    chart,
    dashboardType,
    startVersionValue,
    endVersionValue,
    versionValue,
    dashboardFilters,
    cachedWidgetData,
    isBatchReady,
    onLoadStart,
    onLoadComplete,
    loadData,
  ]);

  return (
    <div ref={containerRef} style={{ height: "100%", width: "100%" }}>
      {hasData ? (
        children
      ) : (
        <Box
          sx={{
            height: "100%",
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: loaderHeight,
            bgcolor: "background.paper",
            borderRadius: 1,
          }}
        >
          {isLoading ? (
            <Stack alignItems="center" justifyContent="center">
              <CircularProgress size={24} />
              <Typography
                component="span"
                variant="body2"
                color="text.secondary"
                sx={{ mt: 2 }}
              >
                Loading...
              </Typography>
            </Stack>
          ) : null}
        </Box>
      )}
    </div>
  );
};

export default LazyWidget;
