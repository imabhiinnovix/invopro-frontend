// // import { Box } from "@mui/material";
// // import { Outlet } from "react-router-dom";
// // import SideNav from "../../atom/sideNav/sideNav";
// // import { STYLE_GUIDE } from "../../../styles";

// // const CommonLayout = () => {
// //   return (
// //     <Box
// //       sx={{
// //         display: "flex",
// //         width: "100%",
// //         height: "100vh",
// //         backgroundColor: STYLE_GUIDE.COLORS.backgroundLight,
// //         overflow: "hidden",
// //         position: "fixed", // Fix the main container
// //         top: 0,
// //         left: 0,
// //         right: 0,
// //         bottom: 0,
// //       }}
// //     >
// //       <Box
// //         // sx={{
// //         //   height: "100%",
// //         //   backgroundColor: STYLE_GUIDE.COLORS.white,
// //         //   boxShadow: `1px 0px 10px ${STYLE_GUIDE.COLORS.blackBorderPrimary}`,
// //         // }}
// //         sx={{
// //     height: "100%",
// //     width: "250px", // sidebar की fixed width (optional)
// //     backgroundColor: STYLE_GUIDE.COLORS.white,
// //     boxShadow: `1px 0px 10px ${STYLE_GUIDE.COLORS.blackBorderPrimary}`,
// //     overflowY: "auto",
// //     overflowX: "hidden",
// //     "&::-webkit-scrollbar": {
// //       width: "6px",
// //     },
// //     "&::-webkit-scrollbar-thumb": {
// //       backgroundColor: STYLE_GUIDE.COLORS.coolBlue,
// //       borderRadius: STYLE_GUIDE.SPACING.s1,
// //     },
// //     "&::-webkit-scrollbar-track": {
// //       backgroundColor: "transparent",
// //     },
// //   }}
// //       >
// //         <SideNav />
// //       </Box>
// //       <Box
// //         sx={{
// //           flex: 1,
// //           height: "calc(100% - 48px)",
// //           p: STYLE_GUIDE.SPACING.s3,
// //           overflowY: "auto",
// //           overflowX: "hidden",
// //           "&::-webkit-scrollbar": {
// //             width: "8px",
// //             backgroundColor: "transparent",
// //           },
// //           "&::-webkit-scrollbar-thumb": {
// //             backgroundColor: STYLE_GUIDE.COLORS.coolBlue,
// //             borderRadius: STYLE_GUIDE.SPACING.s1,
// //           },
// //           "&::-webkit-scrollbar-track": {
// //             backgroundColor: "transparent",
// //           },
// //         }}
// //       >
// //         <Outlet />
// //       </Box>
// //     </Box>
// //   );
// // };

// // export default CommonLayout;

// // CommonLayout.jsx
// import { Box } from "@mui/material";
// import { Outlet } from "react-router-dom";
// import SideNav from "../../atom/sideNav/sideNav";
// import { STYLE_GUIDE } from "../../../styles";

// const CommonLayout = () => {
//   return (
//     <Box
//       sx={{
//         display: "flex",
//         width: "100%",
//         height: "100vh",
//         backgroundColor: STYLE_GUIDE.COLORS.backgroundLight,
//         overflow: "hidden",
//         position: "fixed",
//         top: 0,
//         left: 0,
//         right: 0,
//         bottom: 0,
//       }}
//     >
//       {/* Sidebar Container */}
//       <Box
//         sx={{
//           height: "100%",
//           backgroundColor: STYLE_GUIDE.COLORS.white,
//           boxShadow: `1px 0px 10px ${STYLE_GUIDE.COLORS.blackBorderPrimary}`,
//           overflowY: "auto", // Enable vertical scrolling
//           overflowX: "hidden", // Hide horizontal scrollbar
//           width: "250px", // Fixed width for sidebar
//           // Persistent scrollbar styling
//           "&::-webkit-scrollbar": {
//             width: "8px",
//           },
//           "&::-webkit-scrollbar-thumb": {
//             backgroundColor: STYLE_GUIDE.COLORS.coolBlue,
//             borderRadius: STYLE_GUIDE.SPACING.s1,
//           },
//           "&::-webkit-scrollbar-track": {
//             backgroundColor: "transparent",
//           },
//           // Ensure scrollbar is always visible
//           scrollbarWidth: "thin", // Firefox
//           scrollbarColor: `${STYLE_GUIDE.COLORS.coolBlue} transparent`, // Firefox
//         }}
//       >
//         <SideNav />
//       </Box>

//       {/* Main Content Area */}
//       <Box
//         sx={{
//           flex: 1,
//           height: "100%",
//           p: STYLE_GUIDE.SPACING.s3,
//           overflowY: "auto",
//           overflowX: "hidden",
//           "&::-webkit-scrollbar": {
//             width: "8px",
//           },
//           "&::-webkit-scrollbar-thumb": {
//             backgroundColor: STYLE_GUIDE.COLORS.coolBlue,
//             borderRadius: STYLE_GUIDE.SPACING.s1,
//           },
//           "&::-webkit-scrollbar-track": {
//             backgroundColor: "transparent",
//           },
//         }}
//       >
//         <Outlet />
//       </Box>
//     </Box>
//   );
// };

// export default CommonLayout;

// CommonLayout.jsx
import { Box, Stack } from "@mui/material";
import { Outlet } from "react-router-dom";
import SideNav from "../../atom/sideNav/sideNav";
import { STYLE_GUIDE } from "../../../styles";
import Header from "../header";

const CommonLayout = () => {
  return (
    <Stack>
      <Header />
      <Stack flexDirection="row" height="calc(100vh - 70px)">
        <SideNav />
        <Box
          sx={{
            flex: 1,
            height: "100%",
            // Responsive: use array [xs, sm, md, lg, xl] or object { xs: ..., sm: ..., md: ... }
            p: {
              xs: STYLE_GUIDE.SPACING.s4,
              sm: STYLE_GUIDE.SPACING.s6,
              md: STYLE_GUIDE.SPACING.s8,
              lg: STYLE_GUIDE.SPACING.s14,
            },
            overflowY: "auto",
            overflowX: "hidden",
            backgroundColor: STYLE_GUIDE.COLORS.inputFieldBackground,
          }}
          id="main-screen-content"
        >
          <Outlet />
        </Box>
      </Stack>
    </Stack>
  );
};
const CommonLayoutOld = () => {
  return (
    <Box
      sx={{
        display: "flex",
        width: "100%",
        height: "100vh",
        backgroundColor: STYLE_GUIDE.COLORS.backgroundLight,
        overflow: "hidden",
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
      }}
    >
      {/* Sidebar Container */}
      <Box
        sx={{
          height: "100%",
          width: "250px",
          backgroundColor: STYLE_GUIDE.COLORS.white,
          boxShadow: `1px 0px 10px ${STYLE_GUIDE.COLORS.blackBorderPrimary}`,
          display: "flex",
          flexDirection: "column",
          // overflow: "hidden", // Prevent container from scrolling
        }}
      >
        <SideNav />
      </Box>

      {/* Main Content Area */}
      <Box
        sx={{
          flex: 1,
          height: "100%",
          p: STYLE_GUIDE.SPACING.s3,
          overflowY: "auto",
          overflowX: "hidden",
          "&::-webkit-scrollbar": {
            width: "8px",
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
