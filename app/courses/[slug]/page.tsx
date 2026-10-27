import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { CourseEnrollButton } from "@/components/course-enroll-button";
import { CourseGrid } from "@/components/course-grid";
import { CurriculumList } from "@/components/curriculum-list";
import { Reveal } from "@/components/reveal";
import { StarRating } from "@/components/star-rating";
import {
  getAllCourses,
  getCategories,
  getCourseCategoriesMap,
  getCourseWithCurriculum,
} from "@/lib/courses";
import { formatDuration, formatPrice } from "@/lib/format";
import {
  getReviewsForCourse,
  reviewAverage,
  reviewBreakdown,
} from "@/lib/reviews";
import { JsonLd } from "@/components/json-ld";
import { breadcrumbNode, courseNode, ogTags, twitterTags } from "@/lib/seo";

type Params = Promise<{ slug: string }>;

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { slug } = await params;
  const data = await getCourseWithCurriculum(slug);
  if (!data) return { title: "Course not found", robots: { index: false, follow: false } };

  const { course } = data;
  const description =
    course.description ??
    `A practical course from George J. Kasonso. ${course.lessonCount} lessons.`;

  const path = `/courses/${course.slug}`;

  return {
    // "Buy X" is the commercial query for a paid course; leading with the
    // subject and trailing the brand matches how people actually search.
    title: course.title,
    description,
    alternates: {
      canonical: path,
      languages: { "en-ZM": path, "x-default": path },
    },
    // article, not website — a course is a specific thing at a URL, and the
    // type drives how it renders when shared.
    openGraph: ogTags({
      title: course.title,
      description,
      path,
      type: "article",
      image: course.image ?? undefined,
    }),
    twitter: twitterTags({
      title: course.title,
      description,
      image: course.image ?? undefined,
    }),
  };
}

const LEVEL_LABELS: Record<string, string> = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
  "all-levels": "All levels",
};

export default async function CourseDetailPage({ params }: { params: Params }) {
  const { slug } = await params;
  const data = await getCourseWithCurriculum(slug);
  if (!data) notFound();

  const { course, topics, categories: courseCategories } = data;

  const [reviews, allCourses, categoryList, courseCategoriesMap] = await Promise.all([
    getReviewsForCourse(course.id),
    getAllCourses({ publishedOnly: true }),
    getCategories(),
    getCourseCategoriesMap(),
  ]);

  const categoryNames = new Map(categoryList.map((c) => [c.slug, c.name]));
  const slugByCategoryId = new Map(categoryList.map((c) => [String(c.id), c.slug]));

  // category slugs attached to each course
  const categorySlugs = new Map<number, string[]>();
  for (const [courseId, ids] of courseCategoriesMap.entries()) {
    const slugs = ids
      .map((id) => slugByCategoryId.get(String(id)))
      .filter((s): s is string => Boolean(s));
    categorySlugs.set(Number(courseId), slugs);
  }

  const mySlugs = categorySlugs.get(course.id) ?? [];
  const related = allCourses
    .filter((c) => c.id !== course.id)
    .filter((c) => {
      const slugs = categorySlugs.get(c.id) ?? [];
      return slugs.some((s) => mySlugs.includes(s));
    })
    .slice(0, 3);

  const totalLessons = topics.reduce((n, t) => n + t.lessons.length, 0);
  const lessonTotal = course.lessonCount || totalLessons;
  const duration = formatDuration(course.durationMinutes);

  const average = reviewAverage(reviews);
  const breakdown = reviewBreakdown(reviews);

  const priceLabel =
    course.price > 0 ? formatPrice(course.price, course.currency) : "Free";

  const categoryName = courseCategories[0]?.name ?? null;

  // Course schema is what earns the price, rating and availability in a Google
  // result. aggregateRating is only attached when real students have reviewed
  // this course — an invented rating is a manual-penalty risk, not a boost.
  const courseJsonLd = courseNode({
    slug: course.slug,
    title: course.title,
    description:
      course.description ??
      `${course.title} — a practical digital-skills course from George J. Kasonso. ${course.lessonCount} lessons.`,
    price: course.price / 100,
    currency: course.currency,
    category: categoryName,
    lessons: course.lessonCount,
    durationMinutes: course.durationMinutes,
    ratingSum: reviews.length ? reviews.reduce((n, r) => n + r.rating, 0) : null,
    ratingCount: reviews.length,
  });

  return (
    <>
      <JsonLd
        nodes={[
          breadcrumbNode([
            { name: "Home", path: "/" },
            { name: "Courses", path: "/courses" },
            { name: course.title, path: `/courses/${course.slug}` },
          ]),
          courseJsonLd,
        ]}
      />
      {/* ── breadcrumb + header ───────────────────────────────────── */}
      <section className="bg-navy pt-10 text-white">
        <div className="wrap">
          <nav aria-label="Breadcrumb" className="text-[0.85rem] text-white/60">
            <ol className="flex flex-wrap items-center gap-2">
              <li>
                <Link href="/" className="hover:text-gold">
                  Home
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li>
                <Link href="/courses" className="hover:text-gold">
                  Courses
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li className="text-white/90" aria-current="page">
                {course.title}
              </li>
            </ol>
          </nav>

          <div className="pb-12 pt-8">
            {mySlugs.length > 0 && (
              <div className="mb-4 flex flex-wrap gap-2">
                {mySlugs.map((s) => (
                  <Link
                    key={s}
                    href={`/courses?category=${encodeURIComponent(s)}`}
                    className="chip !border-gold/50 !bg-gold/15 !text-gold"
                  >
                    {categoryNames.get(s) ?? s}
                  </Link>
                ))}
              </div>
            )}

            <h1 className="h-display text-3xl sm:text-4xl lg:text-5xl">
              {course.title}
            </h1>
            {course.subtitle && (
              <p className="mt-3 max-w-3xl text-[1.05rem] text-white/75">
                {course.subtitle}
              </p>
            )}

            {/* meta row */}
            <dl className="mt-7 flex flex-wrap gap-x-8 gap-y-3 text-[0.9rem]">
              <div className="flex items-center gap-2">
                <dt className="text-white/55">Level</dt>
                <dd className="font-medium text-white">
                  {LEVEL_LABELS[course.level] ?? course.level}
                </dd>
              </div>
              {duration && (
                <div className="flex items-center gap-2">
                  <dt className="text-white/55">Duration</dt>
                  <dd className="font-medium text-white">{duration}</dd>
                </div>
              )}
              <div className="flex items-center gap-2">
                <dt className="text-white/55">Lessons</dt>
                <dd className="font-medium text-white">{lessonTotal}</dd>
              </div>
              {courseCategories.length > 0 && (
                <div className="flex items-center gap-2">
                  <dt className="text-white/55">Category</dt>
                  <dd className="font-medium text-white">
                    {courseCategories.map((c) => c.name).join(", ")}
                  </dd>
                </div>
              )}
              {average !== null && (
                <div className="flex items-center gap-2">
                  <dt className="text-white/55">Rating</dt>
                  <dd className="flex items-center gap-1.5 font-medium text-white">
                    <StarRating rating={average} />
                    {average.toFixed(1)} ({reviews.length})
                  </dd>
                </div>
              )}
            </dl>
          </div>
        </div>
      </section>

      {/* ── body ──────────────────────────────────────────────────── */}
      <section className="section !py-12">
        <div className="wrap grid gap-10 lg:grid-cols-[1fr_340px]">
          <div className="min-w-0 space-y-12">
            {/* description */}
            <Reveal>
              <h2 className="h-display text-2xl text-navy">About this course</h2>
              <div className="prose-body mt-4 text-[1rem] leading-relaxed text-ink/85">
                {(course.description ?? "")
                  .split(/\n{2,}/)
                  .filter(Boolean)
                  .map((para, i) => (
                    <p key={i}>{para}</p>
                  ))}
                {!course.description && (
                  <p>
                    This course is part of the $100 Guy catalogue: one practical
                    skill, taught step by step, so you can use it and get paid.
                  </p>
                )}
              </div>
            </Reveal>

            {/* what you'll learn — curriculum */}
            <Reveal>
              <section id="curriculum">
                <h2 className="h-display text-2xl text-navy">What you'll learn</h2>
                <p className="mt-2 text-[0.95rem] text-muted">
                  {lessonTotal} lesson{lessonTotal === 1 ? "" : "s"} across{" "}
                  {topics.length} topic{topics.length === 1 ? "" : "s"}. Expand a
                  topic to see every lesson.
                </p>
                <div className="mt-6">
                  <CurriculumList topics={topics} title="Course curriculum" />
                </div>
              </section>
            </Reveal>

            {/* category */}
            {courseCategories.length > 0 && (
              <Reveal>
                <section>
                  <h2 className="h-display text-2xl text-navy">Category</h2>
                  <div className="mt-4 flex flex-wrap gap-3">
                    {courseCategories.map((cat) => (
                      <Link
                        key={cat.id}
                        href={`/courses?category=${encodeURIComponent(cat.slug)}`}
                        className="btn btn-ghost"
                      >
                        {cat.icon ? <span aria-hidden="true">{cat.icon}</span> : null}
                        {cat.name}
                        <span aria-hidden="true">→</span>
                      </Link>
                    ))}
                  </div>
                  {courseCategories[0]?.description && (
                    <p className="mt-3 text-[0.95rem] text-muted">
                      {courseCategories[0].description}
                    </p>
                  )}
                </section>
              </Reveal>
            )}

            {/* reviews */}
            <Reveal>
              <section id="reviews">
                <h2 className="h-display text-2xl text-navy">Student reviews</h2>

                {reviews.length > 0 ? (
                  <>
                    <div className="mt-5 grid gap-8 md:grid-cols-[220px_1fr]">
                      <div className="card p-5">
                        <p className="text-4xl font-semibold text-navy">
                          {average?.toFixed(1)}
                        </p>
                        <StarRating rating={average ?? 0} size={18} />
                        <p className="mt-2 text-[0.85rem] text-muted">
                          Based on {reviews.length} review
                          {reviews.length === 1 ? "" : "s"}
                        </p>
                        <ul className="mt-4 space-y-1.5">
                          {breakdown.map((b) => (
                            <li
                              key={b.stars}
                              className="flex items-center gap-2 text-[0.8rem] text-muted"
                            >
                              <span className="w-3">{b.stars}</span>
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                                <path d="M12 2l2.9 6.3 6.9.8-5.1 4.7 1.4 6.8L12 17.3 5.9 20.6l1.4-6.8L2.2 9.1l6.9-.8L12 2z" />
                              </svg>
                              <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface">
                                <span
                                  className="block h-full rounded-full bg-gold"
                                  style={{ width: `${b.percent}%` }}
                                />
                              </span>
                              <span className="w-4 text-right">{b.count}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <ul className="space-y-4">
                        {reviews.map((r) => (
                          <li key={r.id} className="card p-5">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <div>
                                <p className="font-semibold text-navy">
                                  {r.authorName}
                                </p>
                                {r.authorRole && (
                                  <p className="text-[0.82rem] text-muted">
                                    {r.authorRole}
                                  </p>
                                )}
                              </div>
                              <StarRating rating={r.rating} />
                            </div>
                            {r.title && (
                              <p className="mt-3 font-medium text-ink">{r.title}</p>
                            )}
                            <p className="mt-1 text-[0.93rem] leading-relaxed text-ink/80">
                              {r.content}
                            </p>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </>
                ) : (
                  <div className="mt-5 rounded-xl border border-dashed border-gray bg-surface p-6">
                    <p className="font-semibold text-navy">
                      No reviews for this course yet.
                    </p>
                    <p className="mt-1 text-[0.92rem] text-muted">
                      Student reviews for this course appear here as they are
                      collected and approved.
                    </p>
                  </div>
                )}
              </section>
            </Reveal>
          </div>

          {/* ── sidebar: price + CTA ───────────────────────────────── */}
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="card p-6">
              <p className="text-[0.82rem] font-medium uppercase tracking-wide text-muted">
                One-off payment
              </p>
              <p className="mt-1 text-3xl font-semibold text-navy">{priceLabel}</p>
              {course.compareAtPrice && course.compareAtPrice > course.price && (
                <p className="mt-1 text-[0.9rem] text-muted line-through">
                  {formatPrice(course.compareAtPrice, course.currency)}
                </p>
              )}
              <p className="mt-2 text-[0.85rem] text-muted">
                Lifetime access · {lessonTotal} lessons
                {duration ? ` · ${duration}` : ""}
              </p>

              <div className="mt-5">
                <CourseEnrollButton
                  course={{
                    slug: course.slug,
                    title: course.title,
                    price: course.price,
                    currency: course.currency,
                  }}
                />
                <Link
                  href={`/checkout?course=${encodeURIComponent(course.slug)}`}
                  className="btn btn-ghost mt-2.5 w-full"
                >
                  Buy without adding to cart
                </Link>
              </div>

              <ul className="mt-5 space-y-2 border-t border-line pt-5 text-[0.88rem] text-muted">
                <li>✓ {lessonTotal} video lessons</li>
                <li>✓ Downloadable resources</li>
                <li>✓ Learn at your own pace</li>
              </ul>
            </div>

            <div className="card mt-5 p-6">
              <h3 className="font-semibold text-navy">Not sure yet?</h3>
              <p className="mt-2 text-[0.9rem] text-muted">
                Browse the rest of the catalogue and find the skill that fits
                where you want to go next.
              </p>
              <Link href="/courses" className="btn btn-ghost mt-4 w-full">
                All courses
              </Link>
            </div>
          </aside>
        </div>
      </section>

      {/* ── related ───────────────────────────────────────────────── */}
      {related.length > 0 && (
        <section className="section !py-12 bg-surface">
          <div className="wrap">
            <h2 className="h-display text-2xl text-navy">Related courses</h2>
            <p className="mt-2 text-[0.95rem] text-muted">
              More courses in the same category.
            </p>
            <div className="mt-6">
              <CourseGrid
                courses={related}
                categorySlugs={categorySlugs}
                categoryNames={categoryNames}
                emptyMessage=""
              />
            </div>
          </div>
        </section>
      )}
    </>
  );
}
