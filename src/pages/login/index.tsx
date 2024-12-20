import { useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Divider from '@mui/material/Divider';
import TextField from '@mui/material/TextField';

import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';

function Login() {
  const router = '';

  const [showPassword, setShowPassword] = useState(false);

  const handleSignIn = useCallback(() => {
    // router.push('/');
  }, [router]);

  const renderForm = (
    <Box display="flex" flexDirection="column" alignItems="flex-end" boxShadow={2} padding={4} borderRadius={5}>
      <TextField
        fullWidth
        name="email"
        label="Email address"
        defaultValue="example@gmail.com"
        // InputLabelProps={{ shrink: true }}
        sx={{ mb: 3 }}
      />

      <Link variant="body2" color="inherit" sx={{ mb: 1.5 }}>
        Forgot password?
      </Link>

      <TextField
        fullWidth
        name="password"
        label="Password"
        defaultValue="@demo1234"
        type={showPassword ? 'text' : 'password'}
        // InputProps={{
        //   endAdornment: (
        //     <InputAdornment position="end">
        //       <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
        //         {/* <Iconify icon={showPassword ? 'solar:eye-bold' : 'solar:eye-closed-bold'} /> */}
        //       </IconButton>
        //     </InputAdornment>
        //   ),
        // }}
        sx={{ mb: 3 }}
      />

      <LoadingButton fullWidth size="large" type="submit" color="inherit" variant="contained" onClick={handleSignIn}>
        Sign in
      </LoadingButton>
    </Box>
  );

  return (
    <Box display="flex" alignItems="center" justifyContent="center" height="85vh">
      <Box maxWidth="600px">
        <Box gap={1.5} display="flex" flexDirection="column" alignItems="center" sx={{ mb: 5 }}>
          <Typography variant="h3">Welcome to ReportiVix</Typography>
          <Typography variant="h6" color="text.secondary">
            To get started, please sign in
          </Typography>
        </Box>
        {renderForm}
        <Divider sx={{ mt: 3, '&::before, &::after': { borderTopStyle: 'dashed' } }}>
          <Typography variant="overline" sx={{ color: 'text.secondary', fontWeight: 'fontWeightMedium' }}>
            OR
          </Typography>
        </Divider>
        <Typography variant="h6">
          Login with
          <Link variant="h5" sx={{ ml: 0.5 }}>
            OTP!
          </Link>
        </Typography>
      </Box>
    </Box>
  );
}

export default Login;
