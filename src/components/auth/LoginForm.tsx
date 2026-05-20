"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/shared/Spinner";
import { loginAction } from "@/actions/auth.action";
import { loginSchema } from "@/schema/authSchema";
import type { LoginFormValues } from "@/schema/authSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, Eye, EyeOff, Lock, Mail, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";

function LoginForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    mode: "onTouched",
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (data: LoginFormValues) => {
    const result = await loginAction(data);
    if (!result.success) {
      form.setError("root", { message: result.error });
      return;
    }
    router.push(result.data.redirectTo);
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
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-linear-to-br from-[#0091e5]/20 to-[#1f9a5b]/10 border border-[#0091e5]/30 shadow-[0_0_15px_rgba(0,145,229,0.1)]">
            <Lock className="h-5 w-5 text-[#0091e5]" />
          </div>
          <h2 className="text-white text-2xl font-bold tracking-tight">
            Welcome Back
          </h2>
          <p className="text-xs text-white/40 mt-1.5 uppercase tracking-wider font-semibold">
            Affiliate & Admin Portal
          </p>
        </div>

        {/* Form Fields */}
        <form id="form-login" onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 relative z-10">

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

          {/* Password Input group */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="text-white/50 text-[10px] uppercase tracking-wider font-semibold block">
                Password
              </label>
              <Link
                href="/forgot-password"
                tabIndex={-1}
                className="text-[10px] text-[#0091e5] hover:text-[#007acc] hover:underline underline-offset-2 transition-colors font-semibold"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20" />
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="••••••••"
                className="w-full bg-[#172836]/75 border border-white/5 focus:border-[#0091e5]/30 focus:ring-1 focus:ring-[#0091e5]/20 rounded-xl h-12 pl-10 pr-10 text-white placeholder:text-white/20 text-xs font-medium transition-all outline-hidden"
                {...form.register("password")}
              />
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/50 transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {form.formState.errors.password && (
              <p className="text-xs text-rose-400 mt-1 flex items-center gap-1">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                {form.formState.errors.password.message}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <Button
              form="form-login"
              type="submit"
              className="w-full cursor-pointer bg-[#0091e5] hover:bg-[#007acc] active:scale-[0.99] text-white font-bold tracking-wide text-xs h-12 rounded-xl border-none transition-all shadow-[0_4px_20px_rgba(0,145,229,0.15)] hover:shadow-[0_4px_25px_rgba(0,145,229,0.25)]"
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting ? (
                <div className="flex items-center gap-2">
                  <Spinner className="h-4 w-4 animate-spin text-white" />
                  <span>Signing in…</span>
                </div>
              ) : (
                "Sign In to Account"
              )}
            </Button>
          </div>
        </form>

        {/* Secondary Navigation Footer */}
        <div className="mt-8 text-center text-[11px] text-white/30 border-t border-white/5 pt-5 relative z-10">
          Want to register as a partner?{" "}
          <Link href="/request-affiliate" className="text-[#0091e5] font-semibold hover:underline hover:text-[#007acc] transition-colors ml-0.5 font-semibold">
            Apply Now →
          </Link>
        </div>
      </div>
    </div>
  );
}

export default LoginForm;