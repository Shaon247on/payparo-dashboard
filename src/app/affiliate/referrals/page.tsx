import { Suspense } from "react";
import { AlertCircle, Users } from "lucide-react";
import { Card, CardContent } from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import { getAffiliateReferralsAction } from "@/actions/affiliate.action";
import type { AffiliateAttribution } from "@/types/affiliate.type";
import Pagination from "@/components/shared/Pagination";

interface PageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function AffiliateReferralsPage({ searchParams }: PageProps) {
  const { page } = await searchParams;
  const currentPage = page ? Number(page) : 1;

  const result = await getAffiliateReferralsAction({
    page: currentPage,
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-white text-2xl font-bold">Referred Users</h2>
        <p className="text-white/40 text-sm mt-1">
          Monitor community members who signed up using your link
        </p>
      </div>

      {/* Content */}
      {!result.success ? (
        <div className="flex items-center gap-3 rounded-lg border border-rose-500/20 bg-rose-500/5 px-5 py-4 text-sm text-rose-400">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{result.error}</span>
        </div>
      ) : result.data.results.length === 0 ? (
        <Card className="bg-[#13151e] border-white/5">
          <CardContent className="p-12 text-center">
            <Users className="w-10 h-10 text-white/20 mx-auto mb-3" />
            <p className="text-white/40 text-sm">No referred users found yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <div className="space-y-2">
            {result.data.results.map((attribution) => (
              <ReferralCard key={attribution.id} attribution={attribution} />
            ))}
          </div>

          <Pagination totalCount={result.data.count} pageSize={20} />
        </div>
      )}
    </div>
  );
}

function ReferralCard({ attribution }: { attribution: AffiliateAttribution }) {
  return (
    <Card className="bg-[#13151e] border-white/5">
      <CardContent className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-white text-xs font-semibold">
              {attribution.referred_user_full_name || "Community Member"}
            </span>
            <span className="text-white/40 text-[10px]">({attribution.referred_user_email})</span>
            {attribution.fraud_flagged && (
              <Badge className="bg-red-500/10 text-red-400 border border-red-500/20 text-[9px] capitalize">
                Flagged / Blocked
              </Badge>
            )}
          </div>
          <p className="text-[10px] text-white/30">
            Joined: {new Date(attribution.attributed_at).toLocaleDateString()}
          </p>
        </div>

        <div className="grid grid-cols-3 gap-6 md:gap-12 text-left md:text-right">
          <div>
            <p className="text-white/40 text-[10px] mb-0.5">Transactions</p>
            <p className="text-white text-xs font-bold">{attribution.transaction_count}</p>
          </div>
          <div>
            <p className="text-white/40 text-[10px] mb-0.5">Total Volume</p>
            <p className="text-white text-xs font-bold">
              {Number(attribution.total_volume).toLocaleString("es-MX", { style: "currency", currency: "MXN" })}
            </p>
          </div>
          <div>
            <p className="text-white/40 text-[10px] mb-0.5">Commissions</p>
            <p className="text-emerald-400 text-xs font-bold">
              {Number(attribution.total_commission_earned).toLocaleString("es-MX", { style: "currency", currency: "MXN" })}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
