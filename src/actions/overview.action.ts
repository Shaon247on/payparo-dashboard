"use server";

import { getValidAccessToken } from "@/actions/auth.action";
import { redirect } from "next/navigation";
import type { ActionResult } from "@/types/auth.type";
import type { OverviewData } from "@/types/overview.type";

const BASE = (process.env.BACKEND_BASE_URL ?? "http://localhost:8000/api").replace(/\/api$/, "");

async function adminFetch<T>(path: string, token: string): Promise<ActionResult<T>> {
  let res: Response;
  try {
    res = await fetch(`${BASE}${path}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
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
      if (typeof body?.detail === "string") message = body.detail;
    } catch {}
    return { success: false, error: message };
  }

  try {
    const data = (await res.json()) as T;
    return { success: true, data };
  } catch {
    return { success: false, error: "Failed to parse response." };
  }
}

export async function getOverviewStatsAction(): Promise<ActionResult<OverviewData>> {
  const token = await getValidAccessToken();
  if (!token) redirect("/login");
  return adminFetch<OverviewData>("/api/administration/overview/", token);
}
