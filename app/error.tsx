"use client";

// Error boundaries must be Client Components. This one sits at the app root, so
// it catches anything thrown while rendering a page or a nested layout — but
// not the root layout itself, which is what global-error.tsx is for.
import { useEffect } from "react";
import Link from "next/link";

type ErrorProps = {
  error: unknown;
  retry: () => void;
};

/**
 * The digest is the only part of the error that is safe and useful to show.
 * In production a server component throws a generic message precisely so
 * internals are not leaked to the browser, so the digest is what ties a
 * complaint to the server log.
 */
function digestOf(error: unknown): string {
  if (error && typeof error === "object" && "digest" in error) {
    const value = (error as { digest?: unknown }).digest;
    if (typeof value === "string" && value.length > 0) return value;
  }
  return "";
}

export default function Error({ error, retry }: ErrorProps) {
  const digest = digestOf(error);

  useEffect(() => {
    // Send this to your error reporting service. The console line is the
    // minimum — swap it for Sentry/Bugsnag when one is wired up.
    console.error(error);
  }, [error]);

  return (
    <section className="bg-navy text-white">
      <div className="wrap py-20 sm:py-28">
        <div className="mx-auto max-w-2xl">
          <p className="eyebrow">Something broke</p>
          <h1 className="h-display mt-3 text-[clamp(1.7rem,4.5vw,2.6rem)]">
            That page could not be loaded.
          </h1>
          <p className="mt-5 text-[1.02rem] leading-relaxed text-white/70">
            It is a fault on our side, not yours. Your account, your orders and
            your course progress are untouched — this is only the page that
            failed to render.
          </p>

          <div className="mt-9 flex flex-wrap gap-4">
            <button type="button" onClick={() => retry()} className="btn btn-gold">
              Try again
            </button>
            <Link href="/courses" className="btn btn-outline">
              Go to courses
            </Link>
          </div>

          <div className="mt-10 rounded-xl border border-white/10 bg-white/[0.03] p-5">
            <p className="text-[0.95rem] leading-relaxed text-white/70">
              Trying again fixes most of these. If it keeps happening, send me
              the reference below and I can find the exact failure in the logs.
            </p>
            {digest ? (
              <p className="mt-3">
                <span className="text-[0.82rem] font-medium uppercase tracking-[0.14em] text-white/45">
                  Reference
                </span>
                <br />
                <code className="mt-1 inline-block rounded-md bg-navy-600 px-3 py-1.5 text-[0.85rem] text-gold">
                  {digest}
                </code>
              </p>
            ) : null}
            <a
              href="https://wa.me/260979982819?text=Hi%20George%2C%20your%20courses%20site%20threw%20an%20error."
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-2 text-[0.95rem] font-medium text-gold underline-offset-4 hover:underline"
            >
              Report it on WhatsApp
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
