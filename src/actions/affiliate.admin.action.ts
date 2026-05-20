"use server";

import { getValidAccessToken } from "@/actions/auth.action";
import { redirect } from "next/navigation";
import type { ActionResult } from "@/types/auth.type";
import type {
  PaginatedAffiliateApplications,
  AdminAffiliateApplication,
  PaginatedAffiliateWithdrawals,
  AffiliateGlobalBudget,
  PaginatedFraudFlags,
} from "@/types/affiliate.type";
import type { PaginatedUserWithdrawals } from "@/types/withdrawal.type";

const BASE = (process.env.BACKEND_BASE_URL ?? "http://localhost:8000/api").replace(/\/api$/, "");

async function adminFetch<T>(
  path: string,
  token: string,
  options: RequestInit = {}
): Promise<ActionResult<T>> {
  let res: Response;
  try {
    res = await fetch(`${BASE}${path}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        ...(options.headers ?? {}),
      },
      cache: "no-store",
    });
  } catch {
    return { success: false, error: "Network error — could not reach the server." };
  }

  if (!res.ok) {
    let message = `Request failed with status ${res.status}`;
    try {
      const body = await res.json();
      if (typeof body?.error === "string") message = body.error;
      else if (typeof body?.detail === "string") message = body.detail;
    } catch {}
    return { success: false, error: message };
  }

  try {
    const data = (await res.json()) as T;
    return { success: true, data };
  } catch {
    return { success: false, error: "Failed to parse server response." };
  }
}

// ─── Affiliate Applications ───────────────────────────────────────────────────

export async function getAdminAffiliatesAction(params?: {
  status?: string;
  q?: string;
  page?: number;
}): Promise<ActionResult<PaginatedAffiliateApplications>> {
  const token = await getValidAccessToken();
  if (!token) redirect("/login");

  const sp = new URLSearchParams();
  if (params?.status && params.status !== "all") sp.set("status", params.status);
  if (params?.q?.trim()) sp.set("q", params.q.trim());
  if (params?.page && params.page > 1) sp.set("page", String(params.page));

  return adminFetch<PaginatedAffiliateApplications>(
    `/api/administration/affiliates/${sp.toString() ? `?${sp}` : ""}`,
    token
  );
}

export async function getAdminAffiliateDetailAction(
  id: string
): Promise<ActionResult<AdminAffiliateApplication>> {
  const token = await getValidAccessToken();
  if (!token) redirect("/login");
  return adminFetch<AdminAffiliateApplication>(`/api/administration/affiliates/${id}/`, token);
}

export async function updateAffiliateStatusAction(
  id: string,
  body: { status: string; slug?: string; rejection_reason?: string }
): Promise<ActionResult<{ success: boolean; status: string }>> {
  const token = await getValidAccessToken();
  if (!token) redirect("/login");
  return adminFetch(`/api/administration/affiliates/${id}/status/`, token, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

export async function addAffiliateNoteAction(
  id: string,
  content: string
): Promise<ActionResult<{ id: string; content: string }>> {
  const token = await getValidAccessToken();
  if (!token) redirect("/login");
  return adminFetch(`/api/administration/affiliates/${id}/notes/`, token, {
    method: "POST",
    body: JSON.stringify({ content }),
  });
}

// ─── Withdrawals ──────────────────────────────────────────────────────────────

export async function getAdminAffiliateWithdrawalsAction(params?: {
  status?: string;
  q?: string;
  page?: number;
}): Promise<ActionResult<PaginatedAffiliateWithdrawals>> {
  const token = await getValidAccessToken();
  if (!token) redirect("/login");

  const sp = new URLSearchParams();
  if (params?.status && params.status !== "all") sp.set("status", params.status);
  if (params?.q?.trim()) sp.set("q", params.q.trim());
  if (params?.page && params.page > 1) sp.set("page", String(params.page));

  return adminFetch<PaginatedAffiliateWithdrawals>(
    `/api/administration/affiliates/withdrawals/${sp.toString() ? `?${sp}` : ""}`,
    token
  );
}

export async function updateAffiliateWithdrawalStatusAction(
  id: string,
  body: {
    status: "approved" | "completed" | "rejected";
    rejection_reason?: string;
    transaction_ref?: string;
    admin_notes?: string;
    isr_withholding?: string;
  }
): Promise<ActionResult<{ success: boolean; status: string }>> {
  const token = await getValidAccessToken();
  if (!token) redirect("/login");
  return adminFetch(`/api/administration/affiliates/withdrawals/${id}/status/`, token, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

// ─── User Withdrawals ─────────────────────────────────────────────────────────

export async function getAdminUserWithdrawalsAction(params?: {
  status?: string;
  method?: string;
  q?: string;
  page?: number;
}): Promise<ActionResult<PaginatedUserWithdrawals>> {
  const token = await getValidAccessToken();
  if (!token) redirect("/login");

  const sp = new URLSearchParams();
  if (params?.status && params.status !== "all") sp.set("status", params.status);
  if (params?.method && params.method !== "all") sp.set("method", params.method);
  if (params?.q?.trim()) sp.set("q", params.q.trim());
  if (params?.page && params.page > 1) sp.set("page", String(params.page));

  return adminFetch<PaginatedUserWithdrawals>(
    `/api/administration/withdraw-requests/${sp.toString() ? `?${sp}` : ""}`,
    token
  );
}

export async function updateUserWithdrawalStatusAction(
  id: string,
  body: {
    status: "completed" | "failed";
    rejection_reason?: string;
  }
): Promise<ActionResult<{ success: boolean; status: string; description?: string }>> {
  const token = await getValidAccessToken();
  if (!token) redirect("/login");
  return adminFetch(`/api/administration/withdraw-requests/${id}/status/`, token, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

// ─── Global Budget ────────────────────────────────────────────────────────────

export async function getAffiliateGlobalBudgetAction(): Promise<
  ActionResult<AffiliateGlobalBudget>
> {
  const token = await getValidAccessToken();
  if (!token) redirect("/login");
  return adminFetch<AffiliateGlobalBudget>("/api/administration/affiliates/budget/", token);
}

export async function updateAffiliateGlobalBudgetAction(body: {
  monthly_cap?: string;
  rewards_paused?: boolean;
}): Promise<ActionResult<AffiliateGlobalBudget>> {
  const token = await getValidAccessToken();
  if (!token) redirect("/login");
  return adminFetch<AffiliateGlobalBudget>("/api/administration/affiliates/budget/", token, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

// ─── Fraud Flags ─────────────────────────────────────────────────────────────

export async function getAffiliateFraudFlagsAction(params?: {
  resolved?: "true" | "false";
  page?: number;
}): Promise<ActionResult<PaginatedFraudFlags>> {
  const token = await getValidAccessToken();
  if (!token) redirect("/login");

  const sp = new URLSearchParams();
  if (params?.resolved) sp.set("resolved", params.resolved);
  if (params?.page && params.page > 1) sp.set("page", String(params.page));

  return adminFetch<PaginatedFraudFlags>(
    `/api/administration/affiliates/fraud/${sp.toString() ? `?${sp}` : ""}`,
    token
  );
}

export async function resolveFraudFlagAction(
  id: string
): Promise<ActionResult<{ success: boolean }>> {
  const token = await getValidAccessToken();
  if (!token) redirect("/login");
  return adminFetch(`/api/administration/affiliates/fraud/${id}/resolve/`, token, {
    method: "PATCH",
  });
}
