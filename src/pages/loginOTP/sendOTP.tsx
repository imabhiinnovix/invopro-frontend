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

import { useNavigate } from 'react-router-dom';
import usePost from '../../hooks/usePost';
import { sendOTPPayload, sendOTPResponse } from './types';
import ProgressBar from '../../components/molecule/progressBar';

function SendOTP() {
  const navigate = useNavigate();

  const sendOTP = usePost<sendOTPPayload, sendOTPResponse>(
    [''],
    () => {
      const email = getValues('email');
      console.log(email);
      setTimeout(() => {
        if (email) {
          navigate('/otp-login/otp', { state: { email: email } });
        }
      }, 10);
    },
    true,
  );

  const LoginSchema = yup.object().shape({
    email: yup
      .string()
      .required('Email is Required')
      .matches(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/, 'Invalid email address')
      .max(50, 'Email is too long'),
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<{ email: string }>({
    mode: 'all',
    reValidateMode: 'onChange',
    resolver: yupResolver(LoginSchema),
  });

  const onSubmit = async (data: { email: string }) => {
    sendOTP?.mutate({ url: POST?.SEND_OTP, payload: data });
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
        {!sendOTP?.isPending && !sendOTP.isSuccess ? (
          <LoadingButton
            fullWidth
            size="large"
            type="submit"
            color="primary"
            variant="contained"
            sx={{ fontWeight: 'bold' }}
          >
            Login with OTP
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
            Login with OTP
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
          <Link href="/login" variant="h5" sx={{ ml: 0.5, cursor: 'pointer', fontWeight: 'bold' }}>
            Password!
          </Link>
        </Typography>
      </Box>
    </Box>
  );
}

export default SendOTP;
