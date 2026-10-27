import { z } from "zod";

const email = z.string().trim().toLowerCase().email("Enter a valid email address.");
const password = z
  .string()
  .min(8, "Password must be at least 8 characters.")
  .max(72, "Password must be at most 72 characters.");

export const registerSchema = z.object({ email, password });
export const loginSchema = z.object({ email, password: z.string().min(1, "Enter your password.") });
export const forgotPasswordSchema = z.object({ email });
export const resetPasswordSchema = z.object({ token: z.string().min(1), password });

export const todoTitleSchema = z
  .string()
  .trim()
  .min(1, "To-do can't be empty.")
  .max(200, "To-do must be at most 200 characters.");

export const weekdaySchema = z.coerce
  .number()
  .int()
  .min(0, "Pick a day of the week.")
  .max(6, "Pick a day of the week.");

export type FormState = { error?: string; message?: string } | undefined;

export function firstError(error: z.ZodError): string {
  return error.issues[0]?.message ?? "Invalid input.";
}
