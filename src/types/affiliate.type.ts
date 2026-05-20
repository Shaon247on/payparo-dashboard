// ─── Affiliate Application ────────────────────────────────────────────────────

export type AffiliateStatus = "pending" | "approved" | "rejected" | "suspended";
export type AffiliatePlatform = "telegram" | "discord" | "both";

export interface AffiliateApplication {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  platform: AffiliatePlatform;
  community_name: string;
  community_url: string;
  community_member_count: number;
  community_description: string;
  desired_slug: string;
  tax_id: string;
  business_name: string;
  country: string;
  bank_name: string;
  clabe: string;
  account_holder_name: string;
  id_document_url: string | null;
  tax_document_url: string | null;
  bank_statement_url: string | null;
  status: AffiliateStatus;
  rejection_reason: string;
  reviewed_at: string | null;
  created_at: string;
}

export interface AdminAffiliateApplication extends AffiliateApplication {
  user_id: string | null;
  user_email: string | null;
  notes: AffiliateNote[];
}

// ─── Affiliate Profile ────────────────────────────────────────────────────────

export type AffiliateTier = "base" | "elevated";

export interface AffiliateProfile {
  id: string;
  affiliate_id: string;
  slug: string;
  referral_url: string;
  tier: AffiliateTier;
  tier_display: string;
  total_earned: string;
  total_pending_hold: string;
  total_released: string;
  total_paid_out: string;
  withdrawable_balance: string;
  is_active: boolean;
  created_at: string;
}

// ─── Rewards ─────────────────────────────────────────────────────────────────

export type RewardType = "recurring_commission" | "activation_bonus" | "deduction";
export type RewardState = "pending_hold" | "released" | "voided" | "deducted";

export interface AffiliateReward {
  id: string;
  reward_type: RewardType;
  state: RewardState;
  platform_fee: string;
  commission_rate: string;
  amount: string;
  currency: string;
  hold_until: string | null;
  released_at: string | null;
  voided_at: string | null;
  void_reason: string;
  escrow_order_id: string | null;
  referred_user_email: string | null;
  created_at: string;
}

// ─── Attribution / Referred Users ─────────────────────────────────────────────

export interface AffiliateAttribution {
  id: string;
  referred_user_id: string;
  referred_user_email: string;
  referred_user_full_name: string;
  attributed_at: string;
  first_transaction_discount_used: boolean;
  activation_bonus_paid: boolean;
  fraud_flagged: boolean;
  total_volume: string;
  transaction_count: number;
  total_commission_earned: string;
}

// ─── Withdrawal ───────────────────────────────────────────────────────────────

export type WithdrawalStatus = "pending" | "approved" | "completed" | "rejected";

export interface AffiliateWithdrawal {
  id: string;
  amount: string;
  currency: string;
  bank_name: string;
  clabe: string;
  account_holder_name: string;
  cfdi_invoice_url: string | null;
  cfdi_invoice_number: string;
  isr_withholding: string;
  net_amount: string;
  status: WithdrawalStatus;
  rejection_reason: string;
  transaction_ref: string;
  reviewed_at: string | null;
  created_at: string;
}

export interface AdminAffiliateWithdrawal extends AffiliateWithdrawal {
  affiliate_slug: string;
  affiliate_email: string;
  admin_notes: string;
  reviewed_by_name: string | null;
}

// ─── Tier History ─────────────────────────────────────────────────────────────

export interface AffiliateTierHistory {
  id: string;
  year: number;
  month: number;
  monthly_volume: string;
  tier_applied: AffiliateTier;
  commission_rate: string;
}

// ─── Global Budget ────────────────────────────────────────────────────────────

export interface AffiliateGlobalBudget {
  monthly_cap: string;
  current_month_spend: string;
  cap_year: number;
  cap_month: number;
  rewards_paused: boolean;
  cap_remaining: string;
  cap_utilisation_pct: number;
}

// ─── Notes ────────────────────────────────────────────────────────────────────

export interface AffiliateNote {
  id: string;
  content: string;
  author_name: string;
  created_at: string;
}

// ─── Fraud Flags ─────────────────────────────────────────────────────────────

export type FraudSignalType =
  | "self_referral"
  | "same_ip"
  | "same_device"
  | "same_gov_id"
  | "same_bank"
  | "wash_trading";

export interface AffiliateFraudFlag {
  id: string;
  affiliate_slug: string;
  user_email: string;
  signal_type: FraudSignalType;
  detail: string;
  resolved: boolean;
  resolved_at: string | null;
  created_at: string;
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

export interface AffiliateDashboardData {
  profile: AffiliateProfile;
  monthly_volume: string;
  tier_progress_pct: number;
  referred_users_count: number;
  recent_rewards: AffiliateReward[];
}

export interface AffiliateTierData {
  current_tier: AffiliateTier;
  current_rate: string;
  monthly_volume: string;
  tier_threshold: string;
  tier_progress_pct: number;
  history: AffiliateTierHistory[];
}

export interface AffiliateReferralLinkData {
  slug: string;
  affiliate_id: string;
  referral_url: string;
  total_clicks: number;
  converted_clicks: number;
  conversion_rate: number;
}

// ─── Paginated responses ──────────────────────────────────────────────────────

export interface PaginatedAffiliateApplications {
  count: number;
  next: string | null;
  previous: string | null;
  results: AdminAffiliateApplication[];
}

export interface PaginatedAffiliateWithdrawals {
  count: number;
  next: string | null;
  previous: string | null;
  results: AdminAffiliateWithdrawal[];
}

export interface PaginatedAffiliateRewards {
  count: number;
  next: string | null;
  previous: string | null;
  results: AffiliateReward[];
}

export interface PaginatedAffiliateAttributions {
  count: number;
  next: string | null;
  previous: string | null;
  results: AffiliateAttribution[];
}

export interface PaginatedFraudFlags {
  count: number;
  next: string | null;
  previous: string | null;
  results: AffiliateFraudFlag[];
}
