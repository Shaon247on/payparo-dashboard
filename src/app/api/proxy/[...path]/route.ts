/**
 * Internal API proxy — /api/proxy/[...path]
 *
 * The browser NEVER calls the backend directly.
 * Client components POST to /api/proxy/auth/login etc., and this handler
 * forwards the request to the real backend, attaching auth headers when a
 * session cookie exists.
 *
 * Why a proxy instead of Next.js middleware?
 *   • Middleware runs on the Edge runtime which has limited Node.js APIs.
 *   • A Route Handler runs in the full Node.js runtime and can use
 *     cookies(), crypto, etc. without restrictions.
 *   • We keep middleware thin (redirect-only, no token work).
 */

import { type NextRequest, NextResponse } from "next/server";
import { getSession, updateAccessToken } from "@/lib/auth/cookies";
import { apiRefreshToken } from "@/lib/auth/api";
import { isAccessTokenExpired, parseJwtExpiry } from "@/lib/auth/utils";

const BACKEND_BASE = process.env.BACKEND_BASE_URL ?? "https://api.payparo.com/api";

// Paths that do NOT need an Authorization header
const PUBLIC_PATHS = new Set(["/auth/login/", "/auth/refresh/"]);

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return proxyRequest(req, await params);
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return proxyRequest(req, await params);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return proxyRequest(req, await params);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return proxyRequest(req, await params);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return proxyRequest(req, await params);
}

async function proxyRequest(
  req: NextRequest,
  params: { path: string[] }
): Promise<NextResponse> {
  const apiPath = "/" + params.path.join("/") + "/";
  const targetUrl = `${BACKEND_BASE}${apiPath}${req.nextUrl.search}`;

  // Build forward headers — strip host to avoid conflicts
  const forwardHeaders = new Headers();
  req.headers.forEach((value, key) => {
    const k = key.toLowerCase();
    if (!["host", "connection", "content-length"].includes(k)) {
      forwardHeaders.set(key, value);
    }
  });

  // Attach Bearer token for protected routes
  if (!PUBLIC_PATHS.has(apiPath)) {
    let session = await getSession();

    if (session) {
      // Auto-refresh if access token is expiring soon
      if (isAccessTokenExpired(session)) {
        const refreshResult = await apiRefreshToken({
          refresh: session.refreshToken,
        });

        if (refreshResult.ok) {
          const newToken = refreshResult.data.access;
          const expiresAt = parseJwtExpiry(newToken);
          await updateAccessToken(newToken, expiresAt);
          forwardHeaders.set("Authorization", `Bearer ${newToken}`);
        } else {
          // Refresh failed — return 401 so client can redirect to login
          return NextResponse.json(
            { error: "Session expired. Please log in again." },
            { status: 401 }
          );
        }
      } else {
        forwardHeaders.set("Authorization", `Bearer ${session.accessToken}`);
      }
    }
  }

  let body: BodyInit | undefined;
  const contentType = req.headers.get("content-type") ?? "";
  if (["POST", "PUT", "PATCH"].includes(req.method)) {
    if (contentType.includes("application/json")) {
      body = await req.text();
    } else if (contentType.includes("multipart/form-data")) {
      const incomingForm = await req.formData();
      const outgoingForm = new FormData();
      incomingForm.forEach((value, key) => {
        outgoingForm.append(key, value);
      });
      body = outgoingForm;
      forwardHeaders.delete("content-type");
    } else {
      body = await req.blob();
    }
  }

  let backendRes: Response;
  try {
    backendRes = await fetch(targetUrl, {
      method: req.method,
      headers: forwardHeaders,
      body,
      // Do not follow redirects — pass them through
      redirect: "manual",
    });
  } catch {
    return NextResponse.json(
      { error: "Could not reach the upstream server." },
      { status: 502 }
    );
  }

  const responseBody = await backendRes.arrayBuffer();
  const responseHeaders = new Headers();
  backendRes.headers.forEach((value, key) => {
    // Don't forward set-cookie from backend — we manage cookies ourselves
    if (!["set-cookie", "transfer-encoding"].includes(key.toLowerCase())) {
      responseHeaders.set(key, value);
    }
  });

  return new NextResponse(responseBody, {
    status: backendRes.status,
    headers: responseHeaders,
  });
}