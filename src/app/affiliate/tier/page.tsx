import { AlertCircle, ShieldCheck, Trophy, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getAffiliateTierAction } from "@/actions/affiliate.action";
import type { AffiliateTier } from "@/types/affiliate.type";

const TIER_RATES: Record<AffiliateTier, string> = {
  base: "30%",
  elevated: "40%",
};

const TIER_BENEFITS: Record<AffiliateTier, string[]> = {
  base: [
    "Earn 30% of platform escrow fees on all referred users.",
    "Lifetime recurring commissions.",
    "Access to real-time partner dashboard & analytics.",
  ],
  elevated: [
    "Elevated 40% escrow commission rate.",
    "Priority bank payout processing.",
    "Dedicated partnership manager channel.",
  ],
};

export default async function AffiliateTierPage() {
  const result = await getAffiliateTierAction();

  if (!result.success) {
    return (
      <div className="flex items-center gap-3 rounded-lg border border-rose-500/20 bg-rose-500/5 px-5 py-4 text-sm text-rose-400">
        <AlertCircle className="w-4 h-4 shrink-0" />
        <span>{result.error}</span>
      </div>
    );
  }

  const { current_tier, current_rate, monthly_volume, tier_threshold, tier_progress_pct, history } = result.data;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-white text-2xl font-bold">Commission Tiers</h2>
        <p className="text-white/40 text-sm mt-1">
          Increase referred volume to unlock elevated tier rates and benefits
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tier Card */}
        <Card className="bg-[#13151e] border-white/5 lg:col-span-2 p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-[#00d4aa]/10">
                <Trophy className="w-6 h-6 text-[#00d4aa]" />
              </div>
              <div>
                <p className="text-white font-bold text-lg capitalize">{current_tier} Partner</p>
                <p className="text-white/40 text-xs">Active rate for this month</p>
              </div>
            </div>
            <div className="text-left sm:text-right">
              <span className="text-[#00d4aa] text-3xl font-extrabold tracking-tight">
                {TIER_RATES[current_tier]}
              </span>
              <span className="text-white/40 text-xs block">Commission Rate</span>
            </div>
          </div>

          <div className="space-y-2 border-t border-white/5 pt-4">
            <div className="flex justify-between text-xs text-white/50">
              <span>Monthly Volume Progress</span>
              <span>
                {Number(monthly_volume).toLocaleString()} / {Number(tier_threshold).toLocaleString()} MXN
              </span>
            </div>
            <div className="h-2.5 bg-white/5 rounded-full overflow-hidden">
              <div className="h-full bg-[#00d4aa]" style={{ width: `${tier_progress_pct}%` }} />
            </div>
            <p className="text-[11px] text-white/30 leading-relaxed">
              Earn 100,000 MXN or more in referred transaction volume during a calendar month to be automatically upgraded to the Elevated Partner tier (40% commission rate) for the following month.
            </p>
          </div>
        </Card>

        {/* Benefits Card */}
        <Card className="bg-[#13151e] border-white/5 p-5 space-y-4">
          <h3 className="text-white font-semibold text-xs uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-[#00d4aa]" /> Tier Perks
          </h3>
          <ul className="space-y-3 text-xs text-white/50 leading-relaxed">
            {TIER_BENEFITS[current_tier].map((benefit, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-[#00d4aa] font-bold">•</span>
                <span>{benefit}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      {/* History */}
      <Card className="bg-[#13151e] border-white/5">
        <div className="p-5 border-b border-white/5">
          <h3 className="text-white font-semibold text-sm flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#00d4aa]" />
            Monthly Audit History
          </h3>
        </div>
        <CardContent className="p-0">
          {history.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-white/30 text-xs">No historical volume data audited yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-white/5 bg-white/[0.01]">
                    <th className="text-left px-5 py-3 text-white/40 font-medium">Period</th>
                    <th className="text-left px-5 py-3 text-white/40 font-medium">Referred Volume</th>
                    <th className="text-left px-5 py-3 text-white/40 font-medium">Tier Applied</th>
                    <th className="text-left px-5 py-3 text-white/40 font-medium">Commission Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((record) => (
                    <tr key={record.id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.01]">
                      <td className="px-5 py-3 text-white font-semibold">
                        {record.year}/{String(record.month).padStart(2, "0")}
                      </td>
                      <td className="px-5 py-3 text-white/70">
                        {Number(record.monthly_volume).toLocaleString("es-MX", { style: "currency", currency: "MXN" })}
                      </td>
                      <td className="px-5 py-3 text-white/70 capitalize">
                        {record.tier_applied}
                      </td>
                      <td className="px-5 py-3 text-[#00d4aa] font-bold">
                        {(Number(record.commission_rate) * 100).toFixed(0)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
