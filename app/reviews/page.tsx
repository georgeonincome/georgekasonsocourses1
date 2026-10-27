import Link from "next/link";

import {
  getAllCourses,
  getCategories,
  getCourseCategoriesMap,
} from "@/lib/courses";
import { getPublishedReviews } from "@/lib/reviews";
import { Reveal } from "@/components/reveal";
import { ReviewCard } from "@/components/review-card";
import { ReviewSubmitForm } from "@/components/review-submit-form";
import { ReviewsSummary } from "@/components/reviews-summary";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "Student Reviews",
  description: "Real feedback from learners on The $100 Guy courses — what changed in their work, in their own words.",
  path: "/reviews",
});

export default async function ReviewsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;

  const [published, categories, courses, courseCats] =
    await Promise.all([
      getPublishedReviews(18),
      getCategories(),
      getAllCourses(),
      getCourseCategoriesMap(),
    ]);

  // courseId -> category slugs, so the filter chips can actually filter.
  const slugsByCourse = new Map<number, string[]>();
  for (const course of courses) {
    const ids = courseCats.get(course.id) ?? [];
    const wanted = new Set(ids.map(Number));
    const matched = categories.filter((c) => wanted.has(c.id)).map((c) => c.slug);
    if (matched.length) slugsByCourse.set(course.id, matched);
  }

  const active = typeof sp.category === "string" ? sp.category : null;

  const featured = published.slice(0, 18);

  const allSlugs = new Set<string>();
  for (const r of published) {
    for (const s of slugsByCourse.get(r.courseId ?? -1) ?? []) allSlugs.add(s);
  }
  const filterSlugs = Array.from(allSlugs).sort();

  const matches = (courseId: number | null) =>
    !active ||
    active === "all" ||
    (slugsByCourse.get(courseId ?? -1) ?? []).includes(active);

  const visibleFeatured = featured.filter((r) => matches(r.courseId));

  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-navy py-20 text-white">
        <div className="wrap">
          <Reveal>
            <span className="eyebrow">Real Stories. Real Results.</span>
            <h1 className="h-display max-w-3xl text-[clamp(2rem,4.6vw,3.4rem)]">
              Real learner stories, not fancy screenshots.
            </h1>
            <p className="mt-5 max-w-2xl text-[1rem] leading-relaxed text-white/75">
              What people say here is what they wrote. Every review on this
              wall comes from a student who took a course with George.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ── Filter chips ─────────────────────────────────────────────── */}
      {filterSlugs.length > 0 && (
        <section className="border-b border-line bg-surface py-6">
          <div className="wrap">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="mr-1 text-[0.85rem] font-medium text-muted">
                Filter:
              </span>
              <Link
                href="/reviews"
                className={`rounded-full border px-4 py-2 text-[0.88rem] transition-colors ${
                  !active
                    ? "border-gold bg-gold-100 font-medium text-ink"
                    : "border-line bg-white text-muted hover:border-gold hover:text-ink"
                }`}
              >
                All
              </Link>
              {filterSlugs.map((slug) => (
                <Link
                  key={slug}
                  href={`/reviews?category=${encodeURIComponent(slug)}`}
                  className={`rounded-full border px-4 py-2 text-[0.88rem] transition-colors ${
                    active === slug
                      ? "border-gold bg-gold-100 font-medium text-ink"
                      : "border-line bg-white text-muted hover:border-gold hover:text-ink"
                  }`}
                >
                  {slug}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Featured + sidebar ───────────────────────────────────────── */}
      <section className="section">
        <div className="wrap grid gap-10 lg:grid-cols-[1fr_320px]">
          <div>
            <Reveal>
              <span className="eyebrow">Featured reviews</span>
              <h2 className="h-display text-[clamp(1.6rem,3vw,2.3rem)]">
                {visibleFeatured.length > 0
                  ? `${visibleFeatured.length} learner stor${visibleFeatured.length === 1 ? "y" : "ies"}`
                  : "Nothing here yet"}
              </h2>
            </Reveal>

            {visibleFeatured.length > 0 ? (
              <div className="mt-8 grid gap-6 sm:grid-cols-2">
                {visibleFeatured.map((r, i) => (
                  <Reveal key={r.id} delay={Math.min(i, 4) * 60}>
                    <ReviewCard review={r} />
                  </Reveal>
                ))}
              </div>
            ) : (
              <div className="mt-8 rounded-2xl border border-dashed border-line bg-surface p-8 text-center text-[0.95rem] text-muted">
                No reviews in this category yet. Real learner reviews will
                appear here as soon as they are approved.
              </div>
            )}
          </div>

          {/* ── Sidebar ──────────────────────────────────────────────── */}
          <aside className="space-y-6 lg:sticky lg:top-6 lg:self-start">
            <Reveal delay={60}>
              <ReviewsSummary reviews={published} />
            </Reveal>

            <Reveal delay={100}>
              <div className="card p-6">
                <span className="eyebrow">Your turn</span>
                <h2 className="text-[1.1rem] font-semibold text-ink">
                  Share what changed for you
                </h2>
                <p className="mt-2 text-[0.9rem] leading-relaxed text-muted">
                  This wall is only as good as the people on it. If a course
                  changed something in your work, send the real version of
                  your review — no marketing language needed.
                </p>
                <a
                  href="#send-review"
                  className="mt-4 inline-block text-[0.9rem] font-semibold text-gold-600 hover:text-gold"
                >
                  Send your review →
                </a>
              </div>
            </Reveal>

            <Reveal delay={140}>
              <div className="rounded-2xl border border-gold/40 bg-gold-100 p-6">
                <h2 className="text-[1.05rem] font-semibold text-ink">
                  Not studying yet?
                </h2>
                <p className="mt-2 text-[0.9rem] leading-relaxed text-muted">
                  Register, pick a course and start the first lesson today.
                  Prices are in kwacha.
                </p>
                <Link
                  href="/register"
                  className="mt-4 inline-block text-[0.9rem] font-semibold text-gold-600 hover:text-gold"
                >
                  Create an account →
                </Link>
              </div>
            </Reveal>
          </aside>
        </div>
      </section>

      {/* ── Submission form ──────────────────────────────────────────── */}
      <section id="send-review" className="section scroll-mt-24 bg-surface">
        <div className="wrap">
          <Reveal>
            <span className="eyebrow">Your turn</span>
            <h2 className="h-display text-[clamp(1.6rem,2.8vw,2.2rem)]">
              Tell us what changed
            </h2>
            <p className="mt-3 max-w-2xl text-[1rem] text-muted">
              This wall is only as good as the people on it. If a course
              changed something in your work, send the real version.
            </p>
          </Reveal>

          <div className="mt-9 max-w-2xl">
            <ReviewSubmitForm
              courseOptions={courses.map((c) => ({
                slug: c.slug,
                title: c.title,
              }))}
            />
          </div>
        </div>
      </section>

      {/* ── Blurb + CTA ──────────────────────────────────────────────── */}
      <section className="section bg-navy text-white">
        <div className="wrap">
          <Reveal>
            <div className="mx-auto max-w-2xl text-center">
              <span className="eyebrow">Start yours</span>
              <h2 className="h-display text-[clamp(1.7rem,3.2vw,2.4rem)]">
                One skill, one course, one first result.
              </h2>
              <p className="mt-4 text-[0.98rem] leading-relaxed text-white/75">
                Every review on this page started with someone deciding to try
                one lesson. Pick the course that matches the work you already
                do, and start there.
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <Link href="/courses" className="btn btn-gold">
                  Browse courses →
                </Link>
                <Link href="/about" className="btn btn-outline">
                  About George
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
