"use server";

import { getValidAccessToken } from "@/actions/auth.action";
import { redirect } from "next/navigation";
import type { ActionResult } from "@/types/auth.type";
import type {
  AffiliateDashboardData,
  AffiliateReferralLinkData,
  AffiliateTierData,
  PaginatedAffiliateRewards,
  PaginatedAffiliateAttributions,
  AffiliateWithdrawal,
} from "@/types/affiliate.type";

const BASE = (process.env.BACKEND_BASE_URL ?? "http://localhost:8000/api").replace(/\/api$/, "");

async function affiliateFetch<T>(
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

// ─── Dashboard ────────────────────────────────────────────────────────────────

export async function getAffiliateDashboardAction(): Promise<
  ActionResult<AffiliateDashboardData>
> {
  const token = await getValidAccessToken();
  if (!token) redirect("/login");
  return affiliateFetch<AffiliateDashboardData>("/api/affiliate/dashboard/", token);
}

// ─── Referral Link ────────────────────────────────────────────────────────────

export async function getAffiliateReferralLinkAction(): Promise<
  ActionResult<AffiliateReferralLinkData>
> {
  const token = await getValidAccessToken();
  if (!token) redirect("/login");
  return affiliateFetch<AffiliateReferralLinkData>("/api/affiliate/link/", token);
}

// ─── Rewards Ledger ───────────────────────────────────────────────────────────

export async function getAffiliateRewardsAction(params?: {
  state?: string;
  type?: string;
  page?: number;
}): Promise<ActionResult<PaginatedAffiliateRewards>> {
  const token = await getValidAccessToken();
  if (!token) redirect("/login");

  const sp = new URLSearchParams();
  if (params?.state && params.state !== "all") sp.set("state", params.state);
  if (params?.type && params.type !== "all") sp.set("type", params.type);
  if (params?.page && params.page > 1) sp.set("page", String(params.page));

  return affiliateFetch<PaginatedAffiliateRewards>(
    `/api/affiliate/rewards/${sp.toString() ? `?${sp}` : ""}`,
    token
  );
}

// ─── Referred Users ───────────────────────────────────────────────────────────

export async function getAffiliateReferralsAction(params?: {
  page?: number;
}): Promise<ActionResult<PaginatedAffiliateAttributions>> {
  const token = await getValidAccessToken();
  if (!token) redirect("/login");

  const sp = new URLSearchParams();
  if (params?.page && params.page > 1) sp.set("page", String(params.page));

  return affiliateFetch<PaginatedAffiliateAttributions>(
    `/api/affiliate/referrals/${sp.toString() ? `?${sp}` : ""}`,
    token
  );
}

// ─── Withdrawals ──────────────────────────────────────────────────────────────

export async function getAffiliateWithdrawalsAction(): Promise<
  ActionResult<{ count: number; results: AffiliateWithdrawal[] }>
> {
  const token = await getValidAccessToken();
  if (!token) redirect("/login");
  return affiliateFetch<{ count: number; results: AffiliateWithdrawal[] }>(
    "/api/affiliate/withdrawals/",
    token
  );
}

// ─── Tier ─────────────────────────────────────────────────────────────────────

export async function getAffiliateTierAction(): Promise<ActionResult<AffiliateTierData>> {
  const token = await getValidAccessToken();
  if (!token) redirect("/login");
  return affiliateFetch<AffiliateTierData>("/api/affiliate/tier/", token);
}
