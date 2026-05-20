"use server";

import { getValidAccessToken } from "@/actions/auth.action";
import { redirect } from "next/navigation";
import type { ActionResult } from "@/types/auth.type";
import type { PasswordChangeBody, ProfileResponse } from "@/types/profile.type";

const BASE = process.env.BACKEND_BASE_URL!;

// ─── Shared authenticated fetch (JSON) ───────────────────────────────────────

async function authedFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<ActionResult<T>> {
  const token = await getValidAccessToken();
  if (!token) redirect("/login");

  let res: Response;
  try {
    res = await fetch(`${BASE}${path}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${token}`,
        ...(options.headers ?? {}),
      },
      cache: "no-store",
    });
  } catch {
    return { success: false, error: "Network error — could not reach the server." };
  }

  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const body = await res.json();
      if (typeof body?.error === "string") message = body.error;
      else if (typeof body?.detail === "string") message = body.detail;
    } catch { /* non-JSON body */ }
    return { success: false, error: message };
  }

  try {
    return { success: true, data: (await res.json()) as T };
  } catch {
    return { success: false, error: "Failed to parse server response." };
  }
}

// ─── 1. Get profile ───────────────────────────────────────────────────────────

export async function getProfileAction(): Promise<ActionResult<ProfileResponse>> {
  return authedFetch<ProfileResponse>("/administration/profile/");
}

// ─── 2. Update profile (multipart/form-data) ──────────────────────────────────
//
// The client passes a plain FormData object built from the form fields.
// We forward it directly — fetch will set the correct Content-Type boundary
// automatically when body is a FormData instance.
// IMPORTANT: Do NOT set Content-Type manually for multipart — it breaks the boundary.

export async function updateProfileAction(
  formData: FormData
): Promise<ActionResult<{ detail: string }>> {
  const token = await getValidAccessToken();
  if (!token) redirect("/login");

  let res: Response;
  try {
    res = await fetch(`${BASE}/administration/profile/update/`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        // No Content-Type here — let fetch set it with the multipart boundary
      },
      body: formData,
      cache: "no-store",
    });
  } catch {
    return { success: false, error: "Network error — could not reach the server." };
  }

  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const body = await res.json();
      if (typeof body?.error === "string") message = body.error;
      else if (typeof body?.detail === "string") message = body.detail;
    } catch { /* non-JSON body */ }
    return { success: false, error: message };
  }

  try {
    return { success: true, data: (await res.json()) as { detail: string } };
  } catch {
    return { success: false, error: "Failed to parse server response." };
  }
}

// ─── 3. Change password ───────────────────────────────────────────────────────

export async function changePasswordAction(
  body: PasswordChangeBody
): Promise<ActionResult<{ detail: string }>> {
  return authedFetch<{ detail: string }>("/administration/profile/password/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}