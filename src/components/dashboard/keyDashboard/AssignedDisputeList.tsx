import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow,
} from "@/components/ui/table";
import { Eye, CheckCircle2, XCircle, Clock, Loader2 } from "lucide-react";
import Link from "next/link";
import Pagination from "@/components/shared/Pagination";
import type { DisputeCurrentStatus, PaginatedAssignedDisputeResponse } from "@/types/kyc/dispute.type";
import { isDisputeResolved } from "@/types/kyc/dispute.type";

const PAGE_SIZE = 10;

// ── Status badge ──────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<
  string,
  { label: string; cls: string; icon: React.ElementType }
> = {
  pending_kyc: {
    label: "Pending Review",
    cls:   "border-amber-500/40 text-amber-400 bg-amber-400/5",
    icon:  Clock,
  },
  pending_ai: {
    label: "AI Processing",
    cls:   "border-sky-500/40 text-sky-400 bg-sky-400/5",
    icon:  Loader2,
  },
  accepted: {
    label: "Resolved · Buyer Won",
    cls:   "border-emerald-500/40 text-emerald-400 bg-emerald-400/5",
    icon:  CheckCircle2,
  },
  declined: {
    label: "Resolved · Seller Won",
    cls:   "border-purple-500/40 text-purple-400 bg-purple-400/5",
    icon:  CheckCircle2,
  },
  resolved: {
    label: "Resolved",
    cls:   "border-emerald-500/40 text-emerald-400 bg-emerald-400/5",
    icon:  CheckCircle2,
  },
};

const FALLBACK_STATUS = {
  label: "Unknown",
  cls:   "border-white/20 text-white/40",
  icon:  XCircle,
};

// ── Confidence display ────────────────────────────────────────────────────────

function ConfidenceDisplay({ value }: { value: number }) {
  const pct = Math.round(value * 100);
  const cls =
    value >= 0.7 ? "text-emerald-400"
    : value >= 0.4 ? "text-amber-400"
    : "text-rose-400";
  return (
    <div className="flex items-center gap-1.5">
      <div className="w-12 h-1.5 rounded-full bg-white/10 overflow-hidden">
        <div
          className={`h-full rounded-full ${value >= 0.7 ? "bg-emerald-400" : value >= 0.4 ? "bg-amber-400" : "bg-rose-400"}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className={`text-xs font-medium tabular-nums ${cls}`}>{pct}%</span>
    </div>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────

interface AssignedDisputeListProps {
  data: PaginatedAssignedDisputeResponse;
}

export default function AssignedDisputeList({ data }: AssignedDisputeListProps) {
  const pendingCount  = data.results.filter((d) => d.current_status === "pending_kyc").length;
  const resolvedCount = data.results.filter((d) => isDisputeResolved(d.current_status as DisputeCurrentStatus)).length;

  return (
    <div className="space-y-4">
      {/* Summary strip */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Total Assigned", value: data.count,        cls: "text-white/60", bg: "bg-white/5"          },
          { label: "Pending Review", value: pendingCount,      cls: "text-amber-400", bg: "bg-amber-500/10"    },
          { label: "Resolved",       value: resolvedCount,     cls: "text-emerald-400", bg: "bg-emerald-500/10" },
        ].map(({ label, value, cls, bg }) => (
          <div key={label} className={`rounded-xl border border-white/5 ${bg} px-4 py-3`}>
            <p className="text-white/40 text-xs">{label}</p>
            <p className={`font-bold text-lg leading-none mt-0.5 ${cls}`}>{value}</p>
          </div>
        ))}
      </div>

      <Card className="bg-[#13151e] border-white/5">
        <CardHeader className="px-5 pt-5 pb-0">
          <CardTitle className="text-white text-base font-semibold">
            My Assigned Disputes
            <span className="ml-2 text-white/30 font-normal text-sm">
              ({data.count} result{data.count !== 1 ? "s" : ""})
            </span>
          </CardTitle>
        </CardHeader>

        <CardContent className="p-0 mt-4">
          <Table>
            <TableHeader>
              <TableRow className="border-white/5 hover:bg-transparent">
                <TableHead className="text-white/35 font-medium px-5">Claimant</TableHead>
                <TableHead className="text-white/35 font-medium">Transaction</TableHead>
                <TableHead className="text-white/35 font-medium">Claim Type</TableHead>
                <TableHead className="text-white/35 font-medium">Amount</TableHead>
                <TableHead className="text-white/35 font-medium">AI Confidence</TableHead>
                <TableHead className="text-white/35 font-medium">Status</TableHead>
                <TableHead className="text-white/35 font-medium text-right pr-5">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.results.length === 0 ? (
                <TableRow className="border-white/5 hover:bg-transparent">
                  <TableCell colSpan={7} className="text-center py-16 text-white/25 text-sm">
                    No assigned disputes found.
                  </TableCell>
                </TableRow>
              ) : (
                data.results.map((d) => {
                  const cfg = STATUS_CONFIG[d.current_status] ?? FALLBACK_STATUS;
                  const Icon = cfg.icon;
                  const closed = isDisputeResolved(d.current_status as DisputeCurrentStatus);
                  return (
                    <TableRow
                      key={d.id}
                      className={`border-white/5 hover:bg-white/[0.02] transition-colors ${closed ? "opacity-60" : ""}`}
                    >
                      <TableCell className="text-white font-medium px-5 py-4 text-sm">
                        {d.kyc_name}
                      </TableCell>
                      <TableCell className="text-white/60 font-mono text-xs py-4">
                        {d.transaction_id}
                      </TableCell>
                      <TableCell className="text-white/70 text-sm py-4">{d.claim_type}</TableCell>
                      <TableCell className="text-white/70 text-sm py-4">
                        ${Number(d.escrow_amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell className="py-4">
                        <ConfidenceDisplay value={d.ai_confidence} />
                      </TableCell>
                      <TableCell className="py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${cfg.cls}`}>
                          <Icon className="w-3 h-3" />
                          {cfg.label}
                        </span>
                      </TableCell>
                      <TableCell className="text-right pr-5 py-4">
                        <Link href={`/kyc/my-disputes/${d.id}`}>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="w-8 h-8 bg-white/5 hover:bg-white/10 text-white/60 hover:text-white rounded-md"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>

          <Pagination totalCount={data.count} pageSize={PAGE_SIZE} paramKey="page" />
        </CardContent>
      </Card>
    </div>
  );
}