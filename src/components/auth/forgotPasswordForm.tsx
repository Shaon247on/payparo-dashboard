"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/shared/Spinner";
import { forgotPasswordSchema, type ForgotPasswordFormValues } from "@/schema/passwordReset.schema";
import { forgotPasswordAction } from "@/actions/passwordReset.action";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, Mail } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";


function ForgotPasswordForm() {
  const router = useRouter();

  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    mode: "onChange",
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
    <div className="w-full max-w-sm mx-auto">
      <Card>
        <CardHeader className="text-center pb-2">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 border border-primary/20">
            <Mail className="h-5 w-5 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">
            Forgot password?
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Enter your email and we&apos;ll send you a reset code
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
                <FieldLabel htmlFor="forgot-email">Email address</FieldLabel>
                <Input
                  id="forgot-email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  className="bg-transparent h-11"
                  {...form.register("email")}
                />
                {form.formState.errors.email && (
                  <p className="text-xs text-destructive mt-1 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3 shrink-0" />
                    {form.formState.errors.email.message}
                  </p>
                )}
              </Field>

              <Field>
                <Button
                  type="submit"
                  className="w-full h-11 font-semibold mt-1"
                  disabled={form.formState.isSubmitting}
                >
                  {form.formState.isSubmitting
                    ? <><Spinner className="mr-2" />Sending code…</>
                    : "Send reset code"}
                </Button>
              </Field>

              <Field>
                <p className="text-sm text-center text-muted-foreground">
                  Remember your password?{" "}
                  <Link
                    href="/login"
                    className="text-foreground font-medium underline-offset-4 hover:underline"
                  >
                    Sign in
                  </Link>
                </p>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default ForgotPasswordForm;