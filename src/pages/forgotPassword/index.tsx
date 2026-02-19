import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import LoadingButton from "@mui/lab/LoadingButton";
import Link from "@mui/material/Link";
import Button from "@mui/material/Button";
import TextField from "../../components/atom/TextField";
import { LoginFlowLayout } from "../../components/atom/LoginFlowLayout";
import { useComponentTypography } from "../../hooks/useComponentTypography";
import { STYLE_GUIDE } from "../../styles";
import logo from "../../assets/logo.png";
import usePost from "../../hooks/usePost";
import ProgressBar from "../../components/molecule/progressBar";
import { MuiOtpInput } from "mui-one-time-password-input";
import useCountdown from "../../hooks/useCountdown";
import { POST } from "../../services/apiRoutes";

interface ForgotPasswordForm {
  email: string;
  otp?: string;
  newPassword?: string;
  confirmPassword?: string;
}

type Step = "SEND_EMAIL" | "RESET_PASSWORD";

const ForgotPassword = () => {
  const { getButtonSx } = useComponentTypography();
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("SEND_EMAIL");
  const [email, setEmail] = useState("");

  const { countdown, isButtonDisabled, resetCountdown } = useCountdown(60);

  const forgotPasswordSchema = yup.object().shape({
    email: yup
      .string()
      .required("Email is Required")
      .matches(
        /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
        "Invalid email address",
      )
      .max(50, "Email is too long"),
    otp: yup.string().when("$step", {
      is: "RESET_PASSWORD",
      then: (schema) =>
        schema
          .required("OTP is Required")
          .length(6, "OTP must be 6 digits long"),
      otherwise: (schema) => schema.notRequired(),
    }),
    newPassword: yup.string().when("$step", {
      is: "RESET_PASSWORD",
      then: (schema) =>
        schema
          .required("Password is required")
          .min(8, "Password must be at least 8 characters")
          .matches(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_])\S+$/,
            "Password must contain at least one uppercase, one lowercase, one number and one special character",
          ),
      otherwise: (schema) => schema.notRequired(),
    }),
    confirmPassword: yup.string().when("$step", {
      is: "RESET_PASSWORD",
      then: (schema) =>
        schema
          .required("Confirm Password is required")
          .oneOf([yup.ref("newPassword")], "Passwords must match"),
      otherwise: (schema) => schema.notRequired(),
    }),
  });

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<ForgotPasswordForm>({
    mode: "all",
    reValidateMode: "onChange",
    resolver: yupResolver(forgotPasswordSchema),
    context: { step },
  });

  const sendOTPMutation = usePost<{ email: string; type: string }, any>(
    ["sendOTP"],
    (data) => {
      if (data?.success) {
        setStep("RESET_PASSWORD");
        resetCountdown();
      }
    },
    true,
  );

  const resetPasswordMutation = usePost<any, any>(
    ["resetPassword"],
    (data) => {
      if (data?.success) {
        navigate("/login");
      }
    },
    true,
  );

  const handleResendOTP = () => {
    sendOTPMutation.mutate({
      url: POST.SEND_OTP,
      payload: {
        email: email,
        type: "reset-password",
      },
    });
    resetCountdown();
  };

  const onSubmit = (data: ForgotPasswordForm) => {
    if (step === "SEND_EMAIL") {
      setEmail(data.email);
      sendOTPMutation.mutate({
        url: POST.SEND_OTP,
        payload: {
          email: data.email,
          type: "reset-password",
        },
      });
    } else {
      resetPasswordMutation.mutate({
        url: POST.RESET_PASSWORD,
        payload: {
          email: email,
          otp: data.otp,
          newPassword: data.newPassword,
        },
      });
    }
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
            {step === "SEND_EMAIL"
              ? "Enter your email to receive an OTP"
              : "Enter the OTP to reset your password"}
          </Typography>
        </Box>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-y-5"
        >
          {step === "SEND_EMAIL" ? (
            <>
              <TextField
                {...register("email")}
                fullWidth
                size="small"
                name="email"
                autoComplete="off"
                label="Email address"
                placeholder="example@gmail.com"
                required
                error={!!errors.email}
                helperText={errors.email?.message}
              />
              {!sendOTPMutation.isPending ? (
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
                  Submit
                </LoadingButton>
              ) : (
                <ProgressBar />
              )}
            </>
          ) : (
            <>
              <Controller
                name="otp"
                control={control}
                defaultValue=""
                rules={{
                  required: "OTP is required",
                  validate: (value) =>
                    value?.length === 6 || "OTP must be 6 digits long",
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
                  </Box>
                )}
              />
              <TextField
                {...register("newPassword")}
                fullWidth
                size="small"
                name="newPassword"
                autoComplete="new-password"
                label="New Password"
                placeholder="@Demo1234"
                required
                isPasswordField
                error={!!errors.newPassword}
                helperText={errors.newPassword?.message}
              />
              <TextField
                {...register("confirmPassword")}
                fullWidth
                size="small"
                name="confirmPassword"
                autoComplete="new-password"
                label="Confirm Password"
                placeholder="@Demo1234"
                required
                isPasswordField
                error={!!errors.confirmPassword}
                helperText={errors.confirmPassword?.message}
              />
              {!resetPasswordMutation.isPending ? (
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
                  Reset Password
                </LoadingButton>
              ) : (
                <ProgressBar />
              )}
            </>
          )}

          <Typography
            sx={{
              textAlign: "center",
              fontSize: STYLE_GUIDE.TYPOGRAPHY.fontSize.base,
              marginTop: STYLE_GUIDE.SPACING.s4,
            }}
          >
            {step === "SEND_EMAIL"
              ? "Remembered your password?"
              : "Wait, I remember it!"}
            <Link
              onClick={() => navigate("/login")}
              sx={{
                marginLeft: STYLE_GUIDE.SPACING.s1,
                cursor: "pointer",
                fontWeight: STYLE_GUIDE.TYPOGRAPHY.fontWeight.bold,
                color: STYLE_GUIDE.COLORS.primary,
                fontSize: STYLE_GUIDE.TYPOGRAPHY.fontSize.base,
                textDecoration: "none",
              }}
            >
              Sign in
            </Link>
          </Typography>
        </form>
      </Box>
    </LoginFlowLayout>
  );
};

export default ForgotPassword;
