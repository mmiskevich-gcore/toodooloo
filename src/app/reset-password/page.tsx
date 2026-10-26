import Link from "next/link";
import { Suspense } from "react";
import { ResetPasswordForm } from "@/components/auth-forms";
import { AuthCard } from "@/components/ui";

export default function ResetPasswordPage({ searchParams }: PageProps<"/reset-password">) {
  return (
    <AuthCard title="Choose a new password" footer={<Link href="/login" className="underline">Back to log in</Link>}>
      <Suspense fallback={null}>
        <ResetForm searchParams={searchParams} />
      </Suspense>
    </AuthCard>
  );
}

async function ResetForm({ searchParams }: Pick<PageProps<"/reset-password">, "searchParams">) {
  const { token } = await searchParams;
  if (typeof token !== "string" || !token) {
    return (
      <p className="text-sm text-red-600">
        This reset link is missing its token. <Link href="/forgot-password" className="underline">Request a new one</Link>.
      </p>
    );
  }
  return <ResetPasswordForm token={token} />;
}
