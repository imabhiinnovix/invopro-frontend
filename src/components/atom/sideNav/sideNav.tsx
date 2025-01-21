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
import SettingsIcon from '@mui/icons-material/Settings';
import React from 'react';
import { Collapse } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import StyleIcon from '@mui/icons-material/Style';
import { useNavigate, useLocation } from 'react-router-dom';
import SourceIcon from '@mui/icons-material/Source';

const drawerWidth = 240;

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
  width: `calc(${theme.spacing(9)} + 1px)`,
  [theme.breakpoints.up('sm')]: {
    width: `calc(${theme.spacing(13)} + 1px)`,
  },
});

const Drawer = styled(MuiDrawer, { shouldForwardProp: (prop) => prop !== 'open' })(({ theme }) => ({
  width: drawerWidth,
  flexShrink: 0,
  whiteSpace: 'nowrap',
  boxSizing: 'border-box',
  position: 'static',
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
}
interface NavItem {
  name: string;
  icon: React.ReactNode;
  route: string;
  subItems?: SubNavItem[];
}

const navItems: NavItem[] = [
  {
    name: 'Dashboard',
    icon: <DashboardIcon sx={{ fontSize: '3rem', color: 'black' }} />,
    route: '/dashboard',
  },
  // {
  //   name: 'Reports',
  //   icon: <ReportIcon sx={{ fontSize: '3rem', color: 'black' }} />,
  //   route: '/reports',
  // },
  {
    name: 'Settings',
    icon: <SettingsIcon sx={{ fontSize: '3rem', color: 'black' }} />,
    route: '',
    subItems: [
      {
        name: 'Attribute Options',
        icon: <StyleIcon sx={{ fontSize: '3rem', color: 'black' }} />,
        route: '/settings/attribute-option',
      },
      {
        name: 'Entities',
        icon: <ManageAccountsIcon sx={{ fontSize: '3rem', color: 'black' }} />,
        route: '/settings/entity',
      },
      {
        name: 'Data Source',
        icon: <SourceIcon sx={{ fontSize: '3rem', color: 'black' }} />,
        route: '/settings/data-source',
      },
    ],
  },
];

export default function SideNav() {
  const { openNav } = useNav();
  const [openSettings, setOpenSettings] = React.useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleItemClick = (route: string, hasSubItems: boolean) => {
    if (hasSubItems) {
      setOpenSettings((prev) => !prev);
    } else {
      navigate(route); // Navigate to the route
    }
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <Drawer variant="permanent" open={openNav} sx={{ height: 'calc(100vh - 70px)' }}>
        <List>
          {navItems.map((item) => (
            <React.Fragment key={item.name}>
              <ListItem disablePadding sx={{ display: 'block' }}>
                <ListItemButton
                  onClick={() => handleItemClick(item.route, !!item.subItems)}
                  sx={{
                    height: 90,
                    px: 2.5,
                    justifyContent: openNav ? 'initial' : 'center',
                    backgroundColor: location.pathname === item.route ? '#f0f0f0' : 'transparent',
                    '&:hover': { backgroundColor: '#e0e0e0' },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 0,
                      justifyContent: 'center',
                      mr: openNav ? 3 : 'auto',
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
                  {item.subItems && (openSettings ? <ExpandLessIcon /> : <ExpandMoreIcon />)}
                </ListItemButton>
              </ListItem>

              {item.subItems && (
                <Collapse in={openSettings} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding>
                    {item.subItems.map((subItem) => (
                      <ListItem key={subItem.name} disablePadding sx={{ display: 'block' }}>
                        <ListItemButton
                          onClick={() => navigate(subItem.route)}
                          sx={{
                            pl: 4,
                            justifyContent: openNav ? 'initial' : 'center',
                            backgroundColor: location.pathname === subItem.route ? '#f0f0f0' : 'transparent',
                            '&:hover': { backgroundColor: '#e0e0e0' },
                          }}
                        >
                          <ListItemIcon
                            sx={{
                              minWidth: 0,
                              justifyContent: 'center',
                              mr: openNav ? 3 : 'auto',
                            }}
                          >
                            {subItem.icon}
                          </ListItemIcon>
                          <ListItemText
                            primary={subItem.name}
                            sx={{
                              opacity: openNav ? 1 : 0,
                            }}
                          />
                        </ListItemButton>
                      </ListItem>
                    ))}
                  </List>
                </Collapse>
              )}
            </React.Fragment>
          ))}
        </List>
      </Drawer>
    </Box>
  );
}
