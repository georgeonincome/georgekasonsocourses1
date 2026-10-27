"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type State = "checking" | "paid" | "pending" | "failed";

export function OrderStatus({
  reference,
  initialStatus,
}: {
  reference: string;
  initialStatus?: string;
}) {
  const [state, setState] = useState<State>(
    initialStatus === "successful" || initialStatus === "completed"
      ? "paid"
      : "checking",
  );

  useEffect(() => {
    let cancelled = false;
    let attempts = 0;

    async function poll() {
      attempts += 1;
      try {
        const res = await fetch(`/api/orders/${encodeURIComponent(reference)}`, {
          cache: "no-store",
        });
        if (res.ok) {
          const body = await res.json();
          if (cancelled) return;
          if (body.status === "paid") {
            setState("paid");
            return;
          }
          if (body.status === "failed" || body.status === "cancelled") {
            setState("failed");
            return;
          }
        }
      } catch {
        // Keep polling — the webhook may not have landed yet.
      }
      if (!cancelled && attempts < 20) {
        setTimeout(poll, 3000);
      } else if (!cancelled) {
        setState("pending");
      }
    }

    poll();
    return () => {
      cancelled = true;
    };
  }, [reference]);

  if (state === "paid") {
    return (
      <>
        <p className="mt-4 text-[1.02rem] leading-relaxed text-muted">
          Your payment came through. Your course is open now — start with the
          first lesson whenever you are ready.
        </p>
        <p className="mt-3 text-[0.88rem] text-muted">
          Order reference{" "}
          <code className="rounded bg-surface px-2 py-0.5 font-mono text-[0.85rem]">
            {reference}
          </code>
        </p>
        <div className="mt-7 flex flex-wrap gap-3">
          <Link href="/my-courses" className="btn btn-gold">
            Go to My Courses
          </Link>
          <Link href="/courses" className="btn btn-ghost">
            Browse another course
          </Link>
        </div>
      </>
    );
  }

  if (state === "failed") {
    return (
      <>
        <p className="mt-4 text-[1.02rem] leading-relaxed text-muted">
          That payment did not go through, so nothing has been charged. You
          can try again from the course page.
        </p>
        <div className="mt-7 flex flex-wrap gap-3">
          <Link href="/courses" className="btn btn-navy">
            Back to courses
          </Link>
          <Link href="/support" className="btn btn-ghost">
            Talk to us
          </Link>
        </div>
      </>
    );
  }

  if (state === "pending") {
    return (
      <>
        <p className="mt-4 text-[1.02rem] leading-relaxed text-muted">
          We have your order but the confirmation has not reached us yet. If
          you were charged, message us on WhatsApp with the reference below and
          we will switch it on straight away.
        </p>
        <p className="mt-3 text-[0.88rem] text-muted">
          Order reference{" "}
          <code className="rounded bg-surface px-2 py-0.5 font-mono text-[0.85rem]">
            {reference}
          </code>
        </p>
        <div className="mt-7 flex flex-wrap gap-3">
          <Link href="/my-courses" className="btn btn-navy">
            Go to My Courses
          </Link>
          <Link href="/support" className="btn btn-ghost">
            Get help
          </Link>
        </div>
      </>
    );
  }

  return (
    <>
      <p className="mt-4 text-[1.02rem] leading-relaxed text-muted">
        We are confirming your payment. This page updates on its own — it
        usually takes a few seconds.
      </p>
      <div className="mt-7 flex flex-wrap gap-3">
        <Link href="/my-courses" className="btn btn-navy">
          Go to My Courses
        </Link>
      </div>
    </>
  );
}
