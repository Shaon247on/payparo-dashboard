"use server";

import { getValidAccessToken } from "@/actions/auth.action";
import { redirect } from "next/navigation";
import type { ActionResult } from "@/types/auth.type";
import type { EscrowDetail, PaginatedEscrowResponse } from "@/types/escrow.type";

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
    } catch { /* non-JSON body */ }
    return { success: false, error: message };
  }

  try {
    return { success: true, data: (await res.json()) as T };
  } catch {
    return { success: false, error: "Failed to parse server response." };
  }
}

// ─── 1. Escrow list ───────────────────────────────────────────────────────────

export async function getEscrowListAction(
  page = 1
): Promise<ActionResult<PaginatedEscrowResponse>> {
  const query = page > 1 ? `?page=${page}` : "";
  return authedFetch<PaginatedEscrowResponse>(`/administration/escrows/${query}`);
}

// ─── 2. Escrow detail ─────────────────────────────────────────────────────────

export async function getEscrowDetailAction(
  id: string
): Promise<ActionResult<EscrowDetail>> {
  return authedFetch<EscrowDetail>(`/administration/escrows/${id}/`);
}

// ─── 3. Admin action (pause / refund / any future action) ────────────────────
//
// The backend drives which actions are available via `admin_actions[]`.
// We send the action string back so one generic function handles all of them.

export async function triggerEscrowAdminAction(
  escrowId: string,
  action: string
): Promise<ActionResult<{ success: boolean; message?: string }>> {
  return authedFetch(`/administration/escrows/${escrowId}/actions/`, {
    method: "POST",
    body: JSON.stringify({ action }),
  });
}