import { Suspense } from "react";
import SearchInput from "@/components/shared/SearchInput";
import StatusFilter from "@/components/shared/StatusFilter";
import { getUnassignedDisputesAction } from "@/actions/kyc/dispute.action";
import { CONFIDENCE_BAND_MAP, type AiStatus, type ConfidenceBand } from "@/types/kyc/dispute.type";
import { AlertCircle, ShieldAlert } from "lucide-react";
import UnassignedDisputeList from "@/components/dashboard/keyDashboard/UnassignedDisputeList";

const AI_STATUS_OPTIONS = [
  { label: "Favor Buyer",       value: "favor_buyer" },
  { label: "Favor Seller",      value: "favor_seller" },
  { label: "Need Human Review", value: "need_human_review" },
];

const CONFIDENCE_OPTIONS = [
  { label: "High (≥70%)",     value: "high" },
  { label: "Medium (40–69%)", value: "medium" },
  { label: "Low (<40%)",      value: "low" },
];

interface PageProps {
  searchParams: Promise<{
    q?: string;
    status?: string;
    confidence?: string;
    page?: string;
  }>;
}

export default async function Page({ searchParams }: PageProps) {
  const { q, status, confidence, page } = await searchParams;

  const band = confidence as ConfidenceBand | undefined;
  const confidenceRange =
    band && CONFIDENCE_BAND_MAP[band] ? CONFIDENCE_BAND_MAP[band] : undefined;

  const result = await getUnassignedDisputesAction({
    q,
    status: status as AiStatus | undefined,
    min_confidence: confidenceRange?.min,
    max_confidence: confidenceRange?.max,
    page: page ? Number(page) : 1,
  });

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-md bg-amber-500/10">
              <ShieldAlert className="w-4 h-4 text-amber-400" />
            </div>
            <h2 className="text-white text-2xl font-bold tracking-tight">Dispute Queue</h2>
          </div>
          <p className="text-white/40 text-sm mt-1 ml-0.5">
            AI-triaged cases awaiting specialist assignment and resolution
          </p>
        </div>
      </div>

      {/* Search + Filters */}
      <Suspense fallback={<div className="h-11" />}>
        <div className="flex flex-col sm:flex-row gap-3">
          <SearchInput
            paramKey="q"
            placeholder="Search by product, order ID, reason…"
          />
          <StatusFilter
            paramKey="status"
            options={AI_STATUS_OPTIONS}
            allValue="all"
            allLabel="All AI Verdicts"
          />
          <StatusFilter
            paramKey="confidence"
            options={CONFIDENCE_OPTIONS}
            allValue="all"
            allLabel="All Confidence"
          />
        </div>
      </Suspense>

      {!result.success ? (
        <div className="flex items-center gap-3 rounded-xl border border-rose-500/20 bg-rose-500/5 px-5 py-4 text-sm text-rose-400">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{result.error}</span>
        </div>
      ) : (
        <UnassignedDisputeList data={result.data} />
      )}
    </div>
  );
}