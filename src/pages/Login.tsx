import React, { useState, useRef, useEffect } from "react";
import usePost from "../hooks/usePost";
import { POST } from "../services/apiRoutes";
import { setAuthToken } from "../utils/handleLocalStorage";
import { useContext } from "react";
import { AuthContext, AuthContextType } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

type AuthMethod = "password" | "otp";
type OtpStep    = 1 | 2;

// type LoginProps = {
//   onLogin: () => void;
// };

interface LoginPayload {
  email: string;
  password: string;
}

interface VerifyOtpPayload {
  email: string;
  otp: string;
}

interface LoginResponse {
  success: boolean;
  message: string;
  code?: string;
  data: {
    token: string;
  };
}

interface SendOtpPayload {
  email: string;
}

interface SendOtpResponse {
  success: boolean;
  message: string;
}


export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [method,    setMethod]    = useState<AuthMethod>("password");
  const [otpStep,   setOtpStep]   = useState<OtpStep>(1);
  const [email,     setEmail]     = useState("");
  const [password,  setPassword]  = useState("");
  const [showPw,    setShowPw]    = useState(false);
  const [otp,       setOtp]       = useState<string[]>(["","","","","",""]);
  const [timer,     setTimer]     = useState(0);
  const [loading,   setLoading]   = useState(false);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  const { setIsAuthUser } = useContext(AuthContext) as AuthContextType;

  const [errors, setErrors] = useState({
  email: "",
  password: "",
  otp: "",
});

  const navigate = useNavigate();

const validateEmail = (email: string) => {
  if (!email.trim()) return "Email is Required";

  const regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;

  if (!regex.test(email)) return "Invalid email address";

  if (email.length > 50) return "Email is too long";

  return "";
};

const validatePassword = (password: string) => {
  if (!password.trim()) return "Password is required";

  if (password.length < 8)
    return "Password must be at least 8 characters";

  const regex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_])\S+$/;

  if (!regex.test(password))
    return "Must contain uppercase, lowercase, number & special character";

  return "";
};

const validateOtp = (otp: string[]) => {
  if (otp.join("").length !== 6)
    return "OTP must be 6 digits long";

  return "";
};

const validateForm = () => {
  const newErrors = {
    email: "",
    password: "",
    otp: "",
  };

  newErrors.email = validateEmail(email);

  if (method === "password") {
    newErrors.password = validatePassword(password);
  }

  if (method === "otp" && otpStep === 2) {
    newErrors.otp = validateOtp(otp);
  }

  setErrors(newErrors);

  return !Object.values(newErrors).some(Boolean);
};


  useEffect(() => {
    if (timer > 0) {
      const t = setTimeout(() => setTimer(t => t - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [timer]);


const loginApi = usePost<LoginPayload, LoginResponse>(
  [""],
  (data) => {
    setLoading(false);

    if (data.code === "OTP_REQUIRED") {
      setMethod("otp");
      setOtpStep(2);
      startTimer();
    } else if (data.code === "OTP_NOT_REQUIRED") {
      setAuthToken(data.data.token);
      setIsAuthUser(true);
      navigate("/home", { replace: true });
    }
  },
  true
);

const sendOtpApi = usePost<SendOtpPayload, SendOtpResponse>(
  [""],
  () => {
    setOtpStep(2);
    startTimer();
    setLoading(false);
  },
  true
);

const verifyOtpApi = usePost<VerifyOtpPayload, LoginResponse>(
  [""],
  (data) => {
    setLoading(false);
    setAuthToken(data.data.token);
    setIsAuthUser(true);
    navigate("/home", { replace: true });
  },
  true
);

  const startTimer = () => setTimer(45);
const handleSendOTP = () => {
  const emailError = validateEmail(email);

  if (emailError) {
    setErrors({
      email: emailError,
      password: "",
      otp: "",
    });
    return;
  }

  setLoading(true);

  sendOtpApi.mutate({
    url: POST.SEND_OTP,
    payload: {
      email,
    },
  });
};

  const handleOtpChange = (idx: number, val: string) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...otp];
    next[idx] = val;
    setOtp(next);
    if (val && idx < 5) otpRefs.current[idx + 1]?.focus();
    setErrors(prev => ({ ...prev, otp: "" }));
  };

const handleLogin = () => {
  if (!validateForm()) return;

  setLoading(true);

  if (method === "password") {
    loginApi.mutate({
      url: POST.LOGIN,
      payload: {
        email,
        password,
      },
    });
  } else {
    verifyOtpApi.mutate({
      url: POST.VERIFY_OTP,
      payload: {
        email,
        otp: otp.join(""),
      },
    });
  }
};

const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault();
  handleLogin();
};

  const otpFilled = otp.every(d => d !== "");
  const S = styles;

  return (
    <div style={S.wrap}>
      {/* Left panel */}
      <div style={S.left}>
        <div style={S.leftInner}>
          <div style={S.brand}>
            <div style={S.logoBox}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="white"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zm-1 1.5L18.5 9H13V3.5zM8 13h8v1.5H8V13zm0 3h8v1.5H8V16zm0-6h5v1.5H8V10z"/></svg>
            </div>
            <div style={S.brandName}><span style={{ color: "#3B2FD9" }}>InVo</span><span style={{ color: "#C4B5FD" }}>Pro</span></div>
            <div style={S.brandSub}>IP Billing Audit Platform</div>
          </div>
          {[
            { icon: <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>, title: "AI-Powered Invoice Extraction", desc: "Automatically extract and validate line items from PDF invoices" },
            { icon: <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>, title: "Smart Audit Trail", desc: "Full history of every validation, edit, and approval" },
            { icon: <path d="M11 2v20c-5.07-.5-9-4.79-9-10s3.93-9.5 9-10zm2.03 0v8.99H22c-.47-4.74-4.24-8.52-8.97-8.99zm0 11.01V22c4.74-.47 8.5-4.25 8.97-9H13.03z"/>, title: "Executive Dashboards", desc: "Real-time spend analytics and vendor benchmarking" },
          ].map((f, i) => (
            <div key={i} style={{ display: "flex", gap: 14, padding: "14px 0", borderBottom: i < 2 ? "1px solid rgba(255,255,255,.12)" : "none" }}>
              <div style={{ width: 36, height: 36, borderRadius: 8, background: "rgba(255,255,255,.12)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="white">{f.icon}</svg>
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>{f.title}</div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,.6)", marginTop: 2 }}>{f.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel */}
      <div style={S.right}>
        <div style={S.box}>
          <div style={{ fontSize: 26, fontWeight: 700, color: "#1A1D2E", letterSpacing: "-.3px", marginBottom: 4 }}>Welcome back</div>
          <div style={{ fontSize: 14, color: "#6B7280", marginBottom: 28 }}>Sign in to your InVoPro account</div>

          {/* Method tabs */}
          <div style={{ display: "flex", background: "#F1F0FB", borderRadius: 10, padding: 4, marginBottom: 28 }}>
            {(["password", "otp"] as AuthMethod[]).map(m => (
              <button key={m} onClick={() => setMethod(m)} style={{ flex: 1, textAlign: "center", padding: "9px", borderRadius: 7, cursor: "pointer", fontSize: 13, fontWeight: 600, border: "none", background: method === m ? "#fff" : "transparent", color: method === m ? "#3B2FD9" : "#6B7280", boxShadow: method === m ? "0 1px 4px rgba(0,0,0,.1)" : "none", fontFamily: "inherit", transition: "all .2s" }}>
                {m === "password" ? "Password" : "Email OTP"}
              </button>
            ))}
          </div>
            <form onSubmit={handleSubmit}>
          {/* Password form */}
          {method === "password" && (
            <div>
              <Field label="Email Address" error={errors.email}>
                <Input type="email" value={email} onChange={e => {
  setEmail(e.target.value);
  setErrors(prev => ({ ...prev, email: "" }));
}} placeholder="you@company.com" />
              </Field>
              <Field label="Password" error={errors.password}>
                <div style={{ position: "relative" }}>
                  <Input type={showPw ? "text" : "password"} value={password} onChange={e => {
  setPassword(e.target.value);
  setErrors(prev => ({ ...prev, password: "" }));
}} placeholder="Enter your password" style={{ paddingRight: 44 }} />
                  <button
                    type="button"
                    onClick={() => setShowPw(!showPw)}
                    style={{
                      position: "absolute",
                      right: 12,
                      top: "50%",
                      transform: "translateY(-50%)",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: "#6B7280",
                    }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d={showPw ? "M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46A11.804 11.804 0 001 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27z" : "M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"}/></svg>
                  </button>
                </div>
              </Field>
              
              <div style={{ textAlign: "right", marginBottom: 20 }}>
                <a href="#" style={{ fontSize: 13, color: "#3B2FD9", fontWeight: 600, textDecoration: "none" }}>Forgot password?</a>
              </div>
              <LoginBtn
  loading={loginApi.isPending}
  loadingText="Signing In..."
  onClick={handleLogin}
>
  Sign In
</LoginBtn>
            </div>
          )}

          {/* OTP form */}
          {method === "otp" && (
            <div>
              {otpStep === 1 ? (
                <>
                  <StepBar step={1} />
                  <Field label="Email Address" error={errors.email}>
                    <Input type="email" value={email} onChange={e => {
  setEmail(e.target.value);
  setErrors(prev => ({ ...prev, email: "" }));
}} placeholder="you@company.com" />
                  </Field>
                  
                 <LoginBtn
  loading={loginApi.isPending}
  loadingText="Sending OTP..."
  onClick={handleSendOTP}
>
  Send OTP to Email
</LoginBtn>
                </>
              ) : (
                <>
                  <StepBar step={2} />
                  <div style={{ background: "#EEF0FF", border: "1px solid #C7D2FE", borderRadius: 8, padding: "10px 14px", fontSize: 12, color: "#3B2FD9", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>
                    OTP sent to <strong>{email}</strong>
                  </div>
                  <Field label="Enter 6-digit OTP" error={errors.otp}>
                    <div style={{ display: "flex", gap: 10 }}>
                      {otp.map((d, i) => (
                        <input key={i} ref={el => (otpRefs.current[i] = el)} maxLength={1} value={d} inputMode="numeric"
                          onChange={e => handleOtpChange(i, e.target.value)}
                          style={{ width: 52, height: 56, textAlign: "center", fontSize: 22, fontWeight: 700, border: `1.5px solid ${d ? "#3B2FD9" : "#E4E7F0"}`, borderRadius: 10, outline: "none", background: d ? "#F0EEFF" : "#fff", fontFamily: "inherit" }}
                        />
                      ))}
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10, fontSize: 12 }}>
                      <span style={{ color: "#6B7280" }}>{timer > 0 ? `Resend in 0:${timer.toString().padStart(2,"0")}` : ""}</span>
                      <button onClick={() => {
  if (timer === 0) {
    handleSendOTP();
  }
}} disabled={timer > 0} style={{ color: "#3B2FD9", fontWeight: 600, cursor: timer > 0 ? "not-allowed" : "pointer", background: "none", border: "none", opacity: timer > 0 ? 0.4 : 1, fontFamily: "inherit", fontSize: 12 }}>Resend OTP</button>
                    </div>
                  </Field>
                  
                  <LoginBtn
  loading={verifyOtpApi.isPending}
  loadingText="Verifying OTP..."
  onClick={handleLogin}
  disabled={!otpFilled}
>
  Verify & Sign In
</LoginBtn>
                </>
              )}
            </div>
          )}
          </form>

          {/* <div style={{ textAlign: "center", color: "#6B7280", fontSize: 12, margin: "20px 0", position: "relative" }}>
            <div style={{ position: "absolute", left: 0, top: "50%", width: "100%", height: 1, background: "#E4E7F0" }} />
            <span style={{ background: "#F8F9FF", padding: "0 12px", position: "relative" }}>or continue with</span>
          </div> */}
          {/* <button style={{ width: "100%", padding: 11, border: "1.5px solid #E4E7F0", borderRadius: 10, background: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontFamily: "inherit" }}>
            <svg width="18" height="18" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
            Sign in with Google SSO
          </button> */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11, color: "#6B7280", marginTop: 20, padding: "10px 12px", background: "#F8F9FF", borderRadius: 8, border: "1px solid #E4E7F0" }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L4 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-8-3z"/></svg>
            Your session is protected with 256-bit TLS encryption
          </div>
        </div>
      </div>
    </div>
  );
};

/* ── Local sub-components ── */
const Field: React.FC<{
  label: string;
  error?: string;
  children: React.ReactNode;
}> = ({ label, error, children }) => (
  <div style={{ marginBottom: 12 }}>
    <label
      style={{
        fontSize: 11,
        fontWeight: 700,
        color: "#6B7280",
        display: "block",
        marginBottom: 6,
        textTransform: "uppercase",
        letterSpacing: "0.07em",
      }}
    >
      {label}
    </label>

    {children}

    {error && (
      <div
        style={{
          color: "#DC2626",
          fontSize: 12,
          marginTop: 4,
          lineHeight: "16px",
        }}
      >
        {error}
      </div>
    )}
  </div>
);

const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = ({ style, ...props }) => {
  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.style.borderColor = "#3B2FD9";
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.style.borderColor = "#E4E7F0";
  };

  return (
    <input
      {...props}
      onFocus={handleFocus}
      onBlur={handleBlur}
      style={{
        width: "100%",
        boxSizing: "border-box",   // 🔥 important fix
        border: "1.5px solid #E4E7F0",
        borderRadius: 10,
        padding: "12px 14px",
        fontSize: 14,
        color: "#1A1D2E",
        background: "#fff",
        outline: "none",
        fontFamily: "inherit",
        transition: "border .15s",
        ...style,
      }}
    />
  );
};

type LoginBtnProps = {
  loading: boolean;
  loadingText?: string;
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
};

const LoginBtn: React.FC<LoginBtnProps> = ({
  loading,
  loadingText = "Please wait...",
  onClick,
  disabled,
  children,
}) => (
  <button
    onClick={onClick}
    disabled={loading || disabled}
    style={{
      width: "100%",
      padding: 13,
      background: "linear-gradient(135deg,#3B2FD9,#7C4DFF)",
      color: "#fff",
      border: "none",
      borderRadius: 10,
      fontSize: 15,
      fontWeight: 700,
      cursor: (loading || disabled) ? "not-allowed" : "pointer",
      opacity: (loading || disabled) ? 0.6 : 1,
      fontFamily: "inherit",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 8
    }}
  >
    {loading ? loadingText : children}
  </button>
);

const StepBar: React.FC<{ step: 1 | 2 }> = ({ step }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
    <div style={{ width: 8, height: 8, borderRadius: "50%", background: step >= 1 ? (step > 1 ? "#16A34A" : "#3B2FD9") : "#E4E7F0" }} />
    <span style={{ fontSize: 12, color: step >= 1 ? (step > 1 ? "#16A34A" : "#3B2FD9") : "#6B7280", fontWeight: 600 }}>Step 1</span>
    <div style={{ flex: 1, height: 1, background: step > 1 ? "#16A34A" : "#E4E7F0" }} />
    <div style={{ width: 8, height: 8, borderRadius: "50%", background: step >= 2 ? "#3B2FD9" : "#E4E7F0" }} />
    <span style={{ fontSize: 12, color: step >= 2 ? "#3B2FD9" : "#6B7280", fontWeight: 600 }}>Step 2</span>
  </div>
);

const styles = {
  wrap:      { display: "flex", minHeight: "100vh", fontFamily: "'Segoe UI',system-ui,sans-serif" } as React.CSSProperties,
  left:      { width: "46%", background: "linear-gradient(145deg,#1A1060 0%,#3B2FD9 45%,#7C4DFF 100%)", display: "flex", flexDirection: "column" as const, justifyContent: "center", alignItems: "center", padding: 60, position: "relative" as const, overflow: "hidden" as const },
  leftInner: { zIndex: 1, width: "100%" },
  brand:     { textAlign: "center" as const, marginBottom: 48 },
  logoBox:   { width: 64, height: 64, background: "rgba(255,255,255,.15)", borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", backdropFilter: "blur(8px)" },
  brandName: { fontSize: 32, fontWeight: 800, letterSpacing: "-.5px" },
  brandSub:  { fontSize: 14, color: "rgba(255,255,255,.65)", marginTop: 4 },
  right:     { flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: 40, background: "#F8F9FF" },
  box:       { width: "100%", maxWidth: 440 },
};
