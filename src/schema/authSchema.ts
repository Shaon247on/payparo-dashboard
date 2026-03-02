import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Email is required")
    .email("Invalid email address"),

  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(100, "Password is too long"),
});

// new
export const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export const otpSchema = z.object({
  otp: z.tuple([
    z.string().length(1),
    z.string().length(1),
    z.string().length(1),
    z.string().length(1),
    z.string().length(1),
    z.string().length(1),
  ]),
});

export const setNewPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type LoginInput = z.infer<typeof loginSchema>;
