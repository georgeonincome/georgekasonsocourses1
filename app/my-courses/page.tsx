import Link from "next/link";
import { redirect } from "next/navigation";
import { desc, eq, inArray } from "drizzle-orm";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { courses, enrollments } from "@/db/schema";
import { formatPrice } from "@/lib/format";
import { pageMeta } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata = pageMeta({
  title: "My Courses",
  description: "Your enrolled courses on The $100 Guy courses platform.",
  path: "/my-courses",
  noindex: true,
});

export default async function MyCoursesPage() {
  const session = await auth();
  if (!session?.user) redirect("/login?next=/my-courses");
  const userId = session.user.id;

  const rows = await db.query.enrollments.findMany({
    where: eq(enrollments.userId, userId),
    orderBy: [desc(enrollments.enrolledAt)],
  });

  const courseIds = rows.map((r) => r.courseId);
  const enrolled = courseIds.length
    ? await db.query.courses.findMany({ where: inArray(courses.id, courseIds) })
    : [];
  const byId = new Map(enrolled.map((c) => [c.id, c]));

  return (
    <div className="section">
      <div className="wrap">
        <span className="eyebrow">My Courses</span>
        <h1 className="h-display text-[2.1rem] sm:text-[2.6rem]">
          Everything you are taking
        </h1>
        <p className="mt-3 max-w-2xl text-[1rem] text-muted">
          {rows.length
            ? `${rows.length} course${rows.length === 1 ? "" : "s"}, all in one place.`
            : "Nothing here yet."}
        </p>

        {rows.length === 0 ? (
          <div className="mt-9 rounded-xl border border-line bg-surface px-6 py-14 text-center">
            <p className="text-[1.05rem] font-semibold">No courses yet</p>
            <p className="mx-auto mt-2 max-w-md text-[0.95rem] text-muted">
              Once you enrol, the course appears here with your progress
              saved.
            </p>
            <Link href="/courses" className="btn btn-gold mt-6">
              Browse courses
            </Link>
          </div>
        ) : (
          <ul className="mt-9 space-y-4">
            {rows.map((e) => {
              const course = byId.get(e.courseId);
              if (!course) return null;
              return (
                <li key={e.id} className="card flex flex-wrap items-center gap-6 p-6">
                  <div className="min-w-[220px] flex-1">
                    <Link
                      href={`/learn/${course.slug}`}
                      className="text-[1.15rem] font-semibold leading-snug hover:text-gold-600"
                    >
                      {course.title}
                    </Link>
                    <p className="mt-1.5 text-[0.9rem] text-muted">
                      {course.lessonCount} lessons ·{" "}
                      {formatPrice(course.price, course.currency)}
                    </p>
                  </div>

                  <div className="w-full max-w-[260px]">
                    <div className="flex justify-between text-[0.82rem] text-muted">
                      <span>{e.status}</span>
                      <span>{e.progress}%</span>
                    </div>
                    <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-line">
                      <div
                        className="h-full rounded-full bg-gold"
                        style={{
                          width: `${Math.min(100, Math.max(0, e.progress))}%`,
                        }}
                      />
                    </div>
                  </div>

                  <Link
                    href={`/learn/${course.slug}`}
                    className="btn btn-navy !py-2.5 !px-5 !text-[0.9rem]"
                  >
                    {e.progress > 0 ? "Continue" : "Start"}
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
