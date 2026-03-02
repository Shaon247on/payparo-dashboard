"use client";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertTriangle } from "lucide-react";
import { toast } from "sonner";

interface FinalizeDisputeModalProps {
  open: boolean;
  onClose: () => void;
  caseId: string;
  onResolve: (favor: "buyer" | "seller") => void;
}

export function FinalizeDisputeModal({
  open,
  onClose,
  caseId,
  onResolve,
}: FinalizeDisputeModalProps) {
  const [understood, setUnderstood] = useState(false);

  const handleResolve = (favor: "buyer" | "seller") => {
    if (!understood) return;
    onResolve(favor);
    toast.success(`Case resolved in favor of ${favor === "buyer" ? "Buyer" : "Seller"}`, {
      description: `Case #${caseId} has been finalized. Funds will be released immediately.`,
    });
    onClose();
    setUnderstood(false);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) { onClose(); setUnderstood(false); } }}>
      <DialogContent className="bg-[#13151e] border-white/10 text-white max-w-[520px] p-6 gap-0">
        <DialogHeader className="mb-5">
          <DialogTitle className="text-white text-xl font-bold text-center">
            Finalize Dispute Resolution
          </DialogTitle>
          <p className="text-white/50 text-sm text-center leading-relaxed mt-2">
            Your are about to make a final decision for Case #{caseId}.{" "}
            <br className="hidden sm:block" />
            The funds will be released immediately based on your selection.
          </p>
        </DialogHeader>

        {/* Warning box */}
        <div className="border border-amber-500/40 bg-amber-500/5 rounded-xl p-4 mb-5">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
            <span className="text-amber-400 text-sm font-semibold">Irreversible Action</span>
          </div>
          <p className="text-white/50 text-sm leading-relaxed">
            Once confirmed, this decision cannot be changed, appealed, or undone.{" "}
            please review all evidence and arbitration notes carefully before proceeding.
          </p>
        </div>

        {/* Checkbox */}
        <div className="flex items-center gap-3 mb-6">
          <Checkbox
            id="understand"
            checked={understood}
            onCheckedChange={(v) => setUnderstood(!!v)}
            className="w-5 h-5 border-white/20 data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500"
          />
          <label
            htmlFor="understand"
            className="text-white/80 text-sm cursor-pointer select-none"
          >
            I understand this action cannot be undone
          </label>
        </div>

        {/* Action buttons */}
        <div className="grid grid-cols-2 gap-3">
          <Button
            className="h-12 bg-[#1e2130] hover:bg-[#252838] text-white font-semibold border border-white/10 disabled:opacity-40"
            disabled={!understood}
            onClick={() => handleResolve("buyer")}
          >
            Favor Buyer
          </Button>
          <Button
            className="h-12 bg-[#1e2130] hover:bg-[#252838] text-white font-semibold border border-white/10 disabled:opacity-40"
            disabled={!understood}
            onClick={() => handleResolve("seller")}
          >
            Favor Seller
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}