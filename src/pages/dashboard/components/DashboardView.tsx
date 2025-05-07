import React, { useState, useRef, useEffect, useMemo } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  ButtonGroup,
  Checkbox,
  FormControlLabel,
  Stack,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
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
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

interface DashboardViewProps {
  title: string;
  onTitleChange: (newTitle: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  title: initialTitle,
  onTitleChange,
}): JSX.Element => {
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
  const [timePeriod, setTimePeriod] = useState<string>("1m");

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

  const validationSchema = yup.object({
    versionValue: yup.string().nullable().optional(),
    startDate: yup
      .string()
      .nullable()
      .when("$isDashboardTrend", ([isDashboardTrend]) => {
        if (isDashboardTrend) {
          return yup.string().nullable().required("Start date is required");
        }
        return yup.string().nullable().optional();
      }),
    endDate: yup
      .string()
      .nullable()
      .when(
        ["$isDashboardTrend", "startDate"],
        ([isDashboardTrend, startDate]) => {
          if (isDashboardTrend && startDate) {
            return yup
              .string()
              .nullable()
              .required("End date is required")
              .test(
                "is-after-start",
                "End date must be after or equal to start date",
                function (value) {
                  const { startDate } = this.parent;
                  if (!value || !startDate) return true;

                  try {
                    const startDateTime = DateTime.fromISO(startDate);
                    const endDateTime = DateTime.fromISO(value);
                    return endDateTime >= startDateTime;
                  } catch {
                    return false;
                  }
                }
              );
          }
          return yup.string().nullable().optional();
        }
      ),
  });

  const {
    control,
    watch,
    setValue,
    formState: { errors },
    trigger,
  } = useForm<{
    versionValue?: string | null | undefined;
    startDate?: string | null | undefined;
    endDate?: string | null | undefined;
  }>({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      versionValue:
        currentDashboard?.settings?.versionValue &&
        typeof currentDashboard.settings.versionValue === "string"
          ? DateTime.fromFormat(
              currentDashboard.settings.versionValue,
              "yyyy-LL"
            ).toISO()
          : undefined,
      startDate:
        currentDashboard?.settings?.startVersionValue &&
        typeof currentDashboard.settings.startVersionValue === "string"
          ? DateTime.fromFormat(
              currentDashboard.settings.startVersionValue,
              "yyyy-LL"
            ).toISO()
          : undefined,
      endDate:
        currentDashboard?.settings?.endVersionValue &&
        typeof currentDashboard.settings.endVersionValue === "string"
          ? DateTime.fromFormat(
              currentDashboard.settings.endVersionValue,
              "yyyy-LL"
            ).toISO()
          : null,
    },
    context: {
      isDashboardTrend: currentDashboard?.settings?.dashboardType === "trend",
    },
  });

  const versionValue = watch("versionValue");
  const formattedVersionValue = versionValue
    ? DateTime.fromISO(versionValue).toFormat("yyyy-LL")
    : undefined;

  const startDate = watch("startDate");
  const startVersionValue = startDate
    ? DateTime.fromISO(startDate).toFormat("yyyy-LL")
    : undefined;

  const endDate = watch("endDate");
  const endVersionValue = endDate
    ? DateTime.fromISO(endDate).toFormat("yyyy-LL")
    : undefined;

  const hasErrors = useMemo(() => {
    return !!errors.startDate || !!errors.endDate;
  }, [errors.startDate, errors.endDate, startVersionValue, endVersionValue]);

  useEffect(() => {
    if (dashboards.length > 0) {
      setGridColumns(
        dashboards.find((dashboard) => dashboard?._id === dashboardId)?.settings
          ?.gridColumns || 2
      );
    }
  }, [dashboards, dashboardId]);

  useEffect(() => {
    if (dashboardId) {
      if (
        currentDashboard?.settings?.dashboardType === "normal" &&
        formattedVersionValue
      ) {
        dispatch(
          fetchChartData({
            dashboardId,
            versionValue: formattedVersionValue,
          })
        );
      } else if (
        currentDashboard?.settings?.dashboardType === "trend" &&
        startVersionValue &&
        endVersionValue &&
        !hasErrors
      ) {
        dispatch(
          fetchChartData({
            dashboardId,
            versionValue: undefined,
            startVersionValue,
            endVersionValue,
            dashboardType: currentDashboard?.settings?.dashboardType,
          })
        );
        // dispatch(
        //   updateDashboardVersion({
        //     dashboardId,
        //     versionValue: undefined,
        //     dynamicVersionValue: undefined,
        //     ...(startVersionValue && { startVersionValue }),
        //     ...(endVersionValue && { endVersionValue }),
        //   })
        // );
      }
    }
  }, [
    currentDashboard?.settings?.dashboardType,
    dashboardId,
    dispatch,
    formattedVersionValue,
    hasErrors,
    startVersionValue,
    endVersionValue,
  ]);

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

  useEffect(() => {
    if (currentDashboard?.settings) {
      if (
        currentDashboard.settings.versionValue &&
        typeof currentDashboard.settings.versionValue === "string"
      ) {
        setValue(
          "versionValue",
          DateTime.fromFormat(
            currentDashboard.settings.versionValue,
            "yyyy-LL"
          ).toISO()
        );
        setIsDynamicVersion(
          !!currentDashboard.settings.versionValue &&
            !currentDashboard.settings.dynamicVersionValue
        );
      }
      if (
        currentDashboard.settings.startVersionValue &&
        typeof currentDashboard.settings.startVersionValue === "string"
      ) {
        setValue(
          "startDate",
          DateTime.fromFormat(
            currentDashboard.settings.startVersionValue,
            "yyyy-LL"
          ).toISO()
        );
      }
      if (
        currentDashboard.settings.endVersionValue &&
        typeof currentDashboard.settings.endVersionValue === "string"
      ) {
        setValue(
          "endDate",
          DateTime.fromFormat(
            currentDashboard.settings.endVersionValue,
            "yyyy-LL"
          ).toISO()
        );
      }
    }
  }, [currentDashboard?.settings, setValue]);

  const handleGridColumns = (columns: number) => {
    setGridColumns(columns);
    postGridColumns.mutate({
      url: `${POST.UPDATE_DASHBOARD}/${dashboardId}`,
      payload: {
        gridColumns: columns,
      },
    });
  };

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
          ...(isDynamic &&
            currentDashboard?.settings?.dashboardType === "normal" && {
              versionValue: formattedVersionValue,
            }),
          ...(!isDynamic && { dynamicVersionValue: "1m" }),
          ...(isDynamic &&
            currentDashboard?.settings?.dashboardType === "trend" &&
            startVersionValue &&
            endVersionValue && { startVersionValue, endVersionValue }),
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

  useEffect(() => {
    if (
      startDate &&
      endDate &&
      currentDashboard?.settings?.dashboardType === "trend"
    ) {
      trigger("endDate");
      trigger("startDate");
    }
  }, [startDate, endDate, currentDashboard?.settings?.dashboardType, trigger]);

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

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
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

      {isEditMode && (
        <Box
          sx={{
            p: 2,
            display: "flex",
            // alignItems: "center",
            justifyContent: "space-between",
            // flexShrink: 0,
            gap: 2,
            borderBottom: 1,
            borderColor: "divider",
          }}
        >
          <Stack direction="row" spacing={2}>
            {currentDashboard?.settings?.dashboardType === "normal" ? (
              <Box>
                <CommonDatePicker
                  name="versionValue"
                  control={control}
                  views={["year", "month"]}
                  label="Version Value"
                  rules={{ required: "Version Value is required" }}
                />
              </Box>
            ) : currentDashboard?.settings?.dashboardType === "trend" ? (
              <Stack direction="row" spacing={2}>
                <CommonDatePicker
                  name="startDate"
                  control={control}
                  views={["year", "month"]}
                  label="Start Date"
                  rules={{ required: "Start date is required" }}
                />

                <CommonDatePicker
                  name="endDate"
                  control={control}
                  views={["year", "month"]}
                  label="End Date"
                  rules={{ required: "End date is required" }}
                />
              </Stack>
            ) : null}
            <FormControl sx={{ minWidth: 120 }}>
              <InputLabel id="time-period-label">Time Period</InputLabel>
              <Select
                labelId="time-period-label"
                id="time-period-select"
                value={timePeriod}
                label="Time Period"
                onChange={(e) => setTimePeriod(e.target.value)}
                // size="small"
              >
                <MenuItem value="1m">1 Month</MenuItem>
                <MenuItem value="6m">6 Months</MenuItem>
                <MenuItem value="12m">12 Months</MenuItem>
              </Select>
            </FormControl>
          </Stack>

          {/* <FormControlLabel
            control={
              <Checkbox
                checked={isDynamicVersion}
                onChange={handleDynamicVersionChange}
                size="small"
              />
            }
            label="Sticky"
            sx={{
              mr: 0,
              "& .MuiFormControlLabel-label": {
                fontSize: "0.875rem",
              },
            }}
          /> */}

          <Stack
            direction="row"
            spacing={2}
            justifyContent="center"
            alignItems="center"
          >
            <Button
              variant="outlined"
              color="secondary"
              sx={{ minWidth: "100px", maxHeight: "fit-content" }}
            >
              Clear
            </Button>
            <Button
              onClick={() => {}}
              color="success"
              variant="contained"
              startIcon={<DoneIcon />}
              sx={{ minWidth: "100px", maxHeight: "fit-content" }}
            >
              Save
            </Button>
          </Stack>
        </Box>
      )}

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
                isTrend={currentDashboard?.settings?.dashboardType === "trend"}
                currentDashboard={currentDashboard}
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
                isTrend={currentDashboard?.settings?.dashboardType === "trend"}
                currentDashboard={currentDashboard}
              />
            )}
          </Box>
        )}
      </Box>
    </Box>
  );
};
