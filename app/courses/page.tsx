import Link from "next/link";

import { CourseGrid } from "@/components/course-grid";
import { getAllCourses, getCategories, getCourseCategoriesMap } from "@/lib/courses";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "All courses",
  description: "Browse every digital-skills course from George J. Kasonso — AI and automation, freelancing, marketing, design, web design and more. Learn a skill, use it, get paid.",
  path: "/courses",
});const LEVELS = [
  { value: "all-levels", label: "All levels" },
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
] as const;

type SearchParams = Record<string, string | string[] | undefined>;

function one(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

export default async function CoursesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const activeCategory = one(sp.category).trim();
  const activeLevel = one(sp.level).trim();
  const activeSearch = one(sp.search).trim();

  const [allCourses, categoryList, courseCategories] = await Promise.all([
    getAllCourses({ publishedOnly: true }),
    getCategories(),
    getCourseCategoriesMap(),
  ]);

  // courseId -> category slugs
  const slugByCategoryId = new Map(categoryList.map((c) => [String(c.id), c.slug]));
  const nameBySlug = new Map(categoryList.map((c) => [c.slug, c.name]));

  const categorySlugs = new Map<number, string[]>();
  for (const [courseId, categoryIds] of courseCategories.entries()) {
    const slugs = categoryIds
      .map((id) => slugByCategoryId.get(String(id)))
      .filter((s): s is string => Boolean(s));
    categorySlugs.set(Number(courseId), slugs);
  }

  const needle = activeSearch.toLowerCase();
  const filtered = allCourses.filter((course) => {
    if (activeCategory) {
      const slugs = categorySlugs.get(course.id) ?? [];
      if (!slugs.includes(activeCategory)) return false;
    }
    if (activeLevel && course.level !== activeLevel) return false;
    if (needle) {
      const haystack = `${course.title} ${course.subtitle ?? ""} ${
        course.description ?? ""
      }`.toLowerCase();
      if (!haystack.includes(needle)) return false;
    }
    return true;
  });

  const filtersActive = Boolean(activeCategory || activeLevel || needle);
  const totalLessons = filtered.reduce((n, c) => n + (c.lessonCount ?? 0), 0);

  const buildHref = (patch: { category?: string; level?: string; search?: string }) => {
    const params = new URLSearchParams();
    const category = patch.category ?? activeCategory;
    const level = patch.level ?? activeLevel;
    const search = patch.search ?? activeSearch;
    if (category) params.set("category", category);
    if (level) params.set("level", level);
    if (search) params.set("search", search);
    const qs = params.toString();
    return qs ? `/courses?${qs}` : "/courses";
  };

  return (
    <>
      <section className="bg-navy py-16 text-white">
        <div className="wrap">
          <p className="eyebrow">The catalogue</p>
          <h1 className="h-display text-4xl sm:text-5xl">
            Pick the skill. Learn it. Use it. Get paid.
          </h1>
          <p className="mt-5 max-w-2xl text-[1.02rem] text-white/75">
            Every course is built around one idea — a skill you can use to earn
            online. Browse the full catalogue, filter by what you want to do
            next, and start today.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <span className="chip">{allCourses.length} courses</span>
            <span className="chip">{categoryList.length} categories</span>
            <span className="chip">{allCourses.reduce((n, c) => n + (c.lessonCount ?? 0), 0)} lessons</span>
          </div>
        </div>
      </section>

      <section className="section !py-12">
        <div className="wrap">
          {/* ── filters ─────────────────────────────────────────────── */}
          <div className="card p-5">
            <form action="/courses" method="get" className="flex flex-wrap items-end gap-3">
              <div className="min-w-[220px] flex-1">
                <label
                  htmlFor="course-search"
                  className="mb-1.5 block text-[0.8rem] font-medium text-muted"
                >
                  Search courses
                </label>
                <input
                  id="course-search"
                  type="search"
                  name="search"
                  defaultValue={activeSearch}
                  placeholder="e.g. Canva, AI tools, freelancing"
                  className="w-full rounded-lg border border-line bg-white px-4 py-2.5 text-[0.92rem] outline-none focus:border-gold"
                />
              </div>
              {activeCategory && (
                <input type="hidden" name="category" value={activeCategory} />
              )}
              {activeLevel && <input type="hidden" name="level" value={activeLevel} />}
              <button type="submit" className="btn btn-navy">
                Search
              </button>
              {filtersActive && (
                <Link href="/courses" className="btn btn-ghost">
                  Clear
                </Link>
              )}
            </form>

            {/* Category chips */}
            <div className="mt-5 flex flex-wrap gap-2">
              <Link
                href={buildHref({ category: "" })}
                className={`rounded-full border px-4 py-1.5 text-[0.84rem] font-medium transition-colors ${
                  !activeCategory
                    ? "border-navy bg-navy text-white"
                    : "border-line bg-white text-muted hover:border-gold hover:text-gold-600"
                }`}
              >
                All categories
              </Link>
              {categoryList.map((cat) => (
                <Link
                  key={cat.id}
                  href={buildHref({ category: cat.slug })}
                  className={`rounded-full border px-4 py-1.5 text-[0.84rem] font-medium transition-colors ${
                    activeCategory === cat.slug
                      ? "border-navy bg-navy text-white"
                      : "border-line bg-white text-muted hover:border-gold hover:text-gold-600"
                  }`}
                >
                  {cat.icon ? <span aria-hidden="true">{cat.icon} </span> : null}
                  {cat.name}
                </Link>
              ))}
            </div>

            {/* Level filter */}
            <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-line pt-4">
              <span className="text-[0.8rem] font-medium text-muted">Level:</span>
              {LEVELS.map((level) => (
                <Link
                  key={level.value}
                  href={buildHref({ level: level.value === "all-levels" ? "" : level.value })}
                  className={`rounded-full border px-3.5 py-1 text-[0.8rem] font-medium transition-colors ${
                    (activeLevel || "all-levels") === level.value
                      ? "border-gold bg-gold-100 text-gold-600"
                      : "border-line bg-white text-muted hover:border-gold hover:text-gold-600"
                  }`}
                >
                  {level.label}
                </Link>
              ))}
            </div>
          </div>

          {/* ── results ─────────────────────────────────────────────── */}
          <div className="mt-8 flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="h-display text-2xl text-navy">
              {activeCategory && nameBySlug.get(activeCategory)
                ? nameBySlug.get(activeCategory)
                : "All courses"}
            </h2>
            <p className="text-[0.9rem] text-muted">
              {filtered.length} course{filtered.length === 1 ? "" : "s"}
              {totalLessons > 0 ? ` · ${totalLessons} lessons` : ""}
              {activeSearch ? ` matching “${activeSearch}”` : ""}
            </p>
          </div>

          <div className="mt-6">
            <CourseGrid
              courses={filtered}
              categorySlugs={categorySlugs}
              categoryNames={nameBySlug}
              emptyMessage={
                filtersActive
                  ? "No courses match those filters. Try a different category, level or search term."
                  : "No courses are published yet. Check back soon."
              }
              emptyAction={
                filtersActive ? (
                  <Link href="/courses" className="btn btn-navy mt-2">
                    Reset filters
                  </Link>
                ) : undefined
              }
            />
          </div>
        </div>
      </section>
    </>
  );
}
