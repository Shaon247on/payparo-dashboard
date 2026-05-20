"use server";

import { getValidAccessToken } from "@/actions/auth.action";
import { redirect } from "next/navigation";
import type { ActionResult } from "@/types/auth.type";
import type {
  AssignDisputeResponse,
  AssignedDisputeParams,
  DisputeDetailResponse,
  PaginatedAssignedDisputeResponse,
  PaginatedUnassignedDisputeResponse,
  UnassignedDisputeParams,
} from "@/types/kyc/dispute.type";

const BASE = process.env.BACKEND_BASE_URL!;

// ─── Shared authenticated fetch ───────────────────────────────────────────────

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
    } catch { /* non-JSON */ }
    return { success: false, error: message };
  }

  try {
    return { success: true, data: (await res.json()) as T };
  } catch {
    return { success: false, error: "Failed to parse server response." };
  }
}

// ─── Build query string ───────────────────────────────────────────────────────

function buildQuery(params: Record<string, string | number | undefined>): string {
  const sp = new URLSearchParams();
  for (const [key, val] of Object.entries(params)) {
    if (val !== undefined && val !== "" && val !== null) {
      sp.set(key, String(val));
    }
  }
  const qs = sp.toString();
  return qs ? `?${qs}` : "";
}

// ─── 1. Get unassigned disputes ───────────────────────────────────────────────

export async function getUnassignedDisputesAction(
  params: UnassignedDisputeParams = {}
): Promise<ActionResult<PaginatedUnassignedDisputeResponse>> {
  const query = buildQuery({
    ...(params.status ? { status: params.status } : {}),
    ...(params.min_confidence !== undefined ? { min_confidence: params.min_confidence } : {}),
    ...(params.max_confidence !== undefined ? { max_confidence: params.max_confidence } : {}),
    ...(params.q? { q: params.q} : {}),
    ...(params.page && params.page > 1 ? { page: params.page } : {}),
  });

  return authedFetch<PaginatedUnassignedDisputeResponse>(`/kyc/disputes/unassigned/${query}`);
}

// ─── 2. Get assigned disputes ─────────────────────────────────────────────────

export async function getAssignedDisputesAction(
  params: AssignedDisputeParams = {}
): Promise<ActionResult<PaginatedAssignedDisputeResponse>> {
  const query = buildQuery({
    ...(params.status ? { status: params.status } : {}),
    ...(params.min_confidence !== undefined ? { min_confidence: params.min_confidence } : {}),
    ...(params.max_confidence !== undefined ? { max_confidence: params.max_confidence } : {}),
    ...(params.q? { q: params.q} : {}),
    ...(params.page && params.page > 1 ? { page: params.page } : {}),
  });

  return authedFetch<PaginatedAssignedDisputeResponse>(`/kyc/disputes/assigned/${query}`);
}

// ─── 3. Assign dispute to self ────────────────────────────────────────────────

export async function assignDisputeAction(
  id: string
): Promise<ActionResult<AssignDisputeResponse>> {
  return authedFetch<AssignDisputeResponse>(`/kyc/disputes/${id}/assign/`, {
    method: "POST",
  });
}

// ─── 4. Get assigned dispute detail ──────────────────────────────────────────

export async function getDisputeDetailAction(
  id: string
): Promise<ActionResult<DisputeDetailResponse>> {
  return authedFetch<DisputeDetailResponse>(`/kyc/disputes/assigned/${id}/`);
}