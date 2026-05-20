import { Suspense } from "react";
import { AlertCircle, DollarSign } from "lucide-react";
import { Card, CardContent } from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import { getAffiliateRewardsAction } from "@/actions/affiliate.action";
import type { AffiliateReward, RewardState, RewardType } from "@/types/affiliate.type";
import StatusFilter from "@/components/shared/StatusFilter";
import Pagination from "@/components/shared/Pagination";

const STATE_OPTIONS = [
  { label: "Pending Hold", value: "pending_hold" },
  { label: "Released", value: "released" },
  { label: "Voided", value: "voided" },
  { label: "Deducted", value: "deducted" },
];

const STATE_COLORS: Record<RewardState, string> = {
  pending_hold: "bg-amber-400/10 text-amber-400 border-amber-400/20",
  released: "bg-emerald-400/10 text-emerald-400 border-emerald-400/20",
  voided: "bg-red-400/10 text-red-400 border-red-400/20",
  deducted: "bg-orange-400/10 text-orange-400 border-orange-400/20",
};

const TYPE_LABELS: Record<RewardType, string> = {
  recurring_commission: "Escrow Commission",
  activation_bonus: "Activation Bonus",
  deduction: "Adjustment / Deduction",
};

interface PageProps {
  searchParams: Promise<{ state?: string; page?: string }>;
}

export default async function AffiliateRewardsPage({ searchParams }: PageProps) {
  const { state, page } = await searchParams;
  const currentPage = page ? Number(page) : 1;

  const result = await getAffiliateRewardsAction({
    state: state ?? undefined,
    page: currentPage,
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-white text-2xl font-bold">Rewards Ledger</h2>
        <p className="text-white/40 text-sm mt-1">
          Detailed itemised ledger of all your generated referral rewards and holds
        </p>
      </div>

      {/* Filter */}
      <Suspense fallback={<div className="h-11" />}>
        <div className="flex flex-col sm:flex-row gap-3">
          <StatusFilter paramKey="state" options={STATE_OPTIONS} allValue="all" allLabel="All States" />
        </div>
      </Suspense>

      {/* Content */}
      {!result.success ? (
        <div className="flex items-center gap-3 rounded-lg border border-rose-500/20 bg-rose-500/5 px-5 py-4 text-sm text-rose-400">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{result.error}</span>
        </div>
      ) : result.data.results.length === 0 ? (
        <Card className="bg-[#13151e] border-white/5">
          <CardContent className="p-12 text-center">
            <DollarSign className="w-10 h-10 text-white/20 mx-auto mb-3" />
            <p className="text-white/40 text-sm">No ledger records found matching filter.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <div className="space-y-2">
            {result.data.results.map((reward) => (
              <RewardCard key={reward.id} reward={reward} />
            ))}
          </div>

          <Pagination totalCount={result.data.count} pageSize={20} />
        </div>
      )}
    </div>
  );
}

function RewardCard({ reward }: { reward: AffiliateReward }) {
  return (
    <Card className="bg-[#13151e] border-white/5">
      <CardContent className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="text-white text-xs font-semibold">{TYPE_LABELS[reward.reward_type]}</span>
            <Badge className={`text-[9px] capitalize border ${STATE_COLORS[reward.state]}`}>
              {reward.state === "pending_hold" ? "On Hold" : reward.state}
            </Badge>
          </div>

          <div className="text-[11px] text-white/40 space-y-0.5">
            {reward.referred_user_email && <p>Referred: {reward.referred_user_email}</p>}
            {reward.escrow_order_id && <p>Escrow ID: {reward.escrow_order_id}</p>}
            {reward.reward_type === "recurring_commission" && (
              <p>
                Fee: {reward.platform_fee} MXN • Rate: {(Number(reward.commission_rate) * 100).toFixed(0)}%
              </p>
            )}
          </div>
        </div>

        <div className="text-left md:text-right space-y-1">
          <p className="text-emerald-400 text-sm font-bold">
            {Number(reward.amount).toLocaleString("es-MX", { style: "currency", currency: "MXN" })}
          </p>
          <p className="text-[10px] text-white/30">
            {reward.state === "pending_hold" && reward.hold_until
              ? `Release date: ${new Date(reward.hold_until).toLocaleDateString()}`
              : `Created: ${new Date(reward.created_at).toLocaleDateString()}`}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
