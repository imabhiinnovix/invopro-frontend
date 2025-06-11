import { useEffect, useContext } from 'react';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Divider from '@mui/material/Divider';

import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

import { POST } from '../../services/apiRoutes';
import { Button } from '@mui/material';

import { getAuthToken, setAuthToken, setRoleId } from '../../utils/handleLocalStorage';
import { roleId } from '../../utils/constants';
import { AuthContext, AuthContextType } from '../../context/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';
import usePost from '../../hooks/usePost';
import { MuiOtpInput } from 'mui-one-time-password-input';
import { sendOTPPayload, sendOTPResponse, verifyOTPPayload, verifyOTPResponse } from './types';
import useCountdown from '../../hooks/useCountdown';
import ProgressBar from '../../components/molecule/progressBar';
import { STYLE_GUIDE } from '../../styles';
import logo from '../../assets/logo.png';

const VerifyOTP = () => {
  const { setIsAuthUser, userDetails } = useContext(AuthContext) as AuthContextType;

  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;
  useEffect(() => {
    const token = getAuthToken();
    if (token) {
      setTimeout(() => {
        if (userDetails?.data?.roleId === roleId?.SUPER_ADMIN) {
          navigate('/superadmin/dashboard');
        } else {
          navigate('/dashboard');
        }
      }, 10);
      setRoleId(String(userDetails?.data?.roleId));
    }
  }, [userDetails]);

  const verifyOTP = usePost<verifyOTPPayload, verifyOTPResponse>(
    [''],
    (data) => {
      if (data?.success) {
        setAuthToken(data?.data?.token);
        setIsAuthUser(true);
      }
    },
    true
  );

  const sendOTP = usePost<sendOTPPayload, sendOTPResponse>([''], () => {}, true);

  const { countdown, isButtonDisabled, resetCountdown } = useCountdown(60);

  const LoginSchema = yup.object().shape({
    otp: yup
      .string()
      .required('OTP is required')
      .matches(/^\d+$/, 'OTP must contain only digits') // Ensures the value is numeric
      .length(6, 'OTP must be 6 digits'), // Checks that it's exactly 6 digits
  });

  const {
    handleSubmit,
    control,
    // formState: { errors },
  } = useForm<{ otp: string }>({
    mode: 'all',
    reValidateMode: 'onChange',
    resolver: yupResolver(LoginSchema),
    // defaultValues: { otp: '______' }, // Default value for the OTP field
  });

  const onSubmit = async (data: { otp: string }) => {
    const otpCode = data.otp;
    verifyOTP?.mutate({
      url: POST?.VERIFY_OTP,
      payload: {
        email,
        otp: otpCode,
      },
    });
  };

  const handleResendOTP = () => {
    const data = { email };
    sendOTP?.mutate({ url: POST?.SEND_OTP, payload: data });
    resetCountdown();
  };

  const renderForm = (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-y-5">
      <Controller
        name="otp"
        control={control}
        defaultValue=""
        rules={{
          required: 'OTP is required',
          validate: (value) => value.length === 6 || 'OTP must be 6 digits long',
        }}
        render={({ field, fieldState: { error } }) => (
          <Box 
          sx={{
            boxShadow: STYLE_GUIDE.SHADOWS.cardSecondary,
            padding: STYLE_GUIDE.SPACING.s8,
            borderRadius: STYLE_GUIDE.SPACING.s2,
            backgroundColor: STYLE_GUIDE.COLORS.backgroundPaper,
          }}>
              <MuiOtpInput {...field} value={field.value} onChange={(value) => field.onChange(value)} length={6} />
            {error && <p style={{ color: 'red' }}>{error.message}</p>}
            <Box display="flex" justifyContent="flex-end" alignItems="center" m={STYLE_GUIDE.SPACING.s2}>
              <Button
                variant="text"
                onClick={handleResendOTP}
                disabled={isButtonDisabled}
                sx={{
                  color: isButtonDisabled ? 'gray' : 'black',
                  cursor: isButtonDisabled ? 'not-allowed' : 'pointer',
                  '&:disabled': {
                    color: 'gray',
                  },
                }}
              >
                Re-send OTP
              </Button>
              {countdown > 0 && (
                <Typography variant="body2" color="text.secondary">
                  ({countdown}s)
                </Typography>
              )}
            </Box>

            {!verifyOTP?.isPending && !verifyOTP.isSuccess ? (
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
        )}
      />
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
            <Typography textAlign="center" sx={{ fontSize: STYLE_GUIDE.TYPOGRAPHY.fontSize.xxxxl, fontWeight: 400, mt: STYLE_GUIDE.SPACING.s1 }}>
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
};

export default VerifyOTP;
