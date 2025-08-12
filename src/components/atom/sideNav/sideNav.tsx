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
import { Collapse, IconButton, Menu, MenuItem, Tooltip } from "@mui/material";
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
import { Language } from "@mui/icons-material";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import { STYLE_GUIDE } from "../../../styles";
import SettingsIcon from "@mui/icons-material/Settings";
import { useUnifiedTheme } from "../../../hooks/useUnifiedTheme";
import { useComponentTypography } from "../../../hooks/useComponentTypography";
import reportivixIcon from "../../../../public/Reportivix-fav-32.png";
import notivixIcon from "../../../../public/NotiVix-fav-32.png";
import NotificationsIcon from "@mui/icons-material/Notifications";
import BusinessIcon from "@mui/icons-material/Business";
import AssignmentIndIcon from "@mui/icons-material/AssignmentInd";
import GridViewIcon from "@mui/icons-material/GridView";
import NotivixLogo from "../../../assets/NotiVix-Logo-TRANS-V1.png";
import useGet from "../../../hooks/useGet";
import { useSelector } from "react-redux";
import { RootState } from "../../../reducers";
import { ArrowDropDownIcon } from "@mui/x-date-pickers/icons";

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
  const [newDashboardName, setNewDashboardName] = React.useState("");
  const [dashboardType, setDashboardType] = React.useState<"normal" | "trend" | "fixed">(
    "normal"
  );
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
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const [activeTab, setActiveTab] = React.useState<"ReportiVix" | "Notifix">(
    "ReportiVix"
  );
  const permissions = useSelector(
    (state: RootState) => state.userPermission?.permissions
  );

  const dataSourcePermissions = permissions?.["Data Source"] || {};
  const validPermissionIds = Object.entries(dataSourcePermissions)
    .filter(([key, permission]) => {
      return (
        permission.allowed === true &&
        // permission.methodName === "list" &&
        permission.dataSourceId?._id
      );
    })
    .map(([key, permission]) => permission.dataSourceId._id);

  useEffect(() => {
    const path = location.pathname;
    if (path.includes("/notivix")) {
      if (activeTab !== "Notifix") {
        setActiveTab("Notifix");
      }
    } else {
      if (activeTab !== "ReportiVix") {
        setActiveTab("ReportiVix");
      }
    }
  }, [location.pathname, activeTab]);

  useEffect(() => {
    if (activeTab === "ReportiVix") {
      dispatch(fetchDashboardList());
    }
  }, [dispatch, activeTab]);

  // Fetch data sources for ReportiVix
  const { infiniteQuery: dataSourceListAPI, lastElementRef } =
    useInfiniteScroll<DataSourceListPayload, DataSourceListData>(
      ["dataSourceList"],
      GET?.DATA_SOURCE_LIST + `?canEditInline=true`,
      10,
      "get",
      true
    );

  // Fetch data sources for Notifix
  const dataSourceNotivixListAPI = useGet<DataSourceListPayload>(
    ["dataSourceNotivixList"],
    GET?.DATA_SOURCE_LIST + `?isShowMenu=true`
  );

  // Process data sources
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
    if (dataSourceNotivixList.length > 0) dispatch(setDataSourceList(dataSourceNotivixList));
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
        setOpenGlobalSettings((prev) => !prev);
      } else {
        setOpenSettings((prev) => !prev);
      }
    } else {
      navigate(route);
    }
  };

  const handleCreateDashboard = async () => {
    if (newDashboardName.trim()) {
      // Validate that dataSourceId is selected for fixed dashboard type
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

    if (activeTab === "Notifix") {
      const dataSourceItems =
        matchedDataSources?.map((item) => {
          return {
            name: item?.name ?? " ",
            icon: createIcon(SourceIcon, `/notivix/data-source/${item?._id}`),
            route: `/notivix/data-source/${item?._id}`,
          };
        }) || [];
      return [
        {
          name: "Dashboard",
          icon: createIcon(AssessmentIcon, "/notivix/dashboard"),
          route: "/notivix/dashboard",
        },
        ...dataSourceItems,
        ...(dataSourceNotivixListAPI?.isLoading
          ? [
              {
                name: "Loading...",
                icon: (
                  <div ref={lastElementRef} style={{ paddingLeft: "1.5rem" }}>
                    Loading...
                  </div>
                ),
                route: "#",
              },
            ]
          : []),
        {
          name: "Notification",
          icon: (
            <SettingsIcon
              sx={{ fontSize: STYLE_GUIDE.TYPOGRAPHY.fontSize.base }}
            />
          ),
          route: "/notivix/notification",
          subItems: [
            {
              name: "Settings",
              icon: (
                <SettingsIcon
                  sx={{ fontSize: STYLE_GUIDE.TYPOGRAPHY.fontSize.base }}
                />
              ),
              route: "/notivix/notification-types",
            },
            {
              name: "Notification",
              icon: (
                <NotificationsIcon
                  sx={{ fontSize: STYLE_GUIDE.TYPOGRAPHY.fontSize.base }}
                />
              ),
              // route: "/notivix/notification-settings/notification",
            },
          ],
        },
      ];
    }
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
                  name: "Loading...",
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
        name: "Reports",
        icon: createIcon(AssessmentIcon, "/reports"),
        route: "/reports",
      },
      {
        name: "Data Sources",
        icon: createIcon(SourceIcon, "/data-source"),
        route: "/data-source",
        subItems: [
          ...(dataSourceList?.map((item) => ({
            name: item?.name ?? "",
            icon: <></>,
            route: `/data-source/${item?._id}`,
          })) || []),
          ...(dataSourceListAPI?.hasNextPage
            ? [
                {
                  name: "",
                  icon: (
                    <div ref={lastElementRef} style={{ paddingLeft: "1.5rem" }}>
                      Loading...
                    </div>
                  ),
                  route: "#",
                },
              ]
            : []),
        ],
      },
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
      {
        name: "VixAI Chart",
        icon: createIcon(Language, "/VixAi-Chart"),
        route: "/VixAi-Chart",
      },
      {
        name: "Report Settings",
        icon: createIcon(SettingsIcon, "/report-settings"),
        route: "/report-settings",
      },
      {
        name: "VixAI Insights",
        icon: createIcon(AutoAwesomeIcon, "/VixAi-Insights"),
        route: "/VixAi-Insights",
      },
      {
        name: "attribute-option",
        icon: createIcon(AutoAwesomeIcon, "/attribute-option"),
        route: "/attribute-option",
      },
      {
        name: "superadmin",
        icon: createIcon(AutoAwesomeIcon, "/superadmin/dashboard"),
        route: "/superadmin/dashboard",
      },
      {
        name: "entity",
        icon: createIcon(AutoAwesomeIcon, "/entity"),
        route: "/entity",
      },
    ];
  }, [
    activeTab,
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

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleMenuItemClick = (option: "ReportiVix" | "Notifix") => {
    setActiveTab(option);
    localStorage.setItem("activeTab", option);
    const baseRoute = option === "Notifix" ? "/notivix" : "";
    navigate(`${baseRoute}/dashboard`);
    handleMenuClose();
  };

  return (
    <Box sx={{ display: "flex", height: "100%" }}>
      <Drawer variant="permanent" open={openNav} sx={{ p: 0 }}>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            height: "100%",
            marginRight: STYLE_GUIDE.SPACING.s10,
            width: "300px",
          }}
        >
          <Box
            sx={{
              px: STYLE_GUIDE.SPACING.s4,
              mb: STYLE_GUIDE.SPACING.s4,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "50px",
              marginRight: "108px",
              borderBottom: `1px solid ${theme.palette.divider}`,
            }}
          >
            {openNav && (
              <div>
                <IconButton
                  aria-label="more"
                  id="long-button"
                  aria-controls={open ? "long-menu" : undefined}
                  aria-expanded={open ? "true" : undefined}
                  aria-haspopup="true"
                  onClick={handleMenuClick}
                >
                 
                  <Tooltip title="Tab Switch" placement="top">
                    <Box
                      display="flex"
                      alignItems="center"
                      sx={{
                        color: STYLE_GUIDE.COLORS.black,
                        padding: "4px 8px",
                        borderRadius: "6px",
                        cursor: "pointer",
                      }}
                    >
                      <GridViewIcon
                        sx={{
                          fontSize: STYLE_GUIDE.TYPOGRAPHY.fontSize.base,
                        }}
                      />
                      <ArrowDropDownIcon
                        sx={{
                          fontSize: STYLE_GUIDE.TYPOGRAPHY.fontSize.base,
                          marginLeft: "2px",
                        }}
                      />
                    </Box>
                  </Tooltip>
                </IconButton>
                <Menu
                  id="long-menu"
                  anchorEl={anchorEl}
                  open={open}
                  onClose={handleMenuClose}
                >
                  <MenuItem
                    onClick={() => handleMenuItemClick("Notifix")}
                    sx={{
                      height: STYLE_GUIDE.SPACING.s12,
                      display: "flex",
                      alignItems: "center",
                      padding: `0 ${STYLE_GUIDE.SPACING.s3}`,
                      color:
                        activeTab === "Notifix"
                          ? STYLE_GUIDE.COLORS.primaryDark
                          : STYLE_GUIDE.COLORS.black,
                      "& .MuiListItemIcon-root": {
                        color:
                          activeTab === "Notifix"
                            ? STYLE_GUIDE.COLORS.white
                            : STYLE_GUIDE.COLORS.black,
                      },
                    }}
                  >
                    <img
                      src={notivixIcon}
                      alt="Notifix Favicon"
                      style={{
                        width: STYLE_GUIDE.SPACING.s5,
                        height: STYLE_GUIDE.SPACING.s5,
                        marginRight: STYLE_GUIDE.SPACING.s3,
                      }}
                    />
                    Notifix
                  </MenuItem>
                  <MenuItem
                    onClick={() => handleMenuItemClick("ReportiVix")}
                    sx={{
                      height: STYLE_GUIDE.SPACING.s12,
                      display: "flex",
                      alignItems: "center",
                      padding: `0 ${STYLE_GUIDE.SPACING.s3}`,
                      color:
                        activeTab === "ReportiVix"
                          ? STYLE_GUIDE.COLORS.primaryDark
                          : STYLE_GUIDE.COLORS.black,
                      "& .MuiListItemIcon-root": {
                        color:
                          activeTab === "ReportiVix"
                            ? STYLE_GUIDE.COLORS.white
                            : STYLE_GUIDE.COLORS.black,
                      },
                    }}
                  >
                    <img
                      src={reportivixIcon}
                      alt="ReportiVix Favicon"
                      style={{
                        width: STYLE_GUIDE.SPACING.s4,
                        height: STYLE_GUIDE.SPACING.s4,
                        marginRight: STYLE_GUIDE.SPACING.s2,
                      }}
                    />
                    ReportiVix
                  </MenuItem>
                </Menu>
              </div>
            )}
            <Box
              component="img"
              src={activeTab === "Notifix" ? NotivixLogo : logo}
              alt="Logo"
              sx={{
                width: openNav ? 120 : 40,
                height: "auto",
                transition: "width 0.2s ease-in-out",
              }}
            />
          </Box>

          <List sx={{ flex: 1, py: 0 }}>
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
                    onClick={() =>
                      handleItemClick(item.route, !!item.subItems, item.name)
                    }
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
                      (item.name !== "Dashboards" &&
                        item.name !== "Notification" &&
                        openSettings) ? (
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
                          : openSettings
                    }
                    timeout="auto"
                    unmountOnExit
                  >
                    <List component="div" disablePadding>
                      {item.name === "Dashboards" && (
                        <ListItem
                          disablePadding
                          sx={{ display: "block", mb: 0.5 }}
                        >
                          <ListItemButton
                            onClick={() => setOpenCreateModal(true)}
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
                    </List>
                  </Collapse>
                )}
              </React.Fragment>
            ))}
          </List>

          <Box sx={{ mt: "auto", px: STYLE_GUIDE.SPACING.s4 }}>
            {activeTab === "Notifix" && (
              <>
                <ListItem
                  disablePadding
                  sx={{
                    display: "block",
                    mb: 0.5,
                  }}
                >
                  <ListItemButton
                    onClick={() => handleItemClick("", true, "Settings")}
                    sx={{
                      minHeight: 42,
                      px: STYLE_GUIDE.SPACING.s4,
                      borderRadius: "8px",
                      justifyContent: openNav ? "initial" : "center",
                      backgroundColor:
                        isRouteActive("/notivix/settings") ||
                        isRouteActive("/settings")
                          ? "#f1f5f9"
                          : "transparent",
                      color:
                        isRouteActive("/notivix/settings") ||
                        isRouteActive("/settings")
                          ? `${STYLE_GUIDE.COLORS.primaryDark}`
                          : "inherit",
                      "& .MuiListItemIcon-root": {
                        color:
                          isRouteActive("/notivix/settings") ||
                          isRouteActive("/settings")
                            ? `${STYLE_GUIDE.COLORS.primaryDark}`
                            : "inherit",
                      },
                      "&:hover": {
                        backgroundColor: "#f1f5f9",
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
                      <SettingsIcon
                        sx={{ fontSize: STYLE_GUIDE.TYPOGRAPHY.fontSize.base }}
                      />
                    </ListItemIcon>
                    <ListItemText
                      primary="Settings"
                      sx={{
                        opacity: openNav ? 1 : 0,
                        m: 0,
                        "& .MuiListItemText-primary": {
                          fontSize: "0.95rem",
                          fontWeight: 500,
                          color:
                            isRouteActive("/notivix/settings") ||
                            isRouteActive("/settings")
                              ? `${STYLE_GUIDE.COLORS.primaryDark}`
                              : "inherit",
                        },
                      }}
                    />
                    {openNav &&
                      (openGlobalSettings ? (
                        <ExpandLessIcon
                          sx={{
                            fontSize: STYLE_GUIDE.TYPOGRAPHY.fontSize.base,
                            color:
                              isRouteActive("/notivix/settings") ||
                              isRouteActive("/settings")
                                ? `${STYLE_GUIDE.COLORS.primaryDark}`
                                : "inherit",
                          }}
                        />
                      ) : (
                        <ExpandMoreIcon
                          sx={{
                            fontSize: STYLE_GUIDE.TYPOGRAPHY.fontSize.base,
                            color:
                              isRouteActive("/notivix/settings") ||
                              isRouteActive("/settings")
                                ? `${STYLE_GUIDE.COLORS.primaryDark}`
                                : "inherit",
                          }}
                        />
                      ))}
                  </ListItemButton>
                </ListItem>
                {openNav && (
                  <Collapse
                    in={openGlobalSettings}
                    timeout="auto"
                    unmountOnExit
                  >
                    <List component="div" disablePadding>
                      {[
                        {
                          name: "Roles",
                          icon: (
                            <AssignmentIndIcon
                              sx={{
                                fontSize: STYLE_GUIDE.TYPOGRAPHY.fontSize.base,
                              }}
                            />
                          ),
                          route:
                            activeTab === "Notifix"
                              ? "/notivix/settings/roles"
                              : "/settings/roles",
                        },
                        {
                          name: "Permissions",
                          icon: (
                            <BusinessIcon
                              sx={{
                                fontSize: STYLE_GUIDE.TYPOGRAPHY.fontSize.base,
                              }}
                            />
                          ),
                          route: "/notivix/permissions",
                        },
                        {
                          name: "Organization Setting",
                          icon: (
                            <BusinessIcon
                              sx={{
                                fontSize: STYLE_GUIDE.TYPOGRAPHY.fontSize.base,
                              }}
                            />
                          ),
                          route:
                            activeTab === "Notifix"
                              ? "/notivix/settings/organization"
                              : "/settings/organization",
                        },
                      ].map((subItem) => (
                        <ListItem
                          key={subItem.name}
                          disablePadding
                          sx={{ display: "block", mb: 0.5 }}
                        >
                          <ListItemButton
                            onClick={() => navigate(subItem.route)}
                            sx={{
                              minHeight: 36,
                              px: STYLE_GUIDE.SPACING.s4,
                              pl: STYLE_GUIDE.SPACING.s4,
                              borderRadius: "8px",
                              mx: STYLE_GUIDE.SPACING.s3,
                              backgroundColor: isRouteActive(subItem.route)
                                ? "#f1f5f9"
                                : "transparent",
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
                              {subItem.icon}
                            </ListItemIcon>
                            <ListItemText
                              primary={subItem.name}
                              sx={{
                                m: 0,
                                "& .MuiListItemText-primary": {
                                  fontSize: "0.8rem",
                                  color: isRouteActive(subItem.route)
                                    ? `${STYLE_GUIDE.COLORS.primaryDark}`
                                    : "inherit",
                                },
                              }}
                            />
                          </ListItemButton>
                        </ListItem>
                      ))}
                    </List>
                  </Collapse>
                )}
              </>
            )}

            <ListItemButton
              onClick={handleLogout}
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
        activeTab={activeTab}
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
