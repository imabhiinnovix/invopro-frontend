import { useState, useCallback, useContext, useEffect } from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import Popover from '@mui/material/Popover';
import Divider from '@mui/material/Divider';
import MenuList from '@mui/material/MenuList';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import MenuItem, { menuItemClasses } from '@mui/material/MenuItem';
import { AuthContext, AuthContextType } from '../../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { clearLocalStorage } from '../../../utils/handleLocalStorage';

export function AccountPopover() {
  const menuData = [{ label: 'My Profile' }, { label: 'Dashboard' }];

  const { userDetails, initialization, clearAuthContext } = useContext(AuthContext) as AuthContextType;

  useEffect(() => {
    initialization();
  }, [initialization]);

  const navigate = useNavigate();

  const [openPopover, setOpenPopover] = useState<HTMLButtonElement | null>(null);

  const handleOpenPopover = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    setOpenPopover(event.currentTarget);
  }, []);

  const handleClosePopover = useCallback(() => {
    setOpenPopover(null);
  }, []);

  // const handleClickItem = useCallback(
  //   (path: string) => {
  //     handleClosePopover();
  //     router.push(path);
  //   },
  //   [handleClosePopover, router],
  // );

  const logout = () => {
    clearAuthContext();
    clearLocalStorage();
    handleClosePopover();
    navigate('/login');
  };

  return (
    <>
      <IconButton
        onClick={handleOpenPopover}
        sx={{
          p: '2px',
          width: 40,
          height: 40,
        }}
      >
        <Avatar alt={userDetails?.data?.firstName?.[0]?.toUpperCase()} sx={{ width: 1, height: 1 }}>
          {userDetails?.data?.firstName?.charAt(0).toUpperCase()}
        </Avatar>
      </IconButton>

      <Popover
        open={!!openPopover}
        anchorEl={openPopover}
        onClose={handleClosePopover}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{
          paper: {
            sx: { width: 200 },
          },
        }}
      >
        <Box sx={{ p: 2, pb: 1.5 }}>
          <Typography variant="subtitle2" noWrap>
            {`${userDetails?.data?.firstName} ${userDetails?.data?.lastName}`}
          </Typography>

          <Typography variant="body2" sx={{ color: 'text.secondary' }} noWrap>
            {userDetails?.data?.email}
          </Typography>
        </Box>

        <Divider sx={{ borderStyle: 'dashed' }} />

        <MenuList
          disablePadding
          sx={{
            p: 1,
            gap: 0.5,
            display: 'flex',
            flexDirection: 'column',
            [`& .${menuItemClasses.root}`]: {
              px: 1,
              gap: 2,
              borderRadius: 0.75,
              color: 'text.secondary',
              '&:hover': { color: 'text.primary' },
              [`&.${menuItemClasses.selected}`]: {
                color: 'text.primary',
                bgcolor: 'action.selected',
                fontWeight: 'fontWeightSemiBold',
              },
            },
          }}
        >
          {menuData.map((option) => (
            <MenuItem
              key={option.label}
              // selected={option.href === pathname}
              // onClick={() => handleClickItem(option.href)}
            >
              {/* {option.icon} */}
              {option.label}
            </MenuItem>
          ))}
        </MenuList>

        <Divider sx={{ borderStyle: 'dashed' }} />

        <Box sx={{ p: 1 }}>
          <Button fullWidth color="error" size="medium" variant="text" onClick={logout}>
            Logout
          </Button>
        </Box>
      </Popover>
    </>
  );
}
