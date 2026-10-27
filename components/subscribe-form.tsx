"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

type State = "idle" | "submitting" | "done" | "auth" | "error";

/**
 * The button at the bottom of a membership plan card.
 *
 * Posts the plan to /api/subscribe. A signed-in buyer either goes straight
 * to the hosted gateway (when it is configured) or gets an order reference
 * and the pay-by-mobile-money steps; a guest is shown the sign-in nudge
 * instead of an error.
 */
export function SubscribeForm({
  planCode,
  planName,
  highlight = false,
}: {
  planCode: string;
  planName: string;
  highlight?: boolean;
}) {
  const router = useRouter();
  const [state, setState] = useState<State>("idle");
  const [message, setMessage] = useState<string | null>(null);

  const whatsappHelp = `https://wa.me/260979982819?text=${encodeURIComponent(
    `Hi George, I want the ${planName} membership. Please help me pay.`,
  )}`;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setState("submitting");
    setMessage(null);

    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ planCode }),
      });
      const body = await res.json().catch(() => null);

      if (res.status === 401 && body?.authRequired) {
        setState("auth");
        return;
      }
      if (!res.ok) {
        setState("error");
        setMessage(body?.error ?? "Something went wrong. Please try again.");
        return;
      }
      if (body?.paymentUrl) {
        // Gateway configured — hosted checkout takes the money.
        window.location.assign(body.paymentUrl);
        return;
      }

      // Manual flow: the order is recorded and pending. The status page
      // shows the reference and polls until George marks it paid.
      setState("done");
      router.push(
        `/checkout/paid?tx_ref=${encodeURIComponent(body.reference)}`,
      );
    } catch {
      setState("error");
      setMessage("Network problem. Please try again, or message George on WhatsApp.");
    }
  }

  if (state === "auth") {
    return (
      <div className="mt-1">
        <p className="text-[0.88rem] leading-relaxed text-muted">
          One quick step first — sign in (or create an account) so your
          membership lands on your dashboard.
        </p>
        <div className="mt-3 flex flex-wrap gap-2.5">
          <Link
            href="/register?next=/subscribe"
            className="btn btn-gold w-full sm:w-auto"
          >
            Create an account
          </Link>
          <Link
            href="/login?next=/subscribe"
            className="btn btn-ghost w-full sm:w-auto"
          >
            I already have one
          </Link>
        </div>
        <p className="mt-3 text-[0.82rem] text-muted">
          Prefer to just talk it through?{" "}
          <a className="font-medium text-gold-600 hover:underline" href={whatsappHelp}>
            WhatsApp George
          </a>
        </p>
      </div>
    );
  }

  const completed = state === "done";

  return (
    <form onSubmit={submit} className="mt-1">
      {state === "error" && message && (
        <p className="mb-3 rounded-lg bg-red-50 px-3.5 py-2.5 text-[0.85rem] text-red-700">
          {message}{" "}
          <a className="font-medium underline" href={whatsappHelp}>
            Or message George.
          </a>
        </p>
      )}

      <button
        type="submit"
        disabled={state === "submitting" || completed}
        className={`btn btn-gold w-full disabled:cursor-not-allowed disabled:opacity-60 ${
          highlight ? "shadow-lift" : ""
        }`}
      >
        {state === "submitting"
          ? "Recording your order…"
          : completed
            ? "Order recorded — opening payment steps…"
            : `Choose ${planName}`}
      </button>

      <p className="mt-2.5 text-center text-[0.78rem] text-muted">
        Pay by Airtel Money, MTN MoMo, bank or card. No automatic renewal.
      </p>
    </form>
  );
}
