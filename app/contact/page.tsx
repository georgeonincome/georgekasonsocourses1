import Link from "next/link";

import { Reveal } from "@/components/reveal";
import { ContactForm } from "./contact-form";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "Contact George J. Kasonso",
  description: "Get in touch with George J. Kasonso, The $100 Guy, in Lusaka, Zambia. Reach out on WhatsApp, by email, or through the support desk.",
  path: "/contact",
});const CARDS = [
  {
    icon: "💬",
    title: "WhatsApp",
    body: "0979982819",
    note: "Fastest reply. Weekday evenings.",
    href: "https://wa.me/260979982819",
    external: true,
  },
  {
    icon: "✉️",
    title: "Email",
    body: "kasonso44@gmail.com",
    note: "Best for detailed questions.",
    href: "mailto:kasonso44@gmail.com",
    external: true,
  },
  {
    icon: "📍",
    title: "Location",
    body: "Lusaka, Zambia",
    note: "Chipwenupwenu Road, Makeni East — behind Cosmopolitan Mall.",
    href: null,
    external: false,
  },
];

export default function ContactPage() {
  return (
    <>
      {/* ── Hero + form ──────────────────────────────────────────────── */}
      <section className="section bg-navy text-white">
        <div className="wrap grid gap-12 lg:grid-cols-[1fr_1.25fr] lg:items-start">
          <Reveal>
            <span className="eyebrow">Contact</span>
            <h1 className="h-display text-[clamp(2rem,4.6vw,3.4rem)]">
              I read every message.
            </h1>
            <p className="mt-5 max-w-md text-[1rem] leading-relaxed text-white/75">
              The quickest way to reach me here in Lusaka is WhatsApp. If your
              question is about an order, a course, or your account, head to the
              support desk first — it is the same team, but the answers are
              already there.
            </p>
            <Link
              href="/support"
              className="mt-7 inline-flex items-center gap-2 text-[0.95rem] font-semibold text-gold hover:underline"
            >
              Visit the support page →
            </Link>
          </Reveal>

          <Reveal delay={80}>
            <div className="card p-6 sm:p-7">
              <h2 className="text-[1.2rem] font-semibold text-ink">
                Send a message
              </h2>
              <p className="mt-1.5 text-[0.88rem] text-muted">
                Fill this in and it lands straight in my inbox.
              </p>
              <div className="mt-5">
                <ContactForm />
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Contact cards ────────────────────────────────────────────── */}
      <section className="section">
        <div className="wrap">
          <Reveal>
            <span className="eyebrow">Direct</span>
            <h2 className="h-display text-[clamp(1.6rem,3vw,2.3rem)]">
              Reach me directly
            </h2>
          </Reveal>

          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {CARDS.map((c, i) => (
              <Reveal key={c.title} delay={i * 70}>
                <div className="card flex h-full flex-col p-6">
                  <span aria-hidden="true" className="text-[1.5rem]">
                    {c.icon}
                  </span>
                  <h3 className="mt-3 text-[1.05rem] font-semibold text-ink">
                    {c.title}
                  </h3>
                  <p className="mt-1 text-[0.95rem] font-medium text-ink">
                    {c.body}
                  </p>
                  <p className="mt-1.5 text-[0.85rem] leading-relaxed text-muted">
                    {c.note}
                  </p>
                  {c.href && (
                    <a
                      href={c.href}
                      target={c.external ? "_blank" : undefined}
                      rel={c.external ? "noopener noreferrer" : undefined}
                      className="mt-4 inline-block text-[0.88rem] font-semibold text-gold-600 hover:text-gold"
                    >
                      {c.external ? "Open →" : "Details →"}
                    </a>
                  )}
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal delay={120}>
            <div className="mt-12 rounded-2xl border border-line bg-surface p-7">
              <h3 className="text-[1.15rem] font-semibold text-ink">
                Before you write
              </h3>
              <ul className="mt-3 space-y-2 text-[0.93rem] leading-relaxed text-muted">
                <li>
                  <strong className="text-ink">Course questions</strong> — the{" "}
                  <Link href="/faq" className="font-semibold text-gold-600 hover:text-gold">
                    FAQ
                  </Link>{" "}
                  covers pricing, access, certificates and refunds.
                </li>
                <li>
                  <strong className="text-ink">Account trouble</strong> — try the{" "}
                  <Link href="/support" className="font-semibold text-gold-600 hover:text-gold">
                    support desk
                  </Link>
                  .
                </li>
                <li>
                  <strong className="text-ink">Want to share your story</strong> —
                  the{" "}
                  <Link href="/reviews" className="font-semibold text-gold-600 hover:text-gold">
                    reviews page
                  </Link>{" "}
                  tells you exactly how.
                </li>
              </ul>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
