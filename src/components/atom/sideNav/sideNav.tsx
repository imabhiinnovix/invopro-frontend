// import { styled, Theme, CSSObject } from "@mui/material/styles";
// import Box from "@mui/material/Box";
// import MuiDrawer from "@mui/material/Drawer";
// import List from "@mui/material/List";
// import ListItem from "@mui/material/ListItem";
// import ListItemButton from "@mui/material/ListItemButton";
// import ListItemIcon from "@mui/material/ListItemIcon";
// import ListItemText from "@mui/material/ListItemText";
// import { useNav } from "../../../context/NavContext";
// import DashboardIcon from "@mui/icons-material/Dashboard";
// import AddIcon from "@mui/icons-material/Add";
// import React, { useEffect, useMemo, useContext, useState } from "react";
// import { Collapse, LinearProgress } from "@mui/material";
// import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
// import ExpandLessIcon from "@mui/icons-material/ExpandLess";
// import { useNavigate, useLocation } from "react-router-dom";
// import SourceIcon from "@mui/icons-material/Source";
// import AssessmentIcon from "@mui/icons-material/Assessment";
// import PaletteIcon from "@mui/icons-material/Palette";
// import BrushIcon from "@mui/icons-material/Brush";
// import { useInfiniteScroll } from "../../../hooks/useInfiniteScroll";
// import { GET } from "../../../services/apiRoutes";
// import { DataSourceListData, DataSourceListPayload } from "./types";
// import { setDataSourceList } from "../../../pages/dataSources/dataSourceActions";
// import { useAppDispatch, useAppSelector } from "../../../storeHooks";
// import {
//   fetchDashboardList,
//   createDashboard,
//   deleteDashboard,
// } from "../../../pages/dashboard/dashboardActions";
// import {
//   Dashboard as DashboardType,
//   DashboardListResponse,
// } from "../../../pages/dashboard/types";
// import { toast } from "react-toastify";
// import { DeleteConfirmationModal } from "./components/DeleteConfirmationModal";
// import { SubItemsList } from "./components/SubItemsList";
// import { CreateDashboardModal } from "./components/CreateDashboardModal";
// import LogoutIcon from "@mui/icons-material/Logout";
// import logo from "../../../assets/ReportiVix-logo.png";
// import { AuthContext } from "../../../context/AuthContext";
// import { clearLocalStorage } from "../../../utils/handleLocalStorage";
// import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
// import { STYLE_GUIDE } from "../../../styles";
// import SettingsIcon from "@mui/icons-material/Settings";
// import { useUnifiedTheme } from "../../../hooks/useUnifiedTheme";
// import { useComponentTypography } from "../../../hooks/useComponentTypography";
// import BusinessIcon from "@mui/icons-material/Business";
// import AssignmentIndIcon from "@mui/icons-material/AssignmentInd";
// import NotivixLogo from "../../../assets/NotiVix-Logo-TRANS-V1.png";
// import useGet from "../../../hooks/useGet";
// import { useSelector } from "react-redux";
// import { RootState } from "../../../reducers";
// import PeopleIcon from "@mui/icons-material/People";
// import AccountTreeIcon from "@mui/icons-material/AccountTree";
// import SecurityIcon from "@mui/icons-material/Security";
// import WorkIcon from "@mui/icons-material/Work";
// import InventoryIcon from "@mui/icons-material/Inventory";
// import ManageAccountsIcon from "@mui/icons-material/ManageAccounts";

// interface ErrorResponse {
//   success: boolean;
//   message: string;
//   error: Record<string, unknown>;
// }

// const drawerWidth = 225;

// const openedMixin = (theme: Theme): CSSObject => ({
//   width: drawerWidth,
//   position: "static",
//   transition: theme.transitions.create("width", {
//     easing: theme.transitions.easing.sharp,
//     duration: theme.transitions.duration.enteringScreen,
//   }),
//   overflowX: "hidden",
// });

// const closedMixin = (theme: Theme): CSSObject => ({
//   position: "static",
//   transition: theme.transitions.create("width", {
//     easing: theme.transitions.easing.sharp,
//     duration: theme.transitions.duration.leavingScreen,
//   }),
//   overflowX: "hidden",
//   width: `calc(${theme.spacing(6)} + 1px)`,
//   [theme.breakpoints.up("sm")]: {
//     width: `calc(${theme.spacing(8)} + 1px)`,
//   },
// });

// const Drawer = styled(MuiDrawer, {
//   shouldForwardProp: (prop) => prop !== "open",
// })(({ theme }) => ({
//   width: drawerWidth,
//   flexShrink: 0,
//   whiteSpace: "nowrap",
//   boxSizing: "border-box",
//   height: "100vh",
//   position: "static",
//   backgroundColor: STYLE_GUIDE.COLORS.white,
//   "& .MuiPaper-root": {
//     backgroundColor: theme.palette.background.paper,
//     border: "none",
//     height: "100%",
//     position: "static",
//     overflow: "hidden",
//   },
//   "& .MuiDrawer-paper": {
//     position: "static",
//     overflow: "hidden",
//   },
//   "& .MuiList-root": {
//     height: "100%",
//     overflow: "hidden",
//   },
//   "& .MuiListItemButton-root": {
//     "&.Mui-selected, &.Mui-selected:hover": {
//       backgroundColor: theme.palette.action.hover,
//     },
//     "&:hover": {
//       backgroundColor: theme.palette.action.hover,
//     },
//   },
//   variants: [
//     {
//       props: ({ open }) => open,
//       style: {
//         ...openedMixin(theme),
//         "& .MuiDrawer-paper": openedMixin(theme),
//       },
//     },
//     {
//       props: ({ open }) => !open,
//       style: {
//         ...closedMixin(theme),
//         "& .MuiDrawer-paper": closedMixin(theme),
//       },
//     },
//   ],
// }));

// interface SubNavItem {
//   name: string;
//   icon: React.ReactNode;
//   route: string;
//   isCreateButton?: boolean;
//   subItems?: SubNavItem[];
//   isBold?: boolean;
// }

// interface NavItem {
//   name: string;
//   icon: React.ReactNode;
//   route: string;
//   subItems?: SubNavItem[];
// }

// export default function SideNav() {
//   const theme = useUnifiedTheme();
//   const { getNavigationSx } = useComponentTypography();
//   const { openNav } = useNav();
//   const [openSettings, setOpenSettings] = React.useState(false);
//   const [openDashboard, setOpenDashboard] = React.useState(false);
//   const [openNotificationSettings, setOpenNotificationSettings] =
//     React.useState(false);
//   const [openGlobalSettings, setOpenGlobalSettings] = React.useState(false);
//   const [openReportSettings, setOpenReportSettings] = React.useState(false);
//   const [openThemeSettings, setOpenThemeSettings] = React.useState(false);
//   const [openSystemSettings, setOpenSystemSettings] = React.useState(false);
//   const [openDataSources, setOpenDataSources] = React.useState(false);
//   const [newDashboardName, setNewDashboardName] = React.useState("");
//   const [dashboardType, setDashboardType] = React.useState<
//     "normal" | "trend" | "fixed"
//   >("normal");
//   const [timePeriod, setTimePeriod] = React.useState<string>("1m");
//   const [dataSourceId, setDataSourceId] = React.useState<string>("");
//   const [isCreatingLoading, setIsCreatingLoading] = React.useState(false);
//   const [deleteModalOpen, setDeleteModalOpen] = React.useState(false);
//   const [dashboardToDelete, setDashboardToDelete] =
//     React.useState<DashboardType | null>(null);
//   const [isDeleting, setIsDeleting] = React.useState(false);
//   const navigate = useNavigate();
//   const location = useLocation();
//   const dispatch = useAppDispatch();
//   const { dashboards, loading } = useAppSelector((state) => state.dashboard);
//   const { clearAuthContext } = useContext(AuthContext);
//   const [openCreateModal, setOpenCreateModal] = useState(false);
//   const permissions = useSelector(
//     (state: RootState) => state.userPermission?.permissions
//   );
//   const dataSourcePermissions = permissions?.["Data Source"] || {};
//   const validPermissionIds = Object.entries(dataSourcePermissions)
//     .filter(([key, permission]) => {
//       return permission.allowed === true && permission.dataSourceId?._id;
//     })
//     .map(([key, permission]) => permission.dataSourceId._id);

//   const closeAllDropdowns = () => {
//     setOpenSettings(false);
//     setOpenDashboard(false);
//     setOpenNotificationSettings(false);
//     setOpenGlobalSettings(false);
//     setOpenReportSettings(false);
//     setOpenThemeSettings(false);
//     setOpenSystemSettings(false);
//     setOpenDataSources(false);
//   };

//   useEffect(() => {
//     dispatch(fetchDashboardList());
//   }, [dispatch]);

//   const { infiniteQuery: dataSourceListAPI, lastElementRef } =
//     useInfiniteScroll<DataSourceListPayload, DataSourceListData>(
//       ["dataSourceList"],
//       GET?.DATA_SOURCE_LIST + `?canEditInline=true`,
//       10,
//       "get",
//       true
//     );

//   const dataSourceNotivixListAPI = useGet<DataSourceListPayload>(
//     ["dataSourceNotivixList"],
//     GET?.DATA_SOURCE_LIST + `?isShowMenu=true`
//   );

//   const dataSourceList = useMemo(() => {
//     return dataSourceListAPI?.data?.pages?.flatMap((page) => page?.data) || [];
//   }, [dataSourceListAPI?.data?.pages]);

//   const dataSourceNotivixList = useMemo(() => {
//     return dataSourceNotivixListAPI?.data?.data || [];
//   }, [dataSourceNotivixListAPI?.data]);

//   const matchedDataSources = useMemo(() => {
//     return dataSourceNotivixList?.filter(
//       (dataSource: any) =>
//         validPermissionIds.includes(dataSource._id) &&
//         dataSource.isShowMenu === true
//     );
//   }, [dataSourceNotivixList, validPermissionIds]);

//   useEffect(() => {
//     if (dataSourceNotivixList.length > 0)
//       dispatch(setDataSourceList(dataSourceNotivixList));
//   }, [dataSourceNotivixList, dispatch]);

//   const handleItemClick = (
//     route: string,
//     hasSubItems: boolean,
//     itemName: string
//   ) => {
//     if (hasSubItems) {
//       if (itemName === "Dashboards") {
//         if (!openDashboard) {
//           setOpenDashboard(true);
//         } else {
//           setOpenDashboard(false);
//           navigate(route);
//         }
//         navigate(route);
//       } else if (itemName === "Notification") {
//         setOpenNotificationSettings((prev) => !prev);
//         navigate(route);
//       } else if (itemName === "Settings") {
//         setOpenReportSettings((prev) => !prev);
//       } else if (itemName === "Theme Settings") {
//         setOpenThemeSettings((prev) => !prev);
//       } else if (itemName === "System Settings") {
//         setOpenSystemSettings((prev) => !prev);
//       } else if (itemName === "Data Sources") {
//         setOpenDataSources((prev) => !prev);
//       } else {
//         setOpenSettings((prev) => !prev);
//       }
//     } else {
//       closeAllDropdowns();
//       navigate(route);
//     }
//   };

//   const handleCreateDashboard = async () => {
//     if (newDashboardName.trim()) {
//       if (dashboardType === "fixed" && !dataSourceId.trim()) {
//         toast.error("Please select a data source for fixed dashboard type");
//         return;
//       }
//       try {
//         setIsCreatingLoading(true);
//         const response = (await dispatch(
//           createDashboard({
//             name: newDashboardName.trim(),
//             dashboardType,
//             dynamicVersionValue: timePeriod,
//             dataSourceId: dashboardType === "fixed" ? dataSourceId : undefined,
//           })
//         ).unwrap()) as DashboardListResponse;
//         await dispatch(fetchDashboardList());
//         setOpenCreateModal(false);
//         setNewDashboardName("");
//         setDashboardType("normal");
//         setTimePeriod("1m");
//         toast.success(response.message || "Dashboard created successfully!");
//         const newDashboard = response?.data;
//         if (newDashboard) {
//           navigate(`/dashboard/${newDashboard._id}`, {
//             state: { enableEditMode: true },
//           });
//         }
//       } catch (error:
//         | { payload?: { message: string }; message?: string }
//         | unknown) {
//         const errorMessage =
//           error && typeof error === "object" && "payload" in error
//             ? (error.payload as { message?: string })?.message
//             : error && typeof error === "object" && "message" in error
//               ? (error as { message?: string })?.message
//               : "Failed to create dashboard. Please try again.";
//         toast.error(errorMessage);
//       } finally {
//         setIsCreatingLoading(false);
//       }
//     }
//   };

//   const handleCloseCreateModal = () => {
//     setOpenCreateModal(false);
//     setNewDashboardName("");
//     setDashboardType("normal");
//     setTimePeriod("1m");
//     setDataSourceId("");
//   };

//   const handleDeleteClick = (e: React.MouseEvent, dashboard: DashboardType) => {
//     e.stopPropagation();
//     setDashboardToDelete(dashboard);
//     setDeleteModalOpen(true);
//   };

//   const handleDeleteConfirm = async () => {
//     if (dashboardToDelete) {
//       try {
//         setIsDeleting(true);
//         await dispatch(deleteDashboard(dashboardToDelete._id)).unwrap();
//         dispatch(fetchDashboardList());
//         toast.success("Dashboard deleted successfully!");
//         if (location.pathname === `/dashboard/${dashboardToDelete._id}`) {
//           navigate("/dashboard");
//         }
//         setDeleteModalOpen(false);
//         setDashboardToDelete(null);
//       } catch (error) {
//         const errorResponse = error as ErrorResponse;
//         toast.error(
//           errorResponse.message ||
//             "Failed to delete dashboard. Please try again."
//         );
//       } finally {
//         setIsDeleting(false);
//       }
//     }
//   };

//   const handleDeleteCancel = () => {
//     setDeleteModalOpen(false);
//     setDashboardToDelete(null);
//   };

//   const handleLogout = () => {
//     clearAuthContext();
//     clearLocalStorage();
//     navigate("/login");
//   };

//   const navItems: NavItem[] = useMemo(() => {
//     const createIcon = (IconComponent: React.ElementType, route: string) => {
//       return (
//         <IconComponent
//           sx={{
//             fontSize: STYLE_GUIDE.TYPOGRAPHY.fontSize.base,
//             color: location.pathname.startsWith(route)
//               ? theme.palette.primary.main
//               : theme.getIconColor(),
//           }}
//         />
//       );
//     };

//     // Monthly data sources
//     const monthlyDataSources = matchedDataSources
//       .filter((item) => item.versionType === "monthly")
//       .map((item) => ({
//         name: item?.name ?? "",
//         icon: createIcon(SourceIcon, `/data-source-new/${item?._id}`),
//         route: `/data-source-new/${item?._id}`,
//       }));

//     // Constant data sources
//     const constantDataSources = matchedDataSources
//       .filter((item) => item.versionType === "constant")
//       .map((item) => ({
//         name: item?.name ?? "",
//         icon: createIcon(SourceIcon, `/data-source-new/${item?._id}`),
//         route: `/data-source-new/${item?._id}`,
//       }));

//     // Alerts menu item
//     const alertsMenuItem = {
//       name: "Alerts",
//       icon: createIcon(SourceIcon, "/notification"),
//       route: "/notification",
//     };

//     // Loading indicator
//     const loadingIndicator =
//       dataSourceListAPI?.hasNextPage || dataSourceNotivixListAPI?.isLoading
//         ? [
//             {
//               name: "",
//               icon: (
//                 <div ref={lastElementRef} style={{ paddingLeft: "1.5rem" }}>
//                   <LinearProgress />
//                 </div>
//               ),
//               route: "#",
//             },
//           ]
//         : [];

//     // Combined data sources with loading indicator
//     const dataSourceItems = [
//       ...monthlyDataSources,
//       ...loadingIndicator,
//       alertsMenuItem,
//     ];

//     // Data sources for Theme Settings submenu
//     const themeSettingsDataSources = dataSourceList.map((item) => ({
//       name: item?.name ?? "",
//       icon: createIcon(SourceIcon, `/data-source/${item?._id}`),
//       route: `/data-source/${item?._id}`,
//     }));

//     return [
//       {
//         name: "Dashboards",
//         icon: (
//           <DashboardIcon
//             sx={{ fontSize: STYLE_GUIDE.TYPOGRAPHY.fontSize.base }}
//           />
//         ),
//         route: "/dashboard",
//         subItems: [
//           {
//             name: "Create New Dashboard",
//             icon: (
//               <AddIcon
//                 sx={{
//                   fontSize: getNavigationSx().fontSize,
//                   color: theme.getIconColor(),
//                 }}
//               />
//             ),
//             route: "#",
//             isCreateButton: true,
//           },
//           ...(loading
//             ? [
//                 {
//                   name: "...",
//                   icon: <></>,
//                   route: "#",
//                 },
//               ]
//             : [
//                 ...dashboards.slice(0, 5).map((dashboard: DashboardType) => ({
//                   name: dashboard.name,
//                   icon: <></>,
//                   route: `/dashboard/${dashboard._id}`,
//                 })),
//                 {
//                   name: "All Dashboards",
//                   icon: <></>,
//                   route: "/dashboard",
//                   isMoreLink: true,
//                 },
//               ]),
//         ],
//       },
//       {
//         name: "Data Upload",
//         icon: createIcon(AssessmentIcon, "/reports"),
//         route: "/reports",
//       },
//       {
//         name: "Reports",
//         icon: createIcon(AssessmentIcon, "/reports"),
//         route: "/reports",
//       },
//       {
//         name: "Notifications",
//         icon: createIcon(SourceIcon, "/data-source"),
//         route: "/data-source",
//         subItems: dataSourceItems,
//       },
//       {
//         name: "VixAI Insights",
//         icon: createIcon(AutoAwesomeIcon, "/VixAi-Insights"),
//         route: "/VixAi-Insights",
//       },
//       // Add constant data sources directly to the main navigation

//       {
//         name: "Settings",
//         icon: createIcon(SettingsIcon, "/settings"),
//         route: "/settings",
//         subItems: [
//           {
//             name: "Attribute Option",
//             icon: createIcon(AutoAwesomeIcon, "/attribute-option"),
//             route: "/attribute-option",
//             isBold: true,
//           },
//           {
//             name: "Entity",
//             icon: createIcon(AutoAwesomeIcon, "/entity"),
//             route: "/entity",
//             isBold: true,
//           },
//           {
//             name: "Theme Settings",
//             icon: createIcon(PaletteIcon, "/theme-settings"),
//             route: "#",
//             isBold: true,
//             subItems: [
//               {
//                 name: "Create Theme",
//                 icon: createIcon(PaletteIcon, "/create-theme"),
//                 route: "/create-theme",
//               },
//               {
//                 name: "Layout Themes",
//                 icon: createIcon(BrushIcon, "/themes"),
//                 route: "/themes",
//               },
//             ],
//           },
//           {
//             name: "Data Sources",
//             icon: createIcon(SourceIcon, "/datasources"),
//             route: "#",
//             isBold: true,
//             subItems: themeSettingsDataSources,
//           },
//           {
//             name: "Report Settings",
//             icon: createIcon(SettingsIcon, "/report-settings"),
//             route: "/report-settings",
//             isBold: true,
//           },
//           ...constantDataSources,

//           {
//             name: "System Settings",
//             icon: createIcon(ManageAccountsIcon, "/system-settings"),
//             route: "#",
//             isBold: true,
//             subItems: [
//               {
//                 name: "Roles",
//                 icon: createIcon(AssignmentIndIcon, "/roles"),
//                 route: "/roles",
//               },
//               {
//                 name: "Organization",
//                 icon: createIcon(BusinessIcon, "/organization"),
//                 route: "/organization",
//               },
//               {
//                 name: "Permission",
//                 icon: createIcon(SecurityIcon, "/permission"),
//                 route: "/permission",
//               },
//               {
//                 name: "Department",
//                 icon: createIcon(AccountTreeIcon, "/department"),
//                 route: "/department",
//               },
//               {
//                 name: "Designation",
//                 icon: createIcon(WorkIcon, "/designation"),
//                 route: "/designation",
//               },
//               {
//                 name: "Product",
//                 icon: createIcon(InventoryIcon, "/product"),
//                 route: "/product",
//               },
//               {
//                 name: "User Setting",
//                 icon: createIcon(PeopleIcon, "/user-setting"),
//                 route: "/user-setting",
//               },
//               {
//                 name: "Notifix Roles",
//                 icon: createIcon(AssignmentIndIcon, "/settings/roles"),
//                 route: "/settings/roles",
//               },
//               {
//                 name: "Notifix Permissions",
//                 icon: createIcon(SecurityIcon, "/permissions"),
//                 route: "/permissions",
//               },
//               {
//                 name: "Notifix Organization",
//                 icon: createIcon(BusinessIcon, "/settings/organization"),
//                 route: "/settings/organization",
//               },
//             ],
//           },
//         ],
//       },
//       {
//         name: "User Logs",
//         icon: createIcon(SettingsIcon, "/settings"),
//         route: "/settings",
//       },
//     ];
//   }, [
//     loading,
//     dashboards,
//     dataSourceList,
//     matchedDataSources,
//     dataSourceListAPI?.hasNextPage,
//     dataSourceNotivixListAPI?.isLoading,
//     lastElementRef,
//   ]);

//   const isRouteActive = (route: string) => {
//     return location.pathname.startsWith(route);
//   };

//   return (
//     <Box sx={{ display: "flex", height: "100%" }}>
//       <Drawer variant="permanent" open={openNav} sx={{ p: 0 }}>
//         <Box
//           sx={{
//             display: "flex",
//             flexDirection: "column",
//             height: "100vh",
//             width: "300px",
//           }}
//         >
//           <Box
//             sx={{
//               display: "flex",
//               justifyContent: "center",
//               alignItems: "center",
//               height: "50px",
//               borderBottom: `1px solid ${theme.palette.divider}`,
//             }}
//           >
//             <Box
//               component="img"
//               src={logo}
//               alt="Logo"
//               sx={{
//                 width: openNav ? 120 : 40,
//                 height: "auto",
//                 transition: "width 0.2s ease-in-out",
//               }}
//             />
//           </Box>
//           <List sx={{ py: 0 }}>
//             {navItems.map((item, i) => (
//               <React.Fragment key={i}>
//                 <ListItem
//                   disablePadding
//                   sx={{
//                     display: "block",
//                     mb: 0.5,
//                   }}
//                 >
//                   <ListItemButton
//                     onClick={(e) => {
//                       e.stopPropagation();
//                       handleItemClick(item.route, !!item.subItems, item.name);
//                     }}
//                     sx={{
//                       minHeight: 42,
//                       mx: 1.5,
//                       px: 2,
//                       borderRadius: "8px",
//                       justifyContent: openNav ? "initial" : "center",
//                       backgroundColor: isRouteActive(item.route)
//                         ? "#ffffff"
//                         : "transparent",
//                       color: isRouteActive(item.route)
//                         ? theme.palette.primary.main
//                         : theme.palette.text.primary,
//                       "& .MuiListItemIcon-root": {
//                         color: isRouteActive(item.route)
//                           ? theme.palette.primary.main
//                           : theme.palette.text.primary,
//                       },
//                       "&:hover": {
//                         backgroundColor: isRouteActive(item.route)
//                           ? "#ffffff"
//                           : theme.palette.action.hover,
//                         borderRadius: "8px",
//                       },
//                     }}
//                   >
//                     <ListItemIcon
//                       sx={{
//                         minWidth: 0,
//                         mr: openNav ? 2 : "auto",
//                         justifyContent: "center",
//                       }}
//                     >
//                       {item.icon}
//                     </ListItemIcon>
//                     <ListItemText
//                       primary={item.name}
//                       sx={{
//                         opacity: openNav ? 1 : 0,
//                         m: 0,
//                         "& .MuiListItemText-primary": {
//                           ...getNavigationSx(),
//                           color: isRouteActive(item.route)
//                             ? theme.palette.primary.main
//                             : theme.palette.text.primary,
//                         },
//                       }}
//                     />
//                     {item.subItems &&
//                       openNav &&
//                       ((item.name === "Dashboards" && openDashboard) ||
//                       (item.name === "Notification" &&
//                         openNotificationSettings) ||
//                       (item.name === "Settings" && openReportSettings) ||
//                       (item.name === "Theme Settings" && openThemeSettings) ||
//                       (item.name === "Data Sources" && openDataSources) ||
//                       (item.name === "System Settings" &&
//                         openSystemSettings) ? (
//                         <ExpandLessIcon
//                           sx={{
//                             fontSize: getNavigationSx().fontSize,
//                             color: isRouteActive(item.route)
//                               ? theme.palette.primary.main
//                               : theme.palette.text.primary,
//                           }}
//                         />
//                       ) : (
//                         <ExpandMoreIcon
//                           sx={{
//                             fontSize: getNavigationSx().fontSize,
//                             color: isRouteActive(item.route)
//                               ? theme.palette.primary.main
//                               : theme.palette.text.primary,
//                           }}
//                         />
//                       ))}
//                   </ListItemButton>
//                 </ListItem>
//                 {item.subItems && openNav && (
//                   <Collapse
//                     in={
//                       item.name === "Dashboards"
//                         ? openDashboard
//                         : item.name === "Notification"
//                           ? openNotificationSettings
//                           : item.name === "Settings"
//                             ? openReportSettings
//                             : item.name === "Theme Settings"
//                               ? openThemeSettings
//                               : item.name === "Data Sources"
//                                 ? openDataSources
//                                 : item.name === "System Settings"
//                                   ? openSystemSettings
//                                   : openSettings
//                     }
//                     timeout="auto"
//                     unmountOnExit
//                   >
//                     <List component="div" disablePadding>
//                       {item.name === "Dashboards" && (
//                         <ListItem
//                           disablePadding
//                           sx={{ display: "block", mb: 0.5 }}
//                         >
//                           <ListItemButton
//                             onClick={(e) => {
//                               e.stopPropagation();
//                               setOpenCreateModal(true);
//                             }}
//                             sx={{
//                               minHeight: 36,
//                               px: STYLE_GUIDE.SPACING.s4,
//                               pl: STYLE_GUIDE.SPACING.s4,
//                               borderRadius: "8px",
//                               mx: STYLE_GUIDE.SPACING.s3,
//                               "&:hover": {
//                                 backgroundColor:
//                                   STYLE_GUIDE.COLORS.backgroundDefault,
//                               },
//                             }}
//                           >
//                             <ListItemIcon
//                               sx={{
//                                 minWidth: 0,
//                                 mr: 1,
//                                 justifyContent: "center",
//                               }}
//                             >
//                               <AddIcon
//                                 sx={{
//                                   fontSize: getNavigationSx().fontSize,
//                                   color: theme.getIconColor(),
//                                 }}
//                               />
//                             </ListItemIcon>
//                             <ListItemText
//                               primary="Create New Dashboard"
//                               sx={{
//                                 m: 0,
//                                 "& .MuiListItemText-primary": {
//                                   ...getNavigationSx(),
//                                 },
//                               }}
//                             />
//                           </ListItemButton>
//                         </ListItem>
//                       )}
//                       {item.name === "Settings" ? (
//                         <>
//                           {item.subItems?.map((subItem, subIndex) => (
//                             <React.Fragment key={subIndex}>
//                               {subItem.subItems ? (
//                                 <ListItem
//                                   disablePadding
//                                   sx={{ display: "block", mb: 0.5 }}
//                                 >
//                                   <ListItemButton
//                                     onClick={(e) => {
//                                       e.stopPropagation();
//                                       handleItemClick(
//                                         subItem.route,
//                                         !!subItem.subItems,
//                                         subItem.name
//                                       );
//                                     }}
//                                     sx={{
//                                       minHeight: 36,
//                                       px: STYLE_GUIDE.SPACING.s4,
//                                       pl: STYLE_GUIDE.SPACING.s4,
//                                       borderRadius: "8px",
//                                       mx: STYLE_GUIDE.SPACING.s3,
//                                       "&:hover": {
//                                         backgroundColor:
//                                           STYLE_GUIDE.COLORS.backgroundDefault,
//                                       },
//                                     }}
//                                   >
//                                     <ListItemIcon
//                                       sx={{
//                                         minWidth: 0,
//                                         mr: 1,
//                                         justifyContent: "center",
//                                       }}
//                                     >
//                                       {subItem.icon}
//                                     </ListItemIcon>
//                                     <ListItemText
//                                       primary={subItem.name}
//                                       sx={{
//                                         m: 0,
//                                         "& .MuiListItemText-primary": {
//                                           ...getNavigationSx(),
//                                           fontWeight: subItem.isBold
//                                             ? 600
//                                             : 400,
//                                           color: subItem.isBold
//                                             ? theme.palette.text.primary
//                                             : theme.palette.text.secondary,
//                                         },
//                                       }}
//                                     />
//                                     {openNav &&
//                                       ((subItem.name === "Theme Settings" &&
//                                         openThemeSettings) ||
//                                       (subItem.name === "Data Sources" &&
//                                         openDataSources) ||
//                                       (subItem.name === "System Settings" &&
//                                         openSystemSettings) ? (
//                                         <ExpandLessIcon
//                                           sx={{
//                                             fontSize:
//                                               getNavigationSx().fontSize,
//                                           }}
//                                         />
//                                       ) : (
//                                         <ExpandMoreIcon
//                                           sx={{
//                                             fontSize:
//                                               getNavigationSx().fontSize,
//                                           }}
//                                         />
//                                       ))}
//                                   </ListItemButton>
//                                   <Collapse
//                                     in={
//                                       subItem.name === "Theme Settings"
//                                         ? openThemeSettings
//                                         : subItem.name === "Data Sources"
//                                           ? openDataSources
//                                           : subItem.name === "System Settings"
//                                             ? openSystemSettings
//                                             : false
//                                     }
//                                     timeout="auto"
//                                     unmountOnExit
//                                   >
//                                     <List component="div" disablePadding>
//                                       {subItem.subItems?.map(
//                                         (nestedItem, nestedIndex) => (
//                                           <ListItem
//                                             key={nestedIndex}
//                                             disablePadding
//                                             sx={{ display: "block", mb: 0.5 }}
//                                           >
//                                             <ListItemButton
//                                               onClick={(e) => {
//                                                 e.stopPropagation();
//                                                 closeAllDropdowns();
//                                                 navigate(nestedItem.route);
//                                               }}
//                                               sx={{
//                                                 minHeight: 36,
//                                                 px: STYLE_GUIDE.SPACING.s4,
//                                                 pl: STYLE_GUIDE.SPACING.s8,
//                                                 borderRadius: "8px",
//                                                 mx: STYLE_GUIDE.SPACING.s3,
//                                                 "&:hover": {
//                                                   backgroundColor:
//                                                     STYLE_GUIDE.COLORS
//                                                       .backgroundDefault,
//                                                 },
//                                               }}
//                                             >
//                                               <ListItemIcon
//                                                 sx={{
//                                                   minWidth: 0,
//                                                   mr: 1,
//                                                   justifyContent: "center",
//                                                 }}
//                                               >
//                                                 {nestedItem.icon}
//                                               </ListItemIcon>
//                                               <ListItemText
//                                                 primary={nestedItem.name}
//                                                 sx={{
//                                                   m: 0,
//                                                   "& .MuiListItemText-primary":
//                                                     {
//                                                       ...getNavigationSx(),
//                                                     },
//                                                 }}
//                                               />
//                                             </ListItemButton>
//                                           </ListItem>
//                                         )
//                                       )}
//                                     </List>
//                                   </Collapse>
//                                 </ListItem>
//                               ) : (
//                                 <ListItem
//                                   disablePadding
//                                   sx={{ display: "block", mb: 0.5 }}
//                                 >
//                                   <ListItemButton
//                                     onClick={(e) => {
//                                       e.stopPropagation();
//                                       closeAllDropdowns();
//                                       navigate(subItem.route);
//                                     }}
//                                     sx={{
//                                       minHeight: 36,
//                                       px: STYLE_GUIDE.SPACING.s4,
//                                       pl: STYLE_GUIDE.SPACING.s4,
//                                       borderRadius: "8px",
//                                       mx: STYLE_GUIDE.SPACING.s3,
//                                       "&:hover": {
//                                         backgroundColor:
//                                           STYLE_GUIDE.COLORS.backgroundDefault,
//                                       },
//                                     }}
//                                   >
//                                     <ListItemIcon
//                                       sx={{
//                                         minWidth: 0,
//                                         mr: 1,
//                                         justifyContent: "center",
//                                       }}
//                                     >
//                                       {subItem.icon}
//                                     </ListItemIcon>
//                                     <ListItemText
//                                       primary={subItem.name}
//                                       sx={{
//                                         m: 0,
//                                         "& .MuiListItemText-primary": {
//                                           ...getNavigationSx(),
//                                           fontWeight: subItem.isBold
//                                             ? 600
//                                             : 400,
//                                           color: subItem.isBold
//                                             ? theme.palette.text.primary
//                                             : theme.palette.text.secondary,
//                                         },
//                                       }}
//                                     />
//                                   </ListItemButton>
//                                 </ListItem>
//                               )}
//                             </React.Fragment>
//                           ))}
//                         </>
//                       ) : (
//                         <SubItemsList
//                           subItems={item.subItems.filter(
//                             (subItem) => !subItem.isCreateButton
//                           )}
//                           openNav={openNav}
//                           parentName={item.name}
//                           dashboards={dashboards}
//                           onDeleteClick={handleDeleteClick}
//                           onCreateClick={() => setOpenCreateModal(true)}
//                         />
//                       )}
//                     </List>
//                   </Collapse>
//                 )}
//               </React.Fragment>
//             ))}
//           </List>
//           <Box
//             sx={{
//               px: STYLE_GUIDE.SPACING.s4,
//               pb: STYLE_GUIDE.SPACING.s2,
//               mt: "auto",
//             }}
//           >
//             <ListItemButton
//               onClick={(e) => {
//                 e.stopPropagation();
//                 handleLogout();
//               }}
//               sx={{
//                 minHeight: 42,
//                 px: STYLE_GUIDE.SPACING.s4,
//                 borderRadius: "8px",
//                 justifyContent: openNav ? "initial" : "center",
//                 color: theme.palette.text.primary,
//                 "&:hover": {
//                   backgroundColor: theme.palette.action.hover,
//                 },
//               }}
//             >
//               <ListItemIcon
//                 sx={{
//                   minWidth: 0,
//                   mr: openNav ? STYLE_GUIDE.SPACING.s4 : "auto",
//                   justifyContent: "center",
//                 }}
//               >
//                 <LogoutIcon sx={{ color: theme.getIconColor() }} />
//               </ListItemIcon>
//               <ListItemText
//                 primary="Logout"
//                 sx={{
//                   opacity: openNav ? 1 : 0,
//                   m: 0,
//                   "& .MuiListItemText-primary": {
//                     ...getNavigationSx(),
//                   },
//                 }}
//               />
//             </ListItemButton>
//           </Box>
//         </Box>
//       </Drawer>
//       <CreateDashboardModal
//         open={openCreateModal}
//         onClose={handleCloseCreateModal}
//         newDashboardName={newDashboardName}
//         onNameChange={setNewDashboardName}
//         onCreate={handleCreateDashboard}
//         isCreating={isCreatingLoading}
//         dashboardType={dashboardType}
//         onDashboardTypeChange={setDashboardType}
//         timePeriod={timePeriod}
//         onTimePeriodChange={setTimePeriod}
//         dataSourceId={dataSourceId}
//         onDataSourceChange={setDataSourceId}
//       />
//       <DeleteConfirmationModal
//         open={deleteModalOpen}
//         dashboard={dashboardToDelete}
//         onConfirm={handleDeleteConfirm}
//         onCancel={handleDeleteCancel}
//         isDeleting={isDeleting}
//       />
//     </Box>
//   );
// }

// import { styled, Theme, CSSObject } from "@mui/material/styles";
// import Box from "@mui/material/Box";
// import MuiDrawer from "@mui/material/Drawer";
// import List from "@mui/material/List";
// import ListItem from "@mui/material/ListItem";
// import ListItemButton from "@mui/material/ListItemButton";
// import ListItemIcon from "@mui/material/ListItemIcon";
// import ListItemText from "@mui/material/ListItemText";
// import { useNav } from "../../../context/NavContext";
// import DashboardIcon from "@mui/icons-material/Dashboard";
// import AddIcon from "@mui/icons-material/Add";
// import React, { useEffect, useMemo, useContext, useState } from "react";
// import { Collapse, LinearProgress } from "@mui/material";
// import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
// import ExpandLessIcon from "@mui/icons-material/ExpandLess";
// import { useNavigate, useLocation } from "react-router-dom";
// import SourceIcon from "@mui/icons-material/Source";
// import AssessmentIcon from "@mui/icons-material/Assessment";
// import PaletteIcon from "@mui/icons-material/Palette";
// import BrushIcon from "@mui/icons-material/Brush";
// import { useInfiniteScroll } from "../../../hooks/useInfiniteScroll";
// import { GET } from "../../../services/apiRoutes";
// import { DataSourceListData, DataSourceListPayload } from "./types";
// import { setDataSourceList } from "../../../pages/dataSources/dataSourceActions";
// import { useAppDispatch, useAppSelector } from "../../../storeHooks";
// import {
//   fetchDashboardList,
//   createDashboard,
//   deleteDashboard,
// } from "../../../pages/dashboard/dashboardActions";
// import {
//   Dashboard as DashboardType,
//   DashboardListResponse,
// } from "../../../pages/dashboard/types";
// import { toast } from "react-toastify";
// import { DeleteConfirmationModal } from "./components/DeleteConfirmationModal";
// import { SubItemsList } from "./components/SubItemsList";
// import { CreateDashboardModal } from "./components/CreateDashboardModal";
// import LogoutIcon from "@mui/icons-material/Logout";
// import logo from "../../../assets/ReportiVix-logo.png";
// import { AuthContext } from "../../../context/AuthContext";
// import { clearLocalStorage } from "../../../utils/handleLocalStorage";
// import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
// import { STYLE_GUIDE } from "../../../styles";
// import SettingsIcon from "@mui/icons-material/Settings";
// import { useUnifiedTheme } from "../../../hooks/useUnifiedTheme";
// import { useComponentTypography } from "../../../hooks/useComponentTypography";
// import BusinessIcon from "@mui/icons-material/Business";
// import AssignmentIndIcon from "@mui/icons-material/AssignmentInd";
// import NotivixLogo from "../../../assets/NotiVix-Logo-TRANS-V1.png";
// import useGet from "../../../hooks/useGet";
// import { useSelector } from "react-redux";
// import { RootState } from "../../../reducers";
// import PeopleIcon from "@mui/icons-material/People";
// import AccountTreeIcon from "@mui/icons-material/AccountTree";
// import SecurityIcon from "@mui/icons-material/Security";
// import WorkIcon from "@mui/icons-material/Work";
// import InventoryIcon from "@mui/icons-material/Inventory";
// import ManageAccountsIcon from "@mui/icons-material/ManageAccounts";

// interface ErrorResponse {
//   success: boolean;
//   message: string;
//   error: Record<string, unknown>;
// }

// const drawerWidth = 225;

// const openedMixin = (theme: Theme): CSSObject => ({
//   width: drawerWidth,
//   position: "static",
//   transition: theme.transitions.create("width", {
//     easing: theme.transitions.easing.sharp,
//     duration: theme.transitions.duration.enteringScreen,
//   }),
//   overflowX: "hidden",
// });

// const closedMixin = (theme: Theme): CSSObject => ({
//   position: "static",
//   transition: theme.transitions.create("width", {
//     easing: theme.transitions.easing.sharp,
//     duration: theme.transitions.duration.leavingScreen,
//   }),
//   overflowX: "hidden",
//   width: `calc(${theme.spacing(6)} + 1px)`,
//   [theme.breakpoints.up("sm")]: {
//     width: `calc(${theme.spacing(8)} + 1px)`,
//   },
// });

// const Drawer = styled(MuiDrawer, {
//   shouldForwardProp: (prop) => prop !== "open",
// })(({ theme }) => ({
//   width: drawerWidth,
//   flexShrink: 0,
//   whiteSpace: "nowrap",
//   boxSizing: "border-box",
//   height: "100vh",
//   position: "static",
//   backgroundColor: STYLE_GUIDE.COLORS.white,
//   "& .MuiPaper-root": {
//     backgroundColor: theme.palette.background.paper,
//     border: "none",
//     height: "100%",
//     position: "static",
//     overflow: "hidden",
//   },
//   "& .MuiDrawer-paper": {
//     position: "static",
//     overflow: "hidden",
//   },
//   "& .MuiList-root": {
//     height: "100%",
//     overflow: "hidden",
//   },
//   "& .MuiListItemButton-root": {
//     "&.Mui-selected, &.Mui-selected:hover": {
//       backgroundColor: theme.palette.action.hover,
//     },
//     "&:hover": {
//       backgroundColor: theme.palette.action.hover,
//     },
//   },
//   variants: [
//     {
//       props: ({ open }) => open,
//       style: {
//         ...openedMixin(theme),
//         "& .MuiDrawer-paper": openedMixin(theme),
//       },
//     },
//     {
//       props: ({ open }) => !open,
//       style: {
//         ...closedMixin(theme),
//         "& .MuiDrawer-paper": closedMixin(theme),
//       },
//     },
//   ],
// }));

// interface SubNavItem {
//   name: string;
//   icon: React.ReactNode;
//   route: string;
//   isCreateButton?: boolean;
//   subItems?: SubNavItem[];
//   isBold?: boolean;
// }

// interface NavItem {
//   name: string;
//   icon: React.ReactNode;
//   route: string;
//   subItems?: SubNavItem[];
// }

// export default function SideNav() {
//   const theme = useUnifiedTheme();
//   const { getNavigationSx } = useComponentTypography();
//   const { openNav } = useNav();
//   const [openSettings, setOpenSettings] = React.useState(false);
//   const [openDashboard, setOpenDashboard] = React.useState(false);
//   const [openNotificationSettings, setOpenNotificationSettings] =
//     React.useState(false);
//   const [openGlobalSettings, setOpenGlobalSettings] = React.useState(false);
//   const [openReportSettings, setOpenReportSettings] = React.useState(false);
//   const [openThemeSettings, setOpenThemeSettings] = React.useState(false);
//   const [openSystemSettings, setOpenSystemSettings] = React.useState(false);
//   const [openDataSources, setOpenDataSources] = React.useState(false);
//   const [newDashboardName, setNewDashboardName] = React.useState("");
//   const [dashboardType, setDashboardType] = React.useState<
//     "normal" | "trend" | "fixed"
//   >("normal");
//   const [timePeriod, setTimePeriod] = React.useState<string>("1m");
//   const [dataSourceId, setDataSourceId] = React.useState<string>("");
//   const [isCreatingLoading, setIsCreatingLoading] = React.useState(false);
//   const [deleteModalOpen, setDeleteModalOpen] = React.useState(false);
//   const [dashboardToDelete, setDashboardToDelete] =
//     React.useState<DashboardType | null>(null);
//   const [isDeleting, setIsDeleting] = React.useState(false);
//   const navigate = useNavigate();
//   const location = useLocation();
//   const dispatch = useAppDispatch();
//   const { dashboards, loading } = useAppSelector((state) => state.dashboard);
//   const { clearAuthContext } = useContext(AuthContext);
//   const [openCreateModal, setOpenCreateModal] = useState(false);
//   const permissions = useSelector(
//     (state: RootState) => state.userPermission?.permissions
//   );
//   const dataSourcePermissions = permissions?.["Data Source"] || {};
//   const validPermissionIds = Object.entries(dataSourcePermissions)
//     .filter(([key, permission]) => {
//       return permission.allowed === true && permission.dataSourceId?._id;
//     })
//     .map(([key, permission]) => permission.dataSourceId._id);

//   const closeAllDropdowns = () => {
//     setOpenSettings(false);
//     setOpenDashboard(false);
//     setOpenNotificationSettings(false);
//     setOpenGlobalSettings(false);
//     setOpenReportSettings(false);
//     setOpenThemeSettings(false);
//     setOpenSystemSettings(false);
//     setOpenDataSources(false);
//   };

//   useEffect(() => {
//     dispatch(fetchDashboardList());
//   }, [dispatch]);

//   const { infiniteQuery: dataSourceListAPI, lastElementRef } =
//     useInfiniteScroll<DataSourceListPayload, DataSourceListData>(
//       ["dataSourceList"],
//       GET?.DATA_SOURCE_LIST + `?canEditInline=true`,
//       10,
//       "get",
//       true
//     );

//   const dataSourceNotivixListAPI = useGet<DataSourceListPayload>(
//     ["dataSourceNotivixList"],
//     GET?.DATA_SOURCE_LIST + `?isShowMenu=true`
//   );

//   const dataSourceList = useMemo(() => {
//     return dataSourceListAPI?.data?.pages?.flatMap((page) => page?.data) || [];
//   }, [dataSourceListAPI?.data?.pages]);

//   const dataSourceNotivixList = useMemo(() => {
//     return dataSourceNotivixListAPI?.data?.data || [];
//   }, [dataSourceNotivixListAPI?.data]);

//   const matchedDataSources = useMemo(() => {
//     return dataSourceNotivixList?.filter(
//       (dataSource: any) =>
//         validPermissionIds.includes(dataSource._id) &&
//         dataSource.isShowMenu === true
//     );
//   }, [dataSourceNotivixList, validPermissionIds]);

//   useEffect(() => {
//     if (dataSourceNotivixList.length > 0)
//       dispatch(setDataSourceList(dataSourceNotivixList));
//   }, [dataSourceNotivixList, dispatch]);

//   const handleItemClick = (
//     route: string,
//     hasSubItems: boolean,
//     itemName: string
//   ) => {
//     if (hasSubItems) {
//       if (itemName === "Dashboards") {
//         if (!openDashboard) {
//           setOpenDashboard(true);
//         } else {
//           setOpenDashboard(false);
//           navigate(route);
//         }
//         navigate(route);
//       } else if (itemName === "Notification") {
//         setOpenNotificationSettings((prev) => !prev);
//         navigate(route);
//       } else if (itemName === "Settings") {
//         setOpenReportSettings((prev) => !prev);
//       } else if (itemName === "Theme Settings") {
//         setOpenThemeSettings((prev) => !prev);
//       } else if (itemName === "System Settings") {
//         setOpenSystemSettings((prev) => !prev);
//       } else if (itemName === "Data Sources") {
//         setOpenDataSources((prev) => !prev);
//       } else {
//         setOpenSettings((prev) => !prev);
//       }
//     } else {
//       closeAllDropdowns();
//       navigate(route);
//     }
//   };

//   const handleCreateDashboard = async () => {
//     if (newDashboardName.trim()) {
//       if (dashboardType === "fixed" && !dataSourceId.trim()) {
//         toast.error("Please select a data source for fixed dashboard type");
//         return;
//       }
//       try {
//         setIsCreatingLoading(true);
//         const response = (await dispatch(
//           createDashboard({
//             name: newDashboardName.trim(),
//             dashboardType,
//             dynamicVersionValue: timePeriod,
//             dataSourceId: dashboardType === "fixed" ? dataSourceId : undefined,
//           })
//         ).unwrap()) as DashboardListResponse;
//         await dispatch(fetchDashboardList());
//         setOpenCreateModal(false);
//         setNewDashboardName("");
//         setDashboardType("normal");
//         setTimePeriod("1m");
//         toast.success(response.message || "Dashboard created successfully!");
//         const newDashboard = response?.data;
//         if (newDashboard) {
//           navigate(`/dashboard/${newDashboard._id}`, {
//             state: { enableEditMode: true },
//           });
//         }
//       } catch (error:
//         | { payload?: { message: string }; message?: string }
//         | unknown) {
//         const errorMessage =
//           error && typeof error === "object" && "payload" in error
//             ? (error.payload as { message?: string })?.message
//             : error && typeof error === "object" && "message" in error
//               ? (error as { message?: string })?.message
//               : "Failed to create dashboard. Please try again.";
//         toast.error(errorMessage);
//       } finally {
//         setIsCreatingLoading(false);
//       }
//     }
//   };

//   const handleCloseCreateModal = () => {
//     setOpenCreateModal(false);
//     setNewDashboardName("");
//     setDashboardType("normal");
//     setTimePeriod("1m");
//     setDataSourceId("");
//   };

//   const handleDeleteClick = (e: React.MouseEvent, dashboard: DashboardType) => {
//     e.stopPropagation();
//     setDashboardToDelete(dashboard);
//     setDeleteModalOpen(true);
//   };

//   const handleDeleteConfirm = async () => {
//     if (dashboardToDelete) {
//       try {
//         setIsDeleting(true);
//         await dispatch(deleteDashboard(dashboardToDelete._id)).unwrap();
//         dispatch(fetchDashboardList());
//         toast.success("Dashboard deleted successfully!");
//         if (location.pathname === `/dashboard/${dashboardToDelete._id}`) {
//           navigate("/dashboard");
//         }
//         setDeleteModalOpen(false);
//         setDashboardToDelete(null);
//       } catch (error) {
//         const errorResponse = error as ErrorResponse;
//         toast.error(
//           errorResponse.message ||
//             "Failed to delete dashboard. Please try again."
//         );
//       } finally {
//         setIsDeleting(false);
//       }
//     }
//   };

//   const handleDeleteCancel = () => {
//     setDeleteModalOpen(false);
//     setDashboardToDelete(null);
//   };

//   const handleLogout = () => {
//     clearAuthContext();
//     clearLocalStorage();
//     navigate("/login");
//   };

//   const navItems: NavItem[] = useMemo(() => {
//     const createIcon = (IconComponent: React.ElementType, route: string) => {
//       return (
//         <IconComponent
//           sx={{
//             fontSize: STYLE_GUIDE.TYPOGRAPHY.fontSize.base,
//             color: location.pathname.startsWith(route)
//               ? theme.palette.primary.main
//               : theme.getIconColor(),
//           }}
//         />
//       );
//     };
//     // Monthly data sources
//     const monthlyDataSources = matchedDataSources
//       .filter((item) => item.versionType === "monthly")
//       .map((item) => ({
//         name: item?.name ?? "",
//         icon: createIcon(SourceIcon, `/data-source-new/${item?._id}`),
//         route: `/data-source-new/${item?._id}`,
//       }));
//     // Constant data sources
//     const constantDataSources = matchedDataSources
//       .filter((item) => item.versionType === "constant")
//       .map((item) => ({
//         name: item?.name ?? "",
//         icon: createIcon(SourceIcon, `/data-source-new/${item?._id}`),
//         route: `/data-source-new/${item?._id}`,
//       }));
//     // Alerts menu item
//     const alertsMenuItem = {
//       name: "Alerts",
//       icon: createIcon(SourceIcon, "/notification"),
//       route: "/notification",
//     };
//     // Loading indicator
//     const loadingIndicator =
//       dataSourceListAPI?.hasNextPage || dataSourceNotivixListAPI?.isLoading
//         ? [
//             {
//               name: "",
//               icon: (
//                 <div ref={lastElementRef} style={{ paddingLeft: "1.5rem" }}>
//                   <LinearProgress />
//                 </div>
//               ),
//               route: "#",
//             },
//           ]
//         : [];
//     // Combined data sources with loading indicator
//     const dataSourceItems = [
//       ...monthlyDataSources,
//       ...loadingIndicator,
//       alertsMenuItem,
//     ];
//     // Data sources for Theme Settings submenu
//     const themeSettingsDataSources = dataSourceList.map((item) => ({
//       name: item?.name ?? "",
//       icon: createIcon(SourceIcon, `/data-source/${item?._id}`),
//       route: `/data-source/${item?._id}`,
//     }));
//     return [
//       {
//         name: "Dashboards",
//         icon: (
//           <DashboardIcon
//             sx={{ fontSize: STYLE_GUIDE.TYPOGRAPHY.fontSize.base }}
//           />
//         ),
//         route: "/dashboard",
//         subItems: [
//           {
//             name: "Create New Dashboard",
//             icon: (
//               <AddIcon
//                 sx={{
//                   fontSize: getNavigationSx().fontSize,
//                   color: theme.getIconColor(),
//                 }}
//               />
//             ),
//             route: "#",
//             isCreateButton: true,
//           },
//           ...(loading
//             ? [
//                 {
//                   name: "...",
//                   icon: <></>,
//                   route: "#",
//                 },
//               ]
//             : [
//                 ...dashboards.slice(0, 5).map((dashboard: DashboardType) => ({
//                   name: dashboard.name,
//                   icon: <></>,
//                   route: `/dashboard/${dashboard._id}`,
//                 })),
//                 {
//                   name: "All Dashboards",
//                   icon: <></>,
//                   route: "/dashboard",
//                   isMoreLink: true,
//                 },
//               ]),
//         ],
//       },
//       {
//         name: "Data Upload",
//         icon: createIcon(AssessmentIcon, "/reports"),
//         route: "/reports",
//       },
//       {
//         name: "Reports",
//         icon: createIcon(AssessmentIcon, "/reports"),
//         route: "/reports",
//       },
//       {
//         name: "Notifications",
//         icon: createIcon(SourceIcon, "/data-source"),
//         route: "/data-source",
//         subItems: dataSourceItems,
//       },
//       {
//         name: "VixAI Insights",
//         icon: createIcon(AutoAwesomeIcon, "/VixAi-Insights"),
//         route: "/VixAi-Insights",
//       },
//       {
//         name: "Settings",
//         icon: createIcon(SettingsIcon, "/settings"),
//         route: "/settings",
//         subItems: [
//           {
//             name: "Attribute Option",
//             icon: createIcon(AutoAwesomeIcon, "/attribute-option"),
//             route: "/attribute-option",
//             isBold: true,
//           },
//           {
//             name: "Entity",
//             icon: createIcon(AutoAwesomeIcon, "/entity"),
//             route: "/entity",
//             isBold: true,
//           },
//           {
//             name: "Theme Settings",
//             icon: createIcon(PaletteIcon, "/theme-settings"),
//             route: "#",
//             isBold: true,
//             subItems: [
//               {
//                 name: "Create Theme",
//                 icon: createIcon(PaletteIcon, "/create-theme"),
//                 route: "/create-theme",
//               },
//               {
//                 name: "Layout Themes",
//                 icon: createIcon(BrushIcon, "/themes"),
//                 route: "/themes",
//               },
//             ],
//           },
//           {
//             name: "Data Sources",
//             icon: createIcon(SourceIcon, "/datasources"),
//             route: "#",
//             isBold: true,
//             subItems: themeSettingsDataSources,
//           },
//           {
//             name: "Report Settings",
//             icon: createIcon(SettingsIcon, "/report-settings"),
//             route: "/report-settings",
//             isBold: true,
//           },
//           ...constantDataSources,
//           {
//             name: "System Settings",
//             icon: createIcon(ManageAccountsIcon, "/system-settings"),
//             route: "#",
//             isBold: true,
//             subItems: [
//               {
//                 name: "Roles",
//                 icon: createIcon(AssignmentIndIcon, "/roles"),
//                 route: "/roles",
//               },
//               {
//                 name: "Organization",
//                 icon: createIcon(BusinessIcon, "/organization"),
//                 route: "/organization",
//               },
//               {
//                 name: "Permission",
//                 icon: createIcon(SecurityIcon, "/permission"),
//                 route: "/permission",
//               },
//               {
//                 name: "Department",
//                 icon: createIcon(AccountTreeIcon, "/department"),
//                 route: "/department",
//               },
//               {
//                 name: "Designation",
//                 icon: createIcon(WorkIcon, "/designation"),
//                 route: "/designation",
//               },
//               {
//                 name: "Product",
//                 icon: createIcon(InventoryIcon, "/product"),
//                 route: "/product",
//               },
//               {
//                 name: "User Setting",
//                 icon: createIcon(PeopleIcon, "/user-setting"),
//                 route: "/user-setting",
//               },
//               {
//                 name: "Notifix Roles",
//                 icon: createIcon(AssignmentIndIcon, "/settings/roles"),
//                 route: "/settings/roles",
//               },
//               {
//                 name: "Notifix Permissions",
//                 icon: createIcon(SecurityIcon, "/permissions"),
//                 route: "/permissions",
//               },
//               {
//                 name: "Notifix Organization",
//                 icon: createIcon(BusinessIcon, "/settings/organization"),
//                 route: "/settings/organization",
//               },
//             ],
//           },
//         ],
//       },
//       {
//         name: "User Logs",
//         icon: createIcon(SettingsIcon, "/settings"),
//         route: "/settings",
//       },
//     ];
//   }, [
//     loading,
//     dashboards,
//     dataSourceList,
//     matchedDataSources,
//     dataSourceListAPI?.hasNextPage,
//     dataSourceNotivixListAPI?.isLoading,
//     lastElementRef,
//   ]);

//   const isRouteActive = (route: string) => {
//     return location.pathname.startsWith(route);
//   };

//   return (
//     <Box sx={{ display: "flex", height: "100%" }}>
//       <Drawer variant="permanent" open={openNav} sx={{ p: 0 }}>
//         <Box
//           sx={{
//             display: "flex",
//             flexDirection: "column",
//             height: "100vh",
//             width: openNav ? drawerWidth : `calc(${theme.spacing(7)} + 1px)`,
//             overflow: "hidden",
//           }}
//         >
//           <Box
//             sx={{
//               display: "flex",
//               justifyContent: "center",
//               alignItems: "center",
//               height: "50px",
//               borderBottom: `1px solid ${theme.palette.divider}`,
//               flexShrink: 0,
//             }}
//           >
//             <Box
//               component="img"
//               src={logo}
//               alt="Logo"
//               sx={{
//                 width: openNav ? 120 : 40,
//                 height: "auto",
//                 transition: "width 0.2s ease-in-out",
//               }}
//             />
//           </Box>
//           <List
//             sx={{
//               py: 0,
//               flex: 1,
//               overflowY: "auto",
//               overflowX: "hidden",
//               "&::-webkit-scrollbar": {
//                 width: "6px",
//               },
//               "&::-webkit-scrollbar-track": {
//                 background: "transparent",
//               },
//               "&::-webkit-scrollbar-thumb": {
//                 background: theme.palette.action.hover,
//                 borderRadius: "3px",
//               },
//               "&::-webkit-scrollbar-thumb:hover": {
//                 background: theme.palette.action.selected,
//               },
//             }}
//           >
//             {navItems.map((item, i) => (
//               <React.Fragment key={i}>
//                 <ListItem
//                   disablePadding
//                   sx={{
//                     display: "block",
//                     mb: 0.5,
//                   }}
//                 >
//                   <ListItemButton
//                     onClick={(e) => {
//                       e.stopPropagation();
//                       handleItemClick(item.route, !!item.subItems, item.name);
//                     }}
//                     sx={{
//                       minHeight: 42,
//                       mx: 1.5,
//                       px: 2,
//                       borderRadius: "8px",
//                       justifyContent: openNav ? "initial" : "center",
//                       backgroundColor: isRouteActive(item.route)
//                         ? "#ffffff"
//                         : "transparent",
//                       color: isRouteActive(item.route)
//                         ? theme.palette.primary.main
//                         : theme.palette.text.primary,
//                       "& .MuiListItemIcon-root": {
//                         color: isRouteActive(item.route)
//                           ? theme.palette.primary.main
//                           : theme.palette.text.primary,
//                       },
//                       "&:hover": {
//                         backgroundColor: isRouteActive(item.route)
//                           ? "#ffffff"
//                           : theme.palette.action.hover,
//                         borderRadius: "8px",
//                       },
//                     }}
//                   >
//                     <ListItemIcon
//                       sx={{
//                         minWidth: 0,
//                         mr: openNav ? 2 : "auto",
//                         justifyContent: "center",
//                       }}
//                     >
//                       {item.icon}
//                     </ListItemIcon>
//                     <ListItemText
//                       primary={item.name}
//                       sx={{
//                         opacity: openNav ? 1 : 0,
//                         m: 0,
//                         "& .MuiListItemText-primary": {
//                           ...getNavigationSx(),
//                           color: isRouteActive(item.route)
//                             ? theme.palette.primary.main
//                             : theme.palette.text.primary,
//                         },
//                       }}
//                     />
//                     {item.subItems &&
//                       openNav &&
//                       ((item.name === "Dashboards" && openDashboard) ||
//                       (item.name === "Notification" &&
//                         openNotificationSettings) ||
//                       (item.name === "Settings" && openReportSettings) ||
//                       (item.name === "Theme Settings" && openThemeSettings) ||
//                       (item.name === "Data Sources" && openDataSources) ||
//                       (item.name === "System Settings" &&
//                         openSystemSettings) ? (
//                         <ExpandLessIcon
//                           sx={{
//                             fontSize: getNavigationSx().fontSize,
//                             color: isRouteActive(item.route)
//                               ? theme.palette.primary.main
//                               : theme.palette.text.primary,
//                           }}
//                         />
//                       ) : (
//                         <ExpandMoreIcon
//                           sx={{
//                             fontSize: getNavigationSx().fontSize,
//                             color: isRouteActive(item.route)
//                               ? theme.palette.primary.main
//                               : theme.palette.text.primary,
//                           }}
//                         />
//                       ))}
//                   </ListItemButton>
//                 </ListItem>
//                 {item.subItems && openNav && (
//                   <Collapse
//                     in={
//                       item.name === "Dashboards"
//                         ? openDashboard
//                         : item.name === "Notification"
//                           ? openNotificationSettings
//                           : item.name === "Settings"
//                             ? openReportSettings
//                             : item.name === "Theme Settings"
//                               ? openThemeSettings
//                               : item.name === "Data Sources"
//                                 ? openDataSources
//                                 : item.name === "System Settings"
//                                   ? openSystemSettings
//                                   : openSettings
//                     }
//                     timeout="auto"
//                     unmountOnExit
//                   >
//                     <List
//                       component="div"
//                       disablePadding
//                       sx={{
//                         maxHeight: "300px",
//                         overflowY: "auto",
//                         overflowX: "hidden",
//                         "&::-webkit-scrollbar": {
//                           width: "6px",
//                         },
//                         "&::-webkit-scrollbar-track": {
//                           background: "transparent",
//                         },
//                         "&::-webkit-scrollbar-thumb": {
//                           background: theme.palette.action.hover,
//                           borderRadius: "3px",
//                         },
//                         "&::-webkit-scrollbar-thumb:hover": {
//                           background: theme.palette.action.selected,
//                         },
//                       }}
//                     >
//                       {item.name === "Dashboards" && (
//                         <ListItem
//                           disablePadding
//                           sx={{ display: "block", mb: 0.5 }}
//                         >
//                           <ListItemButton
//                             onClick={(e) => {
//                               e.stopPropagation();
//                               setOpenCreateModal(true);
//                             }}
//                             sx={{
//                               minHeight: 36,
//                               px: STYLE_GUIDE.SPACING.s4,
//                               pl: STYLE_GUIDE.SPACING.s4,
//                               borderRadius: "8px",
//                               mx: STYLE_GUIDE.SPACING.s3,
//                               "&:hover": {
//                                 backgroundColor:
//                                   STYLE_GUIDE.COLORS.backgroundDefault,
//                               },
//                             }}
//                           >
//                             <ListItemIcon
//                               sx={{
//                                 minWidth: 0,
//                                 mr: 1,
//                                 justifyContent: "center",
//                               }}
//                             >
//                               <AddIcon
//                                 sx={{
//                                   fontSize: getNavigationSx().fontSize,
//                                   color: theme.getIconColor(),
//                                 }}
//                               />
//                             </ListItemIcon>
//                             <ListItemText
//                               primary="Create New Dashboard"
//                               sx={{
//                                 m: 0,
//                                 "& .MuiListItemText-primary": {
//                                   ...getNavigationSx(),
//                                 },
//                               }}
//                             />
//                           </ListItemButton>
//                         </ListItem>
//                       )}
//                       {item.name === "Settings" ? (
//                         <>
//                           {item.subItems?.map((subItem, subIndex) => (
//                             <React.Fragment key={subIndex}>
//                               {subItem.subItems ? (
//                                 <ListItem
//                                   disablePadding
//                                   sx={{ display: "block", mb: 0.5 }}
//                                 >
//                                   <ListItemButton
//                                     onClick={(e) => {
//                                       e.stopPropagation();
//                                       handleItemClick(
//                                         subItem.route,
//                                         !!subItem.subItems,
//                                         subItem.name
//                                       );
//                                     }}
//                                     sx={{
//                                       minHeight: 36,
//                                       px: STYLE_GUIDE.SPACING.s4,
//                                       pl: STYLE_GUIDE.SPACING.s4,
//                                       borderRadius: "8px",
//                                       mx: STYLE_GUIDE.SPACING.s3,
//                                       "&:hover": {
//                                         backgroundColor:
//                                           STYLE_GUIDE.COLORS.backgroundDefault,
//                                       },
//                                     }}
//                                   >
//                                     <ListItemIcon
//                                       sx={{
//                                         minWidth: 0,
//                                         mr: 1,
//                                         justifyContent: "center",
//                                       }}
//                                     >
//                                       {subItem.icon}
//                                     </ListItemIcon>
//                                     <ListItemText
//                                       primary={subItem.name}
//                                       sx={{
//                                         m: 0,
//                                         "& .MuiListItemText-primary": {
//                                           ...getNavigationSx(),
//                                           fontWeight: subItem.isBold
//                                             ? 600
//                                             : 400,
//                                           color: subItem.isBold
//                                             ? theme.palette.text.primary
//                                             : theme.palette.text.secondary,
//                                         },
//                                       }}
//                                     />
//                                     {openNav &&
//                                       ((subItem.name === "Theme Settings" &&
//                                         openThemeSettings) ||
//                                       (subItem.name === "Data Sources" &&
//                                         openDataSources) ||
//                                       (subItem.name === "System Settings" &&
//                                         openSystemSettings) ? (
//                                         <ExpandLessIcon
//                                           sx={{
//                                             fontSize:
//                                               getNavigationSx().fontSize,
//                                           }}
//                                         />
//                                       ) : (
//                                         <ExpandMoreIcon
//                                           sx={{
//                                             fontSize:
//                                               getNavigationSx().fontSize,
//                                           }}
//                                         />
//                                       ))}
//                                   </ListItemButton>
//                                   <Collapse
//                                     in={
//                                       subItem.name === "Theme Settings"
//                                         ? openThemeSettings
//                                         : subItem.name === "Data Sources"
//                                           ? openDataSources
//                                           : subItem.name === "System Settings"
//                                             ? openSystemSettings
//                                             : false
//                                     }
//                                     timeout="auto"
//                                     unmountOnExit
//                                   >
//                                     <List
//                                       component="div"
//                                       disablePadding
//                                       sx={{
//                                         maxHeight: "250px",
//                                         overflowY: "auto",
//                                         overflowX: "hidden",
//                                         "&::-webkit-scrollbar": {
//                                           width: "6px",
//                                         },
//                                         "&::-webkit-scrollbar-track": {
//                                           background: "transparent",
//                                         },
//                                         "&::-webkit-scrollbar-thumb": {
//                                           background: theme.palette.action.hover,
//                                           borderRadius: "3px",
//                                         },
//                                         "&::-webkit-scrollbar-thumb:hover": {
//                                           background: theme.palette.action.selected,
//                                         },
//                                       }}
//                                     >
//                                       {subItem.subItems?.map(
//                                         (nestedItem, nestedIndex) => (
//                                           <ListItem
//                                             key={nestedIndex}
//                                             disablePadding
//                                             sx={{ display: "block", mb: 0.5 }}
//                                           >
//                                             <ListItemButton
//                                               onClick={(e) => {
//                                                 e.stopPropagation();
//                                                 closeAllDropdowns();
//                                                 navigate(nestedItem.route);
//                                               }}
//                                               sx={{
//                                                 minHeight: 36,
//                                                 px: STYLE_GUIDE.SPACING.s4,
//                                                 pl: STYLE_GUIDE.SPACING.s8,
//                                                 borderRadius: "8px",
//                                                 mx: STYLE_GUIDE.SPACING.s3,
//                                                 "&:hover": {
//                                                   backgroundColor:
//                                                     STYLE_GUIDE.COLORS
//                                                       .backgroundDefault,
//                                                 },
//                                               }}
//                                             >
//                                               <ListItemIcon
//                                                 sx={{
//                                                   minWidth: 0,
//                                                   mr: 1,
//                                                   justifyContent: "center",
//                                                 }}
//                                               >
//                                                 {nestedItem.icon}
//                                               </ListItemIcon>
//                                               <ListItemText
//                                                 primary={nestedItem.name}
//                                                 sx={{
//                                                   m: 0,
//                                                   "& .MuiListItemText-primary":
//                                                     {
//                                                       ...getNavigationSx(),
//                                                     },
//                                                 }}
//                                               />
//                                             </ListItemButton>
//                                           </ListItem>
//                                         )
//                                       )}
//                                     </List>
//                                   </Collapse>
//                                 </ListItem>
//                               ) : (
//                                 <ListItem
//                                   disablePadding
//                                   sx={{ display: "block", mb: 0.5 }}
//                                 >
//                                   <ListItemButton
//                                     onClick={(e) => {
//                                       e.stopPropagation();
//                                       closeAllDropdowns();
//                                       navigate(subItem.route);
//                                     }}
//                                     sx={{
//                                       minHeight: 36,
//                                       px: STYLE_GUIDE.SPACING.s4,
//                                       pl: STYLE_GUIDE.SPACING.s4,
//                                       borderRadius: "8px",
//                                       mx: STYLE_GUIDE.SPACING.s3,
//                                       "&:hover": {
//                                         backgroundColor:
//                                           STYLE_GUIDE.COLORS.backgroundDefault,
//                                       },
//                                     }}
//                                   >
//                                     <ListItemIcon
//                                       sx={{
//                                         minWidth: 0,
//                                         mr: 1,
//                                         justifyContent: "center",
//                                       }}
//                                     >
//                                       {subItem.icon}
//                                     </ListItemIcon>
//                                     <ListItemText
//                                       primary={subItem.name}
//                                       sx={{
//                                         m: 0,
//                                         "& .MuiListItemText-primary": {
//                                           ...getNavigationSx(),
//                                           fontWeight: subItem.isBold
//                                             ? 600
//                                             : 400,
//                                           color: subItem.isBold
//                                             ? theme.palette.text.primary
//                                             : theme.palette.text.secondary,
//                                         },
//                                       }}
//                                     />
//                                   </ListItemButton>
//                                 </ListItem>
//                               )}
//                             </React.Fragment>
//                           ))}
//                         </>
//                       ) : (
//                         <SubItemsList
//                           subItems={item.subItems.filter(
//                             (subItem) => !subItem.isCreateButton
//                           )}
//                           openNav={openNav}
//                           parentName={item.name}
//                           dashboards={dashboards}
//                           onDeleteClick={handleDeleteClick}
//                           onCreateClick={() => setOpenCreateModal(true)}
//                         />
//                       )}
//                     </List>
//                   </Collapse>
//                 )}
//               </React.Fragment>
//             ))}
//           </List>
//           <Box
//             sx={{
//               px: STYLE_GUIDE.SPACING.s4,
//               pb: STYLE_GUIDE.SPACING.s2,
//               mt: "auto",
//               flexShrink: 0,
//             }}
//           >
//             <ListItemButton
//               onClick={(e) => {
//                 e.stopPropagation();
//                 handleLogout();
//               }}
//               sx={{
//                 minHeight: 42,
//                 px: STYLE_GUIDE.SPACING.s4,
//                 borderRadius: "8px",
//                 justifyContent: openNav ? "initial" : "center",
//                 color: theme.palette.text.primary,
//                 "&:hover": {
//                   backgroundColor: theme.palette.action.hover,
//                 },
//               }}
//             >
//               <ListItemIcon
//                 sx={{
//                   minWidth: 0,
//                   mr: openNav ? STYLE_GUIDE.SPACING.s4 : "auto",
//                   justifyContent: "center",
//                 }}
//               >
//                 <LogoutIcon sx={{ color: theme.getIconColor() }} />
//               </ListItemIcon>
//               <ListItemText
//                 primary="Logout"
//                 sx={{
//                   opacity: openNav ? 1 : 0,
//                   m: 0,
//                   "& .MuiListItemText-primary": {
//                     ...getNavigationSx(),
//                   },
//                 }}
//               />
//             </ListItemButton>
//           </Box>
//         </Box>
//       </Drawer>
//       <CreateDashboardModal
//         open={openCreateModal}
//         onClose={handleCloseCreateModal}
//         newDashboardName={newDashboardName}
//         onNameChange={setNewDashboardName}
//         onCreate={handleCreateDashboard}
//         isCreating={isCreatingLoading}
//         dashboardType={dashboardType}
//         onDashboardTypeChange={setDashboardType}
//         timePeriod={timePeriod}
//         onTimePeriodChange={setTimePeriod}
//         dataSourceId={dataSourceId}
//         onDataSourceChange={setDataSourceId}
//       />
//       <DeleteConfirmationModal
//         open={deleteModalOpen}
//         dashboard={dashboardToDelete}
//         onConfirm={handleDeleteConfirm}
//         onCancel={handleDeleteCancel}
//         isDeleting={isDeleting}
//       />
//     </Box>
//   );
// }

// // SideNav component
// import { styled, Theme, CSSObject } from "@mui/material/styles";
// import Box from "@mui/material/Box";
// import MuiDrawer from "@mui/material/Drawer";
// import List from "@mui/material/List";
// import ListItem from "@mui/material/ListItem";
// import ListItemButton from "@mui/material/ListItemButton";
// import ListItemIcon from "@mui/material/ListItemIcon";
// import ListItemText from "@mui/material/ListItemText";
// import { useNav } from "../../../context/NavContext";
// import DashboardIcon from "@mui/icons-material/Dashboard";
// import AddIcon from "@mui/icons-material/Add";
// import React, { useEffect, useMemo, useContext, useState } from "react";
// import { Collapse, LinearProgress } from "@mui/material";
// import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
// import ExpandLessIcon from "@mui/icons-material/ExpandLess";
// import { useNavigate, useLocation } from "react-router-dom";
// import SourceIcon from "@mui/icons-material/Source";
// import AssessmentIcon from "@mui/icons-material/Assessment";
// import PaletteIcon from "@mui/icons-material/Palette";
// import BrushIcon from "@mui/icons-material/Brush";
// import { useInfiniteScroll } from "../../../hooks/useInfiniteScroll";
// import { GET } from "../../../services/apiRoutes";
// import { DataSourceListData, DataSourceListPayload } from "./types";
// import { setDataSourceList } from "../../../pages/dataSources/dataSourceActions";
// import { useAppDispatch, useAppSelector } from "../../../storeHooks";
// import {
//   fetchDashboardList,
//   createDashboard,
//   deleteDashboard,
// } from "../../../pages/dashboard/dashboardActions";
// import {
//   Dashboard as DashboardType,
//   DashboardListResponse,
// } from "../../../pages/dashboard/types";
// import { toast } from "react-toastify";
// import { DeleteConfirmationModal } from "./components/DeleteConfirmationModal";
// import { SubItemsList } from "./components/SubItemsList";
// import { CreateDashboardModal } from "./components/CreateDashboardModal";
// import LogoutIcon from "@mui/icons-material/Logout";
// import logo from "../../../assets/ReportiVix-logo.png";
// import { AuthContext } from "../../../context/AuthContext";
// import { clearLocalStorage } from "../../../utils/handleLocalStorage";
// import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
// import { STYLE_GUIDE } from "../../../styles";
// import SettingsIcon from "@mui/icons-material/Settings";
// import { useUnifiedTheme } from "../../../hooks/useUnifiedTheme";
// import { useComponentTypography } from "../../../hooks/useComponentTypography";
// import BusinessIcon from "@mui/icons-material/Business";
// import AssignmentIndIcon from "@mui/icons-material/AssignmentInd";
// import NotivixLogo from "../../../assets/NotiVix-Logo-TRANS-V1.png";
// import useGet from "../../../hooks/useGet";
// import { useSelector } from "react-redux";
// import { RootState } from "../../../reducers";
// import PeopleIcon from "@mui/icons-material/People";
// import AccountTreeIcon from "@mui/icons-material/AccountTree";
// import SecurityIcon from "@mui/icons-material/Security";
// import WorkIcon from "@mui/icons-material/Work";
// import InventoryIcon from "@mui/icons-material/Inventory";
// import ManageAccountsIcon from "@mui/icons-material/ManageAccounts";

// interface ErrorResponse {
//   success: boolean;
//   message: string;
//   error: Record<string, unknown>;
// }

// const drawerWidth = 225;

// const openedMixin = (theme: Theme): CSSObject => ({
//   width: drawerWidth,
//   position: "static",
//   transition: theme.transitions.create("width", {
//     easing: theme.transitions.easing.sharp,
//     duration: theme.transitions.duration.enteringScreen,
//   }),
//   overflowX: "hidden",
// });

// const closedMixin = (theme: Theme): CSSObject => ({
//   position: "static",
//   transition: theme.transitions.create("width", {
//     easing: theme.transitions.easing.sharp,
//     duration: theme.transitions.duration.leavingScreen,
//   }),
//   overflowX: "hidden",
//   width: `calc(${theme.spacing(6)} + 1px)`,
//   [theme.breakpoints.up("sm")]: {
//     width: `calc(${theme.spacing(8)} + 1px)`,
//   },
// });

// const Drawer = styled(MuiDrawer, {
//   shouldForwardProp: (prop) => prop !== "open",
// })(({ theme }) => ({
//   width: drawerWidth,
//   flexShrink: 0,
//   whiteSpace: "nowrap",
//   boxSizing: "border-box",
//   height: "100vh",
//   position: "static",
//   backgroundColor: STYLE_GUIDE.COLORS.white,
//   "& .MuiPaper-root": {
//     backgroundColor: theme.palette.background.paper,
//     border: "none",
//     height: "100%",
//     position: "static",
//     overflow: "hidden",
//   },
//   "& .MuiDrawer-paper": {
//     position: "static",
//     overflow: "hidden",
//   },
//   "& .MuiList-root": {
//     height: "100%",
//     overflow: "hidden",
//   },
//   "& .MuiListItemButton-root": {
//     "&.Mui-selected, &.Mui-selected:hover": {
//       backgroundColor: theme.palette.action.hover,
//     },
//     "&:hover": {
//       backgroundColor: theme.palette.action.hover,
//     },
//   },
//   variants: [
//     {
//       props: ({ open }) => open,
//       style: {
//         ...openedMixin(theme),
//         "& .MuiDrawer-paper": openedMixin(theme),
//       },
//     },
//     {
//       props: ({ open }) => !open,
//       style: {
//         ...closedMixin(theme),
//         "& .MuiDrawer-paper": closedMixin(theme),
//       },
//     },
//   ],
// }));

// interface SubNavItem {
//   name: string;
//   icon: React.ReactNode;
//   route: string;
//   isCreateButton?: boolean;
//   subItems?: SubNavItem[];
//   isBold?: boolean;
// }

// interface NavItem {
//   name: string;
//   icon: React.ReactNode;
//   route: string;
//   subItems?: SubNavItem[];
// }

// export default function SideNav() {
//   const theme = useUnifiedTheme();
//   const { getNavigationSx } = useComponentTypography();
//   const { openNav } = useNav();
//   const [openSettings, setOpenSettings] = React.useState(false);
//   const [openDashboard, setOpenDashboard] = React.useState(false);
//   const [openNotificationSettings, setOpenNotificationSettings] =
//     React.useState(false);
//   const [openGlobalSettings, setOpenGlobalSettings] = React.useState(false);
//   const [openReportSettings, setOpenReportSettings] = React.useState(false);
//   const [openThemeSettings, setOpenThemeSettings] = React.useState(false);
//   const [openSystemSettings, setOpenSystemSettings] = React.useState(false);
//   const [openDataSources, setOpenDataSources] = React.useState(false);
//   const [newDashboardName, setNewDashboardName] = React.useState("");
//   const [dashboardType, setDashboardType] = React.useState<
//     "normal" | "trend" | "fixed"
//   >("normal");
//   const [timePeriod, setTimePeriod] = React.useState<string>("1m");
//   const [dataSourceId, setDataSourceId] = React.useState<string>("");
//   const [isCreatingLoading, setIsCreatingLoading] = React.useState(false);
//   const [deleteModalOpen, setDeleteModalOpen] = React.useState(false);
//   const [dashboardToDelete, setDashboardToDelete] =
//     React.useState<DashboardType | null>(null);
//   const [isDeleting, setIsDeleting] = React.useState(false);
//   const navigate = useNavigate();
//   const location = useLocation();
//   const dispatch = useAppDispatch();
//   const { dashboards, loading } = useAppSelector((state) => state.dashboard);
//   const { clearAuthContext } = useContext(AuthContext);
//   const [openCreateModal, setOpenCreateModal] = useState(false);
//   const permissions = useSelector(
//     (state: RootState) => state.userPermission?.permissions
//   );
//   const dataSourcePermissions = permissions?.["Data Source"] || {};
//   const validPermissionIds = Object.entries(dataSourcePermissions)
//     .filter(([key, permission]) => {
//       return permission.allowed === true && permission.dataSourceId?._id;
//     })
//     .map(([key, permission]) => permission.dataSourceId._id);

//   const closeAllDropdowns = () => {
//     setOpenSettings(false);
//     setOpenDashboard(false);
//     setOpenNotificationSettings(false);
//     setOpenGlobalSettings(false);
//     setOpenReportSettings(false);
//     setOpenThemeSettings(false);
//     setOpenSystemSettings(false);
//     setOpenDataSources(false);
//   };

//   useEffect(() => {
//     dispatch(fetchDashboardList());
//   }, [dispatch]);

//   const { infiniteQuery: dataSourceListAPI, lastElementRef } =
//     useInfiniteScroll<DataSourceListPayload, DataSourceListData>(
//       ["dataSourceList"],
//       GET?.DATA_SOURCE_LIST + `?canEditInline=true`,
//       10,
//       "get",
//       true
//     );

//   const dataSourceNotivixListAPI = useGet<DataSourceListPayload>(
//     ["dataSourceNotivixList"],
//     GET?.DATA_SOURCE_LIST + `?isShowMenu=true`
//   );

//   const dataSourceList = useMemo(() => {
//     return dataSourceListAPI?.data?.pages?.flatMap((page) => page?.data) || [];
//   }, [dataSourceListAPI?.data?.pages]);

//   const dataSourceNotivixList = useMemo(() => {
//     return dataSourceNotivixListAPI?.data?.data || [];
//   }, [dataSourceNotivixListAPI?.data]);

//   const matchedDataSources = useMemo(() => {
//     return dataSourceNotivixList?.filter(
//       (dataSource: any) =>
//         validPermissionIds.includes(dataSource._id) &&
//         dataSource.isShowMenu === true
//     );
//   }, [dataSourceNotivixList, validPermissionIds]);

//   useEffect(() => {
//     if (dataSourceNotivixList.length > 0)
//       dispatch(setDataSourceList(dataSourceNotivixList));
//   }, [dataSourceNotivixList, dispatch]);

//   const handleItemClick = (
//     route: string,
//     hasSubItems: boolean,
//     itemName: string
//   ) => {
//     if (hasSubItems) {
//       if (itemName === "Dashboards") {
//         if (!openDashboard) {
//           setOpenDashboard(true);
//         } else {
//           setOpenDashboard(false);
//           navigate(route);
//         }
//         navigate(route);
//       } else if (itemName === "Notification") {
//         setOpenNotificationSettings((prev) => !prev);
//         navigate(route);
//       } else if (itemName === "Settings") {
//         setOpenReportSettings((prev) => !prev);
//       } else if (itemName === "Theme Settings") {
//         setOpenThemeSettings((prev) => !prev);
//       } else if (itemName === "System Settings") {
//         setOpenSystemSettings((prev) => !prev);
//       } else if (itemName === "Data Sources") {
//         setOpenDataSources((prev) => !prev);
//       } else {
//         setOpenSettings((prev) => !prev);
//       }
//     } else {
//       closeAllDropdowns();
//       navigate(route);
//     }
//   };

//   const handleCreateDashboard = async () => {
//     if (newDashboardName.trim()) {
//       if (dashboardType === "fixed" && !dataSourceId.trim()) {
//         toast.error("Please select a data source for fixed dashboard type");
//         return;
//       }
//       try {
//         setIsCreatingLoading(true);
//         const response = (await dispatch(
//           createDashboard({
//             name: newDashboardName.trim(),
//             dashboardType,
//             dynamicVersionValue: timePeriod,
//             dataSourceId: dashboardType === "fixed" ? dataSourceId : undefined,
//           })
//         ).unwrap()) as DashboardListResponse;
//         await dispatch(fetchDashboardList());
//         setOpenCreateModal(false);
//         setNewDashboardName("");
//         setDashboardType("normal");
//         setTimePeriod("1m");
//         toast.success(response.message || "Dashboard created successfully!");
//         const newDashboard = response?.data;
//         if (newDashboard) {
//           navigate(`/dashboard/${newDashboard._id}`, {
//             state: { enableEditMode: true },
//           });
//         }
//       } catch (error:
//         | { payload?: { message: string }; message?: string }
//         | unknown) {
//         const errorMessage =
//           error && typeof error === "object" && "payload" in error
//             ? (error.payload as { message?: string })?.message
//             : error && typeof error === "object" && "message" in error
//               ? (error as { message?: string })?.message
//               : "Failed to create dashboard. Please try again.";
//         toast.error(errorMessage);
//       } finally {
//         setIsCreatingLoading(false);
//       }
//     }
//   };

//   const handleCloseCreateModal = () => {
//     setOpenCreateModal(false);
//     setNewDashboardName("");
//     setDashboardType("normal");
//     setTimePeriod("1m");
//     setDataSourceId("");
//   };

//   const handleDeleteClick = (e: React.MouseEvent, dashboard: DashboardType) => {
//     e.stopPropagation();
//     setDashboardToDelete(dashboard);
//     setDeleteModalOpen(true);
//   };

//   const handleDeleteConfirm = async () => {
//     if (dashboardToDelete) {
//       try {
//         setIsDeleting(true);
//         await dispatch(deleteDashboard(dashboardToDelete._id)).unwrap();
//         dispatch(fetchDashboardList());
//         toast.success("Dashboard deleted successfully!");
//         if (location.pathname === `/dashboard/${dashboardToDelete._id}`) {
//           navigate("/dashboard");
//         }
//         setDeleteModalOpen(false);
//         setDashboardToDelete(null);
//       } catch (error) {
//         const errorResponse = error as ErrorResponse;
//         toast.error(
//           errorResponse.message ||
//             "Failed to delete dashboard. Please try again."
//         );
//       } finally {
//         setIsDeleting(false);
//       }
//     }
//   };

//   const handleDeleteCancel = () => {
//     setDeleteModalOpen(false);
//     setDashboardToDelete(null);
//   };

//   const handleLogout = () => {
//     clearAuthContext();
//     clearLocalStorage();
//     navigate("/login");
//   };

//   const navItems: NavItem[] = useMemo(() => {
//     const createIcon = (IconComponent: React.ElementType, route: string) => {
//       return (
//         <IconComponent
//           sx={{
//             fontSize: STYLE_GUIDE.TYPOGRAPHY.fontSize.base,
//             color: location.pathname.startsWith(route)
//               ? theme.palette.primary.main
//               : theme.getIconColor(),
//           }}
//         />
//       );
//     };
//     // Monthly data sources
//     const monthlyDataSources = matchedDataSources
//       .filter((item) => item.versionType === "monthly")
//       .map((item) => ({
//         name: item?.name ?? "",
//         icon: createIcon(SourceIcon, `/data-source-new/${item?._id}`),
//         route: `/data-source-new/${item?._id}`,
//       }));
//     // Constant data sources
//     const constantDataSources = matchedDataSources
//       .filter((item) => item.versionType === "constant")
//       .map((item) => ({
//         name: item?.name ?? "",
//         icon: createIcon(SourceIcon, `/data-source-new/${item?._id}`),
//         route: `/data-source-new/${item?._id}`,
//       }));
//     // Alerts menu item
//     const alertsMenuItem = {
//       name: "Alerts",
//       icon: createIcon(SourceIcon, "/notification"),
//       route: "/notification",
//     };
//     // Loading indicator
//     const loadingIndicator =
//       dataSourceListAPI?.hasNextPage || dataSourceNotivixListAPI?.isLoading
//         ? [
//             {
//               name: "",
//               icon: (
//                 <div ref={lastElementRef} style={{ paddingLeft: "1.5rem" }}>
//                   <LinearProgress />
//                 </div>
//               ),
//               route: "#",
//             },
//           ]
//         : [];
//     // Combined data sources with loading indicator
//     const dataSourceItems = [
//       ...monthlyDataSources,
//       ...loadingIndicator,
//       alertsMenuItem,
//     ];
//     // Data sources for Theme Settings submenu
//     const themeSettingsDataSources = dataSourceList.map((item) => ({
//       name: item?.name ?? "",
//       icon: createIcon(SourceIcon, `/data-source/${item?._id}`),
//       route: `/data-source/${item?._id}`,
//     }));
//     return [
//       {
//         name: "Dashboards",
//         icon: (
//           <DashboardIcon
//             sx={{ fontSize: STYLE_GUIDE.TYPOGRAPHY.fontSize.base }}
//           />
//         ),
//         route: "/dashboard",
//         subItems: [
//           {
//             name: "Create New",
//             icon: (
//               <AddIcon
//                 sx={{
//                   fontSize: getNavigationSx().fontSize,
//                   color: theme.getIconColor(),
//                 }}
//               />
//             ),
//             route: "#",
//             isCreateButton: true,
//           },
//           ...(loading
//             ? [
//                 {
//                   name: "...",
//                   icon: <></>,
//                   route: "#",
//                 },
//               ]
//             : [
//                 ...dashboards.slice(0, 5).map((dashboard: DashboardType) => ({
//                   name: dashboard.name,
//                   icon: <></>,
//                   route: `/dashboard/${dashboard._id}`,
//                 })),
//                 {
//                   name: "All Dashboards",
//                   icon: <></>,
//                   route: "/dashboard",
//                   isMoreLink: true,
//                 },
//               ]),
//         ],
//       },
//       {
//         name: "Data Upload",
//         icon: createIcon(AssessmentIcon, "/reports"),
//         route: "/reports",
//       },
//       {
//         name: "Reports",
//         icon: createIcon(AssessmentIcon, "/reports"),
//         route: "/reports",
//       },
//       {
//         name: "Notifications",
//         icon: createIcon(SourceIcon, "/data-source"),
//         route: "/data-source",
//         subItems: dataSourceItems,
//       },
//       {
//         name: "VixAI Insights",
//         icon: createIcon(AutoAwesomeIcon, "/VixAi-Insights"),
//         route: "/VixAi-Insights",
//       },
//       {
//         name: "Settings",
//         icon: createIcon(SettingsIcon, "/settings"),
//         route: "/settings",
//         subItems: [
//           {
//             name: "Attribute Option",
//             icon: createIcon(AutoAwesomeIcon, "/attribute-option"),
//             route: "/attribute-option",
//             isBold: true,
//           },
//           {
//             name: "Entity",
//             icon: createIcon(AutoAwesomeIcon, "/entity"),
//             route: "/entity",
//             isBold: true,
//           },
//           {
//             name: "Theme Settings",
//             icon: createIcon(PaletteIcon, "/theme-settings"),
//             route: "#",
//             isBold: true,
//             subItems: [
//               {
//                 name: "Create Theme",
//                 icon: createIcon(PaletteIcon, "/create-theme"),
//                 route: "/create-theme",
//               },
//               {
//                 name: "Layout Themes",
//                 icon: createIcon(BrushIcon, "/themes"),
//                 route: "/themes",
//               },
//             ],
//           },
//           {
//             name: "Data Sources",
//             icon: createIcon(SourceIcon, "/datasources"),
//             route: "#",
//             isBold: true,
//             subItems: themeSettingsDataSources,
//           },
//           {
//             name: "Report Settings",
//             icon: createIcon(SettingsIcon, "/report-settings"),
//             route: "/report-settings",
//             isBold: true,
//           },
//           ...constantDataSources,
//           {
//             name: "System Settings",
//             icon: createIcon(ManageAccountsIcon, "/system-settings"),
//             route: "#",
//             isBold: true,
//             subItems: [
//               {
//                 name: "Roles",
//                 icon: createIcon(AssignmentIndIcon, "/roles"),
//                 route: "/roles",
//               },
//               {
//                 name: "Organization",
//                 icon: createIcon(BusinessIcon, "/organization"),
//                 route: "/organization",
//               },
//               {
//                 name: "Permission",
//                 icon: createIcon(SecurityIcon, "/permission"),
//                 route: "/permission",
//               },
//               {
//                 name: "Department",
//                 icon: createIcon(AccountTreeIcon, "/department"),
//                 route: "/department",
//               },
//               {
//                 name: "Designation",
//                 icon: createIcon(WorkIcon, "/designation"),
//                 route: "/designation",
//               },
//               {
//                 name: "Product",
//                 icon: createIcon(InventoryIcon, "/product"),
//                 route: "/product",
//               },
//               {
//                 name: "User Setting",
//                 icon: createIcon(PeopleIcon, "/user-setting"),
//                 route: "/user-setting",
//               },
//               {
//                 name: "Notifix Roles",
//                 icon: createIcon(AssignmentIndIcon, "/settings/roles"),
//                 route: "/settings/roles",
//               },
//               {
//                 name: "Notifix Permissions",
//                 icon: createIcon(SecurityIcon, "/permissions"),
//                 route: "/permissions",
//               },
//               {
//                 name: "Notifix Organization",
//                 icon: createIcon(BusinessIcon, "/settings/organization"),
//                 route: "/settings/organization",
//               },
//             ],
//           },
//         ],
//       },
//       {
//         name: "User Logs",
//         icon: createIcon(SettingsIcon, "/settings"),
//         route: "/settings",
//       },
//     ];
//   }, [
//     loading,
//     dashboards,
//     dataSourceList,
//     matchedDataSources,
//     dataSourceListAPI?.hasNextPage,
//     dataSourceNotivixListAPI?.isLoading,
//     lastElementRef,
//   ]);

//   const isRouteActive = (route: string) => {
//     return location.pathname.startsWith(route);
//   };

//   return (
//     <Box sx={{ display: "flex", height: "100%" }}>
//       <Drawer variant="permanent" open={openNav} sx={{ p: 0 }}>
//         <Box
//           sx={{
//             display: "flex",
//             flexDirection: "column",
//             height: "100vh",
//             width: openNav ? drawerWidth : `calc(${theme.spacing(7)} + 1px)`,
//             overflow: "hidden",
//           }}
//         >
//           <Box
//             sx={{
//               display: "flex",
//               justifyContent: "center",
//               alignItems: "center",
//               height: "50px",
//               borderBottom: `1px solid ${theme.palette.divider}`,
//               flexShrink: 0,
//             }}
//           >
//             <Box
//               component="img"
//               src={logo}
//               alt="Logo"
//               sx={{
//                 width: openNav ? 120 : 40,
//                 height: "auto",
//                 transition: "width 0.2s ease-in-out",
//               }}
//             />
//           </Box>
//           <List
//             sx={{
//               py: 0,
//               flex: 1,
//               overflowY: "auto",
//               overflowX: "hidden",
//               "&::-webkit-scrollbar": {
//                 width: "6px",
//               },
//               "&::-webkit-scrollbar-track": {
//                 background: "transparent",
//               },
//               "&::-webkit-scrollbar-thumb": {
//                 background: theme.palette.action.hover,
//                 borderRadius: "3px",
//               },
//               "&::-webkit-scrollbar-thumb:hover": {
//                 background: theme.palette.action.selected,
//               },
//             }}
//           >
//             {navItems.map((item, i) => (
//               <React.Fragment key={i}>
//                 <ListItem
//                   disablePadding
//                   sx={{
//                     display: "block",
//                     mb: 0.5,
//                   }}
//                 >
//                   <ListItemButton
//                     onClick={(e) => {
//                       e.stopPropagation();
//                       handleItemClick(item.route, !!item.subItems, item.name);
//                     }}
//                     sx={{
//                       minHeight: 42,
//                       mx: 1.5,
//                       px: 2,
//                       borderRadius: "8px",
//                       justifyContent: openNav ? "initial" : "center",
//                       backgroundColor: isRouteActive(item.route)
//                         ? "#ffffff"
//                         : "transparent",
//                       color: isRouteActive(item.route)
//                         ? theme.palette.primary.main
//                         : theme.palette.text.primary,
//                       "& .MuiListItemIcon-root": {
//                         color: isRouteActive(item.route)
//                           ? theme.palette.primary.main
//                           : theme.palette.text.primary,
//                       },
//                       "&:hover": {
//                         backgroundColor: isRouteActive(item.route)
//                           ? "#ffffff"
//                           : theme.palette.action.hover,
//                         borderRadius: "8px",
//                       },
//                     }}
//                   >
//                     <ListItemIcon
//                       sx={{
//                         minWidth: 0,
//                         mr: openNav ? 2 : "auto",
//                         justifyContent: "center",
//                       }}
//                     >
//                       {item.icon}
//                     </ListItemIcon>
//                     <ListItemText
//                       primary={item.name}
//                       sx={{
//                         opacity: openNav ? 1 : 0,
//                         m: 0,
//                         "& .MuiListItemText-primary": {
//                           ...getNavigationSx(),
//                           color: isRouteActive(item.route)
//                             ? theme.palette.primary.main
//                             : theme.palette.text.primary,
//                         },
//                       }}
//                     />
//                     {item.subItems &&
//                       openNav &&
//                       ((item.name === "Dashboards" && openDashboard) ||
//                       (item.name === "Notification" &&
//                         openNotificationSettings) ||
//                       (item.name === "Settings" && openReportSettings) ||
//                       (item.name === "Theme Settings" && openThemeSettings) ||
//                       (item.name === "Data Sources" && openDataSources) ||
//                       (item.name === "System Settings" &&
//                         openSystemSettings) ? (
//                         <ExpandLessIcon
//                           sx={{
//                             fontSize: getNavigationSx().fontSize,
//                             color: isRouteActive(item.route)
//                               ? theme.palette.primary.main
//                               : theme.palette.text.primary,
//                           }}
//                         />
//                       ) : (
//                         <ExpandMoreIcon
//                           sx={{
//                             fontSize: getNavigationSx().fontSize,
//                             color: isRouteActive(item.route)
//                               ? theme.palette.primary.main
//                               : theme.palette.text.primary,
//                           }}
//                         />
//                       ))}
//                   </ListItemButton>
//                 </ListItem>
//                 {item.subItems && openNav && (
//                   <Collapse
//                     in={
//                       item.name === "Dashboards"
//                         ? openDashboard
//                         : item.name === "Notification"
//                           ? openNotificationSettings
//                           : item.name === "Settings"
//                             ? openReportSettings
//                             : item.name === "Theme Settings"
//                               ? openThemeSettings
//                               : item.name === "Data Sources"
//                                 ? openDataSources
//                                 : item.name === "System Settings"
//                                   ? openSystemSettings
//                                   : openSettings
//                     }
//                     timeout="auto"
//                     unmountOnExit
//                   >
//                     <List
//                       component="div"
//                       disablePadding
//                       sx={{
//                         overflowY: "auto",
//                         overflowX: "hidden",
//                         "&::-webkit-scrollbar": {
//                           width: "6px",
//                         },
//                         "&::-webkit-scrollbar-track": {
//                           background: "transparent",
//                         },
//                         "&::-webkit-scrollbar-thumb": {
//                           background: theme.palette.action.hover,
//                           borderRadius: "3px",
//                         },
//                         "&::-webkit-scrollbar-thumb:hover": {
//                           background: theme.palette.action.selected,
//                         },
//                       }}
//                     >
//                       {item.name === "Dashboards" && (
//                         <ListItem
//                           disablePadding
//                           sx={{ display: "block", mb: 0.5 }}
//                         >
//                           <ListItemButton
//                             onClick={(e) => {
//                               e.stopPropagation();
//                               setOpenCreateModal(true);
//                             }}
//                             sx={{
//                               minHeight: 36,
//                               px: STYLE_GUIDE.SPACING.s4,
//                               pl: STYLE_GUIDE.SPACING.s4,
//                               borderRadius: "8px",
//                               mx: STYLE_GUIDE.SPACING.s3,
//                               "&:hover": {
//                                 backgroundColor:
//                                   STYLE_GUIDE.COLORS.backgroundDefault,
//                               },
//                             }}
//                           >
//                             <ListItemIcon
//                               sx={{
//                                 minWidth: 0,
//                                 mr: 1,
//                                 justifyContent: "center",
//                               }}
//                             >
//                               <AddIcon
//                                 sx={{
//                                   fontSize: getNavigationSx().fontSize,
//                                   color: theme.getIconColor(),
//                                 }}
//                               />
//                             </ListItemIcon>
//                             <ListItemText
//                               primary="Create New"
//                               sx={{
//                                 m: 0,
//                                 "& .MuiListItemText-primary": {
//                                   ...getNavigationSx(),
//                                 },
//                               }}
//                             />
//                           </ListItemButton>
//                         </ListItem>
//                       )}
//                       {item.name === "Settings" ? (
//                         <>
//                           {item.subItems?.map((subItem, subIndex) => (
//                             <React.Fragment key={subIndex}>
//                               {subItem.subItems ? (
//                                 <ListItem
//                                   disablePadding
//                                   sx={{ display: "block", mb: 0.5 }}
//                                 >
//                                   <ListItemButton
//                                     onClick={(e) => {
//                                       e.stopPropagation();
//                                       handleItemClick(
//                                         subItem.route,
//                                         !!subItem.subItems,
//                                         subItem.name
//                                       );
//                                     }}
//                                     sx={{
//                                       minHeight: 36,
//                                       px: STYLE_GUIDE.SPACING.s4,
//                                       pl: STYLE_GUIDE.SPACING.s4,
//                                       borderRadius: "8px",
//                                       mx: STYLE_GUIDE.SPACING.s3,
//                                       "&:hover": {
//                                         backgroundColor:
//                                           STYLE_GUIDE.COLORS.backgroundDefault,
//                                       },
//                                     }}
//                                   >
//                                     <ListItemIcon
//                                       sx={{
//                                         minWidth: 0,
//                                         mr: 1,
//                                         justifyContent: "center",
//                                       }}
//                                     >
//                                       {subItem.icon}
//                                     </ListItemIcon>
//                                     <ListItemText
//                                       primary={subItem.name}
//                                       sx={{
//                                         m: 0,
//                                         "& .MuiListItemText-primary": {
//                                           ...getNavigationSx(),
//                                           fontWeight: subItem.isBold
//                                             ? 600
//                                             : 400,
//                                           color: subItem.isBold
//                                             ? theme.palette.text.primary
//                                             : theme.palette.text.secondary,
//                                         },
//                                       }}
//                                     />
//                                     {openNav &&
//                                       ((subItem.name === "Theme Settings" &&
//                                         openThemeSettings) ||
//                                       (subItem.name === "Data Sources" &&
//                                         openDataSources) ||
//                                       (subItem.name === "System Settings" &&
//                                         openSystemSettings) ? (
//                                         <ExpandLessIcon
//                                           sx={{
//                                             fontSize:
//                                               getNavigationSx().fontSize,
//                                           }}
//                                         />
//                                       ) : (
//                                         <ExpandMoreIcon
//                                           sx={{
//                                             fontSize:
//                                               getNavigationSx().fontSize,
//                                           }}
//                                         />
//                                       ))}
//                                   </ListItemButton>
//                                   <Collapse
//                                     in={
//                                       subItem.name === "Theme Settings"
//                                         ? openThemeSettings
//                                         : subItem.name === "Data Sources"
//                                           ? openDataSources
//                                           : subItem.name === "System Settings"
//                                             ? openSystemSettings
//                                             : false
//                                     }
//                                     timeout="auto"
//                                     unmountOnExit
//                                   >
//                                     <List
//                                       component="div"
//                                       disablePadding
//                                       sx={{
//                                         overflowY: "auto",
//                                         overflowX: "hidden",
//                                         "&::-webkit-scrollbar": {
//                                           width: "6px",
//                                         },
//                                         "&::-webkit-scrollbar-track": {
//                                           background: "transparent",
//                                         },
//                                         "&::-webkit-scrollbar-thumb": {
//                                           background: theme.palette.action.hover,
//                                           borderRadius: "3px",
//                                         },
//                                         "&::-webkit-scrollbar-thumb:hover": {
//                                           background: theme.palette.action.selected,
//                                         },
//                                       }}
//                                     >
//                                       {subItem.subItems?.map(
//                                         (nestedItem, nestedIndex) => (
//                                           <ListItem
//                                             key={nestedIndex}
//                                             disablePadding
//                                             sx={{ display: "block", mb: 0.5 }}
//                                           >
//                                             <ListItemButton
//                                               onClick={(e) => {
//                                                 e.stopPropagation();
//                                                 closeAllDropdowns();
//                                                 navigate(nestedItem.route);
//                                               }}
//                                               sx={{
//                                                 minHeight: 36,
//                                                 px: STYLE_GUIDE.SPACING.s4,
//                                                 pl: STYLE_GUIDE.SPACING.s8,
//                                                 borderRadius: "8px",
//                                                 mx: STYLE_GUIDE.SPACING.s3,
//                                                 "&:hover": {
//                                                   backgroundColor:
//                                                     STYLE_GUIDE.COLORS
//                                                       .backgroundDefault,
//                                                 },
//                                               }}
//                                             >
//                                               <ListItemIcon
//                                                 sx={{
//                                                   minWidth: 0,
//                                                   mr: 1,
//                                                   justifyContent: "center",
//                                                 }}
//                                               >
//                                                 {nestedItem.icon}
//                                               </ListItemIcon>
//                                               <ListItemText
//                                                 primary={nestedItem.name}
//                                                 sx={{
//                                                   m: 0,
//                                                   "& .MuiListItemText-primary":
//                                                     {
//                                                       ...getNavigationSx(),
//                                                     },
//                                                 }}
//                                               />
//                                             </ListItemButton>
//                                           </ListItem>
//                                         )
//                                       )}
//                                     </List>
//                                   </Collapse>
//                                 </ListItem>
//                               ) : (
//                                 <ListItem
//                                   disablePadding
//                                   sx={{ display: "block", mb: 0.5 }}
//                                 >
//                                   <ListItemButton
//                                     onClick={(e) => {
//                                       e.stopPropagation();
//                                       closeAllDropdowns();
//                                       navigate(subItem.route);
//                                     }}
//                                     sx={{
//                                       minHeight: 36,
//                                       px: STYLE_GUIDE.SPACING.s4,
//                                       pl: STYLE_GUIDE.SPACING.s4,
//                                       borderRadius: "8px",
//                                       mx: STYLE_GUIDE.SPACING.s3,
//                                       "&:hover": {
//                                         backgroundColor:
//                                           STYLE_GUIDE.COLORS.backgroundDefault,
//                                       },
//                                     }}
//                                   >
//                                     <ListItemIcon
//                                       sx={{
//                                         minWidth: 0,
//                                         mr: 1,
//                                         justifyContent: "center",
//                                       }}
//                                     >
//                                       {subItem.icon}
//                                     </ListItemIcon>
//                                     <ListItemText
//                                       primary={subItem.name}
//                                       sx={{
//                                         m: 0,
//                                         "& .MuiListItemText-primary": {
//                                           ...getNavigationSx(),
//                                           fontWeight: subItem.isBold
//                                             ? 600
//                                             : 400,
//                                           color: subItem.isBold
//                                             ? theme.palette.text.primary
//                                             : theme.palette.text.secondary,
//                                         },
//                                       }}
//                                     />
//                                   </ListItemButton>
//                                 </ListItem>
//                               )}
//                             </React.Fragment>
//                           ))}
//                         </>
//                       ) : (
//                         <SubItemsList
//                           subItems={item.subItems.filter(
//                             (subItem) => !subItem.isCreateButton
//                           )}
//                           openNav={openNav}
//                           parentName={item.name}
//                           dashboards={dashboards}
//                           onDeleteClick={handleDeleteClick}
//                           onCreateClick={() => setOpenCreateModal(true)}
//                         />
//                       )}
//                     </List>
//                   </Collapse>
//                 )}
//               </React.Fragment>
//             ))}
//           </List>
//           <Box
//             sx={{
//               px: STYLE_GUIDE.SPACING.s4,
//               pb: STYLE_GUIDE.SPACING.s2,
//               mt: "auto",
//               flexShrink: 0,
//             }}
//           >
//             <ListItemButton
//               onClick={(e) => {
//                 e.stopPropagation();
//                 handleLogout();
//               }}
//               sx={{
//                 minHeight: 42,
//                 px: STYLE_GUIDE.SPACING.s4,
//                 borderRadius: "8px",
//                 justifyContent: openNav ? "initial" : "center",
//                 color: theme.palette.text.primary,
//                 "&:hover": {
//                   backgroundColor: theme.palette.action.hover,
//                 },
//               }}
//             >
//               <ListItemIcon
//                 sx={{
//                   minWidth: 0,
//                   mr: openNav ? STYLE_GUIDE.SPACING.s4 : "auto",
//                   justifyContent: "center",
//                 }}
//               >
//                 <LogoutIcon sx={{ color: theme.getIconColor() }} />
//               </ListItemIcon>
//               <ListItemText
//                 primary="Logout"
//                 sx={{
//                   opacity: openNav ? 1 : 0,
//                   m: 0,
//                   "& .MuiListItemText-primary": {
//                     ...getNavigationSx(),
//                   },
//                 }}
//               />
//             </ListItemButton>
//           </Box>
//         </Box>
//       </Drawer>
//       <CreateDashboardModal
//         open={openCreateModal}
//         onClose={handleCloseCreateModal}
//         newDashboardName={newDashboardName}
//         onNameChange={setNewDashboardName}
//         onCreate={handleCreateDashboard}
//         isCreating={isCreatingLoading}
//         dashboardType={dashboardType}
//         onDashboardTypeChange={setDashboardType}
//         timePeriod={timePeriod}
//         onTimePeriodChange={setTimePeriod}
//         dataSourceId={dataSourceId}
//         onDataSourceChange={setDataSourceId}
//       />
//       <DeleteConfirmationModal
//         open={deleteModalOpen}
//         dashboard={dashboardToDelete}
//         onConfirm={handleDeleteConfirm}
//         onCancel={handleDeleteCancel}
//         isDeleting={isDeleting}
//       />
//     </Box>
//   );
// }

import { styled, Theme, CSSObject } from "@mui/material/styles";
import Box from "@mui/material/Box";
import MuiDrawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import { useNav } from "../../../context/NavContext";
import DashboardIcon from "@mui/icons-material/Dashboard";
import AddIcon from "@mui/icons-material/Add";
import React, { useEffect, useMemo, useContext, useState } from "react";
import { Collapse, LinearProgress } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import { useNavigate, useLocation } from "react-router-dom";
import SourceIcon from "@mui/icons-material/Source";
import AssessmentIcon from "@mui/icons-material/Assessment";
import PaletteIcon from "@mui/icons-material/Palette";
import BrushIcon from "@mui/icons-material/Brush";
import { useInfiniteScroll } from "../../../hooks/useInfiniteScroll";
import { GET } from "../../../services/apiRoutes";
import { DataSourceListData, DataSourceListPayload } from "./types";
import { setDataSourceList } from "../../../pages/dataSources/dataSourceActions";
import { useAppDispatch, useAppSelector } from "../../../storeHooks";
import {
  fetchDashboardList,
  createDashboard,
  deleteDashboard,
} from "../../../pages/dashboard/dashboardActions";
import {
  Dashboard as DashboardType,
  DashboardListResponse,
} from "../../../pages/dashboard/types";
import { toast } from "react-toastify";
import { DeleteConfirmationModal } from "./components/DeleteConfirmationModal";
import { SubItemsList } from "./components/SubItemsList";
import { CreateDashboardModal } from "./components/CreateDashboardModal";
import LogoutIcon from "@mui/icons-material/Logout";
import logo from "../../../assets/ReportiVix-logo.png";
import { AuthContext } from "../../../context/AuthContext";
import { clearLocalStorage } from "../../../utils/handleLocalStorage";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import { STYLE_GUIDE } from "../../../styles";
import SettingsIcon from "@mui/icons-material/Settings";
import { useUnifiedTheme } from "../../../hooks/useUnifiedTheme";
import { useComponentTypography } from "../../../hooks/useComponentTypography";
import BusinessIcon from "@mui/icons-material/Business";
import AssignmentIndIcon from "@mui/icons-material/AssignmentInd";
import NotivixLogo from "../../../assets/NotiVix-Logo-TRANS-V1.png";
import useGet from "../../../hooks/useGet";
import { useSelector } from "react-redux";
import { RootState } from "../../../reducers";
import PeopleIcon from "@mui/icons-material/People";
import AccountTreeIcon from "@mui/icons-material/AccountTree";
import SecurityIcon from "@mui/icons-material/Security";
import WorkIcon from "@mui/icons-material/Work";
import InventoryIcon from "@mui/icons-material/Inventory";
import ManageAccountsIcon from "@mui/icons-material/ManageAccounts";

interface ErrorResponse {
  success: boolean;
  message: string;
  error: Record<string, unknown>;
}

const drawerWidth = 225;

const openedMixin = (theme: Theme): CSSObject => ({
  width: drawerWidth,
  position: "static",
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: "hidden",
});

const closedMixin = (theme: Theme): CSSObject => ({
  position: "static",
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: "hidden",
  width: `calc(${theme.spacing(6)} + 1px)`,
  [theme.breakpoints.up("sm")]: {
    width: `calc(${theme.spacing(8)} + 1px)`,
  },
});

const Drawer = styled(MuiDrawer, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme }) => ({
  width: drawerWidth,
  flexShrink: 0,
  whiteSpace: "nowrap",
  boxSizing: "border-box",
  height: "100vh",
  position: "static",
  backgroundColor: STYLE_GUIDE.COLORS.white,
  "& .MuiPaper-root": {
    backgroundColor: theme.palette.background.paper,
    border: "none",
    height: "100%",
    position: "static",
    overflow: "hidden",
  },
  "& .MuiDrawer-paper": {
    position: "static",
    overflow: "hidden",
  },
  "& .MuiList-root": {
    height: "100%",
    overflow: "hidden",
  },
  "& .MuiListItemButton-root": {
    "&.Mui-selected, &.Mui-selected:hover": {
      backgroundColor: theme.palette.action.hover,
    },
    "&:hover": {
      backgroundColor: theme.palette.action.hover,
    },
  },
  variants: [
    {
      props: ({ open }) => open,
      style: {
        ...openedMixin(theme),
        "& .MuiDrawer-paper": openedMixin(theme),
      },
    },
    {
      props: ({ open }) => !open,
      style: {
        ...closedMixin(theme),
        "& .MuiDrawer-paper": closedMixin(theme),
      },
    },
  ],
}));

interface SubNavItem {
  name: string;
  icon: React.ReactNode;
  route: string;
  isCreateButton?: boolean;
  subItems?: SubNavItem[];
  isBold?: boolean;
}

interface NavItem {
  name: string;
  icon: React.ReactNode;
  route: string;
  subItems?: SubNavItem[];
}

export default function SideNav() {
  const theme = useUnifiedTheme();
  const { getNavigationSx } = useComponentTypography();
  const { openNav } = useNav();
  const [openSettings, setOpenSettings] = React.useState(false);
  const [openDashboard, setOpenDashboard] = React.useState(false);
  const [openNotificationSettings, setOpenNotificationSettings] =
    React.useState(false);
  const [openGlobalSettings, setOpenGlobalSettings] = React.useState(false);
  const [openReportSettings, setOpenReportSettings] = React.useState(false);
  const [openThemeSettings, setOpenThemeSettings] = React.useState(false);
  const [openSystemSettings, setOpenSystemSettings] = React.useState(false);
  const [openDataSources, setOpenDataSources] = React.useState(false);
  const [newDashboardName, setNewDashboardName] = React.useState("");
  const [dashboardType, setDashboardType] = React.useState<
    "normal" | "trend" | "fixed"
  >("normal");
  const [timePeriod, setTimePeriod] = React.useState<string>("1m");
  const [dataSourceId, setDataSourceId] = React.useState<string>("");
  const [isCreatingLoading, setIsCreatingLoading] = React.useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = React.useState(false);
  const [dashboardToDelete, setDashboardToDelete] =
    React.useState<DashboardType | null>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const { dashboards, loading } = useAppSelector((state) => state.dashboard);
  const { clearAuthContext } = useContext(AuthContext);
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const permissions = useSelector(
    (state: RootState) => state.userPermission?.permissions
  );
  const dataSourcePermissions = permissions?.["Data Source"] || {};
  const validPermissionIds = Object.entries(dataSourcePermissions)
    .filter(([key, permission]) => {
      return permission.allowed === true && permission.dataSourceId?._id;
    })
    .map(([key, permission]) => permission.dataSourceId._id);

  const closeAllDropdowns = () => {
    setOpenSettings(false);
    setOpenDashboard(false);
    setOpenNotificationSettings(false);
    setOpenGlobalSettings(false);
    setOpenReportSettings(false);
    setOpenThemeSettings(false);
    setOpenSystemSettings(false);
    setOpenDataSources(false);
  };

  useEffect(() => {
    dispatch(fetchDashboardList());
  }, [dispatch]);

  const { infiniteQuery: dataSourceListAPI, lastElementRef } =
    useInfiniteScroll<DataSourceListPayload, DataSourceListData>(
      ["dataSourceList"],
      GET?.DATA_SOURCE_LIST + `?canEditInline=true`,
      10,
      "get",
      true
    );

  const dataSourceNotivixListAPI = useGet<DataSourceListPayload>(
    ["dataSourceNotivixList"],
    GET?.DATA_SOURCE_LIST + `?isShowMenu=true`
  );

  const dataSourceList = useMemo(() => {
    return dataSourceListAPI?.data?.pages?.flatMap((page) => page?.data) || [];
  }, [dataSourceListAPI?.data?.pages]);

  const dataSourceNotivixList = useMemo(() => {
    return dataSourceNotivixListAPI?.data?.data || [];
  }, [dataSourceNotivixListAPI?.data]);

  const matchedDataSources = useMemo(() => {
    return dataSourceNotivixList?.filter(
      (dataSource: any) =>
        validPermissionIds.includes(dataSource._id) &&
        dataSource.isShowMenu === true
    );
  }, [dataSourceNotivixList, validPermissionIds]);

  useEffect(() => {
    if (dataSourceNotivixList.length > 0)
      dispatch(setDataSourceList(dataSourceNotivixList));
  }, [dataSourceNotivixList, dispatch]);

  const handleItemClick = (
    route: string,
    hasSubItems: boolean,
    itemName: string
  ) => {
    if (hasSubItems) {
      if (itemName === "Dashboards") {
        if (!openDashboard) {
          setOpenDashboard(true);
        } else {
          setOpenDashboard(false);
          navigate(route);
        }
        navigate(route);
      } else if (itemName === "Notification") {
        setOpenNotificationSettings((prev) => !prev);
        navigate(route);
      } else if (itemName === "Settings") {
        setOpenReportSettings((prev) => !prev);
      } else if (itemName === "Theme Settings") {
        setOpenThemeSettings((prev) => !prev);
      } else if (itemName === "System Settings") {
        setOpenSystemSettings((prev) => !prev);
      } else if (itemName === "Data Sources") {
        setOpenDataSources((prev) => !prev);
      } else {
        setOpenSettings((prev) => !prev);
      }
    } else {
      closeAllDropdowns();
      navigate(route);
    }
  };

  const handleCreateDashboard = async () => {
    if (newDashboardName.trim()) {
      if (dashboardType === "fixed" && !dataSourceId.trim()) {
        toast.error("Please select a data source for fixed dashboard type");
        return;
      }
      try {
        setIsCreatingLoading(true);
        const response = (await dispatch(
          createDashboard({
            name: newDashboardName.trim(),
            dashboardType,
            dynamicVersionValue: timePeriod,
            dataSourceId: dashboardType === "fixed" ? dataSourceId : undefined,
          })
        ).unwrap()) as DashboardListResponse;
        await dispatch(fetchDashboardList());
        setOpenCreateModal(false);
        setNewDashboardName("");
        setDashboardType("normal");
        setTimePeriod("1m");
        toast.success(response.message || "Dashboard created successfully!");
        const newDashboard = response?.data;
        if (newDashboard) {
          navigate(`/dashboard/${newDashboard._id}`, {
            state: { enableEditMode: true },
          });
        }
      } catch (error:
        | { payload?: { message: string }; message?: string }
        | unknown) {
        const errorMessage =
          error && typeof error === "object" && "payload" in error
            ? (error.payload as { message?: string })?.message
            : error && typeof error === "object" && "message" in error
              ? (error as { message?: string })?.message
              : "Failed to create dashboard. Please try again.";
        toast.error(errorMessage);
      } finally {
        setIsCreatingLoading(false);
      }
    }
  };

  const handleCloseCreateModal = () => {
    setOpenCreateModal(false);
    setNewDashboardName("");
    setDashboardType("normal");
    setTimePeriod("1m");
    setDataSourceId("");
  };

  const handleDeleteClick = (e: React.MouseEvent, dashboard: DashboardType) => {
    e.stopPropagation();
    setDashboardToDelete(dashboard);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (dashboardToDelete) {
      try {
        setIsDeleting(true);
        await dispatch(deleteDashboard(dashboardToDelete._id)).unwrap();
        dispatch(fetchDashboardList());
        toast.success("Dashboard deleted successfully!");
        if (location.pathname === `/dashboard/${dashboardToDelete._id}`) {
          navigate("/dashboard");
        }
        setDeleteModalOpen(false);
        setDashboardToDelete(null);
      } catch (error) {
        const errorResponse = error as ErrorResponse;
        toast.error(
          errorResponse.message ||
            "Failed to delete dashboard. Please try again."
        );
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModalOpen(false);
    setDashboardToDelete(null);
  };

  const handleLogout = () => {
    clearAuthContext();
    clearLocalStorage();
    navigate("/login");
  };

  const navItems: NavItem[] = useMemo(() => {
    const createIcon = (IconComponent: React.ElementType, route: string) => {
      return (
        <IconComponent
          sx={{
            fontSize: STYLE_GUIDE.TYPOGRAPHY.fontSize.base,
            color: location.pathname.startsWith(route)
              ? theme.palette.primary.main
              : theme.getIconColor(),
          }}
        />
      );
    };
    // Monthly data sources
    const monthlyDataSources = matchedDataSources
      .filter((item) => item.versionType === "monthly")
      .map((item) => ({
        name: item?.name ?? "",
        icon: createIcon(SourceIcon, `/data-source-new/${item?._id}`),
        route: `/data-source-new/${item?._id}`,
      }));
    // Constant data sources
    const constantDataSources = matchedDataSources
      .filter((item) => item.versionType === "constant")
      .map((item) => ({
        name: item?.name ?? "",
        icon: createIcon(SourceIcon, `/data-source-new/${item?._id}`),
        route: `/data-source-new/${item?._id}`,
      }));
    // Alerts menu item
    const alertsMenuItem = {
      name: "Alerts",
      icon: createIcon(SourceIcon, "/notification"),
      route: "/notification",
    };
    // Loading indicator
    const loadingIndicator =
      dataSourceListAPI?.hasNextPage || dataSourceNotivixListAPI?.isLoading
        ? [
            {
              name: "",
              icon: (
                <div ref={lastElementRef} style={{ paddingLeft: "1.5rem" }}>
                  <LinearProgress />
                </div>
              ),
              route: "#",
            },
          ]
        : [];
    // Combined data sources with loading indicator
    const dataSourceItems = [
      ...monthlyDataSources,
      ...loadingIndicator,
      alertsMenuItem,
    ];
    // Data sources for Theme Settings submenu
    const themeSettingsDataSources = dataSourceList.map((item) => ({
      name: item?.name ?? "",
      icon: createIcon(SourceIcon, `/data-source/${item?._id}`),
      route: `/data-source/${item?._id}`,
    }));
    return [
      {
        name: "Dashboards",
        icon: (
          <DashboardIcon
            sx={{ fontSize: STYLE_GUIDE.TYPOGRAPHY.fontSize.base }}
          />
        ),
        route: "/dashboard",
        subItems: [
          {
            name: "Create New Dashboard",
            icon: (
              <AddIcon
                sx={{
                  fontSize: getNavigationSx().fontSize,
                  color: theme.getIconColor(),
                }}
              />
            ),
            route: "#",
            isCreateButton: true,
          },
          ...(loading
            ? [
                {
                  name: "...",
                  icon: <></>,
                  route: "#",
                },
              ]
            : [
                ...dashboards.slice(0, 5).map((dashboard: DashboardType) => ({
                  name: dashboard.name,
                  icon: <></>,
                  route: `/dashboard/${dashboard._id}`,
                })),
                {
                  name: "All Dashboards",
                  icon: <></>,
                  route: "/dashboard",
                  isMoreLink: true,
                },
              ]),
        ],
      },
      {
        name: "Data Upload",
        icon: createIcon(AssessmentIcon, "/reports"),
        route: "/reports",
      },
      {
        name: "Reports",
        icon: createIcon(AssessmentIcon, "/reports"),
        route: "/reports",
      },
      {
        name: "Notifications",
        icon: createIcon(SourceIcon, "/data-source"),
        route: "/data-source",
        subItems: dataSourceItems,
      },
      {
        name: "VixAI Insights",
        icon: createIcon(AutoAwesomeIcon, "/VixAi-Insights"),
        route: "/VixAi-Insights",
      },
      {
        name: "Settings",
        icon: createIcon(SettingsIcon, "/settings"),
        route: "/settings",
        subItems: [
          {
            name: "Attribute Option",
            icon: createIcon(AutoAwesomeIcon, "/attribute-option"),
            route: "/attribute-option",
            isBold: true,
          },
          {
            name: "Entity",
            icon: createIcon(AutoAwesomeIcon, "/entity"),
            route: "/entity",
            isBold: true,
          },
          {
            name: "Theme Settings",
            icon: createIcon(PaletteIcon, "/theme-settings"),
            route: "#",
            isBold: true,
            subItems: [
              {
                name: "Create Theme",
                icon: createIcon(PaletteIcon, "/create-theme"),
                route: "/create-theme",
              },
              {
                name: "Layout Themes",
                icon: createIcon(BrushIcon, "/themes"),
                route: "/themes",
              },
            ],
          },
          {
            name: "Data Sources",
            icon: createIcon(SourceIcon, "/datasources"),
            route: "#",
            isBold: true,
            subItems: themeSettingsDataSources,
          },
          {
            name: "Report Settings",
            icon: createIcon(SettingsIcon, "/report-settings"),
            route: "/report-settings",
            isBold: true,
          },
          ...constantDataSources,
          {
            name: "System Settings",
            icon: createIcon(ManageAccountsIcon, "/system-settings"),
            route: "#",
            isBold: true,
            subItems: [
              {
                name: "Roles",
                icon: createIcon(AssignmentIndIcon, "/roles"),
                route: "/roles",
              },
              {
                name: "Organization",
                icon: createIcon(BusinessIcon, "/organization"),
                route: "/organization",
              },
              {
                name: "Permission",
                icon: createIcon(SecurityIcon, "/permission"),
                route: "/permission",
              },
              {
                name: "Department",
                icon: createIcon(AccountTreeIcon, "/department"),
                route: "/department",
              },
              {
                name: "Designation",
                icon: createIcon(WorkIcon, "/designation"),
                route: "/designation",
              },
              {
                name: "Product",
                icon: createIcon(InventoryIcon, "/product"),
                route: "/product",
              },
              {
                name: "User Setting",
                icon: createIcon(PeopleIcon, "/user-setting"),
                route: "/user-setting",
              },
              {
                name: "Notifix Roles",
                icon: createIcon(AssignmentIndIcon, "/settings/roles"),
                route: "/settings/roles",
              },
              {
                name: "Notifix Permissions",
                icon: createIcon(SecurityIcon, "/permissions"),
                route: "/permissions",
              },
              {
                name: "Notifix Organization",
                icon: createIcon(BusinessIcon, "/settings/organization"),
                route: "/settings/organization",
              },
            ],
          },
        ],
      },
      {
        name: "User Logs",
        icon: createIcon(SettingsIcon, "/settings"),
        route: "/settings",
      },
    ];
  }, [
    loading,
    dashboards,
    dataSourceList,
    matchedDataSources,
    dataSourceListAPI?.hasNextPage,
    dataSourceNotivixListAPI?.isLoading,
    lastElementRef,
  ]);

  const isRouteActive = (route: string) => {
    return location.pathname.startsWith(route);
  };

  return (
    <Box sx={{ display: "flex", height: "100%" }}>
      <Drawer variant="permanent" open={openNav} sx={{ p: 0 }}>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            height: "100%",
            width: openNav ? drawerWidth : `calc(${theme.spacing(7)} + 1px)`,
            // overflow: "hidden",
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "50px",
              borderBottom: `1px solid ${theme.palette.divider}`,
              flexShrink: 0,
            }}
          >
            <Box
              component="img"
              src={logo}
              alt="Logo"
              sx={{
                width: openNav ? 120 : 40,
                height: "auto",
                transition: "width 0.2s ease-in-out",
              }}
            />
          </Box>
          <Box
            sx={{
              py: 0,
              flex: 1,
              overflowY: "auto",
              overflowX: "hidden",
              "&::-webkit-scrollbar": {
                width: "6px",
              },
              "&::-webkit-scrollbar-track": {
                background: "transparent",
              },
              "&::-webkit-scrollbar-thumb": {
                background: theme.palette.action.hover,
                borderRadius: "3px",
              },
              "&::-webkit-scrollbar-thumb:hover": {
                background: theme.palette.action.selected,
              },
              scrollbarWidth: "thin",
              scrollbarColor: `${theme.palette.action.hover} transparent`,
            }}
          >
            <List
              sx={{
                py: 0,
                // Removed overflow properties here since parent handles scrolling
              }}
            >
              {navItems.map((item, i) => (
                <React.Fragment key={i}>
                  <ListItem
                    disablePadding
                    sx={{
                      display: "block",
                      mb: 0.5,
                    }}
                  >
                    <ListItemButton
                      onClick={(e) => {
                        e.stopPropagation();
                        handleItemClick(item.route, !!item.subItems, item.name);
                      }}
                      sx={{
                        minHeight: 42,
                        mx: 1.5,
                        px: 2,
                        borderRadius: "8px",
                        justifyContent: openNav ? "initial" : "center",
                        backgroundColor: isRouteActive(item.route)
                          ? "#ffffff"
                          : "transparent",
                        color: isRouteActive(item.route)
                          ? theme.palette.primary.main
                          : theme.palette.text.primary,
                        "& .MuiListItemIcon-root": {
                          color: isRouteActive(item.route)
                            ? theme.palette.primary.main
                            : theme.palette.text.primary,
                        },
                        "&:hover": {
                          backgroundColor: isRouteActive(item.route)
                            ? "#ffffff"
                            : theme.palette.action.hover,
                          borderRadius: "8px",
                        },
                      }}
                    >
                      <ListItemIcon
                        sx={{
                          minWidth: 0,
                          mr: openNav ? 2 : "auto",
                          justifyContent: "center",
                        }}
                      >
                        {item.icon}
                      </ListItemIcon>
                      <ListItemText
                        primary={item.name}
                        sx={{
                          opacity: openNav ? 1 : 0,
                          m: 0,
                          "& .MuiListItemText-primary": {
                            ...getNavigationSx(),
                            color: isRouteActive(item.route)
                              ? theme.palette.primary.main
                              : theme.palette.text.primary,
                          },
                        }}
                      />
                      {item.subItems &&
                        openNav &&
                        ((item.name === "Dashboards" && openDashboard) ||
                        (item.name === "Notification" &&
                          openNotificationSettings) ||
                        (item.name === "Settings" && openReportSettings) ||
                        (item.name === "Theme Settings" && openThemeSettings) ||
                        (item.name === "Data Sources" && openDataSources) ||
                        (item.name === "System Settings" &&
                          openSystemSettings) ? (
                          <ExpandLessIcon
                            sx={{
                              fontSize: getNavigationSx().fontSize,
                              color: isRouteActive(item.route)
                                ? theme.palette.primary.main
                                : theme.palette.text.primary,
                            }}
                          />
                        ) : (
                          <ExpandMoreIcon
                            sx={{
                              fontSize: getNavigationSx().fontSize,
                              color: isRouteActive(item.route)
                                ? theme.palette.primary.main
                                : theme.palette.text.primary,
                            }}
                          />
                        ))}
                    </ListItemButton>
                  </ListItem>
                  {item.subItems && openNav && (
                    <Collapse
                      in={
                        item.name === "Dashboards"
                          ? openDashboard
                          : item.name === "Notification"
                            ? openNotificationSettings
                            : item.name === "Settings"
                              ? openReportSettings
                              : item.name === "Theme Settings"
                                ? openThemeSettings
                                : item.name === "Data Sources"
                                  ? openDataSources
                                  : item.name === "System Settings"
                                    ? openSystemSettings
                                    : openSettings
                      }
                      timeout="auto"
                      unmountOnExit
                    >
                      <List
                        component="div"
                        disablePadding
                        sx={{
                          // Add fixed height and scrolling for dropdowns with many items
                          ...(item.name === "Settings" && {
                            maxHeight: "400px",
                            overflowY: "auto",
                            overflowX: "hidden",
                            "&::-webkit-scrollbar": {
                              width: "6px",
                            },
                            "&::-webkit-scrollbar-track": {
                              background: "transparent",
                            },
                            "&::-webkit-scrollbar-thumb": {
                              background: theme.palette.action.hover,
                              borderRadius: "3px",
                            },
                            "&::-webkit-scrollbar-thumb:hover": {
                              background: theme.palette.action.selected,
                            },
                          }),
                        }}
                      >
                        {item.name === "Dashboards" && (
                          <ListItem
                            disablePadding
                            sx={{ display: "block", mb: 0.5 }}
                          >
                            <ListItemButton
                              onClick={(e) => {
                                e.stopPropagation();
                                setOpenCreateModal(true);
                              }}
                              sx={{
                                minHeight: 36,
                                px: STYLE_GUIDE.SPACING.s4,
                                pl: STYLE_GUIDE.SPACING.s4,
                                borderRadius: "8px",
                                mx: STYLE_GUIDE.SPACING.s3,
                                "&:hover": {
                                  backgroundColor:
                                    STYLE_GUIDE.COLORS.backgroundDefault,
                                },
                              }}
                            >
                              <ListItemIcon
                                sx={{
                                  minWidth: 0,
                                  mr: 1,
                                  justifyContent: "center",
                                }}
                              >
                                <AddIcon
                                  sx={{
                                    fontSize: getNavigationSx().fontSize,
                                    color: theme.getIconColor(),
                                  }}
                                />
                              </ListItemIcon>
                              <ListItemText
                                primary="Create New Dashboard"
                                sx={{
                                  m: 0,
                                  "& .MuiListItemText-primary": {
                                    ...getNavigationSx(),
                                  },
                                }}
                              />
                            </ListItemButton>
                          </ListItem>
                        )}
                        {item.name === "Settings" ? (
                          <>
                            {/* {item.subItems?.map((subItem, subIndex) => (
                              <React.Fragment key={subIndex}>
                                {subItem.subItems ? (
                                  <ListItem
                                    disablePadding
                                    sx={{ display: "block", mb: 0.5 }}
                                  >
                                    <ListItemButton
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleItemClick(
                                          subItem.route,
                                          !!subItem.subItems,
                                          subItem.name
                                        );
                                      }}
                                      sx={{
                                        minHeight: 36,
                                        px: STYLE_GUIDE.SPACING.s4,
                                        pl: STYLE_GUIDE.SPACING.s4,
                                        borderRadius: "8px",
                                        mx: STYLE_GUIDE.SPACING.s3,
                                        "&:hover": {
                                          backgroundColor:
                                            STYLE_GUIDE.COLORS
                                              .backgroundDefault,
                                        },
                                      }}
                                    >
                                      <ListItemIcon
                                        sx={{
                                          minWidth: 0,
                                          mr: 1,
                                          justifyContent: "center",
                                        }}
                                      >
                                        {subItem.icon}
                                      </ListItemIcon>
                                      <ListItemText
                                        primary={subItem.name}
                                        sx={{
                                          m: 0,
                                          "& .MuiListItemText-primary": {
                                            ...getNavigationSx(),
                                            fontWeight: subItem.isBold
                                              ? 600
                                              : 400,
                                            color: subItem.isBold
                                              ? theme.palette.text.primary
                                              : theme.palette.text.secondary,
                                          },
                                        }}
                                      />
                                      {openNav &&
                                        ((subItem.name === "Theme Settings" &&
                                          openThemeSettings) ||
                                        (subItem.name === "Data Sources" &&
                                          openDataSources) ||
                                        (subItem.name === "System Settings" &&
                                          openSystemSettings) ? (
                                          <ExpandLessIcon
                                            sx={{
                                              fontSize:
                                                getNavigationSx().fontSize,
                                            }}
                                          />
                                        ) : (
                                          <ExpandMoreIcon
                                            sx={{
                                              fontSize:
                                                getNavigationSx().fontSize,
                                            }}
                                          />
                                        ))}
                                    </ListItemButton>
                                    <Collapse
                                      in={
                                        subItem.name === "Theme Settings"
                                          ? openThemeSettings
                                          : subItem.name === "Data Sources"
                                            ? openDataSources
                                            : subItem.name === "System Settings"
                                              ? openSystemSettings
                                              : false
                                      }
                                      timeout="auto"
                                      unmountOnExit
                                    >
                                      <List
                                        component="div"
                                        disablePadding
                                        sx={{
                                          // Add scrolling for nested dropdowns with many items
                                          maxHeight: "300px",
                                          overflowY: "auto",
                                          overflowX: "hidden",
                                          "&::-webkit-scrollbar": {
                                            width: "6px",
                                          },
                                          "&::-webkit-scrollbar-track": {
                                            background: "transparent",
                                          },
                                          "&::-webkit-scrollbar-thumb": {
                                            background:
                                              theme.palette.action.hover,
                                            borderRadius: "3px",
                                          },
                                          "&::-webkit-scrollbar-thumb:hover": {
                                            background:
                                              theme.palette.action.selected,
                                          },
                                        }}
                                      >
                                        {subItem.subItems?.map(
                                          (nestedItem, nestedIndex) => (
                                            <ListItem
                                              key={nestedIndex}
                                              disablePadding
                                              sx={{ display: "block", mb: 0.5 }}
                                            >
                                              <ListItemButton
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  closeAllDropdowns();
                                                  navigate(nestedItem.route);
                                                }}
                                                sx={{
                                                  minHeight: 36,
                                                  px: STYLE_GUIDE.SPACING.s4,
                                                  pl: STYLE_GUIDE.SPACING.s8,
                                                  borderRadius: "8px",
                                                  mx: STYLE_GUIDE.SPACING.s3,
                                                  "&:hover": {
                                                    backgroundColor:
                                                      STYLE_GUIDE.COLORS
                                                        .backgroundDefault,
                                                  },
                                                }}
                                              >
                                                <ListItemIcon
                                                  sx={{
                                                    minWidth: 0,
                                                    mr: 1,
                                                    justifyContent: "center",
                                                  }}
                                                >
                                                  {nestedItem.icon}
                                                </ListItemIcon>
                                                <ListItemText
                                                  primary={nestedItem.name}
                                                  sx={{
                                                    m: 0,
                                                    "& .MuiListItemText-primary":
                                                      {
                                                        ...getNavigationSx(),
                                                      },
                                                  }}
                                                />
                                              </ListItemButton>
                                            </ListItem>
                                          )
                                        )}
                                      </List>
                                    </Collapse>
                                  </ListItem>
                                ) : (
                                  <ListItem
                                    disablePadding
                                    sx={{ display: "block", mb: 0.5 }}
                                  >
                                    <ListItemButton
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        closeAllDropdowns();
                                        navigate(subItem.route);
                                      }}
                                      sx={{
                                        minHeight: 36,
                                        px: STYLE_GUIDE.SPACING.s4,
                                        pl: STYLE_GUIDE.SPACING.s4,
                                        borderRadius: "8px",
                                        mx: STYLE_GUIDE.SPACING.s3,
                                        "&:hover": {
                                          backgroundColor:
                                            STYLE_GUIDE.COLORS
                                              .backgroundDefault,
                                        },
                                      }}
                                    >
                                      <ListItemIcon
                                        sx={{
                                          minWidth: 0,
                                          mr: 1,
                                          justifyContent: "center",
                                        }}
                                      >
                                        {subItem.icon}
                                      </ListItemIcon>
                                      <ListItemText
                                        primary={subItem.name}
                                        sx={{
                                          m: 0,
                                          "& .MuiListItemText-primary": {
                                            ...getNavigationSx(),
                                            fontWeight: subItem.isBold
                                              ? 600
                                              : 400,
                                            color: subItem.isBold
                                              ? theme.palette.text.primary
                                              : theme.palette.text.secondary,
                                          },
                                        }}
                                      />
                                    </ListItemButton>
                                  </ListItem>
                                )}
                              </React.Fragment>
                            ))} */}
                            {item.subItems?.map((subItem, subIndex) => (
                              <React.Fragment key={subIndex}>
                                {subItem.subItems ? (
                                  <ListItem
                                    disablePadding
                                    sx={{ display: "block", mb: 0.5 }}
                                  >
                                    <ListItemButton
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleItemClick(
                                          subItem.route,
                                          !!subItem.subItems,
                                          subItem.name
                                        );
                                      }}
                                      sx={{
                                        minHeight: 36,
                                        px: STYLE_GUIDE.SPACING.s4,
                                        pl: STYLE_GUIDE.SPACING.s4,
                                        borderRadius: "8px",
                                        mx: STYLE_GUIDE.SPACING.s3,
                                        "&:hover": {
                                          backgroundColor:
                                            STYLE_GUIDE.COLORS
                                              .backgroundDefault,
                                        },
                                      }}
                                    >
                                      <ListItemIcon
                                        sx={{
                                          minWidth: 0,
                                          mr: 1,
                                          justifyContent: "center",
                                        }}
                                      >
                                        {subItem.icon}
                                      </ListItemIcon>
                                      <ListItemText
                                        primary={subItem.name}
                                        sx={{
                                          m: 0,
                                          "& .MuiListItemText-primary": {
                                            ...getNavigationSx(),
                                            fontWeight: subItem.isBold
                                              ? 600
                                              : 400,
                                            color: subItem.isBold
                                              ? theme.palette.text.primary
                                              : theme.palette.text.secondary,
                                          },
                                        }}
                                      />
                                      {openNav &&
                                        ((subItem.name === "Theme Settings" &&
                                          openThemeSettings) ||
                                        (subItem.name === "Data Sources" &&
                                          openDataSources) ||
                                        (subItem.name === "System Settings" &&
                                          openSystemSettings) ? (
                                          <ExpandLessIcon
                                            sx={{
                                              fontSize:
                                                getNavigationSx().fontSize,
                                            }}
                                          />
                                        ) : (
                                          <ExpandMoreIcon
                                            sx={{
                                              fontSize:
                                                getNavigationSx().fontSize,
                                            }}
                                          />
                                        ))}
                                    </ListItemButton>
                                    <Collapse
                                      in={
                                        subItem.name === "Theme Settings"
                                          ? openThemeSettings
                                          : subItem.name === "Data Sources"
                                            ? openDataSources
                                            : subItem.name === "System Settings"
                                              ? openSystemSettings
                                              : false
                                      }
                                      timeout="auto"
                                      unmountOnExit
                                    >
                                      {/* Scrollable container for nested items */}
                                      <Box
                                        sx={{
                                          maxHeight: "300px", // Fixed height for scrollable area
                                          overflowY: "auto", // Enable vertical scrolling
                                          overflowX: "hidden", // Hide horizontal scrollbar
                                          // Custom scrollbar styling
                                          "&::-webkit-scrollbar": {
                                            width: "6px",
                                          },
                                          "&::-webkit-scrollbar-track": {
                                            background: "transparent",
                                          },
                                          "&::-webkit-scrollbar-thumb": {
                                            background:
                                              theme.palette.action.hover,
                                            borderRadius: "3px",
                                          },
                                          "&::-webkit-scrollbar-thumb:hover": {
                                            background:
                                              theme.palette.action.selected,
                                          },
                                          // Firefox support
                                          scrollbarWidth: "thin",
                                          scrollbarColor: `${theme.palette.action.hover} transparent`,
                                        }}
                                      >
                                        <List component="div" disablePadding>
                                          {subItem.subItems?.map(
                                            (nestedItem, nestedIndex) => (
                                              <ListItem
                                                key={nestedIndex}
                                                disablePadding
                                                sx={{
                                                  display: "block",
                                                  mb: 0.5,
                                                }}
                                              >
                                                <ListItemButton
                                                  onClick={(e) => {
                                                    e.stopPropagation();
                                                    closeAllDropdowns();
                                                    navigate(nestedItem.route);
                                                  }}
                                                  sx={{
                                                    minHeight: 36,
                                                    px: STYLE_GUIDE.SPACING.s4,
                                                    pl: STYLE_GUIDE.SPACING.s8,
                                                    borderRadius: "8px",
                                                    mx: STYLE_GUIDE.SPACING.s3,
                                                    "&:hover": {
                                                      backgroundColor:
                                                        STYLE_GUIDE.COLORS
                                                          .backgroundDefault,
                                                    },
                                                  }}
                                                >
                                                  <ListItemIcon
                                                    sx={{
                                                      minWidth: 0,
                                                      mr: 1,
                                                      justifyContent: "center",
                                                    }}
                                                  >
                                                    {nestedItem.icon}
                                                  </ListItemIcon>
                                                  <ListItemText
                                                    primary={nestedItem.name}
                                                    sx={{
                                                      m: 0,
                                                      "& .MuiListItemText-primary":
                                                        {
                                                          ...getNavigationSx(),
                                                        },
                                                    }}
                                                  />
                                                </ListItemButton>
                                              </ListItem>
                                            )
                                          )}
                                        </List>
                                      </Box>
                                    </Collapse>
                                  </ListItem>
                                ) : (
                                  <ListItem
                                    disablePadding
                                    sx={{ display: "block", mb: 0.5 }}
                                  >
                                    <ListItemButton
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        closeAllDropdowns();
                                        navigate(subItem.route);
                                      }}
                                      sx={{
                                        minHeight: 36,
                                        px: STYLE_GUIDE.SPACING.s4,
                                        pl: STYLE_GUIDE.SPACING.s4,
                                        borderRadius: "8px",
                                        mx: STYLE_GUIDE.SPACING.s3,
                                        "&:hover": {
                                          backgroundColor:
                                            STYLE_GUIDE.COLORS
                                              .backgroundDefault,
                                        },
                                      }}
                                    >
                                      <ListItemIcon
                                        sx={{
                                          minWidth: 0,
                                          mr: 1,
                                          justifyContent: "center",
                                        }}
                                      >
                                        {subItem.icon}
                                      </ListItemIcon>
                                      <ListItemText
                                        primary={subItem.name}
                                        sx={{
                                          m: 0,
                                          "& .MuiListItemText-primary": {
                                            ...getNavigationSx(),
                                            fontWeight: subItem.isBold
                                              ? 600
                                              : 400,
                                            color: subItem.isBold
                                              ? theme.palette.text.primary
                                              : theme.palette.text.secondary,
                                          },
                                        }}
                                      />
                                    </ListItemButton>
                                  </ListItem>
                                )}
                              </React.Fragment>
                            ))}
                          </>
                        ) : (
                          <SubItemsList
                            subItems={item.subItems.filter(
                              (subItem) => !subItem.isCreateButton
                            )}
                            openNav={openNav}
                            parentName={item.name}
                            dashboards={dashboards}
                            onDeleteClick={handleDeleteClick}
                            onCreateClick={() => setOpenCreateModal(true)}
                          />
                        )}
                      </List>
                    </Collapse>
                  )}
                </React.Fragment>
              ))}
            </List>
          </Box>
          <Box
            sx={{
              px: STYLE_GUIDE.SPACING.s4,
              pb: STYLE_GUIDE.SPACING.s2,
              mt: "auto",
              flexShrink: 0,
            }}
          >
            <ListItemButton
              onClick={(e) => {
                e.stopPropagation();
                handleLogout();
              }}
              sx={{
                minHeight: 42,
                px: STYLE_GUIDE.SPACING.s4,
                borderRadius: "8px",
                justifyContent: openNav ? "initial" : "center",
                color: theme.palette.text.primary,
                "&:hover": {
                  backgroundColor: theme.palette.action.hover,
                },
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 0,
                  mr: openNav ? STYLE_GUIDE.SPACING.s4 : "auto",
                  justifyContent: "center",
                }}
              >
                <LogoutIcon sx={{ color: theme.getIconColor() }} />
              </ListItemIcon>
              <ListItemText
                primary="Logout"
                sx={{
                  opacity: openNav ? 1 : 0,
                  m: 0,
                  "& .MuiListItemText-primary": {
                    ...getNavigationSx(),
                  },
                }}
              />
            </ListItemButton>
          </Box>
        </Box>
      </Drawer>
      <CreateDashboardModal
        open={openCreateModal}
        onClose={handleCloseCreateModal}
        newDashboardName={newDashboardName}
        onNameChange={setNewDashboardName}
        onCreate={handleCreateDashboard}
        isCreating={isCreatingLoading}
        dashboardType={dashboardType}
        onDashboardTypeChange={setDashboardType}
        timePeriod={timePeriod}
        onTimePeriodChange={setTimePeriod}
        dataSourceId={dataSourceId}
        onDataSourceChange={setDataSourceId}
      />
      <DeleteConfirmationModal
        open={deleteModalOpen}
        dashboard={dashboardToDelete}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        isDeleting={isDeleting}
      />
    </Box>
  );
}
