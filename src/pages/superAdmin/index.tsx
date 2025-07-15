import { Box } from '@mui/material';
import { useUnifiedTheme } from '../../hooks/useUnifiedTheme';

function SuperAdmin() {
  const theme = useUnifiedTheme();
  return <Box sx={{ backgroundColor: theme.palette.background.paper }}>{/* <TemporaryDrawer /> */}</Box>;
}

export default SuperAdmin;
