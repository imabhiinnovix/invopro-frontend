import { styled, Theme, CSSObject } from '@mui/material/styles';
import Box from '@mui/material/Box';
import MuiDrawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import { useNav } from '../../../context/NavContext';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AddIcon from '@mui/icons-material/Add';
import React, { useEffect, useMemo, useContext, useState } from 'react';
import { Collapse } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { useNavigate, useLocation } from 'react-router-dom';
import SourceIcon from '@mui/icons-material/Source';
import AssessmentIcon from '@mui/icons-material/Assessment';
import PaletteIcon from '@mui/icons-material/Palette';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import { useInfiniteScroll } from '../../../hooks/useInfiniteScroll';
import { GET } from '../../../services/apiRoutes';
import { DataSourceListData, DataSourceListPayload } from './types';
import { setDataSourceList } from '../../../pages/dataSources/dataSourceActions';
import { useAppDispatch, useAppSelector } from '../../../storeHooks';
import { fetchDashboardList, createDashboard, deleteDashboard } from '../../../pages/dashboard/dashboardActions';
import { Dashboard as DashboardType, DashboardListResponse } from '../../../pages/dashboard/types';
import { toast } from 'react-toastify';
import { DeleteConfirmationModal } from './components/DeleteConfirmationModal';
import { SubItemsList } from './components/SubItemsList';
import { CreateDashboardModal } from './components/CreateDashboardModal';
import LogoutIcon from '@mui/icons-material/Logout';
import logo from '../../../assets/ReportiVix-logo.png';
import { AuthContext } from '../../../context/AuthContext';
import { clearLocalStorage } from '../../../utils/handleLocalStorage';
import { Language } from '@mui/icons-material';
import { STYLE_GUIDE } from '../../../styles';


interface ErrorResponse {
  success: boolean;
  message: string;
  error: Record<string, unknown>;
}

const drawerWidth = 225;

const openedMixin = (theme: Theme): CSSObject => ({
  width: drawerWidth,
  position: 'static',
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: 'hidden',
});

const closedMixin = (theme: Theme): CSSObject => ({
  position: 'static',
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: 'hidden',
  width: `calc(${theme.spacing(6)} + 1px)`,
  [theme.breakpoints.up('sm')]: {
    width: `calc(${theme.spacing(8)} + 1px)`,
  },
});

const Drawer = styled(MuiDrawer, {
  shouldForwardProp: (prop) => prop !== 'open',
})(({ theme }) => ({
  width: drawerWidth,
  flexShrink: 0,
  whiteSpace: 'nowrap',
  boxSizing: 'border-box',
  height: '100vh',
  position: 'static',
  backgroundColor: STYLE_GUIDE.COLORS.white,
  '& .MuiPaper-root': {
    backgroundColor: STYLE_GUIDE.COLORS.white,
    border: 'none',
    height: '100%',
    position: 'static',
    overflow: 'hidden',
  },
  '& .MuiDrawer-paper': {
    position: 'static',
    overflow: 'hidden',
  },
  '& .MuiList-root': {
    height: '100%',
    overflow: 'hidden',
  },
  '& .MuiListItemButton-root': {
    '&.Mui-selected, &.Mui-selected:hover': {
      backgroundColor: STYLE_GUIDE.COLORS.backgroundDefault,
    },
    '&:hover': {
      backgroundColor: STYLE_GUIDE.COLORS.backgroundDefault,
    },
  },
  variants: [
    {
      props: ({ open }) => open,
      style: {
        ...openedMixin(theme),
        '& .MuiDrawer-paper': openedMixin(theme),
      },
    },
    {
      props: ({ open }) => !open,
      style: {
        ...closedMixin(theme),
        '& .MuiDrawer-paper': closedMixin(theme),
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
  const [newDashboardName, setNewDashboardName] = React.useState('');
  const [dashboardType, setDashboardType] = React.useState<'normal' | 'trend'>('normal');
  const [timePeriod, setTimePeriod] = React.useState<string>('1m');
  const [isCreatingLoading, setIsCreatingLoading] = React.useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = React.useState(false);
  const [dashboardToDelete, setDashboardToDelete] = React.useState<DashboardType | null>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const { dashboards, loading } = useAppSelector((state) => state.dashboard);
  const { clearAuthContext } = useContext(AuthContext);
  const [openCreateModal, setOpenCreateModal] = useState(false);

  useEffect(() => {
    dispatch(fetchDashboardList());
  }, [dispatch]);

  const handleItemClick = (route: string, hasSubItems: boolean, itemName: string) => {
    if (hasSubItems) {
      if (itemName === 'Dashboards') {
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
        const response = (await dispatch(
          createDashboard({
            name: newDashboardName.trim(),
            dashboardType,
            dynamicVersionValue: timePeriod,
          })
        ).unwrap()) as DashboardListResponse;
        await dispatch(fetchDashboardList());
        setOpenCreateModal(false);
        setNewDashboardName('');
        setDashboardType('normal');
        setTimePeriod('1m');
        toast.success(response.message || 'Dashboard created successfully!');

        // Navigate to the newly created dashboard
        const newDashboard = response?.data;

        if (newDashboard) {
          navigate(`/dashboard/${newDashboard._id}`, {
            state: { enableEditMode: true },
          });
        }
      } catch (error: { payload?: { message: string }; message?: string } | unknown) {
        console.error('Failed to create dashboard:', error);
        const errorMessage =
          error && typeof error === 'object' && 'payload' in error
            ? (error.payload as { message?: string })?.message
            : error && typeof error === 'object' && 'message' in error
              ? (error as { message?: string })?.message
              : 'Failed to create dashboard. Please try again.';
        toast.error(errorMessage);
      } finally {
        setIsCreatingLoading(false);
      }
    }
  };

  const handleCloseCreateModal = () => {
    setOpenCreateModal(false);
    setNewDashboardName('');
    setDashboardType('normal');
    setTimePeriod('1m');
  };

  const { infiniteQuery: dataSourceListAPI, lastElementRef } = useInfiniteScroll<
    DataSourceListPayload,
    DataSourceListData
  >(['dataSourceList'], GET?.DATA_SOURCE_LIST + `?canEditInline=true`, 10, 'get', true);

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
        toast.success('Dashboard deleted successfully!');
        if (location.pathname === `/dashboard/${dashboardToDelete._id}`) {
          navigate('/dashboard');
        }
        setDeleteModalOpen(false);
        setDashboardToDelete(null);
      } catch (error) {
        console.error('Failed to delete dashboard:', error);
        const errorResponse = error as ErrorResponse;
        toast.error(errorResponse.message || 'Failed to delete dashboard. Please try again.');
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
    navigate('/login');
  };

  const navItems: NavItem[] = useMemo(
    () => [
      {
        name: 'Dashboards',
        icon: <DashboardIcon sx={{ fontSize: STYLE_GUIDE.TYPOGRAPHY.fontSize.base }} />,
        route: '/dashboard',
        subItems: [
          {
            name: 'Create New Dashboard',
            icon: <AddIcon sx={{ fontSize: STYLE_GUIDE.TYPOGRAPHY.fontSize.base }} />,
            route: '#',
            isCreateButton: true,
          },
          ...(loading
            ? [
              {
                name: 'Loading...',
                icon: <></>,
                route: '#',
              },
            ]
            : [
              ...dashboards.slice(0, 5).map((dashboard: DashboardType) => ({
                name: dashboard.name,
                icon: <></>,
                route: `/dashboard/${dashboard._id}`,
              })),
              {
                name: 'All Dashboards',
                icon: <></>,
                route: '/dashboard',
                isMoreLink: true,
              },
            ]),
        ],
      },
      {
        name: 'Reports',
        icon: <AssessmentIcon sx={{ fontSize: STYLE_GUIDE.TYPOGRAPHY.fontSize.base }} />,
        route: '/reports',
      },
      {
        name: 'Data Sources',
        icon: <SourceIcon sx={{ fontSize: STYLE_GUIDE.TYPOGRAPHY.fontSize.base }} />,
        route: '/data-source',
        subItems: [
          ...(dataSourceList?.map((item) => ({
            name: item?.name ?? '',
            icon: <></>,
            route: `/data-source/${item?._id}`,
          })) || []),

          ...(dataSourceListAPI?.hasNextPage
            ? [
              {
                name: '',
                icon: (
                  <div ref={lastElementRef} style={{ paddingLeft: '1.5rem' }}>
                    Loading...
                  </div>
                ),
                route: '#',
              },
            ]
            : []),
        ],
      },
      {
        name: 'Create Theme',
        icon: <PaletteIcon sx={{ fontSize: STYLE_GUIDE.TYPOGRAPHY.fontSize.base }} />,
        route: '/create-theme',
      },
      {
        name: 'VixAiChart',
        icon: <Language sx={{ fontSize: STYLE_GUIDE.TYPOGRAPHY.fontSize.base }} />,
        route: '/natural-language',
      },
      {
        name: 'VixAiInsight',
        icon: <AutoAwesomeIcon sx={{ fontSize: '1.1rem' }} />,
        route: '/ai-insight',
      },
    ],
    [dataSourceList, dataSourceListAPI?.hasNextPage, dashboards, loading]
  );

  const isRouteActive = (route: string) => {
    return location.pathname.startsWith(route);
  };

  return (
    <Box sx={{ display: 'flex', height: '100%' }}>
      <Drawer variant="permanent" open={openNav} sx={{ p: 0 }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
          }}
        >
          <Box
            sx={{
              px: STYLE_GUIDE.SPACING.s4,
              mb: STYLE_GUIDE.SPACING.s4,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: '50px',
              borderBottom: `1px solid ${STYLE_GUIDE.COLORS.divider}`,
            }}
          >
            <Box
              component="img"
              src={logo}
              alt="Logo"
              sx={{
                width: openNav ? 120 : 40,
                height: 'auto',
                transition: 'width 0.2s ease-in-out',
              }}
            />
          </Box>

          <List sx={{ flex: 1, py: 0 }}>
            {navItems.map((item, i) => (
              <React.Fragment key={i}>
                <ListItem
                  disablePadding
                  sx={{
                    display: 'block',
                    mb: 0.5,
                  }}
                >
                  <ListItemButton
                    onClick={() => handleItemClick(item.route, !!item.subItems, item.name)}
                    sx={{
                      minHeight: 42,
                      mx: 1.5,
                      px: 2,
                      borderRadius: '8px',
                      justifyContent: openNav ? 'initial' : 'center',
                      backgroundColor: isRouteActive(item.route) ? '#f1f5f9' : 'transparent',
                      color: isRouteActive(item.route) ? '#a136a1' : 'inherit',
                      '& .MuiListItemIcon-root': {
                        color: isRouteActive(item.route) ? '#a136a1' : 'inherit',
                      },
                      '&:hover': {
                        backgroundColor: '#f1f5f9',
                        borderRadius: '8px',
                      },
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        minWidth: 0,
                        mr: openNav ? 2 : 'auto',
                        justifyContent: 'center',
                      }}
                    >
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText
                      primary={item.name}
                      sx={{
                        opacity: openNav ? 1 : 0,
                        m: 0,
                        '& .MuiListItemText-primary': {
                          fontSize: '0.95rem',
                          fontWeight: 500,
                          color: isRouteActive(item.route) ? '#a136a1' : 'inherit',
                        },
                      }}
                    />
                    {item.subItems &&
                      openNav &&
                      ((item.name === 'Dashboards' && openDashboard) || (item.name !== 'Dashboards' && openSettings) ? (
                        <ExpandLessIcon
                          sx={{
                            fontSize: STYLE_GUIDE.TYPOGRAPHY.fontSize.base,
                            color: isRouteActive(item.route) ? '#a136a1' : 'inherit',
                          }}
                        />
                      ) : (
                        <ExpandMoreIcon
                          sx={{
                            fontSize: STYLE_GUIDE.TYPOGRAPHY.fontSize.base,
                            color: isRouteActive(item.route) ? '#a136a1' : 'inherit',
                          }}
                        />
                      ))}
                  </ListItemButton>
                </ListItem>

                {item.subItems && openNav && (
                  <Collapse in={item.name === 'Dashboards' ? openDashboard : openSettings} timeout="auto" unmountOnExit>
                    <List component="div" disablePadding>
                      {item.name === 'Dashboards' && (
                        <ListItem disablePadding sx={{ display: 'block', mb: 0.5 }}>
                          <ListItemButton
                            onClick={() => setOpenCreateModal(true)}
                            sx={{
                              minHeight: 36,
                              px: STYLE_GUIDE.SPACING.s4,
                              pl: STYLE_GUIDE.SPACING.s4,
                              borderRadius: '8px',
                              mx: STYLE_GUIDE.SPACING.s3,
                              '&:hover': {
                                backgroundColor: STYLE_GUIDE.COLORS.backgroundDefault,
                              },
                            }}
                          >
                            <ListItemIcon
                              sx={{
                                minWidth: 0,
                                mr: 1,
                                justifyContent: 'center',
                              }}
                            >
                              <AddIcon sx={{ fontSize: STYLE_GUIDE.TYPOGRAPHY.fontSize.base }} />
                            </ListItemIcon>
                            <ListItemText
                              primary="Create New Dashboard"
                              sx={{
                                m: 0,
                                '& .MuiListItemText-primary': {
                                  fontSize: '0.8rem',
                                },
                              }}
                            />
                          </ListItemButton>
                        </ListItem>
                      )}

                      <SubItemsList
                        subItems={item.subItems.filter((subItem) => !subItem.isCreateButton)}
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

          <Box sx={{ mt: 'auto', px: STYLE_GUIDE.SPACING.s4, }}>
            <ListItemButton
              onClick={handleLogout}
              sx={{
                minHeight: 42,
                px: STYLE_GUIDE.SPACING.s4,
                borderRadius: '8px',
                justifyContent: openNav ? 'initial' : 'center',
                '&:hover': {
                  backgroundColor: STYLE_GUIDE.COLORS.backgroundDefault,
                },
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 0,
                  mr: openNav ? STYLE_GUIDE.SPACING.s4 : 'auto',
                  justifyContent: 'center',
                }}
              >
                <LogoutIcon sx={{ fontSize: STYLE_GUIDE.TYPOGRAPHY.fontSize.base }} />
              </ListItemIcon>
              <ListItemText
                primary="Logout"
                sx={{
                  opacity: openNav ? 1 : 0,
                  m: 0,
                  '& .MuiListItemText-primary': {
                    fontSize: STYLE_GUIDE.TYPOGRAPHY.fontSize.base,
                  },
                }}
              />
            </ListItemButton>
          </Box>
        </Box>
      </Drawer>

      {/* Create Dashboard Modal */}
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
