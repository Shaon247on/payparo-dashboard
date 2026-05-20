// ─── User Management Types ────────────────────────────────────────────────────

export type KycStatus = "under_review" | "rejected" | "approved" | "pending" | "not_submitted";

export type BadgeClass = "review" | "rejected" | "approved" | "pending" | "muted";

export interface User {
  id: string;
  full_name: string;
  email: string;
  kyc_status: KycStatus;
  kyc_label: string;
  badge_class: BadgeClass;
  transaction_count: number;
  is_suspended: boolean;
  date_joined: string;
  role: string;
}

export interface PaginatedUsersResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: User[];
}

// ─── Query Params ─────────────────────────────────────────────────────────────

export interface UserListParams {
  q?: string;
  status?: KycStatus | "all";
  page?: number;
}