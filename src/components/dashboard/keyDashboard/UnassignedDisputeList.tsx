"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical } from "lucide-react";
import Pagination from "@/components/shared/Pagination";
import { assignDisputeAction } from "@/actions/kyc/dispute.action";
import type { PaginatedUnassignedDisputeResponse, UnassignedDispute } from "@/types/kyc/dispute.type";
import { toast } from "sonner";
import Link from "next/link";

const PAGE_SIZE = 10;

// ── AI status badge config ────────────────────────────────────────────────────

const AI_STATUS_CONFIG: Record<string, { label: string; cls: string }> = {
  favor_buyer:        { label: "Favor Buyer",        cls: "border-[#0099ff]/50 text-[#0099ff]" },
  favor_seller:       { label: "Favor Seller",        cls: "border-emerald-500/50 text-emerald-400" },
  need_human_review:  { label: "Need Human Review",   cls: "border-amber-500/50 text-amber-400" },
  uncertain:          { label: "Uncertain",            cls: "border-white/20 text-white/50" },
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short", day: "2-digit", year: "numeric",
  });
}

// ── Row ───────────────────────────────────────────────────────────────────────

function DisputeRow({ dispute }: { dispute: UnassignedDispute }) {
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
    <Card className="bg-[#0f1117] border-white/5 hover:border-white/10 transition-colors">
      <CardContent className="px-5 py-4">
        <div className="grid grid-cols-2 md:grid-cols-[1fr_1fr_1fr_1fr_auto_auto] gap-4 items-center">
          {/* Product + order */}
          <div>
            <p className="text-white/35 text-xs mb-1 font-mono">{dispute.order_id}</p>
            <p className="text-white text-sm font-medium">{dispute.product_name}</p>
          </div>

          {/* Reason */}
          <div>
            <p className="text-white/35 text-xs mb-1">Reason</p>
            <p className="text-white text-sm font-medium">{dispute.reason}</p>
          </div>

          {/* Amount */}
          <div>
            <p className="text-white/35 text-xs mb-1">Escrow Amount</p>
            <p className="text-white text-sm font-medium">${dispute.escrow_price}</p>
          </div>

          {/* Date */}
          <div>
            <p className="text-white/35 text-xs mb-1">Submitted</p>
            <p className="text-white text-sm font-medium">{formatDate(dispute.created_at)}</p>
          </div>

          {/* AI status badge */}
          <div className="col-span-2 md:col-span-1">
            <span className={`inline-block border rounded-full px-4 py-1.5 text-xs font-semibold ${badge.cls}`}>
              {badge.label}
            </span>
          </div>

          {/* Actions menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="w-8 h-8 text-white/30 hover:text-white hover:bg-white/10 shrink-0"
              >
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="bg-[#1a1d27] border-white/10 text-white min-w-[150px]"
            >
              <DropdownMenuItem
                onClick={handleAssign}
                disabled={isPending}
                className="cursor-pointer hover:bg-white/5 focus:bg-white/5"
              >
                {isPending ? "Assigning…" : "Assign to Me"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  );
}

// ── List ──────────────────────────────────────────────────────────────────────

interface UnassignedDisputeListProps {
  data: PaginatedUnassignedDisputeResponse;
}

export default function UnassignedDisputeList({ data }: UnassignedDisputeListProps) {
  return (
    <Card className="bg-[#13151e] border-white/5">
      <CardHeader className="px-5 pt-5 pb-4 border-b border-white/5">
        <CardTitle className="text-white text-base font-semibold">
          All Disputes
          <span className="ml-2 text-white/30 font-normal text-sm">
            ({data.count} result{data.count !== 1 ? "s" : ""})
          </span>
        </CardTitle>
      </CardHeader>

      <CardContent className="p-4 space-y-3">
        {data.results.length === 0 ? (
          <div className="py-14 text-center text-white/25 text-sm">
            No disputes match your filters.
          </div>
        ) : (
          data.results.map((d) => <DisputeRow key={d.id} dispute={d} />)
        )}
      </CardContent>

      <Pagination totalCount={data.count} pageSize={PAGE_SIZE} paramKey="page" />
    </Card>
  );
}