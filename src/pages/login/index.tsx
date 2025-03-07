import { useState, useEffect, useContext, useLayoutEffect } from 'react';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Divider from '@mui/material/Divider';
import TextField from '@mui/material/TextField';

import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

import { POST } from '../../services/apiRoutes';
import { IconButton, InputAdornment } from '@mui/material';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { clearLocalStorage, getAuthToken, setAuthToken, setRoleId } from '../../utils/handleLocalStorage';
import { roleId } from '../../utils/constants';
import { AuthContext, AuthContextType } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import usePost from '../../hooks/usePost';
import ProgressBar from '../../components/molecule/progressBar';

interface getLoginPayload {
  email: string;
  password: string;
}

interface getLoginResponse {
  success: boolean;
  message: string;
  data: {
    token: string;
  };
}

interface userCredType {
  email: string;
  password: string;
}

function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const { setIsAuthUser, userDetails } = useContext(AuthContext) as AuthContextType;

  useEffect(() => {
    const token = getAuthToken();
    if (token) {
      if (userDetails?.data?.roleId === roleId?.SUPER_ADMIN) {
        // navigate('/superadmin/dashboard');
        navigate('/reports');
      } else if (userDetails?.data?.roleId === roleId?.ADMIN) {
        // navigate('/admin/dashboard');
        navigate('/reports');
      } else {
        // navigate('/dashboard');
        navigate('/reports');
      }
      setRoleId(String(userDetails?.data?.roleId));
    }
  }, [userDetails]);

  const navigate = useNavigate();

  const getLogin = usePost<getLoginPayload, getLoginResponse>(
    [''],
    (data) => {
      if (data?.success) {
        setAuthToken(data?.data?.token);
        setIsAuthUser(true);
      }
    },
    true
  );

  useLayoutEffect(() => {
    clearLocalStorage();
  }, []);

  const LoginSchema = yup.object().shape({
    email: yup
      .string()
      .required('Email is Required')
      .matches(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/, 'Invalid email address')
      .max(50, 'Email is too long'),
    password: yup.string().required('Password is required'),
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<userCredType>({
    mode: 'all',
    reValidateMode: 'onChange',
    resolver: yupResolver(LoginSchema),
  });

  const onSubmit = async (data: userCredType) => {
    const userCred = { email: data?.email, password: data?.password };
    getLogin.mutate({ url: POST.LOGIN, payload: userCred });
  };

  const renderForm = (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-y-5">
      <Box display="flex" flexDirection="column" alignItems="flex-end" boxShadow={2} padding={4} borderRadius={5}>
        <TextField
          fullWidth
          label="Email address"
          defaultValue="example@gmail.com"
          required
          error={!!errors.email}
          helperText={errors.email?.message}
          {...register('email')}
          sx={{ mb: 3 }}
        />

        {/* <Link variant="body2" color="inherit" sx={{ mb: 1.5 }}>
          Forgot password?
        </Link> */}

        <TextField
          fullWidth
          label="Password"
          defaultValue="@demo1234"
          type={showPassword ? 'text' : 'password'}
          {...register('password')}
          required
          error={!!errors.password}
          helperText={errors.password?.message}
          slotProps={{
            input: {
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                    {/* Replace with your icon logic */}
                    {showPassword ? <VisibilityIcon /> : <VisibilityOffIcon />}
                  </IconButton>
                </InputAdornment>
              ),
            },
          }}
          sx={{ mb: 3 }}
        />

        {!getLogin.isPending && !getLogin.isSuccess ? (
          <LoadingButton
            fullWidth
            size="large"
            type="submit"
            color="primary"
            variant="contained"
            sx={{ fontWeight: 'bold' }}
          >
            Sign in
          </LoadingButton>
        ) : (
          <ProgressBar />
        )}
      </Box>
    </form>
  );

  return (
    <Box display="flex" alignItems="center" justifyContent="center" height="85vh">
      <Box maxWidth="600px">
        <Box gap={1.5} display="flex" flexDirection="column" alignItems="center" sx={{ mb: 5 }}>
          <Typography variant="h3" textAlign="center">
            Welcome to ReportiVix
          </Typography>
          <Typography variant="h6" color="text.secondary" textAlign="center">
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
          <Link href="/otp-login" variant="h5" sx={{ ml: 0.5, cursor: 'pointer', fontWeight: 'bold' }}>
            OTP!
          </Link>
        </Typography>
      </Box>
    </Box>
  );
}

export default Login;
