import { Suspense } from "react";
import { AlertCircle, DollarSign, FileCheck, Ban } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getAdminAffiliateWithdrawalsAction } from "@/actions/affiliate.admin.action";
import type { AdminAffiliateWithdrawal, WithdrawalStatus } from "@/types/affiliate.type";
import SearchInput from "@/components/shared/SearchInput";
import StatusFilter from "@/components/shared/StatusFilter";
import AffiliateWithdrawalActions from "@/components/dashboard/superAdmin/AffiliateWithdrawalActions";

const STATUS_OPTIONS = [
  { label: "Pending", value: "pending" },
  { label: "Approved", value: "approved" },
  { label: "Completed", value: "completed" },
  { label: "Rejected", value: "rejected" },
];

const STATUS_COLORS: Record<WithdrawalStatus, string> = {
  pending: "bg-amber-400/10 text-amber-400 border-amber-400/20",
  approved: "bg-blue-400/10 text-blue-400 border-blue-400/20",
  completed: "bg-emerald-400/10 text-emerald-400 border-emerald-400/20",
  rejected: "bg-red-400/10 text-red-400 border-red-400/20",
};

interface PageProps {
  searchParams: Promise<{ q?: string; status?: string; page?: string }>;
}

export default async function AdminAffiliateWithdrawalsPage({ searchParams }: PageProps) {
  const { q, status, page } = await searchParams;

  const result = await getAdminAffiliateWithdrawalsAction({
    q: q ?? undefined,
    status: status ?? undefined,
    page: page ? Number(page) : 1,
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-white text-2xl font-bold">Affiliate Withdrawals</h2>
        <p className="text-white/40 text-sm mt-1">Review and process affiliate payout requests</p>
      </div>

      <Suspense fallback={<div className="h-11" />}>
        <div className="flex flex-col sm:flex-row gap-3">
          <SearchInput paramKey="q" placeholder="Search by affiliate, email or ref" />
          <StatusFilter paramKey="status" options={STATUS_OPTIONS} allValue="all" allLabel="All Status" />
        </div>
      </Suspense>

      {!result.success ? (
        <div className="flex items-center gap-3 rounded-lg border border-rose-500/20 bg-rose-500/5 px-5 py-4 text-sm text-rose-400">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{result.error}</span>
        </div>
      ) : result.data.results.length === 0 ? (
        <Card className="bg-[#13151e] border-white/5">
          <CardContent className="p-12 text-center">
            <DollarSign className="w-10 h-10 text-white/20 mx-auto mb-3" />
            <p className="text-white/40 text-sm">No withdrawal requests found.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {result.data.results.map((withdrawal) => (
            <AffiliateWithdrawalCard key={withdrawal.id} withdrawal={withdrawal} />
          ))}
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
              <div className="p-2 rounded-lg bg-[#00d4aa]/10">
                <DollarSign className="w-4 h-4 text-[#00d4aa]" />
              </div>
              <div>
                <p className="text-white font-semibold">
                  {Number(withdrawal.amount).toLocaleString("es-MX", { style: "currency", currency: "MXN" })}
                </p>
                <p className="text-white/40 text-xs">{withdrawal.affiliate_email} • {withdrawal.affiliate_slug}</p>
              </div>
              <Badge className={`ml-auto capitalize border text-xs ${STATUS_COLORS[withdrawal.status]}`}>
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

            <div className="flex items-center gap-4">
              {withdrawal.cfdi_invoice_url && (
                <a href={withdrawal.cfdi_invoice_url} target="_blank" rel="noopener noreferrer"
                   className="flex items-center gap-1.5 text-[#00d4aa] text-xs hover:underline">
                  <FileCheck className="w-3.5 h-3.5" /> View CFDI Invoice
                </a>
              )}
              <span className="text-white/30 text-xs">
                Requested: {new Date(withdrawal.created_at).toLocaleDateString()}
              </span>
              {withdrawal.transaction_ref && (
                <span className="text-white/40 text-xs font-mono">
                  Ref: {withdrawal.transaction_ref}
                </span>
              )}
            </div>
          </div>
        </div>

        {withdrawal.status === "pending" || withdrawal.status === "approved" ? (
          <AffiliateWithdrawalActions withdrawal={withdrawal} />
        ) : null}
      </CardContent>
    </Card>
  );
}
