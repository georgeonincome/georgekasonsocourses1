import Link from "next/link";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { fetchAnnouncement } from "@/lib/settings";

const NAV = [
  { href: "/courses", label: "Courses" },
  { href: "/subscribe", label: "Membership" },
  { href: "/cohorts", label: "Live classes" },
  { href: "/reviews", label: "Reviews" },
  { href: "/dashboard", label: "Dashboard" },
];

export async function SiteHeader() {
  const session = await auth();
  const h = await headers();
  const path = h.get("x-pathname") ?? "";
  const announcement = await fetchAnnouncement();

  return (
    <>
      {announcement.enabled && announcement.text ? (
        <div className="bg-ink text-white">
          <div className="wrap flex items-center justify-center gap-2 py-2 text-center text-[0.82rem] font-medium sm:text-[0.87rem]">
            <Link href={announcement.href} className="group inline-flex min-w-0 items-center gap-2">
              <span className="truncate">{announcement.text}</span>
              <span className="whitespace-nowrap text-gold group-hover:underline">
                {announcement.cta}
              </span>
            </Link>
          </div>
        </div>
      ) : null}
      <header className="sticky top-0 z-50 bg-navy text-white shadow-[0_2px_20px_rgba(0,0,0,0.25)]">
      <div className="wrap flex h-[72px] items-center justify-between gap-6">
        <Link href="/" className="flex shrink-0 items-center gap-3">
          <span className="brand-mark" aria-hidden="true">
            G
          </span>
          <span className="brand-script text-[26px] leading-none text-gold">
            George J. Kasonso
          </span>
        </Link>

        <nav className="hidden items-center gap-8 lg:flex">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`text-[0.95rem] font-medium transition-colors hover:text-gold ${
                path === item.href ? "text-gold" : "text-white/90"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/subscribe"
            className="btn btn-gold hidden !py-[11px] !px-5 text-[0.92rem] sm:inline-flex"
          >
            Get my membership
          </Link>

          <details className="relative lg:hidden">
            <summary className="btn btn-ghost !border-white/30 !px-3 !py-2 !text-white">
              <span className="sr-only">Menu</span>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 6h18M3 12h18M3 18h18" />
              </svg>
            </summary>
            <nav className="absolute right-0 top-full mt-2 w-56 overflow-hidden rounded-xl border border-line bg-white py-2 text-ink shadow-lift">
              {NAV.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="block px-5 py-3 text-[0.95rem] font-medium hover:bg-surface"
                >
                  {item.label}
                </Link>
              ))}
              <Link
                href={session?.user ? "/dashboard" : "/subscribe"}
                className="block bg-gold px-5 py-3 text-[0.95rem] font-semibold"
              >
                {session?.user ? "My Dashboard" : "Get my membership"}
              </Link>
            </nav>
          </details>
        </div>
      </div>
    </header>
    </>
  );
}
