export type UserWithdrawalStatus = "pending" | "completed" | "failed";
export type UserWithdrawalMethod = "bank" | "paypal";

export interface UserWithdrawal {
  id: string;
  user: string;
  user_email: string;
  user_full_name: string;
  method: UserWithdrawalMethod;
  amount: string;
  fee: string;
  net_amount: string;
  paypal_email: string | null;
  bank_name: string | null;
  account_number_last4: string | null;
  transaction_ref: string;
  status: UserWithdrawalStatus;
  status_display: string;
  description: string;
  created_at: string;
}

export interface PaginatedUserWithdrawals {
  count: number;
  next: string | null;
  previous: string | null;
  results: UserWithdrawal[];
}
