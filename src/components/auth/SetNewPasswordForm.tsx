"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/shared/Spinner";
import {
  setNewPasswordSchema,
  type SetNewPasswordFormValues,
} from "@/schema/passwordReset.schema";
import { setNewPasswordAction } from "@/actions/passwordReset.action";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, CheckCircle2, Eye, EyeOff, KeyRound, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

// ── Step indicator ────────────────────────────────────────────────────────────
function StepIndicator({ current }: { current: number }) {
  return (
    <div className="flex items-center justify-center gap-1.5 mb-6">
      {[0, 1, 2].map((i) => (
        <div key={i} className="flex items-center gap-1.5">
          <div className={`h-1.5 w-6 rounded-full transition-colors ${i <= current ? "bg-primary" : "bg-muted"}`} />
          {i < 2 && <div className={`h-px w-3 ${i < current ? "bg-primary" : "bg-muted"}`} />}
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
    { label: "Too short", color: "bg-destructive" },
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
      <Input
        id={id}
        type={show ? "text" : "password"}
        placeholder={placeholder}
        className="bg-transparent h-11 pr-10"
        autoComplete="new-password"
        {...registration}
      />
      <button
        type="button"
        tabIndex={-1}
        onClick={() => setShow((v) => !v)}
        aria-label={show ? "Hide password" : "Show password"}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
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
    <div className="w-full max-w-sm mx-auto">
      <Card>
        <CardHeader className="text-center pb-2">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 border border-primary/20">
            <KeyRound className="h-5 w-5 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">
            Set new password
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Must be different from your previous password
          </p>
        </CardHeader>

        <CardContent className="pt-2">
          <StepIndicator current={2} />

          <form onSubmit={form.handleSubmit(onSubmit)}>
            <FieldGroup>
              {form.formState.errors.root && (
                <div className="flex items-start gap-2.5 rounded-md border border-destructive/30 bg-destructive/5 px-3.5 py-3 text-sm text-destructive">
                  <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                  <span>{form.formState.errors.root.message}</span>
                </div>
              )}

              {/* New password */}
              <Field>
                <FieldLabel htmlFor="new-password">New password</FieldLabel>
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
                            strength.score >= level ? strength.color : "bg-muted"
                          }`}
                        />
                      ))}
                    </div>
                    <p className={`text-xs ${
                      strength.score <= 1 ? "text-destructive"
                      : strength.score === 2 ? "text-amber-500"
                      : "text-emerald-500"
                    }`}>
                      {strength.label}
                    </p>
                  </div>
                )}

                {form.formState.errors.password && (
                  <p className="text-xs text-destructive mt-1 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3 shrink-0" />
                    {form.formState.errors.password.message}
                  </p>
                )}
              </Field>

              {/* Confirm password */}
              <Field>
                <FieldLabel htmlFor="confirm-password">Confirm password</FieldLabel>
                <PasswordInput
                  id="confirm-password"
                  placeholder="Repeat new password"
                  registration={form.register("confirmPassword")}
                />

                {/* Match indicator */}
                {confirmPassword.length > 0 && (
                  <p className={`text-xs mt-1.5 flex items-center gap-1 ${
                    passwordsMatch ? "text-emerald-500" : "text-destructive"
                  }`}>
                    {passwordsMatch
                      ? <><CheckCircle2 className="h-3 w-3" />Passwords match</>
                      : passwordsMismatch
                        ? <><X className="h-3 w-3" />Passwords do not match</>
                        : null}
                  </p>
                )}

                {form.formState.errors.confirmPassword && !confirmPassword && (
                  <p className="text-xs text-destructive mt-1 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3 shrink-0" />
                    {form.formState.errors.confirmPassword.message}
                  </p>
                )}
              </Field>

              <Field>
                <Button
                  type="submit"
                  className="w-full h-11 font-semibold mt-1"
                  disabled={form.formState.isSubmitting || !form.formState.isValid}
                >
                  {form.formState.isSubmitting
                    ? <><Spinner className="mr-2" />Resetting…</>
                    : "Reset password"}
                </Button>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default SetNewPasswordForm;