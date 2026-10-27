import Link from "next/link";
import { asc, desc, eq, sql } from "drizzle-orm";

import { db } from "@/lib/db";
import {
  categories,
  cohorts,
  courseCategories,
  courses,
  subscriptionPlans,
} from "@/db/schema";
import { formatPrice } from "@/lib/format";
import { getPublishedReviews } from "@/lib/reviews";
import { CourseCard } from "@/components/course-card";
import { JsonLd } from "@/components/json-ld";
import { Reveal } from "@/components/reveal";
import { StarRating } from "@/components/star-rating";
import { SITE_NAME, SITE_URL, breadcrumbNode, courseListNode, courseNode, faqNode, pageMeta } from "@/lib/seo";

export const dynamic = "force-dynamic";

/**
 * The catalogue is the product, so the home page carries the question the
 * whole site is answering: which digital skill pays, and how do I start. The
 * title leads with the category and the place, because "digital skills courses
 * Zambia" is the search this business lives or dies on.
 */
export const metadata = pageMeta({
  title: "Digital Skills Courses in Zambia — AI, Marketing, Design & Web Design",
  description: "One membership unlocks every Learn2Earn course — AI and automation, Facebook and Meta ads, copywriting, graphic design, WordPress web design, freelancing and more. Taught by George J. Kasonso in Lusaka, priced in kwacha, paid with mobile money.",
  path: "/",
});
const STEPS = [
  {
    n: "01",
    title: "Join the membership",
    body: "One payment, every published course opens. Not one course, not a sample — the whole library, the day your payment clears.",
  },
  {
    n: "02",
    title: "Pick the skill you want to be paid for",
    body: "Sixteen courses across AI, freelancing, marketing, design and web design. Every one of them ends with you making something, not just watching something.",
  },
  {
    n: "03",
    title: "Use it, and get paid",
    body: "Each course ends with an output you can show a client — a site, a brand kit, a written offer, a first invoice.",
  },
];

const INCLUDED = [
  {
    n: "01",
    title: "All published courses across every track",
    body: "Every course in the catalogue, from computer basics to Meta ads — whoever you were before you arrived.",
  },
  {
    n: "02",
    title: "Templates, checklists and class resources",
    body: "The same files the classes are taught with, plus the templates George uses in his own client work.",
  },
  {
    n: "03",
    title: "A certificate for every course",
    body: "Finish the lessons and the assignment, and a certificate is issued to your account for that course.",
  },
  {
    n: "04",
    title: "New courses at no extra cost",
    body: "Whats added while your access is active is yours too. No upgrade email, no second invoice.",
  },
];

const FEATURES = [
  {
    icon: "🎥",
    title: "Recorded, so you never miss it",
    body: "Every session is recorded and organised into lessons. Come back to the part you did not get, whenever you like.",
  },
  {
    icon: "🧭",
    title: "Built around doing, not watching",
    body: "Each module ends with something to produce. You finish with work in hand, not a folder of unwatched videos.",
  },
  {
    icon: "🤖",
    title: "AI where it genuinely helps",
    body: "ChatGPT, Canva AI, Notion and the rest — taught for the work you are doing, with the prompt patterns included.",
  },
  {
    icon: "🧑🏾‍🏫",
    title: "Taught in plain language",
    body: "No jargon you have to decode alone. If you can use a phone, you can follow every lesson here.",
  },
  {
    icon: "📜",
    title: "Certificate on completion",
    body: "Finish the lessons and the assignment, and a certificate of completion is issued to your account.",
  },
  {
    icon: "🇿🇲",
    title: "Priced for Lusaka, not for a spreadsheet",
    body: "Every course sits between K150 and K700. One good client pays for the whole library.",
  },
];

export default async function HomePage() {
  const allCourses = await db.query.courses.findMany({
    where: eq(courses.isPublished, true),
    orderBy: [asc(courses.createdAt)],
  });

  const categoryRows = await db.query.courseCategories.findMany();
  const categoriesList = await db.query.categories.findMany({
    orderBy: [asc(categories.position)],
  });

  const plans = await db
    .select()
    .from(subscriptionPlans)
    .where(eq(subscriptionPlans.isVisible, true))
    .orderBy(asc(subscriptionPlans.sortOrder));
  const heroPlan = plans.find((p) => p.isRecommended) ?? plans[0];

  const activeCohorts = await db
    .select()
    .from(cohorts)
    .where(eq(cohorts.isPublished, true))
    .orderBy(asc(cohorts.sortOrder))
    .limit(1);

  const nameByCategory = new Map(
    categoriesList.map((c) => [c.id, c.name] as const),
  );
  const categoryByCourse = new Map<number, string>();
  for (const row of categoryRows) {
    const name = nameByCategory.get(row.categoryId);
    if (name && !categoryByCourse.has(row.courseId)) {
      categoryByCourse.set(row.courseId, name);
    }
  }

  const featured = allCourses.filter((c) => c.isFeatured).slice(0, 4);
  const rest = allCourses.filter((c) => !c.isFeatured).slice(0, 4);

  const totalLessons = allCourses.reduce((n, c) => n + c.lessonCount, 0);

  const testimonials = await getPublishedReviews(3);

  // The catalogue list only — each course carries its own full Course node on
  // its own page, and repeating price and rating here would create two places
  // for that data to disagree.
  const courseList = allCourses.map((c) => ({ slug: c.slug, title: c.title }));

  return (
    <>
      <JsonLd
        nodes={[
          breadcrumbNode([{ name: "Home", path: "/" }]),
          courseListNode(courseList),
        ]}
      />
      {/* ── hero ───────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-navy text-white">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 20%, #f1911d 0, transparent 45%)",
          }}
          aria-hidden="true"
        />
        <div className="wrap relative grid gap-12 py-20 lg:grid-cols-[1.1fr_0.9fr] lg:py-28">
          <div>
            <span className="eyebrow">Learn2Earn · by George J. Kasonso</span>
            <h1 className="h-display text-[2.6rem] sm:text-[3.4rem]">
              Learn the digital skills
              <br />
              that are paying right now.
            </h1>
            <p className="mt-6 max-w-xl text-[1.08rem] leading-relaxed text-white/75">
              One membership unlocks every practical course — AI, ads, content,
              design, web and online work. Built with Zambian examples, kwacha
              pricing, and outputs you can show a client.
            </p>
            {heroPlan && (
              <p className="mt-5 text-[1.02rem] text-gold">
                <span className="font-semibold">
                  {formatPrice(heroPlan.price, "ZMW")}
                </span>{" "}
                for 4 months — or{" "}
                <span className="font-semibold">
                  {formatPrice(plans[2]?.price ?? 149700, "ZMW")}
                </span>{" "}
                a year
              </p>
            )}

            <div className="mt-9 flex flex-wrap gap-3">
              <Link href="/subscribe" className="btn btn-gold">
                Get my membership
              </Link>
              <a
                href="https://wa.me/260979982819?text=Hi%20George%2C%20I%20have%20a%20question%20about%20the%20Learn2Earn%20membership"
                className="btn btn-outline"
              >
                WhatsApp George
              </a>
            </div>

            <p className="mt-5 text-[0.86rem] text-white/55">
              Airtel Money · MTN MoMo · card · nothing renews automatically ·
              certificates included
            </p>

            <dl className="mt-12 grid max-w-lg grid-cols-3 gap-6 border-t border-white/10 pt-8">
              {[
                { k: "Courses", v: String(allCourses.length) },
                { k: "Lessons", v: String(totalLessons) },
                { k: "Tracks", v: String(categoriesList.length) },
              ].map((s) => (
                <div key={s.k}>
                  <dt className="text-[0.78rem] uppercase tracking-[0.14em] text-white/50">
                    {s.k}
                  </dt>
                  <dd className="mt-1 text-[1.9rem] font-semibold text-gold">
                    {s.v}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          <Reveal className="lg:pt-6">
            <div className="rounded-2xl border border-white/12 bg-white/[0.04] p-7 backdrop-blur">
              <p className="text-[0.8rem] font-medium uppercase tracking-[0.14em] text-white/45">
                Included in your membership
              </p>
              <h2 className="mt-2 text-[1.5rem] font-semibold">
                Learn to Earn: Your First $100 Online
              </h2>
              <p className="mt-3 text-[0.95rem] leading-relaxed text-white/70">
                You already have a skill. You just do not know how to sell it.
                This is the course that turns what you can already do into
                money in your first week.
              </p>
              <ul className="mt-5 space-y-2.5 text-[0.93rem] text-white/75">
                {[
                  "Money lives in people — find yours",
                  "Position yourself in one hour",
                  "Land your first paying client",
                  "Turn one client into a retainer",
                ].map((li) => (
                  <li key={li} className="flex gap-3">
                    <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />
                    {li}
                  </li>
                ))}
              </ul>
              <Link
                href="/courses/learn-to-earn"
                className="btn btn-gold mt-7 w-full"
              >
                See what is inside
              </Link>
              <p className="mt-3 text-center text-[0.82rem] text-white/50">
                Open from day one of any membership
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── what membership includes ───────────────────────────────────── */}
      <section className="section">
        <div className="wrap">
          <Reveal>
            <span className="eyebrow">01 — What you get</span>
            <h2 className="h-display text-[2rem] sm:text-[2.5rem]">
              Everything opens the day you join.
            </h2>
            <p className="mt-4 max-w-2xl text-[1.02rem] text-muted">
              Not one course. Not a sample. Every published course unlocks when
              your payment clears — including the ones added while your access
              is active.
            </p>
          </Reveal>

          <div className="mt-11 grid gap-4 sm:grid-cols-2">
            {INCLUDED.map((item, i) => (
              <Reveal key={item.n} delay={i * 60}>
                <div className="card flex h-full items-start gap-4 p-6">
                  <span className="text-[1.4rem] font-semibold text-gold-100">
                    {item.n}
                  </span>
                  <div>
                    <h3 className="text-[1.05rem] font-semibold tracking-[-0.01em]">
                      {item.title}
                    </h3>
                    <p className="mt-2 text-[0.92rem] leading-relaxed text-muted">
                      {item.body}
                    </p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>

          <div className="mt-9 text-center">
            <Link href="/subscribe" className="btn btn-gold">
              Get my membership
            </Link>
          </div>
        </div>
      </section>

      {/* ── categories ─────────────────────────────────────────────────── */}
      <section className="section">
        <div className="wrap">
          <Reveal>
            <span className="eyebrow">Pick a track</span>
            <h2 className="h-display text-[2rem] sm:text-[2.5rem]">
              Nine tracks. One is yours.
            </h2>
            <p className="mt-4 max-w-2xl text-[1.02rem] text-muted">
              You do not need to learn all of them. You need one, finished.
            </p>
          </Reveal>

          <div className="mt-11 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {categoriesList.map((cat, i) => {
              const count = categoryRows.filter(
                (r) => r.categoryId === cat.id,
              ).length;
              return (
                <Reveal key={cat.slug} delay={i * 60}>
                  <Link
                    href={`/courses?category=${cat.slug}`}
                    className="card group flex h-full flex-col p-6"
                  >
                    <span className="text-[1.9rem]" aria-hidden="true">
                      {cat.icon}
                    </span>
                    <h3 className="mt-4 text-[1.1rem] font-semibold tracking-[-0.01em]">
                      {cat.name}
                    </h3>
                    <p className="mt-2 text-[0.9rem] text-muted">
                      {count} course{count === 1 ? "" : "s"}
                    </p>
                    <span className="mt-4 text-[0.9rem] font-semibold text-gold-600">
                      Browse {cat.name} →
                    </span>
                  </Link>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── featured courses ───────────────────────────────────────────── */}
      <section className="section bg-surface">
        <div className="wrap">
          <Reveal>
            <span className="eyebrow">Most popular</span>
            <h2 className="h-display text-[2rem] sm:text-[2.5rem]">
              Where most students start
            </h2>
          </Reveal>

          <div className="mt-11 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map((course, i) => (
              <Reveal key={course.id} delay={i * 70}>
                <CourseCard
                  course={course}
                  category={categoryByCourse.get(course.id)}
                />
              </Reveal>
            ))}
          </div>

          <div className="mt-10 text-center">
            <Link href="/courses" className="btn btn-navy">
              See all {allCourses.length} courses
            </Link>
          </div>
        </div>
      </section>

      {/* ── how it works ───────────────────────────────────────────────── */}
      <section className="section">
        <div className="wrap">
          <Reveal>
            <span className="eyebrow">How it works</span>
            <h2 className="h-display text-[2rem] sm:text-[2.5rem]">
              Three steps, no fluff
            </h2>
          </Reveal>

          <div className="mt-11 grid gap-6 md:grid-cols-3">
            {STEPS.map((s, i) => (
              <Reveal key={s.n} delay={i * 90}>
                <div className="card h-full p-7">
                  <span className="text-[2.4rem] font-semibold text-gold-100">
                    {s.n}
                  </span>
                  <h3 className="mt-3 text-[1.15rem] font-semibold tracking-[-0.01em]">
                    {s.title}
                  </h3>
                  <p className="mt-3 text-[0.95rem] leading-relaxed text-muted">
                    {s.body}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── features ───────────────────────────────────────────────────── */}
      <section className="section bg-cream">
        <div className="wrap">
          <Reveal>
            <span className="eyebrow">Why this platform</span>
            <h2 className="h-display text-[2rem] sm:text-[2.5rem]">
              What makes these courses different
            </h2>
          </Reveal>

          <div className="mt-11 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f, i) => (
              <Reveal key={f.title} delay={i * 60}>
                <div className="h-full rounded-2xl border border-line bg-white p-7">
                  <span className="text-[1.7rem]" aria-hidden="true">
                    {f.icon}
                  </span>
                  <h3 className="mt-4 text-[1.08rem] font-semibold tracking-[-0.01em]">
                    {f.title}
                  </h3>
                  <p className="mt-2.5 text-[0.93rem] leading-relaxed text-muted">
                    {f.body}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── live cohorts ──────────────────────────────────────────────── */}
      {activeCohorts.length > 0 && (
        <section className="section bg-surface">
          <div className="wrap">
            <Reveal>
              <span className="eyebrow">Live classes</span>
              <h2 className="h-display text-[2rem] sm:text-[2.5rem]">
                You are not learning alone.
              </h2>
              <p className="mt-4 max-w-2xl text-[1.02rem] text-muted">
                The recorded lessons carry the teaching. Live cohorts give you a
                place to ask questions and watch real work being done.
              </p>
            </Reveal>

            {activeCohorts.map((cohort) => (
              <Reveal key={cohort.slug}>
                <div className="mt-10 grid gap-6 rounded-2xl border border-line bg-white p-7 lg:grid-cols-[1fr_auto] lg:items-center">
                  <div>
                    <h3 className="text-[1.25rem] font-semibold tracking-[-0.01em]">
                      {cohort.title}
                    </h3>
                    {cohort.scheduleLabel && (
                      <p className="mt-1.5 text-[0.92rem] font-medium text-gold-700">
                        {cohort.scheduleLabel}
                      </p>
                    )}
                    {cohort.description && (
                      <p className="mt-3 max-w-2xl text-[0.95rem] leading-relaxed text-muted">
                        {cohort.description}
                      </p>
                    )}
                    <Link
                      href="/cohorts"
                      className="mt-4 inline-block text-[0.92rem] font-semibold text-gold-600 hover:underline"
                    >
                      See all live classes →
                    </Link>
                  </div>
                  <div className="flex flex-col items-start gap-3 lg:items-end">
                    {cohort.price != null && (
                      <p className="text-[1rem] font-semibold text-ink">
                        {formatPrice(cohort.price, "ZMW")}
                        {cohort.compareAtPrice && (
                          <s className="ml-2 text-[0.85rem] font-normal text-muted">
                            {formatPrice(cohort.compareAtPrice, "ZMW")}
                          </s>
                        )}
                      </p>
                    )}
                    <Link href="/cohorts" className="btn btn-navy">
                      Reserve my seat
                    </Link>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {/* ── membership pricing ────────────────────────────────────────── */}
      <section className="section">
        <div className="wrap" id="pricing">
          <Reveal>
            <span className="eyebrow">Membership</span>
            <h2 className="h-display text-[2rem] sm:text-[2.5rem]">
              Choose how long you want to learn.
            </h2>
            <p className="mt-4 max-w-2xl text-[1.02rem] text-muted">
              One payment. Every published course. Nothing renews automatically.
            </p>
          </Reveal>

          <div className="mx-auto mt-11 grid max-w-4xl gap-6 md:grid-cols-3">
            {plans.map((plan, i) => (
              <Reveal key={plan.code} delay={i * 80}>
                <div
                  className={`relative flex h-full flex-col rounded-2xl border bg-white p-7 ${
                    plan.isRecommended
                      ? "border-gold shadow-lift"
                      : "border-line"
                  }`}
                >
                  {plan.badge && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gold px-3 py-1 text-[0.72rem] font-bold uppercase tracking-[0.1em] text-ink">
                      {plan.badge}
                    </span>
                  )}
                  <h3 className="text-[1.05rem] font-semibold">{plan.name}</h3>
                  <p className="mt-4 text-[2.1rem] font-semibold text-gold-700">
                    {formatPrice(plan.price, "ZMW")}
                  </p>
                  {plan.compareAtPrice && (
                    <p className="text-[0.85rem] text-muted">
                      <s>{formatPrice(plan.compareAtPrice, "ZMW")}</s> if paid
                      monthly
                    </p>
                  )}
                  {plan.description && (
                    <p className="mt-3 text-[0.9rem] text-muted">
                      {plan.description}
                    </p>
                  )}
                  <ul className="mt-5 flex-1 space-y-2 text-[0.9rem] text-muted">
                    <li>Every published course</li>
                    <li>New courses while active</li>
                    <li>Templates and resources</li>
                    <li>Completion certificates</li>
                  </ul>
                  <Link
                    href={`/subscribe?plan=${plan.code}`}
                    className={`btn mt-6 ${
                      plan.isRecommended ? "btn-gold" : "btn-navy"
                    }`}
                  >
                    Get {plan.name.toLowerCase()}
                  </Link>
                </div>
              </Reveal>
            ))}
          </div>

          <p className="mt-8 text-center text-[0.9rem] text-muted">
            Prefer to talk first?{" "}
            <a
              href="https://wa.me/260979982819?text=Hi%20George%2C%20I%20have%20a%20question%20about%20the%20Learn2Earn%20membership"
              className="font-medium text-gold-600 hover:underline"
            >
              WhatsApp George
            </a>
            .
          </p>
        </div>
      </section>

      {/* ── reviews ────────────────────────────────────────────────────── */}
      <section className="section">
        <div className="wrap">
          <Reveal>
            <span className="eyebrow">Student reviews</span>
            <h2 className="h-display text-[2rem] sm:text-[2.5rem]">
              Real stories. Real results. Real people.
            </h2>
            <p className="mt-4 max-w-2xl text-[1.02rem] text-muted">
              George has taught thousands of students across Zambia and
              beyond. This is where their words go — as they are collected
              and approved.
            </p>
          </Reveal>

          <div className="mt-11 grid gap-6 md:grid-cols-3">
            {testimonials.map((r, i) => (
              <Reveal key={r.id} delay={i * 80}>
                <div className="card h-full p-7">
                  <StarRating rating={r.rating} size={16} />
                  {r.title && (
                    <h3 className="mt-4 text-[1.05rem] font-semibold">
                      {r.title}
                    </h3>
                  )}
                  <p className="mt-3 text-[0.94rem] leading-relaxed text-muted">
                    {r.content}
                  </p>
                  <p className="mt-5 text-[0.88rem] font-medium">
                    {r.authorName}
                    {r.authorRole && (
                      <span className="text-muted"> — {r.authorRole}</span>
                    )}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>

          <div className="mt-10 text-center">
            <Link href="/reviews" className="btn btn-outline !text-ink !border-line">
              Read the reviews
            </Link>
          </div>
        </div>
      </section>

      {/* ── more courses ───────────────────────────────────────────────── */}
      {rest.length > 0 && (
        <section className="section bg-surface">
          <div className="wrap">
            <Reveal>
              <h2 className="h-display text-[1.8rem] sm:text-[2.1rem]">
                Also worth a look
              </h2>
            </Reveal>
            <div className="mt-9 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {rest.map((course, i) => (
                <Reveal key={course.id} delay={i * 60}>
                  <CourseCard
                    course={course}
                    category={categoryByCourse.get(course.id)}
                  />
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── closing cta ────────────────────────────────────────────────── */}
      <section className="section bg-navy text-white">
        <div className="wrap text-center">
          <Reveal>
            <h2 className="h-display text-[2.1rem] sm:text-[2.7rem]">
              Pick the plan. Do the work. Build the proof.
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-[1.05rem] text-white/70">
              Money lives in people. Join once, and start with the course that
              moves you forward now.
            </p>
            <div className="mt-9 flex flex-wrap justify-center gap-3">
              <Link href="/subscribe" className="btn btn-gold">
                Get my membership
              </Link>
              <Link href="/courses" className="btn btn-outline">
                Browse courses
              </Link>
            </div>
            <p className="mt-6 text-[0.85rem] text-white/45">
              Questions?{" "}
              <Link
                href="/contact"
                className="underline underline-offset-4 hover:text-gold"
              >
                Get in touch
              </Link>{" "}
              or ask on WhatsApp.
            </p>
          </Reveal>
        </div>
      </section>
    </>
  );
}
