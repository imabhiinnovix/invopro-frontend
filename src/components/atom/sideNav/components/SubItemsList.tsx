import React, { useState } from 'react';
import { List, ListItem, ListItemButton, ListItemIcon, ListItemText, IconButton, Menu, MenuItem } from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import ShareIcon from '@mui/icons-material/Share';
import DeleteIcon from '@mui/icons-material/Delete';
import { useNavigate, useLocation } from 'react-router-dom';
import { Dashboard } from '../../../../pages/dashboard/types';
import { ShareDashboardModal } from './ShareDashboardModal';
import { STYLE_GUIDE } from '../../../../styles';
import { useComponentTypography } from '../../../../hooks/useComponentTypography';

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
  const { getNavigationSx } = useComponentTypography();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedDashboard, setSelectedDashboard] = useState<Dashboard | null>(null);
  const [shareModalOpen, setShareModalOpen] = useState(false);

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, dashboard: Dashboard) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setSelectedDashboard(dashboard);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedDashboard(null);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedDashboard) {
      onDeleteClick?.(e, selectedDashboard);
    }
    handleMenuClose();
  };

  const handleShare = () => {
    setShareModalOpen(true);
    setAnchorEl(null);
  };

  const handleShareSubmit = (selectedUsers: string[], sharedToAll: boolean) => {
    // This will be implemented in the next step with the API
    console.log('Sharing dashboard:', {
      dashboard: selectedDashboard,
      selectedUsers,
      sharedToAll
    });
  };

  return (
    <>
        <List component="div" disablePadding>
          {subItems.map((subItem, i) => (
            <React.Fragment key={i}>
              <ListItem disablePadding sx={{ display: 'block' }}>
                {subItem.isCreateButton ? (
                  <ListItemButton
                    onClick={onCreateClick}
                    sx={{
                      pl: STYLE_GUIDE.SPACING.s8,
                      py: 0.5,
                      height: 40,
                      minHeight: 40,
                      justifyContent: openNav ? 'initial' : 'center',
                      '&:hover': { backgroundColor: STYLE_GUIDE.COLORS.divider },
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
                          fontSize: getNavigationSx().fontSize,
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
                        ...getNavigationSx(),
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        lineHeight: STYLE_GUIDE.TYPOGRAPHY.lineHeight.tight,
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
                      pl: STYLE_GUIDE.SPACING.s8,
                      py: 0.5,
                      height: 40,
                      minHeight: 40,
                      justifyContent: openNav ? 'initial' : 'center',
                      '&:hover': { backgroundColor: STYLE_GUIDE.COLORS.divider },
                      position: 'relative',
                      backgroundColor: location.pathname === subItem.route ? STYLE_GUIDE.COLORS.backgroundHover : 'transparent',
                      ...(subItem.isMoreLink && {
                        '&:hover': { 
                          backgroundColor: STYLE_GUIDE.COLORS.WhiteLight,
                        },
                      }),
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
                          fontSize: getNavigationSx().fontSize,
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
                        ...getNavigationSx(),
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        lineHeight: STYLE_GUIDE.TYPOGRAPHY.lineHeight.tight,
                        ...(subItem.isMoreLink && {
                          textDecoration: 'underline',
                          color: STYLE_GUIDE.COLORS.materialBlue,
                          fontWeight: STYLE_GUIDE.TYPOGRAPHY.fontWeight.medium,
                          '&:hover': {
                            color: STYLE_GUIDE.COLORS.indigo600,
                          }
                        }),
                      },
                          }}
                    />
                    {!subItem.isMoreLink && parentName === "Dashboards" && (
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          const dashboard = dashboards.find(d => d._id === subItem.route.split('/').pop());
                          if (dashboard) {
                            handleMenuClick(e, dashboard);
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
                        }}
                      >
                        <MoreVertIcon sx={{ fontSize: getNavigationSx().fontSize }} />
                      </IconButton>
                    )}
                  </ListItemButton>
                )}
              </ListItem>
            </React.Fragment>
          ))}
        </List>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        onClick={(e) => e.stopPropagation()}
      >
        <MenuItem onClick={handleShare} sx={{ '& .MuiListItemText-root': { ...getNavigationSx() } }}>
          <ListItemIcon>
            <ShareIcon fontSize="small" />
          </ListItemIcon>
          Share
        </MenuItem>
        <MenuItem onClick={handleDelete} sx={{ '& .MuiListItemText-root': { ...getNavigationSx() } }}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" sx={{ color: 'red' }} />
          </ListItemIcon>
          Delete
        </MenuItem>
      </Menu>

      <ShareDashboardModal
        open={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        dashboard={selectedDashboard}
        onSubmit={handleShareSubmit}
      />
    </>
  );
}; 