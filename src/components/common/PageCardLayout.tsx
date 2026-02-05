import { Card, CardContent, SxProps, Theme } from "@mui/material";
import { STYLE_GUIDE } from "../../styles";

export interface PageCardLayoutProps {
  /** Content to render inside the card */
  children: React.ReactNode;
  /** Padding for CardContent. Default: STYLE_GUIDE.SPACING.s6 (24px) */
  contentPadding?: string | number;
  /** Optional extra sx for the Card root */
  sx?: SxProps<Theme>;
}

/**
 * Shared card layout for page content: white background, 12px radius, light border.
 * Wrap table/content sections so styling is consistent across pages.
 */
export const PageCardLayout: React.FC<PageCardLayoutProps> = ({
  children,
  contentPadding = STYLE_GUIDE.SPACING.s6,
  sx = {},
}) => {
  return (
    <Card
      sx={{
        backgroundColor: STYLE_GUIDE?.COLORS?.white || "#ffffff",
        borderRadius: "12px",
        overflow: "visible",
        border: `1px solid ${STYLE_GUIDE.COLORS.inputFieldBorder}`,
        ...sx,
      }}
    >
      <CardContent sx={{ p: contentPadding || STYLE_GUIDE.SPACING.s6 }}>{children}</CardContent>
    </Card>
  );
};

export default PageCardLayout;
