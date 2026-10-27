import Link from "next/link";

import { JsonLd } from "@/components/json-ld";
import { Reveal } from "@/components/reveal";
import { breadcrumbNode, faqNode, pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "FAQ",
  description: "Answers about course pricing in kwacha, how long access lasts, certificates, refunds and the current status of the platform.",
  path: "/faq",
});const FAQS = [
  {
    q: "How much do the courses cost?",
    a: "Prices are in Zambian kwacha (K) and are shown on each course page. The prices listed are indicative until George confirms the final figures, so treat the number you see as a guide until checkout shows a confirmed price. Every course is listed in full on the courses page — there are no hidden bundles or mandatory add-ons.",
    link: { href: "/courses", label: "See the courses" },
  },
  {
    q: "How long does a course take?",
    a: "Each course is split into short modules you can work through in one sitting or in small pieces between other work. The duration listed on a course page is the realistic time it takes to complete the material properly, not just the running time of the videos. Most learners finish a module in an evening.",
  },
  {
    q: "How long do I keep access?",
    a: "Access is lifetime for the courses you enrol in. You pay once, and the course stays in your dashboard — you can return to it whenever you need to refresh a skill or pick up a new resource. If a course is updated, you get the updated version at no extra cost.",
  },
  {
    q: "Do I get a certificate?",
    a: "Courses that carry a certificate of completion issue one when you finish the lessons and the assessment. It is generated from the platform and can be shared as proof of what you completed. Not every course is certificated — where it is, the course page says so.",
  },
  {
    q: "What is the refund policy?",
    a: "If you have watched less than 20% of a course and you ask within 7 days of buying, you get a full refund. After that the course counts as used and is no longer refundable. If a course is genuinely broken or materially different from its description, it will be refunded regardless. Full terms are on the terms page.",
    link: { href: "/terms", label: "Read the refund terms" },
  },
  {
    q: "Is this platform live?",
    a: "Yes. The platform is live and running, and courses are being published progressively as each one is finished. Where a course is still in preparation, it is marked clearly. If you find something listed that is not yet open, tell us through the contact page and you will be told where it is.",
  },
  {
    q: "Which payment methods do you accept?",
    a: "Payment is handled at checkout through mobile money and card options available in Zambia. You see the exact methods available on the checkout screen before you pay. A receipt is emailed to you by the payment provider.",
  },
  {
    q: "Do I need to be good at computers to start?",
    a: "No. These courses start from the beginning and assume no prior technical knowledge. Each one is written for someone who is busy and wants a usable result rather than theory.",
  },
  {
    q: "Can I learn on my phone?",
    a: "Yes. The platform works on a phone, a tablet and a laptop. Lessons are short enough to complete on a phone during a break. For downloading and editing files, a laptop is better but not required.",
  },
  {
    q: "Can I get help if I get stuck?",
    a: "Yes. The support desk handles course and account questions, and it is answered personally from Lusaka. Support hours and the fastest routes are on the support page.",
    link: { href: "/support", label: "Go to support" },
  },
  {
    q: "Will these courses guarantee me income?",
    a: "No, and I will not pretend otherwise. The courses teach practical, tested methods — what you earn depends on your effort, the market you serve and the work you put in. What the courses do is remove the guesswork about where to start and what to actually do.",
  },
  {
    q: "Can I leave a review?",
    a: "Please do. If a course changed something for you, the reviews page explains how to send it in. Reviews are published as they are written, and nothing is rewritten to sound better.",
    link: { href: "/reviews", label: "Read the reviews" },
  },
];

export default function FaqPage() {
  return (
    <>
      {/*
        FAQPage schema is what earns the expandable questions directly in a
        Google result. It must mirror the questions actually on this page —
        these are the same strings, from the same array, so they cannot drift.
      */}
      <JsonLd
        nodes={[
          breadcrumbNode([
            { name: "Home", path: "/" },
            { name: "FAQ", path: "/faq" },
          ]),
          faqNode(FAQS.map((f) => ({ question: f.q, answer: f.a }))),
        ]}
      />
      <section className="section bg-navy pt-20 text-white">
        <div className="wrap">
          <Reveal>
            <span className="eyebrow">FAQ</span>
            <h1 className="h-display max-w-3xl text-[clamp(2rem,4.6vw,3.4rem)]">
              Straight answers, no sales talk.
            </h1>
            <p className="mt-5 max-w-2xl text-[1rem] leading-relaxed text-white/75">
              If the answer you need is not here, ask. The support desk is
              answered by a person.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="section">
        <div className="wrap max-w-3xl">
          <div className="space-y-4">
            {FAQS.map((f, i) => (
              <Reveal key={f.q} delay={Math.min(i, 4) * 60}>
                <details className="card group p-6">
                  <summary className="flex cursor-pointer list-none items-start justify-between gap-4 text-[1.05rem] font-semibold text-ink marker:hidden">
                    {f.q}
                    <span
                      aria-hidden="true"
                      className="mt-0.5 text-[1.2rem] leading-none text-gold-600 transition-transform group-open:rotate-45"
                    >
                      +
                    </span>
                  </summary>
                  <div className="mt-3 text-[0.95rem] leading-relaxed text-muted">
                    <p>{f.a}</p>
                    {f.link && (
                      <Link
                        href={f.link.href}
                        className="mt-3 inline-block font-semibold text-gold-600 hover:text-gold"
                      >
                        {f.link.label} →
                      </Link>
                    )}
                  </div>
                </details>
              </Reveal>
            ))}
          </div>

          <Reveal delay={100}>
            <div className="mt-12 rounded-2xl border border-line bg-surface p-7 text-center">
              <h2 className="text-[1.2rem] font-semibold text-ink">
                Still not sure?
              </h2>
              <p className="mx-auto mt-2 max-w-lg text-[0.95rem] text-muted">
                Ask a question directly and you will get a straight answer, even
                if the answer is “not a good fit yet”.
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <Link href="/contact" className="btn btn-navy">
                  Ask a question
                </Link>
                <Link href="/courses" className="btn btn-ghost">
                  Browse courses
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
