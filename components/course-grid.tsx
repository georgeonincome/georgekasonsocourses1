import type { ReactNode } from "react";

import { CourseCard } from "@/components/course-card";
import type { Course } from "@/db/schema";

export type CourseGridProps = {
  courses: Course[];
  /**
   * Category slugs attached to each course (course id -> slugs). Optional:
   * when omitted the card simply shows no category badge.
   */
  categorySlugs?: Map<number, string[]>;
  /** Category slug -> display name. */
  categoryNames?: Map<string, string>;
  emptyMessage?: string;
  emptyAction?: ReactNode;
};

/**
 * Presentational grid of course cards with a friendly empty state.
 */
export function CourseGrid({
  courses,
  categorySlugs,
  categoryNames,
  emptyMessage = "No courses match your filters yet.",
  emptyAction,
}: CourseGridProps) {
  if (!courses.length) {
    return (
      <div className="card flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
        <span
          className="grid h-14 w-14 place-items-center rounded-full bg-surface text-2xl"
          aria-hidden="true"
        >
          📚
        </span>
        <h3 className="text-lg font-semibold text-navy">Nothing here yet</h3>
        <p className="max-w-md text-[0.95rem] text-muted">{emptyMessage}</p>
        {emptyAction}
      </div>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {courses.map((course) => {
        const slugs = categorySlugs?.get(course.id) ?? [];
        const primary =
          slugs
            .map((slug) => categoryNames?.get(slug))
            .find((name): name is string => Boolean(name)) ?? null;
        return <CourseCard key={course.id} course={course} category={primary} />;
      })}
    </div>
  );
}
