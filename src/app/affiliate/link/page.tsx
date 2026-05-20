import { AlertCircle, Link2, Copy, Users, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { getAffiliateReferralLinkAction } from "@/actions/affiliate.action";
import CopyButton from "@/components/shared/CopyButton";

export default async function AffiliateLinkPage() {
  const result = await getAffiliateReferralLinkAction();

  if (!result.success) {
    return (
      <div className="flex items-center gap-3 rounded-lg border border-rose-500/20 bg-rose-500/5 px-5 py-4 text-sm text-rose-400">
        <AlertCircle className="w-4 h-4 shrink-0" />
        <span>{result.error}</span>
      </div>
    );
  }

  const { slug, referral_url, total_clicks, converted_clicks, conversion_rate } = result.data;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-white text-2xl font-bold">Vanity Referral Link</h2>
        <p className="text-white/40 text-sm mt-1">
          Share your vanity URL on Telegram or Discord to automatically track conversions
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Referral Card */}
        <Card className="bg-[#13151e] border-white/5 lg:col-span-2 p-6 space-y-4">
          <div className="space-y-2">
            <h3 className="text-white font-semibold text-sm">Your Referral URL</h3>
            <p className="text-white/40 text-xs">
              Every signup via this URL is linked to your affiliate account for lifetime recurring commissions.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-white/[0.02] border border-white/10 rounded-lg px-4 py-3 text-white font-mono text-sm break-all">
            <span className="flex-1 text-[#00d4aa] select-all">{referral_url}</span>
            <CopyButton value={referral_url} />
          </div>

          <div className="pt-4 border-t border-white/5 grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-white/40 text-xs mb-1">Total Clicks</p>
              <p className="text-white text-lg font-bold">{total_clicks.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-white/40 text-xs mb-1">Sign-up Conversions</p>
              <p className="text-emerald-400 text-lg font-bold">{converted_clicks.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-white/40 text-xs mb-1">Conversion Rate</p>
              <p className="text-white text-lg font-bold">{conversion_rate}%</p>
            </div>
          </div>
        </Card>

        {/* Info Card */}
        <Card className="bg-[#13151e] border-white/5 p-5 space-y-3">
          <h4 className="text-white font-semibold text-xs uppercase tracking-wider">How Attribution Works</h4>
          <ul className="space-y-3.5 text-xs text-white/50 leading-relaxed">
            <li className="flex gap-2">
              <span className="w-5 h-5 rounded-full bg-[#00d4aa]/10 text-[#00d4aa] flex items-center justify-center font-bold text-[10px] shrink-0">1</span>
              <span>Referred user clicks your link, and we set a secure, long-lasting 30-day cookie.</span>
            </li>
            <li className="flex gap-2">
              <span className="w-5 h-5 rounded-full bg-[#00d4aa]/10 text-[#00d4aa] flex items-center justify-center font-bold text-[10px] shrink-0">2</span>
              <span>When they sign up (even days later), the system attributes them to your account.</span>
            </li>
            <li className="flex gap-2">
              <span className="w-5 h-5 rounded-full bg-[#00d4aa]/10 text-[#00d4aa] flex items-center justify-center font-bold text-[10px] shrink-0">3</span>
              <span>You earn 30%-40% of our escrow fee on every single transaction they perform. Lifetime.</span>
            </li>
          </ul>
        </Card>
      </div>
    </div>
  );
}
