import { Box, useTheme } from '@mui/material';

function SuperAdmin() {
  const theme = useTheme();
  return <Box sx={{ backgroundColor: theme.palette.background.paper }}>{/* <TemporaryDrawer /> */}</Box>;
}

export default SuperAdmin;
