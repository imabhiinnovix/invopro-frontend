export interface sendOTPPayload {
  email: string;
}
export interface sendOTPResponse {
  message: string;
  success: boolean;
}
export interface verifyOTPPayload {
  email: string;
  otp: string;
}
export interface verifyOTPResponse {
  message: string;
  success: boolean;
  data: { token: string };
}
