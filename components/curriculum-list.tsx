import Link from "next/link";

export type CurriculumLesson = {
  id: number;
  title: string;
  slug?: string;
  position: number;
  isPreview: boolean;
  durationMinutes?: number | null;
};

export type CurriculumTopic = {
  id: number;
  title: string;
  position: number;
  lessons: CurriculumLesson[];
};

function lessonDuration(minutes?: number | null) {
  if (!minutes) return null;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (!h) return `${m} min`;
  return m ? `${h}h ${m}m` : `${h}h`;
}

/**
 * Curriculum renderer. Uses <details>/<summary> so topics expand without
 * requiring any client-side JavaScript.
 */
export function CurriculumList({
  topics,
  title = "Course curriculum",
  courseSlug,
}: {
  topics: CurriculumTopic[];
  title?: string;
  /** When given, each lesson links into the player. */
  courseSlug?: string;
}) {
  const totalLessons = topics.reduce((n, t) => n + t.lessons.length, 0);

  if (!topics.length) {
    return (
      <div>
        <h2 className="h-display text-2xl text-navy">{title}</h2>
        <p className="mt-3 text-[0.95rem] text-muted">
          The syllabus for this course is being finalised. Join the course and
          the full lesson list will be available in your dashboard.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="h-display text-2xl text-navy">{title}</h2>
        <p className="text-[0.9rem] text-muted">
          {topics.length} topic{topics.length === 1 ? "" : "s"} · {totalLessons}{" "}
          lesson{totalLessons === 1 ? "" : "s"} in total
        </p>
      </div>

      <div className="mt-5 space-y-3">
        {topics.map((topic) => {
          const lessonCount = topic.lessons.length;
          return (
            <details
              key={topic.id}
              className="card overflow-hidden !rounded-xl p-0 open:shadow-card"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4">
                <span className="flex items-center gap-3">
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-navy text-[0.8rem] font-semibold text-white">
                    {topic.position + 1}
                  </span>
                  <span className="font-semibold text-navy">{topic.title}</span>
                </span>
                <span className="flex shrink-0 items-center gap-3">
                  <span className="text-[0.82rem] text-muted">
                    {lessonCount} lesson{lessonCount === 1 ? "" : "s"}
                  </span>
                  <svg
                    className="transition-transform duration-200 group-open:rotate-180"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    aria-hidden="true"
                  >
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </span>
              </summary>

              <ol className="border-t border-line bg-surface px-5 py-3">
                {topic.lessons.map((lesson, index) => (
                  <li
                    key={lesson.id}
                    className="flex items-center justify-between gap-4 border-b border-line/70 py-2.5 last:border-b-0"
                  >
                    <span className="flex items-start gap-3">
                      <span className="mt-0.5 w-5 shrink-0 text-right text-[0.78rem] font-medium text-muted">
                        {index + 1}.
                      </span>
                      <span className="text-[0.92rem] text-ink">
                        {courseSlug ? (
                          <Link
                            href={`/learn/${courseSlug}/${lesson.slug}`}
                            className="hover:text-gold-600"
                          >
                            {lesson.title}
                          </Link>
                        ) : (
                          lesson.title
                        )}
                      </span>
                      {lesson.isPreview && (
                        <span className="mt-0.5 shrink-0 rounded-full bg-gold-100 px-2.5 py-0.5 text-[0.68rem] font-semibold uppercase tracking-wide text-gold-600">
                          Free preview
                        </span>
                      )}
                    </span>
                    {lessonDuration(lesson.durationMinutes) && (
                      <span className="shrink-0 text-[0.8rem] text-muted">
                        {lessonDuration(lesson.durationMinutes)}
                      </span>
                    )}
                  </li>
                ))}
              </ol>
            </details>
          );
        })}
      </div>
    </div>
  );
}
