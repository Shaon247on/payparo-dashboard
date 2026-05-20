import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow,
} from "@/components/ui/table";
import { Eye, AlertCircle, TrendingUp } from "lucide-react";
import Link from "next/link";
import Pagination from "@/components/shared/Pagination";
import type { PaginatedAssignedDisputeResponse } from "@/types/kyc/dispute.type";

const PAGE_SIZE = 10;

// ── Status badge ──────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<string, { label: string; cls: string; icon: string }> = {
  pending_kyc: {
    label: "Pending",
    cls: "border-amber-500/30 text-amber-300 bg-amber-500/10 shadow-lg shadow-amber-500/10",
    icon: "⏱️"
  },
  resolved: {
    label: "Resolved",
    cls: "border-emerald-500/30 text-emerald-300 bg-emerald-500/10 shadow-lg shadow-emerald-500/10",
    icon: "✓"
  },
};

// ── Confidence display with progress bar ────────────────────────────────────

function ConfidenceDisplay({ value }: { value: number }) {
  const pct = Math.round(value * 100);
  const cls =
    value >= 0.7 ? "text-emerald-400"
    : value >= 0.4 ? "text-amber-400"
    : "text-red-400";

  return <span className={`text-xs font-semibold ${cls}`}>{pct}%</span>;
}

// ── Component ─────────────────────────────────────────────────────────────────

interface AssignedDisputeListProps {
  data: PaginatedAssignedDisputeResponse;
}

export default function AssignedDisputeList({ data }: AssignedDisputeListProps) {
  return (
    <Card className="bg-white/5 border border-white/10">
      <CardHeader className="px-5 pt-5 pb-3 border-b border-white/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-blue-500/10 rounded-lg border border-blue-500/20">
              <TrendingUp className="w-4 h-4 text-blue-400" />
            </div>
            <div>
              <CardTitle className="text-white text-base font-semibold">
                Assigned Disputes
              </CardTitle>
              <p className="text-white/40 text-xs mt-0.5">
                {data.count} total
              </p>
            </div>
          </div>
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg px-2.5 py-1">
            <span className="text-blue-300 text-xs font-semibold">{data.count}</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-white/5 hover:bg-transparent">
                <TableHead className="text-white/40 font-semibold px-5 py-3 text-xs uppercase tracking-wider">Dispute ID</TableHead>
                <TableHead className="text-white/40 font-semibold px-4 py-3 text-xs uppercase tracking-wider">Transaction</TableHead>
                <TableHead className="text-white/40 font-semibold px-4 py-3 text-xs uppercase tracking-wider">Claim Type</TableHead>
                <TableHead className="text-white/40 font-semibold px-4 py-3 text-xs uppercase tracking-wider text-center">Amount</TableHead>
                <TableHead className="text-white/40 font-semibold px-4 py-3 text-xs uppercase tracking-wider text-center">AI Confidence</TableHead>
                <TableHead className="text-white/40 font-semibold px-4 py-3 text-xs uppercase tracking-wider">Status</TableHead>
                <TableHead className="text-white/40 font-semibold px-4 py-3 text-xs uppercase tracking-wider text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.results.length === 0 ? (
                <TableRow className="border-white/5 hover:bg-transparent">
                  <TableCell colSpan={7} className="py-8">
                    <div className="flex flex-col items-center justify-center gap-1.5">
                      <div className="p-2 bg-white/5 rounded-lg border border-white/10">
                        <AlertCircle className="w-5 h-5 text-white/30" />
                      </div>
                      <p className="text-white/40 text-sm font-medium">No disputes assigned yet</p>
                      <p className="text-white/20 text-xs">Assigned disputes will appear here</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                data.results.map((d, idx) => {
                  const status = STATUS_CONFIG[d.current_status] ?? STATUS_CONFIG.pending_kyc;
                  return (
                    <TableRow
                      key={d.id}
                      className="border-white/5 hover:bg-white/5 transition-colors duration-200 group"
                    >
                      <TableCell className="text-white font-semibold px-5 py-3 text-sm">
                        <span className="flex items-center gap-1.5">
                          <span className="w-5 h-5 flex items-center justify-center rounded-full bg-white/10 text-white/60 text-xs font-bold group-hover:bg-blue-500/20 group-hover:text-blue-400 transition-colors">
                            {idx + 1}
                          </span>
                          {d.kyc_name}
                        </span>
                      </TableCell>
                      <TableCell className="text-white/70 font-mono text-xs px-4 py-3 break-all max-w-xs">
                        {d.transaction_id}
                      </TableCell>
                      <TableCell className="text-white/70 text-sm px-4 py-3">
                        <span className="bg-white/5 border border-white/10 rounded-md px-2 py-0.5 text-xs font-medium">
                          {d.claim_type}
                        </span>
                      </TableCell>
                      <TableCell className="text-emerald-400 font-semibold text-sm px-4 py-3 text-center">
                        ${Number(d.escrow_amount).toLocaleString()}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-center">
                        <ConfidenceDisplay value={d.ai_confidence} />
                      </TableCell>
                      <TableCell className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold border ${status.cls}`}>
                          {status.icon} {status.label}
                        </span>
                      </TableCell>
                      <TableCell className="text-right px-4 py-3">
                        <Link href={`/kyc/my-disputes/${d.id}`}>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="w-8 h-8 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 text-blue-400 hover:text-blue-300 rounded-lg transition-all duration-200"
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
        </div>

        <Pagination totalCount={data.count} pageSize={PAGE_SIZE} paramKey="page" />
      </CardContent>
    </Card>
  );
}