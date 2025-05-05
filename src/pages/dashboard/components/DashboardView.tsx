import React, { useState, useRef, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  ButtonGroup,
  Checkbox,
  FormControlLabel,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DoneIcon from "@mui/icons-material/Done";
import PauseIcon from "@mui/icons-material/Pause";
import ViewColumnIcon from "@mui/icons-material/ViewColumn";
import SquareIcon from "@mui/icons-material/Square";
import { useParams, useLocation } from "react-router-dom";
import { ChartGrid } from "./ChartGrid";
import { AddChartModal, ChartFormData } from "./AddChartModal";
import { useAppDispatch, useAppSelector } from "../../../storeHooks";
import {
  updateWidget,
  saveWidgets,
  fetchWidgetTheme,
  fetchChartData,
  updateDashboardVersion,
} from "../dashboardActions";
import { toast } from "react-toastify";
import { ChartResponse, TemporaryChart } from "../types";
import usePost from "../../../hooks/usePost";
import { POST } from "../../../services/apiRoutes";
import CommonDatePicker from "../../../components/common/datePicker/datePicker";
import { useForm } from "react-hook-form";
import { DateTime } from "luxon";

interface DashboardViewProps {
  title: string;
  onTitleChange: (newTitle: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  title: initialTitle,
  onTitleChange,
}) => {
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedTitle, setEditedTitle] = useState(initialTitle);
  const [title, setTitle] = useState(initialTitle);
  const [isAddChartModalOpen, setIsAddChartModalOpen] = useState(false);
  const [isEditChartModalOpen, setIsEditChartModalOpen] = useState(false);
  const [selectedChart, setSelectedChart] = useState<ChartResponse | null>(
    null
  );
  const [gridColumns, setGridColumns] = useState(2);
  const [isDynamicVersion, setIsDynamicVersion] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const { id: dashboardId } = useParams();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const temporaryCharts = useAppSelector(
    (state) => state.dashboard.temporaryCharts
  );
  const dashboards = useAppSelector((state) => state.dashboard.dashboards);
  const currentDashboard = dashboards.find((d) => d._id === dashboardId);

  const postGridColumns = usePost([""]);

  const { control, watch } = useForm({});
  const versionValue = watch("versionValue")
    ? DateTime.fromISO(watch("versionValue")).toFormat("yyyy-LL")
    : "";

  useEffect(() => {
    if (dashboards.length > 0) {
      setGridColumns(
        dashboards.find((dashboard) => dashboard?._id === dashboardId)?.settings
          ?.gridColumns || 2
      );
    }
  }, [dashboards, dashboardId]);

  const handleGridColumns = (columns: number) => {
    setGridColumns(columns);
    postGridColumns.mutate({
      url: `${POST.UPDATE_DASHBOARD}/${dashboardId}`,
      payload: {
        gridColumns: columns,
      },
    });
  };

  useEffect(() => {
    if (dashboardId) {
      dispatch(
        fetchChartData({ dashboardId, versionValue: versionValue || "" })
      );
    }
  }, [dispatch, dashboardId, versionValue]);

  useEffect(() => {
    setIsEditMode(true);
    if (location.state?.enableEditMode) {
      setIsEditMode(true);
    }
  }, [location.state]);

  useEffect(() => {
    if (isEditMode && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditMode]);

  useEffect(() => {
    setEditedTitle(initialTitle);
    setTitle(initialTitle);
  }, [initialTitle]);

  useEffect(() => {
    if (currentDashboard?.widgetThemeId) {
      dispatch(fetchWidgetTheme(currentDashboard.widgetThemeId));
    }
  }, [currentDashboard?.widgetThemeId, dispatch]);

  const handleEditModeToggle = async () => {
    if (isEditMode) {
      // Save title first if it has changed
      if (editedTitle !== title) {
        onTitleChange(editedTitle);
        setTitle(editedTitle);
      }

      // Save temporary charts only if there are any
      if (temporaryCharts.length > 0) {
        try {
          const result = await dispatch(
            saveWidgets({
              widgets: temporaryCharts.map((chart: TemporaryChart) => ({
                dashboardId: chart.dashboardId,
                widgetTypeId: chart.widgetTypeId?._id || "",
                name: chart.name,
                dimensions: chart.dimensions.join(","),
                groupBy: chart.groupBy,
                aggregation: chart.aggregation,
                position: chart.position,
                conditions: chart.conditions,
                dataSourceId: chart.dataSourceId?._id || "",
                entityId: chart.dataSourceId?.entityId || "",
              })),
            })
          ).unwrap();

          if (result.success) {
            toast.success("Charts saved successfully!");
          } else {
            toast.error(result.message || "Failed to save charts");
          }
        } catch (error) {
          if (
            typeof error === "object" &&
            error !== null &&
            "message" in error
          ) {
            toast.error(error.message as string);
          } else {
            toast.error("Failed to save charts");
          }
        }
      }

      setIsEditMode(false);
    } else {
      setIsEditMode(!isEditMode);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      onTitleChange(editedTitle);
      setIsEditMode(false);
    }
  };

  const handleCloseModal = () => {
    setIsAddChartModalOpen(false);
  };

  const handleEditChart = (chart: ChartResponse) => {
    setSelectedChart(chart);
    setIsEditChartModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditChartModalOpen(false);
    setSelectedChart(null);
  };

  const handleChartUpdate = async (formData: ChartFormData) => {
    if (!selectedChart) return;

    try {
      const result = await dispatch(
        updateWidget({
          ...formData,
          _id: selectedChart._id,
          dashboardId: dashboardId || "",
        })
      ).unwrap();

      if (result.success) {
        toast.success("Chart updated successfully!");
        handleCloseEditModal();
      } else {
        toast.error(result.message || "Failed to update chart");
      }
    } catch (error) {
      if (typeof error === "object" && error !== null && "message" in error) {
        toast.error(error.message as string);
      } else {
        toast.error("Failed to update chart");
      }
    }
  };

  const handleDynamicVersionChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const isDynamic = e.target.checked;
    setIsDynamicVersion(isDynamic);
    if (!dashboardId) return;

    try {
      await dispatch(
        updateDashboardVersion({
          dashboardId,
          ...(isDynamic && { versionValue }),
          ...(!isDynamic && { dynamicVersionValue: "1m" }),
        })
      ).unwrap();
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message || "Failed to update version value");
      } else {
        toast.error("Failed to update version value");
      }
    }
  };

  return (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          p: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexShrink: 0,
          gap: 2,
          borderBottom: 1,
          borderColor: "divider",
        }}
      >
        <Box sx={{ flex: 1, mr: 2 }}>
          {isEditMode ? (
            <TextField
              inputRef={inputRef}
              value={editedTitle}
              onChange={(e) => setEditedTitle(e.target.value)}
              onKeyDown={handleKeyPress}
              size="small"
              fullWidth
              sx={{
                "& .MuiInputBase-input": {
                  fontSize: "1.25rem",
                  fontWeight: 500,
                  py: 1.5,
                },
              }}
            />
          ) : (
            <Typography variant="h5" component="h1" fontWeight={500}>
              {title}
            </Typography>
          )}
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          {isEditMode &&
          currentDashboard?.settings?.dashboardType === "normal" ? (
            <>
              <Box sx={{ width: "200px" }}>
                <CommonDatePicker
                  name="versionValue"
                  control={control}
                  views={["year", "month"]}
                  label="Version Value*"
                  rules={{ required: "Version Value is required" }}
                />
              </Box>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={isDynamicVersion}
                    onChange={handleDynamicVersionChange}
                    size="small"
                  />
                }
                label=""
                sx={{
                  mr: 0,
                  "& .MuiFormControlLabel-label": {
                    fontSize: "0.875rem",
                  },
                }}
              />
            </>
          ) : null}
        </Box>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            minWidth: "fit-content",
          }}
        >
          {isEditMode ? (
            <>
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={() => setIsAddChartModalOpen(true)}
                sx={{ minWidth: "120px" }}
              >
                Add Chart
              </Button>
              <Button
                onClick={handleEditModeToggle}
                color="success"
                variant="contained"
                startIcon={<DoneIcon />}
                sx={{ minWidth: "100px" }}
              >
                Save
              </Button>
            </>
          ) : (
            <>
              <ButtonGroup
                variant="outlined"
                aria-label="grid columns"
                size="small"
              >
                <Button
                  onClick={() => handleGridColumns(1)}
                  variant={gridColumns === 1 ? "contained" : "outlined"}
                  sx={{ minWidth: "40px" }}
                >
                  <SquareIcon />
                </Button>
                <Button
                  onClick={() => handleGridColumns(2)}
                  variant={gridColumns === 2 ? "contained" : "outlined"}
                  sx={{ minWidth: "40px" }}
                >
                  <PauseIcon />
                </Button>
                <Button
                  onClick={() => handleGridColumns(3)}
                  variant={gridColumns === 3 ? "contained" : "outlined"}
                  sx={{ minWidth: "40px" }}
                >
                  <ViewColumnIcon />
                </Button>
              </ButtonGroup>
              <Button
                onClick={handleEditModeToggle}
                color="primary"
                variant="contained"
                startIcon={<EditIcon />}
              >
                Edit
              </Button>
            </>
          )}
        </Box>
      </Box>

      <Box
        sx={{
          display: "flex",
          flex: 1,
          overflow: "hidden",
          gap: 3,
          height: "calc(100% - 100px)",
        }}
      >
        <Box
          sx={{
            flex: 1,
            overflow: "auto",
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(auto-fit, minmax(400px, 1fr))",
              md: "repeat(auto-fit, minmax(450px, 1fr))",
              lg: "repeat(auto-fit, minmax(500px, 1fr))",
            },
            gap: 3,
            p: 1,

            transition: "all 0.3s ease",
            ...((isAddChartModalOpen || isEditChartModalOpen) && {
              flex: "1 1 70%",
            }),
            "&::-webkit-scrollbar": {
              width: "8px",
              height: "8px",
            },
            "&::-webkit-scrollbar-thumb": {
              backgroundColor: "rgba(0, 0, 0, 0.1)",
              borderRadius: "4px",
            },
            "&::-webkit-scrollbar-track": {
              backgroundColor: "transparent",
            },
          }}
        >
          {dashboardId && (
            <ChartGrid
              dashboardId={dashboardId}
              isEditMode={isEditMode}
              onEditChart={handleEditChart}
              isAddChartModalOpen={isAddChartModalOpen}
              isEditChartModalOpen={isEditChartModalOpen}
              gridColumns={gridColumns}
            />
          )}
        </Box>

        {(isAddChartModalOpen || isEditChartModalOpen) && (
          <Box
            sx={{
              width: {
                xs: "100%",
                sm: "400px",
                md: "450px",
                lg: "500px",
              },
              flexShrink: 0,
              display: "flex",
              flexDirection: "column",
              borderLeft: "1px solid",
              borderColor: "divider",
              overflow: "hidden",
              height: "100%",
            }}
          >
            {isAddChartModalOpen && (
              <AddChartModal
                open={isAddChartModalOpen}
                onClose={handleCloseModal}
                isSubmitting={false}
                dashboardId={dashboardId || ""}
              />
            )}
            {isEditChartModalOpen && selectedChart && (
              <AddChartModal
                open={isEditChartModalOpen}
                onClose={handleCloseEditModal}
                isSubmitting={false}
                dashboardId={dashboardId || ""}
                initialData={selectedChart}
                onSave={handleChartUpdate}
              />
            )}
          </Box>
        )}
      </Box>
    </Box>
  );
};
