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

import { useNavigate } from "react-router-dom";
import usePost from "../../hooks/usePost";
import { sendOTPPayload, sendOTPResponse } from "./types";
import ProgressBar from "../../components/molecule/progressBar";
import { STYLE_GUIDE } from "../../styles";
import logo from "../../assets/logo.png";
import { LoginFlowLayout } from "../../components/atom/LoginFlowLayout";

function SendOTP() {
  const navigate = useNavigate();

  const sendOTP = usePost<sendOTPPayload, sendOTPResponse>(
    [""],
    () => {
      const email = getValues("email");

      setTimeout(() => {
        if (email) {
          navigate("/otp-login/otp", { state: { email: email } });
        }
      }, 10);
    },
    true,
  );

  const LoginSchema = yup.object().shape({
    email: yup
      .string()
      .required("Email is Required")
      .matches(
        /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
        "Invalid email address",
      )
      .max(50, "Email is too long"),
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<{ email: string }>({
    mode: "all",
    reValidateMode: "onChange",
    resolver: yupResolver(LoginSchema),
  });

  const onSubmit = async (data: { email: string }) => {
    sendOTP?.mutate({ url: POST?.SEND_OTP, payload: data });
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
            size="small"
            name="email"
            label="Email address"
            placeholder="example@gmail.com"
            required
            error={!!errors.email}
            helperText={errors.email?.message}
            autoComplete="off"
          />

          {!sendOTP?.isPending && !sendOTP.isSuccess ? (
            <LoadingButton
              fullWidth
              size="large"
              type="submit"
              color="primary"
              variant="contained"
              sx={{ fontWeight: STYLE_GUIDE.TYPOGRAPHY.fontWeight.bold }}
            >
              Login with OTP
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
              onClick={() => navigate("/login")}
              sx={{
                marginLeft: STYLE_GUIDE.SPACING.s1,
                cursor: "pointer",
                fontWeight: STYLE_GUIDE.TYPOGRAPHY.fontWeight.bold,
                color: STYLE_GUIDE.COLORS.primary,
                fontSize: STYLE_GUIDE.TYPOGRAPHY.fontSize.large,
                textDecoration: "none",
              }}
            >
              Password
            </Link>
          </Typography>
        </form>
      </Box>
    </LoginFlowLayout>
  );
}

export default SendOTP;
