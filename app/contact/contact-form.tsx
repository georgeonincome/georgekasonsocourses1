"use client";

import { useState, type FormEvent } from "react";

type Status = "idle" | "sending" | "sent" | "error";

export function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string>("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data: Record<string, string> = {};
    new FormData(form).forEach((value, key) => {
      data[key] = String(value);
    });

    setStatus("sending");
    setError("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(
          body?.error ?? "Something went wrong. Please try again.",
        );
      }

      form.reset();
      setStatus("sent");
    } catch (err) {
      setStatus("error");
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again.",
      );
    }
  }

  if (status === "sent") {
    return (
      <div
        role="status"
        className="rounded-xl border border-gold/40 bg-gold-100 p-5 text-[0.95rem] leading-relaxed text-ink"
      >
        <p className="font-semibold">Message sent. Thank you.</p>
        <p className="mt-1.5 text-muted">
          I usually reply within one working day. If it is urgent, message me
          on WhatsApp instead.
        </p>
        <button
          type="button"
          onClick={() => setStatus("idle")}
          className="mt-4 text-[0.88rem] font-semibold text-gold-600 hover:text-gold"
        >
          Send another message →
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label
          htmlFor="contact-name"
          className="mb-1.5 block text-[0.85rem] font-medium text-ink"
        >
          Full name
        </label>
        <input
          id="contact-name"
          name="name"
          type="text"
          required
          autoComplete="name"
          placeholder="Your name"
          className="w-full rounded-[10px] border border-line bg-white px-4 py-3 text-[0.95rem] outline-none transition-colors placeholder:text-gray focus:border-gold"
        />
      </div>

      <div>
        <label
          htmlFor="contact-email"
          className="mb-1.5 block text-[0.85rem] font-medium text-ink"
        >
          Email address
        </label>
        <input
          id="contact-email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="you@example.com"
          className="w-full rounded-[10px] border border-line bg-white px-4 py-3 text-[0.95rem] outline-none transition-colors placeholder:text-gray focus:border-gold"
        />
      </div>

      <div>
        <label
          htmlFor="contact-message"
          className="mb-1.5 block text-[0.85rem] font-medium text-ink"
        >
          Message
        </label>
        <textarea
          id="contact-message"
          name="message"
          rows={5}
          required
          placeholder="What can I help you with?"
          className="w-full resize-y rounded-[10px] border border-line bg-white px-4 py-3 text-[0.95rem] outline-none transition-colors placeholder:text-gray focus:border-gold"
        />
      </div>

      {status === "error" && error && (
        <p role="alert" className="text-[0.88rem] font-medium text-red-600">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={status === "sending"}
        className="btn btn-navy w-full disabled:cursor-not-allowed disabled:opacity-60"
      >
        {status === "sending" ? "Sending…" : "Send message →"}
      </button>

      <p className="text-[0.8rem] leading-relaxed text-muted">
        We use your details only to reply to this message. See the{" "}
        <a href="/privacy" className="font-semibold text-gold-600 hover:text-gold">
          privacy policy
        </a>
        .
      </p>
    </form>
  );
}
