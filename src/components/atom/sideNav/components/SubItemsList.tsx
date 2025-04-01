import React from 'react';
import { List, ListItem, ListItemButton, ListItemIcon, ListItemText, Divider, IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { useNavigate, useLocation } from 'react-router-dom';
import { Dashboard } from '../../../../pages/dashboard/types';

interface SubItem {
  name: string;
  icon: React.ReactNode;
  route: string;
  isCreateButton?: boolean;
  isMoreLink?: boolean;
}

interface SubItemsListProps {
  subItems: SubItem[];
  openNav: boolean;
  parentName: string;
  dashboards: Dashboard[];
  onDeleteClick: (e: React.MouseEvent, dashboard: Dashboard) => void;
  onCreateClick: () => void;
}

export const SubItemsList: React.FC<SubItemsListProps> = ({
  subItems,
  openNav,
  parentName,
  dashboards,
  onDeleteClick,
  onCreateClick,
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <List component="div" disablePadding>
      {subItems.map((subItem, i) => (
        <React.Fragment key={i}>
          <ListItem disablePadding sx={{ display: 'block' }}>
            {subItem.isCreateButton ? (
              <ListItemButton
                onClick={onCreateClick}
                sx={{
                  pl: 4,
                  justifyContent: openNav ? 'initial' : 'center',
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
                    '& .MuiListItemText-primary': {
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    },
                  }}
                />
              </ListItemButton>
            ) : subItem.isMoreLink ? (
              <ListItemButton
                onClick={() => navigate(subItem.route)}
                sx={{
                  pl: 4,
                  justifyContent: openNav ? 'initial' : 'center',
                  '&:hover': { backgroundColor: '#e0e0e0' },
                  backgroundColor: location.pathname === subItem.route ? '#f0f0f0' : 'transparent',
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
                    '& .MuiListItemText-primary': {
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      color: '#1a237e',
                      fontWeight: 500,
                    },
                  }}
                />
              </ListItemButton>
            ) : (
              <ListItemButton
                onClick={() => {
                  if (parentName === "Dashboard") {
                    navigate(subItem.route);
                  } else {
                    navigate(subItem.route);
                  }
                }}
                sx={{
                  pl: 4,
                  justifyContent: openNav ? 'initial' : 'center',
                  '&:hover': { backgroundColor: '#e0e0e0' },
                  position: 'relative',
                  backgroundColor: location.pathname === subItem.route ? '#f0f0f0' : 'transparent',
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
                    '& .MuiListItemText-primary': {
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    },
                  }}
                />
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteClick(e, dashboards.find(d => d._id === subItem.route.split('/')[2]) || dashboards[0]);
                  }}
                  sx={{
                    opacity: 0,
                    position: 'absolute',
                    right: 8,
                    '&:hover': { opacity: 1 },
                    transition: 'opacity 0.2s',
                    '.MuiListItemButton-root:hover &': {
                      opacity: 1,
                    },
                  }}
                >
                  <DeleteIcon sx={{ fontSize: '1.2rem', color: 'red' }} />
                </IconButton>
              </ListItemButton>
            )}
          </ListItem>
          {i < subItems.length - 1 && <Divider />}
        </React.Fragment>
      ))}
    </List>
  );
}; 