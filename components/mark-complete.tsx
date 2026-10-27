"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function MarkComplete({
  lessonId,
  courseSlug,
  alreadyDone,
}: {
  lessonId: number;
  courseSlug: string;
  alreadyDone: boolean;
}) {
  const router = useRouter();
  const [done, setDone] = useState(alreadyDone);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function mark() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/progress", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ lessonId, completed: true }),
      });
      const body = await res.json().catch(() => null);
      if (!res.ok) {
        setError(body?.error ?? "Could not save your progress.");
        setBusy(false);
        return;
      }
      setDone(true);
      setBusy(false);
      router.refresh();
    } catch {
      setError("Could not save your progress.");
      setBusy(false);
    }
  }

  if (done) {
    return (
      <span className="inline-flex items-center gap-2 rounded-lg bg-emerald-50 px-4 py-2.5 text-[0.92rem] font-medium text-emerald-700">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M20 6L9 17l-5-5" />
        </svg>
        Lesson complete
      </span>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      <button
        type="button"
        onClick={mark}
        disabled={busy}
        className="btn btn-navy !py-2.5 !px-5 !text-[0.92rem] disabled:opacity-60"
      >
        {busy ? "Saving…" : "Mark as complete"}
      </button>
      {error && <span className="text-[0.82rem] text-red-600">{error}</span>}
    </div>
  );
}
