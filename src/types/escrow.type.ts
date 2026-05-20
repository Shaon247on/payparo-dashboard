// ─── Escrow List ─────────────────────────────────────────────────────────────

export interface EscrowListItem {
  id: string;
  transaction: string;
  seller: string;
  buyer: string;
  items: string;
  escrow_amount: string;
}

export interface EscrowStats {
  total_transactions: number;
  active_transactions: number;
  in_dispute: number;
  completed: number;
}

export interface PaginatedEscrowResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: EscrowListItem[];
  stats: EscrowStats;
}

// ─── Escrow Detail ────────────────────────────────────────────────────────────

export interface EscrowParty {
  label: string;
  name: string;
  email: string;
  role: string;
}

export interface EscrowTimelineStep {
  label: string;
  status: string;
  timestamp: string | null;
  is_current: boolean;
}

export interface EscrowInspectionPeriod {
  title: string;
  value: string;
  deadline: string;
  remaining_minutes: number;
  is_active: boolean;
}

export interface EscrowFeeBreakdown {
  transaction_amount: string;
  platform_fee_label: string;
  platform_fee: string;
  escrow_fee: string;
  total: string;
}

export interface EscrowAdminAction {
  action: string;
  label: string;
  enabled: boolean;
  message: string | null;
}

export interface EscrowDetail {
  item_name: string;
  transaction_id: string;
  status: string;
  status_label: string;
  seller: EscrowParty;
  buyer: EscrowParty;
  timeline: EscrowTimelineStep[];
  inspection_period: EscrowInspectionPeriod;
  fee_breakdown: EscrowFeeBreakdown;
  admin_actions: EscrowAdminAction[];
}