import { Suspense } from "react";
import SearchInput from "@/components/shared/SearchInput";
import StatusFilter from "@/components/shared/StatusFilter";
import { getUnassignedDisputesAction } from "@/actions/kyc/dispute.action";
import { CONFIDENCE_BAND_MAP, type AiStatus, type ConfidenceBand } from "@/types/kyc/dispute.type";
import { AlertCircle } from "lucide-react";
import UnassignedDisputeList from "@/components/dashboard/keyDashboard/UnassignedDisputeList";

// ── Filter option definitions ─────────────────────────────────────────────────

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

  // Map band → exact min/max pair. Both params sent together or neither.
  const band = confidence as ConfidenceBand | undefined;
  const confidenceRange =
    band && CONFIDENCE_BAND_MAP[band] ? CONFIDENCE_BAND_MAP[band] : undefined;

  const result = await getUnassignedDisputesAction({
    q: q,
    status: status as AiStatus | undefined,
    min_confidence: confidenceRange?.min,
    max_confidence: confidenceRange?.max,
    page: page ? Number(page) : 1,
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-white text-2xl font-bold">Dispute Management</h2>
        <p className="text-white/40 text-sm mt-1">
          AI-powered dispute resolution with human oversight
        </p>
      </div>

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
            allLabel="All Results"
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
        <div className="flex items-center gap-3 rounded-lg border border-rose-500/20 bg-rose-500/5 px-5 py-4 text-sm text-rose-400">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{result.error}</span>
        </div>
      ) : (
        <UnassignedDisputeList data={result.data} />
      )}
    </div>
  );
}