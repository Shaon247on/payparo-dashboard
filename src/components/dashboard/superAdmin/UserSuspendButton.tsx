"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ShieldOff, ShieldCheck, Loader2 } from "lucide-react";
import { suspendUserAction } from "@/actions/users.action";

interface UserSuspendButtonProps {
  userId: string;
  isSuspended: boolean;
  userName: string;
}

export function UserSuspendButton({ userId, isSuspended, userName }: UserSuspendButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showConfirm, setShowConfirm] = useState(false);

  const handleToggle = () => {
    startTransition(async () => {
      const res = await suspendUserAction(userId, !isSuspended);
      if (!res.success) {
        toast.error(res.error);
      } else {
        toast.success(res.data.detail);
        router.refresh();
      }
      setShowConfirm(false);
    });
  };

  if (showConfirm) {
    return (
      <div className="flex items-center gap-1.5">
        <span className="text-white/40 text-xs">
          {isSuspended ? "Unsuspend?" : "Suspend?"}
        </span>
        <button
          onClick={handleToggle}
          disabled={isPending}
          className={`text-xs font-semibold px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 ${
            isSuspended
              ? "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20"
              : "bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/20"
          }`}
        >
          {isPending ? (
            <Loader2 className="w-3 h-3 animate-spin" />
          ) : (
            <>
              {isSuspended ? <ShieldCheck className="w-3 h-3" /> : <ShieldOff className="w-3 h-3" />}
              Yes
            </>
          )}
        </button>
        <button
          onClick={() => setShowConfirm(false)}
          disabled={isPending}
          className="text-xs text-white/30 hover:text-white/60 transition-colors px-1.5"
        >
          No
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setShowConfirm(true)}
      title={isSuspended ? `Unsuspend ${userName}` : `Suspend ${userName}`}
      className={`text-xs font-semibold px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 border ${
        isSuspended
          ? "bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 border-amber-500/20"
          : "bg-white/5 text-white/40 hover:bg-rose-500/10 hover:text-rose-400 hover:border-rose-500/20 border-white/5"
      }`}
    >
      {isSuspended ? (
        <>
          <ShieldOff className="w-3 h-3" />
          Suspended
        </>
      ) : (
        <>
          <ShieldOff className="w-3 h-3" />
          Suspend
        </>
      )}
    </button>
  );
}
