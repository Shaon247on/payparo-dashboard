export interface MonthlyRevenue {
  month: string;   // e.g. "May 2026"
  revenue: number;
}

export interface RecentEscrow {
  order_id: string;
  product_name: string;
  total_amount: number;
  fee_amount: number;
  currency: string;
  seller: string;
  buyer: string;
  completed_at: string; // ISO string
}

export interface RevenueStats {
  today_revenue: string;
  this_week_revenue: string;
  this_month_revenue: string;
  total_revenue: string;
  total_escrow_volume: string;
  total_completed_escrows: number;
  total_active_escrows: number;
  total_refunded_escrows: number;
  monthly_revenue: MonthlyRevenue[];
  recent_escrows: RecentEscrow[];
}
