import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Grid,
  CircularProgress,
  Button,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material";
import {
  Add as AddIcon,
  Palette as PaletteIcon,
  CheckCircle as ApplyIcon,
} from "@mui/icons-material";
import { useAppDispatch, useAppSelector } from "../../storeHooks";
import {
  deleteDashboardTheme,
  duplicateDashboardTheme,
  applyDashboardTheme,
  clearError,
  clearSuccess,
} from "../../reducers/dashboardThemeSlice";
import { DashboardTheme } from "../../types/dashboardTheme";
import DashboardThemePreview from "./components/DashboardThemePreview";
import CreateDashboardThemeDialog from "./components/CreateDashboardThemeDialog";
import { toast } from "react-toastify";
import { useUnifiedTheme } from "../../hooks/useUnifiedTheme";
import { useComponentTypography } from "../../hooks/useComponentTypography";
import { STYLE_GUIDE } from "../../styles";
import PrimaryButton from "../../components/common/PrimaryButton";
import DialogContainer from "../../components/molecule/dialog";

const DashboardThemePage = () => {
  const unifiedTheme = useUnifiedTheme();
  const { getHeadingSx, getButtonSx } = useComponentTypography();
  const dispatch = useAppDispatch();
  const { themes, loading, error, success, dashboardTheme } = useAppSelector(
    (state) => state.dashboardTheme
  );
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState<DashboardTheme | null>(
    null
  );
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [themeToDelete, setThemeToDelete] = useState<string | null>(null);

  const { getDialogTitleSx } = useComponentTypography();

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  useEffect(() => {
    if (success) {
      toast.success(success);
      dispatch(clearSuccess());
    }
  }, [success, dispatch]);

  const handleUpdateTheme = (theme: DashboardTheme) => {
    setSelectedTheme(theme);
    setIsDialogOpen(true);
  };

  const handleDeleteTheme = (themeId: string) => {
    setThemeToDelete(themeId);
    setDeleteConfirmOpen(true);
  };

  const handleDuplicateTheme = (themeId: string) => {
    dispatch(duplicateDashboardTheme(themeId));
  };

  const handleApplyTheme = (theme: DashboardTheme) => {
    if (theme._id) {
      dispatch(applyDashboardTheme(theme._id));
    }
  };

  const confirmDelete = () => {
    if (themeToDelete) {
      dispatch(deleteDashboardTheme(themeToDelete));
      setDeleteConfirmOpen(false);
      setThemeToDelete(null);
    }
  };

  const cancelDelete = () => {
    setDeleteConfirmOpen(false);
    setThemeToDelete(null);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedTheme(null);
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        p: 3,
        maxWidth: "1400px",
        margin: "0 auto",
        backgroundColor: unifiedTheme.palette.background.paper,
      }}
    >
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: 3 }}
      >
        <Box>
          <Typography
            variant="h4"
            component="h1"
            gutterBottom
            sx={{ ...getHeadingSx(), fontWeight: 600 }}
          >
            Dashboard Theme Library
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Create and manage custom themes for your dashboard. Customize
            colors, typography, and component styles.
          </Typography>
        </Box>
        <PrimaryButton
          startIcon={<AddIcon />}
          onClick={() => setIsDialogOpen(true)}
          sx={{ width: 200 }}
        >
          Create Theme
        </PrimaryButton>
      </Stack>

      {dashboardTheme && (
        <Box
          sx={{
            mb: 3,
            p: 2,
            bgcolor: "background.paper",
            borderRadius: 2,
            border: "1px solid",
            borderColor: "divider",
          }}
        >
          <Stack direction="row" alignItems="center" spacing={2}>
            <ApplyIcon color="success" />
            <Typography variant="body1" fontWeight={500}>
              Currently Applied: <strong>{dashboardTheme.name}</strong>
            </Typography>
          </Stack>
        </Box>
      )}

      <Grid container spacing={3}>
        {themes.map((theme) => (
          <Grid item xs={12} sm={6} md={4} key={theme._id}>
            <DashboardThemePreview
              theme={theme}
              onUpdate={handleUpdateTheme}
              onDelete={handleDeleteTheme}
              onDuplicate={handleDuplicateTheme}
              onApply={handleApplyTheme}
              isCurrentTheme={dashboardTheme?._id === theme._id}
            />
          </Grid>
        ))}
      </Grid>

      {themes.length === 0 && !loading && (
        <Box sx={{ textAlign: "center", py: 8 }}>
          <PaletteIcon sx={{ fontSize: 64, color: "text.secondary", mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No themes created yet
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Create your first dashboard theme to get started
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setIsDialogOpen(true)}
            sx={{ ...getButtonSx() }}
          >
            Create Your First Theme
          </Button>
        </Box>
      )}

      <CreateDashboardThemeDialog
        open={isDialogOpen}
        onClose={handleCloseDialog}
        theme={selectedTheme}
      />

      <DialogContainer
        open={deleteConfirmOpen}
        onClose={cancelDelete}
        title="Delete Theme"
        actions={
          <>
            <PrimaryButton onClick={cancelDelete} variant="outlined">
              Cancel
            </PrimaryButton>
            <PrimaryButton
              onClick={confirmDelete}
              variant="contained"
              color="error"
              disabled={loading}
            >
              {loading ? "Deleting..." : "Delete"}
            </PrimaryButton>
          </>
        }
      >
        <Typography>
          Are you sure you want to delete this theme? This action cannot be
          undone.
        </Typography>
      </DialogContainer>
    </Box>
  );
};

export default DashboardThemePage;
