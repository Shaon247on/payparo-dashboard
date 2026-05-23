"use server";

import { getValidAccessToken } from "@/actions/auth.action";
import { redirect } from "next/navigation";
import type { ActionResult } from "@/types/auth.type";

const BASE_URL = process.env.BACKEND_BASE_URL ?? "http://localhost:8000/api";

export interface MarketingBanner {
  id: string;
  title: string | null;
  image: string;
  image_url: string | null;
  link: string | null;
  created_at: string;
  updated_at: string;
}

export async function getMarketingBannersAction(): Promise<ActionResult<MarketingBanner[]>> {
  const token = await getValidAccessToken();
  if (!token) redirect("/login");

  let res: Response;
  try {
    res = await fetch(`${BASE_URL}/administration/marketing/`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });
  } catch {
    return { success: false, error: "Network error — could not reach the server." };
  }

  if (!res.ok) {
    return { success: false, error: `Failed to fetch banners (${res.status})` };
  }

  try {
    const data = await res.json();
    return { success: true, data };
  } catch {
    return { success: false, error: "Failed to parse response." };
  }
}

export async function createMarketingBannerAction(
  formData: FormData
): Promise<ActionResult<MarketingBanner>> {
  const token = await getValidAccessToken();
  if (!token) redirect("/login");

  let res: Response;
  try {
    res = await fetch(`${BASE_URL}/administration/marketing/`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        // Note: DO NOT set Content-Type header here for multipart uploads!
      },
      body: formData,
      cache: "no-store",
    });
  } catch {
    return { success: false, error: "Network error — could not reach the server." };
  }

  if (!res.ok) {
    let errorMsg = `Failed to create banner (${res.status})`;
    try {
      const errorBody = await res.json();
      if (errorBody?.detail) errorMsg = errorBody.detail;
      else if (errorBody?.image) errorMsg = "Invalid image file.";
    } catch {}
    return { success: false, error: errorMsg };
  }

  try {
    const data = await res.json();
    return { success: true, data };
  } catch {
    return { success: false, error: "Failed to parse response." };
  }
}

export async function deleteMarketingBannerAction(
  id: string
): Promise<ActionResult<{ success: boolean }>> {
  const token = await getValidAccessToken();
  if (!token) redirect("/login");

  let res: Response;
  try {
    res = await fetch(`${BASE_URL}/administration/marketing/${id}/`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });
  } catch {
    return { success: false, error: "Network error — could not reach the server." };
  }

  if (!res.ok) {
    return { success: false, error: `Failed to delete banner (${res.status})` };
  }

  return { success: true, data: { success: true } };
}
