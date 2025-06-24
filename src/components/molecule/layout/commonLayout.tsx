import { Box } from "@mui/material";
import { Outlet } from "react-router-dom";
import SideNav from "../../atom/sideNav/sideNav";
import { STYLE_GUIDE } from "../../../styles";

const CommonLayout = () => {
  return (
    <Box
      sx={{
        display: "flex",
        width: "100%",
        height: "100vh",
        backgroundColor: STYLE_GUIDE.COLORS.backgroundLight,
        overflow: "hidden",
        position: "fixed", // Fix the main container
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
      }}
    >
      <Box
        sx={{
          height: "100%",
          backgroundColor: STYLE_GUIDE.COLORS.white,
          boxShadow: `1px 0px 10px ${STYLE_GUIDE.COLORS.blackBorderPrimary}`,
        }}
      >
        <SideNav />
      </Box>
      <Box
        sx={{
          flex: 1,
          height: "calc(100% - 48px)",
          p: STYLE_GUIDE.SPACING.s3,
          overflowY: "auto",
          overflowX: "hidden",
          "&::-webkit-scrollbar": {
            width: "8px",
            backgroundColor: "transparent",
          },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: STYLE_GUIDE.COLORS.coolBlue,
            borderRadius: STYLE_GUIDE.SPACING.s1,
          },
          "&::-webkit-scrollbar-track": {
            backgroundColor: "transparent",
          },
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};

export default CommonLayout;
