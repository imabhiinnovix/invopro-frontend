import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Grid,
  CircularProgress,
  Alert,
  Button,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material";
import { useAppDispatch, useAppSelector } from "../../storeHooks";
import { fetchThemeList } from "./themeActions";
import ThemePreview from "./components/ThemePreview";
import CreateThemeDialog from "./components/CreateThemeDialog";
import { Theme } from "./types";
import usePost from "../../hooks/usePost";
import { POST } from "../../services/apiRoutes";
import { useUnifiedTheme } from '../../hooks/useUnifiedTheme';

const CreateTheme = () => {
  const theme = useUnifiedTheme();
  const dispatch = useAppDispatch();
  const { themes, loading, error } = useAppSelector((state) => state.theme);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState<Theme | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [themeToDelete, setThemeToDelete] = useState<string | null>(null);

  const deleteThemeMutation = usePost(
    ["themes"],
    () => {
      dispatch(fetchThemeList());
    },
    true
  );

  const duplicateThemeMutation = usePost(
    ["themes"],
    () => {
      dispatch(fetchThemeList());
    },
    true
  );

  useEffect(() => {
    dispatch(fetchThemeList());
  }, [dispatch]);

  const handleUpdateTheme = (theme: Theme) => {
    setSelectedTheme(theme);
    setIsDialogOpen(true);
  };

  const handleDeleteTheme = (themeId: string) => {
    setThemeToDelete(themeId);
    setDeleteConfirmOpen(true);
  };

  const handleDuplicateTheme = (themeId: string) => {
    duplicateThemeMutation.mutate({
      url: `${POST.DUPLICATE_THEME}${themeId}`,
      payload: {},
    });
  };

  const confirmDelete = () => {
    if (themeToDelete) {
      deleteThemeMutation.mutate({
        url: `${POST.DELETE_THEME}${themeToDelete}`,
        payload: {},
      });
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

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, backgroundColor: theme.palette.background.paper }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="h4" component="h1" gutterBottom>
          Theme Library
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => setIsDialogOpen(true)}
        >
          + Create
        </Button>
      </Stack>
      <Typography variant="body1" sx={{ mb: 4 }}>
        Browse and preview available chart themes
      </Typography>
      <Grid container spacing={3}>
        {themes?.map((theme) => (
          <Grid item xs={12} sm={6} md={4} key={theme._id}>
            <ThemePreview
              theme={theme}
              onUpdate={handleUpdateTheme}
              onDelete={handleDeleteTheme}
              onDuplicate={handleDuplicateTheme}
            />
          </Grid>
        ))}
      </Grid>
      <CreateThemeDialog
        open={isDialogOpen}
        onClose={handleCloseDialog}
        theme={selectedTheme}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={cancelDelete}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title">Delete Theme</DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            Are you sure you want to delete this theme? This action cannot be
            undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={cancelDelete} color="primary">
            Cancel
          </Button>
          <Button
            onClick={confirmDelete}
            color="error"
            variant="contained"
            disabled={deleteThemeMutation.isPending}
          >
            {deleteThemeMutation.isPending ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CreateTheme;
