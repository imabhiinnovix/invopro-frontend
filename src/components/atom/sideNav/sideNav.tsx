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
import React, { useEffect, useMemo, useContext } from "react";
import { Collapse } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import { useNavigate, useLocation } from "react-router-dom";
import SourceIcon from "@mui/icons-material/Source";
import AssessmentIcon from "@mui/icons-material/Assessment";
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
import { Dashboard as DashboardType, DashboardListResponse } from "../../../pages/dashboard/types";
import { toast } from "react-toastify";
import { DeleteConfirmationModal } from "./components/DeleteConfirmationModal";
import { DashboardCreationForm } from "./components/DashboardCreationForm";
import { SubItemsList } from "./components/SubItemsList";
import LogoutIcon from "@mui/icons-material/Logout";
import logo from "../../../assets/ReportiVix-logo.png";
import { AuthContext } from "../../../context/AuthContext";
import { clearLocalStorage } from "../../../utils/handleLocalStorage";

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
  backgroundColor: "#ffffff",
  "& .MuiPaper-root": {
    backgroundColor: "#ffffff",
    border: "none",
    height: "100%",
    position: "static",
    overflow: "hidden"
  },
  "& .MuiDrawer-paper": {
    position: "static",
    overflow: "hidden"
  },
  "& .MuiList-root": {
    height: "100%",
    overflow: "hidden"
  },
  "& .MuiListItemButton-root": {
    "&.Mui-selected, &.Mui-selected:hover": {
      backgroundColor: "#f1f5f9",
    },
    "&:hover": {
      backgroundColor: "#f1f5f9",
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
  const { openNav } = useNav();
  const [openSettings, setOpenSettings] = React.useState(false);
  const [openDashboard, setOpenDashboard] = React.useState(false);
  const [isCreating, setIsCreating] = React.useState(false);
  const [newDashboardName, setNewDashboardName] = React.useState("");
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

  useEffect(() => {
    dispatch(fetchDashboardList());
  }, [dispatch]);

  const handleItemClick = (
    route: string,
    hasSubItems: boolean,
    itemName: string
  ) => {
    if (hasSubItems) {
      if (itemName === "Dashboards") {
        setOpenDashboard((prev) => !prev);
        if (!openDashboard) {
          setOpenDashboard(true);
        }
        navigate(route);
      } else {
        setOpenSettings((prev) => !prev);
      }
    } else {
      navigate(route);
    }
  };

  const handleCreateDashboard = async () => {
    if (newDashboardName.trim()) {
      try {
        setIsCreatingLoading(true);
        const response = await dispatch(
          createDashboard(newDashboardName.trim())
        ).unwrap() as DashboardListResponse;
        await dispatch(fetchDashboardList());
        setIsCreating(false);
        setNewDashboardName("");
        toast.success(response.message || "Dashboard created successfully!");

        // Navigate to the newly created dashboard
        const newDashboard = response.data  ; // Get the first dashboard from the array
      
        if (newDashboard) {
          navigate(`/dashboard/${newDashboard._id}`, {
            state: { enableEditMode: true },
          });
        }
      } catch (error: { payload?: { message: string }; message?: string }) {
        console.error("Failed to create dashboard:", error);
        const errorMessage = error?.payload?.message || error?.message || "Failed to create dashboard. Please try again.";
        toast.error(errorMessage);
      } finally {
        setIsCreatingLoading(false);
      }
    }
  };

  const handleCancelCreate = () => {
    setIsCreating(false);
    setNewDashboardName("");
  };

  const { infiniteQuery: dataSourceListAPI, lastElementRef } =
    useInfiniteScroll<DataSourceListPayload, DataSourceListData>(
      ["dataSourceList"],
      GET?.DATA_SOURCE_LIST + `?canEditInline=true`,
      10,
      "get",
      true
    );

  const dataSourceList = useMemo(() => {
    return dataSourceListAPI?.data?.pages?.flatMap((page) => page?.data) || [];
  }, [dataSourceListAPI?.data?.pages]);

  useEffect(() => {
    if (dataSourceList.length > 0) dispatch(setDataSourceList(dataSourceList));
  }, [dataSourceList, dispatch]);

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
        setDeleteModalOpen(false);
        setDashboardToDelete(null);
      } catch (error) {
        console.error("Failed to delete dashboard:", error);
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

  const navItems: NavItem[] = useMemo(
    () => [
      {
        name: "Dashboards",
        icon: <DashboardIcon sx={{ fontSize: "1.1rem" }} />,
        route: "/dashboard",
        subItems: [
          {
            name: "Create New Dashboard",
            icon: <AddIcon sx={{ fontSize: "0.9rem" }} />,
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
        icon: <AssessmentIcon sx={{ fontSize: "1.1rem" }} />,
        route: "/reports",
      },
      {
        name: "Data Sources",
        icon: <SourceIcon sx={{ fontSize: "1.1rem" }} />,
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
    ],
    [dataSourceList, dataSourceListAPI?.hasNextPage, dashboards, loading]
  );

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
            // py: 2
          }}
        >
          <Box
            sx={{
              px: 2,
              mb: 2,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "50px",
              borderBottom: "1px solid #e0e0e0",
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
                      borderRadius: '8px',
                      justifyContent: openNav ? "initial" : "center",
                      backgroundColor: isRouteActive(item.route)
                        ? "#f1f5f9"
                        : "transparent",
                      color: isRouteActive(item.route) ? "#a136a1" : "inherit",
                      "& .MuiListItemIcon-root": {
                        color: isRouteActive(item.route) ? "#a136a1" : "inherit",
                      },
                      "&:hover": { 
                        backgroundColor: "#f1f5f9",
                        borderRadius: '8px',
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
                          fontSize: "0.95rem",
                          fontWeight: 500,
                          color: isRouteActive(item.route) ? "#a136a1" : "inherit",
                        },
                      }}
                    />
                    {item.subItems && openNav && (
                      item.name === "Dashboards" && openDashboard ||
                      item.name !== "Dashboards" && openSettings ? (
                        <ExpandLessIcon sx={{ 
                          fontSize: "1.1rem",
                          color: isRouteActive(item.route) ? "#a136a1" : "inherit"
                        }} />
                      ) : (
                        <ExpandMoreIcon sx={{ 
                          fontSize: "1.1rem",
                          color: isRouteActive(item.route) ? "#a136a1" : "inherit"
                        }} />
                      )
                    )}
                  </ListItemButton>
                </ListItem>

                {item.subItems && openNav && (
                  <Collapse
                    in={item.name === "Dashboards" ? openDashboard : openSettings}
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
                            onClick={() => setIsCreating(true)}
                            sx={{
                              minHeight: 36,
                              px: 2,
                              pl: 2,
                              borderRadius: '8px',
                              mx: 1.5,
                              "&:hover": {
                                backgroundColor: "#f1f5f9",
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
                              <AddIcon sx={{ fontSize: "0.9rem" }} />
                            </ListItemIcon>
                            <ListItemText
                              primary="Create New Dashboard"
                              sx={{
                                m: 0,
                                "& .MuiListItemText-primary": {
                                  fontSize: "0.8rem",
                                },
                              }}
                            />
                          </ListItemButton>
                        </ListItem>
                      )}
                      
                      {isCreating && item.name === "Dashboards" && (
                        <DashboardCreationForm
                          newDashboardName={newDashboardName}
                          onNameChange={(e) => setNewDashboardName(e.target.value)}
                          onCreate={handleCreateDashboard}
                          onCancel={handleCancelCreate}
                          isCreatingLoading={isCreatingLoading}
                        />
                      )}

                      <SubItemsList
                        subItems={item.subItems.filter(
                          (subItem) => !subItem.isCreateButton
                        )}
                        openNav={openNav}
                        parentName={item.name}
                        dashboards={dashboards}
                        onDeleteClick={handleDeleteClick}
                        onCreateClick={() => setIsCreating(true)}
                      />
                    </List>
                  </Collapse>
                )}
              </React.Fragment>
            ))}
          </List>

          <Box sx={{ mt: 'auto', px: 1.5 }}>
            <ListItemButton
              onClick={handleLogout}
              sx={{
                minHeight: 42,
                px: 2,
                borderRadius: '8px',
                justifyContent: openNav ? "initial" : "center",
                "&:hover": { 
                  backgroundColor: "#f1f5f9",
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
                <LogoutIcon sx={{ fontSize: "1.1rem" }} />
              </ListItemIcon>
              <ListItemText
                primary="Logout"
                sx={{
                  opacity: openNav ? 1 : 0,
                  m: 0,
                  "& .MuiListItemText-primary": {
                    fontSize: "0.95rem",
                  },
                }}
              />
            </ListItemButton>
          </Box>
        </Box>
      </Drawer>

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
