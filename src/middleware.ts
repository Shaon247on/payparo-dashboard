import { type NextRequest, NextResponse } from "next/server";

const SESSION_COOKIE = "pp_session";
const ROLE_COOKIE = "pp_role";

// All paths that require a session
const PROTECTED_PATHS = ["/dashboard", "/kyc"];

// Auth pages — logged-in users should not see these
const AUTH_PATHS = ["/login", "/register"];

// Role → home path (used for wrong-role redirects and logged-in auth redirect)
const ROLE_HOME: Record<string, string> = {
  admin: "/dashboard",
  kyc: "/kyc",
};

// Routes only specific roles may access
const ROLE_RESTRICTED: { path: string; allowedRoles: string[] }[] = [
  { path: "/dashboard", allowedRoles: ["admin"] },
  { path: "/kyc", allowedRoles: ["kyc"] },
];

function matchesPath(pathname: string, base: string) {
  return pathname === base || pathname.startsWith(base + "/");
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const hasSession = req.cookies.has(SESSION_COOKIE);
  const role = req.cookies.get(ROLE_COOKIE)?.value ?? "";
  const hasPRT = req.cookies.has("pp_prt"); // passResetToken
  const hasPRV = req.cookies.has("pp_prv");
  // ── 1. No session → /login ───────────────────────────────────────────────
  const isProtected = PROTECTED_PATHS.some((p) => matchesPath(pathname, p));
  if (isProtected && !hasSession) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(url);
  }

  // ── 2. Wrong role → redirect to own home ─────────────────────────────────
  if (hasSession && role) {
    const restricted = ROLE_RESTRICTED.find((r) =>
      matchesPath(pathname, r.path),
    );
    if (restricted && !restricted.allowedRoles.includes(role)) {
      const url = req.nextUrl.clone();
      url.pathname = ROLE_HOME[role] ?? "/login";
      url.search = "";
      return NextResponse.redirect(url);
    }
  }

  if (matchesPath(pathname, "/otp-verification") && !hasPRT) {
    const url = req.nextUrl.clone();
    url.pathname = "/forgot-password";
    url.search = "";
    return NextResponse.redirect(url);
  }

  if (matchesPath(pathname, "/new-password") && !hasPRV) {
    const url = req.nextUrl.clone();
    url.pathname = "/forgot-password";
    url.search = "";
    return NextResponse.redirect(url);
  }

  // ── 3. Already logged in → skip auth pages ───────────────────────────────
  const isAuthPage = AUTH_PATHS.some((p) => matchesPath(pathname, p));
  if (isAuthPage && hasSession) {
    const url = req.nextUrl.clone();
    url.pathname = ROLE_HOME[role] ?? "/dashboard";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/proxy).*)"],
};
