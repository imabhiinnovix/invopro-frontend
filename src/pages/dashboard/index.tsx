import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../storeHooks";
import {
  fetchDashboardList,
  fetchChartData,
  createDashboard,
  deleteDashboard,
} from "./dashboardActions";
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Tooltip,
  useTheme,
  alpha,
  Skeleton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import { format } from "date-fns";
import { DeleteConfirmationModal } from "../../components/atom/sideNav/components/DeleteConfirmationModal";
import { Dashboard as DashboardType, DashboardListResponse } from "./types";

const Dashboard = () => {
  const theme = useTheme();
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

  useEffect(() => {
    if (!dashboards.length) {
      dispatch(fetchDashboardList()).finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, [dispatch, dashboards.length]);

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

  const handleCreateWidget = () => {
    if (id) {
      dispatch(fetchChartData({ dashboardId: id }));
    }
  };

  const handleEdit = (dashboardId: string) => {
    navigate(`/dashboard/${dashboardId}`);
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
          createDashboard({ name: newDashboardName.trim(), dashboardType })
        ).unwrap()) as DashboardListResponse;
        await dispatch(fetchDashboardList());
        setOpenCreateModal(false);
        setNewDashboardName("");
        setDashboardType("normal");
        toast.success(response.message || "Dashboard created successfully!");

        // Navigate to the newly created dashboard
        const newDashboard = response.data[0];

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
          backgroundColor: "#F8FAFC",
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            justifyContent: "space-between",
            alignItems: { xs: "flex-start", md: "center" },
            gap: 2,
            p: { xs: 2, md: 3 },
            backgroundColor: "white",
            borderBottom: "1px solid",
            borderColor: "divider",
          }}
        >
          <Typography
            variant="h4"
            sx={{
              fontWeight: 600,
              color: "text.primary",
              fontSize: { xs: "1.75rem", md: "2rem" },
            }}
          >
            Dashboards
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpenCreateModal(true)}
            sx={{
              backgroundColor: "#9C27B0",
              color: "white",
              "&:hover": {
                backgroundColor: "#7B1FA2",
              },
              px: 3,
              py: 1,
              borderRadius: 1,
              textTransform: "none",
              fontSize: "1rem",
              fontWeight: 500,
            }}
          >
            Create New Dashboard
          </Button>
        </Box>

        <Box sx={{ p: { xs: 2, md: 3 } }}>
          <TableContainer
            component={Paper}
            sx={{
              borderRadius: 2,
              boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.05)",
              maxHeight: "calc(100vh - 300px)",
              overflow: "auto",
              "& .MuiTableCell-root": {
                borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                py: 2,
                px: 3,
              },
            }}
          >
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600, color: "text.primary" }}>
                    Name
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, color: "text.primary" }}>
                    Created By
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, color: "text.primary" }}>
                    Type
                  </TableCell>
                  {/* <TableCell sx={{ fontWeight: 600, color: "text.primary" }}>
                    Updated At
                  </TableCell> */}
                  <TableCell sx={{ fontWeight: 600, color: "text.primary" }}>
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
                            <Skeleton />
                          </TableCell>
                          <TableCell>
                            <Skeleton width={100} />
                          </TableCell>
                        </TableRow>
                      ))
                  : dashboards.map((dashboard) => (
                      <TableRow
                        key={dashboard._id}
                        onClick={() => handleEdit(dashboard._id)}
                        sx={{
                          "&:hover": {
                            backgroundColor: alpha("#9C27B0", 0.02),
                            transition: "background-color 0.2s",
                          },
                          cursor: "pointer",
                        }}
                      >
                        <TableCell sx={{ fontWeight: 500 }}>
                          {dashboard.name}
                        </TableCell>
                        <TableCell>
                          {dashboard?.createdBy?.firstName}{" "}
                          {dashboard?.createdBy?.lastName}
                        </TableCell>
                        <TableCell sx={{ fontWeight: 500 }}>
                          {dashboard?.settings?.dashboardType}
                        </TableCell>
                        {/* <TableCell>
                          {format(
                            new Date(dashboard.createdAt),
                            "MMM dd, yyyy HH:mm"
                          )}
                        </TableCell> */}
                        {/* <TableCell>
                          {format(
                            new Date(dashboard.updatedAt),
                            "MMM dd, yyyy HH:mm"
                          )}
                        </TableCell> */}
                        <TableCell>
                          <Box sx={{ display: "flex", gap: 1 }}>
                            <Tooltip title="Delete Dashboard">
                              <IconButton
                                onClick={(e) => handleDeleteClick(e, dashboard)}
                                size="small"
                                sx={{
                                  color: "#D32F2F",
                                  "&:hover": {
                                    backgroundColor: alpha("#D32F2F", 0.1),
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
        <Dialog
          open={openCreateModal}
          onClose={handleCloseCreateModal}
          PaperProps={{
            sx: {
              borderRadius: 2,
              minWidth: { xs: "90%", sm: "400px" },
              maxWidth: "500px",
            },
          }}
        >
          <DialogTitle
            sx={{
              backgroundColor: alpha(theme.palette.primary.main, 0.05),
              color: "primary.main",
              fontWeight: 600,
              fontSize: "1.25rem",
              py: 2,
            }}
          >
            Create New Dashboard
          </DialogTitle>
          <DialogContent sx={{ mt: 2, pb: 1 }}>
            <TextField
              autoFocus
              margin="dense"
              label="Dashboard Name"
              type="text"
              fullWidth
              variant="outlined"
              value={newDashboardName}
              onChange={(e) => setNewDashboardName(e.target.value)}
              sx={{
                "& .MuiOutlinedInput-root": {
                  "&:hover fieldset": {
                    borderColor: "primary.main",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "primary.main",
                  },
                },
              }}
            />
            <FormControl
              fullWidth
              margin="dense"
              sx={{
                mt: 2,
                "& .MuiOutlinedInput-root": {
                  "&:hover fieldset": {
                    borderColor: "primary.main",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "primary.main",
                  },
                },
              }}
            >
              <InputLabel>Dashboard Type</InputLabel>
              <Select
                value={dashboardType}
                label="Dashboard Type"
                onChange={(e) =>
                  setDashboardType(e.target.value as "normal" | "trend")
                }
              >
                <MenuItem value="normal">Normal</MenuItem>
                <MenuItem value="trend">Trend</MenuItem>
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions sx={{ p: 2, gap: 1 }}>
            <Button
              onClick={handleCloseCreateModal}
              sx={{
                color: "text.secondary",
                "&:hover": {
                  backgroundColor: alpha(theme.palette.grey[500], 0.1),
                },
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateDashboard}
              variant="contained"
              disabled={!newDashboardName.trim() || isCreating}
              sx={{
                backgroundColor: "primary.main",
                "&:hover": {
                  backgroundColor: "primary.dark",
                },
                "&.Mui-disabled": {
                  backgroundColor: alpha(theme.palette.primary.main, 0.5),
                  color: "white",
                },
              }}
            >
              {isCreating ? "Creating..." : "Create"}
            </Button>
          </DialogActions>
        </Dialog>

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
    <Box sx={{ p: 3 }}>
      <DashboardView
        title={currentDashboard.name}
        onTitleChange={handleTitleChange}
      />
    </Box>
  );
};

export default Dashboard;
