import Link from "next/link";
import { redirect } from "next/navigation";
import { and, eq } from "drizzle-orm";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  enrollments,
  lessonProgress,
  topics as topicTable,
} from "@/db/schema";
import { getCourseWithCurriculum } from "@/lib/courses";
import { MarkComplete } from "@/components/mark-complete";
import { pageMeta } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata = pageMeta({
  title: "Lesson",
  description: "Sign in to view your enrolled course on The $100 Guy courses platform.",
  noindex: true,
});

export default async function LessonPage({
  params,
}: {
  params: Promise<{ courseSlug: string; lessonSlug: string }>;
}) {
  const { courseSlug, lessonSlug } = await params;
  const session = await auth();
  if (!session?.user) {
    redirect(`/login?next=/learn/${courseSlug}/${lessonSlug}`);
  }

  const data = await getCourseWithCurriculum(courseSlug);
  if (!data) redirect("/courses");
  const { course, topics } = data;

  const enrollment = await db.query.enrollments.findFirst({
    where: and(
      eq(enrollments.userId, session.user.id),
      eq(enrollments.courseId, course.id),
    ),
  });
  if (!enrollment) redirect(`/learn/${courseSlug}`);

  // Flatten the tree so we can find the lesson and its neighbours.
  const flat = topics.flatMap((t) =>
    t.lessons.map((l) => ({ ...l, topicTitle: t.title })),
  );
  const index = flat.findIndex((l) => l.slug === lessonSlug);
  if (index === -1) redirect(`/learn/${courseSlug}`);

  const lesson = flat[index];
  const previous = flat[index - 1];
  const next = flat[index + 1];

  const done = await db.query.lessonProgress.findFirst({
    where: and(
      eq(lessonProgress.userId, session.user.id),
      eq(lessonProgress.lessonId, lesson.id),
    ),
  });

  const topic = await db.query.topics.findFirst({
    where: eq(topicTable.id, lesson.topicId),
  });

  return (
    <div className="section">
      <div className="wrap">
        <Link
          href={`/learn/${courseSlug}`}
          className="text-[0.9rem] text-muted hover:text-ink"
        >
          ← {course.title}
        </Link>

        <div className="mt-4 grid gap-10 lg:grid-cols-[1fr_300px]">
          <article>
            <p className="text-[0.82rem] uppercase tracking-[0.12em] text-gold-600">
              {topic?.title ?? lesson.topicTitle}
            </p>
            <h1 className="h-display mt-2 text-[1.9rem] sm:text-[2.3rem]">
              {lesson.title}
            </h1>

            <div className="mt-7 overflow-hidden rounded-2xl border border-line bg-navy">
              <div className="grid aspect-video place-items-center text-center text-white/60">
                <div className="px-6">
                  <p className="text-[0.95rem]">
                    The recording for this lesson is being uploaded.
                  </p>
                  <p className="mt-2 text-[0.85rem] text-white/40">
                    Lesson {index + 1} of {flat.length}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-7 flex flex-wrap items-center gap-4">
              <MarkComplete
                lessonId={lesson.id}
                courseSlug={courseSlug}
                alreadyDone={Boolean(done)}
              />
              <p className="text-[0.85rem] text-muted">
                Lesson {index + 1} of {flat.length}
              </p>
            </div>

            <nav className="mt-9 flex flex-wrap items-center justify-between gap-4 border-t border-line pt-6">
              {previous ? (
                <Link
                  href={`/learn/${courseSlug}/${previous.slug}`}
                  className="text-[0.92rem] font-semibold text-gold-600 hover:text-gold"
                >
                  ← {previous.title}
                </Link>
              ) : (
                <span />
              )}
              {next && (
                <Link
                  href={`/learn/${courseSlug}/${next.slug}`}
                  className="text-[0.92rem] font-semibold text-gold-600 hover:text-gold"
                >
                  {next.title} →
                </Link>
              )}
            </nav>
          </article>

          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="card p-5">
              <h2 className="text-[0.95rem] font-semibold">In this course</h2>
              <ol className="mt-3 max-h-[420px] space-y-0.5 overflow-y-auto">
                {flat.map((l, i) => (
                  <li key={l.id}>
                    <Link
                      href={`/learn/${courseSlug}/${l.slug}`}
                      className={`flex gap-2.5 rounded-lg px-2.5 py-2 text-[0.86rem] leading-snug ${
                        l.slug === lessonSlug
                          ? "bg-gold-100 font-semibold text-ink"
                          : "text-muted hover:bg-surface"
                      }`}
                    >
                      <span className="shrink-0 tabular-nums text-muted">
                        {i + 1}.
                      </span>
                      <span>{l.title}</span>
                    </Link>
                  </li>
                ))}
              </ol>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
