"use client";

import { useState, useTransition } from "react";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Textarea } from "../../ui/textarea";
import { CheckCircle, XCircle, FileText, Ban } from "lucide-react";
import { updateAffiliateWithdrawalStatusAction } from "@/actions/affiliate.admin.action";
import { useRouter } from "next/navigation";
import type { AdminAffiliateWithdrawal } from "@/types/affiliate.type";

interface Props {
  withdrawal: AdminAffiliateWithdrawal;
}

export default function AffiliateWithdrawalActions({ withdrawal }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [action, setAction] = useState<"approve" | "complete" | "reject" | null>(null);
  const [isr, setIsr] = useState("");
  const [ref, setRef] = useState("");
  const [notes, setNotes] = useState("");
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = () => {
    if (!action) return;
    setError("");
    startTransition(async () => {
      const result = await updateAffiliateWithdrawalStatusAction(withdrawal.id, {
        status: action === "approve" ? "approved" : action === "complete" ? "completed" : "rejected",
        isr_withholding: action === "approve" ? isr : undefined,
        transaction_ref: action === "complete" ? ref : undefined,
        admin_notes: notes || undefined,
        rejection_reason: action === "reject" ? reason : undefined,
      });

      if (result.success) {
        setAction(null);
        setIsr("");
        setRef("");
        setReason("");
        router.refresh();
      } else {
        setError(result.error);
      }
    });
  };

  return (
    <div className="mt-4 pt-4 border-t border-white/5 space-y-4">
      {error && (
        <p className="text-rose-400 text-xs bg-rose-500/5 border border-rose-500/10 px-3 py-2 rounded-lg">
          {error}
        </p>
      )}

      {!action ? (
        <div className="flex gap-2">
          {withdrawal.status === "pending" && (
            <Button
              size="sm"
              onClick={() => setAction("approve")}
              className="bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 text-xs"
            >
              <FileText className="w-3.5 h-3.5 mr-1" />
              Approve & Calculate Tax
            </Button>
          )}

          {withdrawal.status === "approved" && (
            <Button
              size="sm"
              onClick={() => setAction("complete")}
              className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 text-xs"
            >
              <CheckCircle className="w-3.5 h-3.5 mr-1" />
              Mark Completed (Paid)
            </Button>
          )}

          <Button
            size="sm"
            onClick={() => setAction("reject")}
            className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-xs"
          >
            <Ban className="w-3.5 h-3.5 mr-1" />
            Reject
          </Button>
        </div>
      ) : (
        <div className="bg-white/[0.02] border border-white/5 rounded-lg p-4 space-y-3">
          <h4 className="text-white text-xs font-semibold uppercase tracking-wider">
            {action === "approve" ? "Approve Payout" : action === "complete" ? "Complete Payout" : "Reject Payout"}
          </h4>

          {action === "approve" && (
            <div>
              <label className="text-white/50 text-xs mb-1 block">ISR Withholding Tax (MXN)</label>
              <Input
                type="number"
                value={isr}
                onChange={(e) => setIsr(e.target.value)}
                placeholder="e.g. 20.00"
                className="bg-white/5 border-white/10 text-white text-sm"
              />
            </div>
          )}

          {action === "complete" && (
            <div>
              <label className="text-white/50 text-xs mb-1 block">SPEI Transaction Reference / CLABE Ref</label>
              <Input
                value={ref}
                onChange={(e) => setRef(e.target.value)}
                placeholder="e.g. 1279384729"
                className="bg-white/5 border-white/10 text-white text-sm"
              />
            </div>
          )}

          {action === "reject" && (
            <div>
              <label className="text-white/50 text-xs mb-1 block">Rejection Reason</label>
              <Textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Explain why this payout was rejected..."
                className="bg-white/5 border-white/10 text-white text-sm"
                rows={2}
              />
            </div>
          )}

          <div>
            <label className="text-white/50 text-xs mb-1 block">Internal Admin Notes (Optional)</label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Internal record notes..."
              className="bg-white/5 border-white/10 text-white text-sm"
              rows={2}
            />
          </div>

          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={handleSubmit}
              disabled={isPending}
              className="bg-[#00d4aa] hover:bg-[#00bfa0] text-black font-semibold text-xs"
            >
              {isPending ? "Saving..." : "Submit"}
            </Button>
            <Button
              size="sm"
              onClick={() => setAction(null)}
              className="bg-transparent hover:bg-white/10 text-white/50 hover:text-white border border-white/10 text-xs font-semibold"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
