import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Enter a valid email address"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(5, "Password must be at least 5 characters"),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

export const refreshSchema = z.object({
  refresh: z.string().min(1, "Refresh token is required"),
});

export type RefreshFormValues = z.infer<typeof refreshSchema>;