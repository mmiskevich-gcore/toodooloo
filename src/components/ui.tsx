import Link from "next/link";
import type { ReactNode } from "react";

export const inputClass =
  "w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:focus:border-zinc-300";

export const buttonClass =
  "rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300";

export function AuthCard({ title, children, footer }: { title: string; children: ReactNode; footer?: ReactNode }) {
  return (
    <main className="flex flex-1 items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm">
        <Link href="/" className="mb-8 block text-center text-2xl font-bold tracking-tight">
          toodooloo
        </Link>
        <div className="rounded-xl border border-zinc-200 p-6 dark:border-zinc-800">
          <h1 className="mb-4 text-lg font-semibold">{title}</h1>
          {children}
        </div>
        {footer && <div className="mt-4 text-center text-sm text-zinc-600 dark:text-zinc-400">{footer}</div>}
      </div>
    </main>
  );
}

export function FormMessage({ error, message }: { error?: string; message?: string }) {
  if (error) return <p role="alert" className="text-sm text-red-600">{error}</p>;
  if (message) return <p role="status" className="text-sm text-green-700 dark:text-green-400">{message}</p>;
  return null;
}
