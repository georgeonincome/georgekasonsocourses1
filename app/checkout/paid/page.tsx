import Link from "next/link";
import { Suspense } from "react";

import { OrderStatus } from "@/components/order-status";
import { pageMeta } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata = pageMeta({
  title: "Payment status",
  description: "Payment confirmation for The $100 Guy courses.",
  path: "/checkout/paid",
  noindex: true,
});

export default async function PaidPage({
  searchParams,
}: {
  searchParams: Promise<{ tx_ref?: string; status?: string }>;
}) {
  const { tx_ref, status } = await searchParams;

  return (
    <div className="section">
      <div className="wrap">
        <div className="mx-auto max-w-2xl">
          <span className="eyebrow">Checkout</span>
          <h1 className="h-display text-[2.1rem] sm:text-[2.6rem]">
            Thank you
          </h1>

          {tx_ref ? (
            <Suspense fallback={<PaymentPending />}>
              <OrderStatus reference={tx_ref} initialStatus={status} />
            </Suspense>
          ) : (
            <PaymentPending />
          )}
        </div>
      </div>
    </div>
  );
}

function PaymentPending() {
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
        <Link href="/support" className="btn btn-ghost">
          Need help?
        </Link>
      </div>
    </>
  );
}
