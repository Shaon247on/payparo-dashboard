"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/shared/Spinner";
import {
  setNewPasswordSchema,
  type SetNewPasswordFormValues,
} from "@/schema/passwordReset.schema";
import { setNewPasswordAction } from "@/actions/passwordReset.action";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, CheckCircle2, Eye, EyeOff, KeyRound, Lock, ShieldAlert, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

// ── Step indicator ────────────────────────────────────────────────────────────
function StepIndicator({ current }: { current: number }) {
  return (
    <div className="flex items-center justify-center gap-1.5 mb-6">
      {[0, 1, 2].map((i) => (
        <div key={i} className="flex items-center gap-1.5">
          <div className={`h-1.5 w-6 rounded-full transition-colors ${i <= current ? "bg-[#0091e5]" : "bg-white/10"}`} />
          {i < 2 && <div className={`h-px w-3 ${i < current ? "bg-[#0091e5]" : "bg-white/10"}`} />}
        </div>
      ))}
    </div>
  );
}

// ── Password strength ─────────────────────────────────────────────────────────
function getStrength(pw: string): { score: number; label: string; color: string } {
  if (!pw) return { score: 0, label: "", color: "" };
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  const map = [
    { label: "Too short", color: "bg-rose-500" },
    { label: "Weak", color: "bg-orange-500" },
    { label: "Fair", color: "bg-amber-400" },
    { label: "Good", color: "bg-lime-500" },
    { label: "Strong", color: "bg-emerald-500" },
  ];
  return { score, ...map[score] };
}

// ── Show/hide password input ──────────────────────────────────────────────────
function PasswordInput({
  id,
  placeholder,
  registration,
}: {
  id: string;
  placeholder: string;
  registration: object;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20" />
      <input
        id={id}
        type={show ? "text" : "password"}
        placeholder={placeholder}
        className="w-full bg-[#172836]/75 border border-white/5 focus:border-[#0091e5]/30 focus:ring-1 focus:ring-[#0091e5]/20 rounded-xl h-12 pl-10 pr-10 text-white placeholder:text-white/20 text-xs font-medium transition-all outline-hidden"
        autoComplete="new-password"
        {...registration}
      />
      <button
        type="button"
        tabIndex={-1}
        onClick={() => setShow((v) => !v)}
        aria-label={show ? "Hide password" : "Show password"}
        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/50 transition-colors"
      >
        {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );
}

function SetNewPasswordForm() {
  const router = useRouter();

  const form = useForm<SetNewPasswordFormValues>({
    resolver: zodResolver(setNewPasswordSchema),
    mode: "onChange",
    defaultValues: { password: "", confirmPassword: "" },
  });

  const password = form.watch("password");
  const confirmPassword = form.watch("confirmPassword");
  const strength = getStrength(password);
  const passwordsMatch = password.length > 0 && confirmPassword.length > 0 && password === confirmPassword;
  const passwordsMismatch = confirmPassword.length > 0 && password !== confirmPassword;

  const onSubmit = async (data: SetNewPasswordFormValues) => {
    const result = await setNewPasswordAction(data.password);
    if (!result.success) {
      form.setError("root", { message: result.error });
      return;
    }
    toast.success(result.data.message);
    router.push("/login");
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
            <KeyRound className="h-5 w-5 text-[#0091e5]" />
          </div>
          <h2 className="text-white text-2xl font-bold tracking-tight">
            Set New Password
          </h2>
          <p className="text-xs text-white/40 mt-1.5 uppercase tracking-wider font-semibold">
            Must be different from your previous
          </p>
        </div>

        {/* Form Fields */}
        <form id="form-new-password" onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 relative z-10">

          <StepIndicator current={2} />

          {/* Server Error Alert */}
          {form.formState.errors.root && (
            <div className="flex items-start gap-2.5 rounded-xl border border-rose-500/20 bg-rose-500/5 px-4 py-3.5 text-xs text-rose-400">
              <ShieldAlert className="h-4 w-4 mt-0.5 shrink-0" />
              <span>{form.formState.errors.root.message}</span>
            </div>
          )}

          {/* New password */}
          <div className="space-y-2">
            <label htmlFor="new-password" className="text-white/50 text-[10px] uppercase tracking-wider font-semibold block">
              New Password
            </label>
            <PasswordInput
              id="new-password"
              placeholder="At least 8 characters"
              registration={form.register("password")}
            />

            {/* Strength meter — only shown once user starts typing */}
            {password.length > 0 && (
              <div className="mt-2 space-y-1.5">
                <div className="flex gap-1">
                  {[1, 2, 3, 4].map((level) => (
                    <div
                      key={level}
                      className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
                        strength.score >= level ? strength.color : "bg-white/10"
                      }`}
                    />
                  ))}
                </div>
                <p className={`text-[10px] uppercase tracking-wider font-bold ${
                  strength.score <= 1 ? "text-rose-400"
                  : strength.score === 2 ? "text-amber-500"
                  : "text-emerald-500"
                }`}>
                  {strength.label}
                </p>
              </div>
            )}

            {form.formState.errors.password && (
              <p className="text-xs text-rose-400 mt-1 flex items-center gap-1">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                {form.formState.errors.password.message}
              </p>
            )}
          </div>

          {/* Confirm password */}
          <div className="space-y-2">
            <label htmlFor="confirm-password" className="text-white/50 text-[10px] uppercase tracking-wider font-semibold block">
              Confirm Password
            </label>
            <PasswordInput
              id="confirm-password"
              placeholder="Repeat new password"
              registration={form.register("confirmPassword")}
            />

            {/* Match indicator */}
            {confirmPassword.length > 0 && (
              <p className={`text-xs mt-1.5 flex items-center gap-1 ${
                passwordsMatch ? "text-emerald-500" : "text-rose-400"
              }`}>
                {passwordsMatch
                  ? <><CheckCircle2 className="h-3 w-3" />Passwords match</>
                  : passwordsMismatch
                    ? <><X className="h-3 w-3" />Passwords do not match</>
                    : null}
              </p>
            )}

            {form.formState.errors.confirmPassword && !confirmPassword && (
              <p className="text-xs text-rose-400 mt-1 flex items-center gap-1">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                {form.formState.errors.confirmPassword.message}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <Button
              form="form-new-password"
              type="submit"
              className="w-full cursor-pointer bg-[#0091e5] hover:bg-[#007acc] active:scale-[0.99] text-white font-bold tracking-wide text-xs h-12 rounded-xl border-none transition-all shadow-[0_4px_20px_rgba(0,145,229,0.15)] hover:shadow-[0_4px_25px_rgba(0,145,229,0.25)]"
              disabled={form.formState.isSubmitting || !form.formState.isValid}
            >
              {form.formState.isSubmitting ? (
                <div className="flex items-center gap-2">
                  <Spinner className="h-4 w-4 animate-spin text-white" />
                  <span>Resetting…</span>
                </div>
              ) : (
                "Reset Password"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default SetNewPasswordForm;