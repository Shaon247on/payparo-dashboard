"use server";

import { getValidAccessToken } from "@/actions/auth.action";
import { redirect } from "next/navigation";
import type { PaginatedUsersResponse, UserListParams } from "@/types/users.type";
import type { ActionResult } from "@/types/auth.type";

const BASE_URL = process.env.BACKEND_BASE_URL ?? "http://localhost:8000/api";

async function adminFetch<T>(
  path: string,
  token: string,
  init?: RequestInit
): Promise<ActionResult<T>> {
  let res: Response;
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
      ...init,
    });
  } catch {
    return { success: false, error: "Network error — could not reach the server." };
  }

  if (!res.ok) {
    let message = `Request failed with status ${res.status}`;
    try {
      const body = await res.json();
      if (typeof body?.detail === "string") message = body.detail;
      else if (typeof body?.error === "string") message = body.error;
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

export async function getUsersAction(
  params: UserListParams
): Promise<ActionResult<PaginatedUsersResponse>> {
  const token = await getValidAccessToken();
  if (!token) redirect("/login");

  const searchParams = new URLSearchParams();
  if (params.q?.trim()) searchParams.set("q", params.q.trim());
  if (params.status && params.status !== "all") searchParams.set("status", params.status);
  if (params.page && params.page > 1) searchParams.set("page", String(params.page));

  const query = searchParams.toString();
  const path = `/administration/users/${query ? `?${query}` : ""}`;

  return adminFetch<PaginatedUsersResponse>(path, token);
}

export async function suspendUserAction(
  userId: string,
  suspend: boolean
): Promise<ActionResult<{ detail: string; is_suspended: boolean }>> {
  const token = await getValidAccessToken();
  if (!token) redirect("/login");

  return adminFetch(
    `/administration/users/${userId}/suspend/`,
    token,
    {
      method: "PATCH",
      body: JSON.stringify({ suspend }),
    }
  );
}