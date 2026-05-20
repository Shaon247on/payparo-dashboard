import { z } from "zod";

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Enter a valid email address"),
});

export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export const otpSchema = z.object({
  otp: z
    .array(z.string())
    .length(6)
    .refine((arr) => arr.every((v) => /^\d$/.test(v)), {
      message: "Please enter the complete 6-digit code",
    }),
});

export type OtpFormValues = z.infer<typeof otpSchema>;

export const setNewPasswordSchema = z
  .object({
    password: z
      .string()
      .min(1, "Password is required")
      .min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type SetNewPasswordFormValues = z.infer<typeof setNewPasswordSchema>;