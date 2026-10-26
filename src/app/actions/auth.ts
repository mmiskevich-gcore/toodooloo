"use server";

import { compare, hash } from "bcryptjs";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { sendPasswordResetEmail } from "@/lib/email";
import { rateLimit } from "@/lib/rate-limit";
import { createSession, deleteSession } from "@/lib/session";
import { generateToken, hashToken } from "@/lib/tokens";
import {
  firstError,
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
  type FormState,
} from "@/lib/validation";

const BCRYPT_ROUNDS = 12;
const RESET_TOKEN_TTL_MS = 60 * 60 * 1000;
const FIFTEEN_MINUTES = 15 * 60 * 1000;
// Compared against when the email doesn't exist, so login takes the same time either way
const DUMMY_HASH = "$2b$12$g6Wn/ahyKSnseziODfGG4.tCUj0Pc1PCxqmuzybyR5rxTLoqtypH6";
const TOO_MANY = "Too many attempts. Try again in a few minutes.";

function appUrl(): string {
  if (process.env.APP_URL) return process.env.APP_URL;
  // Set automatically on Vercel
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  return "http://localhost:3000";
}

async function clientIp(): Promise<string> {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
}

export async function register(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = registerSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: firstError(parsed.error) };
  if (!rateLimit(`register:${await clientIp()}`, 10, FIFTEEN_MINUTES)) return { error: TOO_MANY };

  const { email, password } = parsed.data;
  const existing = await db.user.findUnique({ where: { email } });
  if (existing) return { error: "An account with this email already exists." };

  const user = await db.user.create({
    data: { email, passwordHash: await hash(password, BCRYPT_ROUNDS) },
  });
  await createSession(user.id);
  redirect("/");
}

export async function login(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = loginSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: firstError(parsed.error) };

  const { email, password } = parsed.data;
  if (!rateLimit(`login:${await clientIp()}:${email}`, 5, FIFTEEN_MINUTES)) return { error: TOO_MANY };

  const user = await db.user.findUnique({ where: { email } });
  const valid = await compare(password, user?.passwordHash ?? DUMMY_HASH);
  if (!user || !valid) return { error: "Wrong email or password." };

  await createSession(user.id);
  redirect("/");
}

export async function logout() {
  await deleteSession();
  redirect("/login");
}

export async function requestPasswordReset(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = forgotPasswordSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: firstError(parsed.error) };
  if (!rateLimit(`reset:${await clientIp()}`, 5, FIFTEEN_MINUTES)) return { error: TOO_MANY };

  const user = await db.user.findUnique({ where: { email: parsed.data.email } });
  if (user) {
    const token = generateToken();
    // Only the newest link should work
    await db.passwordResetToken.deleteMany({ where: { userId: user.id, usedAt: null } });
    await db.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash: hashToken(token),
        expiresAt: new Date(Date.now() + RESET_TOKEN_TTL_MS),
      },
    });
    await sendPasswordResetEmail(user.email, `${appUrl()}/reset-password?token=${token}`);
  }

  // Same reply whether or not the account exists, so this form can't be used to find users
  return { message: "If an account exists for that email, we sent a reset link. Check your inbox." };
}

export async function resetPassword(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = resetPasswordSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: firstError(parsed.error) };

  const record = await db.passwordResetToken.findUnique({
    where: { tokenHash: hashToken(parsed.data.token) },
  });
  if (!record || record.usedAt || record.expiresAt <= new Date()) {
    return { error: "This reset link is invalid or has expired. Request a new one." };
  }

  const passwordHash = await hash(parsed.data.password, BCRYPT_ROUNDS);
  await db.$transaction([
    db.user.update({ where: { id: record.userId }, data: { passwordHash } }),
    db.passwordResetToken.update({ where: { id: record.id }, data: { usedAt: new Date() } }),
    // Sign out every device that used the old password
    db.session.deleteMany({ where: { userId: record.userId } }),
  ]);

  await createSession(record.userId);
  redirect("/");
}
