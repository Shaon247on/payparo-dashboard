import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Clock, Circle, User } from "lucide-react";
// import AdminActionsPanel from "./AdminActionsPanel";
import type { EscrowDetail } from "@/types/escrow.type";

interface EscrowDetailPageProps {
  id: string;
  data: EscrowDetail;
}

// ─── Status badge ─────────────────────────────────────────────────────────────

const STATUS_STYLES: Record<string, string> = {
  dispute_in_progress: "bg-red-500/10 text-red-400 border-red-500/20",
  completed: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  in_progress: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  funded: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  created: "bg-white/5 text-white/50 border-white/10",
};

function StatusBadge({ status, label }: { status: string; label: string }) {
  const cls =
    STATUS_STYLES[status] ?? "bg-white/5 text-white/50 border-white/10";
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${cls}`}
    >
      {label}
    </span>
  );
}

// ─── Timeline ────────────────────────────────────────────────────────────────

function formatTimestamp(ts: string | null): string {
  if (!ts) return "—";
  return new Date(ts).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

export default function EscrowDetailPage({ data }: EscrowDetailPageProps) {
  const {
    item_name,
    transaction_id,
    status,
    status_label,
    seller,
    buyer,
    timeline,
    inspection_period,
    fee_breakdown,
  } = data;

  return (
    <div className="space-y-5">
      {/* Header card */}
      <Card className="bg-[#13151e] border-white/5">
        <CardContent className="flex flex-wrap items-center justify-between gap-4 px-5 py-4">
          <div>
            <p className="text-white/40 text-xs mb-1">Item Name</p>
            <p className="text-white text-xl font-bold">{item_name}</p>
          </div>
          <div className="flex items-center gap-4">
            <StatusBadge status={status} label={status_label} />
            <div className="text-right">
              <p className="text-white/40 text-xs mb-1">Transaction ID</p>
              <p className="text-white text-sm font-mono font-bold">
                {transaction_id}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-5">
        {/* ── Left ─────────────────────────────────────────────────────────── */}
        <div className="space-y-5">
          {/* Timeline */}
          <Card className="bg-[#13151e] border-white/5">
            <CardHeader className="px-5 pt-5 pb-3">
              <CardTitle className="text-white text-base font-semibold">
                Transaction Timeline
              </CardTitle>
            </CardHeader>
            <CardContent className="px-5 pb-5">
              <div className="relative">
                {/* Vertical connector */}
                <div className="absolute left-3 top-3 bottom-3 w-px bg-white/10" />
                <div className="space-y-6">
                  {timeline.map((step, i) => {
                    const isDone = !!step.timestamp;
                    const isCurrent = step.is_current;
                    return (
                      <div key={i} className="flex items-start gap-4">
                        <div className="relative z-10 mt-0.5 shrink-0">
                          {isDone ? (
                            <CheckCircle2
                              className={`w-6 h-6 ${
                                isCurrent
                                  ? "text-emerald-400"
                                  : "text-white/40"
                              }`}
                            />
                          ) : (
                            <Circle className="w-6 h-6 text-white/15" />
                          )}
                        </div>
                        <div>
                          <p
                            className={`text-sm font-medium ${
                              isDone ? "text-white" : "text-white/30"
                            }`}
                          >
                            {step.label}
                          </p>
                          <p className="text-white/35 text-xs mt-0.5">
                            {formatTimestamp(step.timestamp)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Fee Breakdown */}
          <Card className="bg-[#13151e] border-white/5">
            <CardHeader className="px-5 pt-5 pb-3">
              <CardTitle className="text-white text-base font-semibold">
                Fee Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent className="px-5 pb-5 space-y-0">
              <div className="flex justify-between py-3 border-b border-white/5">
                <span className="text-white/40 text-sm">Transaction Amount</span>
                <span className="text-white text-sm font-medium">
                  ${fee_breakdown.transaction_amount}
                </span>
              </div>
              <div className="flex justify-between py-3 border-b border-white/5">
                <span className="text-white/40 text-sm">
                  {fee_breakdown.platform_fee_label}
                </span>
                <span className="text-white text-sm font-medium">
                  ${fee_breakdown.platform_fee}
                </span>
              </div>
              <div className="flex justify-between py-3 border-b border-white/5">
                <span className="text-white/40 text-sm">Escrow Fee</span>
                <span className="text-white text-sm font-medium">
                  ${fee_breakdown.escrow_fee}
                </span>
              </div>
              <div className="flex justify-between py-3">
                <span className="text-white font-semibold text-sm">Total</span>
                <span className="text-white font-semibold text-sm">
                  ${fee_breakdown.total}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ── Right ────────────────────────────────────────────────────────── */}
        <div className="space-y-5">
          {/* Parties */}
          <Card className="bg-[#13151e] border-white/5">
            <CardHeader className="px-5 pt-5 pb-3">
              <CardTitle className="text-white text-base font-semibold">
                Parties
              </CardTitle>
            </CardHeader>
            <CardContent className="px-5 pb-5 space-y-4">
              {[buyer, seller].map((party) => (
                <div key={party.role} className="flex items-start gap-3">
                  <div className="p-1.5 bg-[#0099ff]/10 rounded-md shrink-0 mt-0.5">
                    <User className="w-4 h-4 text-[#0099ff]" />
                  </div>
                  <div>
                    <p className="text-white/40 text-xs">{party.label}</p>
                    <p className="text-white text-sm font-medium">{party.name}</p>
                    <p className="text-white/35 text-xs">{party.email}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Inspection Period */}
          {inspection_period.is_active && (
            <Card className="bg-[#13151e] border-white/5">
              <CardContent className="px-5 py-6 flex flex-col items-center text-center">
                <Clock className="w-7 h-7 text-amber-400 mb-2" />
                <p className="text-white/40 text-sm mb-1">
                  {inspection_period.title}
                </p>
                <p className="text-amber-400 text-3xl font-bold tracking-tight">
                  {inspection_period.value}
                </p>
                <p className="text-white/25 text-xs mt-2">
                  Deadline:{" "}
                  {new Date(inspection_period.deadline).toLocaleString("en-US", {
                    month: "short",
                    day: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: false,
                  })}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Admin Actions — only client island on this page */}
          {/* <AdminActionsPanel escrowId={id} actions={admin_actions} /> */}
        </div>
      </div>
    </div>
  );
}