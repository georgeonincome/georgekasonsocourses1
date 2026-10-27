"use client";

import Link from "next/link";
import { useCart } from "@/components/cart-provider";
import { formatPrice } from "@/lib/format";

export function CartView() {
  const { lines, total, ready, remove, clear, count } = useCart();

  if (!ready) {
    return (
      <div className="rounded-xl border border-line bg-surface px-5 py-8 text-[0.95rem] text-muted">
        Loading your cart…
      </div>
    );
  }

  if (count === 0) {
    return (
      <div className="rounded-xl border border-line bg-surface px-6 py-12 text-center">
        <p className="text-[1.05rem] font-semibold">Your cart is empty</p>
        <p className="mx-auto mt-2 max-w-md text-[0.95rem] text-muted">
          Pick a course and it will show up here. If you are not sure where
          to start,{" "}
          <Link
            href="/courses/learn-to-earn"
            className="font-semibold text-gold-600 hover:text-gold"
          >
            Learn to Earn
          </Link>{" "}
          is the usual starting point.
        </p>
        <Link href="/courses" className="btn btn-navy mt-6">
          Browse courses
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
      <ul className="space-y-4">
        {lines.map((line) => (
          <li key={line.slug} className="card flex items-start gap-5 p-5">
            <div className="min-w-0 flex-1">
              <Link
                href={`/courses/${line.slug}`}
                className="text-[1.05rem] font-semibold leading-snug hover:text-gold-600"
              >
                {line.title}
              </Link>
              <p className="mt-1.5 text-[0.9rem] text-muted">
                Lifetime access · Certificate on completion
              </p>
            </div>
            <div className="text-right">
              <p className="font-semibold">{formatPrice(line.price, line.currency)}</p>
              <button
                type="button"
                onClick={() => remove(line.slug)}
                className="mt-2 text-[0.85rem] text-muted underline underline-offset-2 hover:text-red-600"
              >
                Remove
              </button>
            </div>
          </li>
        ))}
        <li>
          <button
            type="button"
            onClick={clear}
            className="text-[0.88rem] text-muted underline underline-offset-2 hover:text-ink"
          >
            Empty the cart
          </button>
        </li>
      </ul>

      <aside className="card h-fit p-6 lg:sticky lg:top-24">
        <h2 className="text-[1.15rem] font-semibold">Summary</h2>
        <dl className="mt-4 space-y-2.5 text-[0.95rem]">
          <div className="flex justify-between">
            <dt className="text-muted">
              {count} course{count === 1 ? "" : "s"}
            </dt>
            <dd>{formatPrice(total, lines[0]?.currency ?? "ZMW")}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted">Delivery</dt>
            <dd>Instant</dd>
          </div>
          <div className="flex justify-between border-t border-line pt-3 text-[1.1rem] font-semibold">
            <dt>Total</dt>
            <dd>{formatPrice(total, lines[0]?.currency ?? "ZMW")}</dd>
          </div>
        </dl>

        <Link
          href="/checkout"
          className="btn btn-gold mt-6 w-full"
        >
          Continue to checkout
        </Link>

        <p className="mt-4 text-[0.82rem] leading-relaxed text-muted">
          Prices are shown in Zambian kwacha and are indicative until George
          confirms the final figures. You will see the exact amount before
          you pay.
        </p>
      </aside>
    </div>
  );
}
