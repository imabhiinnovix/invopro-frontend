import { useEffect, useContext, useLayoutEffect, useState } from "react";

import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import Divider from "@mui/material/Divider";
import TextField from "../../components/atom/TextField";

import Typography from "@mui/material/Typography";
import LoadingButton from "@mui/lab/LoadingButton";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { MuiOtpInput } from "mui-one-time-password-input";

import { POST, GET } from "../../services/apiRoutes";
import axiosInstance from "../../services/axiosInstance";
import {
  clearSessionStorage,
  getAuthToken,
  setAuthToken,
  setRoleId,
} from "../../utils/handleLocalStorage";

import { AuthContext, AuthContextType } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import usePost from "../../hooks/usePost";
import ProgressBar from "../../components/molecule/progressBar";
import logo from "../../assets/logo.png";
import { STYLE_GUIDE } from "../../styles";
import { useComponentTypography } from "../../hooks/useComponentTypography";
import { LoginFlowLayout } from "../../components/atom/LoginFlowLayout";
import useCountdown from "../../hooks/useCountdown";
import { Button } from "@mui/material";

interface getLoginPayload {
  email: string;
  password: string;
}

interface getLoginResponse {
  success: boolean;
  message: string;
  code?: string;
  data: {
    token: string;
  };
}
interface verifyOtpPayload {
  email: string;
  otp: string;
}
interface userCredType {
  email: string;
  password: string;
  otp?: string;
}

function Login() {
  const { getButtonSx } = useComponentTypography();
  const { setIsAuthUser, userDetails } = useContext(
    AuthContext
  ) as AuthContextType;

  const navigate = useNavigate();
  const [showOtp, setShowOtp] = useState(false);

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
            // 1️ find first role default dashboard
            const roleDefaultDashboard = data.data.find(
              (dashboard: any) => dashboard.isRoleDefault === true
            );

            // 2️ decide which dashboard to open
            const dashboardToOpen = roleDefaultDashboard || data.data[0];

            navigate(`/dashboard/${dashboardToOpen._id}`);
          } else {
            navigate("/dashboard");
          }
        } catch (error) {
          navigate("/dashboard");
        }
      };

      checkAndRedirectInfo();
      setRoleId(String(userDetails?.data?.roleId));
    }
  }, [userDetails]);

  const getLogin = usePost<getLoginPayload, getLoginResponse>(
    [""],
    (data) => {
      if (data?.success) {
        // if (data?.code === "OTP_REQUIRED") {
        if (data?.code === "OTP_REQUIRED") {
          setShowOtp(true);
          resetCountdown();
        } else if (data?.code === "OTP_NOT_REQUIRED") {
          setAuthToken(data?.data?.token);
          setIsAuthUser(true);
        }
      }
    },
    true
  );

  const verifyOTP = usePost<verifyOtpPayload, getLoginResponse>(
    [""],
    (data) => {
      if (data?.success) {
        setAuthToken(data?.data?.token);
        setIsAuthUser(true);
      }
    },
    true
  );

  const { countdown, isButtonDisabled, resetCountdown } = useCountdown(60);

  useLayoutEffect(() => {
    clearSessionStorage();
  }, []);

  const LoginSchema = yup.object().shape({
    email: yup
      .string()
      .required("Email is Required")
      .matches(
        /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
        "Invalid email address"
      )
      .max(50, "Email is too long"),
    // password: yup.string().required("Password is required"),
    password: yup
      .string()
      .required("Password is required")
      .min(8, "Password must be at least 8 characters")
      .matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_])\S+$/,
        "Password must contain at least one uppercase, one lowercase, one number and one special character"
      ),
    otp: yup.string().when("$showOtp", {
      is: true,
      then: (schema: any) => schema.required("OTP is required"),
      otherwise: (schema: any) => schema.notRequired(),
    }),
  });

  const {
    register,
    handleSubmit,
    getValues,
    control,
    formState: { errors },
  } = useForm<userCredType>({
    mode: "all",
    reValidateMode: "onChange",
    resolver: yupResolver(LoginSchema),
    context: { showOtp },
  });

  const onSubmit = async (data: userCredType) => {
    if (showOtp) {
      const payload: verifyOtpPayload = {
        email: getValues("email") as string,
        otp: data.otp as string,
      };
      verifyOTP.mutate({ url: POST.VERIFY_OTP, payload });
    } else {
      const userCred = { email: data?.email, password: data?.password };
      getLogin.mutate({ url: POST.LOGIN, payload: userCred });
    }
  };

  const handleResendOTP = () => {
    const data = { email: getValues("email"), password: getValues("password") };
    getLogin?.mutate({ url: POST.LOGIN, payload: data });
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
          <Typography variant="body1">
            To get started, please sign in
          </Typography>
        </Box>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-y-5"
        >
          <TextField
            {...register("email")}
            fullWidth
            name="email"
            label="Email address"
            placeholder="example@gmail.com"
            required
            disabled={showOtp}
            error={!!errors.email}
            helperText={errors.email?.message}
          />

          <TextField
            {...register("password")}
            fullWidth
            label="Password"
            placeholder="@Demo1234"
            required
            disabled={showOtp}
            isPasswordField
            error={!!errors.password}
            helperText={errors.password?.message}
          />

          {showOtp && (
            <Controller
              name="otp"
              control={control}
              defaultValue=""
              rules={{
                required: "OTP is required",
                validate: (value) =>
                  (value && value.length === 6) || "OTP must be 6 digits long",
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
                      sx={{
                        ...getButtonSx(),
                        fontWeight: STYLE_GUIDE.TYPOGRAPHY.fontWeight.bold,
                      }}
                    >
                      Login with OTP
                    </LoadingButton>
                  ) : (
                    <ProgressBar />
                  )}
                </Box>
              )}
            />
          )}
          <Box className="flex justify-end">
            {showOtp ? (
              <Link
                onClick={() => setShowOtp(false)}
                sx={{
                  cursor: "pointer",
                  fontWeight: STYLE_GUIDE.TYPOGRAPHY.fontWeight.medium,
                  color: STYLE_GUIDE.COLORS.primary,
                  fontSize: STYLE_GUIDE.TYPOGRAPHY.fontSize.base,
                  textDecoration: "none",
                }}
              >
                Change Email
              </Link>
            ) : (
              <Link
                onClick={() => navigate("/forgot-password")}
                sx={{
                  cursor: "pointer",
                  fontWeight: STYLE_GUIDE.TYPOGRAPHY.fontWeight.medium,
                  color: STYLE_GUIDE.COLORS.primary,
                  fontSize: STYLE_GUIDE.TYPOGRAPHY.fontSize.base,
                  textDecoration: "none",
                }}
              >
                Forgot Password?
              </Link>
            )}
          </Box>
          {!showOtp &&
            (getLogin.isPending ? (
              <ProgressBar />
            ) : (
              <LoadingButton
                fullWidth
                size="large"
                type="submit"
                color="primary"
                variant="contained"
                sx={{
                  ...getButtonSx(),
                  fontWeight: STYLE_GUIDE.TYPOGRAPHY.fontWeight.bold,
                }}
              >
                Sign in
              </LoadingButton>
            ))}

          <Divider
            sx={{
              marginTop: STYLE_GUIDE.SPACING.s2,
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
            Login with
            <Link
              onClick={() => navigate("/otp-login")}
              sx={{
                marginLeft: STYLE_GUIDE.SPACING.s1,
                cursor: "pointer",
                fontWeight: STYLE_GUIDE.TYPOGRAPHY.fontWeight.bold,
                color: STYLE_GUIDE.COLORS.primary,
                fontSize: STYLE_GUIDE.TYPOGRAPHY.fontSize.large,
                textDecoration: "none",
              }}
            >
              OTP
            </Link>
          </Typography>
        </form>
      </Box>
    </LoginFlowLayout>
  );
}

export default Login;
