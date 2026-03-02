"use client"
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldGroup } from "@/components/ui/field";
import { otpSchema } from "@/schema/authSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useRef } from "react";
import { useForm } from "react-hook-form";
import z from "zod";

function OtpVerificationForm() {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
const router = useRouter()
  const form = useForm<z.infer<typeof otpSchema>>({
    resolver: zodResolver(otpSchema),
    mode: "onChange",
    defaultValues: {
      otp: ["", "", "", "", "", ""],
    },
  });

  const onSubmit = (data: z.infer<typeof otpSchema>) => {
    const code = data.otp.join("");
    console.log("OTP submitted:", code);
    // navigate to set new password
    router.push("/new-password")
  };

  const handleChange = (index: number, value: string) => {
    // only allow single digit
    const digit = value.replace(/\D/g, "").slice(-1);
    const current = form.getValues("otp");
    const updated = [...current];
    updated[index] = digit;
    form.setValue("otp", updated as [string, string, string, string, string, string], {
      shouldValidate: true,
    });

    // auto-focus next
    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      const current = form.getValues("otp");
      if (!current[index] && index > 0) {
        // clear previous and focus it
        const updated = [...current];
        updated[index - 1] = "";
        form.setValue("otp", updated as [string, string, string, string, string, string]);
        inputRefs.current[index - 1]?.focus();
      }
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    const digits = pasted.split("");
    const updated = Array(6).fill("").map((_, i) => digits[i] ?? "");
    form.setValue(
      "otp",
      updated as [string, string, string, string, string, string],
      { shouldValidate: true }
    );
    // focus last filled input
    const lastIndex = Math.min(digits.length - 1, 5);
    inputRefs.current[lastIndex]?.focus();
  };

  const otpValues = form?.watch("otp");

  return (
    <div>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Verify your email</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            We sent a 6-digit code to your email address
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <FieldGroup>
              <Field>
                <div className="flex items-center justify-between gap-2 mt-2">
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
                      className="w-12 h-12 text-center text-lg font-semibold border border-input rounded-md bg-transparent focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
                    />
                  ))}
                </div>
                {form.formState.errors.otp && (
                  <p className="text-sm text-destructive mt-2 text-center">
                    Please enter the complete 6-digit code
                  </p>
                )}
              </Field>

              <Field>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={
                    form.formState.isSubmitting ||
                    otpValues.some((v) => v === "")
                  }
                >
                  Verify Code
                </Button>
              </Field>

              <Field>
                <p className="text-sm text-center text-muted-foreground">
                  Didn&apos;t receive a code?{" "}
                  <button
                    type="button"
                    className="underline underline-offset-4 hover:text-primary"
                    onClick={() => console.log("Resend OTP")}
                  >
                    Resend
                  </button>
                </p>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default OtpVerificationForm;