"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

import { useCart } from "@/components/cart-provider";
import { formatPrice } from "@/lib/format";

type State = "idle" | "submitting" | "done" | "error";

export function CheckoutForm({
  email: defaultEmail,
  name: defaultName,
}: {
  email: string;
  name: string;
}) {
  const router = useRouter();
  const params = useSearchParams();
  const { lines, total, ready, add, clear } = useCart();

  const [email, setEmail] = useState(defaultEmail);
  const [name, setName] = useState(defaultName);
  const [phone, setPhone] = useState("");
  const [state, setState] = useState<State>("idle");
  const [message, setMessage] = useState<string | null>(null);
  const [orderRef, setOrderRef] = useState<string | null>(null);

  const courseParam = params.get("course");

  // Arriving from a course page's "Enroll now" button with an empty cart:
  // pull that course in.
  useEffect(() => {
    if (!courseParam || !ready || lines.length) return;
    fetch(`/api/course/${courseParam}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((course) => {
        if (!course) return;
        add({
          slug: course.slug,
          title: course.title,
          price: course.price,
          currency: course.currency,
        });
      })
      .catch(() => undefined);
  }, [courseParam, ready, lines.length, add]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (lines.length === 0) {
      setState("error");
      setMessage("Your cart is empty.");
      return;
    }
    setState("submitting");
    setMessage(null);

    // The current checkout records one order per course; a gateway that can
    // take a multi-line basket plugs in here.
    let last: { ok: boolean; ref?: string } = { ok: false };
    for (const line of lines) {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ slug: line.slug, email, name, phone }),
      });
      const body = await res.json().catch(() => null);
      if (!res.ok) {
        setState("error");
        setMessage(body?.error ?? "Something went wrong. Please try again.");
        return;
      }
      if (body?.immediate) {
        clear();
        router.push("/my-courses");
        return;
      }

      // A gateway was used: send the student to the hosted checkout.
      if (body?.paymentUrl) {
        clear();
        window.location.assign(body.paymentUrl);
        return;
      }

      last = {
        ok: true,
        ref:
          body?.reference ?? (body?.orderId ? `ORD-${body.orderId}` : undefined),
      };
    }

    if (last.ok) {
      setOrderRef(last.ref ?? null);
      setState("done");
      clear();
    }
  }

  if (state === "done") {
    return (
      <div className="card max-w-2xl p-8">
        <h2 className="text-[1.4rem] font-semibold">
          Your order is recorded
        </h2>
        <p className="mt-3 text-[0.98rem] leading-relaxed text-muted">
          Order reference{" "}
          <code className="rounded bg-surface px-2 py-0.5 font-mono text-[0.88rem]">
            {orderRef ?? "pending"}
          </code>
          . We will confirm your payment and your course access will appear in
          My Courses as soon as it clears.
        </p>
        <div className="mt-7 flex flex-wrap gap-3">
          <Link href="/my-courses" className="btn btn-navy">
            Go to My Courses
          </Link>
          <Link href="/support" className="btn btn-ghost">
            Payment help
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
      <form onSubmit={submit} className="card p-7">
        <h2 className="text-[1.2rem] font-semibold">Your details</h2>
        <p className="mt-1.5 text-[0.92rem] text-muted">
          Your receipt and course access go to this address.
        </p>

        <div className="mt-6 space-y-5">
          <label className="block">
            <span className="text-[0.9rem] font-medium">Full name</span>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-line bg-white px-4 py-3 text-[0.95rem] outline-none focus:border-gold"
              placeholder="Your name"
            />
          </label>

          <label className="block">
            <span className="text-[0.9rem] font-medium">Email</span>
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-line bg-white px-4 py-3 text-[0.95rem] outline-none focus:border-gold"
              placeholder="you@example.com"
            />
          </label>

          <label className="block">
            <span className="text-[0.9rem] font-medium">
              Phone{" "}
              <span className="font-normal text-muted">(optional)</span>
            </span>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-line bg-white px-4 py-3 text-[0.95rem] outline-none focus:border-gold"
              placeholder="+260 …"
            />
          </label>
        </div>

        <div className="mt-7 rounded-xl border border-line bg-surface p-5">
          <h3 className="text-[0.98rem] font-semibold">Payment</h3>
          <p className="mt-2 text-[0.9rem] leading-relaxed text-muted">
            You will be taken to a secure checkout to pay with mobile money or
            a card, in kwacha. Your course opens as soon as the payment is
            confirmed.
          </p>
        </div>

        {state === "error" && message && (
          <p className="mt-5 rounded-lg bg-red-50 px-4 py-3 text-[0.9rem] text-red-700">
            {message}
          </p>
        )}

        <button
          type="submit"
          disabled={state === "submitting" || !ready || lines.length === 0}
          className="btn btn-gold mt-7 w-full disabled:cursor-not-allowed disabled:opacity-60"
        >
          {state === "submitting"
            ? "Recording your order…"
            : "Place your order"}
        </button>
      </form>

      <aside className="card h-fit p-6 lg:sticky lg:top-24">
        <h2 className="text-[1.1rem] font-semibold">Your order</h2>
        {!ready ? (
          <p className="mt-4 text-[0.92rem] text-muted">Loading…</p>
        ) : lines.length === 0 ? (
          <p className="mt-4 text-[0.92rem] text-muted">
            Your cart is empty.{" "}
            <Link
              href="/courses"
              className="font-semibold text-gold-600 hover:text-gold"
            >
              Browse courses
            </Link>
          </p>
        ) : (
          <>
            <ul className="mt-4 space-y-3">
              {lines.map((l) => (
                <li key={l.slug} className="flex justify-between gap-3 text-[0.93rem]">
                  <span className="text-ink">{l.title}</span>
                  <span className="shrink-0 font-medium">
                    {formatPrice(l.price, l.currency)}
                  </span>
                </li>
              ))}
            </ul>
            <div className="mt-5 flex justify-between border-t border-line pt-4 text-[1.1rem] font-semibold">
              <span>Total</span>
              <span>{formatPrice(total, lines[0]?.currency ?? "ZMW")}</span>
            </div>
            <p className="mt-4 text-[0.8rem] leading-relaxed text-muted">
              One course is usually enough. If you are taking two, message us
              about a bundle price before you pay.
            </p>
          </>
        )}
      </aside>
    </div>
  );
}
