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
import React, { useEffect, useMemo } from "react";
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
import { fetchDashboardList, createDashboard, deleteDashboard } from "../../../pages/dashboard/dashboardActions";
import { Dashboard as DashboardType } from "../../../pages/dashboard/types";
import { toast } from "react-toastify";
import { DeleteConfirmationModal } from "./components/DeleteConfirmationModal";
import { DashboardCreationForm } from "./components/DashboardCreationForm";
import { SubItemsList } from "./components/SubItemsList";

interface ErrorResponse {
  success: boolean;
  message: string;
  error: Record<string, unknown>;
}

const drawerWidth = 280;

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
  width: `calc(${theme.spacing(9)} + 1px)`,
  [theme.breakpoints.up("sm")]: {
    width: `calc(${theme.spacing(13)} + 1px)`,
  },
});

const Drawer = styled(MuiDrawer, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme }) => ({
  width: drawerWidth,
  flexShrink: 0,
  whiteSpace: "nowrap",
  boxSizing: "border-box",
  position: "static",
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
  const [dashboardToDelete, setDashboardToDelete] = React.useState<DashboardType | null>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const { dashboards, loading } = useAppSelector((state) => state.dashboard);

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
        const response = await dispatch(createDashboard(newDashboardName.trim())).unwrap();
        await dispatch(fetchDashboardList());
        setIsCreating(false);
        setNewDashboardName("");
        toast.success(response.message || "Dashboard created successfully!");
        
        // Find the newly created dashboard and navigate to it
        const newDashboard = response.data; // Get first dashboard from array
        if (newDashboard) {
          navigate(`/dashboard/${newDashboard._id}`, { 
            state: { enableEditMode: true }
          });
        }
      } catch (error) {
        console.error("Failed to create dashboard:", error);
        const errorResponse = error as ErrorResponse;
        toast.error(errorResponse.message || "Failed to create dashboard. Please try again.");
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
        toast.error(errorResponse.message || "Failed to delete dashboard. Please try again.");
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModalOpen(false);
    setDashboardToDelete(null);
  };

  const navItems: NavItem[] = useMemo(
    () => [
      {
        name: "Dashboards",
        icon: <DashboardIcon sx={{ fontSize: "3rem", color: "black" }} />,
        route: "/dashboard",
        subItems: [
          {
            name: "Create New Dashboard",
            icon: <AddIcon sx={{ fontSize: "1.5rem", color: "black" }} />,
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
                  isMoreLink: true
                }
              ]),
        ],
      },
      {
        name: "Reports",
        icon: <AssessmentIcon sx={{ fontSize: "3rem", color: "black" }} />,
        route: "/reports",
      },
      {
        name: "Data Sources",
        icon: <SourceIcon sx={{ fontSize: "3rem", color: "black" }} />,
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
    [
      dataSourceList,
      dataSourceListAPI?.hasNextPage,
      lastElementRef,
      dashboards,
      loading,
    ]
  );

  const isDashboardActive = () => {
    return location.pathname.startsWith("/dashboard");
  };

  return (
    <Box sx={{ display: "flex" }}>
      <Drawer
        variant="permanent"
        open={openNav}
        sx={{ height: "calc(100vh - 70px)" }}
      >
        <List>
          {navItems.map((item, i) => (
            <React.Fragment key={i}>
              <ListItem disablePadding sx={{ display: "block" }}>
                <ListItemButton
                  onClick={() => handleItemClick(item.route, !!item.subItems, item.name)}
                  sx={{
                    height: 90,
                    px: 2.5,
                    justifyContent: openNav ? "initial" : "center",
                    backgroundColor: isDashboardActive() ? "#f0f0f0" : "transparent",
                    "&:hover": { backgroundColor: "#e0e0e0" },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 0,
                      justifyContent: "center",
                      mr: openNav ? 3 : "auto",
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.name}
                    sx={{
                      opacity: openNav ? 1 : 0,
                    }}
                  />
                  {item.subItems &&
                    ((item.name === "Dashboards" && openDashboard) ||
                    (item.name !== "Dashboards" && openSettings) ? (
                      <ExpandLessIcon />
                    ) : (
                      <ExpandMoreIcon />
                    ))}
                </ListItemButton>
              </ListItem>

              {item.subItems && (
                <Collapse
                  in={item.name === "Dashboards" ? openDashboard : openSettings}
                  timeout="auto"
                  unmountOnExit
                  sx={{ mt: 0 }}
                >
                  {item.name === "Dashboards" && (
                    <ListItem disablePadding sx={{ display: "block", mt: 0 }}>
                      <ListItemButton
                        onClick={() => setIsCreating(true)}
                        sx={{
                          pl: 4,
                          justifyContent: openNav ? "initial" : "center",
                          "&:hover": { backgroundColor: "#e0e0e0" },
                        }}
                      >
                        <ListItemIcon
                          sx={{
                            minWidth: 0,
                            justifyContent: "center",
                            mr: openNav ? 3 : "auto",
                          }}
                        >
                          <AddIcon sx={{ fontSize: "1.5rem", color: "black" }} />
                        </ListItemIcon>
                        <ListItemText
                          primary="Create New Dashboard"
                          sx={{
                            opacity: openNav ? 1 : 0,
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
                    subItems={item.subItems.filter(subItem => !subItem.isCreateButton)}
                    openNav={openNav}
                    parentName={item.name}
                    dashboards={dashboards}
                    onDeleteClick={handleDeleteClick}
                    onCreateClick={() => setIsCreating(true)}
                  />
                </Collapse>
              )}
            </React.Fragment>
          ))}
        </List>
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
