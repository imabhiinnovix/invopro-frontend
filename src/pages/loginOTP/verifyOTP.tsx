import { useEffect, useContext } from "react";

import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import Divider from "@mui/material/Divider";

import Typography from "@mui/material/Typography";
import LoadingButton from "@mui/lab/LoadingButton";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

import { POST, GET } from "../../services/apiRoutes";
import axiosInstance from "../../services/axiosInstance";
import { Button } from "@mui/material";

import {
  getAuthToken,
  setAuthToken,
  setRoleId,
} from "../../utils/handleLocalStorage";
import { roleId } from "../../utils/constants";
import { AuthContext, AuthContextType } from "../../context/AuthContext";
import { useLocation, useNavigate } from "react-router-dom";
import usePost from "../../hooks/usePost";
import { MuiOtpInput } from "mui-one-time-password-input";
import {
  sendOTPPayload,
  sendOTPResponse,
  verifyOTPPayload,
  verifyOTPResponse,
} from "./types";
import useCountdown from "../../hooks/useCountdown";
import ProgressBar from "../../components/molecule/progressBar";
import { STYLE_GUIDE } from "../../styles";
import logo from "../../assets/logo.png";
import { LoginFlowLayout } from "../../components/atom/LoginFlowLayout";

const VerifyOTP = () => {
  const { setIsAuthUser, userDetails } = useContext(
    AuthContext
  ) as AuthContextType;

  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;
  useEffect(() => {
    const token = getAuthToken();
    if (token) {
      const checkAndRedirectInfo = async () => {
        try {
          const { data } = await axiosInstance.get(GET.DASHBOARD_LIST);
          if (
            data?.success &&
            Array.isArray(data?.data) &&
            data.data.length > 0
          ) {
            navigate(`/dashboard/${data.data[0]._id}`);
          } else {
            navigate("/dashboard");
          }
        } catch (error) {
          navigate("/dashboard");
        }
      };

      setTimeout(() => {
        if (userDetails?.data?.roleId === roleId?.SUPER_ADMIN) {
          navigate("/superadmin/dashboard");
        } else {
          checkAndRedirectInfo();
        }
      }, 10);
      setRoleId(String(userDetails?.data?.roleId));
    }
  }, [userDetails]);

  const verifyOTP = usePost<verifyOTPPayload, verifyOTPResponse>(
    [""],
    (data) => {
      if (data?.success) {
        setAuthToken(data?.data?.token);
        setIsAuthUser(true);
      }
    },
    true
  );

  const sendOTP = usePost<sendOTPPayload, sendOTPResponse>(
    [""],
    () => {},
    true
  );

  const { countdown, isButtonDisabled, resetCountdown } = useCountdown(60);

  const LoginSchema = yup.object().shape({
    otp: yup
      .string()
      .required("OTP is required")
      .matches(/^\d+$/, "OTP must contain only digits") // Ensures the value is numeric
      .length(6, "OTP must be 6 digits"), // Checks that it's exactly 6 digits
  });

  const {
    handleSubmit,
    control,
    // formState: { errors },
  } = useForm<{ otp: string }>({
    mode: "all",
    reValidateMode: "onChange",
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

  return (
    <LoginFlowLayout>
      <Box flex={1} p={4} className="flex flex-col justify-center">
        <Box className="flex flex-col gap-y-5 mb-10 items-center justify-center">
          <Box className="flex flex-row items-center justify-center gap-x-2">
            <Typography variant="h4">Welcome to</Typography>
            <img
              src={logo}
              alt="logo"
              className="w-[250px] h-[80px] object-cover"
            />
          </Box>
          <Typography variant="body1">Login with OTP</Typography>
        </Box>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-y-5"
        >
          <Controller
            name="otp"
            control={control}
            defaultValue=""
            rules={{
              required: "OTP is required",
              validate: (value) =>
                value.length === 6 || "OTP must be 6 digits long",
            }}
            render={({ field, fieldState: { error } }) => (
              <Box>
                <MuiOtpInput
                  {...field}
                  value={field.value}
                  onChange={(value) => field.onChange(value)}
                  length={6}
                />
                {error && <p style={{ color: "red" }}>{error.message}</p>}
                <Box
                  display="flex"
                  justifyContent="flex-end"
                  alignItems="center"
                  m={STYLE_GUIDE.SPACING.s2}
                >
                  <Button
                    variant="text"
                    onClick={handleResendOTP}
                    disabled={isButtonDisabled}
                    sx={{
                      color: isButtonDisabled ? "gray" : "black",
                      cursor: isButtonDisabled ? "not-allowed" : "pointer",
                      "&:disabled": {
                        color: "gray",
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
                    sx={{ fontWeight: "bold" }}
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
        <Divider
          sx={{
            marginTop: STYLE_GUIDE.SPACING.s6,
            marginBottom: STYLE_GUIDE.SPACING.s4,
            "&::before, &::after": {
              borderTopStyle: "dashed",
              borderColor: STYLE_GUIDE.COLORS.divider,
            },
          }}
        >
          <Typography
            variant="overline"
            sx={{
              color: STYLE_GUIDE.COLORS.textMediumGray,
              fontWeight: STYLE_GUIDE.TYPOGRAPHY.fontWeight.medium,
            }}
          >
            OR
          </Typography>
        </Divider>
        <Typography
          sx={{
            textAlign: "center",
            fontSize: STYLE_GUIDE.TYPOGRAPHY.fontSize.large,
          }}
        >
          <Link
            href="/otp-login"
            sx={{
              marginLeft: STYLE_GUIDE.SPACING.s1,
              cursor: "pointer",
              fontWeight: STYLE_GUIDE.TYPOGRAPHY.fontWeight.bold,
              color: STYLE_GUIDE.COLORS.primary,
              fontSize: STYLE_GUIDE.TYPOGRAPHY.fontSize.large,
              textDecoration: "none",
            }}
          >
            Change Email
          </Link>
        </Typography>
      </Box>
    </LoginFlowLayout>
  );
};

export default VerifyOTP;
