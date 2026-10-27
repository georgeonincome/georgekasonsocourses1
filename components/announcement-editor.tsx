"use client";

import { useState } from "react";

type AnnouncementBar = {
  enabled: boolean;
  text: string;
  href: string;
  cta: string;
};

/**
 * Edit the announcement bar above the header. Posts the whole JSON value to
 * /api/admin/announcement, which writes it into platform_settings — the same
 * one line the benchmark puts in a Supabase settings table.
 */
export function AnnouncementEditor({ initial }: { initial: AnnouncementBar }) {
  const [state, setState] = useState<"idle" | "saving" | "saved" | "error">(
    "idle",
  );
  const [value, setValue] = useState<AnnouncementBar>(initial);
  const [message, setMessage] = useState<string | null>(null);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setState("saving");
    setMessage(null);
    try {
      const res = await fetch("/api/admin/announcement", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(value),
      });
      const body = await res.json().catch(() => null);
      if (!res.ok) {
        setState("error");
        setMessage(body?.error ?? "Could not save. Please try again.");
        return;
      }
      setState("saved");
    } catch {
      setState("error");
      setMessage("Network problem — nothing was saved.");
    }
  }

  const label = "text-[0.85rem] font-medium";
  const input =
    "mt-1.5 w-full rounded-lg border border-line bg-white px-3.5 py-2.5 text-[0.92rem] outline-none focus:border-gold";

  return (
    <form onSubmit={save} className="mt-5 max-w-xl">
      {state === "error" && message && (
        <p className="mb-3 rounded-lg bg-red-50 px-3.5 py-2.5 text-[0.85rem] text-red-700">
          {message}
        </p>
      )}
      {state === "saved" && (
        <p className="mb-3 rounded-lg bg-emerald-50 px-3.5 py-2.5 text-[0.85rem] text-emerald-700">
          Saved. It is live on every page now.
        </p>
      )}

      <label className="flex items-center gap-3">
        <input
          type="checkbox"
          checked={value.enabled}
          onChange={(e) => {
            setValue({ ...value, enabled: e.target.checked });
            setState("idle");
          }}
          className="h-4 w-4 accent-[var(--color-gold,#F1911D)]"
        />
        <span className={label}>Show the announcement bar</span>
      </label>

      <label className="mt-4 block">
        <span className={label}>Text</span>
        <input
          disabled={!value.enabled}
          required={value.enabled}
          value={value.text}
          onChange={(e) => {
            setValue({ ...value, text: e.target.value });
            setState("idle");
          }}
          className={input}
          placeholder="New cohort: … enrolment open"
          maxLength={160}
        />
      </label>
      <div className="mt-3 grid gap-4 sm:grid-cols-[160px_1fr]">
        <label className="block">
          <span className={label}>Link to</span>
          <input
            value={value.href}
            onChange={(e) => {
              setValue({ ...value, href: e.target.value });
              setState("idle");
            }}
            className={input}
            placeholder="/cohorts"
          />
        </label>
        <label className="block">
          <span className={label}>Button text</span>
          <input
            value={value.cta}
            onChange={(e) => {
              setValue({ ...value, cta: e.target.value });
              setState("idle");
            }}
            className={input}
            placeholder="Reserve your seat →"
          />
        </label>
      </div>

      <button
        type="submit"
        disabled={state === "saving"}
        className="btn btn-gold mt-5 !py-2.5 !px-6 !text-[0.92rem] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {state === "saving" ? "Saving…" : "Save announcement"}
      </button>
    </form>
  );
}
