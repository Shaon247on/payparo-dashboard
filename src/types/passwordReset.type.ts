// ─── Forgot Password ─────────────────────────────────────────────────────────

export interface ForgotPasswordResponse {
  success: boolean;
  message: string;
  user: { id: string; email: string };
  passResetToken: string;
}

// ─── Resend OTP ───────────────────────────────────────────────────────────────

export interface ResendOtpResponse {
  success: boolean;
  message: string;
  passResetToken: string;
}

// ─── Verify OTP ───────────────────────────────────────────────────────────────

export interface VerifyOtpResponse {
  success: boolean;
  message: string;
  passwordResetVerified: string;
}

// ─── Set New Password ─────────────────────────────────────────────────────────

export interface SetNewPasswordResponse {
  success: boolean;
  message: string;
}