import { styled, Theme, CSSObject } from "@mui/material/styles";
import Box from "@mui/material/Box";
import MuiDrawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import { useNav } from "../../../context/NavContext";
import LayersIcon from "@mui/icons-material/Layers";
import NotificationsIcon from "@mui/icons-material/Notifications";
import ArticleIcon from "@mui/icons-material/Article";
import AddIcon from "@mui/icons-material/Add";
import React, { useEffect, useMemo, useContext, useState } from "react";
import { Collapse, LinearProgress, Tooltip, Typography } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import { useNavigate, useLocation } from "react-router-dom";
import SourceIcon from "@mui/icons-material/Source";
import HomeIcon from "@mui/icons-material/Home";
import DashboardIcon from "@mui/icons-material/Dashboard";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import TaskIcon from "@mui/icons-material/Task";
import AssessmentIcon from "@mui/icons-material/Assessment";
import PaletteIcon from "@mui/icons-material/Palette";
import BrushIcon from "@mui/icons-material/Brush";
import { useInfiniteScroll } from "../../../hooks/useInfiniteScroll";
import { GET } from "../../../services/apiRoutes";
import { DataSourceListData, DataSourceListPayload } from "./types";
import { setDataSourceList } from "../../../pages/dataSources/dataSourceActions";
import { useAppDispatch, useAppSelector } from "../../../storeHooks";
import PersonIcon from "@mui/icons-material/Person";
import KeyIcon from "@mui/icons-material/Key";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import {
  fetchDashboardList,
  createDashboard,
  deleteDashboard,
} from "../../../pages/dashboard/dashboardActions";
import {
  Dashboard as DashboardType,
  DashboardListResponse,
} from "../../../pages/dashboard/types";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { toast } from "react-toastify";
import { DeleteConfirmationModal } from "./components/DeleteConfirmationModal";
import { SubItemsList } from "./components/SubItemsList";
import { CreateDashboardModal } from "./components/CreateDashboardModal";
import LogoutIcon from "@mui/icons-material/Logout";
import logo from "../../../assets/ReportiVix-logo.png";
import { AuthContext } from "../../../context/AuthContext";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import { STYLE_GUIDE } from "../../../styles";
import SettingsIcon from "@mui/icons-material/Settings";
import { useUnifiedTheme } from "../../../hooks/useUnifiedTheme";
import { useComponentTypography } from "../../../hooks/useComponentTypography";
import BusinessIcon from "@mui/icons-material/Business";
import AssignmentIndIcon from "@mui/icons-material/AssignmentInd";
import useGet from "../../../hooks/useGet";
import { useSelector } from "react-redux";
import { RootState } from "../../../reducers";
import HorizontalSplitIcon from "@mui/icons-material/HorizontalSplit";
import ManageAccountsIcon from "@mui/icons-material/ManageAccounts";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import ArrowDropDownCircleIcon from "@mui/icons-material/ArrowDropDownCircle";
import DeleteIcon from "@mui/icons-material/Delete";
import TopicIcon from "@mui/icons-material/Topic";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import BusinessCenterIcon from "@mui/icons-material/BusinessCenter";
import InsertChartOutlinedIcon from "@mui/icons-material/InsertChartOutlined";
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted";
import { UseQueryResult } from "@tanstack/react-query";
import { checkPermission, PermissionMap } from "../../../utils/utils";
import { PermissionsMap } from "../../../utils/constants";

interface ErrorResponse {
  success: boolean;
  message: string;
  error: Record<string, unknown>;
}

const drawerWidth = 250;

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
    overflow: "auto",
  },
  "& .MuiDrawer-paper": {
    position: "static",
    overflow: "auto",
  },
  "& .MuiList-root": {
    height: "100%",
    overflow: "auto",
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
  const [openChartsSettings, setOpenChartsSettings] = React.useState(false);
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
  const shouldAllowDashboardCreate = checkPermission(
    permissions,
    PermissionsMap.DASHBOARD,
    "create"
  );
  const dataSourcePermissions = permissions?.["Data Source"] || {};
  const validPermissionIds = Object.entries(dataSourcePermissions)
    .filter(([key, permission]) => {
      return permission.allowed === true && permission.dataSourceId?._id;
    })
    .map(([key, permission]) => permission.dataSourceId._id);

  const defaultNotivixDash = dashboards.find(
    (item) => item?.isDefaultNotivix === true
  );
  // console.log("defaultNotivixDash", defaultNotivixDash);

  // const closeAllDropdowns = () => {
  //   setOpenSettings(false);
  //   setOpenDashboard(false);
  //   setOpenNotificationSettings(false);
  //   setOpenGlobalSettings(false);
  //   setOpenReportSettings(false);
  //   setOpenThemeSettings(false);
  //   setOpenSystemSettings(false);
  //   setOpenDataSources(false);
  // };

  useEffect(() => {
    dispatch(fetchDashboardList());
  }, [dispatch]);

  const dataSourceListAPI = useGet<{
    success: boolean;
    data: DataSourceListData[];
  }>(
    ["dataSourceListAPI"],
    GET?.DATA_SOURCE_LIST + `?canEditInline=true`,
    true
  );

  const dataSourceNotivixListAPI = useGet<DataSourceListPayload>(
    ["dataSourceNotivixList"],
    GET?.DATA_SOURCE_LIST + `?isShowMenu=true`
  );

  // const dataSourceList = useMemo(() => {
  //   return dataSourceListAPI?.data?.pages?.flatMap((page) => page?.data) || [];
  // }, [dataSourceListAPI?.data?.pages]);
  const dataSourceList = useMemo(() => {
    return dataSourceListAPI?.data?.data || [];
  }, [dataSourceListAPI?.data?.data]);

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
      } else if (itemName === "Notifications") {
        setOpenNotificationSettings((prev) => !prev);
        // navigate(route);
      } else if (itemName === "Settings") {
        setOpenReportSettings((prev) => !prev);
        // Don't navigate for Settings main item
      } else if (itemName === "Theme Settings") {
        setOpenThemeSettings((prev) => !prev);
      } else if (itemName === "System Settings") {
        setOpenSystemSettings((prev) => !prev);
      } else if (itemName === "IP Report Constants") {
        setOpenDataSources((prev) => !prev);
      } else {
        setOpenSettings((prev) => !prev);
      }
    } else {
      if (itemName !== "Settings") {
        // closeAllDropdowns();
      }
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

  const { logout } = useContext(AuthContext);

  const handleLogout = () => {
    logout();
  };

  const navItems: NavItem[] = useMemo(() => {
    return getNavItems(
      matchedDataSources,
      dataSourceList,
      dataSourceListAPI,
      dataSourceNotivixListAPI,
      theme,
      location,
      permissions
    );
  }, [
    loading,
    dashboards,
    dataSourceList,
    matchedDataSources,
    dataSourceListAPI?.hasNextPage,
    dataSourceNotivixListAPI?.isLoading,
    // lastElementRef,
  ]);

  // NEW: Separate handler for settings items that doesn't close the main Settings dropdown
  const handleSettingsItemClick = (route: string, itemName: string) => {
    // Navigate to the route but don't close the Settings dropdown
    navigate(route);
  };

  // NEW: Handler for nested items that also doesn't close the main Settings dropdown
  const handleNestedItemClick = (route: string) => {
    // Navigate to the route but don't close the Settings dropdown
    navigate(route);
  };

  const isRouteActive = (route: string) => {
    return location.pathname.startsWith(route);
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
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
            overflow: "auto",
            borderRight: `1px solid ${theme.palette.divider}`,
            bgcolor: "#f9f9f9",
            py: 2,
          }}
        >
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
                pt: 0,
                pb: "50px",
              }}
            >
              {navItems.map((item, i) => {
                if (item.shouldShow !== undefined && !item.shouldShow) {
                  return null;
                }
                return (
                  <React.Fragment key={i}>
                    <MainListItem
                      disabled={item.name === "Theme Settings"} // Disable Theme Settings
                      isMainItem={true}
                      label={item.name}
                      icon={item.icon}
                      route={item.route}
                      onClick={() =>
                        handleItemClick(item.route, !!item.subItems, item.name)
                      }
                      isExpanded={
                        (item.subItems &&
                          openNav &&
                          item.name === "Dashboards" &&
                          openDashboard) ||
                        (item.name === "Notifications" &&
                          openNotificationSettings) ||
                        (item.name === "Settings" && openReportSettings) ||
                        (item.name === "Theme Settings" && openThemeSettings) ||
                        (item.name === "IP Report Constants" &&
                          openDataSources) ||
                        (item.name === "System Settings" && openSystemSettings)
                      }
                      collapsibleComp={
                        item.subItems &&
                        openNav && (
                          <Collapse
                            in={
                              item.name === "Dashboards"
                                ? openDashboard
                                : item.name === "Notifications"
                                ? openNotificationSettings
                                : item.name === "Settings"
                                ? openReportSettings
                                : item.name === "Theme Settings"
                                ? openThemeSettings
                                : item.name === "IP Report Constants"
                                ? openDataSources
                                : item.name === "System Settings"
                                ? openSystemSettings
                                : openSettings
                            }
                            timeout="auto"
                            unmountOnExit
                          >
                            {/* Scrollable container for dropdown */}
                            <Box
                              sx={{
                                // maxHeight: "480px",
                                // overflowY: "auto",
                                overflowX: "hidden",
                                "&::-webkit-scrollbar": {
                                  width: "3px",
                                },
                                "&::-webkit-scrollbar-track": {
                                  background: "transparent",
                                },
                                "&::-webkit-scrollbar-thumb": {
                                  background: theme.palette.action.hover,
                                  borderRadius: "1.5px",
                                },
                                "&::-webkit-scrollbar-thumb:hover": {
                                  background: theme.palette.action.selected,
                                },
                                scrollbarWidth: "thin",
                                scrollbarColor: `${theme.palette.action.hover} transparent`,
                              }}
                            >
                              <List
                                component="div"
                                disablePadding
                                sx={{
                                  py: 0.25,
                                  // backgroundColor: "#a136a126",
                                }}
                              >
                                {item.name === "Dashboards" && (
                                  <>
                                    {/* Create New Dashboard Button */}
                                    {shouldAllowDashboardCreate && (
                                      <MainListItem
                                        onClick={() => setOpenCreateModal(true)}
                                        label="New Dashboards"
                                        icon={
                                          <AddIcon
                                            sx={{
                                              fontSize: "14px",
                                              color: theme.getIconColor(),
                                            }}
                                          />
                                        }
                                      />
                                    )}

                                    {/* Scrollable Dashboard List */}
                                    <SubItemScroller>
                                      {loading ? (
                                        <MainListItem
                                          label="..."
                                          icon={<LinearProgress />}
                                          onClick={() => {}}
                                        />
                                      ) : (
                                        dashboards.map(
                                          (
                                            dashboard: DashboardType,
                                            index: number
                                          ) => (
                                            <MainListItem
                                              route={`/dashboard/${dashboard._id}`}
                                              key={dashboard._id}
                                              onClick={() =>
                                                navigate(
                                                  `/dashboard/${dashboard._id}`,
                                                  {
                                                    state: {
                                                      enableEditMode: false,
                                                    },
                                                  }
                                                )
                                              }
                                              label={dashboard.name}
                                              title={dashboard.name}
                                              showIcon={true}
                                              icon={
                                                <NumberIcon
                                                  number={index + 1}
                                                  route={`/dashboard/${dashboard._id}`}
                                                />
                                              }
                                            />
                                          )
                                        )
                                      )}
                                    </SubItemScroller>

                                    {/* All Dashboards Link */}
                                    <MainListItem
                                      route="/dashboard"
                                      onClick={() => navigate("/dashboard")}
                                      label="All Dashboards"
                                      icon={<DashboardIcon />}
                                    />
                                  </>
                                )}

                                {item.name === "Notifications" && (
                                  <>
                                    {item.subItems?.map((subItem, subIndex) => {
                                      if (
                                        subItem.shouldShow !== undefined &&
                                        !subItem.shouldShow
                                      ) {
                                        return null;
                                      }
                                      return (
                                        <MainListItem
                                          key={subIndex}
                                          label={subItem.name}
                                          icon={subItem.icon}
                                          onClick={() =>
                                            navigate(subItem.route)
                                          }
                                          route={subItem.route}
                                        />
                                      );
                                    })}
                                  </>
                                )}

                                {item.name === "Settings" ? (
                                  <>
                                    {item.subItems?.map((subItem, subIndex) => {
                                      const hasNestedItems =
                                        subItem.subItems &&
                                        subItem.subItems.length > 0;

                                      if (
                                        subItem.shouldShow !== undefined &&
                                        !subItem.shouldShow
                                      ) {
                                        return null;
                                      }

                                      return (
                                        <React.Fragment key={subIndex}>
                                          {hasNestedItems ? (
                                            <MainListItem
                                              disabled={
                                                subItem.name ===
                                                "Theme Settings"
                                              } // Disable Theme Settings, System Settings, IP Report Constants
                                              route={subItem.route}
                                              icon={subItem.icon}
                                              label={subItem.name}
                                              title={subItem.name}
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                e.preventDefault();
                                                if (!subItem?.disabled) {
                                                  if (
                                                    subItem.name ===
                                                    "Theme Settings"
                                                  ) {
                                                    setOpenThemeSettings(
                                                      (prev) => !prev
                                                    );
                                                  } else if (
                                                    subItem.name ===
                                                    "System Settings"
                                                  ) {
                                                    setOpenSystemSettings(
                                                      (prev) => !prev
                                                    );
                                                  } else if (
                                                    subItem.name ===
                                                    "IP Report Constants"
                                                  ) {
                                                    setOpenDataSources(
                                                      (prev) => !prev
                                                    );
                                                  }
                                                }
                                              }}
                                              isExpanded={
                                                subItem.name ===
                                                "Theme Settings"
                                                  ? openThemeSettings
                                                  : subItem.name ===
                                                    "IP Report Constants"
                                                  ? openDataSources
                                                  : subItem.name ===
                                                    "System Settings"
                                                  ? openSystemSettings
                                                  : false
                                              }
                                              collapsibleComp={
                                                <Collapse
                                                  in={
                                                    subItem.name ===
                                                    "Theme Settings"
                                                      ? openThemeSettings
                                                      : subItem.name ===
                                                        "IP Report Constants"
                                                      ? openDataSources
                                                      : subItem.name ===
                                                        "System Settings"
                                                      ? openSystemSettings
                                                      : false
                                                  }
                                                  timeout="auto"
                                                  unmountOnExit
                                                >
                                                  <SubItemScroller>
                                                    <List
                                                      component="div"
                                                      disablePadding
                                                    >
                                                      {subItem.subItems?.map(
                                                        (nestedItem) => {
                                                          if (
                                                            nestedItem.shouldShow !==
                                                              undefined &&
                                                            !nestedItem.shouldShow
                                                          ) {
                                                            return null;
                                                          }

                                                          const hasDeepItems =
                                                            nestedItem.subItems &&
                                                            nestedItem.subItems
                                                              .length > 0;

                                                          if (!hasDeepItems) {
                                                            return (
                                                              <MainListItem
                                                                key={
                                                                  nestedItem.name
                                                                }
                                                                route={
                                                                  nestedItem.route
                                                                }
                                                                isNested={true}
                                                                icon={
                                                                  nestedItem.icon
                                                                }
                                                                label={
                                                                  nestedItem.name
                                                                }
                                                                title={
                                                                  nestedItem.name
                                                                }
                                                                onClick={(
                                                                  e
                                                                ) => {
                                                                  e.stopPropagation();
                                                                  e.preventDefault();
                                                                  handleNestedItemClick(
                                                                    nestedItem.route
                                                                  );
                                                                }}
                                                              />
                                                            );
                                                          }

                                                          return (
                                                            <MainListItem
                                                              key={
                                                                nestedItem.name
                                                              }
                                                              route={
                                                                nestedItem.route
                                                              }
                                                              isNested={true}
                                                              icon={
                                                                nestedItem.icon
                                                              }
                                                              label={
                                                                nestedItem.name
                                                              }
                                                              title={
                                                                nestedItem.name
                                                              }
                                                              onClick={(e) => {
                                                                e.stopPropagation();
                                                                e.preventDefault();
                                                                setOpenChartsSettings(
                                                                  (prev) =>
                                                                    !prev
                                                                );
                                                              }}
                                                              isExpanded={
                                                                openChartsSettings
                                                              }
                                                              collapsibleComp={
                                                                <Collapse
                                                                  in={
                                                                    openChartsSettings
                                                                  }
                                                                  timeout="auto"
                                                                  unmountOnExit
                                                                >
                                                                  <SubItemScroller>
                                                                    <List
                                                                      component="div"
                                                                      disablePadding
                                                                      sx={{
                                                                        pl: STYLE_GUIDE
                                                                          .SPACING
                                                                          .s4,
                                                                      }}
                                                                    >
                                                                      {nestedItem.subItems?.map(
                                                                        (
                                                                          deepItem
                                                                        ) => {
                                                                          if (
                                                                            deepItem.shouldShow !==
                                                                              undefined &&
                                                                            !deepItem.shouldShow
                                                                          ) {
                                                                            return null;
                                                                          }
                                                                          return (
                                                                            <MainListItem
                                                                              key={
                                                                                deepItem.name
                                                                              }
                                                                              route={
                                                                                deepItem.route
                                                                              }
                                                                              isNested={
                                                                                true
                                                                              }
                                                                              icon={
                                                                                deepItem.icon
                                                                              }
                                                                              label={
                                                                                deepItem.name
                                                                              }
                                                                              title={
                                                                                deepItem.name
                                                                              }
                                                                              onClick={(
                                                                                e
                                                                              ) => {
                                                                                e.stopPropagation();
                                                                                e.preventDefault();
                                                                                handleNestedItemClick(
                                                                                  deepItem.route
                                                                                );
                                                                              }}
                                                                            />
                                                                          );
                                                                        }
                                                                      )}
                                                                    </List>
                                                                  </SubItemScroller>
                                                                </Collapse>
                                                              }
                                                            />
                                                          );
                                                        }
                                                      )}
                                                    </List>
                                                  </SubItemScroller>
                                                </Collapse>
                                              }
                                            />
                                          ) : (
                                            // ALL direct items (Attribute Option, Entity, Report Settings, constantDataSources, etc.)
                                            <MainListItem
                                              route={subItem.route}
                                              icon={subItem.icon}
                                              label={subItem.name}
                                              title={subItem.name}
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                e.preventDefault();
                                                handleSettingsItemClick(
                                                  subItem.route,
                                                  subItem.name
                                                );
                                              }}
                                            />
                                          )}
                                        </React.Fragment>
                                      );
                                    })}
                                  </>
                                ) : (
                                  item.name !== "Dashboards" &&
                                  item.name !== "Notifications" && (
                                    <MainListItem
                                      route={item.route}
                                      onClick={() => {
                                        navigate(item.route);
                                      }}
                                      label={item.name}
                                      collapsibleComp={
                                        <Collapse
                                          in={true}
                                          timeout="auto"
                                          unmountOnExit
                                        >
                                          <SubItemScroller>
                                            <List
                                              component="div"
                                              disablePadding
                                              sx={{ overflow: "hidden" }}
                                            >
                                              {item.subItems?.map(
                                                (nestedItem) => (
                                                  <MainListItem
                                                    route={nestedItem.route}
                                                    onClick={(e) => {
                                                      e.stopPropagation();
                                                      e.preventDefault();
                                                      handleNestedItemClick(
                                                        nestedItem.route
                                                      );
                                                    }}
                                                    isNested={true}
                                                    icon={nestedItem.icon}
                                                    label={nestedItem.name}
                                                    title={nestedItem.name}
                                                  />
                                                )
                                              )}
                                            </List>
                                          </SubItemScroller>
                                        </Collapse>
                                      }
                                    />
                                  )
                                )}
                              </List>
                            </Box>
                          </Collapse>
                        )
                      }
                    />
                  </React.Fragment>
                );
              })}
            </List>
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

function MainListItem({
  onClick,
  label,
  icon,
  title,
  collapsibleComp,
  isExpanded,
  isNested,
  route,
  isMainItem,
  showIcon,
  disabled = false,
}: {
  onClick: (e: React.MouseEvent) => void;
  label: string;
  icon?: React.ReactNode;
  title?: string;
  collapsibleComp?: React.ReactNode;
  isExpanded?: boolean;
  isNested?: boolean;
  route?: string;
  isMainItem?: boolean;
  showIcon?: boolean;
  disabled?: boolean;
}) {
  const { getNavigationSx } = useComponentTypography();
  const theme = useUnifiedTheme();
  const location = useLocation();
  const isRouteActive = (route: string) => {
    return location.pathname.startsWith(route);
  };

  let spacing = isMainItem ? STYLE_GUIDE.SPACING.s4 : STYLE_GUIDE.SPACING.s8;
  if (isNested) {
    spacing = STYLE_GUIDE.SPACING.s12;
  }

  const isActive = route ? isRouteActive(route) : false;

  const showListItemIcon = isMainItem || showIcon ? true : false;

  return (
    <ListItem
      disablePadding
      sx={{
        display: "block",
        // px: isMainItem ? STYLE_GUIDE.SPACING.s2 : 0,
        py: 0.25,
      }}
    >
      {!isMainItem && (
        <Box
          sx={{
            backgroundColor: isActive ? theme.palette.primary.main : "#e2e2e2",
            left: `calc(${spacing} - 8px)`,
          }}
          className="absolute h-full w-[2px] top-0"
        ></Box>
      )}

      <Tooltip title={title} placement="right">
        <ListItemButton
          disabled={disabled} // Apply disabled state
          onClick={(e) => {
            if (!disabled) {
              // Only handle click if not disabled
              e.stopPropagation();
              onClick(e);
            }
          }}
          sx={{
            minHeight: 36,
            px: STYLE_GUIDE.SPACING.s2,
            pl: spacing,
            // borderRadius: "6px",
            transition: "all 0.2s ease-in-out",
            // backgroundColor: isActive
            //   ? theme.palette.action.selected
            //   : "transparent",
            "&:hover": {
              backgroundColor: isActive
                ? theme.palette.action.selected
                : theme.palette.action.hover,
              // transform: "translateX(2px)",
            },
            color: isActive
              ? theme.palette.primary.main
              : theme.palette.text.primary,
          }}
        >
          {icon && showListItemIcon && (
            <ListItemIcon
              sx={{
                minWidth: 24,
                mr: 1.25,
                justifyContent: "center",
                display: "flex",
                alignItems: "center",
                "& .MuiSvgIcon-root": {
                  fontSize: 20,
                  color: isActive
                    ? theme.palette.primary.main
                    : theme.palette.text.secondary,
                  transition: "color 0.2s ease-in-out",
                },
              }}
            >
              {icon}
            </ListItemIcon>
          )}
          {!showListItemIcon && <Box sx={{ width: 4, height: 12 }} />}
          <ListItemText
            primary={label}
            sx={{
              m: 0,
              flex: 1,
              "& .MuiListItemText-primary": {
                ...getNavigationSx(),
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                fontSize: isMainItem ? 13 : 12,
                fontWeight: isActive ? 600 : isMainItem ? 500 : 400,
                color: isActive
                  ? theme.palette.primary.main
                  : theme.palette.text.primary,
                lineHeight: 1.5,
                transition: "all 0.2s ease-in-out",
              },
            }}
          />
          {collapsibleComp && (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                ml: 0.5,
              }}
            >
              {isExpanded ? (
                <ExpandLessIcon
                  sx={{
                    fontSize: 20,
                    color: isActive
                      ? theme.palette.primary.main
                      : theme.palette.text.secondary,
                    transition: "all 0.2s ease-in-out",
                  }}
                />
              ) : (
                <ExpandMoreIcon
                  sx={{
                    fontSize: 20,
                    color: isActive
                      ? theme.palette.primary.main
                      : theme.palette.text.secondary,
                    transition: "all 0.2s ease-in-out",
                  }}
                />
              )}
            </Box>
          )}
        </ListItemButton>
      </Tooltip>
      {collapsibleComp}
    </ListItem>
  );
}

function SubItemScroller({ children }: { children: React.ReactNode }) {
  const theme = useUnifiedTheme();
  return (
    <Box
      sx={{
        // maxHeight: "200px",
        // overflowY: "auto",
        overflowY: "hidden",
        overflowX: "hidden",
        backgroundColor: "transparent",
        "&::-webkit-scrollbar": {
          width: "3px",
        },
        "&::-webkit-scrollbar-track": {
          background: "transparent",
        },
        "&::-webkit-scrollbar-thumb": {
          background: theme.palette.action.hover,
          borderRadius: "1.5px",
        },
        "&::-webkit-scrollbar-thumb:hover": {
          background: theme.palette.action.selected,
        },
        scrollbarWidth: "thin",
        scrollbarColor: `${theme.palette.action.hover} transparent`,
      }}
    >
      {children}
    </Box>
  );
}

function NumberIcon({ number, route }: { number: number; route: string }) {
  const theme = useUnifiedTheme();

  const isRouteActive = (route: string) => {
    return location.pathname === route;
  };
  return (
    <Box
      sx={{
        width: 20,
        height: 20,
        borderRadius: "50%",
        backgroundColor: isRouteActive(route)
          ? theme.palette.primary.main
          : "#00000094",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Typography color="white" fontSize={10}>
        {number}
      </Typography>
    </Box>
  );
}

const createIcon = (
  IconComponent: React.ElementType,
  route: string,
  theme: Theme
) => {
  return (
    <IconComponent
      sx={{
        fontSize: "20px",
        color: location.pathname.startsWith(route)
          ? theme.palette.primary.main
          : theme.palette.text.secondary,
      }}
    />
  );
};

function getNavItems(
  matchedDataSources: DataSourceListData[],
  dataSourceList: DataSourceListData[],
  dataSourceListAPI: UseQueryResult<{
    success: boolean;
    data: DataSourceListData[];
  }>,
  dataSourceNotivixListAPI: UseQueryResult<DataSourceListPayload>,
  theme: any,
  location: Location,
  permissions: PermissionMap
) {
  const dsPerms = permissions?.[PermissionsMap.DATA_SOURCE] || {};


const monthlyDataSources = matchedDataSources
  .filter((item) => item.versionType === "monthly")
  .filter((item) => {
    const nameKey = (item.name == 'CaseList' ? 'Case List' : (item?.name || ""))
      .toLowerCase()
      .replace(/\s+/g, "_");
    console.log('nameKey',nameKey);
    const codeKey = (item?.code || "")
      .replace(/[^a-zA-Z0-9]/g, "")
      .toLowerCase();
    console.log(Object.keys(dsPerms).some(
      (key) =>
        key.includes("list")  &&
        (key.includes(nameKey) || key.includes(codeKey)) &&
        checkPermission(permissions, PermissionsMap.DATA_SOURCE, key)
    ));
    return Object.keys(dsPerms).some(
      (key) =>
        key.endsWith("list")  &&
        (key.includes(nameKey) || key.includes(codeKey)) &&
        checkPermission(permissions, PermissionsMap.DATA_SOURCE, key)
    );
  })
  .map((item) => ({
    name: item?.name ?? "",
    icon: createIcon(SourceIcon, `/data-source-new/${item?._id}`, theme),
    route: `/data-source-new/${item?._id}`,
  }));


  const alertsMenuItem = {
    name: "Alerts Settings",
    icon: createIcon(NotificationsActiveIcon, "/notification", theme),
    route: "/notification",
    shouldShow: checkPermission(
      permissions,
      PermissionsMap.NOTIFICATION_SETTING_TYPE,
      "list"
    ),
  };

  const NotificationLogsMenuItem = {
    name: "Notifications Logs",
    icon: createIcon(NotificationsIcon, "/notification-logs", theme),
    route: "/notification-logs",
    shouldShow: checkPermission(
      permissions,
      PermissionsMap.NOTIFICATION_LOGS,
      "list"
    ),
  };
  const Template = {
    name: "Templates",
    icon: createIcon(ArticleIcon, "/template", theme),
    route: "/template",
    shouldShow: checkPermission(
      permissions,
      PermissionsMap.NOTIFICATION_SETTING_TEMPLATE,
      "list"
    ),
  };

  const loadingIndicator =
    dataSourceListAPI?.hasNextPage || dataSourceNotivixListAPI?.isLoading
      ? [
          {
            name: "",
            icon: (
              <div style={{ paddingLeft: "1.5rem" }}>
                <LinearProgress />
              </div>
            ),
            route: "#",
          },
        ]
      : [];
  const dataSourceItems = [
    alertsMenuItem,
    Template,
    // notivixDefaultDashboard,
    ...monthlyDataSources,
    ...loadingIndicator,
    NotificationLogsMenuItem,
  ];
  const visibleDataSourceItems = Array.isArray(dataSourceItems)
    ? dataSourceItems.filter((item) => item.shouldShow !== false)
    : [];

  const shouldShowNotifications = visibleDataSourceItems.length > 0;

  return [
    {
      name: "Dashboards",
      icon: <HomeIcon />,
      route: "/dashboard",
      shouldShow: checkPermission(
        permissions,
        PermissionsMap.DASHBOARD,
        "list"
      ),
      subItems: [
        {
          name: "New Dashboard",
          icon: (
            <AddIcon
              sx={{
                fontSize: "20px",
                color: theme.palette.text.secondary,
              }}
            />
          ),
          route: "#",
          isCreateButton: true,
        },
      ],
    },
    {
      name: "Reports",
      icon: createIcon(AssessmentIcon, "/reports", theme),
      route: "/reports",
      shouldShow: checkPermission(
        permissions,
        PermissionsMap.CUSTOM_REPORT,
        "list_requests"
      ),
    },
    {
      name: "Notifications",
      icon: createIcon(NotificationsIcon, "/data-source", theme),
      route: "/data-source",
      subItems: dataSourceItems,
      shouldShow: shouldShowNotifications,
    },
    {
      name: "VixAI Insights",
      icon: createIcon(AutoAwesomeIcon, "/VixAi-Insights", theme),
      route: "/VixAi-Insights",
    },
    {
      name: "Data Export Jobs",
      icon: createIcon(TaskIcon, "/jobs", theme),
      route: "/jobs",
    },
    getSystemSettingsItems(
      dataSourceList,
      matchedDataSources,
      permissions,
      theme
    ),
  ];
}

function getSystemSettingsItems(
  dataSourceList,
  matchedDataSources,
  permissions: PermissionMap,
  theme: Theme
) {
  // Data sources for Theme Settings submenu
  const themeSettingsDataSources = dataSourceList.map((item) => ({
    name: item?.name ?? "",
    icon: createIcon(SourceIcon, `/data-source/${item?._id}`, theme),
    route: `/data-source/${item?._id}`,
  }));

  const constantDataSources = matchedDataSources
    .filter((item) => item.versionType === "constant")
    .map((item) => {
      let icon;

      switch (item.name) {
        case "Action Due":
          icon = createIcon(
            EventAvailableIcon,
            `/data-source-new/${item?._id}`,
            theme
          );
          break;
        case "IP Counsels":
          icon = createIcon(PersonIcon, `/data-source-new/${item?._id}`, theme);
          break;
        case "Formality Officer":
          icon = createIcon(
            HorizontalSplitIcon,
            `/data-source-new/${item?._id}`,
            theme
          );
          break;
        default:
          icon = createIcon(
            EventAvailableIcon,
            `/data-source-new/${item?._id}`,
            theme
          );
          break;
      }

      return {
        name: item?.name ?? "",
        icon: icon,
        route: `/data-source-new/${item?._id}`,
      };
    });

  return {
    name: "Settings",
    icon: createIcon(SettingsIcon, "/settings", theme),
    route: "/settings",
    subItems: [
      {
        name: "Attribute Option",
        icon: createIcon(ArrowDropDownCircleIcon, "/attribute-option", theme),
        route: "/attribute-option",
        isBold: true,
        // shouldShow: checkPermission(
        //   permissions,
        //   PermissionsMap.ATTRIBUTE_OPTION,
        //   "list"
        // ),
        shouldShow: false, // IMP Hardcoded to hide for now
      },
      {
        name: "Data Upload",
        icon: createIcon(CloudUploadIcon, "/data-src-version", theme),
        route: "/data-src-version",
        shouldShow: checkPermission(
          permissions,
          PermissionsMap.DATA_SOURCE_VERSION,
          "list"
        ),
      },
      {
        name: "Entity",
        icon: createIcon(CheckBoxOutlineBlankIcon, "/entity", theme),
        route: "/entity",
        isBold: true,
        shouldShow: checkPermission(
          permissions,
          PermissionsMap.ENTITIES,
          "list"
        ),
      },
      {
        name: "Data Source",
        icon: createIcon(TopicIcon, "/data-src", theme),
        route: "/data-src",
        isBold: true,
        shouldShow:
          checkPermission(permissions, PermissionsMap.DATA_SOURCE, "list") &&
          checkPermission(permissions, PermissionsMap.DATA_SOURCE, "update"),
      },
      {
        name: "IP Report Constants",
        icon: createIcon(SourceIcon, "/datasources", theme),
        route: "#",
        isBold: true,
        subItems: themeSettingsDataSources,
        shouldShow: checkPermission(
          permissions,
          PermissionsMap.CUSTOM_REPORT,
          "list"
        ),
      },
      ...constantDataSources,
      {
        name: "System Settings",
        icon: createIcon(ManageAccountsIcon, "/system-settings", theme),
        route: "#",
        isBold: true,
        subItems: [
          {
            name: "Roles",
            icon: createIcon(AssignmentIndIcon, "/roles", theme),
            route: "/roles",
            shouldShow: checkPermission(
              permissions,
              PermissionsMap.ROLE,
              "list"
            ),
          },
          {
            name: "Organization",
            icon: createIcon(BusinessIcon, "/organization", theme),
            route: "/organization",
            shouldShow: checkPermission(
              permissions,
              PermissionsMap.ORGANIZATION,
              "list"
            ),
          },
          {
            name: "Permission",
            icon: createIcon(KeyIcon, "/permissions", theme),
            route: "/permissions",
            shouldShow: checkPermission(
              permissions,
              PermissionsMap.PERMISSION,
              "list"
            ),
          },
          {
            name: "Department",
            icon: createIcon(AccountBalanceIcon, "/department", theme),
            route: "/department",
            shouldShow:
              checkPermission(permissions, PermissionsMap.DEPARTMENT, "list") &&
              checkPermission(permissions, PermissionsMap.DEPARTMENT, "update"),
          },
          {
            name: "Business Unit",
            icon: createIcon(AccountBalanceIcon, "/business-unit", theme),
            route: "/business-unit",
            shouldShow:
              checkPermission(
                permissions,
                PermissionsMap.BUSINESS_UNIT,
                "list"
              ) &&
              checkPermission(
                permissions,
                PermissionsMap.BUSINESS_UNIT,
                "update"
              ),
          },
          {
            name: "Designation",
            icon: createIcon(BusinessCenterIcon, "/designation", theme),
            route: "/designation",
            shouldShow:
              checkPermission(
                permissions,
                PermissionsMap.DESIGNATION,
                "list"
              ) &&
              checkPermission(
                permissions,
                PermissionsMap.DESIGNATION,
                "update"
              ),
          },
          {
            name: "Charts",
            icon: createIcon(
              InsertChartOutlinedIcon,
              "/system-settings/charts/source-list",
              theme
            ),
            route: "#",
            shouldShow: checkPermission(
              permissions,
              PermissionsMap.SOURCE_LIST,
              "list"
            ),
            subItems: [
              {
                name: "Source List",
                icon: createIcon(
                  FormatListBulletedIcon,
                  "/system-settings/charts/source-list",
                  theme
                ),
                route: "/system-settings/charts/source-list",
                shouldShow: checkPermission(
                  permissions,
                  PermissionsMap.SOURCE_LIST,
                  "list"
                ),
              },
            ],
          },
          {
            name: "My Profile",
            icon: createIcon(ManageAccountsIcon, "/profile", theme),
            route: "/profile",
          },
        ],
      },
    ],
  };
}
