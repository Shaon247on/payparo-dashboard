export interface ApiErrorResponse {
  error: string;
}

export interface LoginRequestBody {
  email: string;
  password: string;
}

export interface AuthUser {
  role: string;
  email: string;
  full_name: string;
}

export interface LoginFormValues {
  email: string;
  password: string;
}

export interface LoginSuccessResponse {
  success: boolean;
  access: string;
  refresh: string;
  kyc_status: string;
  user: AuthUser;
}

export interface RefreshRequestBody {
  refresh: string;
}

export interface RefreshSuccessResponse {
  access: string;
}

// ─────────────────────────────────────────────
// Session stored in the encrypted cookie
// ─────────────────────────────────────────────
export interface Session {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
  kycStatus: string;
  /** Unix timestamp (ms) when access token expires */
  accessTokenExpiresAt: number;
}

// ─────────────────────────────────────────────
// Server action return shapes
// ─────────────────────────────────────────────
export type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };
