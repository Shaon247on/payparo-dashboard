// ─── User Management Types ────────────────────────────────────────────────────

export type KycStatus = "under_review" | "rejected" | "approved" | "pending";

export type BadgeClass = "review" | "rejected" | "approved" | "pending";

export interface User {
  id: string;
  full_name: string;
  email: string;
  kyc_status: KycStatus;
  kyc_label: string;
  badge_class: BadgeClass;
  transaction_count: number;
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