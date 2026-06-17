"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function RerunAuditButton({ businessId }: { businessId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function rerun() {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/businesses/${businessId}/audit`, {
        method: "POST",
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Failed to run audit");
      }

      router.push(`/audit/${data.id}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={rerun}
        disabled={loading}
        className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-70"
      >
        {loading ? "Running audit..." : "Run new audit"}
      </button>
      {error ? <p className="mt-2 text-sm text-rose-600">{error}</p> : null}
    </div>
  );
}
