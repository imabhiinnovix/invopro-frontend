import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Grid,
  CircularProgress,
  Alert,
  Button,
  Stack,
} from "@mui/material";
import { useAppDispatch, useAppSelector } from "../../storeHooks";
import { fetchThemeList } from "./themeActions";
import ThemePreview from "./components/ThemePreview";
import CreateThemeDialog from "./components/CreateThemeDialog";

const CreateTheme = () => {
  const dispatch = useAppDispatch();
  const { themes, loading, error } = useAppSelector((state) => state.theme);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchThemeList());
  }, [dispatch]);

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
    <Box sx={{ p: 3 }}>
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
        {themes.map((theme) => (
          <Grid item xs={12} sm={6} md={4} key={theme._id}>
            <ThemePreview theme={theme} />
          </Grid>
        ))}
      </Grid>
      <CreateThemeDialog
        open={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
      />
    </Box>
  );
};

export default CreateTheme;
