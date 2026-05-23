"use client";

import React, { useState } from "react";
import { Crown, CheckCircle2, Sparkles, Loader2, ShieldCheck, X } from "lucide-react";
import { createSubscriptionSessionAction } from "@/actions/subscription.action";

interface PaywallModalProps {
  isOpen: boolean;
  onClose: () => void;
  isForced?: boolean; // If true, user cannot close and must pay to proceed (blocker mode)
}

export default function PaywallModal({ isOpen, onClose, isForced = false }: PaywallModalProps) {
  const [selectedPlan, setSelectedPlan] = useState<"monthly" | "yearly">("yearly");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCheckout = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await createSubscriptionSessionAction(selectedPlan);
      if (res.success) {
        if (res.data?.checkout_url) {
          window.location.href = res.data.checkout_url;
        } else {
          setError("Failed to create checkout session. Please try again.");
          setLoading(false);
        }
      } else {
        setError(res.error ?? "Failed to create checkout session. Please try again.");
        setLoading(false);
      }
    } catch {
      setError("A network error occurred. Please check your internet connection.");
      setLoading(false);
    }
  };

  const features = [
    "Create unlimited secure escrows",
    "Unlock AI-powered dispute review",
    "Priority 24/7 client support assistance",
    "Waived dispute escalation fees",
    "Secure bank-grade end-to-end encryption",
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md transition-all duration-300">
      <div className="relative w-full max-w-2xl bg-slate-900/90 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl overflow-hidden">
        
        {/* Decorative Background Glows */}
        <div className="absolute -top-32 -right-32 w-64 h-64 bg-[#0091e5]/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-[#0091e5]/15 rounded-full blur-3xl" />

        {/* Close Button (only show if not forced block) */}
        {!isForced && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-white bg-slate-800/40 hover:bg-slate-850 p-2 rounded-full transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        <div className="flex flex-col items-center text-center mb-6">
          <div className="bg-[#0091e5]/10 p-3 rounded-2xl mb-4 border border-[#0091e5]/30 animate-pulse">
            <Crown className="w-10 h-10 text-[#0091e5]" />
          </div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight sm:text-4xl">
            Unlock <span className="text-[#0091e5]">Premium</span> Access
          </h2>
          <p className="text-slate-400 mt-2 max-w-md text-sm sm:text-base">
            {isForced 
              ? "You have used your free escrow. Upgrade to premium now to continue creating secure escrows."
              : "Upgrade today to create unlimited transactions, access real-time dispute resolution, and unlock premium security."}
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-xl text-center text-sm mb-6">
            {error}
          </div>
        )}

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Monthly Plan */}
          <div
            onClick={() => setSelectedPlan("monthly")}
            className={`cursor-pointer rounded-2xl p-5 border-2 transition-all relative overflow-hidden flex flex-col justify-between ${
              selectedPlan === "monthly"
                ? "border-[#0091e5] bg-[#0091e5]/5 shadow-[#0091e5]/5 shadow-lg"
                : "border-slate-800 bg-slate-950/40 hover:border-slate-700"
            }`}
          >
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Monthly Plan</span>
              </div>
              <div className="flex items-baseline">
                <span className="text-3xl font-bold text-white">$2.00</span>
                <span className="text-slate-500 text-sm ml-1">/ month</span>
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-4">Simple, cancel-anytime monthly access.</p>
          </div>

          {/* Yearly Plan */}
          <div
            onClick={() => setSelectedPlan("yearly")}
            className={`cursor-pointer rounded-2xl p-5 border-2 transition-all relative overflow-hidden flex flex-col justify-between ${
              selectedPlan === "yearly"
                ? "border-[#0091e5] bg-[#0091e5]/5 shadow-[#0091e5]/5 shadow-lg"
                : "border-slate-800 bg-slate-950/40 hover:border-slate-700"
            }`}
          >
            <div className="absolute top-2 right-2 bg-gradient-to-r from-emerald-500 to-[#0091e5] text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-0.5 shadow-sm">
              <Sparkles className="w-2.5 h-2.5" />
              Save 50%
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Yearly Plan</span>
              </div>
              <div className="flex items-baseline">
                <span className="text-3xl font-bold text-white">$12.00</span>
                <span className="text-slate-500 text-sm ml-1">/ year</span>
              </div>
              <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-500/10 px-1.5 py-0.5 rounded mt-1 inline-block">
                Equivalent to just $1.00 / month!
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-4">Best value for ongoing escrow protection.</p>
          </div>
        </div>

        {/* Feature List */}
        <div className="bg-slate-950/60 rounded-2xl p-5 mb-6 border border-slate-850">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-[#0091e5]" />
            What is included:
          </h4>
          <ul className="space-y-2.5">
            {features.map((feature, i) => (
              <li key={i} className="flex items-start text-sm text-slate-350">
                <CheckCircle2 className="w-4 h-4 text-[#0091e5] mr-2.5 shrink-0 mt-0.5" />
                {feature}
              </li>
            ))}
          </ul>
        </div>

        {/* CTA Actions */}
        <div className="flex flex-col gap-3">
          <button
            onClick={handleCheckout}
            disabled={loading}
            className="w-full bg-[#0091e5] hover:bg-[#007cc4] disabled:opacity-50 text-white font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-[#0091e5]/10 flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Redirecting to Secure Checkout...
              </>
            ) : (
              <>
                Upgrade Plan Now
              </>
            )}
          </button>

          {!isForced && (
            <button
              onClick={onClose}
              disabled={loading}
              className="text-xs font-semibold text-slate-400 hover:text-slate-300 py-1 transition-all cursor-pointer"
            >
              Maybe Later
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
