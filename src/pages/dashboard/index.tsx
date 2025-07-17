import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../storeHooks";
import { fetchDashboardList, createDashboard } from "./dashboardActions";
import { DashboardView } from "./components/DashboardView";
import { toast } from "react-toastify";
import axiosInstance from "../../services/axiosInstance";
import { POST } from "../../services/apiRoutes";
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
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import { DeleteConfirmationModal } from "../../components/atom/sideNav/components/DeleteConfirmationModal";
import { CreateDashboardModal } from "../../components/atom/sideNav/components/CreateDashboardModal";
import { Dashboard as DashboardType, DashboardListResponse } from "./types";
import { resetChartAndWidgetData } from "./dashboardReducer";
import { STYLE_GUIDE } from '../../styles';
import { useUnifiedTheme } from '../../hooks/useUnifiedTheme';
import { useComponentTypography } from '../../hooks/useComponentTypography';

const Dashboard = () => {
  const theme = useUnifiedTheme();
  const { getHeadingSx, getButtonSx, getTableSx } = useComponentTypography();
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
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
  const [dashboardType, setDashboardType] = useState<"normal" | "trend">(
    "normal"
  );
  const [timePeriod, setTimePeriod] = useState<string>("1m");

  useEffect(() => {
    if (!dashboards.length) {
      dispatch(fetchDashboardList()).finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, [dispatch, dashboards.length]);

  useEffect(() => {
    if(id){
      dispatch(resetChartAndWidgetData());
    }
  }, [id, dispatch])

  const handleTitleChange = async (newTitle: string) => {
    try {
      await axiosInstance.post(`${POST.UPDATE_DASHBOARD}/${id}`, {
        name: newTitle,
      });
      dispatch(fetchDashboardList());
      toast.success("Dashboard name updated successfully!");
    } catch (error) {
      console.error("Failed to update dashboard name:", error);
      toast.error("Failed to update dashboard name. Please try again.");
    }
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
          `${POST.DELETE_DASHBOARD}/${dashboardToDelete._id}`
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
      try {
        setIsCreating(true);
        const response = (await dispatch(
          createDashboard({
            name: newDashboardName.trim(),
            dashboardType,
            dynamicVersionValue: timePeriod,
          })
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
  };

  // If no ID is provided, show the dashboard list view
  if (!id) {
    return (
      <Box
        sx={{
          width: "100%",
          backgroundColor: theme.palette.background.paper,
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            justifyContent: "space-between",
            alignItems: { xs: "flex-start", md: "center" },
            gap: STYLE_GUIDE.SPACING.s4,
            p: { xs: STYLE_GUIDE.SPACING.s4, md: STYLE_GUIDE.SPACING.s6 },
            backgroundColor: theme.palette.background.paper,
            borderBottom: "1px solid",
            borderColor: STYLE_GUIDE.COLORS.divider,
          }}
        >
          <Typography
            variant="h4"
            sx={{
              ...getHeadingSx(),
  
              fontWeight: STYLE_GUIDE.TYPOGRAPHY.fontWeight.semiBold,
              color: STYLE_GUIDE.COLORS.black,
              fontSize: { xs: STYLE_GUIDE.TYPOGRAPHY.fontSize.large, md: STYLE_GUIDE.TYPOGRAPHY.fontSize.xxl },
            }}
          >
            Dashboards
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpenCreateModal(true)}
            sx={{
              ...getButtonSx(),
              backgroundColor: STYLE_GUIDE.COLORS.primary,
              color: STYLE_GUIDE.COLORS.white,
              "&:hover": {
                backgroundColor: STYLE_GUIDE.COLORS.primaryDark,
              },
              px: STYLE_GUIDE.SPACING.s6,
              py: STYLE_GUIDE.SPACING.s2,
              borderRadius: STYLE_GUIDE.SPACING.s2,
              textTransform: "none",
            }}
          >
            Create New Dashboard
          </Button>
        </Box>

        <Box sx={{ p: { xs: STYLE_GUIDE.SPACING.s4, md: STYLE_GUIDE.SPACING.s6 } }}>
          <TableContainer
            component={Paper}
            sx={{
              ...getTableSx(),
              borderRadius: STYLE_GUIDE.SPACING.s4,
              boxShadow: STYLE_GUIDE.SHADOWS.cardPrimary,
              maxHeight: "calc(100vh - 300px)",
              overflow: "auto",
              backgroundColor: theme.palette.card?.background || STYLE_GUIDE.COLORS.backgroundSurface,
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
                  <TableCell sx={{ 
                    fontWeight: STYLE_GUIDE.TYPOGRAPHY.fontWeight.semiBold, 
                    color: theme.palette.table?.headerText || STYLE_GUIDE.COLORS.textGray,
                    backgroundColor: theme.palette.table?.headerBackground || STYLE_GUIDE.COLORS.backgroundLightGray,
                  }}>
                    Name
                  </TableCell>
                  <TableCell sx={{ 
                    fontWeight: STYLE_GUIDE.TYPOGRAPHY.fontWeight.semiBold, 
                    color: theme.palette.table?.headerText || STYLE_GUIDE.COLORS.textGray,
                    backgroundColor: theme.palette.table?.headerBackground || STYLE_GUIDE.COLORS.backgroundLightGray,
                  }}>
                    Created By
                  </TableCell>
                  <TableCell sx={{ 
                    fontWeight: STYLE_GUIDE.TYPOGRAPHY.fontWeight.semiBold, 
                    color: theme.palette.table?.headerText || STYLE_GUIDE.COLORS.textGray,
                    backgroundColor: theme.palette.table?.headerBackground || STYLE_GUIDE.COLORS.backgroundLightGray,
                  }}>
                    Type
                  </TableCell>
                  <TableCell sx={{ 
                    fontWeight: STYLE_GUIDE.TYPOGRAPHY.fontWeight.semiBold, 
                    color: theme.palette.table?.headerText || STYLE_GUIDE.COLORS.textGray,
                    backgroundColor: theme.palette.table?.headerBackground || STYLE_GUIDE.COLORS.backgroundLightGray,
                  }}>
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
                          backgroundColor: index % 2 === 0 
                            ? theme.palette.table?.rowEvenBackground || STYLE_GUIDE.COLORS.white
                            : theme.palette.table?.rowOddBackground || STYLE_GUIDE.COLORS.backgroundDefault,
                          "&:hover": {
                            backgroundColor: theme.palette.table?.rowHoverBackground || STYLE_GUIDE.COLORS.backgroundHover,
                            transition: "background-color 0.2s",
                          },
                          cursor: "pointer",
                        }}
                      >
                        <TableCell sx={{ 
                          fontWeight: STYLE_GUIDE.TYPOGRAPHY.fontWeight.medium,
                          color: theme.palette.table?.rowText || STYLE_GUIDE.COLORS.textDarkGray,
                        }}>
                          {dashboard.name}
                        </TableCell>
                        <TableCell sx={{ 
                          color: theme.palette.table?.rowText || STYLE_GUIDE.COLORS.textDarkGray,
                        }}>
                          {dashboard?.createdBy?.firstName}{" "}
                          {dashboard?.createdBy?.lastName}
                        </TableCell>
                        <TableCell sx={{ 
                          fontWeight: STYLE_GUIDE.TYPOGRAPHY.fontWeight.medium,
                          color: theme.palette.table?.rowText || STYLE_GUIDE.COLORS.textDarkGray,
                        }}>
                          {dashboard?.settings?.dashboardType}
                        </TableCell>
                        <TableCell sx={{ 
                          color: theme.palette.table?.rowText || STYLE_GUIDE.COLORS.textDarkGray,
                        }}>
                          <Box sx={{ display: "flex", gap: STYLE_GUIDE.SPACING.s1 }}>
                            <Tooltip title="Delete Dashboard">
                              <IconButton
                                onClick={(e) => handleDeleteClick(e, dashboard)}
                                size="small"
                                sx={{
                                  color: STYLE_GUIDE.COLORS.materialError,
                                  "&:hover": {
                                    backgroundColor: alpha(STYLE_GUIDE.COLORS.materialError, 0.1),
                                  },
                                }}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>

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
    <Box sx={{ p: STYLE_GUIDE.SPACING.s1, backgroundColor: theme.palette.background.paper }}>
      <DashboardView
        title={currentDashboard.name}
        onTitleChange={handleTitleChange}
      />
    </Box>
  );
};

export default Dashboard;
