"use server";

import { redirect } from "next/navigation";
import { apiLogin, apiRefreshToken } from "@/lib/auth/api";
import {
  clearSession,
  getSession,
  setSession,
  updateAccessToken,
} from "@/lib/auth/cookies";
import { isAccessTokenExpired, parseJwtExpiry } from "@/lib/auth/utils";
import { loginSchema } from "@/schema/authSchema";
import type { ActionResult, LoginFormValues, Session } from "@/types/auth.type";

// ─── Role → redirect map ──────────────────────────────────────────────────────

const ROLE_REDIRECT: Record<string, string> = {
  admin: "/dashboard",
  kyc: "/kyc",
  affiliate: "/affiliate",
};

const DEFAULT_REDIRECT = "/dashboard";

// ─── Login ────────────────────────────────────────────────────────────────────

export async function loginAction(
  formData: LoginFormValues
): Promise<ActionResult<{ redirectTo: string }>> {
  // 1. Validate with Zod on the server (defense-in-depth)
  const parsed = loginSchema.safeParse(formData);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error?.message ?? "Invalid input.",
    };
  }

  // 2. Call the backend
  const result = await apiLogin(parsed.data);
  if (!result.ok) {
    return { success: false, error: result.error };
  }

  const { access, refresh, kyc_status, user } = result.data;

  // 3. Build and persist the encrypted session cookie
  const session: Session = {
    accessToken: access,
    refreshToken: refresh,
    user,
    kycStatus: kyc_status,
    accessTokenExpiresAt: parseJwtExpiry(access),
  };
  await setSession(session);

  const redirectTo = ROLE_REDIRECT[user.role] ?? DEFAULT_REDIRECT;

  return { success: true, data: { redirectTo } };
}

// ─── Logout ───────────────────────────────────────────────────────────────────

export async function logoutAction(): Promise<void> {
  await clearSession();
  redirect("/login");
}

// ─── Get current session (safe to call from RSC / server actions) ─────────────

export async function getSessionAction(): Promise<Session | null> {
  return getSession();
}

// ─── Refresh access token ─────────────────────────────────────────────────────

export async function refreshAccessTokenAction(): Promise<
  ActionResult<{ accessToken: string }>
> {
  const session = await getSession();
  if (!session) {
    return { success: false, error: "No active session." };
  }

  const result = await apiRefreshToken({ refresh: session.refreshToken });
  if (!result.ok) {
    // Refresh token itself is invalid/expired — force logout
    await clearSession();
    return { success: false, error: "Session expired. Please log in again." };
  }

  const newAccessToken = result.data.access;
  const expiresAt = parseJwtExpiry(newAccessToken);
  await updateAccessToken(newAccessToken, expiresAt);

  return { success: true, data: { accessToken: newAccessToken } };
}

// ─── Get a valid access token (auto-refreshes if needed) ─────────────────────
//
// Use this helper inside any server action that needs to call a protected
// backend endpoint.  It handles the refresh transparently.
//
//   const token = await getValidAccessToken();
//   if (!token) redirect("/login");
//   const data = await apiAuthFetch("/some/endpoint", token);

export async function getValidAccessToken(): Promise<string | null> {
  const session = await getSession();
  if (!session) return null;

  if (!isAccessTokenExpired(session)) {
    return session.accessToken;
  }

  // Try to refresh
  const refreshResult = await refreshAccessTokenAction();
  if (!refreshResult.success) return null;

  return refreshResult.data.accessToken;
}