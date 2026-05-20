export interface OverviewStats {
  total_users: number;
  pending_kyc: number;
  active_escrow_volume: number;
  open_disputes: number;
}

export interface EscrowChartData {
  month: string;
  count: number;
  volume: number;
}

export interface UserRegistrationChartData {
  month: string;
  registrations: number;
}

export interface ActivityFeedItem {
  id: string;
  type: "signup" | "escrow" | "dispute";
  title: string;
  description: string;
  timestamp: string;
}

export interface OverviewData {
  stats: OverviewStats;
  escrow_chart: EscrowChartData[];
  registration_chart: UserRegistrationChartData[];
  activity_feed: ActivityFeedItem[];
}
