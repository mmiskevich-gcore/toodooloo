import Link from "next/link";
import { ForgotPasswordForm } from "@/components/auth-forms";
import { AuthCard } from "@/components/ui";

export default function ForgotPasswordPage() {
  return (
    <AuthCard title="Reset your password" footer={<Link href="/login" className="underline">Back to log in</Link>}>
      <ForgotPasswordForm />
    </AuthCard>
  );
}
