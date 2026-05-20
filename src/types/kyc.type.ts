// ─── Admin / KYC Team Types ───────────────────────────────────────────────────

export type AdminRole = "kyc" | "admin" | "super_admin";
export type AdminStatus = "pending" | "active" | "inactive";

export interface KycAdmin {
  id: string;
  email: string;
  name: string;
  role: AdminRole;
  status: AdminStatus;
  issue_resolved_count: number;
}

export interface PaginatedKycAdminResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: KycAdmin[];
}

// ─── Invite ───────────────────────────────────────────────────────────────────

export interface InviteAdminBody {
  email: string;
}

export interface InviteAdminResponse {
  success: boolean;
  message: string;
}

// ─── Verify Token ─────────────────────────────────────────────────────────────

export interface VerifyInviteTokenBody {
  token: string;
}

export interface VerifyInviteTokenResponse {
  success: boolean;
  email: string;
  role: AdminRole;
}

// ─── Accept Invite ────────────────────────────────────────────────────────────

export interface AcceptInviteBody {
  token: string;
  full_name: string;
  password: string;
}

export interface AcceptInviteResponse {
  success: boolean;
  message: string;
}

// ─── Resend Invite ────────────────────────────────────────────────────────────

export interface ResendInviteResponse {
  success: boolean;
  message: string;
}