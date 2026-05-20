import { AlertCircle, DollarSign, FileCheck, HelpCircle } from "lucide-react";
import { Card, CardContent } from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import { getAffiliateWithdrawalsAction, getAffiliateDashboardAction } from "@/actions/affiliate.action";
import type { AffiliateWithdrawal, WithdrawalStatus } from "@/types/affiliate.type";
import WithdrawalRequestForm from "@/components/dashboard/affiliate/WithdrawalRequestForm";

const STATUS_COLORS: Record<WithdrawalStatus, string> = {
  pending: "bg-amber-400/10 text-amber-400 border-amber-400/20",
  approved: "bg-blue-400/10 text-blue-400 border-blue-400/20",
  completed: "bg-emerald-400/10 text-emerald-400 border-emerald-400/20",
  rejected: "bg-red-400/10 text-red-400 border-red-400/20",
};

export default async function AffiliatePayoutsPage() {
  const [withdrawalsRes, dashRes] = await Promise.all([
    getAffiliateWithdrawalsAction(),
    getAffiliateDashboardAction(),
  ]);

  if (!withdrawalsRes.success) {
    return (
      <div className="flex items-center gap-3 rounded-lg border border-rose-500/20 bg-rose-500/5 px-5 py-4 text-sm text-rose-400">
        <AlertCircle className="w-4 h-4 shrink-0" />
        <span>{withdrawalsRes.error}</span>
      </div>
    );
  }

  if (!dashRes.success) {
    return (
      <div className="flex items-center gap-3 rounded-lg border border-rose-500/20 bg-rose-500/5 px-5 py-4 text-sm text-rose-400">
        <AlertCircle className="w-4 h-4 shrink-0" />
        <span>{dashRes.error}</span>
      </div>
    );
  }

  const withdrawals = withdrawalsRes.data.results;
  const { profile } = dashRes.data;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-white text-2xl font-bold">Withdrawals & Payouts</h2>
          <p className="text-white/40 text-sm mt-1">
            Submit invoice details and request SPEI bank payouts
          </p>
        </div>
        <WithdrawalRequestForm withdrawableBalance={profile.withdrawable_balance} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left list of payouts */}
        <div className="lg:col-span-2 space-y-3">
          <h3 className="text-white font-semibold text-sm">Payout History</h3>

          {withdrawals.length === 0 ? (
            <Card className="bg-[#13151e] border-white/5">
              <CardContent className="p-12 text-center">
                <DollarSign className="w-10 h-10 text-white/20 mx-auto mb-3" />
                <p className="text-white/40 text-sm">No payout requests submitted yet.</p>
              </CardContent>
            </Card>
          ) : (
            withdrawals.map((withdrawal) => (
              <Card key={withdrawal.id} className="bg-[#13151e] border-white/5">
                <CardContent className="p-5">
                  <div className="flex justify-between items-start gap-4">
                    <div className="space-y-3 flex-1">
                      <div className="flex items-center gap-3">
                        <p className="text-white font-semibold">
                          {Number(withdrawal.amount).toLocaleString("es-MX", { style: "currency", currency: "MXN" })}
                        </p>
                        <Badge className={`capitalize border text-xs ${STATUS_COLORS[withdrawal.status]}`}>
                          {withdrawal.status}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-[10px] text-white/40">
                        <div>
                          <p className="mb-0.5 uppercase tracking-wider">Bank</p>
                          <p className="text-white/70 font-semibold">{withdrawal.bank_name}</p>
                        </div>
                        <div>
                          <p className="mb-0.5 uppercase tracking-wider">CLABE</p>
                          <p className="text-white/70 font-mono">••••{withdrawal.clabe.slice(-4)}</p>
                        </div>
                        <div>
                          <p className="mb-0.5 uppercase tracking-wider">Withholding (ISR)</p>
                          <p className="text-white/70 font-semibold">{withdrawal.isr_withholding} MXN</p>
                        </div>
                        <div>
                          <p className="mb-0.5 uppercase tracking-wider">Net Paid</p>
                          <p className="text-emerald-400 font-semibold">{withdrawal.net_amount} MXN</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-[10px] text-white/30 border-t border-white/5 pt-3">
                        {withdrawal.cfdi_invoice_url && (
                          <a href={withdrawal.cfdi_invoice_url} target="_blank" rel="noopener noreferrer"
                             className="flex items-center gap-1.5 text-[#00d4aa] hover:underline">
                            <FileCheck className="w-3.5 h-3.5" /> CFDI Invoice
                          </a>
                        )}
                        <span>Requested: {new Date(withdrawal.created_at).toLocaleDateString()}</span>
                        {withdrawal.transaction_ref && (
                          <span className="font-mono">SPEI Ref: {withdrawal.transaction_ref}</span>
                        )}
                      </div>

                      {withdrawal.rejection_reason && (
                        <div className="p-3 bg-red-500/5 border border-red-500/10 rounded-lg text-xs text-red-400">
                          Rejection Reason: {withdrawal.rejection_reason}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Right Info Sidebar */}
        <div className="space-y-4">
          <Card className="bg-[#13151e] border-white/5 p-5 space-y-4">
            <h4 className="text-white font-semibold text-xs uppercase tracking-wider flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4 text-[#00d4aa]" /> Payout Rules
            </h4>
            <ul className="space-y-3 text-xs text-white/50 leading-relaxed">
              <li>
                <p className="font-semibold text-white/70 mb-0.5">Minimum Balance</p>
                <p>You can request withdrawals as soon as your withdrawable balance exceeds 500 MXN.</p>
              </li>
              <li>
                <p className="font-semibold text-white/70 mb-0.5">CFDI Invoice Obligation</p>
                <p>Affiliates are legally required to upload a matching CFDI Invoice in PDF/XML format for each payout.</p>
              </li>
              <li>
                <p className="font-semibold text-white/70 mb-0.5">Mexican Tax Withholding</p>
                <p>Mexican tax laws require withholding an ISR portion depending on your tax regime, calculated during audit.</p>
              </li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}
