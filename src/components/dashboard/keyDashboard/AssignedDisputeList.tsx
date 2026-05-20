import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow,
} from "@/components/ui/table";
import { Eye } from "lucide-react";
import Link from "next/link";
import Pagination from "@/components/shared/Pagination";
import type { PaginatedAssignedDisputeResponse } from "@/types/kyc/dispute.type";

const PAGE_SIZE = 10;

// ── Status badge ──────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<string, { label: string; cls: string }> = {
  pending_kyc: { label: "Pending",  cls: "border-amber-500/40 text-amber-400 bg-amber-400/5" },
  resolved:    { label: "Resolved", cls: "border-emerald-500/40 text-emerald-400 bg-emerald-400/5" },
};

// ── Confidence display ────────────────────────────────────────────────────────

function ConfidenceDisplay({ value }: { value: number }) {
  const pct = Math.round(value * 100);
  const cls =
    value >= 0.7 ? "text-emerald-400"
    : value >= 0.4 ? "text-amber-400"
    : "text-red-400";
  return <span className={`text-sm font-medium ${cls}`}>{pct}%</span>;
}

// ── Component ─────────────────────────────────────────────────────────────────

interface AssignedDisputeListProps {
  data: PaginatedAssignedDisputeResponse;
}

export default function AssignedDisputeList({ data }: AssignedDisputeListProps) {
  return (
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
              <TableHead className="text-white/35 font-medium px-5">Dispute</TableHead>
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
                const status = STATUS_CONFIG[d.current_status] ?? STATUS_CONFIG.pending_kyc;
                return (
                  <TableRow
                    key={d.id}
                    className="border-white/5 hover:bg-white/2 transition-colors"
                  >
                    <TableCell className="text-white font-medium px-5 py-4 text-sm">
                      {d.kyc_name}
                    </TableCell>
                    <TableCell className="text-white/70 font-mono text-sm">
                      {d.transaction_id}
                    </TableCell>
                    <TableCell className="text-white/70 text-sm">{d.claim_type}</TableCell>
                    <TableCell className="text-white/70 text-sm">${d.escrow_amount}</TableCell>
                    <TableCell>
                      <ConfidenceDisplay value={d.ai_confidence} />
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${status.cls}`}>
                        {status.label}
                      </span>
                    </TableCell>
                    <TableCell className="text-right pr-5">
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
  );
}