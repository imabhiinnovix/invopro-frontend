import { Box, IconButton, Stack, Typography } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { STYLE_GUIDE } from "../../styles";
import { useComponentTypography } from "../../hooks/useComponentTypography";
import { useUnifiedTheme } from "../../hooks/useUnifiedTheme";

export interface PageHeaderProps {
  /** Main heading text */
  title: string;
  /** Optional description or subtext below the title */
  subtext?: string;
  /** Optional action (e.g. button) rendered on the right */
  action?: React.ReactNode;
  /** Optional back handler; when set, shows a back icon before the title */
  onBack?: () => void;
}

/**
 * Reusable page header with title, optional subtext, optional back button, and optional action (e.g. Create button).
 * Use on list/detail pages for consistent layout: [back] title + subtext on the left, action on the right.
 */
export const PageHeader = ({ title, subtext, action, onBack }: PageHeaderProps) => {
  const { getHeadingSx } = useComponentTypography();
  const theme = useUnifiedTheme();

  return (
    <Box
      className="component-page-header"
      sx={{
        display: "flex",
        flexDirection: { xs: "column", md: "row" },
        justifyContent: "space-between",
        mb: STYLE_GUIDE.SPACING.s6,
        alignItems: { xs: "flex-start", md: "center" },
        gap: STYLE_GUIDE.SPACING.s4,
        borderColor: STYLE_GUIDE.COLORS.divider,
      }}
    >
      <Stack direction="row" alignItems="center" gap={onBack ? STYLE_GUIDE.SPACING.s2 : 0}>
        {onBack && (
          <IconButton onClick={onBack} size="small" aria-label="Go back">
            <ArrowBackIcon sx={{ color: theme.palette.primary.main }} />
          </IconButton>
        )}
        <Box>
          <Typography
            variant="h4"
            sx={{
              ...getHeadingSx()
            }}
          >
            {title}
          </Typography>
          {subtext && (
            <Typography
              variant="body1"
              component="div"
              sx={{
                fontSize: "1rem",
                marginTop: "0.25rem",
                color: STYLE_GUIDE.COLORS.textSecondary,
              }}
            >
              {subtext}
            </Typography>
          )}
        </Box>
      </Stack>
      {action != null && action}
    </Box>
  );
};

export default PageHeader;
