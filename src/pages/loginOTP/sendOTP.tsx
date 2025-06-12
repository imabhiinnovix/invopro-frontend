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
import { STYLE_GUIDE } from '../../styles';
import logo from '../../assets/logo.png';

function SendOTP() {
  const navigate = useNavigate();

  const sendOTP = usePost<sendOTPPayload, sendOTPResponse>(
    [''],
    () => {
      const email = getValues('email');

      setTimeout(() => {
        if (email) {
          navigate('/otp-login/otp', { state: { email: email } });
        }
      }, 10);
    },
    true
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
      <Box display="flex" flexDirection="column" alignItems="flex-end" sx={{
          boxShadow: STYLE_GUIDE.SHADOWS.cardSecondary,
          padding: STYLE_GUIDE.SPACING.s8,
          borderRadius: STYLE_GUIDE.SPACING.s2,
          backgroundColor: STYLE_GUIDE.COLORS.white,
        }}>
        <TextField
          fullWidth
          label="Email address"
          placeholder="example@gmail.com"
          required
          error={!!errors.email}
          helperText={errors.email?.message}
          {...register('email')}
          sx={{ mb: STYLE_GUIDE.SPACING.s6 }}
        />
        {!sendOTP?.isPending && !sendOTP.isSuccess ? (
          <LoadingButton
            fullWidth
            size="large"
            type="submit"
            color="primary"
            variant="contained"
            sx={{ fontWeight: STYLE_GUIDE.TYPOGRAPHY.fontWeight.bold}}
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
    <Box
      display="flex"
      alignItems="center"
      justifyContent="center"
      sx={{ margin: STYLE_GUIDE.SPACING.s3 }}
    >
      <Box maxWidth="600px">
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            marginBottom: STYLE_GUIDE.SPACING.s10
          }}
        >
          <Box display="flex" alignItems="center" justifyContent="center" gap={STYLE_GUIDE.SPACING.s1}>
            <Typography textAlign="center" sx={{ fontSize: STYLE_GUIDE.TYPOGRAPHY.fontSize.xxxxl, fontWeight: STYLE_GUIDE.TYPOGRAPHY.fontWeight.regular, mt: STYLE_GUIDE.SPACING.s1 }}>
              Welcome to
            </Typography>
            <Box component="img" src={logo} alt="Logo" width={250} />
          </Box>
          <Typography variant="h6" color="text.secondary" textAlign="center">
            Login with OTP
          </Typography>
        </Box>
        {renderForm}
        <Divider
          sx={{
            marginTop: STYLE_GUIDE.SPACING.s6,
            marginBottom: STYLE_GUIDE.SPACING.s4,
            '&::before, &::after': {
              borderTopStyle: 'dashed',
              borderColor: STYLE_GUIDE.COLORS.divider
            }
          }}
        >
          <Typography
            variant="overline"
            sx={{ color: STYLE_GUIDE.COLORS.textMediumGray,
              fontWeight: STYLE_GUIDE.TYPOGRAPHY.fontWeight.medium,}}
          >
            OR
          </Typography>
        </Divider>
        <Typography sx={{ textAlign: "center", 
              fontSize: STYLE_GUIDE.TYPOGRAPHY.fontSize.large,
         }}>
          Login with
          <Link
            href="/login"
            sx={{
              marginLeft: STYLE_GUIDE.SPACING.s1,
              cursor: 'pointer',
              fontWeight: STYLE_GUIDE.TYPOGRAPHY.fontWeight.bold,
              color: STYLE_GUIDE.COLORS.primary,
              fontSize: STYLE_GUIDE.TYPOGRAPHY.fontSize.large,
            }}
          >
            Password!
          </Link>
        </Typography>
      </Box>
    </Box>
  );
}

export default SendOTP;
