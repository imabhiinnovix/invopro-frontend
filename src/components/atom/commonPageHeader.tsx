import { Box, IconButton, Stack, Typography } from "@mui/material";
import { STYLE_GUIDE } from "../../styles";
import { useComponentTypography } from "../../hooks/useComponentTypography";
import { useUnifiedTheme } from "../../hooks/useUnifiedTheme";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

export default function CommonPageHeader({
  title,
  actions,
  onBack,
}: {
  title: string;
  actions: React.ReactNode;
  onBack?: () => void;
}) {
  const theme = useUnifiedTheme();
  const { getHeadingSx } = useComponentTypography();
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: { xs: "column", md: "row" },
        justifyContent: "space-between",
        alignItems: { xs: "flex-start", md: "center" },
        gap: STYLE_GUIDE.SPACING.s4,
        backgroundColor: theme.palette.background.paper,
        // borderBottom: "1px solid",
        borderColor: STYLE_GUIDE.COLORS.divider,
        mb: 4,
      }}
    >
      <Stack direction="row" alignItems="center" gap={STYLE_GUIDE.SPACING.s2}>
        {onBack && (
          <IconButton onClick={onBack}>
            <ArrowBackIcon sx={{ color: theme.palette.primary.main }} />
          </IconButton>
        )}
        <Typography
          variant="h4"
          sx={{
            ...getHeadingSx(),
          }}
        >
          {title}
        </Typography>
      </Stack>
      {actions}
    </Box>
  );
}
