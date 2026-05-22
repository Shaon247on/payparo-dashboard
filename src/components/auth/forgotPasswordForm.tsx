"use client";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/shared/Spinner";
import { forgotPasswordSchema, type ForgotPasswordFormValues } from "@/schema/passwordReset.schema";
import { forgotPasswordAction } from "@/actions/passwordReset.action";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, Mail, ShieldAlert, Key } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";

function ForgotPasswordForm() {
  const router = useRouter();

  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    mode: "onTouched",
    defaultValues: { email: "" },
  });

  const onSubmit = async (data: ForgotPasswordFormValues) => {
    const result = await forgotPasswordAction(data.email);
    if (!result.success) {
      form.setError("root", { message: result.error });
      return;
    }
    router.push("/otp-verification");
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
            <Key className="h-5 w-5 text-[#0091e5]" />
          </div>
          <h2 className="text-white text-2xl font-bold tracking-tight">
            Forgot Password?
          </h2>
          <p className="text-xs text-white/40 mt-1.5 uppercase tracking-wider font-semibold">
            We'll send you a reset code
          </p>
        </div>

        {/* Form Fields */}
        <form id="form-forgot-password" onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 relative z-10">

          {/* Server Error Alert */}
          {form.formState.errors.root && (
            <div className="flex items-start gap-2.5 rounded-xl border border-rose-500/20 bg-rose-500/5 px-4 py-3.5 text-xs text-rose-400">
              <ShieldAlert className="h-4 w-4 mt-0.5 shrink-0" />
              <span>{form.formState.errors.root.message}</span>
            </div>
          )}

          {/* Email Input group */}
          <div className="space-y-2">
            <label htmlFor="email" className="text-white/50 text-[10px] uppercase tracking-wider font-semibold block">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20" />
              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                className="w-full bg-[#172836]/75 border border-white/5 focus:border-[#0091e5]/30 focus:ring-1 focus:ring-[#0091e5]/20 rounded-xl h-12 pl-10 pr-4 text-white placeholder:text-white/20 text-xs font-medium transition-all outline-hidden"
                {...form.register("email")}
              />
            </div>
            {form.formState.errors.email && (
              <p className="text-xs text-rose-400 mt-1 flex items-center gap-1">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                {form.formState.errors.email.message}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <Button
              form="form-forgot-password"
              type="submit"
              className="w-full cursor-pointer bg-[#0091e5] hover:bg-[#007acc] active:scale-[0.99] text-white font-bold tracking-wide text-xs h-12 rounded-xl border-none transition-all shadow-[0_4px_20px_rgba(0,145,229,0.15)] hover:shadow-[0_4px_25px_rgba(0,145,229,0.25)]"
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting ? (
                <div className="flex items-center gap-2">
                  <Spinner className="h-4 w-4 animate-spin text-white" />
                  <span>Sending code…</span>
                </div>
              ) : (
                "Send Reset Code"
              )}
            </Button>
          </div>
        </form>

        {/* Secondary Navigation Footer */}
        <div className="mt-8 text-center text-[11px] text-white/30 border-t border-white/5 pt-5 relative z-10">
          Remember your password?{" "}
          <Link href="/login" className="text-[#0091e5] font-semibold hover:underline hover:text-[#007acc] transition-colors ml-0.5 font-semibold">
            Sign In →
          </Link>
        </div>
      </div>
    </div>
  );
}

export default ForgotPasswordForm;