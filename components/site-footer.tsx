import Link from "next/link";

type FooterLink = { href: string; label: string; external?: boolean };
type FooterColumn = { icon: string; title: string; links: FooterLink[] };

const COLUMNS: FooterColumn[] = [
  {
    icon: "🔗",
    title: "Quick Links",
    links: [
      { href: "/subscribe", label: "Membership" },
      { href: "/cohorts", label: "Live Classes" },
      { href: "/courses", label: "All Courses" },
      { href: "/my-courses", label: "My Courses" },
      { href: "/dashboard", label: "Dashboard" },
      { href: "/register", label: "Student Registration" },
      { href: "/login", label: "Login" },
    ],
  },
  {
    icon: "📚",
    title: "Explore Courses",
    links: [
      { href: "/courses?category=ai", label: "AI & Automation" },
      { href: "/courses?category=freelancing", label: "Freelancing & Clients" },
      { href: "/courses?category=marketing", label: "Digital Marketing & Ads" },
      { href: "/courses?category=design", label: "Graphic Design & Canva" },
      { href: "/courses?category=web-design", label: "Web Design & WordPress" },
    ],
  },
  {
    icon: "👨‍🏫",
    title: "About This Platform",
    links: [
      { href: "/about", label: "About George" },
      { href: "/reviews", label: "Student Reviews" },
      { href: "/faq", label: "FAQ" },
      { href: "/contact", label: "Contact" },
      { href: "/support", label: "Support" },
    ],
  },
  {
    icon: "🔗",
    title: "Follow George",
    links: [
      { href: "https://www.facebook.com/georgeonincome", label: "Facebook", external: true },
      { href: "https://www.linkedin.com/in/george-kasonso-4a81312a3", label: "LinkedIn", external: true },
      { href: "https://www.youtube.com/@georgeonincome-m3m", label: "YouTube", external: true },
      { href: "https://www.tiktok.com/@georgeonincome", label: "TikTok", external: true },
      { href: "https://www.instagram.com/georgeonincome1", label: "Instagram", external: true },
      { href: "https://x.com/georgeonincome", label: "X", external: true },
      { href: "https://t.me/georgeonincome", label: "Telegram", external: true },
      { href: "https://github.com/georgeonincome", label: "GitHub", external: true },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="bg-navy text-white/80">
      <div className="wrap grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        {COLUMNS.map((col) => (
          <div key={col.title}>
            <h3 className="mb-5 flex items-center gap-2 text-[1.05rem] font-semibold text-gold">
              <span aria-hidden="true">{col.icon}</span>
              {col.title}
            </h3>
            <ul className="space-y-2.5">
              {col.links.map((l) => (
                <li key={l.href}>
                  {l.external ? (
                    <a
                      href={l.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[0.93rem] transition-colors hover:text-gold"
                    >
                      {l.label}
                    </a>
                  ) : (
                    <Link
                      href={l.href}
                      className="text-[0.93rem] transition-colors hover:text-gold"
                    >
                      {l.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-white/10">
        <div className="wrap flex flex-col items-start justify-between gap-3 py-6 text-[0.85rem] text-white/55 sm:flex-row sm:items-center">
          <p>
            © {new Date().getFullYear()} George J. Kasonso — The $100 Guy. Built in Lusaka, Zambia.
          </p>
          <div className="flex flex-wrap gap-5">
            <Link href="/privacy" className="hover:text-gold">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-gold">
              Terms &amp; Conditions
            </Link>
            <Link href="/contact" className="hover:text-gold">
              Contact
            </Link>
            <a
              href="https://georgekasonso.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-gold"
            >
              Main Site
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
