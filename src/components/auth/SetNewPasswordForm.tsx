"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { setNewPasswordSchema } from "@/schema/authSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import z from "zod";

function SetNewPasswordForm() {
  const router = useRouter();
  const form = useForm<z.infer<typeof setNewPasswordSchema>>({
    resolver: zodResolver(setNewPasswordSchema),
    mode: "onChange",
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = (data: z.infer<typeof setNewPasswordSchema>) => {
    console.log("New password data:", data);
    // navigate to login
    router.push("/login");
  };

  return (
    <div>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Set New Password</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Your new password must be different from your previous one
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="new-password">New Password</FieldLabel>
                <Input
                  className="bg-transparent h-12"
                  id="new-password"
                  type="password"
                  placeholder="Enter new password"
                  {...form.register("password")}
                />
                {form.formState.errors.password && (
                  <p className="text-sm text-destructive mt-1">
                    {form.formState.errors.password.message}
                  </p>
                )}
              </Field>

              <Field>
                <FieldLabel htmlFor="confirm-password">
                  Confirm Password
                </FieldLabel>
                <Input
                  className="bg-transparent h-12"
                  id="confirm-password"
                  type="password"
                  placeholder="Confirm new password"
                  {...form.register("confirmPassword")}
                />
                {form.formState.errors.confirmPassword && (
                  <p className="text-sm text-destructive mt-1">
                    {form.formState.errors.confirmPassword.message}
                  </p>
                )}
              </Field>

              <Field>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={
                    form.formState.isSubmitting || !form.formState.isValid
                  }
                >
                  Reset Password
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
