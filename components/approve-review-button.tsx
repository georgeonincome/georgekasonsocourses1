"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

export function ApproveReviewButton({ reviewId }: { reviewId: number }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function approve() {
    setError(null);
    const res = await fetch(`/api/admin/reviews/${reviewId}/approve`, {
      method: "PATCH",
    });
    if (!res.ok) {
      const body = await res.json().catch(() => null);
      setError(body?.error ?? "Could not approve that review.");
      return;
    }
    setDone(true);
    startTransition(() => router.refresh());
  }

  if (done) {
    return (
      <span className="rounded-lg bg-emerald-50 px-4 py-2 text-[0.88rem] font-medium text-emerald-700">
        Published
      </span>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      <button
        type="button"
        onClick={approve}
        disabled={pending}
        className="btn btn-navy !py-2 !px-4 !text-[0.88rem]"
      >
        {pending ? "Publishing…" : "Approve & publish"}
      </button>
      {error && <span className="text-[0.82rem] text-red-600">{error}</span>}
    </div>
  );
}
