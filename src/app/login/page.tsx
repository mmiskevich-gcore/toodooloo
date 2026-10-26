import Link from "next/link";
import { LoginForm } from "@/components/auth-forms";
import { AuthCard } from "@/components/ui";

export default function LoginPage() {
  return (
    <AuthCard
      title="Log in"
      footer={<>No account? <Link href="/register" className="underline">Sign up</Link></>}
    >
      <LoginForm />
    </AuthCard>
  );
}
