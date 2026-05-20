"use client";

import { useEffect, useState, useTransition } from "react";
import { AlertCircle, CheckCircle, Save, ShieldAlert, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  getAffiliateGlobalBudgetAction,
  updateAffiliateGlobalBudgetAction,
} from "@/actions/affiliate.admin.action";
import type { AffiliateGlobalBudget } from "@/types/affiliate.type";

export default function AdminBudgetPage() {
  const [isPending, startTransition] = useTransition();
  const [budget, setBudget] = useState<AffiliateGlobalBudget | null>(null);
  const [cap, setCap] = useState("");
  const [paused, setPaused] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    startTransition(async () => {
      const res = await getAffiliateGlobalBudgetAction();
      if (res.success) {
        setBudget(res.data);
        setCap(res.data.monthly_cap);
        setPaused(res.data.rewards_paused);
      } else {
        setError(res.error);
      }
    });
  }, []);

  const handleSave = () => {
    setError("");
    setSuccess("");
    startTransition(async () => {
      const res = await updateAffiliateGlobalBudgetAction({
        monthly_cap: cap,
        rewards_paused: paused,
      });
      if (res.success) {
        setBudget(res.data);
        setSuccess("Global budget controls updated.");
      } else {
        setError(res.error);
      }
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-white text-2xl font-bold">Affiliate Budget Controls</h2>
        <p className="text-white/40 text-sm mt-1">
          Manage monthly budget caps and emergency pause configurations
        </p>
      </div>

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

      {budget && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-[#13151e] border-white/5 md:col-span-2">
            <CardHeader>
              <h3 className="text-white font-semibold text-sm">Budget Parameters</h3>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-white/50 text-xs mb-1 block">Monthly Budget Cap (MXN)</label>
                <Input
                  type="number"
                  value={cap}
                  onChange={(e) => setCap(e.target.value)}
                  placeholder="e.g. 500000.00"
                  className="bg-white/5 border-white/10 text-white text-sm"
                />
                <p className="text-white/30 text-xs mt-1">
                  Once rewards generated in a month exceed this cap, the affiliate program automatically pauses.
                </p>
              </div>

              <div className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/5 rounded-lg">
                <div>
                  <h4 className="text-white font-medium text-xs">Emergency Program Pause</h4>
                  <p className="text-white/40 text-[11px] mt-0.5">
                    Instantly freeze all affiliate reward tracking across the platform
                  </p>
                </div>
                <Switch checked={paused} onCheckedChange={setPaused} />
              </div>

              <Button
                onClick={handleSave}
                disabled={isPending}
                className="bg-[#00d4aa] hover:bg-[#00bfa0] text-black font-semibold text-xs"
              >
                <Save className="w-4 h-4 mr-2" />
                {isPending ? "Saving..." : "Save Settings"}
              </Button>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <Card className="bg-[#13151e] border-white/5">
              <CardContent className="p-5 space-y-4">
                <div>
                  <p className="text-white/40 text-xs">Current Month Spend</p>
                  <p className="text-white text-2xl font-bold mt-1">
                    {Number(budget.current_month_spend).toLocaleString("es-MX", {
                      style: "currency",
                      currency: "MXN",
                    })}
                  </p>
                </div>

                <div>
                  <p className="text-white/40 text-xs">Remaining Budget</p>
                  <p className="text-emerald-400 text-lg font-semibold mt-1">
                    {Number(budget.cap_remaining).toLocaleString("es-MX", {
                      style: "currency",
                      currency: "MXN",
                    })}
                  </p>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-white/50">
                    <span>Budget Usage</span>
                    <span>{budget.cap_utilisation_pct}%</span>
                  </div>
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#00d4aa]"
                      style={{ width: `${Math.min(100, budget.cap_utilisation_pct)}%` }}
                    />
                  </div>
                </div>

                <div className="text-[11px] text-white/30 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#00d4aa]" />
                  Reset date: 1st of next month
                </div>
              </CardContent>
            </Card>

            {paused && (
              <div className="p-4 bg-orange-500/10 border border-orange-500/20 text-orange-400 rounded-lg flex items-start gap-2.5">
                <ShieldAlert className="w-5 h-5 shrink-0" />
                <div>
                  <p className="text-xs font-semibold">Affiliate Tracking is Suspended</p>
                  <p className="text-[10px] mt-0.5 leading-relaxed text-orange-400/80">
                    Transactions completed while paused will not generate commissions.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
