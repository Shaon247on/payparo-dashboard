import { Suspense } from "react";
import SearchInput from "@/components/shared/SearchInput";
import StatusFilter from "@/components/shared/StatusFilter";
import { getAssignedDisputesAction } from "@/actions/kyc/dispute.action";
import { CONFIDENCE_BAND_MAP, type ConfidenceBand, type DisputeCurrentStatus } from "@/types/kyc/dispute.type";
import { AlertCircle } from "lucide-react";
import AssignedDisputeList from "@/components/dashboard/keyDashboard/AssignedDisputeList";

const STATUS_OPTIONS = [
  { label: "Pending",  value: "pending_kyc" },
  { label: "Resolved", value: "resolved" },
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

  const result = await getAssignedDisputesAction({
    q: q,
    status: status as DisputeCurrentStatus | undefined,
    min_confidence: confidenceRange?.min,
    max_confidence: confidenceRange?.max,
    page: page ? Number(page) : 1,
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-white text-2xl font-bold">My Disputes</h2>
        <p className="text-white/40 text-sm mt-1">
          Your assigned disputes and resolution progress
        </p>
      </div>

      <Suspense fallback={<div className="h-11" />}>
        <div className="flex flex-col sm:flex-row gap-3">
          <SearchInput
            paramKey="q"
            placeholder="Search by name, transaction, claim type…"
          />
          <StatusFilter
            paramKey="status"
            options={STATUS_OPTIONS}
            allValue="all"
            allLabel="All Status"
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
        <AssignedDisputeList data={result.data} />
      )}
    </div>
  );
}