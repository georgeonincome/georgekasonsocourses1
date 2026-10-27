import Link from "next/link";

import { Reveal } from "@/components/reveal";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "Support",
  description: "Get help with a course, an order or your account. Contact forms, WhatsApp and support hours for The $100 Guy courses platform.",
  path: "/support",
});const STEPS = [
  {
    n: "01",
    t: "Check the FAQ",
    d: "Pricing, access, certificates and refunds are covered there, and it is the fastest fix for most questions.",
    href: "/faq",
    linkLabel: "Open the FAQ",
  },
  {
    n: "02",
    t: "Open a support ticket",
    d: "Use the form below. Include your registered email and the course name so I can find your order quickly.",
    href: "/contact",
    linkLabel: "Contact form",
  },
  {
    n: "03",
    t: "Message on WhatsApp",
    d: "Fastest for anything urgent, especially payment issues you can see in your mobile money statement.",
    href: "https://wa.me/260979982819",
    linkLabel: "WhatsApp",
    external: true,
  },
];

export default function SupportPage() {
  return (
    <>
      <section className="section bg-navy pt-20 text-white">
        <div className="wrap">
          <Reveal>
            <span className="eyebrow">Support</span>
            <h1 className="h-display max-w-3xl text-[clamp(2rem,4.6vw,3.4rem)]">
              Help when you need it.
            </h1>
            <p className="mt-5 max-w-2xl text-[1rem] leading-relaxed text-white/75">
              Support is handled personally — there is no ticket robot and no
              chatbot. Pick the route that matches your question and you will
              get a real reply from Lusaka.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <div className="grid gap-6 md:grid-cols-3">
            {STEPS.map((s, i) => (
              <Reveal key={s.n} delay={i * 70}>
                <div className="card flex h-full flex-col p-6">
                  <span className="text-[0.8rem] font-semibold tracking-[0.14em] text-gold-600">
                    {s.n}
                  </span>
                  <h2 className="mt-3 text-[1.1rem] font-semibold text-ink">
                    {s.t}
                  </h2>
                  <p className="mt-2 flex-1 text-[0.92rem] leading-relaxed text-muted">
                    {s.d}
                  </p>
                  <a
                    href={s.href}
                    target={s.external ? "_blank" : undefined}
                    rel={s.external ? "noopener noreferrer" : undefined}
                    className="mt-4 inline-block text-[0.88rem] font-semibold text-gold-600 hover:text-gold"
                  >
                    {s.linkLabel} →
                  </a>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal delay={120}>
            <div className="mt-12 grid gap-5 md:grid-cols-2">
              <div className="card p-6">
                <h2 className="text-[1.1rem] font-semibold text-ink">
                  Support hours
                </h2>
                <ul className="mt-3 space-y-1.5 text-[0.93rem] text-muted">
                  <li>Monday to Friday — 18:00 to 21:00 (GMT+2)</li>
                  <li>Saturday — 09:00 to 12:00</li>
                  <li>Sunday — closed</li>
                </ul>
                <p className="mt-3 text-[0.88rem] leading-relaxed text-muted">
                  Messages sent outside these hours are answered the next
                  working day.
                </p>
              </div>

              <div className="card p-6">
                <h2 className="text-[1.1rem] font-semibold text-ink">
                  Before you write, have these ready
                </h2>
                <ul className="mt-3 space-y-1.5 text-[0.93rem] text-muted">
                  <li>The email address you registered with</li>
                  <li>The course title you bought</li>
                  <li>
                    Your mobile money or card reference, if it is a payment
                    issue
                  </li>
                </ul>
                <p className="mt-3 text-[0.88rem] leading-relaxed text-muted">
                  For refunds, our{" "}
                  <Link
                    href="/terms"
                    className="font-semibold text-gold-600 hover:text-gold"
                  >
                    refund terms
                  </Link>{" "}
                  apply.
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
