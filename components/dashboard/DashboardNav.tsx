import Link from "next/link";
import { SignOutButton } from "@/components/dashboard/SignOutButton";

export function DashboardNav({ email }: { email?: string }) {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="font-semibold text-indigo-600">
            Answerspot
          </Link>
          <Link href="/dashboard" className="text-sm text-slate-600 hover:text-slate-900">
            Dashboard
          </Link>
        </div>
        <div className="flex items-center gap-3">
          {email ? <span className="text-sm text-slate-500">{email}</span> : null}
          <SignOutButton />
        </div>
      </div>
    </header>
  );
}
