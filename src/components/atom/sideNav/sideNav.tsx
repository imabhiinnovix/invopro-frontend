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
import ReportIcon from '@mui/icons-material/Report';
import SettingsIcon from '@mui/icons-material/Settings';
import React from 'react';
import { Collapse } from '@mui/material';

import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import StyleIcon from '@mui/icons-material/Style';

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
  width: `calc(${theme.spacing(14)} + 1px)`,
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
}
interface NavItem {
  name: string;
  icon: React.ReactNode;
  subItems?: SubNavItem[];
}

const navItems: NavItem[] = [
  {
    name: 'Dashboard',
    icon: <DashboardIcon sx={{ fontSize: '3rem', color: 'black' }} />,
  },
  {
    name: 'Reports',
    icon: <ReportIcon sx={{ fontSize: '3rem', color: 'black' }} />,
  },
  {
    name: 'Settings',
    icon: <SettingsIcon sx={{ fontSize: '3rem', color: 'black' }} />,
    subItems: [
      {
        name: 'Entitites',
        icon: <ManageAccountsIcon sx={{ fontSize: '3rem', color: 'black' }} />,
      },
      {
        name: 'Attribute Options',
        icon: <StyleIcon sx={{ fontSize: '3rem', color: 'black' }} />,
      },
    ],
  },
];

export default function SideNav() {
  const { openNav } = useNav();
  const [openSettings, setOpenSettings] = React.useState(false); // State to manage the opening of Settings
  const [selected, setSelected] = React.useState<string>(''); // Track the selected item

  const handleItemClick = (item: string) => {
    setSelected(item);
    if (item === 'Settings') {
      setOpenSettings((prev) => !prev); // Toggle the settings dropdown
    }
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <Drawer
        variant="permanent"
        open={openNav}
        sx={{ width: drawerWidth, flexShrink: 0, boxSizing: 'border-box', height: 'calc(100vh - 70px)' }}
      >
        <List>
          {navItems.map((item) => (
            <React.Fragment key={item.name}>
              {/* Main Navigation Item */}
              <ListItem disablePadding sx={{ display: 'block' }}>
                <ListItemButton
                  onClick={() => handleItemClick(item.name)}
                  sx={{
                    height: 90,
                    px: 2.5,
                    justifyContent: openNav ? 'initial' : 'center',
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
                    slotProps={{
                      primary: {
                        fontSize: '18px',
                        fontWeight: 'bold',
                      },
                    }}
                    sx={{
                      opacity: openNav ? 1 : 0,
                    }}
                  />
                  {item.subItems && (openSettings ? <ExpandLessIcon /> : <ExpandMoreIcon />)}
                </ListItemButton>
              </ListItem>

              {/* Nested Items for Settings */}
              {item.subItems && (
                <Collapse in={openSettings} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding>
                    {item.subItems.map((subItem) => (
                      <ListItem key={subItem.name} disablePadding sx={{ display: 'block' }}>
                        <ListItemButton
                          sx={{
                            pl: 4, // Indentation for nested items
                            justifyContent: openNav ? 'initial' : 'center',
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
