// ─── Shared ───────────────────────────────────────────────────────────────────

export type AiStatus =
  | "favor_buyer"
  | "favor_seller"
  | "need_human_review"
  | "uncertain";

export type DisputeCurrentStatus = "pending_kyc" | "resolved";

// ─── Unassigned dispute list ──────────────────────────────────────────────────

export interface UnassignedDispute {
  id: string;
  escrow_id: string;
  order_id: string;
  product_name: string;
  escrow_price: number;
  reason: string;
  created_at: string;
  ai_status: AiStatus;
}

export interface PaginatedUnassignedDisputeResponse {
  success: boolean;
  count: number;
  next: string | null;
  previous: string | null;
  results: UnassignedDispute[];
}

// ─── Assigned dispute list ────────────────────────────────────────────────────

export interface AssignedDispute {
  id: string;
  kyc_name: string;
  transaction_id: string;
  claim_type: string;
  escrow_amount: number;
  ai_confidence: number;
  current_status: DisputeCurrentStatus;
}

export interface PaginatedAssignedDisputeResponse {
  success: boolean;
  count: number;
  next: string | null;
  previous: string | null;
  results: AssignedDispute[];
}

// ─── Dispute detail ───────────────────────────────────────────────────────────

export interface DisputeUser {
  id: string;
  username: string;
  full_name: string;
  email: string;
}

export interface DisputeEscrowInfo {
  id: string;
  order_id: string;
  product_name: string;
  description: string;
  item_type: string;
  payment_option: string;
  price: number;
  images: string[];       // Evidence images provided by the claimant
  main_images: string[];  // Original escrow listing images
  fee_amount: number;
  total_amount: number;
  currency: string;
  status: string;
  created_at: string;
}

export interface DisputeAiResult {
  decision: string;
  confidence: number;
  summary: string;
}

export interface DisputeDetail {
  id: string;
  reason: string;
  note: string;
  current_status: DisputeCurrentStatus;
  created_at: string;
  who_claimed: DisputeUser;
  buyer_conversation_id: string;
  seller_conversation_id: string;
  buyer: DisputeUser;
  seller: DisputeUser;
  escrow_info: DisputeEscrowInfo;
  ai_result: DisputeAiResult;
}

export interface DisputeDetailResponse {
  success: boolean;
  dispute: DisputeDetail;
}

// ─── Assign dispute ───────────────────────────────────────────────────────────

export interface AssignDisputeResponse {
  success: boolean;
  message: string;
}

// ─── Query params ─────────────────────────────────────────────────────────────

export interface UnassignedDisputeParams {
  status?: AiStatus;
  min_confidence?: number;
  max_confidence?: number;
  q?: string;
  page?: number;
}

export interface AssignedDisputeParams {
  status?: DisputeCurrentStatus;
  min_confidence?: number;
  max_confidence?: number;
  q?: string;
  page?: number;
}

// ─── Confidence band — UI abstraction over min/max ────────────────────────────

export type ConfidenceBand = "high" | "medium" | "low";

export const CONFIDENCE_BAND_MAP: Record<
  ConfidenceBand,
  { min: number; max: number; label: string }
> = {
  low:    { min: 0.00, max: 0.40, label: "Low (<40%)" },
  medium: { min: 0.41, max: 0.69, label: "Medium (40–69%)" },
  high:   { min: 0.70, max: 1.00, label: "High (≥70%)" },
};