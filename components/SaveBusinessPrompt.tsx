import Link from "next/link";

export function SaveBusinessPrompt() {
  return (
    <div className="rounded-2xl border border-indigo-200 bg-indigo-50 p-5">
      <h3 className="font-semibold text-indigo-900">Save this business to your dashboard</h3>
      <p className="mt-1 text-sm text-indigo-800">
        Sign in to track AI visibility over time and compare runs week over week.
      </p>
      <div className="mt-3 flex gap-2">
        <Link
          href="/signup"
          className="rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-500"
        >
          Create free account
        </Link>
        <Link
          href="/login"
          className="rounded-lg border border-indigo-300 px-3 py-2 text-sm font-medium text-indigo-700 hover:bg-indigo-100"
        >
          Sign in
        </Link>
      </div>
    </div>
  );
}
