import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: false },
};

const SUGGESTIONS = [
  { href: "/courses", label: "All courses" },
  { href: "/my-courses", label: "My courses" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/reviews", label: "Student reviews" },
  { href: "/support", label: "Support" },
  { href: "/contact", label: "Contact" },
];

/**
 * Rendered for any URL that does not match a route, and for any segment that
 * calls `notFound()`. It sits inside the root layout, so the header and footer
 * stay put — the student is never left on a bare error screen.
 */
export default function NotFound() {
  return (
    <section className="bg-navy text-white">
      <div className="wrap py-20 text-center sm:py-28">
        <p className="eyebrow">Error 404</p>
        <p
          className="h-display mx-auto max-w-3xl text-[clamp(3.5rem,12vw,8rem)] text-gold"
          aria-hidden="true"
        >
          404
        </p>
        <h1 className="h-display mx-auto mt-4 max-w-2xl text-[clamp(1.6rem,4vw,2.6rem)]">
          This page has moved — or it never existed.
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-[1.02rem] leading-relaxed text-white/70">
          The link may be old, or the address may have been typed wrong. Nothing
          is broken on your account, and nothing you paid for has gone anywhere.
        </p>

        <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
          <Link href="/courses" className="btn btn-gold">
            Browse all courses
          </Link>
          <Link href="/" className="btn btn-outline">
            Back to the home page
          </Link>
        </div>

        <div className="mx-auto mt-14 max-w-2xl border-t border-white/10 pt-8">
          <p className="text-[0.82rem] font-medium uppercase tracking-[0.14em] text-white/45">
            Or go straight to
          </p>
          <ul className="mt-5 flex flex-wrap items-center justify-center gap-x-7 gap-y-3">
            {SUGGESTIONS.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="text-[0.95rem] text-white/80 transition-colors hover:text-gold"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <p className="mt-12 text-[0.92rem] text-white/55">
          Still stuck?{" "}
          <a
            href="https://wa.me/260979982819?text=Hi%20George%2C%20I%20hit%20a%20404%20on%20your%20courses%20site."
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-gold underline-offset-4 hover:underline"
          >
            Message me on WhatsApp
          </a>{" "}
          and tell me which link sent you here.
        </p>
      </div>
    </section>
  );
}
