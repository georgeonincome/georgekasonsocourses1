"use client";

import { useState } from "react";

type Props = {
  courseOptions: { slug: string; title: string }[];
};

export function ReviewSubmitForm({ courseOptions }: Props) {
  const [authorName, setAuthorName] = useState("");
  const [authorRole, setAuthorRole] = useState("");
  const [courseSlug, setCourseSlug] = useState("");
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setState("sending");
    setMessage(null);

    const res = await fetch("/api/reviews/submit", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ authorName, authorRole, courseSlug, rating, title, content }),
    });
    const body = await res.json().catch(() => null);

    if (!res.ok) {
      setState("error");
      setMessage(body?.error ?? "Could not send that. Please try again.");
      return;
    }

    setState("sent");
  }

  if (state === "sent") {
    return (
      <div className="rounded-2xl border border-line bg-surface p-7">
        <h3 className="text-[1.15rem] font-semibold">Thank you — it is with George</h3>
        <p className="mt-2.5 text-[0.95rem] leading-relaxed text-muted">
          Your review has been sent. It appears on the site only after George
          has read it and approved it, so nothing goes up unreviewed.
        </p>
        <button
          type="button"
          onClick={() => {
            setState("idle");
            setAuthorName("");
            setAuthorRole("");
            setTitle("");
            setContent("");
          }}
          className="btn btn-ghost mt-5 !py-2.5 !px-5 !text-[0.9rem]"
        >
          Send another
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="rounded-2xl border border-line bg-surface p-7">
      <h3 className="text-[1.15rem] font-semibold">Share what changed for you</h3>
      <p className="mt-2 text-[0.93rem] leading-relaxed text-muted">
        Two or three sentences is plenty. What did you take, and what is
        different now? Your first name is enough.
      </p>

      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        <label className="block">
          <span className="text-[0.88rem] font-medium">Your name</span>
          <input
            required
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            className="mt-1.5 w-full rounded-lg border border-line bg-white px-4 py-2.5 text-[0.93rem] outline-none focus:border-gold"
            placeholder="First name"
          />
        </label>

        <label className="block">
          <span className="text-[0.88rem] font-medium">
            Role or town{" "}
            <span className="font-normal text-muted">(optional)</span>
          </span>
          <input
            value={authorRole}
            onChange={(e) => setAuthorRole(e.target.value)}
            className="mt-1.5 w-full rounded-lg border border-line bg-white px-4 py-2.5 text-[0.93rem] outline-none focus:border-gold"
            placeholder="Designer, Lusaka"
          />
        </label>

        <label className="block">
          <span className="text-[0.88rem] font-medium">Which course</span>
          <select
            value={courseSlug}
            onChange={(e) => setCourseSlug(e.target.value)}
            className="mt-1.5 w-full rounded-lg border border-line bg-white px-4 py-2.5 text-[0.93rem] outline-none focus:border-gold"
          >
            <option value="">Not sure / general</option>
            {courseOptions.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.title}
              </option>
            ))}
          </select>
        </label>

        <div>
          <span className="text-[0.88rem] font-medium">Rating</span>
          <div className="mt-1.5 flex gap-1.5">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setRating(n)}
                aria-label={`${n} star${n === 1 ? "" : "s"}`}
                aria-pressed={rating === n}
                className={`text-[1.5rem] leading-none transition-colors ${
                  n <= rating ? "text-gold" : "text-gray"
                }`}
              >
                ★
              </button>
            ))}
          </div>
        </div>
      </div>

      <label className="mt-5 block">
        <span className="text-[0.88rem] font-medium">
          Headline{" "}
          <span className="font-normal text-muted">(optional)</span>
        </span>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mt-1.5 w-full rounded-lg border border-line bg-white px-4 py-2.5 text-[0.93rem] outline-none focus:border-gold"
          placeholder="What did the course give you?"
        />
      </label>

      <label className="mt-5 block">
        <span className="text-[0.88rem] font-medium">Your review</span>
        <textarea
          required
          rows={4}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="mt-1.5 w-full rounded-lg border border-line bg-white px-4 py-2.5 text-[0.93rem] outline-none focus:border-gold"
          placeholder="I took the course and…"
        />
      </label>

      {state === "error" && message && (
        <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-[0.89rem] text-red-700">
          {message}
        </p>
      )}

      <button
        type="submit"
        disabled={state === "sending"}
        className="btn btn-navy mt-6 !py-2.5 !px-6 !text-[0.93rem] disabled:opacity-60"
      >
        {state === "sending" ? "Sending…" : "Send my review"}
      </button>

      <p className="mt-3 text-[0.8rem] leading-relaxed text-muted">
        Reviews are read before they are published. Please do not include
        income claims you cannot show.
      </p>
    </form>
  );
}
