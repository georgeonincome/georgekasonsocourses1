import Link from "next/link";

import { Reveal } from "@/components/reveal";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "About George J. Kasonso",
  description: "George J. Kasonso — The $100 Guy — digital entrepreneur and educator in Lusaka, Zambia, teaching practical digital skills so everyday people can earn their first $100 online.",
  path: "/about",
});const BRANDS = [
  {
    name: "The $100 Guy",
    what: "Skill monetisation and positioning coaching — turning skills you already have into income.",
    href: "https://learn2earn.vercel.app",
  },
  {
    name: "Creative INK Academy",
    what: "Free-to-learn AI and tech education for people who are not “computer people”.",
    href: "https://www.youtube.com/channel/UCODI7BNcFio2Pfq6L3uHVCw",
  },
  {
    name: "Enterprise College",
    what: "An ICT and digital-skills institution in Makeni East, Lusaka — training for competence, not theory.",
    href: "https://enterprise-college.vercel.app",
  },
];

const PROOF = [
  {
    value: "~6,000",
    label: "Learners taught in person at Enterprise College",
  },
  {
    value: "5+",
    label: "Years of classroom teaching in Lusaka",
  },
  {
    value: "54",
    label: "Ebooks published under The $100 Guy",
  },
  {
    value: "2,800+",
    label: "Learners reached through online courses",
  },
];

export default function AboutPage() {
  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-navy py-20 text-white">
        <div className="wrap">
          <Reveal>
            <span className="eyebrow">About</span>
            <h1 className="h-display max-w-3xl text-[clamp(2rem,4.6vw,3.4rem)]">
              George J. Kasonso
            </h1>
            <p className="mt-4 text-[1.05rem] font-medium text-gold">
              The $100 Guy · Digital Entrepreneur · Educator · Speaker
            </p>
            <p className="mt-6 max-w-2xl text-[1.02rem] leading-relaxed text-white/75">
              Money is not scarce. Money lives in people. I teach the practical
              digital skills that turn ordinary talent — writing, design, data,
              marketing, AI tools — into a first online income, starting from
              Lusaka, Zambia.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/courses" className="btn btn-gold">
                Browse the courses →
              </Link>
              <Link href="/contact" className="btn btn-outline">
                Get in touch
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Who he is ────────────────────────────────────────────────── */}
      <section className="section">
        <div className="wrap grid gap-12 lg:grid-cols-[1.15fr_1fr] lg:items-start">
          <Reveal>
            <span className="eyebrow">Who he is</span>
            <h2 className="h-display text-[clamp(1.6rem,3vw,2.3rem)]">
              A teacher first, and a business owner second
            </h2>
            <div className="prose-body mt-5 max-w-2xl text-[0.98rem] leading-relaxed text-muted">
              <p>
                I run Enterprise College, an ICT and digital-skills institution
                in Makeni East, Lusaka, where I have taught thousands of
                students in person for more than five years. Alongside that I
                build and run several businesses in Zambia, which means every
                lesson here has been tested against a real shop, a real client
                and a real invoice.
              </p>
              <p>
                I am not a get-rich-quick voice and I am not here for motivation
                alone. If you have never sold anything online, we start with
                one small thing you can finish this week — a logo, a budget
                sheet, a first post, a first proposal — and build from there.
              </p>
            </div>
          </Reveal>

          <Reveal delay={80}>
            <div className="card p-6">
              <h3 className="text-[1.05rem] font-semibold">Track record</h3>
              <p className="mt-2 text-[0.9rem] leading-relaxed text-muted">
                Numbers below come from my own teaching record. For what
                students themselves say, see the reviews wall.
              </p>
              <dl className="mt-5 grid grid-cols-2 gap-4">
                {PROOF.map((p) => (
                  <div key={p.label} className="stat-card !border-line !bg-surface">
                    <dt className="text-[1.55rem] font-semibold text-ink">
                      {p.value}
                    </dt>
                    <dd className="mt-1 text-[0.8rem] leading-snug text-muted">
                      {p.label}
                    </dd>
                  </div>
                ))}
              </dl>
              <Link
                href="/reviews"
                className="mt-5 inline-flex text-[0.9rem] font-semibold text-gold-600 hover:text-gold"
              >
                Read what learners say →
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Why this platform ────────────────────────────────────────── */}
      <section className="section bg-surface">
        <div className="wrap">
          <Reveal>
            <span className="eyebrow">Why this platform</span>
            <h2 className="h-display max-w-2xl text-[clamp(1.6rem,3vw,2.3rem)]">
              Because a laptop and internet should be enough to start
            </h2>
            <div className="prose-body mt-5 max-w-3xl text-[0.98rem] leading-relaxed text-muted">
              <p>
                Most people in Zambia have the tools and the connectivity. What
                they lack is a short, honest path from “I know the basics” to
                “I have earned something with this”. YouTube gives you
                everything and no order. A physical classroom gives you order
                and no access once you leave.
              </p>
              <p>
                This platform is the classroom, kept open. Each course is
                structured, priced in kwacha, and available the moment you
                enrol. Learn this week, apply it to your work the same week.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── What students get ────────────────────────────────────────── */}
      <section className="section">
        <div className="wrap">
          <Reveal>
            <span className="eyebrow">What you get</span>
            <h2 className="h-display text-[clamp(1.6rem,3vw,2.3rem)]">
              Every course comes with the same essentials
            </h2>
          </Reveal>

          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                t: "Structured video lessons",
                d: "Short modules in a fixed order, so you always know the next step.",
              },
              {
                t: "Downloadable resources",
                d: "Templates, checklists and files you can apply to your own work.",
              },
              {
                t: "Lifetime access",
                d: "Enrol once and return to the material whenever you need it again.",
              },
              {
                t: "Support",
                d: "Ask a question and get help from the support desk — see the support page.",
              },
            ].map((c, i) => (
              <Reveal key={c.t} delay={i * 70}>
                <div className="card h-full p-6">
                  <h3 className="text-[1.02rem] font-semibold">{c.t}</h3>
                  <p className="mt-2 text-[0.9rem] leading-relaxed text-muted">
                    {c.d}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Brands ───────────────────────────────────────────────────── */}
      <section className="section bg-navy text-white">
        <div className="wrap">
          <Reveal>
            <span className="eyebrow">His brands</span>
            <h2 className="h-display text-[clamp(1.6rem,3vw,2.3rem)]">
              Where else to find me
            </h2>
          </Reveal>

          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {BRANDS.map((b, i) => (
              <Reveal key={b.name} delay={i * 70}>
                <div className="stat-card h-full !border-white/15 !bg-white/5">
                  <h3 className="text-[1.05rem] font-semibold text-gold">
                    {b.name}
                  </h3>
                  <p className="mt-2 text-[0.9rem] leading-relaxed text-white/70">
                    {b.what}
                  </p>
                  <a
                    href={b.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-block text-[0.85rem] font-semibold text-gold hover:underline"
                  >
                    Visit →
                  </a>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal delay={120}>
            <div className="mt-12 rounded-2xl border border-white/12 bg-white/[0.04] p-7 text-center">
              <h3 className="text-[1.25rem] font-semibold">
                Ready to start with one skill?
              </h3>
              <p className="mx-auto mt-2 max-w-xl text-[0.95rem] text-white/70">
                Pick a course, enrol in kwacha, and finish the first lesson
                today.
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <Link href="/courses" className="btn btn-gold">
                  Explore courses
                </Link>
                <Link href="/faq" className="btn btn-outline">
                  Read the FAQ
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
