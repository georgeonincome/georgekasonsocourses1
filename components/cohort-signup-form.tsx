"use client";

import { useState } from "react";
import Link from "next/link";

type State = "idle" | "submitting" | "done" | "error";

/**
 * "Reserve your seat" for a live cohort. Collects the lead, hands it to
 * /api/cohorts/signup, and tells the student the money step — seats are
 * confirmed once George confirms the transfer on WhatsApp.
 */
export function CohortSignupForm({
  cohortSlug,
  priceLabel,
}: {
  cohortSlug: string;
  priceLabel: string;
}) {
  const [state, setState] = useState<State>("idle");
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    setState("submitting");
    setError(null);

    try {
      const res = await fetch("/api/cohorts/signup", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          cohortSlug,
          name: data.get("name"),
          email: data.get("email"),
          phone: data.get("phone"),
          message: data.get("message"),
        }),
      });
      const body = await res.json().catch(() => null);
      if (!res.ok) {
        setState("error");
        setError(body?.error ?? "Something went wrong. Please try again.");
        return;
      }
      setSuccess(body?.message ?? "Seat reserved.");
      setState("done");
    } catch {
      setState("error");
      setError("Network problem. Please try again, or message George on WhatsApp.");
    }
  }

  if (state === "done") {
    return (
      <div>
        <p className="rounded-lg bg-emerald-50 px-4 py-3 text-[0.9rem] leading-relaxed text-emerald-800">
          {success}
        </p>
        <a
          href="https://wa.me/260979982819"
          className="btn btn-gold mt-4 w-full sm:w-auto"
        >
          Confirm on WhatsApp
        </a>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="mt-1">
      {state === "error" && error && (
        <p className="mb-3 rounded-lg bg-red-50 px-3.5 py-2.5 text-[0.85rem] text-red-700">
          {error}
        </p>
      )}

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="text-[0.85rem] font-medium">Full name</span>
          <input
            required
            name="name"
            className="mt-1.5 w-full rounded-lg border border-line bg-white px-3.5 py-2.5 text-[0.92rem] outline-none focus:border-gold"
            placeholder="Your name"
          />
        </label>
        <label className="block">
          <span className="text-[0.85rem] font-medium">Email</span>
          <input
            required
            type="email"
            name="email"
            className="mt-1.5 w-full rounded-lg border border-line bg-white px-3.5 py-2.5 text-[0.92rem] outline-none focus:border-gold"
            placeholder="you@example.com"
          />
        </label>
      </div>
      <label className="mt-3 block">
        <span className="text-[0.85rem] font-medium">
          Mobile money number{" "}
          <span className="font-normal text-muted">(optional)</span>
        </span>
        <input
          name="phone"
          type="tel"
          className="mt-1.5 w-full rounded-lg border border-line bg-white px-3.5 py-2.5 text-[0.92rem] outline-none focus:border-gold"
          placeholder="+260 …"
        />
      </label>

      <button
        type="submit"
        disabled={state === "submitting"}
        className="btn btn-gold mt-5 w-full disabled:cursor-not-allowed disabled:opacity-60"
      >
        {state === "submitting"
          ? "Reserving your seat…"
          : `Reserve my seat — ${priceLabel}`}
      </button>

      <p className="mt-2.5 text-center text-[0.78rem] text-muted">
        No account needed to reserve. Already a member?{" "}
        <Link href="/subscribe" className="font-medium text-gold-600 hover:underline">
          Your membership covers this seat
        </Link>
        .
      </p>
    </form>
  );
}
