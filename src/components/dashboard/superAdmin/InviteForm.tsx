"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { inviteAdminSchema, type InviteAdminFormValues } from "@/schema/kyc.schema";
import { inviteKycAdminAction } from "@/actions/kyc.action";
import { toast } from "sonner";

export default function InviteForm() {
  const router = useRouter();

  const form = useForm<InviteAdminFormValues>({
    resolver: zodResolver(inviteAdminSchema),
    mode: "onChange",
    defaultValues: { email: "" },
  });

  const onSubmit = async (data: InviteAdminFormValues) => {
    const result = await inviteKycAdminAction(data.email);
    if (!result.success) {
      form.setError("root", { message: result.error });
      return;
    }
    toast.success(result.data.message);
    form.reset();
    router.refresh();
  };

  return (
    <Card className="bg-[#13151e] border-white/5">
      <CardHeader className="px-5 pt-5 pb-4 border-b border-white/5">
        <CardTitle className="text-white text-base font-semibold">
          Add New Administrator
        </CardTitle>
      </CardHeader>
      <CardContent className="px-5 py-5">
        <form id="invite-form" onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup>
            {form.formState.errors.root && (
              <p className="text-sm text-destructive">
                {form.formState.errors.root.message}
              </p>
            )}

            <Field>
              <FieldLabel htmlFor="invite-email">Email Address</FieldLabel>
              <Input
                id="invite-email"
                className="bg-[#1a1d27] border-white/10 text-white placeholder:text-white/25 h-12 focus-visible:ring-0 focus-visible:border-white/20"
                placeholder="Enter email"
                type="email"
                {...form.register("email")}
              />
              {form.formState.errors.email && (
                <p className="text-sm text-destructive mt-1">
                  {form.formState.errors.email.message}
                </p>
              )}
            </Field>
          </FieldGroup>
        </form>

        <div className="flex justify-end gap-3 mt-5">
          <Button
            type="button"
            variant="outline"
            className="bg-transparent border-white/15 text-white/60 hover:bg-white/5 hover:text-white h-10 px-5"
            onClick={() => form.reset()}
            disabled={form.formState.isSubmitting}
          >
            Cancel
          </Button>
          <Button
            form="invite-form"
            type="submit"
            className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold h-10 px-5"
            disabled={form.formState.isSubmitting || !form.formState.isValid}
          >
            {form.formState.isSubmitting ? "Sending…" : "Send Invitation"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}