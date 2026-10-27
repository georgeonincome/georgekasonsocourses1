import Link from "next/link";

import { formatPrice } from "@/lib/format";
import type { Course } from "@/db/schema";
import { StarRating } from "@/components/star-rating";
import { CourseCover } from "@/components/course-cover";

export function CourseCard({
  course,
  category,
}: {
  course: Course;
  category?: string | null;
}) {
  const rating = course.ratingCount
    ? course.ratingSum / course.ratingCount
    : null;

  return (
    <article className="card group flex h-full flex-col">
      <Link href={`/courses/${course.slug}`} className="block overflow-hidden">
        <div className="relative @container aspect-[16/9] w-full overflow-hidden bg-surface">
          <div className="h-full w-full transition-transform duration-300 group-hover:scale-[1.04]">
            <CourseCover course={course} category={category} />
          </div>
          {category && (
            <span className="absolute left-3 top-3 rounded-full bg-navy/90 px-3 py-1 text-[0.72rem] font-medium text-white">
              {category}
            </span>
          )}
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-[1.05rem] font-semibold leading-snug tracking-[-0.01em]">
          <Link href={`/courses/${course.slug}`} className="hover:text-gold">
            {course.title}
          </Link>
        </h3>

        {course.description && (
          <p className="mt-2 line-clamp-2 text-[0.9rem] leading-relaxed text-muted">
            {course.description}
          </p>
        )}

        <div className="mt-4 flex items-center gap-3 text-[0.82rem] text-muted">
          {rating !== null && (
            <span className="flex items-center gap-1.5">
              <StarRating rating={rating} />
              <span className="font-medium text-ink">{rating.toFixed(1)}</span>
              <span>({course.ratingCount})</span>
            </span>
          )}
          {course.lessonCount > 0 && (
            <span>
              {course.lessonCount} lesson{course.lessonCount === 1 ? "" : "s"}
            </span>
          )}
        </div>

        <div className="mt-5 flex items-center justify-between border-t border-line pt-4">
          <span className="text-[1.15rem] font-semibold text-navy">
            {course.price > 0 ? formatPrice(course.price, course.currency) : "Free"}
          </span>
          <Link
            href={`/courses/${course.slug}`}
            className="text-[0.9rem] font-semibold text-gold-600 hover:text-gold"
          >
            View course →
          </Link>
        </div>
      </div>
    </article>
  );
}
