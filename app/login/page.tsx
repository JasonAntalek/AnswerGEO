import { AuthForm } from "@/components/AuthForm";
import Link from "next/link";
export default function LoginPage() {
  return (
    <div className="min-h-screen bg-slate-50 px-4 py-16">
      <div className="mb-6 text-center">
        <Link href="/" className="text-sm font-semibold text-indigo-600">
          ← Back to Answerspot
        </Link>
      </div>

      {process.env.NEXT_PUBLIC_SUPABASE_URL ? null : (
        <div className="mx-auto mb-4 max-w-md rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and
          NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local.
        </div>
      )}

      <AuthForm mode="login" />
    </div>
  );
}
