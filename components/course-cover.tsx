import type { Course } from "@/db/schema";
import { CategoryGlyph, styleForCategory } from "@/lib/course-visual";

/**
 * The face of a course — on the catalogue grid and at the top of the learning
 * page.
 *
 * Two render paths, one design:
 *
 *   course.image set   the artwork runs full-bleed under a scrim, with the
 *                      title composed over it
 *   course.image null  a generated cover in the category's colours
 *
 * Both draw the title the same way, because AI-generated artwork must never
 * contain text — every image model garbles rendered type, so type is always
 * composed here on top of whatever is underneath.
 *
 * Sizes with container query units so the same component works at card width
 * (~360px) and at learning-page width (~720px) without either looking loose.
 */

function CoverText({
  title,
  label,
  accent,
}: {
  title: string;
  label: string;
  accent: string;
}) {
  return (
    <div className="relative flex h-full flex-col items-start justify-end p-[6cqw]">
      <span
        className="mb-[2cqw] font-semibold uppercase"
        style={{
          color: accent,
          letterSpacing: "0.16em",
          fontSize: "clamp(0.5rem, 2.6cqw, 0.66rem)",
        }}
      >
        {label}
      </span>
      <span
        className="block max-w-[94%] font-semibold leading-[1.16] tracking-[-0.015em] text-white"
        style={{
          fontSize: "clamp(0.8rem, 5.6cqw, 1.5rem)",
          display: "-webkit-box",
          WebkitLineClamp: 3,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
        }}
      >
        {title}
      </span>
      <span
        className="mt-[2.4cqw] h-px w-[26%]"
        style={{ backgroundColor: accent, opacity: 0.75 }}
      />
    </div>
  );
}

export function CourseCover({
  course,
  category,
  className = "",
}: {
  course: Pick<Course, "slug" | "title" | "image">;
  category?: string | null;
  className?: string;
}) {
  const style = styleForCategory(category);

  // Real artwork: full-bleed image, scrim for legibility, title composed on top.
  if (course.image) {
    return (
      <div
        className={`relative h-full w-full overflow-hidden ${className}`}
        style={{ backgroundColor: style.bg }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={course.image}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to top, rgba(6,9,14,0.95) 0%, rgba(6,9,14,0.64) 34%, rgba(6,9,14,0.10) 68%, rgba(6,9,14,0.22) 100%)",
          }}
        />
        <CoverText title={course.title} label={style.label} accent={style.accent} />
      </div>
    );
  }

  // Generated cover: category colour identity, a faint glyph for texture, title.
  return (
    <div
      className={`relative h-full w-full overflow-hidden ${className}`}
      style={{ backgroundColor: style.bg }}
      aria-hidden="true"
    >
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(circle at 22% 18%, ${style.accent}26 0%, transparent 58%)`,
        }}
      />
      <CategoryGlyph
        glyph={style.glyph}
        color={style.tone}
        className="absolute -bottom-[8%] -right-[6%] h-[62%] w-[62%]"
      />
      <CoverText title={course.title} label={style.label} accent={style.accent} />
    </div>
  );
}
