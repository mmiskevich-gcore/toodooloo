import "server-only";
import { appendFile } from "node:fs/promises";
import { Resend } from "resend";

export async function sendPasswordResetEmail(to: string, resetUrl: string) {
  const subject = "Reset your Toodooloo password";
  const text = `Someone asked to reset the password for this email.\n\nReset it here (link works for 1 hour, once):\n${resetUrl}\n\nIf this wasn't you, ignore this email.`;

  if (!process.env.RESEND_API_KEY) {
    console.log(`\n[email] To: ${to}\n[email] Subject: ${subject}\n[email] ${text}\n`);
    // Local outbox so end-to-end tests can pick up the reset link
    if (process.env.NODE_ENV !== "production") {
      await appendFile(".dev-emails.jsonl", JSON.stringify({ to, subject, resetUrl }) + "\n");
    }
    return;
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  const { error } = await resend.emails.send({
    from: process.env.EMAIL_FROM ?? "Toodooloo <onboarding@resend.dev>",
    to,
    subject,
    text,
  });
  if (error) console.error("[email] Failed to send reset email:", error);
}
