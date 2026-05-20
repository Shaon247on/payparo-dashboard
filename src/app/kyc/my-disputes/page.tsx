import { Suspense } from "react";
import SearchInput from "@/components/shared/SearchInput";
import StatusFilter from "@/components/shared/StatusFilter";
import { getAssignedDisputesAction } from "@/actions/kyc/dispute.action";
import { CONFIDENCE_BAND_MAP, type ConfidenceBand, type DisputeCurrentStatus } from "@/types/kyc/dispute.type";
import { AlertCircle, Shield, CheckCircle2, Clock } from "lucide-react";
import AssignedDisputeList from "@/components/dashboard/keyDashboard/AssignedDisputeList";

const STATUS_OPTIONS = [
  { label: "Pending Review", value: "pending_kyc" },
  { label: "Buyer Won",      value: "accepted"    },
  { label: "Seller Won",     value: "declined"    },
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

  // Calculate stats from results
  const stats = result.success
    ? {
        total: result.data.count,
        pending: result.data.results.filter(d => d.current_status === 'pending_kyc').length,
        resolved: result.data.results.filter(d => d.current_status === 'resolved').length,
      }
    : { total: 0, pending: 0, resolved: 0 };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-blue-400" />
          <h1 className="text-2xl font-bold text-white">My Disputes</h1>
        </div>
        <p className="text-white/50 text-sm">
          Manage and resolve assigned disputes with AI-assisted confidence scores
        </p>
      </div>

      {/* Stats Cards */}
      {result.success && result.data.count > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/60 text-xs font-medium uppercase tracking-wide">Total Assigned</p>
                <p className="text-xl font-bold text-white mt-1.5">{stats.total}</p>
              </div>
              <Shield className="w-6 h-6 text-blue-400/40" />
            </div>
          </div>

          <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/60 text-xs font-medium uppercase tracking-wide">Pending</p>
                <p className="text-xl font-bold text-amber-400 mt-1.5">{stats.pending}</p>
              </div>
              <Clock className="w-6 h-6 text-amber-400/40" />
            </div>
          </div>

          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/60 text-xs font-medium uppercase tracking-wide">Resolved</p>
                <p className="text-xl font-bold text-emerald-400 mt-1.5">{stats.resolved}</p>
              </div>
              <CheckCircle2 className="w-6 h-6 text-emerald-400/40" />
            </div>
          </div>
        </div>
      )}

      {/* Filters Section */}
      <Suspense fallback={<div className="h-11" />}>
        <div className="bg-white/5 border border-white/10 rounded-lg p-3">
          <p className="text-white/50 text-xs font-medium uppercase tracking-wide mb-2.5">Filter & Search</p>
          <div className="flex flex-col sm:flex-row gap-2">
            <SearchInput
              paramKey="q"
              placeholder="Search by name, transaction ID, claim type…"
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
        </div>
      </Suspense>

      {/* Error State */}
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