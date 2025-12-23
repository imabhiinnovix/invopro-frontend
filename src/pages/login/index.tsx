import { useEffect, useContext, useLayoutEffect } from "react";

import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import Divider from "@mui/material/Divider";
import TextField from "../../components/atom/TextField";

import Typography from "@mui/material/Typography";
import LoadingButton from "@mui/lab/LoadingButton";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

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
  const { getButtonSx } = useComponentTypography();
  const { setIsAuthUser, userDetails } = useContext(
    AuthContext
  ) as AuthContextType;

  const navigate = useNavigate();

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
        setAuthToken(data?.data?.token);
        setIsAuthUser(true);
      }
    },
    true
  );

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
    password: yup.string().required("Password is required"),
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<userCredType>({
    mode: "all",
    reValidateMode: "onChange",
    resolver: yupResolver(LoginSchema),
  });

  const onSubmit = async (data: userCredType) => {
    const userCred = { email: data?.email, password: data?.password };
    getLogin.mutate({ url: POST.LOGIN, payload: userCred });
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
            error={!!errors.email}
            helperText={errors.email?.message}
          />

          <TextField
            {...register("password")}
            fullWidth
            label="Password"
            placeholder="@Demo1234"
            required
            isPasswordField
            error={!!errors.password}
            helperText={errors.password?.message}
          />
          {!getLogin.isPending && !getLogin.isSuccess ? (
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
          ) : (
            <ProgressBar />
          )}

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
            Login with
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
              OTP
            </Link>
          </Typography>
        </form>
      </Box>
    </LoginFlowLayout>
  );
}

export default Login;
