import "server-only"
import type {
  ApiErrorResponse,
  LoginRequestBody,
  LoginSuccessResponse,
  RefreshRequestBody,
  RefreshSuccessResponse,
} from "@/types/auth.type";

const BASE_URL = process.env.BACKEND_BASE_URL ?? "http://localhost:8000";

type FetchResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string; status: number };

async function apiFetch<T>(
  path: string,
  options: RequestInit,
): Promise<FetchResult<T>> {
  let res: Response;
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options.headers ?? {}),
      },
    });
  } catch (err) {
    const error = err as { error: string };
    return {
      ok: false,
      error: error.error ?? "Network error — could not reach the server.",
      status: 0,
    };
  }

  if (!res.ok) {
    try {
      const body = (await res.json()) as ApiErrorResponse;
      return {
        ok: false,
        error: body.error ?? "An unknown error occurred.",
        status: res.status,
      };
    } catch {
      return {
        ok: false,
        error: `Server error (${res.status})`,
        status: res.status,
      };
    }
  }

  const data = (await res.json()) as T;
  return { ok: true, data };
}

export async function apiLogin(
  body: LoginRequestBody,
): Promise<FetchResult<LoginSuccessResponse>> {
  return apiFetch<LoginSuccessResponse>("/auth/login/", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function apiRefreshToken(
  body: RefreshRequestBody,
): Promise<FetchResult<RefreshSuccessResponse>> {
  return apiFetch<RefreshSuccessResponse>("/auth/refresh/", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

/**
 * Generic authenticated fetch — attaches the Bearer token.
 * Call this from server actions when hitting protected endpoints.
 */
export async function apiAuthFetch<T>(
  path: string,
  accessToken: string,
  options: RequestInit = {},
): Promise<FetchResult<T>> {
  return apiFetch<T>(path, {
    ...options,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      ...(options.headers ?? {}),
    },
  });
}
