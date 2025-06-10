import { useState, useEffect, useContext, useLayoutEffect } from "react";

import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import Divider from "@mui/material/Divider";
import TextField from "@mui/material/TextField";

import Typography from "@mui/material/Typography";
import LoadingButton from "@mui/lab/LoadingButton";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

import { POST } from "../../services/apiRoutes";
import { IconButton, InputAdornment } from "@mui/material";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import VisibilityIcon from "@mui/icons-material/Visibility";
import {
  clearLocalStorage,
  getAuthToken,
  setAuthToken,
  setRoleId,
} from "../../utils/handleLocalStorage";
import { roleId } from "../../utils/constants";
import { AuthContext, AuthContextType } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import usePost from "../../hooks/usePost";
import ProgressBar from "../../components/molecule/progressBar";
import logo from "../../assets/logo.png";
import { STYLE_GUIDE } from "../../styles";

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
  const { setIsAuthUser, userDetails } = useContext(
    AuthContext
  ) as AuthContextType;

  useEffect(() => {
    const token = getAuthToken();
    if (token) {
      if (userDetails?.data?.roleId === roleId?.SUPER_ADMIN) {
        navigate("/dashboard");
      } else if (userDetails?.data?.roleId === roleId?.ADMIN) {
        navigate("/dashboard");
      } else {
        navigate("/dashboard");
      }
      setRoleId(String(userDetails?.data?.roleId));
    }
  }, [userDetails]);

  const navigate = useNavigate();

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
    clearLocalStorage();
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

  const renderForm = (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-y-5">
      <Box
        display="flex"
        flexDirection="column"
        alignItems="flex-end"
        sx={{
          boxShadow: STYLE_GUIDE.SHADOWS.cardSecondary,
          padding: STYLE_GUIDE.SPACING.s8,
          borderRadius: STYLE_GUIDE.SPACING.s2,
          backgroundColor: STYLE_GUIDE.COLORS.backgroundPaper,
        }}
      >
        <TextField
          fullWidth
          label="Email address"
          placeholder="example@gmail.com"
          required
          error={!!errors.email}
          helperText={errors.email?.message}
          {...register("email")}
          sx={{ mb: STYLE_GUIDE.SPACING.s6 }}
        />

        <TextField
          fullWidth
          label="Password"
          placeholder="@Demo1234"
          type={showPassword ? "text" : "password"}
          {...register("password")}
          required
          error={!!errors.password}
          helperText={errors.password?.message}
          slotProps={{
            input: {
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                  >
                    {/* Replace with your icon logic */}
                    {showPassword ? <VisibilityIcon /> : <VisibilityOffIcon />}
                  </IconButton>
                </InputAdornment>
              ),
            },
          }}
          sx={{ mb: STYLE_GUIDE.SPACING.s6 }}
        />

        {!getLogin.isPending && !getLogin.isSuccess ? (
          <LoadingButton
            fullWidth
            size="large"
            type="submit"
            color="primary"
            variant="contained"
            sx={{ fontWeight: STYLE_GUIDE.TYPOGRAPHY.fontWeight.bold,}}
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
    <Box
      display="flex"
      alignItems="center"
      justifyContent="center"
      sx={{margin: STYLE_GUIDE.SPACING.s3}}
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
          <Box display="flex" alignItems="center" justifyContent="center"  gap={STYLE_GUIDE.SPACING.s1}>
            <Typography textAlign="center" sx={{ fontSize: STYLE_GUIDE.TYPOGRAPHY.fontSize.xxxxl, fontWeight: 400, mt:STYLE_GUIDE.SPACING.s1 }}>
              Welcome to
            </Typography>
            <Box component="img" src={logo} alt="Logo" width={250} />
          </Box>

          <Typography variant="h6" color="text.secondary" textAlign="center">
            To get started, please sign in
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
            href="/otp-login"
            sx={{
              marginLeft: STYLE_GUIDE.SPACING.s1,
              cursor: 'pointer',
              fontWeight: STYLE_GUIDE.TYPOGRAPHY.fontWeight.bold,
              color: STYLE_GUIDE.COLORS.primary,
              fontSize: STYLE_GUIDE.TYPOGRAPHY.fontSize.large,
            }}
          >
            OTP!
          </Link>
        </Typography>
      </Box>
    </Box>
  );
}

export default Login;
