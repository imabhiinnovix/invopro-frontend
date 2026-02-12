import { Box, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";
import { STYLE_GUIDE } from "../../../styles";
import { Theme } from "../../createTheme/types";

export const ChartContainer = styled(Box)(({ theme }) => ({
  flex: 1,
  height: "100%",
  backgroundColor: "#ffffff",
  borderRadius: theme.shape.borderRadius,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  position: "relative",
  overflow: "auto",
  "& canvas": {
    width: "100% !important",
    height: "100% !important",
  },
  "&.pie-chart": {
    minHeight: 450,
    "& canvas": {
      maxWidth: "95% !important",
      maxHeight: "95% !important",
    },
  },
  "&.line-chart": {
    minHeight: 500,
    "& canvas": {
      maxHeight: "90% !important",
    },
  },
  "&.horizontal-bar-chart": {
    minHeight: 450,
    "& canvas": {
      maxWidth: "98% !important",
      maxHeight: "90% !important",
    },
  },
  "&.table-chart": {
    minHeight: 400,
    padding: theme.spacing(2),
    overflow: "auto",
    "& .MuiTableContainer-root": {
      height: "100%",
      width: "100%",
      overflow: "auto",
    },
  },
  "&.number-chart": {
    flexDirection: "column",
    gap: theme.spacing(2),
  },
  "&:hover": {
    overflow: "hidden",
  },
  "&::-webkit-scrollbar": {
    width: "8px",
    height: "8px",
  },
  "&::-webkit-scrollbar-thumb": {
    backgroundColor: theme.palette.divider,
    borderRadius: "4px",
  },
}));

export const NumberDisplay = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: theme.spacing(1),
}));

export const NumberValue = styled(Typography, {
  shouldForwardProp: (prop) => prop !== "widgetTheme",
})<{ widgetTheme?: Theme | null }>(({ theme, widgetTheme }) => ({
  fontSize: STYLE_GUIDE.TYPOGRAPHY.fontSize.xxxl,
  fontWeight: STYLE_GUIDE.TYPOGRAPHY.fontWeight.semiBold,
  color: widgetTheme?.colors?.[0] || "#4D4D4D",
  lineHeight: STYLE_GUIDE.TYPOGRAPHY.lineHeight.tight,
}));

export const NumberLabel = styled(Typography)(({ theme }) => ({
  fontSize: "1rem",
  color: theme.palette.text.secondary,
  textAlign: "center",
}));
