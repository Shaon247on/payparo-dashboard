"use server";

import { cookies } from "next/headers";
import type { ActionResult } from "@/types/auth.type";
import type {
  ForgotPasswordResponse,
  ResendOtpResponse,
  SetNewPasswordResponse,
  VerifyOtpResponse,
} from "@/types/passwordReset.type";
import { redirect } from "next/navigation";

const BASE = process.env.BACKEND_BASE_URL!;

// ─── Cookie names ─────────────────────────────────────────────────────────────
// Short-lived, HttpOnly — never readable by client JS.
// These are temporary flow tokens, not session tokens.

const PASS_RESET_TOKEN_COOKIE = "pp_prt"; // passResetToken (step 1 & 2)
const PASS_RESET_VERIFIED_COOKIE = "pp_prv"; // passwordResetVerified (step 3)

// 10-minute TTL matches the typical OTP window
const FLOW_COOKIE_MAX_AGE = 60 * 10;

// ─── Shared public fetch ──────────────────────────────────────────────────────

async function publicFetch<T>(
  path: string,
  body: Record<string, string>,
): Promise<ActionResult<T>> {
  let res: Response;
  try {
    res = await fetch(`${BASE}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch {
    return {
      success: false,
      error: "Network error — could not reach the server.",
    };
  }

  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const b = await res.json();
      if (typeof b?.error === "string") message = b.error;
      else if (typeof b?.detail === "string") message = b.detail;
      else if (typeof b?.message === "string") message = b.message;
    } catch {
      /* non-JSON */
    }
    return { success: false, error: message };
  }

  try {
    return { success: true, data: (await res.json()) as T };
  } catch {
    return { success: false, error: "Failed to parse server response." };
  }
}

// ─── 1. Forgot password — send OTP ───────────────────────────────────────────

export async function forgotPasswordAction(
  email: string,
): Promise<ActionResult<{ message: string }>> {
  const result = await publicFetch<ForgotPasswordResponse>(
    "/auth/forgot-password/",
    { email },
  );

  if (!result.success) return { success: false, error: result.error };

  // Store the passResetToken in a short-lived HttpOnly cookie
  // so the OTP page can read it without exposing it to the browser
  const cookieStore = await cookies();
  cookieStore.set(PASS_RESET_TOKEN_COOKIE, result.data.passResetToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: FLOW_COOKIE_MAX_AGE,
  });

  return { success: true, data: { message: result.data.message } };
}

// ─── 2. Resend OTP ────────────────────────────────────────────────────────────

export async function resendOtpAction(): Promise<
  ActionResult<{ message: string }>
> {
  const cookieStore = await cookies();
  const passResetToken = cookieStore.get(PASS_RESET_TOKEN_COOKIE)?.value;

  if (!passResetToken) {
    return {
      success: false,
      error: "Reset session expired. Please request a new reset code.",
    };
  }

  const result = await publicFetch<ResendOtpResponse>(
    "/auth/forgot-password/resend-otp/",
    { passResetToken },
  );

  if (!result.success) return { success: false, error: result.error };

  // Backend issues a new token on resend — update the cookie
  cookieStore.set(PASS_RESET_TOKEN_COOKIE, result.data.passResetToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: FLOW_COOKIE_MAX_AGE,
  });

  return { success: true, data: { message: result.data.message } };
}

// ─── 3. Verify OTP ────────────────────────────────────────────────────────────

export async function verifyOtpAction(
  otp: string,
): Promise<ActionResult<{ message: string }>> {
  const cookieStore = await cookies();
  const passResetToken = cookieStore.get(PASS_RESET_TOKEN_COOKIE)?.value;

  if (!passResetToken) {
    return {
      success: false,
      error: "Reset session expired. Please request a new reset code.",
    };
  }

  const result = await publicFetch<VerifyOtpResponse>(
    "/auth/forgot-password/verify-otp/",
    { otp, passResetToken },
  );

  if (!result.success) return { success: false, error: result.error };

  // OTP verified — swap passResetToken cookie for the verified token
  // and clear the now-spent passResetToken
  cookieStore.delete(PASS_RESET_TOKEN_COOKIE);
  cookieStore.set(
    PASS_RESET_VERIFIED_COOKIE,
    result.data.passwordResetVerified,
    {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: FLOW_COOKIE_MAX_AGE,
    },
  );

  return { success: true, data: { message: result.data.message } };
}

// ─── 4. Set new password ──────────────────────────────────────────────────────

export async function setNewPasswordAction(
  newPassword: string,
): Promise<ActionResult<{ message: string }>> {
  const cookieStore = await cookies();
  const passwordResetVerified = cookieStore.get(
    PASS_RESET_VERIFIED_COOKIE,
  )?.value;

  if (!passwordResetVerified) {
    return {
      success: false,
      error: "Verification expired. Please restart the reset process.",
    };
  }

  const result = await publicFetch<SetNewPasswordResponse>(
    "/auth/forgot-password/set/",
    { passwordResetVerified, new_password: newPassword },
  );

  if (!result.success) {
    
    return { success: false, error: result.error };
  }

  // Flow complete — clear the verified token cookie
  cookieStore.delete(PASS_RESET_VERIFIED_COOKIE);

  return { success: true, data: { message: result.data.message } };
}
