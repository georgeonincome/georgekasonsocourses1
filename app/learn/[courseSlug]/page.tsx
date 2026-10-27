import Link from "next/link";
import { redirect } from "next/navigation";
import { and, eq } from "drizzle-orm";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { courses, enrollments } from "@/db/schema";
import { formatDuration, formatPrice } from "@/lib/format";
import { getCourseWithCurriculum } from "@/lib/courses";
import { CurriculumList } from "@/components/curriculum-list";
import { CourseCover } from "@/components/course-cover";
import { pageMeta } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata = pageMeta({
  title: "Course",
  description: "Sign in to view your enrolled course on The $100 Guy courses platform.",
  noindex: true,
});

export default async function LearnPage({
  params,
}: {
  params: Promise<{ courseSlug: string }>;
}) {
  const { courseSlug } = await params;
  const session = await auth();
  if (!session?.user) redirect(`/login?next=/learn/${courseSlug}`);

  const data = await getCourseWithCurriculum(courseSlug);
  if (!data) redirect("/courses");

  const { course, topics } = data;

  const enrollment = await db.query.enrollments.findFirst({
    where: and(
      eq(enrollments.userId, session.user.id),
      eq(enrollments.courseId, course.id),
    ),
  });

  const firstLesson = topics[0]?.lessons[0];

  if (!enrollment) {
    return (
      <div className="section">
        <div className="wrap grid gap-10 lg:grid-cols-[1fr_400px]">
          <div>
            <span className="eyebrow">Locked</span>
            <h1 className="h-display text-[2.1rem] sm:text-[2.6rem]">
              {course.title}
            </h1>
            <p className="mt-4 text-[1.02rem] leading-relaxed text-muted">
              {course.description}
            </p>

            <div className="mt-8 rounded-2xl border border-line bg-surface p-7">
              <h2 className="text-[1.15rem] font-semibold">
                Enrol to unlock every lesson
              </h2>
              <p className="mt-2 text-[0.95rem] leading-relaxed text-muted">
                {course.lessonCount} lessons, lifetime access, and a
                certificate when you finish.
              </p>
              <Link
                href={`/checkout?course=${course.slug}`}
                className="btn btn-gold mt-6"
              >
                Enrol for {formatPrice(course.price, course.currency)}
              </Link>
            </div>
          </div>

          <aside className="card overflow-hidden">
            <div className="aspect-[16/9]">
              <CourseCover course={course} />
            </div>
            <div className="p-6">
              <dl className="space-y-2.5 text-[0.92rem]">
                {[
                  ["Lessons", String(course.lessonCount)],
                  [
                    "Duration",
                    formatDuration(course.durationMinutes) ?? "Self-paced",
                  ],
                  ["Level", course.level.replace("-", " ")],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between">
                    <dt className="text-muted">{k}</dt>
                    <dd className="font-medium capitalize">{v}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </aside>
        </div>
      </div>
    );
  }

  return (
    <div className="section">
      <div className="wrap">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div className="max-w-2xl">
            <Link
              href="/my-courses"
              className="text-[0.9rem] text-muted hover:text-ink"
            >
              ← My Courses
            </Link>
            <h1 className="h-display mt-3 text-[2rem] sm:text-[2.4rem]">
              {course.title}
            </h1>
            <p className="mt-3 text-[1rem] leading-relaxed text-muted">
              {course.description}
            </p>
          </div>

          <div className="card w-full max-w-[300px] p-6">
            <div className="flex justify-between text-[0.85rem] text-muted">
              <span>Your progress</span>
              <span>{enrollment.progress}%</span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-line">
              <div
                className="h-full rounded-full bg-gold"
                style={{
                  width: `${Math.min(100, Math.max(0, enrollment.progress))}%`,
                }}
              />
            </div>
            {firstLesson && (
              <Link
                href={`/learn/${course.slug}/${firstLesson.slug}`}
                className="btn btn-gold mt-5 w-full"
              >
                {enrollment.progress > 0 ? "Continue" : "Start the first lesson"}
              </Link>
            )}
          </div>
        </div>

        <div className="mt-10">
          <h2 className="text-[1.4rem] font-semibold tracking-[-0.01em]">
            Course content
          </h2>
          <div className="mt-5">
            <CurriculumList topics={topics} courseSlug={course.slug} />
          </div>
        </div>
      </div>
    </div>
  );
}
