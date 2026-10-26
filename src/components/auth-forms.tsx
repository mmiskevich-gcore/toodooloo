"use client";

import Link from "next/link";
import { useActionState } from "react";
import { login, register, requestPasswordReset, resetPassword } from "@/app/actions/auth";
import { buttonClass, FormMessage, inputClass } from "./ui";

export function LoginForm() {
  const [state, action, pending] = useActionState(login, undefined);
  return (
    <form action={action} className="flex flex-col gap-3">
      <input name="email" type="email" placeholder="Email" autoComplete="email" required className={inputClass} />
      <input name="password" type="password" placeholder="Password" autoComplete="current-password" required className={inputClass} />
      <FormMessage error={state?.error} />
      <button disabled={pending} className={buttonClass}>{pending ? "Logging in…" : "Log in"}</button>
      <Link href="/forgot-password" className="text-center text-sm text-zinc-600 underline dark:text-zinc-400">
        Forgot password?
      </Link>
    </form>
  );
}

export function RegisterForm() {
  const [state, action, pending] = useActionState(register, undefined);
  return (
    <form action={action} className="flex flex-col gap-3">
      <input name="email" type="email" placeholder="Email" autoComplete="email" required className={inputClass} />
      <input name="password" type="password" placeholder="Password (8+ characters)" autoComplete="new-password" minLength={8} required className={inputClass} />
      <FormMessage error={state?.error} />
      <button disabled={pending} className={buttonClass}>{pending ? "Creating account…" : "Create account"}</button>
    </form>
  );
}

export function ForgotPasswordForm() {
  const [state, action, pending] = useActionState(requestPasswordReset, undefined);
  return (
    <form action={action} className="flex flex-col gap-3">
      <p className="text-sm text-zinc-600 dark:text-zinc-400">Enter your email and we&apos;ll send you a reset link.</p>
      <input name="email" type="email" placeholder="Email" autoComplete="email" required className={inputClass} />
      <FormMessage error={state?.error} message={state?.message} />
      <button disabled={pending} className={buttonClass}>{pending ? "Sending…" : "Send reset link"}</button>
    </form>
  );
}

export function ResetPasswordForm({ token }: { token: string }) {
  const [state, action, pending] = useActionState(resetPassword, undefined);
  return (
    <form action={action} className="flex flex-col gap-3">
      <input type="hidden" name="token" value={token} />
      <input name="password" type="password" placeholder="New password (8+ characters)" autoComplete="new-password" minLength={8} required className={inputClass} />
      <FormMessage error={state?.error} />
      <button disabled={pending} className={buttonClass}>{pending ? "Saving…" : "Set new password"}</button>
    </form>
  );
}
