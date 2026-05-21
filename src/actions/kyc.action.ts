"use server";

import { getValidAccessToken } from "@/actions/auth.action";
import { redirect } from "next/navigation";
import type { ActionResult } from "@/types/auth.type";
import type {
  AcceptInviteBody,
  AcceptInviteResponse,
  InviteAdminResponse,
  PaginatedKycAdminResponse,
  ResendInviteResponse,
  VerifyInviteTokenResponse,
} from "@/types/kyc.type";

// We'll define inline interfaces for the new KYC approval since they don't exist yet in kyc.type.ts
export interface PendingKycIdentity {
  id: string;
  id_number: string;
  full_name: string;
  father_name: string;
  mother_name: string;
  date_of_birth: string;
  present_address: string;
  permanent_address: string;
  gender: string;
}

export interface PendingKycDocument {
  id: string;
  document_type: "id_front" | "id_back" | "face_front" | "face_left" | "face_right";
  url: string | null;
  uploaded_at: string;
}

export interface PendingKycSubmission {
  id: string;
  user_email: string;
  user_name: string;
  status: "pending" | "under_review" | "approved" | "rejected";
  rejection_reason: string;
  submitted_at: string;
  reviewed_at: string | null;
  identity: PendingKycIdentity;
  documents: PendingKycDocument[];
}

export interface PaginatedPendingKycResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: PendingKycSubmission[];
}

const BASE = process.env.BACKEND_BASE_URL!;

// ─── Shared authenticated fetch helper ───────────────────────────────────────

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
        "Content-Type": "application/json",
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
    const data = (await res.json()) as T;
    return { success: true, data };
  } catch {
    return { success: false, error: "Failed to parse server response." };
  }
}

// ─── Shared public (unauthenticated) fetch helper ────────────────────────────

async function publicFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<ActionResult<T>> {
  let res: Response;
  try {
    res = await fetch(`${BASE}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options.headers ?? {}),
      },
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
    const data = (await res.json()) as T;
    return { success: true, data };
  } catch {
    return { success: false, error: "Failed to parse server response." };
  }
}

// ─── 1. Get KYC admin list ────────────────────────────────────────────────────

export async function getKycAdminsAction(
  page = 1
): Promise<ActionResult<PaginatedKycAdminResponse>> {
  const query = page > 1 ? `?page=${page}` : "";
  return authedFetch<PaginatedKycAdminResponse>(`/auth/admin/kyc/${query}`);
}

// ─── 2. Send invitation ───────────────────────────────────────────────────────

export async function inviteKycAdminAction(
  email: string
): Promise<ActionResult<InviteAdminResponse>> {
  return authedFetch<InviteAdminResponse>("/auth/admin/kyc/invite/", {
    method: "POST",
    body: JSON.stringify({ email } satisfies { email: string }),
  });
}

// ─── 3. Verify invite token (public — no auth required) ──────────────────────

export async function verifyInviteTokenAction(
  token: string
): Promise<ActionResult<VerifyInviteTokenResponse>> {
  return publicFetch<VerifyInviteTokenResponse>("/auth/verify-invite-token/", {
    method: "POST",
    body: JSON.stringify({ token }),
  });
}

// ─── 4. Accept invite (public — no auth required) ────────────────────────────

export async function acceptInviteAction(
  body: AcceptInviteBody
): Promise<ActionResult<AcceptInviteResponse>> {
  return publicFetch<AcceptInviteResponse>("/auth/accept-invite/", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

// ─── 5. Resend invitation ─────────────────────────────────────────────────────

export async function resendInviteAction(
  id: string
): Promise<ActionResult<ResendInviteResponse>> {
  return authedFetch<ResendInviteResponse>(
    `/auth/admin/kyc/invite/${id}/resend/`,
    { method: "POST" }
  );
}

// ─── 6. Remove KYC admin (kept for future use) ───────────────────────────────

export async function removeKycAdminAction(
  id: string
): Promise<ActionResult<{ success: boolean }>> {
  return authedFetch<{ success: boolean }>(`/auth/admin/kyc/${id}/`, {
    method: "DELETE",
  });
}

// ─── 7. Get pending KYC submissions ──────────────────────────────────────────

export async function getPendingKycAction(
  page = 1,
  status = "under_review"
): Promise<ActionResult<PaginatedPendingKycResponse>> {
  return authedFetch<PaginatedPendingKycResponse>(`/auth/admin/kyc/pending/?page=${page}&status=${status}`);
}

// ─── 8. Review KYC submission ────────────────────────────────────────────────

export async function reviewKycAction(
  id: string,
  action: "approve" | "reject",
  reason?: string
): Promise<ActionResult<{ success: boolean; message: string; status: string }>> {
  return authedFetch<{ success: boolean; message: string; status: string }>(
    `/auth/admin/kyc/${id}/review/`,
    {
      method: "POST",
      body: JSON.stringify({ action, reason }),
    }
  );
}
