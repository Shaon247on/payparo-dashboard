"use client";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/shared/Spinner";
import { otpSchema, type OtpFormValues } from "@/schema/passwordReset.schema";
import { verifyOtpAction, resendOtpAction } from "@/actions/passwordReset.action";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, MailCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

const RESEND_COOLDOWN = 60; // seconds



function OtpVerificationForm() {
  const router = useRouter();
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [isResending, setIsResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const form = useForm<OtpFormValues>({
    resolver: zodResolver(otpSchema),
    mode: "onChange",
    defaultValues: { otp: ["", "", "", "", "", ""] },
  });

  const otpValues = form.watch("otp");
  const filledCount = otpValues.filter((v) => v !== "").length;

  // ── Resend cooldown timer ────────────────────────────────────────────────────
  useEffect(() => {
    if (cooldown <= 0) return;
    const id = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(id);
  }, [cooldown]);

  // Focus first input on mount
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  // ── Submit ───────────────────────────────────────────────────────────────────
  const onSubmit = async (data: OtpFormValues) => {
    const result = await verifyOtpAction(data.otp.join(""));
    if (!result.success) {
      form.setError("root", { message: result.error });
      form.setValue("otp", ["", "", "", "", "", ""], { shouldValidate: false });
      inputRefs.current[0]?.focus();
      return;
    }
    router.push("/new-password");
  };

  // ── Resend ───────────────────────────────────────────────────────────────────
  const handleResend = async () => {
    setIsResending(true);
    const result = await resendOtpAction();
    setIsResending(false);
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    toast.success(result.data.message);
    setCooldown(RESEND_COOLDOWN);
    form.setValue("otp", ["", "", "", "", "", ""], { shouldValidate: false });
    form.clearErrors();
    inputRefs.current[0]?.focus();
  };

  // ── Input handlers ───────────────────────────────────────────────────────────
  const handleChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, "").slice(-1);
    const updated = [...form.getValues("otp")];
    updated[index] = digit;
    form.setValue("otp", updated as [string, string, string, string, string, string], { shouldValidate: true });
    if (digit && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      const current = form.getValues("otp");
      if (!current[index] && index > 0) {
        const updated = [...current];
        updated[index - 1] = "";
        form.setValue("otp", updated as [string, string, string, string, string, string]);
        inputRefs.current[index - 1]?.focus();
      }
    }
    // Allow arrow key navigation
    if (e.key === "ArrowLeft" && index > 0) inputRefs.current[index - 1]?.focus();
    if (e.key === "ArrowRight" && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const digits = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6).split("");
    const updated = Array(6).fill("").map((_, i) => digits[i] ?? "") as [string, string, string, string, string, string];
    form.setValue("otp", updated, { shouldValidate: true });
    inputRefs.current[Math.min(digits.length - 1, 5)]?.focus();
  };

  return (
    <div className="w-full max-w-[420px] mx-auto">
      {/* Immersive Glassmorphic Card Container */}
      <div className="bg-[#090e1a]/85 backdrop-blur-xl border border-white/5 rounded-2xl p-8 md:p-10 shadow-2xl relative overflow-hidden group hover:border-white/10 transition-all duration-300">

        {/* Sleek Floating Background Orbs for Premium Depth */}
        <div className="absolute -top-16 -right-16 w-36 h-36 rounded-full bg-[#0091e5]/15 blur-2xl pointer-events-none group-hover:bg-[#0091e5]/20 transition-all duration-300" />
        <div className="absolute -bottom-16 -left-16 w-36 h-36 rounded-full bg-[#1f9a5b]/10 blur-2xl pointer-events-none group-hover:bg-[#1f9a5b]/15 transition-all duration-300" />

        {/* Brand Header */}
        <div className="text-center relative z-10 pb-6">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#0091e5]/20 to-[#1f9a5b]/10 border border-[#0091e5]/30 shadow-[0_0_15px_rgba(0,145,229,0.1)]">
            <MailCheck className="h-5 w-5 text-[#0091e5]" />
          </div>
          <h2 className="text-white text-2xl font-bold tracking-tight">
            Check Your Email
          </h2>
          <p className="text-xs text-white/40 mt-1.5 uppercase tracking-wider font-semibold">
            We sent a 6-digit code to your inbox
          </p>
        </div>

        {/* Form Fields */}
        <form id="form-otp-verification" onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 relative z-10">

          {/* Server Error Alert */}
          {form.formState.errors.root && (
            <div className="flex items-start gap-2.5 rounded-xl border border-rose-500/20 bg-rose-500/5 px-4 py-3.5 text-xs text-rose-400">
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
              <span>{form.formState.errors.root.message}</span>
            </div>
          )}

          <div className="space-y-3">
            {/* Progress hint */}
            <div className="flex items-center justify-between">
              <span className="text-white/50 text-[10px] uppercase tracking-wider font-semibold">
                Enter 6-digit code
              </span>
              <span className="text-[#0091e5] text-[10px] uppercase tracking-wider font-semibold tabular-nums">
                {filledCount}/6
              </span>
            </div>

            {/* OTP cells */}
            <div className="flex items-center justify-between gap-2">
              {otpValues.map((val, index) => (
                <input
                  key={index}
                  ref={(el) => { inputRefs.current[index] = el; }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={val}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={handlePaste}
                  aria-label={`Digit ${index + 1}`}
                  className={`
                    h-12 w-11 rounded-xl border text-center text-lg font-bold
                    transition-all duration-150 outline-none
                    ${val
                      ? "border-[#0091e5]/50 bg-[#0091e5]/20 text-[#0091e5]"
                      : "border-white/5 bg-[#172836]/75 text-white focus:border-[#0091e5]/30 focus:ring-1 focus:ring-[#0091e5]/20"
                    }
                    ${form.formState.errors.root ? "border-rose-500/50" : ""}
                  `}
                />
              ))}
            </div>

            {form.formState.errors.otp && (
              <p className="text-xs text-rose-400 mt-2 flex items-center justify-center gap-1">
                <AlertCircle className="h-3 w-3" />
                Please enter the complete 6-digit code
              </p>
            )}
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <Button
              form="form-otp-verification"
              type="submit"
              className="w-full cursor-pointer bg-[#0091e5] hover:bg-[#007acc] active:scale-[0.99] text-white font-bold tracking-wide text-xs h-12 rounded-xl border-none transition-all shadow-[0_4px_20px_rgba(0,145,229,0.15)] hover:shadow-[0_4px_25px_rgba(0,145,229,0.25)]"
              disabled={form.formState.isSubmitting || filledCount < 6}
            >
              {form.formState.isSubmitting ? (
                <div className="flex items-center gap-2">
                  <Spinner className="h-4 w-4 animate-spin text-white" />
                  <span>Verifying…</span>
                </div>
              ) : (
                "Verify Code"
              )}
            </Button>
          </div>

          {/* Resend row */}
          <div className="flex items-center justify-center gap-1.5 pt-4 text-[11px] text-white/30">
            <span>Didn't receive a code?</span>
            {cooldown > 0 ? (
              <span className="tabular-nums text-white/20 font-semibold">
                Resend in {cooldown}s
              </span>
            ) : (
              <button
                type="button"
                disabled={isResending}
                onClick={handleResend}
                className="inline-flex items-center gap-1 font-semibold text-[#0091e5] hover:text-[#007acc] hover:underline underline-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isResending ? <><Spinner className="w-3 h-3" />Sending…</> : "Resend"}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

export default OtpVerificationForm;