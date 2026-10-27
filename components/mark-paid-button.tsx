"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

/**
 * Admin control for confirming a payment that arrived out of band — mobile
 * money to the till, cash at the office, a bank transfer. It calls the same
 * endpoint the Flutterwave webhook feeds, so marking an order paid also
 * creates the enrolment and unlocks the course.
 */
export function MarkPaidButton({ orderId }: { orderId: number }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function markPaid() {
    if (
      !window.confirm(
        "Confirm the money has arrived? This marks the order paid and unlocks the course for the student.",
      )
    ) {
      return;
    }

    setError(null);
    const res = await fetch(`/api/payments/order/${orderId}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ status: "paid" }),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => null);
      setError(body?.error ?? "Could not mark that order paid.");
      return;
    }

    setDone(true);
    startTransition(() => router.refresh());
  }

  if (done) {
    return (
      <span className="rounded-lg bg-emerald-50 px-3 py-2 text-[0.82rem] font-medium text-emerald-700">
        Paid &amp; unlocked
      </span>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      <button
        type="button"
        onClick={markPaid}
        disabled={pending}
        className="btn btn-gold !py-2 !px-4 !text-[0.85rem]"
      >
        {pending ? "Unlocking…" : "Mark paid"}
      </button>
      {error && <span className="text-[0.8rem] text-red-600">{error}</span>}
    </div>
  );
}
