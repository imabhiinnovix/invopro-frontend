import React from 'react';
import { List, ListItem, ListItemButton, ListItemIcon, ListItemText, IconButton } from '@mui/material';
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
  onDeleteClick?: (e: React.MouseEvent, dashboard: Dashboard) => void;
  onCreateClick?: () => void;
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
                  pl: 3,
                  py: 0.5,
                  height: 40,
                  minHeight: 40,
                  justifyContent: openNav ? 'initial' : 'center',
                  '&:hover': { backgroundColor: '#e0e0e0' },
                  '& .MuiListItemButton-root': {
                    minHeight: 40,
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    justifyContent: 'center',
                    mr: openNav ? 2 : 'auto',
                    '& .MuiSvgIcon-root': {
                      fontSize: '0.9rem',
                    },
                  }}
                >
                  {subItem.icon}
                </ListItemIcon>
                <ListItemText
                  primary={subItem.name}
                  sx={{
                    opacity: openNav ? 1 : 0,
                    '& .MuiListItemText-primary': {
                      fontSize: '0.8rem',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      lineHeight: 1.2,
                    },
                  }}
                />
              </ListItemButton>
            ) : (
              <ListItemButton
                onClick={() => {
                  if (parentName === "Dashboards") {
                    navigate(subItem.route);
                  } else {
                    navigate(subItem.route);
                  }
                }}
                sx={{
                  pl: 3,
                  py: 0.5,
                  height: 40,
                  minHeight: 40,
                  justifyContent: openNav ? 'initial' : 'center',
                  '&:hover': { backgroundColor: '#e0e0e0' },
                  position: 'relative',
                  backgroundColor: location.pathname === subItem.route ? '#f0f0f0' : 'transparent',
                  '& .MuiListItemButton-root': {
                    minHeight: 40,
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    justifyContent: 'center',
                    mr: openNav ? 2 : 'auto',
                    '& .MuiSvgIcon-root': {
                      fontSize: '0.9rem',
                    },
                  }}
                >
                  {subItem.icon}
                </ListItemIcon>
                <ListItemText
                  primary={subItem.name}
                  sx={{
                    opacity: openNav ? 1 : 0,
                    '& .MuiListItemText-primary': {
                      fontSize: '0.8rem',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      lineHeight: 1.2,
                    },
                  }}
                />
                {parentName === "Dashboards" && !subItem.isMoreLink && (
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      const dashboard = dashboards.find(d => d._id === subItem.route.split('/').pop());
                      if (dashboard) {
                        onDeleteClick?.(e, dashboard);
                      }
                    }}
                    sx={{
                      opacity: 0,
                      position: 'absolute',
                      right: 8,
                      padding: '4px',
                      transition: 'opacity 0.2s',
                      '&:hover': { opacity: 1 },
                      '.MuiListItemButton-root:hover &': {
                        opacity: 1,
                      },
                      '& .MuiSvgIcon-root': {
                        fontSize: '0.9rem',
                        color: 'red',
                      },
                    }}
                  >
                    <DeleteIcon />
                  </IconButton>
                )}
              </ListItemButton>
            )}
          </ListItem>
        </React.Fragment>
      ))}
    </List>
  );
}; 