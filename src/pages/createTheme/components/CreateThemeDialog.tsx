import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Divider,
  IconButton,
  Portal,
  styled,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import { SketchPicker, ColorResult } from "react-color";
import { Close as CloseIcon } from "@mui/icons-material";
import {
  CreateThemeDialogProps,
  createThemeResponse,
  ThemeData,
} from "../types";
import usePost from "../../../hooks/usePost";
import { POST } from "../../../services/apiRoutes";
import { useAppDispatch } from "../../../storeHooks";
import { fetchThemeList } from "../themeActions";
import { STYLE_GUIDE } from "../../../styles";
import { useDashboardTheme } from "../../../context/DashboardThemeProvider";


const alignOptions = ["start", "center", "end"];
const positionOptions = ["top", "bottom", "left", "right"];

// const interactionModes = ["nearest", "index", "dataset", "point", "x", "y"];

// const fillTypes = ["Smooth", "Solid", "Gradient"];

// const chartTypes = ["line", "bar", "pie", "doughnut", "radar", "scatter"];

// Add font weight options constant at the top with other constants
const fontWeightOptions = [
  "normal",
  "bold",
  "lighter",
  "bolder",
  "100",
  "200",
  "300",
  "400",
  "500",
  "600",
  "700",
  "800",
  "900",
];

const StyledButton = styled(Button)(({ theme }) => ({
  borderRadius: "8px",
  textTransform: "none",
  padding: theme.spacing(1, 2),
  "&.MuiButton-contained": {
    boxShadow: "none",
    "&:hover": {
      boxShadow: "none",
    },
  },
}));

const numberInputStyles = {
  inputProps: {
    style: {
      MozAppearance: "textfield" as const,
      WebkitAppearance: "none" as const,
      margin: 0,
    },
    onKeyDown: (e: React.KeyboardEvent) => {
      if (e.key === "ArrowUp" || e.key === "ArrowDown") {
        e.preventDefault();
      }
    },
  },
  sx: {
    "& input[type=number]": {
      MozAppearance: "textfield" as const,
    },
    "& input[type=number]::-webkit-outer-spin-button": {
      WebkitAppearance: "none" as const,
      margin: 0,
    },
    "& input[type=number]::-webkit-inner-spin-button": {
      WebkitAppearance: "none" as const,
      margin: 0,
    },
  },
};

const CreateThemeDialog = ({
  open,
  onClose,
  theme,
}: CreateThemeDialogProps) => {
  const dispatch = useAppDispatch();
  const { currentTheme } = useDashboardTheme();
  const [themeState, setThemeState] = useState<ThemeData>({
    name: "",
    title: {
      display: true,
      color: "#000000",
      font: {
        size: 16,
        family: "Arial",
        weight: "400",
      },
      align: "center",
      position: "top",
    },
    subtitle: {
      display: true,
      color: "#000000",
      font: {
        size: 14,
        family: "Arial",
        weight: "400",
      },
      align: "center",
      position: "top",
    },
    legend: {
      display: true,
      position: "top",
      labels: {
        color: "#34495e",
        font: {
          size: 12,
          family: "Arial",
        },
        padding: 20,
        boxWidth: 15,
        boxHeight: 15,
      },
    },
    tooltip: {
      display: true,
      backgroundColor: "#2c3e50",
      titleColor: "#ecf0f1",
      borderColor: "#95a5a6",
      borderWidth: 2,
      padding: 10,
    },
    scales: {
      y: {
        display: true,
        beginAtZero: true,
        grid: {
          color: "#ecf0f1",
          drawBorder: false,
        },
        title: {
          display: true,
          text: "Values",
          color: "#2c3e50",
          font: {
            size: 14,
          },
        },
      },
      x: {
        display: true,
        grid: {
          display: false,
        },
        ticks: {
          color: "#7f8c8d",
          padding: 10,
        },
      },
    },
    interaction: {
      mode: "nearest",
      intersect: true,
    },
    layout: {
      padding: {
        top: 10,
        bottom: 20,
      },
    },
    fill: {
      enabled: true,
      type: "Smooth",
      color: "#3498db",
      opacity: 0.4,
    },
    responsive: false,
    maintainAspectRatio: true,
    chartType: "line",
    colors: ["#3498db", "#e74c3c", "#2ecc71"],
    borderColor: ["#2980b9", "#c0392b", "#27ae60"],
    backgroundColor: ["#3498db55", "#e74c3c55", "#2ecc7155"],
    showLegendOverlay: false,
  });
  const [showColorPicker, setShowColorPicker] = useState(false);
  // const [showSubtitleColorPicker, setShowSubtitleColorPicker] = useState(false);
  const [showLegendColorPicker, setShowLegendColorPicker] = useState(false);
  const [showTooltipBgPicker, setShowTooltipBgPicker] = useState(false);
  const [showTooltipTitlePicker, setShowTooltipTitlePicker] = useState(false);
  const [showTooltipBorderPicker, setShowTooltipBorderPicker] = useState(false);
  const [showYScaleGridColorPicker, setShowYScaleGridColorPicker] =
    useState(false);
  const [showYScaleTitleColorPicker, setShowYScaleTitleColorPicker] =
    useState(false);
  const [showXScaleTicksColorPicker, setShowXScaleTicksColorPicker] =
    useState(false);
  // const [showFillColorPicker, setShowFillColorPicker] = useState(false);
  const [showColorsPicker, setShowColorsPicker] = useState<number | null>(null);
  const [showBorderColorPicker, setShowBorderColorPicker] = useState<
    number | null
  >(null);
  const [showBackgroundColorPicker, setShowBackgroundColorPicker] = useState<
    number | null
  >(null);

  const [buttonRefs] = useState(() => new Map());

  // Initialize from existing theme if provided for update
  useEffect(() => {
    if (theme) {
      setThemeState({
        name: theme.name,
        title: {
          display: theme.title.display,
          color: theme.title.color,
          font: {
            size: theme.title.font.size,
            family: theme.title.font.family || "Arial", // Keep family but use default if missing
            weight: theme.title.font.weight || "400",
          },
          align: theme.title.align,
          position: theme.title.position,
        },
        subtitle: {
          display: theme.subtitle.display,
          color: theme.subtitle.color,
          font: {
            size: theme.subtitle.font.size,
            family: theme.subtitle.font.family || "Arial", // Keep family but use default if missing
            weight: theme.subtitle.font.weight || "400",
          },
          align: theme.subtitle.align,
          position: theme.subtitle.position,
        },
        legend: {
          ...theme.legend,
          labels: {
            ...theme.legend.labels,
            font: {
              size: theme.legend.labels.font.size,
              family: theme.legend.labels.font.family || "Arial", // Keep family but use default if missing
            },
          },
        },
        tooltip: theme.tooltip || themeState.tooltip,
        scales: {
          y: {
            display: theme.scales.y.display,
            beginAtZero: theme.scales.y.beginAtZero,
            grid: {
              color: theme.scales.y.grid.color,
              drawBorder: theme.scales.y.grid.drawBorder || false,
            },
            title: {
              display: theme.scales.y.title.display,
              text: "Values", // Add required text property
              color: theme.scales.y.title.color,
              font: {
                size: theme.scales.y.title.font.size,
              },
            },
          },
          x: {
            display: theme.scales.x.display,
            grid: {
              display: theme.scales.x.grid.display,
            },
            ticks: {
              color: theme.scales.x.ticks.color,
              padding: theme.scales.x.ticks.padding,
            },
          },
        },
        interaction: {
          mode: theme.interaction.mode,
          intersect: theme.interaction.intersect,
        },
        layout: {
          padding: {
            top: theme.layout.padding.top,
            bottom: theme.layout.padding.bottom,
          },
        },
        fill: theme.fill || themeState.fill,
        responsive: theme.responsive ?? themeState.responsive,
        maintainAspectRatio:
          theme.maintainAspectRatio ?? themeState.maintainAspectRatio,
        chartType: theme.chartType || themeState.chartType,
        colors: theme.colors || themeState.colors,
        borderColor: theme.borderColor || themeState.borderColor,
        backgroundColor: theme.backgroundColor || themeState.backgroundColor,
        showLegendOverlay: theme.showLegendOverlay || themeState.showLegendOverlay,
      });
    } else if (open) {
      // Reset form when opening for a new theme
      setThemeState({
        name: "",
        title: {
          display: true,
          color: "#000000",
          font: {
            size: 16,
            family: "Arial",
            weight: "400",
          },
          align: "center",
          position: "top",
        },
        subtitle: {
          display: true,
          color: "#000000",
          font: {
            size: 14,
            family: "Arial",
            weight: "400",
          },
          align: "center",
          position: "top",
        },
        legend: {
          display: true,
          position: "top",
          labels: {
            color: "#34495e",
            font: {
              size: 12,
              family: "Arial",
            },
            padding: 20,
            boxWidth: 15,
            boxHeight: 15,
          },
        },
        tooltip: {
          display: true,
          backgroundColor: "#2c3e50",
          titleColor: "#ecf0f1",
          borderColor: "#95a5a6",
          borderWidth: 2,
          padding: 10,
        },
        scales: {
          y: {
            display: true,
            beginAtZero: true,
            grid: {
              color: "#ecf0f1",
              drawBorder: false,
            },
            title: {
              display: true,
              text: "Values",
              color: "#2c3e50",
              font: {
                size: 14,
              },
            },
          },
          x: {
            display: true,
            grid: {
              display: false,
            },
            ticks: {
              color: "#7f8c8d",
              padding: 10,
            },
          },
        },
        interaction: {
          mode: "nearest",
          intersect: true,
        },
        layout: {
          padding: {
            top: 10,
            bottom: 20,
          },
        },
        fill: {
          enabled: true,
          type: "Smooth",
          color: "#3498db",
          opacity: 0.4,
        },
        responsive: false,
        maintainAspectRatio: true,
        chartType: "line",
        colors: ["#3498db", "#e74c3c", "#2ecc71"],
        borderColor: ["#2980b9", "#c0392b", "#27ae60"],
        backgroundColor: ["#3498db55", "#e74c3c55", "#2ecc7155"],
        showLegendOverlay: false,
      });
    }
  }, [theme, open]);

  const createTheme = usePost<ThemeData, createThemeResponse>([""], (data) => {
    if (data?.success) {
      dispatch(fetchThemeList());
      onClose();
    }
  });

  const updateTheme = usePost<ThemeData, createThemeResponse>([""], (data) => {
    if (data?.success) {
      dispatch(fetchThemeList());
      onClose();
    }
  });

  const handleSubmit = () => {
    if (theme) {
      updateTheme.mutate({
        url: `${POST.UPDATE_THEME}${theme._id}`,
        payload: themeState,
      });
    } else {
      createTheme.mutate({
        url: POST.CREATE_THEME,
        payload: themeState,
      });
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {theme ? "Update Theme" : "Create New Theme"}
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: "absolute",
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ pt: 1 }}>
        <Box>
          <TextField
            autoFocus
            margin="dense"
            size="small"
            label="Theme Name"
            type="text"
            fullWidth
            value={themeState.name}
            onChange={(e) =>
              setThemeState({ ...themeState, name: e.target.value })
            }

          />
          <Divider sx={{ my: 2 }} textAlign="left">
            <Typography variant="body2" sx={{ color: "rgba(0, 0, 0, 0.6)" }}>
              Title Theme Setup
            </Typography>
          </Divider>
          <Grid container spacing={1} component="div">
            <Grid size={{ xs: 12, sm: 6 }} component="div">
              <FormControl fullWidth size="small" margin="dense">
                <InputLabel>Display Title</InputLabel>
                <Select
                  value={themeState.title.display}
                  label="Display Title"
                  onChange={(e) =>
                    setThemeState({
                      ...themeState,
                      title: {
                        ...themeState.title,
                        display: e.target.value === "true",
                      },
                    })
                  }
                >
                  <MenuItem value="true">True</MenuItem>
                  <MenuItem value="false">False</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }} component="div">
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  mt: 1,
                  position: "relative",
                }}
              >
                <Typography
                  variant="body2"
                  sx={{ color: "rgba(0, 0, 0, 0.6)" }}
                >
                  Title Color
                </Typography>
                <Box
                  ref={(el) => {
                    if (el) buttonRefs.set("title-color", el);
                  }}
                  sx={{ flex: 1 }}
                >
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => setShowColorPicker(!showColorPicker)}
                    sx={{
                      backgroundColor: themeState.title.color,
                      color:
                        themeState.title.color === "#000000"
                          ? "white"
                          : "rgba(0, 0, 0, 0.6)",
                      width: "100%",
                      minHeight: "36px",
                      borderColor: "rgba(0, 0, 0, 0.12)",
                      "&:hover": {
                        backgroundColor: themeState.title.color,
                        borderColor: "rgba(0, 0, 0, 0.12)",
                      },
                    }}
                  ></Button>
                  {showColorPicker && (
                    <Portal>
                      <Box
                        sx={{
                          position: "fixed",
                          top: 0,
                          right: 0,
                          bottom: 0,
                          left: 0,
                          zIndex: 9998,
                          bgcolor: "rgba(0, 0, 0, 0.1)",
                        }}
                        onClick={() => setShowColorPicker(false)}
                      />
                      <Box
                        sx={{
                          position: "absolute",
                          zIndex: 9999,
                          ...(() => {
                            const buttonEl = buttonRefs.get("title-color");
                            if (!buttonEl) return {};
                            const rect = buttonEl.getBoundingClientRect();
                            const pickerHeight = 300;
                            const viewportHeight = window.innerHeight;

                            const wouldOverflowBottom =
                              rect.bottom + pickerHeight + 5 > viewportHeight;

                            if (wouldOverflowBottom) {
                              return {
                                bottom:
                                  window.innerHeight -
                                  rect.top +
                                  window.scrollY +
                                  5,
                                left: rect.left + window.scrollX,
                              };
                            } else {
                              return {
                                top: rect.bottom + window.scrollY + 5,
                                left: rect.left + window.scrollX,
                              };
                            }
                          })(),
                        }}
                      >
                        <SketchPicker
                          color={themeState.title.color}
                          onChange={(color: ColorResult) =>
                            setThemeState({
                              ...themeState,
                              title: { ...themeState.title, color: color.hex },
                            })
                          }
                        />
                      </Box>
                    </Portal>
                  )}
                </Box>
              </Box>
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }} component="div">
              <TextField
                fullWidth
                size="small"
                margin="dense"
                label="Font Size"
                type="number"
                value={themeState.title.font.size}
                onChange={(e) =>
                  setThemeState({
                    ...themeState,
                    title: {
                      ...themeState.title,
                      font: {
                        ...themeState.title.font,
                        size: Number(e.target.value),
                      },
                    },
                  })
                }
                {...numberInputStyles}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: STYLE_GUIDE.SPACING.s2,
                    alignItems: 'flex-start',
                    paddingRight: STYLE_GUIDE.SPACING.s2,
                    fontSize: '14px',
                    backgroundColor: currentTheme?.colors?.background?.paper || '#ffffff',
                    '& fieldset': {
                      borderColor: currentTheme?.colors?.inputBorder || STYLE_GUIDE.COLORS.darkBackground,
                    },
                    '&:hover fieldset': {
                      borderColor: currentTheme?.colors?.borderHover || STYLE_GUIDE.COLORS.darkBorderHover,
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: currentTheme?.components?.input?.focusBorderColor || STYLE_GUIDE.COLORS.darkBorderFocus,
                    },
                  },
                  '& .MuiInputLabel-root': {
                    color: currentTheme?.colors?.text?.secondary || STYLE_GUIDE.COLORS.darkBorderFocus,
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: currentTheme?.components?.input?.focusBorderColor || STYLE_GUIDE.COLORS.darkDarker,
                  },
                  '& .MuiInputBase-input': {
                    color: `${currentTheme?.colors?.inputText} !important`,
                  },
                  '& .MuiInputBase-input::placeholder': {
                    color: `${currentTheme?.colors?.text?.secondary || '#666'} !important`,
                  },
                  '& .MuiInputBase-input:-webkit-autofill': {
                    WebkitTextFillColor: `${currentTheme?.colors?.inputText } !important`,
                    WebkitBoxShadow: `0 0 0 1000px ${currentTheme?.colors?.background?.paper || '#ffffff'} inset !important`,
                  },
                }}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }} component="div">
              <FormControl fullWidth size="small" margin="dense">
                <InputLabel>Font Weight</InputLabel>
                <Select
                  value={themeState.title.font.weight}
                  label="Font Weight"
                  onChange={(e) =>
                    setThemeState({
                      ...themeState,
                      title: {
                        ...themeState.title,
                        font: {
                          ...themeState.title.font,
                          weight: e.target.value,
                        },
                      },
                    })
                  }
                >
                  {fontWeightOptions.map((weight) => (
                    <MenuItem key={weight} value={weight}>
                      {weight}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }} component="div">
              <FormControl fullWidth size="small" margin="dense">
                <InputLabel>Alignment</InputLabel>
                <Select
                  value={themeState.title.align}
                  label="Alignment"
                  onChange={(e) =>
                    setThemeState({
                      ...themeState,
                      title: { ...themeState.title, align: e.target.value },
                    })
                  }
                >
                  {alignOptions.map((align) => (
                    <MenuItem key={align} value={align}>
                      {align}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }} component="div">
              <FormControl fullWidth size="small" margin="dense">
                <InputLabel>Position</InputLabel>
                <Select
                  value={themeState.title.position}
                  label="Position"
                  onChange={(e) =>
                    setThemeState({
                      ...themeState,
                      title: { ...themeState.title, position: e.target.value },
                    })
                  }
                >
                  {positionOptions.map((position) => (
                    <MenuItem key={position} value={position}>
                      {position}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
          {/* <Grid container spacing={1} component="div">
            <Grid size={{ xs: 12 }} component="div">
              <Divider sx={{ my: 2 }} textAlign="left">
                <Typography
                  variant="body2"
                  sx={{ color: "rgba(0, 0, 0, 0.6)" }}
                >
                  Subtitle Theme Setup
                </Typography>
              </Divider>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }} component="div">
              <FormControl fullWidth size="small" margin="dense">
                <InputLabel>Display Subtitle</InputLabel>
                <Select
                  value={themeState.subtitle.display}
                  label="Display Subtitle"
                  onChange={(e) =>
                    setThemeState({
                      ...themeState,
                      subtitle: {
                        ...themeState.subtitle,
                        display: e.target.value === "true",
                      },
                    })
                  }
                >
                  <MenuItem value="true">True</MenuItem>
                  <MenuItem value="false">False</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }} component="div">
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  mt: 1,
                  position: "relative",
                }}
              >
                <Typography
                  variant="body2"
                  sx={{ color: "rgba(0, 0, 0, 0.6)" }}
                >
                  Subtitle Color
                </Typography>
                <Box
                  ref={(el) => {
                    if (el) buttonRefs.set("subtitle-color", el);
                  }}
                  sx={{ flex: 1 }}
                >
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() =>
                      setShowSubtitleColorPicker(!showSubtitleColorPicker)
                    }
                    sx={{
                      backgroundColor: themeState.subtitle.color,
                      color:
                        themeState.subtitle.color === "#000000"
                          ? "white"
                          : "rgba(0, 0, 0, 0.6)",
                      width: "100%",
                      minHeight: "36px",
                      borderColor: "rgba(0, 0, 0, 0.12)",
                      "&:hover": {
                        backgroundColor: themeState.subtitle.color,
                        borderColor: "rgba(0, 0, 0, 0.12)",
                      },
                    }}
                  ></Button>
                  {showSubtitleColorPicker && (
                    <Portal>
                      <Box
                        sx={{
                          position: "fixed",
                          top: 0,
                          right: 0,
                          bottom: 0,
                          left: 0,
                          zIndex: 9998,
                          bgcolor: "rgba(0, 0, 0, 0.1)",
                        }}
                        onClick={() => setShowSubtitleColorPicker(false)}
                      />
                      <Box
                        sx={{
                          position: "absolute",
                          zIndex: 9999,
                          ...(() => {
                            const buttonEl = buttonRefs.get("subtitle-color");
                            if (!buttonEl) return {};
                            const rect = buttonEl.getBoundingClientRect();
                            const pickerHeight = 300;
                            const viewportHeight = window.innerHeight;

                            const wouldOverflowBottom =
                              rect.bottom + pickerHeight + 5 > viewportHeight;

                            if (wouldOverflowBottom) {
                              return {
                                bottom:
                                  window.innerHeight -
                                  rect.top +
                                  window.scrollY +
                                  5,
                                left: rect.left + window.scrollX,
                              };
                            } else {
                              return {
                                top: rect.bottom + window.scrollY + 5,
                                left: rect.left + window.scrollX,
                              };
                            }
                          })(),
                        }}
                      >
                        <SketchPicker
                          color={themeState.subtitle.color}
                          onChange={(color: ColorResult) =>
                            setThemeState({
                              ...themeState,
                              subtitle: {
                                ...themeState.subtitle,
                                color: color.hex,
                              },
                            })
                          }
                        />
                      </Box>
                    </Portal>
                  )}
                </Box>
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }} component="div">
              <TextField
                fullWidth
                size="small"
                margin="dense"
                label="Font Size"
                type="number"
                value={themeState.subtitle.font.size}
                onChange={(e) =>
                  setThemeState({
                    ...themeState,
                    subtitle: {
                      ...themeState.subtitle,
                      font: {
                        ...themeState.subtitle.font,
                        size: Number(e.target.value),
                      },
                    },
                  })
                }
                {...numberInputStyles}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: inputBorderColor,
                    },
                    '&:hover fieldset': {
                      borderColor: inputFocusBorderColor,
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: inputFocusBorderColor,
                    },
                    '& input': {
                      color: inputTextColor,
                    },
                    '& label': {
                      color: inputTextColor,
                    },
                  },
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }} component="div">
              <FormControl fullWidth size="small" margin="dense">
                <InputLabel>Font Weight</InputLabel>
                <Select
                  value={themeState.subtitle.font.weight}
                  label="Font Weight"
                  onChange={(e) =>
                    setThemeState({
                      ...themeState,
                      subtitle: {
                        ...themeState.subtitle,
                        font: {
                          ...themeState.subtitle.font,
                          weight: e.target.value,
                        },
                      },
                    })
                  }
                >
                  {fontWeightOptions.map((weight) => (
                    <MenuItem key={weight} value={weight}>
                      {weight}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }} component="div">
              <FormControl fullWidth size="small" margin="dense">
                <InputLabel>Alignment</InputLabel>
                <Select
                  value={themeState.subtitle.align}
                  label="Alignment"
                  onChange={(e) =>
                    setThemeState({
                      ...themeState,
                      subtitle: {
                        ...themeState.subtitle,
                        align: e.target.value,
                      },
                    })
                  }
                >
                  {alignOptions.map((align) => (
                    <MenuItem key={align} value={align}>
                      {align}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }} component="div">
              <FormControl fullWidth size="small" margin="dense">
                <InputLabel>Position</InputLabel>
                <Select
                  value={themeState.subtitle.position}
                  label="Position"
                  onChange={(e) =>
                    setThemeState({
                      ...themeState,
                      subtitle: {
                        ...themeState.subtitle,
                        position: e.target.value,
                      },
                    })
                  }
                >
                  {positionOptions.map((position) => (
                    <MenuItem key={position} value={position}>
                      {position}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid> */}
          <Grid container spacing={1} component="div">
            <Grid size={{ xs: 12 }} component="div">
              <Divider sx={{ my: 2 }} textAlign="left">
                <Typography
                  variant="body2"
                  sx={{ color: "rgba(0, 0, 0, 0.6)" }}
                >
                  Legend Theme Setup
                </Typography>
              </Divider>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }} component="div">
              <FormControl fullWidth size="small" margin="dense">
                <InputLabel>Display Legend</InputLabel>
                <Select
                  value={themeState.legend.display}
                  label="Display Legend"
                  onChange={(e) =>
                    setThemeState({
                      ...themeState,
                      legend: {
                        ...themeState.legend,
                        display: e.target.value === "true",
                      },
                    })
                  }
                >
                  <MenuItem value="true">True</MenuItem>
                  <MenuItem value="false">False</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }} component="div">
              <FormControl fullWidth size="small" margin="dense">
                <InputLabel>Position</InputLabel>
                <Select
                  value={themeState.legend.position}
                  label="Position"
                  onChange={(e) =>
                    setThemeState({
                      ...themeState,
                      legend: {
                        ...themeState.legend,
                        position: e.target.value,
                      },
                    })
                  }
                >
                  {positionOptions.map((position) => (
                    <MenuItem key={position} value={position}>
                      {position}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }} component="div">
              <TextField
                fullWidth
                size="small"
                margin="dense"
                label="Padding"
                type="number"
                value={themeState.legend.labels.padding}
                onChange={(e) =>
                  setThemeState({
                    ...themeState,
                    legend: {
                      ...themeState.legend,
                      labels: {
                        ...themeState.legend.labels,
                        padding: Number(e.target.value),
                      },
                    },
                  })
                }
                {...numberInputStyles}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }} component="div">
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  mt: 1,
                  position: "relative",
                }}
              >
                <Typography
                  variant="body2"
                  sx={{ color: "rgba(0, 0, 0, 0.6)" }}
                >
                  Legend Color
                </Typography>
                <Box
                  ref={(el) => {
                    if (el) buttonRefs.set("legend-color", el);
                  }}
                  sx={{ flex: 1 }}
                >
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() =>
                      setShowLegendColorPicker(!showLegendColorPicker)
                    }
                    sx={{
                      backgroundColor: themeState.legend.labels.color,
                      color:
                        themeState.legend.labels.color === "#000000"
                          ? "white"
                          : "rgba(0, 0, 0, 0.6)",
                      width: "100%",
                      minHeight: "36px",
                      borderColor: "rgba(0, 0, 0, 0.12)",
                      "&:hover": {
                        backgroundColor: themeState.legend.labels.color,
                        borderColor: "rgba(0, 0, 0, 0.12)",
                      },
                    }}
                  ></Button>
                  {showLegendColorPicker && (
                    <Portal>
                      <Box
                        sx={{
                          position: "fixed",
                          top: 0,
                          right: 0,
                          bottom: 0,
                          left: 0,
                          zIndex: 9998,
                          bgcolor: "rgba(0, 0, 0, 0.1)",
                        }}
                        onClick={() => setShowLegendColorPicker(false)}
                      />
                      <Box
                        sx={{
                          position: "absolute",
                          zIndex: 9999,
                          ...(() => {
                            const buttonEl = buttonRefs.get("legend-color");
                            if (!buttonEl) return {};
                            const rect = buttonEl.getBoundingClientRect();
                            const pickerHeight = 300;
                            const viewportHeight = window.innerHeight;

                            const wouldOverflowBottom =
                              rect.bottom + pickerHeight + 5 > viewportHeight;

                            if (wouldOverflowBottom) {
                              return {
                                bottom:
                                  window.innerHeight -
                                  rect.top +
                                  window.scrollY +
                                  5,
                                left: rect.left + window.scrollX,
                              };
                            } else {
                              return {
                                top: rect.bottom + window.scrollY + 5,
                                left: rect.left + window.scrollX,
                              };
                            }
                          })(),
                        }}
                      >
                        <SketchPicker
                          color={themeState.legend.labels.color}
                          onChange={(color: ColorResult) =>
                            setThemeState({
                              ...themeState,
                              legend: {
                                ...themeState.legend,
                                labels: {
                                  ...themeState.legend.labels,
                                  color: color.hex,
                                },
                              },
                            })
                          }
                        />
                      </Box>
                    </Portal>
                  )}
                </Box>
              </Box>
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }} component="div">
              <TextField
                fullWidth
                size="small"
                margin="dense"
                label="Font Size"
                type="number"
                value={themeState.legend.labels.font.size}
                onChange={(e) =>
                  setThemeState({
                    ...themeState,
                    legend: {
                      ...themeState.legend,
                      labels: {
                        ...themeState.legend.labels,
                        font: {
                          ...themeState.legend.labels.font,
                          size: Number(e.target.value),
                        },
                      },
                    },
                  })
                }
                {...numberInputStyles}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }} component="div">
              <TextField
                fullWidth
                size="small"
                margin="dense"
                label="Box Width"
                type="number"
                value={themeState.legend.labels.boxWidth}
                onChange={(e) =>
                  setThemeState({
                    ...themeState,
                    legend: {
                      ...themeState.legend,
                      labels: {
                        ...themeState.legend.labels,
                        boxWidth: Number(e.target.value),
                      },
                    },
                  })
                }
                {...numberInputStyles}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }} component="div">
              <TextField
                fullWidth
                size="small"
                margin="dense"
                label="Box Height"
                type="number"
                value={themeState.legend.labels.boxHeight}
                onChange={(e) =>
                  setThemeState({
                    ...themeState,
                    legend: {
                      ...themeState.legend,
                      labels: {
                        ...themeState.legend.labels,
                        boxHeight: Number(e.target.value),
                      },
                    },
                  })
                }
                {...numberInputStyles}
              />
            </Grid>
          </Grid>
          <Grid container spacing={1} component="div">
            <Grid size={{ xs: 12 }} component="div">
              <Divider sx={{ my: 2 }} textAlign="left">
                <Typography
                  variant="body2"
                  sx={{ color: "rgba(0, 0, 0, 0.6)" }}
                >
                  Tooltip Theme Setup
                </Typography>
              </Divider>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }} component="div">
              <FormControl fullWidth size="small" margin="dense">
                <InputLabel>Display Tooltip</InputLabel>
                <Select
                  value={themeState.tooltip.display}
                  label="Display Tooltip"
                  onChange={(e) =>
                    setThemeState({
                      ...themeState,
                      tooltip: {
                        ...themeState.tooltip,
                        display: e.target.value === "true",
                      },
                    })
                  }
                >
                  <MenuItem value="true">True</MenuItem>
                  <MenuItem value="false">False</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }} component="div">
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  mt: 1,
                  position: "relative",
                }}
              >
                <Typography
                  variant="body2"
                  sx={{ color: "rgba(0, 0, 0, 0.6)" }}
                >
                  Background Color
                </Typography>
                <Box
                  ref={(el) => {
                    if (el) buttonRefs.set("tooltip-bg", el);
                  }}
                  sx={{ flex: 1 }}
                >
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => setShowTooltipBgPicker(!showTooltipBgPicker)}
                    sx={{
                      backgroundColor: themeState.tooltip.backgroundColor,
                      color:
                        themeState.tooltip.backgroundColor === "#000000"
                          ? "white"
                          : "rgba(0, 0, 0, 0.6)",
                      width: "100%",
                      minHeight: "36px",
                      borderColor: "rgba(0, 0, 0, 0.12)",
                      "&:hover": {
                        backgroundColor: themeState.tooltip.backgroundColor,
                        borderColor: "rgba(0, 0, 0, 0.12)",
                      },
                    }}
                  ></Button>
                  {showTooltipBgPicker && (
                    <Portal>
                      <Box
                        sx={{
                          position: "fixed",
                          top: 0,
                          right: 0,
                          bottom: 0,
                          left: 0,
                          zIndex: 9998,
                          bgcolor: "rgba(0, 0, 0, 0.1)",
                        }}
                        onClick={() => setShowTooltipBgPicker(false)}
                      />
                      <Box
                        sx={{
                          position: "absolute",
                          zIndex: 9999,
                          ...(() => {
                            const buttonEl = buttonRefs.get("tooltip-bg");
                            if (!buttonEl) return {};
                            const rect = buttonEl.getBoundingClientRect();
                            const pickerHeight = 300;
                            const viewportHeight = window.innerHeight;

                            const wouldOverflowBottom =
                              rect.bottom + pickerHeight + 5 > viewportHeight;

                            if (wouldOverflowBottom) {
                              return {
                                bottom:
                                  window.innerHeight -
                                  rect.top +
                                  window.scrollY +
                                  5,
                                left: rect.left + window.scrollX,
                              };
                            } else {
                              return {
                                top: rect.bottom + window.scrollY + 5,
                                left: rect.left + window.scrollX,
                              };
                            }
                          })(),
                        }}
                      >
                        <SketchPicker
                          color={themeState.tooltip.backgroundColor}
                          onChange={(color: ColorResult) =>
                            setThemeState({
                              ...themeState,
                              tooltip: {
                                ...themeState.tooltip,
                                backgroundColor: color.hex,
                              },
                            })
                          }
                        />
                      </Box>
                    </Portal>
                  )}
                </Box>
              </Box>
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }} component="div">
              <TextField
                fullWidth
                size="small"
                margin="dense"
                label="Border Width"
                type="number"
                value={themeState.tooltip.borderWidth}
                onChange={(e) =>
                  setThemeState({
                    ...themeState,
                    tooltip: {
                      ...themeState.tooltip,
                      borderWidth: Number(e.target.value),
                    },
                  })
                }
                {...numberInputStyles}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }} component="div">
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  mt: 1,
                  position: "relative",
                }}
              >
                <Typography
                  variant="body2"
                  sx={{ color: "rgba(0, 0, 0, 0.6)" }}
                >
                  Title Color
                </Typography>
                <Box
                  ref={(el) => {
                    if (el) buttonRefs.set("tooltip-title", el);
                  }}
                  sx={{ flex: 1 }}
                >
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() =>
                      setShowTooltipTitlePicker(!showTooltipTitlePicker)
                    }
                    sx={{
                      backgroundColor: themeState.tooltip.titleColor,
                      color:
                        themeState.tooltip.titleColor === "#000000"
                          ? "white"
                          : "rgba(0, 0, 0, 0.6)",
                      width: "100%",
                      minHeight: "36px",
                      borderColor: "rgba(0, 0, 0, 0.12)",
                      "&:hover": {
                        backgroundColor: themeState.tooltip.titleColor,
                        borderColor: "rgba(0, 0, 0, 0.12)",
                      },
                    }}
                  ></Button>
                  {showTooltipTitlePicker && (
                    <Portal>
                      <Box
                        sx={{
                          position: "fixed",
                          top: 0,
                          right: 0,
                          bottom: 0,
                          left: 0,
                          zIndex: 9998,
                          bgcolor: "rgba(0, 0, 0, 0.1)",
                        }}
                        onClick={() => setShowTooltipTitlePicker(false)}
                      />
                      <Box
                        sx={{
                          position: "absolute",
                          zIndex: 9999,
                          ...(() => {
                            const buttonEl = buttonRefs.get("tooltip-title");
                            if (!buttonEl) return {};
                            const rect = buttonEl.getBoundingClientRect();
                            const pickerHeight = 300;
                            const viewportHeight = window.innerHeight;

                            const wouldOverflowBottom =
                              rect.bottom + pickerHeight + 5 > viewportHeight;

                            if (wouldOverflowBottom) {
                              return {
                                bottom:
                                  window.innerHeight -
                                  rect.top +
                                  window.scrollY +
                                  5,
                                left: rect.left + window.scrollX,
                              };
                            } else {
                              return {
                                top: rect.bottom + window.scrollY + 5,
                                left: rect.left + window.scrollX,
                              };
                            }
                          })(),
                        }}
                      >
                        <SketchPicker
                          color={themeState.tooltip.titleColor}
                          onChange={(color: ColorResult) =>
                            setThemeState({
                              ...themeState,
                              tooltip: {
                                ...themeState.tooltip,
                                titleColor: color.hex,
                              },
                            })
                          }
                        />
                      </Box>
                    </Portal>
                  )}
                </Box>
              </Box>
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }} component="div">
              <TextField
                fullWidth
                size="small"
                margin="dense"
                label="Padding"
                type="number"
                value={themeState.tooltip.padding}
                onChange={(e) =>
                  setThemeState({
                    ...themeState,
                    tooltip: {
                      ...themeState.tooltip,
                      padding: Number(e.target.value),
                    },
                  })
                }
                {...numberInputStyles}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }} component="div">
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  mt: 1,
                  position: "relative",
                }}
              >
                <Typography
                  variant="body2"
                  sx={{ color: "rgba(0, 0, 0, 0.6)" }}
                >
                  Border Color
                </Typography>
                <Box
                  ref={(el) => {
                    if (el) buttonRefs.set("tooltip-border", el);
                  }}
                  sx={{ flex: 1 }}
                >
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() =>
                      setShowTooltipBorderPicker(!showTooltipBorderPicker)
                    }
                    sx={{
                      backgroundColor: themeState.tooltip.borderColor,
                      color:
                        themeState.tooltip.borderColor === "#000000"
                          ? "white"
                          : "rgba(0, 0, 0, 0.6)",
                      width: "100%",
                      minHeight: "36px",
                      borderColor: "rgba(0, 0, 0, 0.12)",
                      "&:hover": {
                        backgroundColor: themeState.tooltip.borderColor,
                        borderColor: "rgba(0, 0, 0, 0.12)",
                      },
                    }}
                  ></Button>
                  {showTooltipBorderPicker && (
                    <Portal>
                      <Box
                        sx={{
                          position: "fixed",
                          top: 0,
                          right: 0,
                          bottom: 0,
                          left: 0,
                          zIndex: 9998,
                          bgcolor: "rgba(0, 0, 0, 0.1)",
                        }}
                        onClick={() => setShowTooltipBorderPicker(false)}
                      />
                      <Box
                        sx={{
                          position: "absolute",
                          zIndex: 9999,
                          ...(() => {
                            const buttonEl = buttonRefs.get("tooltip-border");
                            if (!buttonEl) return {};
                            const rect = buttonEl.getBoundingClientRect();
                            const pickerHeight = 300;
                            const viewportHeight = window.innerHeight;

                            const wouldOverflowBottom =
                              rect.bottom + pickerHeight + 5 > viewportHeight;

                            if (wouldOverflowBottom) {
                              return {
                                bottom:
                                  window.innerHeight -
                                  rect.top +
                                  window.scrollY +
                                  5,
                                left: rect.left + window.scrollX,
                              };
                            } else {
                              return {
                                top: rect.bottom + window.scrollY + 5,
                                left: rect.left + window.scrollX,
                              };
                            }
                          })(),
                        }}
                      >
                        <SketchPicker
                          color={themeState.tooltip.borderColor}
                          onChange={(color: ColorResult) =>
                            setThemeState({
                              ...themeState,
                              tooltip: {
                                ...themeState.tooltip,
                                borderColor: color.hex,
                              },
                            })
                          }
                        />
                      </Box>
                    </Portal>
                  )}
                </Box>
              </Box>
            </Grid>
          </Grid>
          <Grid container spacing={1} component="div">
            <Grid size={{ xs: 12 }} component="div">
              <Divider sx={{ my: 2 }} textAlign="left">
                <Typography
                  variant="body2"
                  sx={{ color: "rgba(0, 0, 0, 0.6)" }}
                >
                  Y-Scale Setup
                </Typography>
              </Divider>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }} component="div">
              <FormControl fullWidth size="small" margin="dense">
                <InputLabel>Show Y Scale</InputLabel>
                <Select
                  value={themeState.scales.y.display}
                  label="Show Y Scale"
                  onChange={(e) =>
                    setThemeState({
                      ...themeState,
                      scales: {
                        ...themeState.scales,
                        y: {
                          ...themeState.scales.y,
                          display: e.target.value === "true",
                        },
                      },
                    })
                  }
                >
                  <MenuItem value="true">True</MenuItem>
                  <MenuItem value="false">False</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }} component="div">
              <FormControl fullWidth size="small" margin="dense">
                <InputLabel>Begin at Zero</InputLabel>
                <Select
                  value={themeState.scales.y.beginAtZero}
                  label="Begin at Zero"
                  onChange={(e) =>
                    setThemeState({
                      ...themeState,
                      scales: {
                        ...themeState.scales,
                        y: {
                          ...themeState.scales.y,
                          beginAtZero: e.target.value === "true",
                        },
                      },
                    })
                  }
                >
                  <MenuItem value="true">True</MenuItem>
                  <MenuItem value="false">False</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }} component="div">
              <FormControl fullWidth size="small" margin="dense">
                <InputLabel>Draw Border</InputLabel>
                <Select
                  value={themeState.scales.y.grid.drawBorder}
                  label="Draw Border"
                  onChange={(e) =>
                    setThemeState({
                      ...themeState,
                      scales: {
                        ...themeState.scales,
                        y: {
                          ...themeState.scales.y,
                          grid: {
                            ...themeState.scales.y.grid,
                            drawBorder: e.target.value === "true",
                          },
                        },
                      },
                    })
                  }
                >
                  <MenuItem value="true">True</MenuItem>
                  <MenuItem value="false">False</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }} component="div">
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  mt: 1,
                  position: "relative",
                }}
              >
                <Typography
                  variant="body2"
                  sx={{ color: "rgba(0, 0, 0, 0.6)" }}
                >
                  Grid Color
                </Typography>
                <Box
                  ref={(el) => {
                    if (el) buttonRefs.set("y-scale-grid", el);
                  }}
                  sx={{ flex: 1 }}
                >
                  {" "}
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() =>
                      setShowYScaleGridColorPicker(!showYScaleGridColorPicker)
                    }
                    sx={{
                      backgroundColor: themeState.scales.y.grid.color,
                      color:
                        themeState.scales.y.grid.color === "#000000"
                          ? "white"
                          : "rgba(0, 0, 0, 0.6)",
                      width: "100%",
                      minHeight: "36px",
                      borderColor: "rgba(0, 0, 0, 0.12)",
                      "&:hover": {
                        backgroundColor: themeState.scales.y.grid.color,
                        borderColor: "rgba(0, 0, 0, 0.12)",
                      },
                    }}
                  ></Button>
                  {showYScaleGridColorPicker && (
                    <Portal>
                      <Box
                        sx={{
                          position: "fixed",
                          top: 0,
                          right: 0,
                          bottom: 0,
                          left: 0,
                          zIndex: 9998,
                          bgcolor: "rgba(0, 0, 0, 0.1)",
                        }}
                        onClick={() => setShowYScaleGridColorPicker(false)}
                      />
                      <Box
                        sx={{
                          position: "absolute",
                          zIndex: 9999,
                          ...(() => {
                            const buttonEl = buttonRefs.get("y-scale-grid");
                            if (!buttonEl) return {};
                            const rect = buttonEl.getBoundingClientRect();
                            const pickerHeight = 300;
                            const viewportHeight = window.innerHeight;

                            const wouldOverflowBottom =
                              rect.bottom + pickerHeight + 5 > viewportHeight;

                            if (wouldOverflowBottom) {
                              return {
                                bottom:
                                  window.innerHeight -
                                  rect.top +
                                  window.scrollY +
                                  5,
                                left: rect.left + window.scrollX,
                              };
                            } else {
                              return {
                                top: rect.bottom + window.scrollY + 5,
                                left: rect.left + window.scrollX,
                              };
                            }
                          })(),
                        }}
                      >
                        <SketchPicker
                          color={themeState.scales.y.grid.color}
                          onChange={(color: ColorResult) =>
                            setThemeState({
                              ...themeState,
                              scales: {
                                ...themeState.scales,
                                y: {
                                  ...themeState.scales.y,
                                  grid: {
                                    ...themeState.scales.y.grid,
                                    color: color.hex,
                                  },
                                },
                              },
                            })
                          }
                        />
                      </Box>
                    </Portal>
                  )}
                </Box>
              </Box>
            </Grid>
            {/* <Grid size={{ xs: 12, sm: 6 }} component="div">
              <FormControl fullWidth size="small" margin="dense">
                <InputLabel>Display Title</InputLabel>
                <Select
                  value={themeState.scales.y.title.display}
                  label="Display Title"
                  onChange={(e) =>
                    setThemeState({
                      ...themeState,
                      scales: {
                        ...themeState.scales,
                        y: {
                          ...themeState.scales.y,
                          title: {
                            ...themeState.scales.y.title,
                            display: e.target.value === "true",
                          },
                        },
                      },
                    })
                  }
                >
                  <MenuItem value="true">True</MenuItem>
                  <MenuItem value="false">False</MenuItem>
                </Select>
              </FormControl>
            </Grid> */}
            {/* <Grid size={{ xs: 12, sm: 6 }} component="div">
              <TextField
                fullWidth
                size="small"
                margin="dense"
                label="Title Text"
                value={themeState.scales.y.title.text}
                onChange={(e) =>
                  setThemeState({
                    ...themeState,
                    scales: {
                      ...themeState.scales,
                      y: {
                        ...themeState.scales.y,
                        title: {
                          ...themeState.scales.y.title,
                          text: e.target.value,
                        },
                      },
                    },
                  })
                }
              />
            </Grid> */}
            {/* <Grid size={{ xs: 12, sm: 6 }} component="div">
              <TextField
                fullWidth
                size="small"
                margin="dense"
                label="Title Font Size"
                type="number"
                value={themeState.scales.y.title.font.size}
                onChange={(e) =>
                  setThemeState({
                    ...themeState,
                    scales: {
                      ...themeState.scales,
                      y: {
                        ...themeState.scales.y,
                        title: {
                          ...themeState.scales.y.title,
                          font: {
                            ...themeState.scales.y.title.font,
                            size: Number(e.target.value),
                          },
                        },
                      },
                    },
                  })
                }
                {...numberInputStyles}
              />
            </Grid> */}
            <Grid size={{ xs: 12, sm: 6 }} component="div">
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  mt: 1,
                  position: "relative",
                }}
              >
                <Typography
                  variant="body2"
                  sx={{ color: "rgba(0, 0, 0, 0.6)" }}
                >
                  Title Color
                </Typography>
                <Box
                  ref={(el) => {
                    if (el) buttonRefs.set("y-scale-title", el);
                  }}
                  sx={{ flex: 1 }}
                >
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() =>
                      setShowYScaleTitleColorPicker(!showYScaleTitleColorPicker)
                    }
                    sx={{
                      backgroundColor: themeState.scales.y.title.color,
                      color:
                        themeState.scales.y.title.color === "#000000"
                          ? "white"
                          : "rgba(0, 0, 0, 0.6)",
                      width: "100%",
                      minHeight: "36px",
                      borderColor: "rgba(0, 0, 0, 0.12)",
                      "&:hover": {
                        backgroundColor: themeState.scales.y.title.color,
                        borderColor: "rgba(0, 0, 0, 0.12)",
                      },
                    }}
                  ></Button>
                  {showYScaleTitleColorPicker && (
                    <Portal>
                      <Box
                        sx={{
                          position: "fixed",
                          top: 0,
                          right: 0,
                          bottom: 0,
                          left: 0,
                          zIndex: 9998,
                          bgcolor: "rgba(0, 0, 0, 0.1)",
                        }}
                        onClick={() => setShowYScaleTitleColorPicker(false)}
                      />
                      <Box
                        sx={{
                          position: "absolute",
                          zIndex: 9999,
                          ...(() => {
                            const buttonEl = buttonRefs.get("y-scale-title");
                            if (!buttonEl) return {};
                            const rect = buttonEl.getBoundingClientRect();
                            const pickerHeight = 300;
                            const viewportHeight = window.innerHeight;

                            const wouldOverflowBottom =
                              rect.bottom + pickerHeight + 5 > viewportHeight;

                            if (wouldOverflowBottom) {
                              return {
                                bottom:
                                  window.innerHeight -
                                  rect.top +
                                  window.scrollY +
                                  5,
                                left: rect.left + window.scrollX,
                              };
                            } else {
                              return {
                                top: rect.bottom + window.scrollY + 5,
                                left: rect.left + window.scrollX,
                              };
                            }
                          })(),
                        }}
                      >
                        <SketchPicker
                          color={themeState.scales.y.title.color}
                          onChange={(color: ColorResult) =>
                            setThemeState({
                              ...themeState,
                              scales: {
                                ...themeState.scales,
                                y: {
                                  ...themeState.scales.y,
                                  title: {
                                    ...themeState.scales.y.title,
                                    color: color.hex,
                                  },
                                },
                              },
                            })
                          }
                        />
                      </Box>
                    </Portal>
                  )}
                </Box>
              </Box>
            </Grid>
          </Grid>
          <Grid container spacing={1} component="div">
            <Grid size={{ xs: 12 }} component="div">
              <Divider sx={{ my: 2 }} textAlign="left">
                <Typography
                  variant="body2"
                  sx={{ color: "rgba(0, 0, 0, 0.6)" }}
                >
                  X-Scale Setup
                </Typography>
              </Divider>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }} component="div">
              <FormControl fullWidth size="small" margin="dense">
                <InputLabel>Show X Scale</InputLabel>
                <Select
                  value={themeState.scales.x.display}
                  label="Show X Scale"
                  onChange={(e) =>
                    setThemeState({
                      ...themeState,
                      scales: {
                        ...themeState.scales,
                        x: {
                          ...themeState.scales.x,
                          display: e.target.value === "true",
                        },
                      },
                    })
                  }
                >
                  <MenuItem value="true">True</MenuItem>
                  <MenuItem value="false">False</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }} component="div">
              <FormControl fullWidth size="small" margin="dense">
                <InputLabel>Display Grid</InputLabel>
                <Select
                  value={themeState.scales.x.grid.display}
                  label="Display Grid"
                  onChange={(e) =>
                    setThemeState({
                      ...themeState,
                      scales: {
                        ...themeState.scales,
                        x: {
                          ...themeState.scales.x,
                          grid: {
                            ...themeState.scales.x.grid,
                            display: e.target.value === "true",
                          },
                        },
                      },
                    })
                  }
                >
                  <MenuItem value="true">True</MenuItem>
                  <MenuItem value="false">False</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }} component="div">
              <TextField
                fullWidth
                size="small"
                margin="dense"
                label="Ticks Padding"
                type="number"
                value={themeState.scales.x.ticks.padding}
                onChange={(e) =>
                  setThemeState({
                    ...themeState,
                    scales: {
                      ...themeState.scales,
                      x: {
                        ...themeState.scales.x,
                        ticks: {
                          ...themeState.scales.x.ticks,
                          padding: Number(e.target.value),
                        },
                      },
                    },
                  })
                }
                {...numberInputStyles}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }} component="div">
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  mt: 1,
                  position: "relative",
                }}
              >
                <Typography
                  variant="body2"
                  sx={{ color: "rgba(0, 0, 0, 0.6)" }}
                >
                  Ticks Color
                </Typography>
                <Box
                  ref={(el) => {
                    if (el) buttonRefs.set("x-scale-ticks", el);
                  }}
                  sx={{ flex: 1 }}
                >
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() =>
                      setShowXScaleTicksColorPicker(!showXScaleTicksColorPicker)
                    }
                    sx={{
                      backgroundColor: themeState.scales.x.ticks.color,
                      color:
                        themeState.scales.x.ticks.color === "#000000"
                          ? "white"
                          : "rgba(0, 0, 0, 0.6)",
                      width: "100%",
                      minHeight: "36px",
                      borderColor: "rgba(0, 0, 0, 0.12)",
                      "&:hover": {
                        backgroundColor: themeState.scales.x.ticks.color,
                        borderColor: "rgba(0, 0, 0, 0.12)",
                      },
                    }}
                  ></Button>
                  {showXScaleTicksColorPicker && (
                    <Portal>
                      <Box
                        sx={{
                          position: "fixed",
                          top: 0,
                          right: 0,
                          bottom: 0,
                          left: 0,
                          zIndex: 9998,
                          bgcolor: "rgba(0, 0, 0, 0.1)",
                        }}
                        onClick={() => setShowXScaleTicksColorPicker(false)}
                      />
                      <Box
                        sx={{
                          position: "absolute",
                          zIndex: 9999,
                          ...(() => {
                            const buttonEl = buttonRefs.get("x-scale-ticks");
                            if (!buttonEl) return {};
                            const rect = buttonEl.getBoundingClientRect();
                            const pickerHeight = 300;
                            const viewportHeight = window.innerHeight;

                            const wouldOverflowBottom =
                              rect.bottom + pickerHeight + 5 > viewportHeight;

                            if (wouldOverflowBottom) {
                              return {
                                bottom:
                                  window.innerHeight -
                                  rect.top +
                                  window.scrollY +
                                  5,
                                left: rect.left + window.scrollX,
                              };
                            } else {
                              return {
                                top: rect.bottom + window.scrollY + 5,
                                left: rect.left + window.scrollX,
                              };
                            }
                          })(),
                        }}
                      >
                        <SketchPicker
                          color={themeState.scales.x.ticks.color}
                          onChange={(color: ColorResult) =>
                            setThemeState({
                              ...themeState,
                              scales: {
                                ...themeState.scales,
                                x: {
                                  ...themeState.scales.x,
                                  ticks: {
                                    ...themeState.scales.x.ticks,
                                    color: color.hex,
                                  },
                                },
                              },
                            })
                          }
                        />
                      </Box>
                    </Portal>
                  )}
                </Box>
              </Box>
            </Grid>
          </Grid>
          {/* <Grid container spacing={1} component="div">
            <Grid size={{ xs: 12 }} component="div">
              <Divider sx={{ my: 2 }} textAlign="left">
                <Typography
                  variant="body2"
                  sx={{ color: "rgba(0, 0, 0, 0.6)" }}
                >
                  Interaction Setup
                </Typography>
              </Divider>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }} component="div">
              <FormControl fullWidth size="small" margin="dense">
                <InputLabel>Interaction Mode</InputLabel>
                <Select
                  value={themeState.interaction.mode}
                  label="Interaction Mode"
                  onChange={(e) =>
                    setThemeState({
                      ...themeState,
                      interaction: {
                        ...themeState.interaction,
                        mode: e.target.value,
                      },
                    })
                  }
                >
                  {interactionModes.map((mode) => (
                    <MenuItem key={mode} value={mode}>
                      {mode}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }} component="div">
              <FormControl fullWidth size="small" margin="dense">
                <InputLabel>Intersect</InputLabel>
                <Select
                  value={themeState.interaction.intersect}
                  label="Intersect"
                  onChange={(e) =>
                    setThemeState({
                      ...themeState,
                      interaction: {
                        ...themeState.interaction,
                        intersect: e.target.value === "true",
                      },
                    })
                  }
                >
                  <MenuItem value="true">True</MenuItem>
                  <MenuItem value="false">False</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid> */}
          <Grid container spacing={1} component="div">
            <Grid size={{ xs: 12 }} component="div">
              <Divider sx={{ my: 2 }} textAlign="left">
                <Typography
                  variant="body2"
                  sx={{ color: "rgba(0, 0, 0, 0.6)" }}
                >
                  Layout Setup
                </Typography>
              </Divider>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }} component="div">
              <TextField
                fullWidth
                size="small"
                margin="dense"
                label="Top Padding"
                type="number"
                value={themeState.layout.padding.top}
                onChange={(e) =>
                  setThemeState({
                    ...themeState,
                    layout: {
                      ...themeState.layout,
                      padding: {
                        ...themeState.layout.padding,
                        top: Number(e.target.value),
                      },
                    },
                  })
                }
                {...numberInputStyles}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }} component="div">
              <TextField
                fullWidth
                size="small"
                margin="dense"
                label="Bottom Padding"
                type="number"
                value={themeState.layout.padding.bottom}
                onChange={(e) =>
                  setThemeState({
                    ...themeState,
                    layout: {
                      ...themeState.layout,
                      padding: {
                        ...themeState.layout.padding,
                        bottom: Number(e.target.value),
                      },
                    },
                  })
                }
                {...numberInputStyles}
              />
            </Grid>
          </Grid>
          <Grid container spacing={1} component="div">
            <Grid size={{ xs: 12 }} component="div">
              <Divider sx={{ my: 2 }} textAlign="left">
                <Typography
                  variant="body2"
                  sx={{ color: "rgba(0, 0, 0, 0.6)" }}
                >
                  legend overlay
                </Typography>
              </Divider>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }} component="div">
              <FormControlLabel
                control={
                  <Checkbox
                    checked={themeState.showLegendOverlay}
                    onChange={(e) =>
                      setThemeState({
                        ...themeState,
                        showLegendOverlay: e.target.checked,
                      })
                    }
                  />
                }
                label="Show legend overlay"
              />
            </Grid>
          </Grid>
          {/* <Grid container spacing={1} component="div">
            <Grid size={{ xs: 12 }} component="div">
              <Divider sx={{ my: 2 }} textAlign="left">
                <Typography
                  variant="body2"
                  sx={{ color: "rgba(0, 0, 0, 0.6)" }}
                >
                  Fill Setup
                </Typography>
              </Divider>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }} component="div">
              <FormControl fullWidth size="small" margin="dense">
                <InputLabel>Fill Enabled</InputLabel>
                <Select
                  value={themeState.fill.enabled}
                  label="Fill Enabled"
                  onChange={(e) =>
                    setThemeState({
                      ...themeState,
                      fill: {
                        ...themeState.fill,
                        enabled: e.target.value === "true",
                      },
                    })
                  }
                >
                  <MenuItem value="true">True</MenuItem>
                  <MenuItem value="false">False</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }} component="div">
              <FormControl fullWidth size="small" margin="dense">
                <InputLabel>Fill Type</InputLabel>
                <Select
                  value={themeState.fill.type}
                  label="Fill Type"
                  onChange={(e) =>
                    setThemeState({
                      ...themeState,
                      fill: { ...themeState.fill, type: e.target.value },
                    })
                  }
                >
                  {fillTypes.map((type) => (
                    <MenuItem key={type} value={type}>
                      {type}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }} component="div">
              <TextField
                fullWidth
                size="small"
                margin="dense"
                label="Fill Opacity"
                type="number"
                value={themeState.fill.opacity}
                onChange={(e) =>
                  setThemeState({
                    ...themeState,
                    fill: {
                      ...themeState.fill,
                      opacity: Number(e.target.value),
                    },
                  })
                }
                {...numberInputStyles}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }} component="div">
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  mt: 1,
                  position: "relative",
                }}
              >
                <Typography
                  variant="body2"
                  sx={{ color: "rgba(0, 0, 0, 0.6)" }}
                >
                  Fill Color
                </Typography>
                <Box
                  ref={(el) => {
                    if (el) buttonRefs.set("fill-color", el);
                  }}
                  sx={{ flex: 1 }}
                >
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => setShowFillColorPicker(!showFillColorPicker)}
                    sx={{
                      backgroundColor: themeState.fill.color,
                      color:
                        themeState.fill.color === "#000000"
                          ? "white"
                          : "rgba(0, 0, 0, 0.6)",
                      width: "100%",
                      minHeight: "36px",
                      borderColor: "rgba(0, 0, 0, 0.12)",
                      "&:hover": {
                        backgroundColor: themeState.fill.color,
                        borderColor: "rgba(0, 0, 0, 0.12)",
                      },
                    }}
                  ></Button>
                  {showFillColorPicker && (
                    <Portal>
                      <Box
                        sx={{
                          position: "fixed",
                          top: 0,
                          right: 0,
                          bottom: 0,
                          left: 0,
                          zIndex: 9998,
                          bgcolor: "rgba(0, 0, 0, 0.1)",
                        }}
                        onClick={() => setShowFillColorPicker(false)}
                      />
                      <Box
                        sx={{
                          position: "absolute",
                          zIndex: 9999,
                          ...(() => {
                            const buttonEl = buttonRefs.get("fill-color");
                            if (!buttonEl) return {};
                            const rect = buttonEl.getBoundingClientRect();
                            const pickerHeight = 300;
                            const viewportHeight = window.innerHeight;

                            const wouldOverflowBottom =
                              rect.bottom + pickerHeight + 5 > viewportHeight;

                            if (wouldOverflowBottom) {
                              return {
                                bottom:
                                  window.innerHeight -
                                  rect.top +
                                  window.scrollY +
                                  5,
                                left: rect.left + window.scrollX,
                              };
                            } else {
                              return {
                                top: rect.bottom + window.scrollY + 5,
                                left: rect.left + window.scrollX,
                              };
                            }
                          })(),
                        }}
                      >
                        <SketchPicker
                          color={themeState.fill.color}
                          onChange={(color: ColorResult) =>
                            setThemeState({
                              ...themeState,
                              fill: { ...themeState.fill, color: color.hex },
                            })
                          }
                        />
                      </Box>
                    </Portal>
                  )}
                </Box>
              </Box>
            </Grid>
          </Grid> */}
          {/* <Grid container spacing={1} component="div">
            <Grid size={{ xs: 12 }} component="div">
              <Divider sx={{ my: 2 }} textAlign="left">
                <Typography
                  variant="body2"
                  sx={{ color: "rgba(0, 0, 0, 0.6)" }}
                >
                  Chart Configuration
                </Typography>
              </Divider>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }} component="div">
              <FormControl fullWidth size="small" margin="dense">
                <InputLabel>Responsive</InputLabel>
                <Select
                  value={themeState.responsive}
                  label="Responsive"
                  onChange={(e) =>
                    setThemeState({
                      ...themeState,
                      responsive: e.target.value === "true",
                    })
                  }
                >
                  <MenuItem value="true">True</MenuItem>
                  <MenuItem value="false">False</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }} component="div">
              <FormControl fullWidth size="small" margin="dense">
                <InputLabel>Maintain Aspect Ratio</InputLabel>
                <Select
                  value={themeState.maintainAspectRatio}
                  label="Maintain Aspect Ratio"
                  onChange={(e) =>
                    setThemeState({
                      ...themeState,
                      maintainAspectRatio: e.target.value === "true",
                    })
                  }
                >
                  <MenuItem value="true">True</MenuItem>
                  <MenuItem value="false">False</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }} component="div">
              <FormControl fullWidth size="small" margin="dense">
                <InputLabel>Chart Type</InputLabel>
                <Select
                  value={themeState.chartType}
                  label="Chart Type"
                  onChange={(e) =>
                    setThemeState({ ...themeState, chartType: e.target.value })
                  }
                >
                  {chartTypes.map((type) => (
                    <MenuItem key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid> */}
          <Grid container spacing={1} component="div">
            <Grid size={{ xs: 12 }} component="div">
              <Divider sx={{ my: 2 }} textAlign="left">
                <Typography
                  variant="body2"
                  sx={{ color: "rgba(0, 0, 0, 0.6)" }}
                >
                  Colors Configuration
                </Typography>
              </Divider>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }} component="div">
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <Typography
                  variant="body2"
                  sx={{ color: "rgba(0, 0, 0, 0.6)" }}
                >
                  Colors
                </Typography>
                {themeState.colors.map((color, index) => (
                  <Box
                    key={index}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      position: "relative",
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{ color: "rgba(0, 0, 0, 0.6)", minWidth: "60px" }}
                    >
                      Color {index + 1}
                    </Typography>
                    <Box
                      ref={(el) => {
                        if (el) buttonRefs.set(`color-${index}`, el);
                      }}
                      sx={{ flex: 1 }}
                    >
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => setShowColorsPicker(index)}
                        sx={{
                          backgroundColor: color,
                          color:
                            color === "#000000"
                              ? "white"
                              : "rgba(0, 0, 0, 0.6)",
                          width: "100%",
                          minHeight: "36px",
                          borderColor: "rgba(0, 0, 0, 0.12)",
                          "&:hover": {
                            backgroundColor: color,
                            borderColor: "rgba(0, 0, 0, 0.12)",
                          },
                        }}
                      ></Button>
                      {showColorsPicker === index && (
                        <Portal>
                          <Box
                            sx={{
                              position: "fixed",
                              top: 0,
                              right: 0,
                              bottom: 0,
                              left: 0,
                              zIndex: 9998,
                              bgcolor: "rgba(0, 0, 0, 0.1)",
                            }}
                            onClick={() => setShowColorsPicker(null)}
                          />
                          <Box
                            sx={{
                              position: "absolute",
                              zIndex: 9999,
                              ...(() => {
                                const buttonEl = buttonRefs.get(
                                  `color-${index}`
                                );
                                if (!buttonEl) return {};
                                const rect = buttonEl.getBoundingClientRect();
                                const pickerHeight = 300;
                                const viewportHeight = window.innerHeight;

                                const wouldOverflowBottom =
                                  rect.bottom + pickerHeight + 5 >
                                  viewportHeight;

                                if (wouldOverflowBottom) {
                                  return {
                                    bottom:
                                      window.innerHeight -
                                      rect.top +
                                      window.scrollY +
                                      5,
                                    left: rect.left + window.scrollX,
                                  };
                                } else {
                                  return {
                                    top: rect.bottom + window.scrollY + 5,
                                    left: rect.left + window.scrollX,
                                  };
                                }
                              })(),
                            }}
                          >
                            <SketchPicker
                              color={color}
                              onChange={(color: ColorResult) => {
                                const newColors = [...themeState.colors];
                                newColors[index] = color.hex;
                                setThemeState({
                                  ...themeState,
                                  colors: newColors,
                                });
                              }}
                            />
                          </Box>
                        </Portal>
                      )}
                    </Box>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => {
                        const newColors = [...themeState.colors];
                        newColors.splice(index, 1);
                        setThemeState({ ...themeState, colors: newColors });
                      }}
                    >
                      <CloseIcon />
                    </IconButton>
                  </Box>
                ))}
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() =>
                    setThemeState({
                      ...themeState,
                      colors: [...themeState.colors, "#000000"],
                    })
                  }
                  sx={{ mt: 1 }}
                >
                  Add Color
                </Button>
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }} component="div">
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <Typography
                  variant="body2"
                  sx={{ color: "rgba(0, 0, 0, 0.6)" }}
                >
                  Border Colors
                </Typography>
                {themeState.borderColor.map((color, index) => (
                  <Box
                    key={index}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      position: "relative",
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{ color: "rgba(0, 0, 0, 0.6)", minWidth: "60px" }}
                    >
                      Border Color {index + 1}
                    </Typography>
                    <Box
                      ref={(el) => {
                        if (el) buttonRefs.set(`border-${index}`, el);
                      }}
                      sx={{ flex: 1 }}
                    >
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => setShowBorderColorPicker(index)}
                        sx={{
                          backgroundColor: color,
                          color:
                            color === "#000000"
                              ? "white"
                              : "rgba(0, 0, 0, 0.6)",
                          width: "100%",
                          minHeight: "36px",
                          borderColor: "rgba(0, 0, 0, 0.12)",
                          "&:hover": {
                            backgroundColor: color,
                            borderColor: "rgba(0, 0, 0, 0.12)",
                          },
                        }}
                      ></Button>
                      {showBorderColorPicker === index && (
                        <Portal>
                          <Box
                            sx={{
                              position: "fixed",
                              top: 0,
                              right: 0,
                              bottom: 0,
                              left: 0,
                              zIndex: 9998,
                              bgcolor: "rgba(0, 0, 0, 0.1)",
                            }}
                            onClick={() => setShowBorderColorPicker(null)}
                          />
                          <Box
                            sx={{
                              position: "absolute",
                              zIndex: 9999,
                              ...(() => {
                                const buttonEl = buttonRefs.get(
                                  `border-${index}`
                                );
                                if (!buttonEl) return {};
                                const rect = buttonEl.getBoundingClientRect();
                                const pickerHeight = 300;
                                const viewportHeight = window.innerHeight;

                                const wouldOverflowBottom =
                                  rect.bottom + pickerHeight + 5 >
                                  viewportHeight;

                                if (wouldOverflowBottom) {
                                  return {
                                    bottom:
                                      window.innerHeight -
                                      rect.top +
                                      window.scrollY +
                                      5,
                                    left: rect.left + window.scrollX,
                                  };
                                } else {
                                  return {
                                    top: rect.bottom + window.scrollY + 5,
                                    left: rect.left + window.scrollX,
                                  };
                                }
                              })(),
                            }}
                          >
                            <SketchPicker
                              color={color}
                              onChange={(color: ColorResult) => {
                                const newColors = [...themeState.borderColor];
                                newColors[index] = color.hex;
                                setThemeState({
                                  ...themeState,
                                  borderColor: newColors,
                                });
                              }}
                            />
                          </Box>
                        </Portal>
                      )}
                    </Box>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => {
                        const newColors = [...themeState.borderColor];
                        newColors.splice(index, 1);
                        setThemeState({
                          ...themeState,
                          borderColor: newColors,
                        });
                      }}
                    >
                      <CloseIcon />
                    </IconButton>
                  </Box>
                ))}
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() =>
                    setThemeState({
                      ...themeState,
                      borderColor: [...themeState.borderColor, "#000000"],
                    })
                  }
                  sx={{ mt: 1 }}
                >
                  Add Border Color
                </Button>
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }} component="div">
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <Typography
                  variant="body2"
                  sx={{ color: "rgba(0, 0, 0, 0.6)" }}
                >
                  Background Colors
                </Typography>
                {themeState.backgroundColor.map((color, index) => (
                  <Box
                    key={index}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      position: "relative",
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{ color: "rgba(0, 0, 0, 0.6)", minWidth: "60px" }}
                    >
                      Background Color {index + 1}
                    </Typography>
                    <Box
                      ref={(el) => {
                        if (el) buttonRefs.set(`bg-${index}`, el);
                      }}
                      sx={{ flex: 1 }}
                    >
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => setShowBackgroundColorPicker(index)}
                        sx={{
                          backgroundColor: color,
                          color:
                            color === "#000000"
                              ? "white"
                              : "rgba(0, 0, 0, 0.6)",
                          width: "100%",
                          minHeight: "36px",
                          borderColor: "rgba(0, 0, 0, 0.12)",
                          "&:hover": {
                            backgroundColor: color,
                            borderColor: "rgba(0, 0, 0, 0.12)",
                          },
                        }}
                      ></Button>
                      {showBackgroundColorPicker === index && (
                        <Portal>
                          <Box
                            sx={{
                              position: "fixed",
                              top: 0,
                              right: 0,
                              bottom: 0,
                              left: 0,
                              zIndex: 9998,
                              bgcolor: "rgba(0, 0, 0, 0.1)",
                            }}
                            onClick={() => setShowBackgroundColorPicker(null)}
                          />
                          <Box
                            sx={{
                              position: "absolute",
                              zIndex: 9999,
                              ...(() => {
                                const buttonEl = buttonRefs.get(`bg-${index}`);
                                if (!buttonEl) return {};
                                const rect = buttonEl.getBoundingClientRect();
                                const pickerHeight = 300;
                                const viewportHeight = window.innerHeight;

                                const wouldOverflowBottom =
                                  rect.bottom + pickerHeight + 5 >
                                  viewportHeight;

                                if (wouldOverflowBottom) {
                                  return {
                                    bottom:
                                      window.innerHeight -
                                      rect.top +
                                      window.scrollY +
                                      5,
                                    left: rect.left + window.scrollX,
                                  };
                                } else {
                                  return {
                                    top: rect.bottom + window.scrollY + 5,
                                    left: rect.left + window.scrollX,
                                  };
                                }
                              })(),
                            }}
                          >
                            <SketchPicker
                              color={color}
                              onChange={(color: ColorResult) => {
                                const newColors = [
                                  ...themeState.backgroundColor,
                                ];
                                newColors[index] = color.hex;
                                setThemeState({
                                  ...themeState,
                                  backgroundColor: newColors,
                                });
                              }}
                            />
                          </Box>
                        </Portal>
                      )}
                    </Box>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => {
                        const newColors = [...themeState.backgroundColor];
                        newColors.splice(index, 1);
                        setThemeState({
                          ...themeState,
                          backgroundColor: newColors,
                        });
                      }}
                    >
                      <CloseIcon />
                    </IconButton>
                  </Box>
                ))}
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() =>
                    setThemeState({
                      ...themeState,
                      backgroundColor: [
                        ...themeState.backgroundColor,
                        "#000000",
                      ],
                    })
                  }
                  sx={{ mt: 1 }}
                >
                  Add Background Color
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 2, py: 1 }}>
        <Button onClick={onClose}>Cancel</Button>
        <StyledButton
          onClick={handleSubmit}
          variant="contained"
          color="primary"
          disabled={
            !themeState.name.trim() ||
            createTheme.isPending ||
            updateTheme.isPending
          }
        >
          {createTheme.isPending
            ? "Creating..."
            : updateTheme.isPending
              ? "Updating..."
              : theme
                ? "Update"
                : "Create"}
        </StyledButton>
      </DialogActions>
    </Dialog>
  );
};

export default CreateThemeDialog;
