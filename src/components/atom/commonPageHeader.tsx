import { Box, Typography } from "@mui/material";
import { STYLE_GUIDE } from "../../styles";
import { useComponentTypography } from "../../hooks/useComponentTypography";
import { useUnifiedTheme } from "../../hooks/useUnifiedTheme";

export default function CommonPageHeader({
  title,
  actions,
}: {
  title: string;
  actions: React.ReactNode;
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
      }}
    >
      <Typography
        variant="h4"
        sx={{
          ...getHeadingSx(),
        }}
      >
        {title}
      </Typography>
      {actions}
    </Box>
  );
}
