"use server";

import { getValidAccessToken } from "@/actions/auth.action";
import { redirect } from "next/navigation";
import type { ActionResult } from "@/types/auth.type";
import { ConversationMessagesParams, PaginatedConversationMessagesResponse } from "@/types/kyc/messaging.type";

const BASE = process.env.BACKEND_BASE_URL!;


// ─── Shared authenticated fetch ───────────────────────────────────────────────

async function authedFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<ActionResult<T>> {
  const token = await getValidAccessToken();

  if (!token) {
    redirect("/login");
  }

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
    return {
      success: false,
      error: "Network error — could not reach the server.",
    };
  }

  if (!res.ok) {
    let message = `Request failed (${res.status})`;

    try {
      const body = await res.json();

      if (typeof body?.error === "string") {
        message = body.error;
      } else if (typeof body?.detail === "string") {
        message = body.detail;
      }
    } catch {
      // non-json
    }

    return {
      success: false,
      error: message,
    };
  }

  try {
    return {
      success: true,
      data: (await res.json()) as T,
    };
  } catch {
    return {
      success: false,
      error: "Failed to parse server response.",
    };
  }
}

// ─── Build query ──────────────────────────────────────────────────────────────

function buildQuery(
  params: Record<string, string | number | undefined>
): string {
  const sp = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "" && value !== null) {
      sp.set(key, String(value));
    }
  }

  const qs = sp.toString();

  return qs ? `?${qs}` : "";
}

// ─── Get conversation messages ────────────────────────────────────────────────

export async function getConversationMessagesAction(
  conversationId: string,
  params: ConversationMessagesParams = {}
): Promise<ActionResult<PaginatedConversationMessagesResponse>> {
  const query = buildQuery({
    ...(params.page && params.page > 1
      ? { page: params.page }
      : {}),
  });

  return authedFetch<PaginatedConversationMessagesResponse>(
    `/messaging/conversations/${conversationId}/messages/${query}`
  );
}