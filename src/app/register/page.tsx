import Link from "next/link";
import { RegisterForm } from "@/components/auth-forms";
import { AuthCard } from "@/components/ui";

export default function RegisterPage() {
  return (
    <AuthCard
      title="Create an account"
      footer={<>Already have one? <Link href="/login" className="underline">Log in</Link></>}
    >
      <RegisterForm />
    </AuthCard>
  );
}
