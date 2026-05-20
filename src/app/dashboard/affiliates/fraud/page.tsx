"use client";

import { useEffect, useState, useTransition } from "react";
import { AlertCircle, CheckCircle, ShieldAlert, BadgeCheck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  getAffiliateFraudFlagsAction,
  resolveFraudFlagAction,
} from "@/actions/affiliate.admin.action";
import type { AffiliateFraudFlag } from "@/types/affiliate.type";

const SIGNAL_LABELS: Record<string, string> = {
  self_referral: "Self Referral",
  same_ip: "Same IP Address",
  same_device: "Same Device Fingerprint",
  same_gov_id: "Shared Government ID",
  same_bank: "Shared Bank Account",
  wash_trading: "Wash Trading Volume",
};

export default function AdminFraudFlagsPage() {
  const [isPending, startTransition] = useTransition();
  const [flags, setFlags] = useState<AffiliateFraudFlag[]>([]);
  const [resolvedFilter, setResolvedFilter] = useState<"all" | "true" | "false">("false");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadFlags = () => {
    setError("");
    startTransition(async () => {
      const res = await getAffiliateFraudFlagsAction({
        resolved: resolvedFilter === "all" ? undefined : resolvedFilter,
      });
      if (res.success) {
        setFlags(res.data.results);
      } else {
        setError(res.error);
      }
    });
  };

  useEffect(() => {
    loadFlags();
  }, [resolvedFilter]);

  const handleResolve = (id: string) => {
    setError("");
    setSuccess("");
    startTransition(async () => {
      const res = await resolveFraudFlagAction(id);
      if (res.success) {
        setSuccess("Fraud flag marked as resolved.");
        loadFlags();
      } else {
        setError(res.error);
      }
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-white text-2xl font-bold">Fraud & Risk Signals</h2>
        <p className="text-white/40 text-sm mt-1">
          Review automated fraud flags and referral wash trading alerts
        </p>
      </div>

      {/* Messages */}
      {error && (
        <div className="flex items-center gap-3 rounded-lg border border-rose-500/20 bg-rose-500/5 px-5 py-3 text-sm text-rose-400">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="flex items-center gap-3 rounded-lg border border-emerald-500/20 bg-emerald-500/5 px-5 py-3 text-sm text-emerald-400">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex border-b border-white/5">
        {[
          { label: "Active Flags", value: "false" },
          { label: "Resolved", value: "true" },
          { label: "All Alerts", value: "all" },
        ].map((tab) => (
          <button
            key={tab.value}
            onClick={() => setResolvedFilter(tab.value as any)}
            className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-all ${
              resolvedFilter === tab.value
                ? "border-[#00d4aa] text-[#00d4aa]"
                : "border-transparent text-white/40 hover:text-white"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Flag List */}
      {flags.length === 0 ? (
        <Card className="bg-[#13151e] border-white/5">
          <CardContent className="p-12 text-center">
            <BadgeCheck className="w-10 h-10 text-white/20 mx-auto mb-3" />
            <p className="text-white/40 text-sm">No fraud alerts matching filter.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {flags.map((flag) => (
            <Card key={flag.id} className="bg-[#13151e] border-white/5">
              <CardContent className="p-5 flex items-start gap-4 justify-between">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-rose-500/10">
                      <ShieldAlert className="w-4 h-4 text-rose-400" />
                    </div>
                    <div>
                      <p className="text-white font-semibold text-sm">
                        {SIGNAL_LABELS[flag.signal_type] || flag.signal_type}
                      </p>
                      <p className="text-white/40 text-xs">
                        Affiliate: <span className="text-[#00d4aa]">{flag.affiliate_slug}</span> • Referred: {flag.user_email}
                      </p>
                    </div>
                    {flag.resolved ? (
                      <Badge className="bg-emerald-400/10 text-emerald-400 border border-emerald-400/20 text-xs capitalize ml-auto">
                        resolved
                      </Badge>
                    ) : (
                      <Badge className="bg-rose-400/10 text-rose-400 border border-rose-400/20 text-xs capitalize ml-auto">
                        unresolved
                      </Badge>
                    )}
                  </div>

                  <p className="text-white/70 text-xs leading-relaxed bg-white/[0.01] border border-white/5 rounded-lg p-3">
                    {flag.detail}
                  </p>

                  <p className="text-white/30 text-[10px]">
                    Detected: {new Date(flag.created_at).toLocaleString()}
                  </p>
                </div>

                {!flag.resolved && (
                  <Button
                    onClick={() => handleResolve(flag.id)}
                    disabled={isPending}
                    size="sm"
                    className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 text-xs font-medium"
                  >
                    Resolve Flag
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
