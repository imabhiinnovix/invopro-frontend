import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../storeHooks";
import { fetchDashboardList, createDashboard } from "./dashboardActions";
import { DashboardView } from "./components/DashboardView";
import { toast } from "react-toastify";
import axiosInstance from "../../services/axiosInstance";
import { POST } from "../../services/apiRoutes";
import usePost from "../../hooks/usePost";
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
  alpha,
  Skeleton,
  TextField,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import ViewColumnIcon from "@mui/icons-material/ViewColumn";
import SaveIcon from "@mui/icons-material/Save";
import DeleteOutlined from "@mui/icons-material/DeleteOutlined";
import { PageHeader, PageCardLayout, StyledButton, ActionIconButton } from "../../components/common";
import { DeleteConfirmationModal } from "../../components/atom/sideNav/components/DeleteConfirmationModal";
import { CreateDashboardModal } from "../../components/atom/sideNav/components/CreateDashboardModal";
import { Dashboard as DashboardType, DashboardListResponse } from "./types";
import { resetChartAndWidgetData } from "./dashboardReducer";
import { STYLE_GUIDE } from "../../styles";
import { useUnifiedTheme } from "../../hooks/useUnifiedTheme";
import { useComponentTypography } from "../../hooks/useComponentTypography";
import CommonTable from "../../components/common/table";
import { checkPermission } from "../../utils/utils";
import { PermissionsMap } from "../../utils/constants";
import { useSelector } from "react-redux";
import { RootState } from "../../reducers";

const Dashboard = () => {
  const theme = useUnifiedTheme();
  const { getTableSx } = useComponentTypography();
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const isCreatePage = location.pathname === "/dashboard/create";
  const dashboards = useAppSelector((state) => state.dashboard.dashboards);
  const currentDashboard = dashboards.find((d) => d._id === id);
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [newDashboardName, setNewDashboardName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [dashboardToDelete, setDashboardToDelete] =
    useState<DashboardType | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardType, setDashboardType] = useState<
    "normal" | "trend" | "fixed"
  >("normal");
  const [timePeriod, setTimePeriod] = useState<string>("1m");
  const [dataSourceId, setDataSourceId] = useState<string>("");
  const [createGridColumns, setCreateGridColumns] = useState(2);

  const permissions = useSelector(
    (state: RootState) => state.userPermission?.permissions,
  );

  const shouldAllowDashboardCreate = checkPermission(
    permissions,
    PermissionsMap.DASHBOARD,
    "create",
  );
  const shouldAllowDashboardDelete = checkPermission(
    permissions,
    PermissionsMap.DASHBOARD,
    "delete",
  );

  const shouldAllowDashboardGet = checkPermission(
    permissions,
    PermissionsMap.DASHBOARD,
    "get",
  );

  const shouldAllowDefaultDashboardDelete = checkPermission(
    permissions,
    PermissionsMap.DEFAULT_DASHBOARD,
    "delete",
  );

  const updateDashboardMutation = usePost<
    { name: string },
    { success: boolean; message: string }
  >(
    ["dashboards"],
    () => {
      dispatch(fetchDashboardList());
    },
    true,
  );

  useEffect(() => {
    if (!dashboards.length) {
      dispatch(fetchDashboardList()).finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, [dispatch, dashboards.length]);

  useEffect(() => {
    if (id) {
      dispatch(resetChartAndWidgetData());
    }
  }, [id, dispatch]);

  const handleTitleChange = (newTitle: string) => {
    updateDashboardMutation.mutate({
      url: `${POST.UPDATE_DASHBOARD}/${id}`,
      payload: { name: newTitle },
    });
  };

  const handleEdit = (dashboardId: string) => {
    navigate(`/dashboard/${dashboardId}`, {
      state: { enableEditMode: false },
    });
  };

  const handleDeleteClick = (e: React.MouseEvent, dashboard: DashboardType) => {
    e.stopPropagation();
    setDashboardToDelete(dashboard);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (dashboardToDelete) {
      try {
        setIsDeleting(true);
        await axiosInstance.post(
          `${POST.DELETE_DASHBOARD}/${dashboardToDelete._id}`,
        );
        dispatch(fetchDashboardList());
        toast.success("Dashboard deleted successfully!");
        setDeleteModalOpen(false);
        setDashboardToDelete(null);
      } catch (error) {
        console.error("Failed to delete dashboard:", error);
        toast.error("Failed to delete dashboard. Please try again.");
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModalOpen(false);
    setDashboardToDelete(null);
  };

  const handleCreateDashboard = async () => {
    if (newDashboardName.trim()) {
      if (dashboardType === "fixed" && !dataSourceId.trim()) {
        toast.error("Please select a data source for fixed dashboard type");
        return;
      }
      try {
        setIsCreating(true);
        const response = (await dispatch(
          createDashboard({
            name: newDashboardName.trim(),
            dashboardType,
            dynamicVersionValue: timePeriod,
            ...(dashboardType === "fixed" && { dataSourceId: dataSourceId }),
          }),
        ).unwrap()) as DashboardListResponse;
        await dispatch(fetchDashboardList());
        setOpenCreateModal(false);
        setNewDashboardName("");
        setDashboardType("normal");
        setTimePeriod("1m");
        toast.success(response.message || "Dashboard created successfully!");
        dispatch(resetChartAndWidgetData());

        // Navigate to the newly created dashboard
        const newDashboard = response?.data;

        if (newDashboard) {
          navigate(`/dashboard/${newDashboard._id}`, {
            state: { enableEditMode: true },
          });
        }
      } catch (error:
        | { payload?: { message: string }; message?: string }
        | unknown) {
        console.error("Failed to create dashboard:", error);
        const errorMessage =
          error && typeof error === "object" && "payload" in error
            ? (error.payload as { message?: string })?.message
            : error && typeof error === "object" && "message" in error
              ? (error as { message?: string })?.message
              : "Failed to create dashboard. Please try again.";
        toast.error(errorMessage);
      } finally {
        setIsCreating(false);
      }
    }
  };

  const handleCloseCreateModal = () => {
    setOpenCreateModal(false);
    setNewDashboardName("");
    setDashboardType("normal");
    setTimePeriod("1m");
    setDataSourceId("");
  };

  const handleSaveNewDashboard = async () => {
    if (!newDashboardName.trim()) {
      toast.error("Please enter a dashboard name");
      return;
    }
    try {
      setIsCreating(true);
      const response = (await dispatch(
        createDashboard({
          name: newDashboardName.trim(),
          dashboardType: "normal",
          dynamicVersionValue: "1m",
        })
      ).unwrap()) as DashboardListResponse;
      await dispatch(fetchDashboardList());
      toast.success(response.message || "Dashboard created successfully!");
      dispatch(resetChartAndWidgetData());
      const newDashboard = response?.data;
      if (newDashboard) {
        navigate(`/dashboard/${newDashboard._id}`, {
          state: { enableEditMode: true },
        });
      }
    } catch (error:
      | { payload?: { message: string }; message?: string }
      | unknown) {
      console.error("Failed to create dashboard:", error);
      const errorMessage =
        error && typeof error === "object" && "payload" in error
          ? (error.payload as { message?: string })?.message
          : error && typeof error === "object" && "message" in error
          ? (error as { message?: string })?.message
          : "Failed to create dashboard. Please try again.";
      toast.error(errorMessage);
    } finally {
      setIsCreating(false);
    }
  };

  const columns = [
    {
      id: "name",
      label: "Name",
      minWidth: 170,
      sortable: true,
    },
    {
      id: "createdBy",
      label: "Created By",
      minWidth: 170,
      sortable: true,
    },
    {
      id: "type",
      label: "Type",
      minWidth: 170,
      sortable: true,
    },
    {
      id: "actions",
      label: "Actions",
      minWidth: 170,
      align: "center" as const,
      sortable: false,
      renderCell: (row: Record<string, unknown>) => {
        const original = row.originalData as DashboardType;
        if (
          !shouldAllowDashboardDelete ||
          ("isRoleDefault" in original &&
            original.isRoleDefault &&
            !shouldAllowDefaultDashboardDelete)
        )
          return null;
        return (
          <Box sx={{ display: "flex", justifyContent: "center", width: "100%" }}>
            <Tooltip title="Delete Dashboard" arrow>
              <ActionIconButton
                onClick={(e) =>
                  handleDeleteClick(e, row.originalData as DashboardType)
                }
              >
                <DeleteOutlined sx={{ fontSize: "16px" }} />
              </ActionIconButton>
            </Tooltip>
          </Box>
        );
      },
    },
  ];

  const rows = dashboards.map((dashboard) => ({
    name: dashboard.name,
    createdBy: dashboard.createdBy?.firstName
      ? `${dashboard.createdBy?.firstName} ${dashboard.createdBy?.lastName}`
      : "-",
    type: dashboard.settings.dashboardType,
    actions: dashboard._id,
    originalData: dashboard,
    shouldAllowDelete: shouldAllowDashboardDelete,
  }));

  // Create new dashboard page (/dashboard/create) — same layout as edit screen
  if (isCreatePage) {
    return (
      <Box
        sx={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          p: STYLE_GUIDE.SPACING.s2,
          backgroundColor: theme.palette.background.paper,
        }}
      >
        <Typography
          variant="h4"
          component="h1"
          sx={{
            fontSize: STYLE_GUIDE.TYPOGRAPHY.fontSize.pageTitle,
            fontWeight: STYLE_GUIDE.TYPOGRAPHY.fontWeight.bold,
            color: STYLE_GUIDE.COLORS.black,
          }}
        >
          {newDashboardName.trim() || "New Dashboard"}
        </Typography>
        <Typography
          variant="body1"
          component="div"
          sx={{
            fontSize: "1rem",
            marginTop: "0.25rem",
            color: STYLE_GUIDE.COLORS.textSecondary,
          }}
        >
          Your analytics overview for the current period.
        </Typography>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexShrink: 0,
            gap: STYLE_GUIDE.SPACING.s4,
            borderBottom: 1,
            borderColor: "divider",
            pb: STYLE_GUIDE.SPACING.s2,
            pt: STYLE_GUIDE.SPACING.s2,
          }}
        >
          <Box sx={{ flex: 1, mr: STYLE_GUIDE.SPACING.s4 }}>
            <TextField
              autoFocus
              size="small"
              fullWidth
              placeholder="Dashboard name"
              value={newDashboardName}
              onChange={(e) => setNewDashboardName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSaveNewDashboard();
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: STYLE_GUIDE.SPACING.s2,
                  fontSize: "14px",
                  backgroundColor: theme.palette.background.paper,
                  "& fieldset": { borderColor: theme.palette.divider },
                },
              }}
            />
          </Box>
          <Box sx={{ display: "flex", gap: STYLE_GUIDE.SPACING.s4 }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                borderRadius: 1,
                py: 0.25,
                px: 0.5,
              }}
              aria-label="grid columns"
            >
              <ViewColumnIcon sx={{ fontSize: 20, mr: 0.5 }} />
              <Button
                size="small"
                onClick={() => setCreateGridColumns(1)}
                variant={createGridColumns === 1 ? "contained" : "text"}
                sx={{ minWidth: 32, px: 0.75 }}
              >
                1
              </Button>
              <Typography component="span" sx={{ color: "text.secondary", px: 0.25 }}>|</Typography>
              <Button
                size="small"
                onClick={() => setCreateGridColumns(2)}
                variant={createGridColumns === 2 ? "contained" : "text"}
                sx={{ minWidth: 32, px: 0.75 }}
              >
                2
              </Button>
              <Typography component="span" sx={{ color: "text.secondary", px: 0.25 }}>|</Typography>
              <Button
                size="small"
                onClick={() => setCreateGridColumns(3)}
                variant={createGridColumns === 3 ? "contained" : "text"}
                sx={{ minWidth: 32, px: 0.75 }}
              >
                3
              </Button>
            </Box>
            <StyledButton
              variant="secondary"
              icon={<AddIcon />}
              disabled
            >
              Add Widget
            </StyledButton>
            <StyledButton
              variant="primary"
              icon={<SaveIcon />}
              onClick={handleSaveNewDashboard}
              disabled={!newDashboardName.trim() || isCreating}
            >
              {isCreating ? "Saving..." : "Save Dashboard"}
            </StyledButton>
          </Box>
        </Box>
        <Box
          sx={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            overflow: "auto",
          }}
        >
          <Typography
            variant="h6"
            sx={{
              color: STYLE_GUIDE.COLORS.black,
              fontSize: "1.125rem",
              marginBottom: 1,
            }}
          >
            Your dashboard is empty
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: STYLE_GUIDE.COLORS.textSecondary,
              marginBottom: 3,
            }}
          >
            Start by adding widgets to visualize your data.
          </Typography>
        </Box>
      </Box>
    );
  }

  // If no ID is provided, show the dashboard list view
  if (!id) {
    return (
      <Box
        id="dashboard-list-view"
        sx={{
          display: "flex",
          flexDirection: "column",
          width: "100%"
        }}
      >
        <PageHeader
          title="Dashboards"
          subtext="Interactive data table with filtering, sorting, pagination, and export"
          action={
            shouldAllowDashboardCreate ? (
              <StyledButton
                variant="primary"
                icon={<AddIcon />}
                onClick={() => navigate("/dashboard/create")}
              >
                Create New Dashboard
              </StyledButton>
            ) : undefined
          }
        />

        <PageCardLayout>
          <CommonTable
            columns={columns}
            rows={rows}
            loading={isLoading}
            height="calc(100vh - 240px)"
            onRowClick={(row) =>
              shouldAllowDashboardGet &&
              handleEdit((row.originalData as DashboardType)._id)
            }
            useCustomPagination
          />
        </PageCardLayout>

        {/* <Box
          sx={{ p: { xs: STYLE_GUIDE.SPACING.s4, md: STYLE_GUIDE.SPACING.s6 } }}
        >
          <TableContainer
            component={Paper}
            sx={{
              ...getTableSx(),
              borderRadius: STYLE_GUIDE.SPACING.s4,
              boxShadow: STYLE_GUIDE.SHADOWS.cardPrimary,
              maxHeight: "calc(100vh - 300px)",
              overflow: "auto",
              backgroundColor:
                theme.palette.card?.background ||
                STYLE_GUIDE.COLORS.backgroundSurface,
              "& .MuiTableCell-root": {
                borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                py: STYLE_GUIDE.SPACING.s4,
                px: STYLE_GUIDE.SPACING.s6,
              },
            }}
          >
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell
                    sx={{
                      fontWeight: STYLE_GUIDE.TYPOGRAPHY.fontWeight.semiBold,
                      color:
                        theme.palette.table?.headerText ||
                        STYLE_GUIDE.COLORS.textGray,
                      backgroundColor:
                        theme.palette.table?.headerBackground ||
                        STYLE_GUIDE.COLORS.backgroundLightGray,
                    }}
                  >
                    Name
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: STYLE_GUIDE.TYPOGRAPHY.fontWeight.semiBold,
                      color:
                        theme.palette.table?.headerText ||
                        STYLE_GUIDE.COLORS.textGray,
                      backgroundColor:
                        theme.palette.table?.headerBackground ||
                        STYLE_GUIDE.COLORS.backgroundLightGray,
                    }}
                  >
                    Created By
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: STYLE_GUIDE.TYPOGRAPHY.fontWeight.semiBold,
                      color:
                        theme.palette.table?.headerText ||
                        STYLE_GUIDE.COLORS.textGray,
                      backgroundColor:
                        theme.palette.table?.headerBackground ||
                        STYLE_GUIDE.COLORS.backgroundLightGray,
                    }}
                  >
                    Type
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: STYLE_GUIDE.TYPOGRAPHY.fontWeight.semiBold,
                      color:
                        theme.palette.table?.headerText ||
                        STYLE_GUIDE.COLORS.textGray,
                      backgroundColor:
                        theme.palette.table?.headerBackground ||
                        STYLE_GUIDE.COLORS.backgroundLightGray,
                    }}
                  >
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {isLoading
                  ? Array(5)
                      .fill(0)
                      .map((_, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            <Skeleton />
                          </TableCell>
                          <TableCell>
                            <Skeleton />
                          </TableCell>
                          <TableCell>
                            <Skeleton />
                          </TableCell>
                          <TableCell>
                            <Skeleton width={100} />
                          </TableCell>
                        </TableRow>
                      ))
                  : dashboards.map((dashboard, index) => (
                      <TableRow
                        key={dashboard._id}
                        onClick={() => handleEdit(dashboard._id)}
                        sx={{
                          backgroundColor:
                            index % 2 === 0
                              ? theme.palette.table?.rowEvenBackground ||
                                STYLE_GUIDE.COLORS.white
                              : theme.palette.table?.rowOddBackground ||
                                STYLE_GUIDE.COLORS.backgroundDefault,
                          "&:hover": {
                            backgroundColor:
                              theme.palette.table?.rowHoverBackground ||
                              STYLE_GUIDE.COLORS.backgroundHover,
                            transition: "background-color 0.2s",
                          },
                          cursor: "pointer",
                        }}
                      >
                        <TableCell
                          sx={{
                            fontWeight:
                              STYLE_GUIDE.TYPOGRAPHY.fontWeight.medium,
                            color:
                              theme.palette.table?.rowText ||
                              STYLE_GUIDE.COLORS.textDarkGray,
                          }}
                        >
                          {dashboard.name}
                        </TableCell>
                        <TableCell
                          sx={{
                            color:
                              theme.palette.table?.rowText ||
                              STYLE_GUIDE.COLORS.textDarkGray,
                          }}
                        >
                          {dashboard?.createdBy?.firstName}{" "}
                          {dashboard?.createdBy?.lastName}
                        </TableCell>
                        <TableCell
                          sx={{
                            fontWeight:
                              STYLE_GUIDE.TYPOGRAPHY.fontWeight.medium,
                            color:
                              theme.palette.table?.rowText ||
                              STYLE_GUIDE.COLORS.textDarkGray,
                          }}
                        >
                          {dashboard?.settings?.dashboardType}
                        </TableCell>
                        <TableCell
                          sx={{
                            color:
                              theme.palette.table?.rowText ||
                              STYLE_GUIDE.COLORS.textDarkGray,
                          }}
                        >
                          <Box
                            sx={{
                              display: "flex",
                              gap: STYLE_GUIDE.SPACING.s1,
                            }}
                          >
                            <Tooltip title="Delete Dashboard">
                              <IconButton
                                onClick={(e) => handleDeleteClick(e, dashboard)}
                                size="small"
                                sx={{
                                  color: STYLE_GUIDE.COLORS.materialError,
                                  "&:hover": {
                                    backgroundColor: alpha(
                                      STYLE_GUIDE.COLORS.materialError,
                                      0.1
                                    ),
                                  },
                                }}
                              >
                                <DeleteOutlined fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box> */}

        {/* Create Dashboard Modal */}
        <CreateDashboardModal
          open={openCreateModal}
          onClose={handleCloseCreateModal}
          newDashboardName={newDashboardName}
          onNameChange={setNewDashboardName}
          onCreate={handleCreateDashboard}
          isCreating={isCreating}
          dashboardType={dashboardType}
          onDashboardTypeChange={setDashboardType}
          timePeriod={timePeriod}
          onTimePeriodChange={setTimePeriod}
          dataSourceId={dataSourceId}
          onDataSourceChange={setDataSourceId}
          activeTab="ReportiVix"
        />

        {/* Delete Confirmation Modal */}
        <DeleteConfirmationModal
          open={deleteModalOpen}
          dashboard={dashboardToDelete}
          onConfirm={handleDeleteConfirm}
          onCancel={handleDeleteCancel}
          isDeleting={isDeleting}
        />
      </Box>
    );
  }
  // Show loading state while fetching dashboard data
  if (!currentDashboard) {
    return <div>Loading...</div>;
  }

  // Show specific dashboard view
  return (
    <DashboardView
      title={currentDashboard.name}
      onTitleChange={handleTitleChange}
    />
  );
};

export default Dashboard;
