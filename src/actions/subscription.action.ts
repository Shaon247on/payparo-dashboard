"use server";

import { getValidAccessToken } from "@/actions/auth.action";
import { redirect } from "next/navigation";
import type { ActionResult } from "@/types/auth.type";

const BASE_URL = process.env.BACKEND_BASE_URL ?? "http://localhost:8000/api";

export interface SubscriptionDetail {
  plan: "monthly" | "yearly";
  active_until: string;
  is_active: boolean;
}

export interface SubscriptionStatus {
  is_subscribed: boolean;
  created_escrow_count: number;
  subscription: SubscriptionDetail | null;
}

export interface CheckoutSessionResult {
  checkout_url: string;
  session_id: string;
}

export async function getSubscriptionStatusAction(): Promise<ActionResult<SubscriptionStatus>> {
  const token = await getValidAccessToken();
  if (!token) redirect("/login");

  let res: Response;
  try {
    res = await fetch(`${BASE_URL}/profile/wallet/subscription/status/`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });
  } catch {
    return { success: false, error: "Network error — could not reach the server." };
  }

  if (!res.ok) {
    return { success: false, error: `Failed to fetch subscription status (${res.status})` };
  }

  try {
    const data = await res.json();
    return { success: true, data };
  } catch {
    return { success: false, error: "Failed to parse response." };
  }
}

export async function createSubscriptionSessionAction(
  plan: "monthly" | "yearly"
): Promise<ActionResult<CheckoutSessionResult>> {
  const token = await getValidAccessToken();
  if (!token) redirect("/login");

  let res: Response;
  try {
    res = await fetch(`${BASE_URL}/profile/wallet/subscription/session/`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ plan }),
      cache: "no-store",
    });
  } catch {
    return { success: false, error: "Network error — could not reach the server." };
  }

  if (!res.ok) {
    let errorMsg = `Failed to create checkout session (${res.status})`;
    try {
      const errorBody = await res.json();
      if (errorBody?.error) errorMsg = errorBody.error;
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
