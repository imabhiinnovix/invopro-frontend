import React, { useState } from "react";
import {
  Box,
  Typography,
  ToggleButton,
  ToggleButtonGroup,
  Button,
  Popover,
  IconButton,
  Divider,
  Stack,
} from "@mui/material";
import PaletteIcon from "@mui/icons-material/Palette";
import LightModeIcon from "@mui/icons-material/LightMode";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import { useAppTheme, ThemeColorPreset } from "../../../context/AppThemeContext";
import { STYLE_GUIDE } from "../../../styles";
import { SketchPicker, ColorResult } from "react-color";
import { useThemeColor } from "../../../hooks/useThemeColor";

interface ThemeSwitcherProps {
  anchorEl?: HTMLElement | null;
  onClose?: () => void;
  open?: boolean;
}

const COLOR_PRESETS: { label: string; value: ThemeColorPreset; color: string }[] = [
  { label: "Purple", value: "purple", color: "#4F3DA9" },
  { label: "Red", value: "red", color: "#DC3545" },
  { label: "Green", value: "green", color: "#28A745" },
  { label: "Blue", value: "blue", color: "#007BFF" },
];

export const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({
  anchorEl,
  onClose,
  open = false,
}) => {
  const { theme, setMode, setColorPreset, setCustomColor } = useAppTheme();
  const themeColor = useThemeColor();
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [colorPickerAnchor, setColorPickerAnchor] = useState<HTMLElement | null>(null);

  const handleModeChange = (
    _event: React.MouseEvent<HTMLElement>,
    newMode: "light" | "dark" | null
  ) => {
    if (newMode !== null) {
      setMode(newMode);
    }
  };

  const handleColorPresetClick = (preset: ThemeColorPreset) => {
    setColorPreset(preset);
    if (preset !== "custom") {
      setShowColorPicker(false);
    }
  };

  const handleCustomColorClick = (event: React.MouseEvent<HTMLElement>) => {
    setColorPreset("custom");
    setColorPickerAnchor(event.currentTarget);
    setShowColorPicker(true);
  };

  const handleColorChange = (color: ColorResult) => {
    setCustomColor(color.hex);
  };

  const handleColorPickerClose = () => {
    setShowColorPicker(false);
    setColorPickerAnchor(null);
  };

  return (
    <>
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={onClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        PaperProps={{
          sx: {
            p: 2,
            minWidth: 280,
            maxWidth: 320,
            mt: 1,
            boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
          },
        }}
      >
        <Typography
          variant="h6"
          sx={{
            fontSize: "16px",
            fontWeight: 600,
            mb: 2,
            color: STYLE_GUIDE.COLORS.textPrimary,
          }}
        >
          Theme Settings
        </Typography>

        {/* Mode Toggle */}
        <Box sx={{ mb: 3 }}>
          <Typography
            variant="body2"
            sx={{
              fontSize: "13px",
              fontWeight: 500,
              mb: 1.5,
              color: STYLE_GUIDE.COLORS.textSecondary,
            }}
          >
            Mode
          </Typography>
          <ToggleButtonGroup
            value={theme.mode}
            exclusive
            onChange={handleModeChange}
            aria-label="theme mode"
            fullWidth
            sx={{
              "& .MuiToggleButton-root": {
                flex: 1,
                py: 1.5,
                border: `1px solid ${STYLE_GUIDE.COLORS.divider}`,
                "&.Mui-selected": {
                  backgroundColor: themeColor.themeColorLight,
                  color: themeColor.themeColor,
                  borderColor: themeColor.themeColor,
                  "&:hover": {
                    backgroundColor: themeColor.themeColorLight,
                  },
                },
                "&:hover": {
                  backgroundColor: STYLE_GUIDE.COLORS.backgroundHover,
                },
              },
            }}
          >
            <ToggleButton value="light" aria-label="light mode">
              <LightModeIcon sx={{ mr: 1, fontSize: 18 }} />
              Light
            </ToggleButton>
            <ToggleButton value="dark" aria-label="dark mode">
              <DarkModeIcon sx={{ mr: 1, fontSize: 18 }} />
              Dark
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Color Presets */}
        <Box>
          <Typography
            variant="body2"
            sx={{
              fontSize: "13px",
              fontWeight: 500,
              mb: 1.5,
              color: STYLE_GUIDE.COLORS.textSecondary,
            }}
          >
            Color
          </Typography>
          <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: "wrap", gap: 1 }}>
            {COLOR_PRESETS.map((preset) => (
              <Button
                key={preset.value}
                variant={theme.colorPreset === preset.value ? "contained" : "outlined"}
                onClick={() => handleColorPresetClick(preset.value)}
                sx={{
                  minWidth: 60,
                  height: 40,
                  borderRadius: "8px",
                  backgroundColor:
                    theme.colorPreset === preset.value
                      ? preset.color
                      : "transparent",
                  border: `2px solid ${
                    theme.colorPreset === preset.value
                      ? preset.color
                      : STYLE_GUIDE.COLORS.divider
                  }`,
                  color:
                    theme.colorPreset === preset.value
                      ? "#ffffff"
                      : STYLE_GUIDE.COLORS.textPrimary,
                  "&:hover": {
                    backgroundColor:
                      theme.colorPreset === preset.value
                        ? preset.color
                        : STYLE_GUIDE.COLORS.backgroundHover,
                    borderColor: preset.color,
                  },
                  position: "relative",
                }}
              >
                <Box
                  sx={{
                    position: "absolute",
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Box
                    sx={{
                      width: 20,
                      height: 20,
                      borderRadius: "4px",
                      backgroundColor: preset.color,
                      border: `1px solid ${
                        theme.colorPreset === preset.value
                          ? "#ffffff"
                          : "transparent"
                      }`,
                    }}
                  />
                </Box>
              </Button>
            ))}
          </Stack>

          {/* Custom Color Button */}
          <Button
            variant={theme.colorPreset === "custom" ? "contained" : "outlined"}
            onClick={handleCustomColorClick}
            fullWidth
            startIcon={<PaletteIcon />}
            sx={{
              py: 1.5,
              borderRadius: "8px",
              backgroundColor:
                theme.colorPreset === "custom"
                  ? theme.customColor
                  : "transparent",
              border: `2px solid ${
                theme.colorPreset === "custom"
                  ? theme.customColor
                  : STYLE_GUIDE.COLORS.divider
              }`,
              color:
                theme.colorPreset === "custom"
                  ? "#ffffff"
                  : STYLE_GUIDE.COLORS.textPrimary,
              "&:hover": {
                backgroundColor:
                  theme.colorPreset === "custom"
                    ? theme.customColor
                    : STYLE_GUIDE.COLORS.backgroundHover,
                borderColor: theme.colorPreset === "custom" ? theme.customColor : STYLE_GUIDE.COLORS.themeColor,
              },
            }}
          >
            Custom Color
            {theme.colorPreset === "custom" && (
              <Box
                sx={{
                  ml: 1,
                  width: 16,
                  height: 16,
                  borderRadius: "4px",
                  backgroundColor: "#ffffff",
                  border: `1px solid ${theme.customColor}`,
                }}
              />
            )}
          </Button>
        </Box>
      </Popover>

      {/* Color Picker Popover */}
      <Popover
        open={showColorPicker}
        anchorEl={colorPickerAnchor}
        onClose={handleColorPickerClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
      >
        <Box sx={{ p: 1 }}>
          <SketchPicker
            color={theme.customColor}
            onChange={handleColorChange}
            disableAlpha
          />
        </Box>
      </Popover>
    </>
  );
};

// Standalone button component for easy integration
export const ThemeSwitcherButton: React.FC = () => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const { theme } = useAppTheme();

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <IconButton
        onClick={handleClick}
        sx={{
          color: STYLE_GUIDE.COLORS.textPrimary,
          "&:hover": {
            backgroundColor: STYLE_GUIDE.COLORS.backgroundHover,
          },
        }}
      >
        <PaletteIcon />
      </IconButton>
      <ThemeSwitcher
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
      />
    </>
  );
};

