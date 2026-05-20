"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Pagination from "@/components/shared/Pagination";
import { assignDisputeAction } from "@/actions/kyc/dispute.action";
import type { PaginatedUnassignedDisputeResponse, UnassignedDispute } from "@/types/kyc/dispute.type";
import { toast } from "sonner";
import {
  AlertTriangle,
  ArrowRight,
  Calendar,
  DollarSign,
  Loader2,
  ShieldAlert,
  Tag,
} from "lucide-react";

const PAGE_SIZE = 10;

// ── AI verdict config ─────────────────────────────────────────────────────────

const AI_STATUS_CONFIG: Record<string, { label: string; bg: string; text: string; border: string }> = {
  favor_buyer:       { label: "Favor Buyer",       bg: "bg-sky-500/10",   text: "text-sky-400",   border: "border-sky-500/25"   },
  favor_seller:      { label: "Favor Seller",      bg: "bg-emerald-500/10", text: "text-emerald-400", border: "border-emerald-500/25" },
  need_human_review: { label: "Needs Review",      bg: "bg-amber-500/10", text: "text-amber-400", border: "border-amber-500/25"  },
  uncertain:         { label: "Uncertain",          bg: "bg-white/5",      text: "text-white/40",  border: "border-white/10"     },
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short", day: "2-digit", year: "numeric",
  });
}

// ── Card row ──────────────────────────────────────────────────────────────────

function DisputeCard({ dispute }: { dispute: UnassignedDispute }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const badge = AI_STATUS_CONFIG[dispute.ai_status] ?? AI_STATUS_CONFIG.uncertain;

  const handleAssign = () => {
    startTransition(async () => {
      const result = await assignDisputeAction(dispute.id);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success(result.data.message);
      router.refresh();
    });
  };

  return (
    <div className="bg-[#13151e] border border-white/5 hover:border-white/10 rounded-xl p-5 transition-all group">
      {/* Top row: order id + AI badge */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <p className="text-white/35 text-[11px] font-mono mb-0.5 tracking-wider">
            {dispute.order_id}
          </p>
          <h3 className="text-white text-sm font-semibold leading-snug line-clamp-1">
            {dispute.product_name}
          </h3>
        </div>
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border shrink-0 ${badge.bg} ${badge.text} ${badge.border}`}>
          {badge.label}
        </span>
      </div>

      {/* Meta grid */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1 text-white/30">
            <Tag className="w-3 h-3" />
            <span className="text-[11px]">Reason</span>
          </div>
          <span className="text-white/70 text-xs font-medium line-clamp-1">{dispute.reason}</span>
        </div>

        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1 text-white/30">
            <DollarSign className="w-3 h-3" />
            <span className="text-[11px]">Value</span>
          </div>
          <span className="text-white/70 text-xs font-medium">
            ${Number(dispute.escrow_price).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>

        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1 text-white/30">
            <Calendar className="w-3 h-3" />
            <span className="text-[11px]">Filed</span>
          </div>
          <span className="text-white/70 text-xs font-medium">{formatDate(dispute.created_at)}</span>
        </div>
      </div>

      {/* Action */}
      <div className="pt-4 border-t border-white/5 flex justify-end">
        <Button
          onClick={handleAssign}
          disabled={isPending}
          size="sm"
          className="bg-[#0091e5] hover:bg-[#007acc] text-white text-xs font-semibold h-8 px-4 rounded-lg flex items-center gap-1.5 transition-all shadow-md shadow-[#0091e5]/10 disabled:opacity-60"
        >
          {isPending ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <ArrowRight className="w-3.5 h-3.5" />
          )}
          {isPending ? "Claiming…" : "Claim Case"}
        </Button>
      </div>
    </div>
  );
}

// ── Empty state ───────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="p-4 rounded-2xl bg-emerald-500/10 mb-4">
        <ShieldAlert className="w-8 h-8 text-emerald-400" />
      </div>
      <p className="text-white font-semibold text-base">All disputes cleared</p>
      <p className="text-white/40 text-sm mt-1.5 max-w-xs">
        No disputes match your current filters. The queue is up to date.
      </p>
    </div>
  );
}

// ── Main list ─────────────────────────────────────────────────────────────────

interface UnassignedDisputeListProps {
  data: PaginatedUnassignedDisputeResponse;
}

export default function UnassignedDisputeList({ data }: UnassignedDisputeListProps) {
  const needsReview = data.results.filter((d) => d.ai_status === "need_human_review").length;
  const favorBuyer  = data.results.filter((d) => d.ai_status === "favor_buyer").length;
  const favorSeller = data.results.filter((d) => d.ai_status === "favor_seller").length;

  return (
    <div className="space-y-5">
      {/* Summary strip */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Total in Queue", value: data.count,    icon: AlertTriangle, color: "text-white/60",  bg: "bg-white/5"          },
          { label: "Favor Buyer",    value: favorBuyer,    icon: ShieldAlert,   color: "text-sky-400",   bg: "bg-sky-500/10"       },
          { label: "Needs Review",   value: needsReview,   icon: ShieldAlert,   color: "text-amber-400", bg: "bg-amber-500/10"     },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <Card key={label} className="bg-[#13151e] border-white/5">
            <CardContent className="flex items-center gap-3 p-4">
              <div className={`p-1.5 rounded-md ${bg}`}>
                <Icon className={`w-4 h-4 ${color}`} />
              </div>
              <div>
                <p className="text-white/40 text-xs">{label}</p>
                <p className="text-white font-bold text-lg leading-none mt-0.5">{value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Card grid */}
      <Card className="bg-[#0f1117] border-white/5">
        <CardHeader className="px-5 pt-5 pb-4 border-b border-white/5">
          <CardTitle className="text-white text-base font-semibold flex items-center gap-2">
            Unassigned Disputes
            <span className="text-white/30 font-normal text-sm">
              ({data.count} case{data.count !== 1 ? "s" : ""})
            </span>
          </CardTitle>
        </CardHeader>

        <CardContent className="p-4">
          {data.results.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {data.results.map((d) => (
                <DisputeCard key={d.id} dispute={d} />
              ))}
            </div>
          )}
        </CardContent>

        <Pagination totalCount={data.count} pageSize={PAGE_SIZE} paramKey="page" />
      </Card>
    </div>
  );
}