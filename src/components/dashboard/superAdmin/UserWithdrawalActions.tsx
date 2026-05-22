"use client";

import { useState, useTransition } from "react";
import { Button } from "../../ui/button";
import { Textarea } from "../../ui/textarea";
import { CheckCircle, Ban, AlertCircle } from "lucide-react";
import { updateUserWithdrawalStatusAction } from "@/actions/affiliate.admin.action";
import { useRouter } from "next/navigation";
import type { UserWithdrawal } from "@/types/withdrawal.type";

interface Props {
  withdrawal: UserWithdrawal;
}

export default function UserWithdrawalActions({ withdrawal }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [action, setAction] = useState<"complete" | "reject" | null>(null);
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = () => {
    if (!action) return;
    setError("");
    startTransition(async () => {
      const result = await updateUserWithdrawalStatusAction(withdrawal.id, {
        status: action === "complete" ? "completed" : "failed",
        rejection_reason: action === "reject" ? reason : undefined,
      });

      if (result.success) {
        setAction(null);
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
        <p className="text-rose-400 text-xs bg-rose-500/5 border border-rose-500/10 px-3 py-2 rounded-lg flex items-center gap-1.5">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          {error}
        </p>
      )}

      {!action ? (
        <div className="flex gap-2">
          {withdrawal.status === "pending" && (
            <>
              <Button
                size="sm"
                onClick={() => setAction("complete")}
                className="bg-[#0091e5]/10 hover:bg-[#0091e5]/20 text-[#0091e5] border border-[#0091e5]/20 text-xs"
              >
                <CheckCircle className="w-3.5 h-3.5 mr-1" />
                Approve & Complete
              </Button>
              <Button
                size="sm"
                onClick={() => setAction("reject")}
                className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-xs"
              >
                <Ban className="w-3.5 h-3.5 mr-1" />
                Reject
              </Button>
            </>
          )}
        </div>
      ) : (
        <div className="bg-white/[0.02] border border-white/5 rounded-lg p-4 space-y-3">
          <h4 className="text-white text-xs font-semibold uppercase tracking-wider">
            {action === "complete" ? "Complete Payout" : "Reject Payout"}
          </h4>

          {action === "reject" && (
            <div>
              <label className="text-white/50 text-xs mb-1 block">Rejection Reason</label>
              <Textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Explain why this withdrawal request was rejected..."
                className="bg-white/5 border-white/10 text-white text-sm"
                rows={2}
                required
              />
            </div>
          )}

          {action === "complete" && (
            <p className="text-white/60 text-xs">
              Are you sure you want to approve and mark this withdrawal request as completed? This action is irreversible.
            </p>
          )}

          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={handleSubmit}
              disabled={isPending || (action === "reject" && !reason.trim())}
              className="bg-[#0091e5] hover:bg-[#007acc] text-white text-xs font-semibold"
            >
              {isPending ? "Processing..." : "Confirm"}
            </Button>
            <Button
              size="sm"
              onClick={() => {
                setAction(null);
                setError("");
              }}
              disabled={isPending}
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
