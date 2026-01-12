import React, { useEffect, useRef, useState } from "react";
import { useAppDispatch } from "../../../storeHooks";
import { fetchWidgetDataLazy } from "../dashboardActions";
import { Box, CircularProgress, Typography } from "@mui/material";
import { ChartResponse } from "../types";

interface LazyWidgetProps {
  chart: ChartResponse;
  dashboardType?: string;
  startVersionValue?: string;
  endVersionValue?: string;
  versionValue?: string;
  dashboardFilters?: any;
  hasData: boolean;
  children: React.ReactNode;
}

const LazyWidget: React.FC<LazyWidgetProps> = ({
  chart,
  dashboardType,
  startVersionValue,
  endVersionValue,
  versionValue,
  dashboardFilters,
  hasData,
  children,
}) => {
  const dispatch = useAppDispatch();
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (hasData) return;

    let observer: IntersectionObserver | null = null;
    const currentContainer = containerRef.current;

    const loadData = async () => {
      setIsLoading(true);
      try {
        await dispatch(
          fetchWidgetDataLazy({
            chart,
            dashboardType,
            startVersionValue,
            endVersionValue,
            versionValue,
            dashboardFilters,
          })
        ).unwrap();
      } catch (err) {
        console.error("Failed to load widget data:", err);
      } finally {
        setIsLoading(false);
      }
    };

    observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isLoading && !hasData) {
          loadData();
        }
      },
      {
        root: null,
        rootMargin: "100px",
        threshold: 0.1,
      }
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
            minHeight: 300,
            bgcolor: "background.paper",
            borderRadius: 1,
          }}
        >
          {isLoading ? (
            <CircularProgress size={24} />
          ) : (
            <Typography variant="body2" color="text.secondary">
              Loading...
            </Typography>
          )}
        </Box>
      )}
    </div>
  );
};

export default LazyWidget;
