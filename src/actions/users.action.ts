"use server";

import { getValidAccessToken } from "@/actions/auth.action";
import { redirect } from "next/navigation";
import type { PaginatedUsersResponse, UserListParams } from "@/types/users.type";
import type { ActionResult } from "@/types/auth.type";

export async function getUsersAction(
  params: UserListParams
): Promise<ActionResult<PaginatedUsersResponse>> {
  const token = await getValidAccessToken();
  if (!token) redirect("/login");

  const searchParams = new URLSearchParams();
  if (params.q?.trim()) searchParams.set("q", params.q.trim());
  if (params.status && params.status !== "all")
    searchParams.set("status", params.status);
  if (params.page && params.page > 1)
    searchParams.set("page", String(params.page));

  const query = searchParams.toString();
  const url = `${process.env.BACKEND_BASE_URL}/administration/users/${
    query ? `?${query}` : ""
  }`;

  let res: Response;
  try {
    res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });
  } catch {
    return {
      success: false,
      error: "Network error — could not reach the server.",
    };
  }

  if (!res.ok) {
    // Try to parse the API error body; fall back gracefully
    let message = `Request failed with status ${res.status}`;
    try {
      const body = await res.json();
      if (typeof body?.error === "string") message = body.error;
      else if (typeof body?.detail === "string") message = body.detail;
    } catch {
      // response body wasn't JSON — keep the status message
    }
    return { success: false, error: message };
  }

  try {
    const data = (await res.json()) as PaginatedUsersResponse;
    return { success: true, data };
  } catch {
    return { success: false, error: "Failed to parse server response." };
  }
}