"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import {
  acceptInviteSchema,
  type AcceptInviteFormValues,
} from "@/schema/kyc.schema";
import { acceptInviteAction } from "@/actions/kyc.action";
import { toast } from "sonner";

interface AcceptInviteFormProps {
  token: string;
  email: string;
}

export default function AcceptInviteForm({ token, email }: AcceptInviteFormProps) {
  const router = useRouter();

  const form = useForm<AcceptInviteFormValues>({
    resolver: zodResolver(acceptInviteSchema),
    mode: "onChange",
    defaultValues: {
      full_name: "",
      password: "",
      confirm_password: "",
    },
  });

  const onSubmit = async (data: AcceptInviteFormValues) => {
    const result = await acceptInviteAction({
      token,
      full_name: data.full_name,
      password: data.password,
    });

    if (!result.success) {
      form.setError("root", { message: result.error });
      return;
    }

    toast.success(result.data.message);
    router.push("/login");
  };

  return (
    <form id="accept-invite-form" onSubmit={form.handleSubmit(onSubmit)}>
      <FieldGroup>
        {form.formState.errors.root && (
          <p className="text-sm text-destructive text-center">
            {form.formState.errors.root.message}
          </p>
        )}

        {/* Read-only email */}
        <Field>
          <FieldLabel htmlFor="accept-email">Email Address</FieldLabel>
          <Input
            id="accept-email"
            type="email"
            value={email}
            readOnly
            className="bg-white/5 border-white/10 text-white/40 h-12 cursor-not-allowed focus-visible:ring-0"
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="full-name">Full Name</FieldLabel>
          <Input
            id="full-name"
            className="bg-[#1a1d27] border-white/10 text-white placeholder:text-white/25 h-12 focus-visible:ring-0 focus-visible:border-white/20"
            placeholder="Enter your full name"
            {...form.register("full_name")}
          />
          {form.formState.errors.full_name && (
            <p className="text-sm text-destructive mt-1">
              {form.formState.errors.full_name.message}
            </p>
          )}
        </Field>

        <Field>
          <FieldLabel htmlFor="password">Password</FieldLabel>
          <Input
            id="password"
            type="password"
            className="bg-[#1a1d27] border-white/10 text-white placeholder:text-white/25 h-12 focus-visible:ring-0 focus-visible:border-white/20"
            placeholder="At least 8 characters"
            {...form.register("password")}
          />
          {form.formState.errors.password && (
            <p className="text-sm text-destructive mt-1">
              {form.formState.errors.password.message}
            </p>
          )}
        </Field>

        <Field>
          <FieldLabel htmlFor="confirm-password">Confirm Password</FieldLabel>
          <Input
            id="confirm-password"
            type="password"
            className="bg-[#1a1d27] border-white/10 text-white placeholder:text-white/25 h-12 focus-visible:ring-0 focus-visible:border-white/20"
            placeholder="Repeat your password"
            {...form.register("confirm_password")}
          />
          {form.formState.errors.confirm_password && (
            <p className="text-sm text-destructive mt-1">
              {form.formState.errors.confirm_password.message}
            </p>
          )}
        </Field>

        <Field>
          <Button
            form="accept-invite-form"
            type="submit"
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold h-12"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? "Creating account…" : "Create Account"}
          </Button>
        </Field>
      </FieldGroup>
    </form>
  );
}