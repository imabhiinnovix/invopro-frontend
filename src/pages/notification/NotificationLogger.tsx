// import * as React from "react";
// import { useState, useEffect } from "react";
// import { DataGrid, GridColDef } from "@mui/x-data-grid";
// import NotificationsIcon from "@mui/icons-material/Notifications";
// import ForwardToInboxIcon from "@mui/icons-material/ForwardToInbox";

// import {
//   Box,
//   Card,
//   CardContent,
//   Typography,
//   TextField,
//   Button,
//   InputAdornment,
//   Modal,
//   Tooltip,
//   Chip,
//   Grid,
//   Paper,
//   Divider,
//   CircularProgress,
// } from "@mui/material";
// import SearchIcon from "@mui/icons-material/Search";
// import VisibilityIcon from "@mui/icons-material/Visibility";
// import CloseIcon from "@mui/icons-material/Close";
// import { useUnifiedTheme } from "../../hooks/useUnifiedTheme";
// import useGet from "../../hooks/useGet";
// import { CustomPagination } from "../../components/common/pagination/customPagination";
// import { GET, POST } from "../../services/apiRoutes";
// import { toast } from "react-toastify";
// import { STYLE_GUIDE } from "../../styles";
// import { useComponentTypography } from "../../hooks";
// import { formatDate, formatDateUTC } from "../../utils/utils";
// import parse from "html-react-parser";
// import usePost from "../../hooks/usePost";
// import CommonPageHeader from "../../components/atom/commonPageHeader";
// import PrimaryButton from "../../components/common/PrimaryButton";
// import SearchField from "../../components/common/SearchField";
// import DialogContainer from "../../components/molecule/dialog";

// interface NotificationLog {
//   _id: string;
//   organizationId: string;
//   notificationTypeId: {
//     _id: string;
//     name: string;
//   };
//   frequencySettingId: {
//     frequency: string;
//     triggerTime: string;
//   };
//   templateId: {
//     subject: string;
//     body: string;
//   };
//   mediumSettingId: {
//     medium: string;
//   };
//   scheduledAt: string;
//   notificationTriggerId: {
//     source: string;
//     isDryRun: boolean;
//   };
//   status: string;
//   sentAt: string;
//   payload: Record<string, any>;
//   recipients: {
//     recipient_to: string[];
//     recipient_cc: string[];
//   };
//   alert_content: string;
//   createdAt: string;
// }

// interface ApiResponse {
//   success: boolean;
//   data: NotificationLog[];
//   pagination: {
//     page: number;
//     limit: number;
//     totalPages: number;
//     totalRecords: number;
//   };
// }

// const columns: GridColDef[] = [
//   {
//     field: "notificationTypeId",
//     headerName: "Notification Name",
//     width: 250,
//     disableColumnMenu: true,
//     resizable: true,
//     renderCell: (params) => params.row?.notificationTypeId?.name || "",
//   },
//   {
//     field: "templateId",
//     headerName: "Notification Type",
//     width: 200,
//     disableColumnMenu: true,
//     resizable: true,
//     renderCell: (params) => params.row?.templateId?.type || "",
//   },
//   {
//     field: "subject",
//     headerName: "Subject",
//     width: 250,
//     disableColumnMenu: true,
//     resizable: true,
//     renderCell: (params) => params.row?.subject || "-",
//   },

//   {
//     field: "sentAt",
//     headerName: "Sent At",
//     width: 200,
//     disableColumnMenu: true,
//     resizable: true,
//     renderCell: (params) => formatDateUTC(params.row.sentAt),
//   },

//   {
//     field: "status",
//     headerName: "Processing Status",
//     width: 200,
//     disableColumnMenu: true,
//     resizable: true,
//     renderCell: (params) => {
//       const value = (params.value || "Unknown").toLowerCase();
//       const label = value.charAt(0).toUpperCase() + value.slice(1);

//       let color: "success" | "warning" | "error" = "error";

//       if (value === "sent") {
//         color = "success";
//       } else if (
//         value === "pending" ||
//         value === "processing" ||
//         value === "acknowledged"
//       ) {
//         color = "warning";
//       } else if (value === "cancelled" || value === "failed") {
//         color = "error";
//       }

//       return (
//         <Chip label={label} size="small" color={color} variant="outlined" />
//       );
//     },
//   },
//   {
//     field: "createdAt",
//     headerName: "Created At",
//     width: 250,
//     disableColumnMenu: true,
//     resizable: true,
//     renderCell: (params) => formatDateUTC(params.row.createdAt),
//   },
//   {
//     field: "notificationTriggerId",
//     headerName: "Is Dry Run",
//     width: 250,
//     disableColumnMenu: true,
//     resizable: true,
//     renderCell: (params) => (
//       <Chip
//         label={params.row.notificationTriggerId?.isDryRun ? "Yes" : "No"}
//         size="small"
//         color={
//           params.row.notificationTriggerId?.isDryRun ? "warning" : "success"
//         }
//         variant="outlined"
//       />
//     ),
//   },
//   {
//     field: "actions",
//     headerName: "Actions",
//     width: 250,
//     disableColumnMenu: true,
//     sortable: false,
//     resizable: false,
//     renderCell: (params) => (
//       <Box sx={{ display: "flex", gap: STYLE_GUIDE.SPACING.s2 }}>
//         <Tooltip title="View" arrow>
//           <Button
//             variant="text"
//             onClick={() => params.row.handleView(params.row)}
//             sx={{ minWidth: "auto" }}
//           >
//             <VisibilityIcon />
//           </Button>
//         </Tooltip>
//         <Tooltip title="Resend Now" arrow>
//           <Button
//             variant="text"
//             onClick={() => params.row.handleResendNow(params.row)}
//             sx={{ minWidth: "auto" }}
//           >
//             <ForwardToInboxIcon />
//           </Button>
//         </Tooltip>
//       </Box>
//     ),
//   },
// ];

// export default function NotificationLogger() {
//   const theme = useUnifiedTheme();
//   const [searchValue, setSearchValue] = useState("");
//   const [paginationModel, setPaginationModel] = useState({
//     page: 0,
//     pageSize: 10,
//   });
//   const [debouncedSearchValue, setDebouncedSearchValue] = useState(searchValue);
//   const [notificationLogReload, setNotificationLogReload] = useState(false);
//   const triggerNotification = usePost(["triggerNotification"]);
//   const resendNotification = usePost(["resendNotification"]);

//   const [viewModalOpen, setViewModalOpen] = useState(false);
//   const [selectedNotification, setSelectedNotification] =
//     useState<NotificationLog | null>(null);

//   const { getHeadingSx } = useComponentTypography();

//   useEffect(() => {
//     const handler = setTimeout(() => {
//       if (searchValue.length === 0) {
//         setDebouncedSearchValue("");
//       } else if (searchValue.length < 3) {
//         toast.warning("Please enter at least 3 characters");
//         setDebouncedSearchValue("");
//       } else {
//         setDebouncedSearchValue(searchValue);
//       }
//       setPaginationModel((prev) => ({ ...prev, page: 0 }));
//     }, 500);

//     return () => {
//       clearTimeout(handler);
//     };
//   }, [searchValue]);

//   // Handle trigger notification response
//   useEffect(() => {
//     if (triggerNotification.data) {
//       const { success, message } = triggerNotification.data;

//       if (success) {
//         toast.success(
//           message || "prepareTodayNotifications executed successfully"
//         );
//         // Refresh the notification logs after successful trigger
//         setNotificationLogReload((prev) => !prev);
//       } else {
//         toast.error(message || "Failed to trigger notification");
//       }
//     }

//     if (triggerNotification.error) {
//       toast.error("Failed to trigger notification");
//       console.error(
//         "Error triggering notification:",
//         triggerNotification.error
//       );
//     }
//   }, [triggerNotification.data, triggerNotification.error]);

//   const perPageItem = paginationModel.pageSize;
//   const notificationLogList = useGet<ApiResponse>(
//     [
//       "notificationLogList",
//       String(paginationModel.page + 1),
//       String(paginationModel.pageSize),
//       debouncedSearchValue,
//       String(notificationLogReload),
//     ],
//     `${GET.NOTIFICATION_LOG_LIST}?page=${
//       paginationModel.page + 1
//     }&limit=${perPageItem}&search=${encodeURIComponent(debouncedSearchValue)}`,
//     true
//   );

//   useEffect(() => {
//     if (resendNotification.data) {
//       const { success, message } = resendNotification.data;

//       if (success) {
//         toast.success(message || "Notification resent successfully");
//         // Refresh the notification logs after successful resend
//         setNotificationLogReload((prev) => !prev);
//       } else {
//         toast.error(message || "Failed to resend notification");
//       }
//     }

//     if (resendNotification.error) {
//       toast.error("Failed to resend notification");
//       console.error("Error resending notification:", resendNotification.error);
//     }
//   }, [resendNotification.data, resendNotification.error]);
//   useEffect(() => {
//     if (notificationLogList?.data && notificationLogReload) {
//       setNotificationLogReload(false);
//     }
//   }, [notificationLogList, notificationLogReload]);

//     const handleResendNow = (row: NotificationLog) => {
//     resendNotification.mutate({
//       url: POST.RESEND_NOTIFICATION, // Make sure this is defined in your apiRoutes
//       payload: { notificationId: row._id },
//     });
//   };

//   const notificationLogsWithIds =
//     Array.isArray(notificationLogList?.data?.data) &&
//     notificationLogList.data.data.length > 0
//       ? notificationLogList.data.data.map((notificationLog) => ({
//           ...notificationLog,
//           id:
//             notificationLog._id ||
//             `temp-${Math.random().toString(36).substr(2, 9)}`,
//           handleView: (row: NotificationLog) => {
//             setSelectedNotification(row);
//             setViewModalOpen(true);
//           },
//           handleResendNow: handleResendNow,
//         }))
//       : [];

//   const handleViewModalClose = () => {
//     setViewModalOpen(false);
//     setSelectedNotification(null);
//   };

//   const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     setSearchValue(e.target.value);
//     setPaginationModel({ ...paginationModel, page: 0 });
//   };

//   // Function to parse HTML content safely
//   const parseHtmlContent = (html: string) => {
//     if (!html) return null;

//     try {
//       return parse(html);
//     } catch (error) {
//       console.error("Error parsing HTML content:", error);
//       return <div>Error rendering content</div>;
//     }
//   };

//   const handleScheduleTrigger = () => {
//     triggerNotification.mutate({
//       url: POST.TRIGGER_NOTIFICATION,
//       payload: { isForce: "false" },
//     });
//   };

//   return (
//     <Box
//       sx={{
//         p: STYLE_GUIDE.SPACING.s2,
//       }}
//     >
//       <CommonPageHeader
//         title="Notification Logs"
//         actions={
//           <PrimaryButton
//             variant="contained"
//             disabled={triggerNotification.isLoading}
//             startIcon={
//               triggerNotification.isLoading ? (
//                 <CircularProgress size={20} color="inherit" />
//               ) : (
//                 <NotificationsIcon />
//               )
//             }
//             onClick={handleScheduleTrigger}
//           >
//             {triggerNotification.isLoading
//               ? "Triggering..."
//               : "Trigger Notification"}
//           </PrimaryButton>
//         }
//       />
//       <Card sx={{ borderRadius: "8px", overflow: "visible" }}>
//         <CardContent sx={{ p: STYLE_GUIDE.SPACING.s3 }}>
//           <Box
//             sx={{
//               display: "flex",
//               justifyContent: "space-between",
//               alignItems: "center",
//               mb: STYLE_GUIDE.SPACING.s3,
//             }}
//           >
//             {/* Left: Search */}
//             <SearchField
//               searchValue={searchValue}
//               handleSearchChange={handleSearchChange}
//             />

//             {/* Right: Schedule Trigger button */}
//             {/* <Button
//               variant="contained"
//               color="primary"
//               onClick={handleScheduleTrigger}
//               disabled={triggerNotification.isLoading}
//               sx={{ borderRadius: STYLE_GUIDE.SPACING.s3 }}
//               startIcon={
//                 triggerNotification.isLoading ? (
//                   <CircularProgress size={20} color="inherit" />
//                 ) : (
//                   <NotificationsIcon />
//                 )
//               }
//             >
//               {triggerNotification.isLoading
//                 ? "Triggering..."
//                 : "Trigger Notification"}
//             </Button> */}
//           </Box>

//           <DataGrid
//             sx={{ height: "calc(100vh - 280px)" }}
//             rows={notificationLogsWithIds}
//             columns={columns}
//             initialState={{ pagination: { paginationModel } }}
//             disableColumnMenu
//             paginationMode="server"
//             // sx={{
//             //   overflow: "visible",
//             //   fontFamily: STYLE_GUIDE.TYPOGRAPHY.fontFamily.primary,
//             //   fontSize: STYLE_GUIDE.TYPOGRAPHY.fontSize.base,
//             // }}
//             loading={notificationLogList.isLoading}
//             rowCount={notificationLogList?.data?.pagination.totalRecords || 0}
//             paginationModel={paginationModel}
//             slots={{
//               pagination: () => (
//                 <CustomPagination
//                   paginationModel={paginationModel}
//                   setPaginationModel={setPaginationModel}
//                   rowCount={
//                     notificationLogList?.data?.pagination.totalRecords || 0
//                   }
//                 />
//               ),
//             }}
//           />
//         </CardContent>
//       </Card>

//       {/* View Modal */}
//       {/* <Modal
//         open={viewModalOpen}
//         onClose={handleViewModalClose}
//         sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}
//       >
//         <Box
//           sx={{
//             backgroundColor: STYLE_GUIDE.COLORS.white,
//             borderRadius: STYLE_GUIDE.SPACING.s1,
//             boxShadow: STYLE_GUIDE.SHADOWS.modal,
//             p: STYLE_GUIDE.SPACING.s3,
//             width: "900px",
//             maxWidth: "90%",
//             maxHeight: "85vh",
//             overflowY: "auto",
//             fontFamily: STYLE_GUIDE.TYPOGRAPHY.fontFamily.primary,
//           }}
//         >
//           <Box
//             sx={{
//               display: "flex",
//               justifyContent: "space-between",
//               alignItems: "center",
//               mb: STYLE_GUIDE.SPACING.s3,
//             }}
//           >
//             <Typography
//               variant="h6"
//               sx={{
//                 fontFamily: STYLE_GUIDE.TYPOGRAPHY.fontFamily.primary,
//                 fontWeight: STYLE_GUIDE.TYPOGRAPHY.fontWeight.semiBold,
//                 color: STYLE_GUIDE.COLORS.textPrimary,
//               }}
//             >
//               Notification logs Details
//             </Typography>
//             <Button
//               onClick={handleViewModalClose}
//               sx={{
//                 minWidth: "auto",
//                 color: STYLE_GUIDE.COLORS.textSecondary,
//               }}
//             >
//               <CloseIcon />
//             </Button>
//           </Box>
//           {selectedNotification && (
//             <Grid container spacing={STYLE_GUIDE.SPACING.s2}>
//               <Grid item xs={12}>
//                 <Paper
//                   elevation={1}
//                   sx={{
//                     p: STYLE_GUIDE.SPACING.s2,
//                     backgroundColor: STYLE_GUIDE.COLORS.white,
//                     borderRadius: STYLE_GUIDE.SPACING.s1,
//                   }}
//                 >
//                   <Typography
//                     variant="subtitle1"
//                     fontWeight="bold"
//                     mb={STYLE_GUIDE.SPACING.s2}
//                     sx={{
//                       fontFamily: STYLE_GUIDE.TYPOGRAPHY.fontFamily.primary,
//                       fontWeight: STYLE_GUIDE.TYPOGRAPHY.fontWeight.semiBold,
//                       color: STYLE_GUIDE.COLORS.textPrimary,
//                     }}
//                   >
//                     Basic Information
//                   </Typography>
//                   <Divider sx={{ mb: STYLE_GUIDE.SPACING.s2 }} />

//                   <Grid container spacing={STYLE_GUIDE.SPACING.s1}>
//                     <Grid item xs={4}>
//                       <Typography
//                         variant="body2"
//                         color="textSecondary"
//                         sx={{
//                           fontFamily: STYLE_GUIDE.TYPOGRAPHY.fontFamily.primary,
//                           fontSize: STYLE_GUIDE.TYPOGRAPHY.fontSize.small,
//                           color: STYLE_GUIDE.COLORS.textSecondary,
//                         }}
//                       >
//                         Trigger date:
//                       </Typography>
//                     </Grid>
//                     <Grid item xs={8}>
//                       <Typography
//                         variant="body2"
//                         sx={{
//                           fontFamily: STYLE_GUIDE.TYPOGRAPHY.fontFamily.primary,
//                           fontSize: STYLE_GUIDE.TYPOGRAPHY.fontSize.small,
//                           color: STYLE_GUIDE.COLORS.textPrimary,
//                         }}
//                       >
//                         {formatDate(selectedNotification.scheduledAt)}
//                       </Typography>
//                     </Grid>

//                     <Grid item xs={4}>
//                       <Typography
//                         variant="body2"
//                         color="textSecondary"
//                         sx={{
//                           fontFamily: STYLE_GUIDE.TYPOGRAPHY.fontFamily.primary,
//                           fontSize: STYLE_GUIDE.TYPOGRAPHY.fontSize.small,
//                           color: STYLE_GUIDE.COLORS.textSecondary,
//                         }}
//                       >
//                         Is dry run:
//                       </Typography>
//                     </Grid>
//                     <Grid item xs={8}>
//                       <Typography
//                         variant="body2"
//                         sx={{
//                           fontFamily: STYLE_GUIDE.TYPOGRAPHY.fontFamily.primary,
//                           fontSize: STYLE_GUIDE.TYPOGRAPHY.fontSize.small,
//                           color: STYLE_GUIDE.COLORS.textPrimary,
//                         }}
//                       >
//                         {selectedNotification.notificationTriggerId?.isDryRun
//                           ? "Yes"
//                           : "No"}
//                       </Typography>
//                     </Grid>

//                     <Grid item xs={4}>
//                       <Typography
//                         variant="body2"
//                         color="textSecondary"
//                         sx={{
//                           fontFamily: STYLE_GUIDE.TYPOGRAPHY.fontFamily.primary,
//                           fontSize: STYLE_GUIDE.TYPOGRAPHY.fontSize.small,
//                           color: STYLE_GUIDE.COLORS.textSecondary,
//                         }}
//                       >
//                         Acknowledge:
//                       </Typography>
//                     </Grid>
//                     <Grid item xs={8}>
//                       <Typography
//                         variant="body2"
//                         sx={{
//                           fontFamily: STYLE_GUIDE.TYPOGRAPHY.fontFamily.primary,
//                           fontSize: STYLE_GUIDE.TYPOGRAPHY.fontSize.small,
//                           color: STYLE_GUIDE.COLORS.textPrimary,
//                         }}
//                       >
//                         -
//                       </Typography>
//                     </Grid>

//                     <Grid item xs={4}>
//                       <Typography
//                         variant="body2"
//                         color="textSecondary"
//                         sx={{
//                           fontFamily: STYLE_GUIDE.TYPOGRAPHY.fontFamily.primary,
//                           fontSize: STYLE_GUIDE.TYPOGRAPHY.fontSize.small,
//                           color: STYLE_GUIDE.COLORS.textSecondary,
//                         }}
//                       >
//                         Is acknowledged:
//                       </Typography>
//                     </Grid>
//                     <Grid item xs={8}>
//                       <Typography
//                         variant="body2"
//                         sx={{
//                           fontFamily: STYLE_GUIDE.TYPOGRAPHY.fontFamily.primary,
//                           fontSize: STYLE_GUIDE.TYPOGRAPHY.fontSize.small,
//                           color: STYLE_GUIDE.COLORS.textPrimary,
//                         }}
//                       >
//                         No
//                       </Typography>
//                     </Grid>

//                     <Grid item xs={4}>
//                       <Typography
//                         variant="body2"
//                         color="textSecondary"
//                         sx={{
//                           fontFamily: STYLE_GUIDE.TYPOGRAPHY.fontFamily.primary,
//                           fontSize: STYLE_GUIDE.TYPOGRAPHY.fontSize.small,
//                           color: STYLE_GUIDE.COLORS.textSecondary,
//                         }}
//                       >
//                         Is due date passed:
//                       </Typography>
//                     </Grid>
//                     <Grid item xs={8}>
//                       <Typography
//                         variant="body2"
//                         sx={{
//                           fontFamily: STYLE_GUIDE.TYPOGRAPHY.fontFamily.primary,
//                           fontSize: STYLE_GUIDE.TYPOGRAPHY.fontSize.small,
//                           color: STYLE_GUIDE.COLORS.textPrimary,
//                         }}
//                       >
//                         No
//                       </Typography>
//                     </Grid>

//                     <Grid item xs={4}>
//                       <Typography
//                         variant="body2"
//                         color="textSecondary"
//                         sx={{
//                           fontFamily: STYLE_GUIDE.TYPOGRAPHY.fontFamily.primary,
//                           fontSize: STYLE_GUIDE.TYPOGRAPHY.fontSize.small,
//                           color: STYLE_GUIDE.COLORS.textSecondary,
//                         }}
//                       >
//                         Report category:
//                       </Typography>
//                     </Grid>
//                     <Grid item xs={8}>
//                       <Typography
//                         variant="body2"
//                         sx={{
//                           fontFamily: STYLE_GUIDE.TYPOGRAPHY.fontFamily.primary,
//                           fontSize: STYLE_GUIDE.TYPOGRAPHY.fontSize.small,
//                           color: STYLE_GUIDE.COLORS.textPrimary,
//                         }}
//                       >
//                         -
//                       </Typography>
//                     </Grid>

//                     <Grid item xs={4}>
//                       <Typography
//                         variant="body2"
//                         color="textSecondary"
//                         sx={{
//                           fontFamily: STYLE_GUIDE.TYPOGRAPHY.fontFamily.primary,
//                           fontSize: STYLE_GUIDE.TYPOGRAPHY.fontSize.small,
//                           color: STYLE_GUIDE.COLORS.textSecondary,
//                         }}
//                       >
//                         Is active:
//                       </Typography>
//                     </Grid>
//                     <Grid item xs={8}>
//                       <Typography
//                         variant="body2"
//                         sx={{
//                           fontFamily: STYLE_GUIDE.TYPOGRAPHY.fontFamily.primary,
//                           fontSize: STYLE_GUIDE.TYPOGRAPHY.fontSize.small,
//                           color: STYLE_GUIDE.COLORS.textPrimary,
//                         }}
//                       >
//                         Yes
//                       </Typography>
//                     </Grid>

//                     <Grid item xs={4}>
//                       <Typography
//                         variant="body2"
//                         color="textSecondary"
//                         sx={{
//                           fontFamily: STYLE_GUIDE.TYPOGRAPHY.fontFamily.primary,
//                           fontSize: STYLE_GUIDE.TYPOGRAPHY.fontSize.small,
//                           color: STYLE_GUIDE.COLORS.textSecondary,
//                         }}
//                       >
//                         Created:
//                       </Typography>
//                     </Grid>
//                     <Grid item xs={8}>
//                       <Typography
//                         variant="body2"
//                         sx={{
//                           fontFamily: STYLE_GUIDE.TYPOGRAPHY.fontFamily.primary,
//                           fontSize: STYLE_GUIDE.TYPOGRAPHY.fontSize.small,
//                           color: STYLE_GUIDE.COLORS.textPrimary,
//                         }}
//                       >
//                         {formatDate(selectedNotification.createdAt)}
//                       </Typography>
//                     </Grid>

//                     <Grid item xs={4}>
//                       <Typography
//                         variant="body2"
//                         color="textSecondary"
//                         sx={{
//                           fontFamily: STYLE_GUIDE.TYPOGRAPHY.fontFamily.primary,
//                           fontSize: STYLE_GUIDE.TYPOGRAPHY.fontSize.small,
//                           color: STYLE_GUIDE.COLORS.textSecondary,
//                         }}
//                       >
//                         Notification type:
//                       </Typography>
//                     </Grid>
//                     <Grid item xs={8}>
//                       <Typography
//                         variant="body2"
//                         sx={{
//                           fontFamily: STYLE_GUIDE.TYPOGRAPHY.fontFamily.primary,
//                           fontSize: STYLE_GUIDE.TYPOGRAPHY.fontSize.small,
//                           color: STYLE_GUIDE.COLORS.textPrimary,
//                         }}
//                       >
//                         {selectedNotification.notificationTypeId?.name ||
//                           "overall"}
//                       </Typography>
//                     </Grid>

//                     <Grid item xs={4}>
//                       <Typography
//                         variant="body2"
//                         color="textSecondary"
//                         sx={{
//                           fontFamily: STYLE_GUIDE.TYPOGRAPHY.fontFamily.primary,
//                           fontSize: STYLE_GUIDE.TYPOGRAPHY.fontSize.small,
//                           color: STYLE_GUIDE.COLORS.textSecondary,
//                         }}
//                       >
//                         Processing status:
//                       </Typography>
//                     </Grid>
//                     <Grid item xs={8}>
//                       <Chip
//                         label={selectedNotification.status || "Unknown"}
//                         size="small"
//                         color={
//                           selectedNotification.status === "sent"
//                             ? "success"
//                             : selectedNotification.status === "pending"
//                             ? "warning"
//                             : "error"
//                         }
//                         variant="outlined"
//                       />
//                     </Grid>

//                     <Grid item xs={4}>
//                       <Typography
//                         variant="body2"
//                         color="textSecondary"
//                         sx={{
//                           fontFamily: STYLE_GUIDE.TYPOGRAPHY.fontFamily.primary,
//                           fontSize: STYLE_GUIDE.TYPOGRAPHY.fontSize.small,
//                           color: STYLE_GUIDE.COLORS.textSecondary,
//                         }}
//                       >
//                         Notification medium:
//                       </Typography>
//                     </Grid>
//                     <Grid item xs={8}>
//                       <Typography
//                         variant="body2"
//                         sx={{
//                           fontFamily: STYLE_GUIDE.TYPOGRAPHY.fontFamily.primary,
//                           fontSize: STYLE_GUIDE.TYPOGRAPHY.fontSize.small,
//                           color: STYLE_GUIDE.COLORS.textPrimary,
//                         }}
//                       >
//                         {selectedNotification.mediumSettingId?.medium ||
//                           "email"}
//                       </Typography>
//                     </Grid>
//                   </Grid>
//                 </Paper>
//               </Grid>

//               <Grid item xs={12}>
//                 <Paper
//                   elevation={1}
//                   sx={{
//                     p: STYLE_GUIDE.SPACING.s2,
//                     backgroundColor: STYLE_GUIDE.COLORS.white,
//                     borderRadius: STYLE_GUIDE.SPACING.s1,
//                   }}
//                 >
//                   <Typography
//                     variant="subtitle1"
//                     fontWeight="bold"
//                     mb={STYLE_GUIDE.SPACING.s2}
//                     sx={{
//                       fontFamily: STYLE_GUIDE.TYPOGRAPHY.fontFamily.primary,
//                       fontWeight: STYLE_GUIDE.TYPOGRAPHY.fontWeight.semiBold,
//                       color: STYLE_GUIDE.COLORS.textPrimary,
//                     }}
//                   >
//                     Recipients
//                   </Typography>
//                   <Divider sx={{ mb: STYLE_GUIDE.SPACING.s2 }} />

//                   <Grid container spacing={STYLE_GUIDE.SPACING.s1}>
//                     <Grid item xs={4}>
//                       <Typography
//                         variant="body2"
//                         color="textSecondary"
//                         sx={{
//                           fontFamily: STYLE_GUIDE.TYPOGRAPHY.fontFamily.primary,
//                           fontSize: STYLE_GUIDE.TYPOGRAPHY.fontSize.small,
//                           color: STYLE_GUIDE.COLORS.textSecondary,
//                         }}
//                       >
//                         To:
//                       </Typography>
//                     </Grid>
//                     <Grid item xs={8}>
//                       <Typography
//                         variant="body2"
//                         sx={{
//                           fontFamily: STYLE_GUIDE.TYPOGRAPHY.fontFamily.primary,
//                           fontSize: STYLE_GUIDE.TYPOGRAPHY.fontSize.small,
//                           color: STYLE_GUIDE.COLORS.textPrimary,
//                         }}
//                       >
//                         {selectedNotification.recipients?.recipient_to?.join(
//                           ", "
//                         ) || "No recipients"}
//                       </Typography>
//                     </Grid>

//                     <Grid item xs={4}>
//                       <Typography
//                         variant="body2"
//                         color="textSecondary"
//                         sx={{
//                           fontFamily: STYLE_GUIDE.TYPOGRAPHY.fontFamily.primary,
//                           fontSize: STYLE_GUIDE.TYPOGRAPHY.fontSize.small,
//                           color: STYLE_GUIDE.COLORS.textSecondary,
//                         }}
//                       >
//                         Cc:
//                       </Typography>
//                     </Grid>
//                     <Grid item xs={8}>
//                       <Typography
//                         variant="body2"
//                         sx={{
//                           fontFamily: STYLE_GUIDE.TYPOGRAPHY.fontFamily.primary,
//                           fontSize: STYLE_GUIDE.TYPOGRAPHY.fontSize.small,
//                           color: STYLE_GUIDE.COLORS.textPrimary,
//                         }}
//                       >
//                         {selectedNotification.recipients?.recipient_cc?.join(
//                           ", "
//                         ) || "No CC recipients"}
//                       </Typography>
//                     </Grid>
//                   </Grid>
//                 </Paper>
//               </Grid>

//               <Grid item xs={12}>
//                 <Paper
//                   elevation={1}
//                   sx={{
//                     p: STYLE_GUIDE.SPACING.s2,
//                     backgroundColor: STYLE_GUIDE.COLORS.white,
//                     borderRadius: STYLE_GUIDE.SPACING.s1,
//                   }}
//                 >
//                   <Typography
//                     variant="subtitle1"
//                     fontWeight="bold"
//                     mb={STYLE_GUIDE.SPACING.s2}
//                     sx={{
//                       fontFamily: STYLE_GUIDE.TYPOGRAPHY.fontFamily.primary,
//                       fontWeight: STYLE_GUIDE.TYPOGRAPHY.fontWeight.semiBold,
//                       color: STYLE_GUIDE.COLORS.textPrimary,
//                     }}
//                   >
//                     Email Content
//                   </Typography>
//                   <Divider sx={{ mb: STYLE_GUIDE.SPACING.s2 }} />

//                   <Grid container spacing={STYLE_GUIDE.SPACING.s1}>
//                     <Grid item xs={4}>
//                       <Typography
//                         variant="body2"
//                         color="textSecondary"
//                         sx={{
//                           fontFamily: STYLE_GUIDE.TYPOGRAPHY.fontFamily.primary,
//                           fontSize: STYLE_GUIDE.TYPOGRAPHY.fontSize.small,
//                           color: STYLE_GUIDE.COLORS.textSecondary,
//                         }}
//                       >
//                         Subject:
//                       </Typography>
//                     </Grid>
//                     <Grid item xs={8}>
//                       <Typography
//                         variant="body2"
//                         sx={{
//                           fontFamily: STYLE_GUIDE.TYPOGRAPHY.fontFamily.primary,
//                           fontSize: STYLE_GUIDE.TYPOGRAPHY.fontSize.small,
//                           color: STYLE_GUIDE.COLORS.textPrimary,
//                         }}
//                       >
//                         {selectedNotification?.subject || "No subject"}
//                       </Typography>
//                     </Grid>

//                     <Grid item xs={12}>
//                       <Typography
//                         variant="body2"
//                         color="textSecondary"
//                         sx={{
//                           fontFamily: STYLE_GUIDE.TYPOGRAPHY.fontFamily.primary,
//                           fontSize: STYLE_GUIDE.TYPOGRAPHY.fontSize.small,
//                           color: STYLE_GUIDE.COLORS.textSecondary,
//                         }}
//                       >
//                         Alert Content:
//                       </Typography>
//                     </Grid>
//                     <Grid item xs={12}>
//                       <Box
//                         sx={{
//                           border: `1px solid ${STYLE_GUIDE.COLORS.divider}`,
//                           borderRadius: STYLE_GUIDE.SPACING.s1,
//                           p: STYLE_GUIDE.SPACING.s2,
//                           maxHeight: "400px",
//                           overflowY: "auto",
//                           backgroundColor: STYLE_GUIDE.COLORS.backgroundLight,
//                           fontFamily: STYLE_GUIDE.TYPOGRAPHY.fontFamily.primary,
//                           fontSize: STYLE_GUIDE.TYPOGRAPHY.fontSize.small,
//                         }}
//                       >
//                         {parseHtmlContent(selectedNotification.alert_content)}
//                       </Box>
//                     </Grid>
//                   </Grid>
//                 </Paper>
//               </Grid>

//               <Grid item xs={12}>
//                 <Paper
//                   elevation={1}
//                   sx={{
//                     p: STYLE_GUIDE.SPACING.s2,
//                     backgroundColor: STYLE_GUIDE.COLORS.white,
//                     borderRadius: STYLE_GUIDE.SPACING.s1,
//                   }}
//                 >
//                   <Typography
//                     variant="subtitle1"
//                     fontWeight="bold"
//                     mb={STYLE_GUIDE.SPACING.s2}
//                     sx={{
//                       fontFamily: STYLE_GUIDE.TYPOGRAPHY.fontFamily.primary,
//                       fontWeight: STYLE_GUIDE.TYPOGRAPHY.fontWeight.semiBold,
//                       color: STYLE_GUIDE.COLORS.textPrimary,
//                     }}
//                   >
//                     Additional Information
//                   </Typography>
//                   <Divider sx={{ mb: STYLE_GUIDE.SPACING.s2 }} />

//                   <Grid container spacing={STYLE_GUIDE.SPACING.s1}>
//                     <Grid item xs={4}>
//                       <Typography
//                         variant="body2"
//                         color="textSecondary"
//                         sx={{
//                           fontFamily: STYLE_GUIDE.TYPOGRAPHY.fontFamily.primary,
//                           fontSize: STYLE_GUIDE.TYPOGRAPHY.fontSize.small,
//                           color: STYLE_GUIDE.COLORS.textSecondary,
//                         }}
//                       >
//                         File attached:
//                       </Typography>
//                     </Grid>
//                     <Grid item xs={8}>
//                       <Typography
//                         variant="body2"
//                         sx={{
//                           fontFamily: STYLE_GUIDE.TYPOGRAPHY.fontFamily.primary,
//                           fontSize: STYLE_GUIDE.TYPOGRAPHY.fontSize.small,
//                           color: STYLE_GUIDE.COLORS.textPrimary,
//                         }}
//                       >
//                         -
//                       </Typography>
//                     </Grid>
//                   </Grid>
//                 </Paper>
//               </Grid>
//             </Grid>
//           )}
//           <Box
//             sx={{
//               display: "flex",
//               justifyContent: "flex-end",
//               mt: STYLE_GUIDE.SPACING.s2,
//             }}
//           >
//             <Button
//               variant="outlined"
//               onClick={handleViewModalClose}
//               sx={{
//                 borderRadius: STYLE_GUIDE.SPACING.s1,
//                 borderColor: STYLE_GUIDE.COLORS.divider,
//                 color: STYLE_GUIDE.COLORS.primaryDark,
//                 fontFamily: STYLE_GUIDE.TYPOGRAPHY.fontFamily.primary,
//                 fontWeight: STYLE_GUIDE.TYPOGRAPHY.fontWeight.medium,
//                 "&:hover": {
//                   borderColor: STYLE_GUIDE.COLORS.primary,
//                   backgroundColor: STYLE_GUIDE.COLORS.backgroundHover,
//                 },
//               }}
//             >
//               Cancel
//             </Button>
//           </Box>
//         </Box>
//       </Modal> */}

//       <DialogContainer
//         open={viewModalOpen}
//         onClose={handleViewModalClose}
//         title="Notification logs Details"
//         maxWidth="lg"
//         actions={
//           <PrimaryButton variant="outlined" onClick={handleViewModalClose}>
//             Cancel
//           </PrimaryButton>
//         }
//       >
//         {selectedNotification && (
//           <Grid container spacing={STYLE_GUIDE.SPACING.s2}>
//             <Grid item xs={12}>
//               <Paper
//                 elevation={1}
//                 sx={{
//                   p: STYLE_GUIDE.SPACING.s2,
//                   backgroundColor: STYLE_GUIDE.COLORS.white,
//                   borderRadius: STYLE_GUIDE.SPACING.s1,
//                 }}
//               >
//                 <Typography
//                   variant="subtitle1"
//                   fontWeight="bold"
//                   mb={STYLE_GUIDE.SPACING.s2}
//                   sx={{
//                     fontFamily: STYLE_GUIDE.TYPOGRAPHY.fontFamily.primary,
//                     fontWeight: STYLE_GUIDE.TYPOGRAPHY.fontWeight.semiBold,
//                     color: STYLE_GUIDE.COLORS.textPrimary,
//                   }}
//                 >
//                   Basic Information
//                 </Typography>
//                 <Divider sx={{ mb: STYLE_GUIDE.SPACING.s2 }} />

//                 <Grid container spacing={STYLE_GUIDE.SPACING.s1}>
//                   <Grid item xs={4}>
//                     <Typography
//                       variant="body2"
//                       color="textSecondary"
//                       sx={{
//                         fontFamily: STYLE_GUIDE.TYPOGRAPHY.fontFamily.primary,
//                         fontSize: STYLE_GUIDE.TYPOGRAPHY.fontSize.small,
//                         color: STYLE_GUIDE.COLORS.textSecondary,
//                       }}
//                     >
//                       Trigger date:
//                     </Typography>
//                   </Grid>
//                   <Grid item xs={8}>
//                     <Typography
//                       variant="body2"
//                       sx={{
//                         fontFamily: STYLE_GUIDE.TYPOGRAPHY.fontFamily.primary,
//                         fontSize: STYLE_GUIDE.TYPOGRAPHY.fontSize.small,
//                         color: STYLE_GUIDE.COLORS.textPrimary,
//                       }}
//                     >
//                       {formatDate(selectedNotification.scheduledAt)}
//                     </Typography>
//                   </Grid>

//                   <Grid item xs={4}>
//                     <Typography
//                       variant="body2"
//                       color="textSecondary"
//                       sx={{
//                         fontFamily: STYLE_GUIDE.TYPOGRAPHY.fontFamily.primary,
//                         fontSize: STYLE_GUIDE.TYPOGRAPHY.fontSize.small,
//                         color: STYLE_GUIDE.COLORS.textSecondary,
//                       }}
//                     >
//                       Is dry run:
//                     </Typography>
//                   </Grid>
//                   <Grid item xs={8}>
//                     <Typography
//                       variant="body2"
//                       sx={{
//                         fontFamily: STYLE_GUIDE.TYPOGRAPHY.fontFamily.primary,
//                         fontSize: STYLE_GUIDE.TYPOGRAPHY.fontSize.small,
//                         color: STYLE_GUIDE.COLORS.textPrimary,
//                       }}
//                     >
//                       {selectedNotification.notificationTriggerId?.isDryRun
//                         ? "Yes"
//                         : "No"}
//                     </Typography>
//                   </Grid>

//                   <Grid item xs={4}>
//                     <Typography
//                       variant="body2"
//                       color="textSecondary"
//                       sx={{
//                         fontFamily: STYLE_GUIDE.TYPOGRAPHY.fontFamily.primary,
//                         fontSize: STYLE_GUIDE.TYPOGRAPHY.fontSize.small,
//                         color: STYLE_GUIDE.COLORS.textSecondary,
//                       }}
//                     >
//                       Acknowledge:
//                     </Typography>
//                   </Grid>
//                   <Grid item xs={8}>
//                     <Typography
//                       variant="body2"
//                       sx={{
//                         fontFamily: STYLE_GUIDE.TYPOGRAPHY.fontFamily.primary,
//                         fontSize: STYLE_GUIDE.TYPOGRAPHY.fontSize.small,
//                         color: STYLE_GUIDE.COLORS.textPrimary,
//                       }}
//                     >
//                       -
//                     </Typography>
//                   </Grid>

//                   <Grid item xs={4}>
//                     <Typography
//                       variant="body2"
//                       color="textSecondary"
//                       sx={{
//                         fontFamily: STYLE_GUIDE.TYPOGRAPHY.fontFamily.primary,
//                         fontSize: STYLE_GUIDE.TYPOGRAPHY.fontSize.small,
//                         color: STYLE_GUIDE.COLORS.textSecondary,
//                       }}
//                     >
//                       Is acknowledged:
//                     </Typography>
//                   </Grid>
//                   <Grid item xs={8}>
//                     <Typography
//                       variant="body2"
//                       sx={{
//                         fontFamily: STYLE_GUIDE.TYPOGRAPHY.fontFamily.primary,
//                         fontSize: STYLE_GUIDE.TYPOGRAPHY.fontSize.small,
//                         color: STYLE_GUIDE.COLORS.textPrimary,
//                       }}
//                     >
//                       No
//                     </Typography>
//                   </Grid>

//                   <Grid item xs={4}>
//                     <Typography
//                       variant="body2"
//                       color="textSecondary"
//                       sx={{
//                         fontFamily: STYLE_GUIDE.TYPOGRAPHY.fontFamily.primary,
//                         fontSize: STYLE_GUIDE.TYPOGRAPHY.fontSize.small,
//                         color: STYLE_GUIDE.COLORS.textSecondary,
//                       }}
//                     >
//                       Is due date passed:
//                     </Typography>
//                   </Grid>
//                   <Grid item xs={8}>
//                     <Typography
//                       variant="body2"
//                       sx={{
//                         fontFamily: STYLE_GUIDE.TYPOGRAPHY.fontFamily.primary,
//                         fontSize: STYLE_GUIDE.TYPOGRAPHY.fontSize.small,
//                         color: STYLE_GUIDE.COLORS.textPrimary,
//                       }}
//                     >
//                       No
//                     </Typography>
//                   </Grid>

//                   <Grid item xs={4}>
//                     <Typography
//                       variant="body2"
//                       color="textSecondary"
//                       sx={{
//                         fontFamily: STYLE_GUIDE.TYPOGRAPHY.fontFamily.primary,
//                         fontSize: STYLE_GUIDE.TYPOGRAPHY.fontSize.small,
//                         color: STYLE_GUIDE.COLORS.textSecondary,
//                       }}
//                     >
//                       Report category:
//                     </Typography>
//                   </Grid>
//                   <Grid item xs={8}>
//                     <Typography
//                       variant="body2"
//                       sx={{
//                         fontFamily: STYLE_GUIDE.TYPOGRAPHY.fontFamily.primary,
//                         fontSize: STYLE_GUIDE.TYPOGRAPHY.fontSize.small,
//                         color: STYLE_GUIDE.COLORS.textPrimary,
//                       }}
//                     >
//                       -
//                     </Typography>
//                   </Grid>

//                   <Grid item xs={4}>
//                     <Typography
//                       variant="body2"
//                       color="textSecondary"
//                       sx={{
//                         fontFamily: STYLE_GUIDE.TYPOGRAPHY.fontFamily.primary,
//                         fontSize: STYLE_GUIDE.TYPOGRAPHY.fontSize.small,
//                         color: STYLE_GUIDE.COLORS.textSecondary,
//                       }}
//                     >
//                       Is active:
//                     </Typography>
//                   </Grid>
//                   <Grid item xs={8}>
//                     <Typography
//                       variant="body2"
//                       sx={{
//                         fontFamily: STYLE_GUIDE.TYPOGRAPHY.fontFamily.primary,
//                         fontSize: STYLE_GUIDE.TYPOGRAPHY.fontSize.small,
//                         color: STYLE_GUIDE.COLORS.textPrimary,
//                       }}
//                     >
//                       Yes
//                     </Typography>
//                   </Grid>

//                   <Grid item xs={4}>
//                     <Typography
//                       variant="body2"
//                       color="textSecondary"
//                       sx={{
//                         fontFamily: STYLE_GUIDE.TYPOGRAPHY.fontFamily.primary,
//                         fontSize: STYLE_GUIDE.TYPOGRAPHY.fontSize.small,
//                         color: STYLE_GUIDE.COLORS.textSecondary,
//                       }}
//                     >
//                       Created:
//                     </Typography>
//                   </Grid>
//                   <Grid item xs={8}>
//                     <Typography
//                       variant="body2"
//                       sx={{
//                         fontFamily: STYLE_GUIDE.TYPOGRAPHY.fontFamily.primary,
//                         fontSize: STYLE_GUIDE.TYPOGRAPHY.fontSize.small,
//                         color: STYLE_GUIDE.COLORS.textPrimary,
//                       }}
//                     >
//                       {formatDate(selectedNotification.createdAt)}
//                     </Typography>
//                   </Grid>

//                   <Grid item xs={4}>
//                     <Typography
//                       variant="body2"
//                       color="textSecondary"
//                       sx={{
//                         fontFamily: STYLE_GUIDE.TYPOGRAPHY.fontFamily.primary,
//                         fontSize: STYLE_GUIDE.TYPOGRAPHY.fontSize.small,
//                         color: STYLE_GUIDE.COLORS.textSecondary,
//                       }}
//                     >
//                       Notification type:
//                     </Typography>
//                   </Grid>
//                   <Grid item xs={8}>
//                     <Typography
//                       variant="body2"
//                       sx={{
//                         fontFamily: STYLE_GUIDE.TYPOGRAPHY.fontFamily.primary,
//                         fontSize: STYLE_GUIDE.TYPOGRAPHY.fontSize.small,
//                         color: STYLE_GUIDE.COLORS.textPrimary,
//                       }}
//                     >
//                       {selectedNotification.notificationTypeId?.name ||
//                         "overall"}
//                     </Typography>
//                   </Grid>

//                   <Grid item xs={4}>
//                     <Typography
//                       variant="body2"
//                       color="textSecondary"
//                       sx={{
//                         fontFamily: STYLE_GUIDE.TYPOGRAPHY.fontFamily.primary,
//                         fontSize: STYLE_GUIDE.TYPOGRAPHY.fontSize.small,
//                         color: STYLE_GUIDE.COLORS.textSecondary,
//                       }}
//                     >
//                       Processing status:
//                     </Typography>
//                   </Grid>
//                   <Grid item xs={8}>
//                     <Chip
//                       label={selectedNotification.status || "Unknown"}
//                       size="small"
//                       color={
//                         selectedNotification.status === "sent"
//                           ? "success"
//                           : selectedNotification.status === "pending"
//                             ? "warning"
//                             : "error"
//                       }
//                       variant="outlined"
//                     />
//                   </Grid>

//                   <Grid item xs={4}>
//                     <Typography
//                       variant="body2"
//                       color="textSecondary"
//                       sx={{
//                         fontFamily: STYLE_GUIDE.TYPOGRAPHY.fontFamily.primary,
//                         fontSize: STYLE_GUIDE.TYPOGRAPHY.fontSize.small,
//                         color: STYLE_GUIDE.COLORS.textSecondary,
//                       }}
//                     >
//                       Notification medium:
//                     </Typography>
//                   </Grid>
//                   <Grid item xs={8}>
//                     <Typography
//                       variant="body2"
//                       sx={{
//                         fontFamily: STYLE_GUIDE.TYPOGRAPHY.fontFamily.primary,
//                         fontSize: STYLE_GUIDE.TYPOGRAPHY.fontSize.small,
//                         color: STYLE_GUIDE.COLORS.textPrimary,
//                       }}
//                     >
//                       {selectedNotification.mediumSettingId?.medium || "email"}
//                     </Typography>
//                   </Grid>
//                 </Grid>
//               </Paper>
//             </Grid>

//             <Grid item xs={12}>
//               <Paper
//                 elevation={1}
//                 sx={{
//                   p: STYLE_GUIDE.SPACING.s2,
//                   backgroundColor: STYLE_GUIDE.COLORS.white,
//                   borderRadius: STYLE_GUIDE.SPACING.s1,
//                 }}
//               >
//                 <Typography
//                   variant="subtitle1"
//                   fontWeight="bold"
//                   mb={STYLE_GUIDE.SPACING.s2}
//                   sx={{
//                     fontFamily: STYLE_GUIDE.TYPOGRAPHY.fontFamily.primary,
//                     fontWeight: STYLE_GUIDE.TYPOGRAPHY.fontWeight.semiBold,
//                     color: STYLE_GUIDE.COLORS.textPrimary,
//                   }}
//                 >
//                   Recipients
//                 </Typography>
//                 <Divider sx={{ mb: STYLE_GUIDE.SPACING.s2 }} />

//                 <Grid container spacing={STYLE_GUIDE.SPACING.s1}>
//                   <Grid item xs={4}>
//                     <Typography
//                       variant="body2"
//                       color="textSecondary"
//                       sx={{
//                         fontFamily: STYLE_GUIDE.TYPOGRAPHY.fontFamily.primary,
//                         fontSize: STYLE_GUIDE.TYPOGRAPHY.fontSize.small,
//                         color: STYLE_GUIDE.COLORS.textSecondary,
//                       }}
//                     >
//                       To:
//                     </Typography>
//                   </Grid>
//                   <Grid item xs={8}>
//                     <Typography
//                       variant="body2"
//                       sx={{
//                         fontFamily: STYLE_GUIDE.TYPOGRAPHY.fontFamily.primary,
//                         fontSize: STYLE_GUIDE.TYPOGRAPHY.fontSize.small,
//                         color: STYLE_GUIDE.COLORS.textPrimary,
//                       }}
//                     >
//                       {selectedNotification.recipients?.recipient_to?.join(
//                         ", "
//                       ) || "No recipients"}
//                     </Typography>
//                   </Grid>

//                   <Grid item xs={4}>
//                     <Typography
//                       variant="body2"
//                       color="textSecondary"
//                       sx={{
//                         fontFamily: STYLE_GUIDE.TYPOGRAPHY.fontFamily.primary,
//                         fontSize: STYLE_GUIDE.TYPOGRAPHY.fontSize.small,
//                         color: STYLE_GUIDE.COLORS.textSecondary,
//                       }}
//                     >
//                       Cc:
//                     </Typography>
//                   </Grid>
//                   <Grid item xs={8}>
//                     <Typography
//                       variant="body2"
//                       sx={{
//                         fontFamily: STYLE_GUIDE.TYPOGRAPHY.fontFamily.primary,
//                         fontSize: STYLE_GUIDE.TYPOGRAPHY.fontSize.small,
//                         color: STYLE_GUIDE.COLORS.textPrimary,
//                       }}
//                     >
//                       {selectedNotification.recipients?.recipient_cc?.join(
//                         ", "
//                       ) || "No CC recipients"}
//                     </Typography>
//                   </Grid>
//                 </Grid>
//               </Paper>
//             </Grid>

//             <Grid item xs={12}>
//               <Paper
//                 elevation={1}
//                 sx={{
//                   p: STYLE_GUIDE.SPACING.s2,
//                   backgroundColor: STYLE_GUIDE.COLORS.white,
//                   borderRadius: STYLE_GUIDE.SPACING.s1,
//                 }}
//               >
//                 <Typography
//                   variant="subtitle1"
//                   fontWeight="bold"
//                   mb={STYLE_GUIDE.SPACING.s2}
//                   sx={{
//                     fontFamily: STYLE_GUIDE.TYPOGRAPHY.fontFamily.primary,
//                     fontWeight: STYLE_GUIDE.TYPOGRAPHY.fontWeight.semiBold,
//                     color: STYLE_GUIDE.COLORS.textPrimary,
//                   }}
//                 >
//                   Email Content
//                 </Typography>
//                 <Divider sx={{ mb: STYLE_GUIDE.SPACING.s2 }} />

//                 <Grid container spacing={STYLE_GUIDE.SPACING.s1}>
//                   <Grid item xs={4}>
//                     <Typography
//                       variant="body2"
//                       color="textSecondary"
//                       sx={{
//                         fontFamily: STYLE_GUIDE.TYPOGRAPHY.fontFamily.primary,
//                         fontSize: STYLE_GUIDE.TYPOGRAPHY.fontSize.small,
//                         color: STYLE_GUIDE.COLORS.textSecondary,
//                       }}
//                     >
//                       Subject:
//                     </Typography>
//                   </Grid>
//                   <Grid item xs={8}>
//                     <Typography
//                       variant="body2"
//                       sx={{
//                         fontFamily: STYLE_GUIDE.TYPOGRAPHY.fontFamily.primary,
//                         fontSize: STYLE_GUIDE.TYPOGRAPHY.fontSize.small,
//                         color: STYLE_GUIDE.COLORS.textPrimary,
//                       }}
//                     >
//                       {selectedNotification?.subject || "No subject"}
//                     </Typography>
//                   </Grid>

//                   <Grid item xs={12}>
//                     <Typography
//                       variant="body2"
//                       color="textSecondary"
//                       sx={{
//                         fontFamily: STYLE_GUIDE.TYPOGRAPHY.fontFamily.primary,
//                         fontSize: STYLE_GUIDE.TYPOGRAPHY.fontSize.small,
//                         color: STYLE_GUIDE.COLORS.textSecondary,
//                       }}
//                     >
//                       Alert Content:
//                     </Typography>
//                   </Grid>
//                   <Grid item xs={12}>
//                     <Box
//                       sx={{
//                         border: `1px solid ${STYLE_GUIDE.COLORS.divider}`,
//                         borderRadius: STYLE_GUIDE.SPACING.s1,
//                         p: STYLE_GUIDE.SPACING.s2,
//                         maxHeight: "400px",
//                         overflowY: "auto",
//                         backgroundColor: STYLE_GUIDE.COLORS.backgroundLight,
//                         fontFamily: STYLE_GUIDE.TYPOGRAPHY.fontFamily.primary,
//                         fontSize: STYLE_GUIDE.TYPOGRAPHY.fontSize.small,
//                       }}
//                     >
//                       {parseHtmlContent(selectedNotification.alert_content)}
//                     </Box>
//                   </Grid>
//                 </Grid>
//               </Paper>
//             </Grid>

//             <Grid item xs={12}>
//               <Paper
//                 elevation={1}
//                 sx={{
//                   p: STYLE_GUIDE.SPACING.s2,
//                   backgroundColor: STYLE_GUIDE.COLORS.white,
//                   borderRadius: STYLE_GUIDE.SPACING.s1,
//                 }}
//               >
//                 <Typography
//                   variant="subtitle1"
//                   fontWeight="bold"
//                   mb={STYLE_GUIDE.SPACING.s2}
//                   sx={{
//                     fontFamily: STYLE_GUIDE.TYPOGRAPHY.fontFamily.primary,
//                     fontWeight: STYLE_GUIDE.TYPOGRAPHY.fontWeight.semiBold,
//                     color: STYLE_GUIDE.COLORS.textPrimary,
//                   }}
//                 >
//                   Additional Information
//                 </Typography>
//                 <Divider sx={{ mb: STYLE_GUIDE.SPACING.s2 }} />

//                 <Grid container spacing={STYLE_GUIDE.SPACING.s1}>
//                   <Grid item xs={4}>
//                     <Typography
//                       variant="body2"
//                       color="textSecondary"
//                       sx={{
//                         fontFamily: STYLE_GUIDE.TYPOGRAPHY.fontFamily.primary,
//                         fontSize: STYLE_GUIDE.TYPOGRAPHY.fontSize.small,
//                         color: STYLE_GUIDE.COLORS.textSecondary,
//                       }}
//                     >
//                       File attached:
//                     </Typography>
//                   </Grid>
//                   <Grid item xs={8}>
//                     <Typography
//                       variant="body2"
//                       sx={{
//                         fontFamily: STYLE_GUIDE.TYPOGRAPHY.fontFamily.primary,
//                         fontSize: STYLE_GUIDE.TYPOGRAPHY.fontSize.small,
//                         color: STYLE_GUIDE.COLORS.textPrimary,
//                       }}
//                     >
//                       -
//                     </Typography>
//                   </Grid>
//                 </Grid>
//               </Paper>
//             </Grid>
//           </Grid>
//         )}
//       </DialogContainer>
//     </Box>
//   );
// }

import * as React from "react";
import { useState, useEffect } from "react";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import NotificationsIcon from "@mui/icons-material/Notifications";
import ForwardToInboxIcon from "@mui/icons-material/ForwardToInbox";

import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  InputAdornment,
  Modal,
  Tooltip,
  Chip,
  Grid,
  Paper,
  Divider,
  CircularProgress,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import VisibilityIcon from "@mui/icons-material/Visibility";
import CloseIcon from "@mui/icons-material/Close";
import { useUnifiedTheme } from "../../hooks/useUnifiedTheme";
import useGet from "../../hooks/useGet";
import { CustomPagination } from "../../components/common/pagination/customPagination";
import { GET, POST } from "../../services/apiRoutes";
import { toast } from "react-toastify";
import { STYLE_GUIDE } from "../../styles";
import { useComponentTypography } from "../../hooks";
import { formatDate, formatDateUTC } from "../../utils/utils";
import parse from "html-react-parser";
import usePost from "../../hooks/usePost";
import CommonPageHeader from "../../components/atom/commonPageHeader";
import PrimaryButton from "../../components/common/PrimaryButton";
import SearchField from "../../components/common/SearchField";
import DialogContainer from "../../components/molecule/dialog";
import ConfirmDialog from "../report-settings/components/ConfirmDialog";

interface NotificationLog {
  _id: string;
  organizationId: string;
  notificationTypeId: {
    _id: string;
    name: string;
  };
  frequencySettingId: {
    frequency: string;
    triggerTime: string;
  };
  templateId: {
    subject: string;
    body: string;
  };
  mediumSettingId: {
    medium: string;
  };
  scheduledAt: string;
  notificationTriggerId: {
    source: string;
    isDryRun: boolean;
  };
  status: string;
  sentAt: string;
  payload: Record<string, any>;
  recipients: {
    recipient_to: string[];
    recipient_cc: string[];
  };
  alert_content: string;
  createdAt: string;
}

interface ApiResponse {
  success: boolean;
  data: NotificationLog[];
  pagination: {
    page: number;
    limit: number;
    totalPages: number;
    totalRecords: number;
  };
}

const columns: GridColDef[] = [
  {
    field: "notificationTypeId",
    headerName: "Notification Name",
    width: 250,
    disableColumnMenu: true,
    resizable: true,
    renderCell: (params) => params.row?.notificationTypeId?.name || "",
  },
  {
    field: "templateId",
    headerName: "Notification Type",
    width: 200,
    disableColumnMenu: true,
    resizable: true,
    renderCell: (params) => params.row?.templateId?.type || "",
  },
  {
    field: "subject",
    headerName: "Subject",
    width: 250,
    disableColumnMenu: true,
    resizable: true,
    renderCell: (params) => params.row?.subject || "-",
  },

  {
    field: "sentAt",
    headerName: "Sent At",
    width: 200,
    disableColumnMenu: true,
    resizable: true,
    renderCell: (params) => formatDateUTC(params.row.sentAt),
  },

  {
    field: "status",
    headerName: "Processing Status",
    width: 200,
    disableColumnMenu: true,
    resizable: true,
    renderCell: (params) => {
      const value = (params.value || "Unknown").toLowerCase();
      const label = value.charAt(0).toUpperCase() + value.slice(1);

      let color: "success" | "warning" | "error" = "error";

      if (value === "sent") {
        color = "success";
      } else if (
        value === "pending" ||
        value === "processing" ||
        value === "acknowledged"
      ) {
        color = "warning";
      } else if (value === "cancelled" || value === "failed") {
        color = "error";
      }

      return (
        <Chip label={label} size="small" color={color} variant="outlined" />
      );
    },
  },
  {
    field: "createdAt",
    headerName: "Created At",
    width: 250,
    disableColumnMenu: true,
    resizable: true,
    renderCell: (params) => formatDateUTC(params.row.createdAt),
  },
  {
    field: "notificationTriggerId",
    headerName: "Is Dry Run",
    width: 250,
    disableColumnMenu: true,
    resizable: true,
    renderCell: (params) => (
      <Chip
        label={params.row.notificationTriggerId?.isDryRun ? "Yes" : "No"}
        size="small"
        color={
          params.row.notificationTriggerId?.isDryRun ? "warning" : "success"
        }
        variant="outlined"
      />
    ),
  },
  {
    field: "actions",
    headerName: "Actions",
    width: 250,
    disableColumnMenu: true,
    sortable: false,
    resizable: false,
    renderCell: (params) => (
      <Box sx={{ display: "flex", gap: STYLE_GUIDE.SPACING.s2 }}>
        <Tooltip title="View" arrow>
          <Button
            variant="text"
            onClick={() => params.row.handleView(params.row)}
            sx={{ minWidth: "auto" }}
          >
            <VisibilityIcon />
          </Button>
        </Tooltip>
        <Tooltip title="Resend Now" arrow>
          <Button
            variant="text"
            onClick={() => params.row.handleResendNow(params.row._id)}
            sx={{ minWidth: "auto" }}
          >
            <ForwardToInboxIcon />
          </Button>
        </Tooltip>
      </Box>
    ),
  },
];

export default function NotificationLogger() {
  const theme = useUnifiedTheme();
  const [searchValue, setSearchValue] = useState("");
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 10,
  });
  const [debouncedSearchValue, setDebouncedSearchValue] = useState(searchValue);
  const [notificationLogReload, setNotificationLogReload] = useState(false);
  const triggerNotification = usePost(["triggerNotification"]);
  const resendNotification = usePost(["resendNotification"]);

  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedNotification, setSelectedNotification] =
    useState<NotificationLog | null>(null);

  // Confirmation dialog states
  const [showTriggerConfirm, setShowTriggerConfirm] = useState(false);
  const [showResendConfirm, setShowResendConfirm] = useState<{
    open: boolean;
    notificationId: string | null;
  }>({ open: false, notificationId: null });

  const { getHeadingSx } = useComponentTypography();

  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchValue.length === 0) {
        setDebouncedSearchValue("");
      } else if (searchValue.length < 3) {
        toast.warning("Please enter at least 3 characters");
        setDebouncedSearchValue("");
      } else {
        setDebouncedSearchValue(searchValue);
      }
      setPaginationModel((prev) => ({ ...prev, page: 0 }));
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [searchValue]);

  // Handle trigger notification response
  useEffect(() => {
    if (triggerNotification.data) {
      const { success, message } = triggerNotification.data;

      if (success) {
        toast.success(
          message || "prepareTodayNotifications executed successfully"
        );
        setShowTriggerConfirm(false);
      } else {
        toast.error(message || "Failed to trigger notification");
      }
    }

    if (triggerNotification.error) {
      toast.error("Failed to trigger notification");
      console.error(
        "Error triggering notification:",
        triggerNotification.error
      );
    }
  }, [triggerNotification.data, triggerNotification.error]);

  // Handle resend notification response
  useEffect(() => {
    if (resendNotification.data) {
      const { success, message } = resendNotification.data;

      if (success) {
        toast.success(message || "Notification resent successfully");
        setShowResendConfirm({ open: false, notificationId: null });
      } else {
        toast.error(message || "Failed to resend notification");
      }
    }

    if (resendNotification.error) {
      toast.error("Failed to resend notification");
      console.error("Error resending notification:", resendNotification.error);
    }
  }, [resendNotification.data, resendNotification.error]);

  const perPageItem = paginationModel.pageSize;
  const notificationLogList = useGet<ApiResponse>(
    [
      "notificationLogList",
      String(paginationModel.page + 1),
      String(paginationModel.pageSize),
      debouncedSearchValue,
      String(notificationLogReload),
    ],
    `${GET.NOTIFICATION_LOG_LIST}?page=${
      paginationModel.page + 1
    }&limit=${perPageItem}&search=${encodeURIComponent(debouncedSearchValue)}`,
    true
  );

  useEffect(() => {
    if (notificationLogList?.data && notificationLogReload) {
      setNotificationLogReload(false);
    }
  }, [notificationLogList, notificationLogReload]);

  const handleResendNow = (notificationId: string) => {
    setShowResendConfirm({ open: true, notificationId });
  };

  const handleConfirmResend = () => {
    if (showResendConfirm.notificationId) {
      resendNotification.mutate({
        url: POST.RESEND_NOTIFICATION,
        payload: { notificationId: showResendConfirm.notificationId },
      });
    }
  };

  const handleCancelResend = () => {
    setShowResendConfirm({ open: false, notificationId: null });
  };

  const handleConfirmTrigger = () => {
    triggerNotification.mutate({
      url: POST.TRIGGER_NOTIFICATION,
      payload: { isForce: "false" },
    });
  };

  const handleCancelTrigger = () => {
    setShowTriggerConfirm(false);
  };

  const notificationLogsWithIds =
    Array.isArray(notificationLogList?.data?.data) &&
    notificationLogList.data.data.length > 0
      ? notificationLogList.data.data.map((notificationLog) => ({
          ...notificationLog,
          id:
            notificationLog._id ||
            `temp-${Math.random().toString(36).substr(2, 9)}`,
          handleView: (row: NotificationLog) => {
            setSelectedNotification(row);
            setViewModalOpen(true);
          },
          handleResendNow: handleResendNow,
        }))
      : [];

  const handleViewModalClose = () => {
    setViewModalOpen(false);
    setSelectedNotification(null);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
    setPaginationModel({ ...paginationModel, page: 0 });
  };

  // Function to parse HTML content safely
  const parseHtmlContent = (html: string) => {
    if (!html) return null;
    try {
      return parse(html);
    } catch (error) {
      console.error("Error parsing HTML content:", error);
      return <div>Error rendering content</div>;
    }
  };

  return (
    <Box
      sx={{
        p: STYLE_GUIDE.SPACING.s2,
      }}
    >
      <CommonPageHeader
        title="Notification Logs"
        actions={
          <Box sx={{ display: "flex", gap: STYLE_GUIDE.SPACING.s2 }}>
            <PrimaryButton
              variant="contained"
              disabled={triggerNotification.isLoading}
              onClick={() => setShowTriggerConfirm(true)}
              startIcon={
                triggerNotification.isLoading ? (
                  <CircularProgress size={20} color="inherit" />
                ) : (
                  <NotificationsIcon />
                )
              }
            >
              {triggerNotification.isLoading
                ? "Triggering..."
                : "Trigger Notification"}
            </PrimaryButton>
          </Box>
        }
      />
      <Card sx={{ borderRadius: "8px", overflow: "visible" }}>
        <CardContent sx={{ p: STYLE_GUIDE.SPACING.s3 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: STYLE_GUIDE.SPACING.s3,
            }}
          >
            {/* Left: Search */}
            <SearchField
              searchValue={searchValue}
              handleSearchChange={handleSearchChange}
            />
          </Box>

          <DataGrid
            sx={{ height: "calc(100vh - 280px)" }}
            rows={notificationLogsWithIds}
            columns={columns}
            initialState={{ pagination: { paginationModel } }}
            disableColumnMenu
            paginationMode="server"
            loading={notificationLogList.isLoading}
            rowCount={notificationLogList?.data?.pagination.totalRecords || 0}
            paginationModel={paginationModel}
            isRowSelectable={() => false} 
            slots={{
              pagination: () => (
                <CustomPagination
                  paginationModel={paginationModel}
                  setPaginationModel={setPaginationModel}
                  rowCount={
                    notificationLogList?.data?.pagination.totalRecords || 0
                  }
                />
              ),
            }}
          />
        </CardContent>
      </Card>

      <DialogContainer
        open={viewModalOpen}
        onClose={handleViewModalClose}
        title="Notification logs Details"
        maxWidth="lg"
        actions={
          <PrimaryButton variant="outlined" onClick={handleViewModalClose}>
            Cancel
          </PrimaryButton>
        }
      >
        {selectedNotification && (
          <Grid container spacing={STYLE_GUIDE.SPACING.s2}>
            <Grid item xs={12}>
              <Paper
                elevation={1}
                sx={{
                  p: STYLE_GUIDE.SPACING.s2,
                  backgroundColor: STYLE_GUIDE.COLORS.white,
                  borderRadius: STYLE_GUIDE.SPACING.s1,
                }}
              >
                <Typography
                  variant="subtitle1"
                  fontWeight="bold"
                  mb={STYLE_GUIDE.SPACING.s2}
                  sx={{
                    fontFamily: STYLE_GUIDE.TYPOGRAPHY.fontFamily.primary,
                    fontWeight: STYLE_GUIDE.TYPOGRAPHY.fontWeight.semiBold,
                    color: STYLE_GUIDE.COLORS.textPrimary,
                  }}
                >
                  Basic Information
                </Typography>
                <Divider sx={{ mb: STYLE_GUIDE.SPACING.s2 }} />

                <Grid container spacing={STYLE_GUIDE.SPACING.s1}>
                  <Grid item xs={4}>
                    <Typography
                      variant="body2"
                      color="textSecondary"
                      sx={{
                        fontFamily: STYLE_GUIDE.TYPOGRAPHY.fontFamily.primary,
                        fontSize: STYLE_GUIDE.TYPOGRAPHY.fontSize.small,
                        color: STYLE_GUIDE.COLORS.textSecondary,
                      }}
                    >
                      Trigger date:
                    </Typography>
                  </Grid>
                  <Grid item xs={8}>
                    <Typography
                      variant="body2"
                      sx={{
                        fontFamily: STYLE_GUIDE.TYPOGRAPHY.fontFamily.primary,
                        fontSize: STYLE_GUIDE.TYPOGRAPHY.fontSize.small,
                        color: STYLE_GUIDE.COLORS.textPrimary,
                      }}
                    >
                      {formatDate(selectedNotification.scheduledAt)}
                    </Typography>
                  </Grid>

                  <Grid item xs={4}>
                    <Typography
                      variant="body2"
                      color="textSecondary"
                      sx={{
                        fontFamily: STYLE_GUIDE.TYPOGRAPHY.fontFamily.primary,
                        fontSize: STYLE_GUIDE.TYPOGRAPHY.fontSize.small,
                        color: STYLE_GUIDE.COLORS.textSecondary,
                      }}
                    >
                      Is dry run:
                    </Typography>
                  </Grid>
                  <Grid item xs={8}>
                    <Typography
                      variant="body2"
                      sx={{
                        fontFamily: STYLE_GUIDE.TYPOGRAPHY.fontFamily.primary,
                        fontSize: STYLE_GUIDE.TYPOGRAPHY.fontSize.small,
                        color: STYLE_GUIDE.COLORS.textPrimary,
                      }}
                    >
                      {selectedNotification.notificationTriggerId?.isDryRun
                        ? "Yes"
                        : "No"}
                    </Typography>
                  </Grid>

                  <Grid item xs={4}>
                    <Typography
                      variant="body2"
                      color="textSecondary"
                      sx={{
                        fontFamily: STYLE_GUIDE.TYPOGRAPHY.fontFamily.primary,
                        fontSize: STYLE_GUIDE.TYPOGRAPHY.fontSize.small,
                        color: STYLE_GUIDE.COLORS.textSecondary,
                      }}
                    >
                      Notification type:
                    </Typography>
                  </Grid>
                  <Grid item xs={8}>
                    <Typography
                      variant="body2"
                      sx={{
                        fontFamily: STYLE_GUIDE.TYPOGRAPHY.fontFamily.primary,
                        fontSize: STYLE_GUIDE.TYPOGRAPHY.fontSize.small,
                        color: STYLE_GUIDE.COLORS.textPrimary,
                      }}
                    >
                      {selectedNotification.notificationTypeId?.name ||
                        "overall"}
                    </Typography>
                  </Grid>

                  <Grid item xs={4}>
                    <Typography
                      variant="body2"
                      color="textSecondary"
                      sx={{
                        fontFamily: STYLE_GUIDE.TYPOGRAPHY.fontFamily.primary,
                        fontSize: STYLE_GUIDE.TYPOGRAPHY.fontSize.small,
                        color: STYLE_GUIDE.COLORS.textSecondary,
                      }}
                    >
                      Processing status:
                    </Typography>
                  </Grid>
                  <Grid item xs={8}>
                    <Chip
                      label={selectedNotification.status || "Unknown"}
                      size="small"
                      color={
                        selectedNotification.status === "sent"
                          ? "success"
                          : selectedNotification.status === "pending"
                            ? "warning"
                            : "error"
                      }
                      variant="outlined"
                    />
                  </Grid>

                  <Grid item xs={4}>
                    <Typography
                      variant="body2"
                      color="textSecondary"
                      sx={{
                        fontFamily: STYLE_GUIDE.TYPOGRAPHY.fontFamily.primary,
                        fontSize: STYLE_GUIDE.TYPOGRAPHY.fontSize.small,
                        color: STYLE_GUIDE.COLORS.textSecondary,
                      }}
                    >
                      Notification medium:
                    </Typography>
                  </Grid>
                  <Grid item xs={8}>
                    <Typography
                      variant="body2"
                      sx={{
                        fontFamily: STYLE_GUIDE.TYPOGRAPHY.fontFamily.primary,
                        fontSize: STYLE_GUIDE.TYPOGRAPHY.fontSize.small,
                        color: STYLE_GUIDE.COLORS.textPrimary,
                      }}
                    >
                      {selectedNotification.mediumSettingId?.medium || "email"}
                    </Typography>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>

            <Grid item xs={12}>
              <Paper
                elevation={1}
                sx={{
                  p: STYLE_GUIDE.SPACING.s2,
                  backgroundColor: STYLE_GUIDE.COLORS.white,
                  borderRadius: STYLE_GUIDE.SPACING.s1,
                }}
              >
                <Typography
                  variant="subtitle1"
                  fontWeight="bold"
                  mb={STYLE_GUIDE.SPACING.s2}
                  sx={{
                    fontFamily: STYLE_GUIDE.TYPOGRAPHY.fontFamily.primary,
                    fontWeight: STYLE_GUIDE.TYPOGRAPHY.fontWeight.semiBold,
                    color: STYLE_GUIDE.COLORS.textPrimary,
                  }}
                >
                  Recipients
                </Typography>
                <Divider sx={{ mb: STYLE_GUIDE.SPACING.s2 }} />

                <Grid container spacing={STYLE_GUIDE.SPACING.s1}>
                  <Grid item xs={4}>
                    <Typography
                      variant="body2"
                      color="textSecondary"
                      sx={{
                        fontFamily: STYLE_GUIDE.TYPOGRAPHY.fontFamily.primary,
                        fontSize: STYLE_GUIDE.TYPOGRAPHY.fontSize.small,
                        color: STYLE_GUIDE.COLORS.textSecondary,
                      }}
                    >
                      To:
                    </Typography>
                  </Grid>
                  <Grid item xs={8}>
                    <Typography
                      variant="body2"
                      sx={{
                        fontFamily: STYLE_GUIDE.TYPOGRAPHY.fontFamily.primary,
                        fontSize: STYLE_GUIDE.TYPOGRAPHY.fontSize.small,
                        color: STYLE_GUIDE.COLORS.textPrimary,
                      }}
                    >
                      {selectedNotification.recipients?.recipient_to?.join(
                        ", "
                      ) || "No recipients"}
                    </Typography>
                  </Grid>

                  <Grid item xs={4}>
                    <Typography
                      variant="body2"
                      color="textSecondary"
                      sx={{
                        fontFamily: STYLE_GUIDE.TYPOGRAPHY.fontFamily.primary,
                        fontSize: STYLE_GUIDE.TYPOGRAPHY.fontSize.small,
                        color: STYLE_GUIDE.COLORS.textSecondary,
                      }}
                    >
                      Cc:
                    </Typography>
                  </Grid>
                  <Grid item xs={8}>
                    <Typography
                      variant="body2"
                      sx={{
                        fontFamily: STYLE_GUIDE.TYPOGRAPHY.fontFamily.primary,
                        fontSize: STYLE_GUIDE.TYPOGRAPHY.fontSize.small,
                        color: STYLE_GUIDE.COLORS.textPrimary,
                      }}
                    >
                      {selectedNotification.recipients?.recipient_cc?.join(
                        ", "
                      ) || "No CC recipients"}
                    </Typography>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>

            <Grid item xs={12}>
              <Paper
                elevation={1}
                sx={{
                  p: STYLE_GUIDE.SPACING.s2,
                  backgroundColor: STYLE_GUIDE.COLORS.white,
                  borderRadius: STYLE_GUIDE.SPACING.s1,
                }}
              >
                <Typography
                  variant="subtitle1"
                  fontWeight="bold"
                  mb={STYLE_GUIDE.SPACING.s2}
                  sx={{
                    fontFamily: STYLE_GUIDE.TYPOGRAPHY.fontFamily.primary,
                    fontWeight: STYLE_GUIDE.TYPOGRAPHY.fontWeight.semiBold,
                    color: STYLE_GUIDE.COLORS.textPrimary,
                  }}
                >
                  Email Content
                </Typography>
                <Divider sx={{ mb: STYLE_GUIDE.SPACING.s2 }} />

                <Grid container spacing={STYLE_GUIDE.SPACING.s1}>
                  <Grid item xs={4}>
                    <Typography
                      variant="body2"
                      color="textSecondary"
                      sx={{
                        fontFamily: STYLE_GUIDE.TYPOGRAPHY.fontFamily.primary,
                        fontSize: STYLE_GUIDE.TYPOGRAPHY.fontSize.small,
                        color: STYLE_GUIDE.COLORS.textSecondary,
                      }}
                    >
                      Subject:
                    </Typography>
                  </Grid>
                  <Grid item xs={8}>
                    <Typography
                      variant="body2"
                      sx={{
                        fontFamily: STYLE_GUIDE.TYPOGRAPHY.fontFamily.primary,
                        fontSize: STYLE_GUIDE.TYPOGRAPHY.fontSize.small,
                        color: STYLE_GUIDE.COLORS.textPrimary,
                      }}
                    >
                      {selectedNotification?.subject || "No subject"}
                    </Typography>
                  </Grid>

                  <Grid item xs={12}>
                    <Typography
                      variant="body2"
                      color="textSecondary"
                      sx={{
                        fontFamily: STYLE_GUIDE.TYPOGRAPHY.fontFamily.primary,
                        fontSize: STYLE_GUIDE.TYPOGRAPHY.fontSize.small,
                        color: STYLE_GUIDE.COLORS.textSecondary,
                      }}
                    >
                      Alert Content:
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Box
                      sx={{
                        border: `1px solid ${STYLE_GUIDE.COLORS.divider}`,
                        borderRadius: STYLE_GUIDE.SPACING.s1,
                        p: STYLE_GUIDE.SPACING.s2,
                        maxHeight: "400px",
                        overflowY: "auto",
                        backgroundColor: STYLE_GUIDE.COLORS.backgroundLight,
                        fontFamily: STYLE_GUIDE.TYPOGRAPHY.fontFamily.primary,
                        fontSize: STYLE_GUIDE.TYPOGRAPHY.fontSize.small,
                        "& table": {
                          borderCollapse: "collapse",
                          borderSpacing: 0,
                          padding: 0,
                          "& th, & td": {
                            border: "1px solid #ddd",
                            padding: "2px 6px",
                            textAlign: "left",
                          },
                        },
                      }}
                    >
                      {parseHtmlContent(selectedNotification.alert_content)}
                    </Box>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>

            <Grid item xs={12}>
              <Paper
                elevation={1}
                sx={{
                  p: STYLE_GUIDE.SPACING.s2,
                  backgroundColor: STYLE_GUIDE.COLORS.white,
                  borderRadius: STYLE_GUIDE.SPACING.s1,
                }}
              >
                <Typography
                  variant="subtitle1"
                  fontWeight="bold"
                  mb={STYLE_GUIDE.SPACING.s2}
                  sx={{
                    fontFamily: STYLE_GUIDE.TYPOGRAPHY.fontFamily.primary,
                    fontWeight: STYLE_GUIDE.TYPOGRAPHY.fontWeight.semiBold,
                    color: STYLE_GUIDE.COLORS.textPrimary,
                  }}
                >
                  Additional Information
                </Typography>
                <Divider sx={{ mb: STYLE_GUIDE.SPACING.s2 }} />

                <Grid container spacing={STYLE_GUIDE.SPACING.s1}>
                  <Grid item xs={4}>
                    <Typography
                      variant="body2"
                      color="textSecondary"
                      sx={{
                        fontFamily: STYLE_GUIDE.TYPOGRAPHY.fontFamily.primary,
                        fontSize: STYLE_GUIDE.TYPOGRAPHY.fontSize.small,
                        color: STYLE_GUIDE.COLORS.textSecondary,
                      }}
                    >
                      File attached:
                    </Typography>
                  </Grid>
                  <Grid item xs={8}>
                    <Typography
                      variant="body2"
                      sx={{
                        fontFamily: STYLE_GUIDE.TYPOGRAPHY.fontFamily.primary,
                        fontSize: STYLE_GUIDE.TYPOGRAPHY.fontSize.small,
                        color: STYLE_GUIDE.COLORS.textPrimary,
                      }}
                    >
                      -
                    </Typography>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
          </Grid>
        )}
      </DialogContainer>

      {/* Confirmation Dialog for Trigger Notification */}
      <ConfirmDialog
        open={showTriggerConfirm}
        title="Trigger Notification"
        description="Are you sure you want to trigger the notification? This action will send notifications to all recipients."
        onConfirm={handleConfirmTrigger}
        onCancel={handleCancelTrigger}
        buttonText={"Yes"}
      />

      {/* Confirmation Dialog for Resend Notification */}
      <ConfirmDialog
        open={showResendConfirm.open}
        title="Resend Notification"
        description="Are you sure you want to resend this notification?"
        onConfirm={handleConfirmResend}
        onCancel={handleCancelResend}
        buttonText={"Yes"}
      />
    </Box>
  );
}
