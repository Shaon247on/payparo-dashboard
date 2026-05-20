import { AlertCircle, DollarSign, ArrowUpRight, ShieldCheck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getAffiliateDashboardAction } from "@/actions/affiliate.action";

export default async function AffiliateDashboardPage() {
  const result = await getAffiliateDashboardAction();

  if (!result.success) {
    return (
      <div className="flex items-center gap-3 rounded-lg border border-rose-500/20 bg-rose-500/5 px-5 py-4 text-sm text-rose-400">
        <AlertCircle className="w-4 h-4 shrink-0" />
        <span>{result.error}</span>
      </div>
    );
  }

  const { profile, monthly_volume, tier_progress_pct, referred_users_count, recent_rewards } = result.data;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-white text-2xl font-bold">Welcome back, Partner</h2>
        <p className="text-white/40 text-sm mt-1">
          Track your referrals, rewards, and status in real time
        </p>
      </div>

      {/* Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-[#13151e] border-white/5 p-5 space-y-2">
          <p className="text-white/40 text-xs font-medium">Withdrawable Balance</p>
          <p className="text-[#00d4aa] text-3xl font-extrabold tracking-tight">
            {Number(profile.withdrawable_balance).toLocaleString("es-MX", { style: "currency", currency: "MXN" })}
          </p>
          <p className="text-[10px] text-white/30">Instantly withdrawable to CLABE</p>
        </Card>

        <Card className="bg-[#13151e] border-white/5 p-5 space-y-2">
          <p className="text-white/40 text-xs font-medium">Total Earned (Lifetime)</p>
          <p className="text-white text-2xl font-extrabold tracking-tight">
            {Number(profile.total_earned).toLocaleString("es-MX", { style: "currency", currency: "MXN" })}
          </p>
          <p className="text-[10px] text-white/30">Commissions + referral bonuses</p>
        </Card>

        <Card className="bg-[#13151e] border-white/5 p-5 space-y-2">
          <p className="text-white/40 text-xs font-medium">Pending Hold (14-day)</p>
          <p className="text-amber-400 text-2xl font-extrabold tracking-tight">
            {Number(profile.total_pending_hold).toLocaleString("es-MX", { style: "currency", currency: "MXN" })}
          </p>
          <p className="text-[10px] text-white/30">Clearing into withdrawable balance</p>
        </Card>

        <Card className="bg-[#13151e] border-white/5 p-5 space-y-2">
          <p className="text-white/40 text-xs font-medium">Active Referrals</p>
          <p className="text-white text-2xl font-extrabold tracking-tight">
            {referred_users_count.toLocaleString()}
          </p>
          <p className="text-[10px] text-white/30">Referred community members</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column - tier card */}
        <div className="lg:col-span-1 space-y-4">
          <Card className="bg-[#13151e] border-white/5 p-5 space-y-4">
            <h3 className="text-white font-semibold text-sm flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#00d4aa]" />
              Current Commission Tier
            </h3>

            <div className="p-4 bg-white/[0.02] border border-white/5 rounded-lg flex items-center justify-between">
              <div>
                <p className="text-white font-bold text-base capitalize">{profile.tier_display}</p>
                <p className="text-white/40 text-[10px]">Active for this month</p>
              </div>
              <Badge className="bg-[#00d4aa]/15 text-[#00d4aa] border border-[#00d4aa]/20 text-xs font-bold px-2.5 py-1">
                {profile.tier === "base" ? "30% Rate" : "40% Rate"}
              </Badge>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs text-white/40">
                <span>Month's Escrow Volume</span>
                <span>{Number(monthly_volume).toLocaleString()} / 100,000 MXN</span>
              </div>
              <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-[#00d4aa]" style={{ width: `${tier_progress_pct}%` }} />
              </div>
              <p className="text-[10px] text-white/30 leading-relaxed">
                Reach 100,000 MXN in monthly referred transaction volume to get upgraded to the elevated 40% commission rate next month.
              </p>
            </div>
          </Card>
        </div>

        {/* Right column - recent ledger rewards */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="bg-[#13151e] border-white/5">
            <div className="p-5 border-b border-white/5 flex justify-between items-center">
              <h3 className="text-white font-semibold text-sm flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-400" />
                Recent Commissions
              </h3>
              <a href="/affiliate/rewards" className="text-[#00d4aa] text-xs hover:underline flex items-center gap-1">
                View Ledger <ArrowUpRight className="w-3 h-3" />
              </a>
            </div>

            <CardContent className="p-0">
              {recent_rewards.length === 0 ? (
                <div className="p-12 text-center">
                  <p className="text-white/30 text-xs">No commission ledger rewards found yet.</p>
                </div>
              ) : (
                <div className="divide-y divide-white/5">
                  {recent_rewards.map((reward) => (
                    <div key={reward.id} className="p-4 flex items-center justify-between hover:bg-white/[0.01] transition-all">
                      <div>
                        <p className="text-white text-xs font-semibold">
                          {reward.reward_type === "activation_bonus" ? "Sign-up Activation Bonus" : "Recurring Escrow Commission"}
                        </p>
                        <p className="text-white/40 text-[10px]">
                          {reward.referred_user_email ? `Referred user: ${reward.referred_user_email}` : "Activation Reward"}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-emerald-400 text-xs font-bold">
                          +{Number(reward.amount).toLocaleString("es-MX", { style: "currency", currency: "MXN" })}
                        </p>
                        <Badge className={`text-[9px] capitalize border ${
                          reward.state === "released" ? "bg-emerald-400/10 text-emerald-400 border-emerald-400/20" :
                          reward.state === "pending_hold" ? "bg-amber-400/10 text-amber-400 border-amber-400/20" :
                          "bg-red-400/10 text-red-400 border-red-400/20"
                        }`}>
                          {reward.state === "pending_hold" ? "Held" : reward.state}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
