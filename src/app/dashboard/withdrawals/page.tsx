import { Suspense } from "react";
import { AlertCircle, DollarSign, FileCheck, Ban, Landmark, Mail } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  getAdminAffiliateWithdrawalsAction,
  getAdminUserWithdrawalsAction,
} from "@/actions/affiliate.admin.action";
import type { AdminAffiliateWithdrawal, WithdrawalStatus } from "@/types/affiliate.type";
import type { UserWithdrawal, UserWithdrawalStatus } from "@/types/withdrawal.type";
import SearchInput from "@/components/shared/SearchInput";
import StatusFilter from "@/components/shared/StatusFilter";
import AffiliateWithdrawalActions from "@/components/dashboard/superAdmin/AffiliateWithdrawalActions";
import UserWithdrawalActions from "@/components/dashboard/superAdmin/UserWithdrawalActions";
import Link from "next/link";
import { cn } from "@/lib/utils";

const AFFILIATE_STATUS_OPTIONS = [
  { label: "Pending", value: "pending" },
  { label: "Approved", value: "approved" },
  { label: "Completed", value: "completed" },
  { label: "Rejected", value: "rejected" },
];

const USER_STATUS_OPTIONS = [
  { label: "Pending", value: "pending" },
  { label: "Completed", value: "completed" },
  { label: "Failed", value: "failed" },
];

const USER_METHOD_OPTIONS = [
  { label: "Bank Transfer", value: "bank" },
  { label: "PayPal", value: "paypal" },
];

const AFFILIATE_STATUS_COLORS: Record<WithdrawalStatus, string> = {
  pending: "bg-amber-400/10 text-amber-400 border-amber-400/20",
  approved: "bg-blue-400/10 text-blue-400 border-blue-400/20",
  completed: "bg-emerald-400/10 text-emerald-400 border-emerald-400/20",
  rejected: "bg-red-400/10 text-red-400 border-red-400/20",
};

const USER_STATUS_COLORS: Record<UserWithdrawalStatus, string> = {
  pending: "bg-amber-400/10 text-amber-400 border-amber-400/20",
  completed: "bg-emerald-400/10 text-emerald-400 border-emerald-400/20",
  failed: "bg-red-400/10 text-red-400 border-red-400/20",
};

interface PageProps {
  searchParams: Promise<{
    q?: string;
    status?: string;
    method?: string;
    role?: string;
    page?: string;
  }>;
}

function getPaginationUrls(
  currentSearchParams: { q?: string; status?: string; method?: string; role?: string; page?: string },
  hasNext: boolean,
  hasPrev: boolean
) {
  const currentPage = currentSearchParams.page ? Number(currentSearchParams.page) : 1;
  const buildUrlForPage = (p: number) => {
    const params = new URLSearchParams();
    Object.entries(currentSearchParams).forEach(([k, v]) => {
      if (v && k !== "page") params.set(k, v);
    });
    if (p > 1) params.set("page", String(p));
    const str = params.toString();
    return `/dashboard/withdrawals${str ? `?${str}` : ""}`;
  };

  return {
    currentPage,
    prevUrl: hasPrev ? buildUrlForPage(currentPage - 1) : "#",
    nextUrl: hasNext ? buildUrlForPage(currentPage + 1) : "#",
    hasExtraPages: hasNext || hasPrev || currentPage > 1,
  };
}

export default async function AdminWithdrawalsPage({ searchParams }: PageProps) {
  const resolvedSearchParams = await searchParams;
  const { q, status, method, role, page } = resolvedSearchParams;
  const activeRole = role === "user" ? "user" : "affiliate";

  let affiliateResult;
  let userResult;

  if (activeRole === "user") {
    userResult = await getAdminUserWithdrawalsAction({
      q: q ?? undefined,
      status: status ?? undefined,
      method: method ?? undefined,
      page: page ? Number(page) : 1,
    });
  } else {
    affiliateResult = await getAdminAffiliateWithdrawalsAction({
      q: q ?? undefined,
      status: status ?? undefined,
      page: page ? Number(page) : 1,
    });
  }

  const hasNext = activeRole === "user"
    ? (userResult?.success ? !!userResult.data.next : false)
    : (affiliateResult?.success ? !!affiliateResult.data.next : false);
  const hasPrev = activeRole === "user"
    ? (userResult?.success ? !!userResult.data.previous : false)
    : (affiliateResult?.success ? !!affiliateResult.data.previous : false);
  const totalCount = activeRole === "user"
    ? (userResult?.success ? userResult.data.count : 0)
    : (affiliateResult?.success ? affiliateResult.data.count : 0);

  const { currentPage, prevUrl, nextUrl, hasExtraPages } = getPaginationUrls(
    resolvedSearchParams,
    hasNext,
    hasPrev
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-white text-2xl font-bold">Withdrawal Management</h2>
        <p className="text-white/40 text-sm mt-1">
          Review, approve, and process affiliate payouts and user wallet withdrawals
        </p>
      </div>

      {/* Role Tabs */}
      <div className="flex border-b border-white/5 gap-6">
        <Link
          href="/dashboard/withdrawals?role=affiliate"
          className={cn(
            "pb-3.5 text-sm font-semibold transition-all relative",
            activeRole === "affiliate"
              ? "text-white border-b-2 border-[#0091e5]"
              : "text-white/40 hover:text-white/60"
          )}
        >
          Affiliate Payouts
        </Link>
        <Link
          href="/dashboard/withdrawals?role=user"
          className={cn(
            "pb-3.5 text-sm font-semibold transition-all relative",
            activeRole === "user"
              ? "text-white border-b-2 border-[#0091e5]"
              : "text-white/40 hover:text-white/60"
          )}
        >
          User Withdrawals
        </Link>
      </div>

      {/* Search & Filters */}
      <Suspense fallback={<div className="h-11" />}>
        <div className="flex flex-col sm:flex-row gap-3">
          <SearchInput
            paramKey="q"
            placeholder={
              activeRole === "user"
                ? "Search by user, email or ref"
                : "Search by affiliate, email or ref"
            }
          />
          <StatusFilter
            paramKey="status"
            options={activeRole === "user" ? USER_STATUS_OPTIONS : AFFILIATE_STATUS_OPTIONS}
            allValue="all"
            allLabel="All Status"
          />
          {activeRole === "user" && (
            <StatusFilter
              paramKey="method"
              options={USER_METHOD_OPTIONS}
              allValue="all"
              allLabel="All Methods"
            />
          )}
        </div>
      </Suspense>

      {/* Listing Content */}
      {activeRole === "user" ? (
        // Standard User Withdrawals List
        !userResult?.success ? (
          <div className="flex items-center gap-3 rounded-lg border border-rose-500/20 bg-rose-500/5 px-5 py-4 text-sm text-rose-400">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{userResult?.error}</span>
          </div>
        ) : userResult.data.results.length === 0 ? (
          <Card className="bg-[#13151e] border-white/5">
            <CardContent className="p-12 text-center">
              <DollarSign className="w-10 h-10 text-white/20 mx-auto mb-3" />
              <p className="text-white/40 text-sm">No user withdrawal requests found.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {userResult.data.results.map((withdrawal) => (
              <UserWithdrawalCard key={withdrawal.id} withdrawal={withdrawal} />
            ))}
          </div>
        )
      ) : (
        // Affiliate Withdrawals List
        !affiliateResult?.success ? (
          <div className="flex items-center gap-3 rounded-lg border border-rose-500/20 bg-rose-500/5 px-5 py-4 text-sm text-rose-400">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{affiliateResult?.error}</span>
          </div>
        ) : affiliateResult.data.results.length === 0 ? (
          <Card className="bg-[#13151e] border-white/5">
            <CardContent className="p-12 text-center">
              <DollarSign className="w-10 h-10 text-white/20 mx-auto mb-3" />
              <p className="text-white/40 text-sm">No affiliate withdrawal requests found.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {affiliateResult.data.results.map((withdrawal) => (
              <AffiliateWithdrawalCard key={withdrawal.id} withdrawal={withdrawal} />
            ))}
          </div>
        )
      )}

      {/* Pagination */}
      {hasExtraPages && (
        <div className="flex items-center justify-between pt-4 border-t border-white/5">
          <div className="text-xs text-white/40">
            Showing Page {currentPage} (Total {totalCount} requests)
          </div>
          <div className="flex items-center gap-2">
            <Link
              href={prevUrl}
              className={cn(
                "px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all duration-150",
                hasPrev
                  ? "border-white/10 bg-white/5 text-white hover:bg-white/10"
                  : "border-white/5 bg-transparent text-white/20 pointer-events-none"
              )}
            >
              Previous
            </Link>
            <Link
              href={nextUrl}
              className={cn(
                "px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all duration-150",
                hasNext
                  ? "border-white/10 bg-white/5 text-white hover:bg-white/10"
                  : "border-white/5 bg-transparent text-white/20 pointer-events-none"
              )}
            >
              Next
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

function AffiliateWithdrawalCard({ withdrawal }: { withdrawal: AdminAffiliateWithdrawal }) {
  return (
    <Card className="bg-[#13151e] border-white/5">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[#0091e5]/10">
                <DollarSign className="w-4 h-4 text-[#0091e5]" />
              </div>
              <div>
                <p className="text-white font-semibold">
                  {Number(withdrawal.amount).toLocaleString("es-MX", { style: "currency", currency: "MXN" })}
                </p>
                <p className="text-white/40 text-xs">
                  {withdrawal.affiliate_email} • {withdrawal.affiliate_slug}
                </p>
              </div>
              <Badge
                className={`ml-auto capitalize border text-xs ${
                  AFFILIATE_STATUS_COLORS[withdrawal.status]
                }`}
              >
                {withdrawal.status}
              </Badge>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              <div>
                <p className="text-white/40 mb-0.5">Bank</p>
                <p className="text-white/70">{withdrawal.bank_name}</p>
              </div>
              <div>
                <p className="text-white/40 mb-0.5">CLABE</p>
                <p className="text-white/70 font-mono">••••{withdrawal.clabe.slice(-4)}</p>
              </div>
              <div>
                <p className="text-white/40 mb-0.5">ISR</p>
                <p className="text-white/70">{withdrawal.isr_withholding} MXN</p>
              </div>
              <div>
                <p className="text-white/40 mb-0.5">Net Amount</p>
                <p className="text-emerald-400 font-medium">{withdrawal.net_amount} MXN</p>
              </div>
            </div>

            {withdrawal.status === "rejected" && withdrawal.rejection_reason && (
              <div className="p-3 rounded-lg border border-red-500/10 bg-red-500/5 text-rose-400 text-xs">
                <span className="font-semibold block mb-0.5">Rejection Message:</span>
                {withdrawal.rejection_reason}
              </div>
            )}

            <div className="flex items-center gap-4">
              {withdrawal.cfdi_invoice_url && (
                <a
                  href={withdrawal.cfdi_invoice_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-[#0091e5] text-xs hover:underline font-semibold"
                >
                  <FileCheck className="w-3.5 h-3.5" /> View CFDI Invoice
                </a>
              )}
              <span className="text-white/30 text-xs">
                Requested: {new Date(withdrawal.created_at).toLocaleDateString()}
              </span>
              {withdrawal.transaction_ref && (
                <span className="text-white/45 text-xs font-mono bg-white/5 px-2 py-0.5 rounded">
                  Ref: {withdrawal.transaction_ref}
                </span>
              )}
              {withdrawal.admin_notes && (
                <span className="text-white/40 text-xs italic">
                  Note: {withdrawal.admin_notes}
                </span>
              )}
            </div>
          </div>
        </div>

        {(withdrawal.status === "pending" || withdrawal.status === "approved") && (
          <AffiliateWithdrawalActions withdrawal={withdrawal} />
        )}
      </CardContent>
    </Card>
  );
}

function UserWithdrawalCard({ withdrawal }: { withdrawal: UserWithdrawal }) {
  return (
    <Card className="bg-[#13151e] border-white/5">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[#0091e5]/10">
                {withdrawal.method === "paypal" ? (
                  <Mail className="w-4 h-4 text-[#0091e5]" />
                ) : (
                  <Landmark className="w-4 h-4 text-[#0091e5]" />
                )}
              </div>
              <div>
                <p className="text-white font-semibold">
                  {Number(withdrawal.amount).toLocaleString("es-MX", { style: "currency", currency: "MXN" })}
                </p>
                <p className="text-white/40 text-xs">
                  {withdrawal.user_full_name} • {withdrawal.user_email}
                </p>
              </div>
              <Badge
                className={`ml-auto capitalize border text-xs ${
                  USER_STATUS_COLORS[withdrawal.status]
                }`}
              >
                {withdrawal.status_display}
              </Badge>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
              <div>
                <p className="text-white/40 mb-0.5">Method</p>
                <p className="text-white/70 capitalize font-medium">{withdrawal.method}</p>
              </div>
              {withdrawal.method === "paypal" ? (
                <div className="lg:col-span-2">
                  <p className="text-white/40 mb-0.5">PayPal Email</p>
                  <p className="text-white/70">{withdrawal.paypal_email || "N/A"}</p>
                </div>
              ) : (
                <>
                  <div>
                    <p className="text-white/40 mb-0.5">Bank Name</p>
                    <p className="text-white/70">{withdrawal.bank_name || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-white/40 mb-0.5">Account Number</p>
                    <p className="text-white/70 font-mono">
                      {withdrawal.account_number || (withdrawal.account_number_last4
                        ? `•••• ${withdrawal.account_number_last4}`
                        : "N/A")}
                    </p>
                  </div>
                  <div>
                    <p className="text-white/40 mb-0.5">Routing / Swift Code</p>
                    <p className="text-white/70 font-mono">{withdrawal.routing_number || "N/A"}</p>
                  </div>
                </>
              )}
              <div>
                <p className="text-white/40 mb-0.5">Fee Paid</p>
                <p className="text-rose-400 font-semibold">{withdrawal.fee} MXN</p>
              </div>
              <div>
                <p className="text-white/40 mb-0.5">Net Amount Paid</p>
                <p className="text-emerald-400 font-bold">{withdrawal.net_amount} MXN</p>
              </div>
            </div>

            {withdrawal.status === "failed" && withdrawal.description && (
              <div className="p-3 rounded-lg border border-red-500/10 bg-red-500/5 text-rose-400 text-xs">
                <span className="font-semibold block mb-0.5">Rejection Message:</span>
                {withdrawal.description}
              </div>
            )}

            <div className="flex items-center gap-4 text-xs">
              <span className="text-white/30">
                Requested: {new Date(withdrawal.created_at).toLocaleDateString()}
              </span>
              {withdrawal.transaction_ref && (
                <span className="text-white/45 font-mono bg-white/5 px-2 py-0.5 rounded">
                  Ref: {withdrawal.transaction_ref}
                </span>
              )}
              {withdrawal.description && (
                <span className="text-white/40 italic">
                  Details: {withdrawal.description}
                </span>
              )}
            </div>
          </div>
        </div>

        {withdrawal.status === "pending" && (
          <UserWithdrawalActions withdrawal={withdrawal} />
        )}
      </CardContent>
    </Card>
  );
}
