"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldGroup } from "@/components/ui/field";
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
    <div className="w-full max-w-sm mx-auto">
      <Card>
        <CardHeader className="text-center pb-2">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 border border-primary/20">
            <MailCheck className="h-5 w-5 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">
            Check your email
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            We sent a 6-digit verification code to your inbox
          </p>
        </CardHeader>

        <CardContent className="pt-2">

          <form onSubmit={form.handleSubmit(onSubmit)}>
            <FieldGroup>
              {form.formState.errors.root && (
                <div className="flex items-start gap-2.5 rounded-md border border-destructive/30 bg-destructive/5 px-3.5 py-3 text-sm text-destructive">
                  <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                  <span>{form.formState.errors.root.message}</span>
                </div>
              )}

              <Field>
                {/* Progress hint */}
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs text-muted-foreground">
                    Enter 6-digit code
                  </span>
                  <span className="text-xs text-muted-foreground tabular-nums">
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
                        h-12 w-11 rounded-lg border text-center text-lg font-bold
                        transition-all duration-150 outline-none
                        focus:ring-2 focus:ring-primary focus:border-blue-500
                        ${val
                          ? "border-blue-500 bg-blue-500 text-white"
                          : "border bg-transparent text-white"
                        }
                        ${form.formState.errors.root ? "border-destructive/50" : ""}
                      `}
                    />
                  ))}
                </div>

                {form.formState.errors.otp && (
                  <p className="text-xs text-destructive mt-2 text-center flex items-center justify-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    Please enter the complete 6-digit code
                  </p>
                )}
              </Field>

              <Field>
                <Button
                  type="submit"
                  className="w-full h-11 font-semibold"
                  disabled={form.formState.isSubmitting || filledCount < 6}
                >
                  {form.formState.isSubmitting
                    ? <><Spinner className="mr-2" />Verifying…</>
                    : "Verify code"}
                </Button>
              </Field>

              {/* Resend row */}
              <Field>
                <div className="flex items-center justify-center gap-1.5 text-sm text-muted-foreground">
                  <span>Didn&apos;t receive a code?</span>
                  {cooldown > 0 ? (
                    <span className="tabular-nums text-muted-foreground/60">
                      Resend in {cooldown}s
                    </span>
                  ) : (
                    <button
                      type="button"
                      disabled={isResending}
                      onClick={handleResend}
                      className="inline-flex items-center gap-1 font-medium text-foreground underline-offset-4 hover:underline disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {isResending ? <><Spinner className="w-3 h-3" />Sending…</> : "Resend"}
                    </button>
                  )}
                </div>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default OtpVerificationForm;