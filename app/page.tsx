import Link from "next/link";
import { AuditForm } from "@/components/AuditForm";
import { getCurrentUser } from "@/lib/auth/session";

export default async function Home() {
  const user = await getCurrentUser();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <header className="border-b border-slate-200 bg-white/80">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <span className="font-semibold text-indigo-600">Answerspot</span>
          <div className="flex gap-3 text-sm">
            {user ? (
              <Link href="/dashboard" className="font-medium text-slate-700 hover:text-slate-900">
                Dashboard
              </Link>
            ) : (
              <>
                <Link href="/login" className="text-slate-600 hover:text-slate-900">
                  Sign in
                </Link>
                <Link
                  href="/signup"
                  className="font-medium text-indigo-600 hover:text-indigo-500"
                >
                  Sign up
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-12 md:py-16">
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 md:text-5xl">
            See what AI recommends when customers search for your service
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-600">
            Only 1.2% of local businesses appear in AI answers. Run a free audit, then sign in
            to track changes week over week.
          </p>
        </div>

        <div className="mx-auto max-w-2xl">
          <AuditForm isLoggedIn={Boolean(user)} />
        </div>

        <div className="mx-auto mt-10 grid max-w-4xl gap-4 md:grid-cols-3">
          {[
            "Check ChatGPT and Gemini recommendations",
            "Benchmark against local competitors",
            "Compare audit runs over time on your dashboard",
          ].map((item) => (
            <div
              key={item}
              className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 shadow-sm"
            >
              {item}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
