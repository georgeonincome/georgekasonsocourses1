import { StarRating } from "@/components/star-rating";
import { formatDate } from "@/lib/format";
import type { Review } from "@/db/schema";

/**
 * One review, rendered as a card.
 */
export function ReviewCard({ review }: { review: Review }) {
  const initial = (review.authorName || "?").trim().charAt(0).toUpperCase();

  return (
    <article className="card flex h-full flex-col p-5">
      <div className="flex items-start gap-3">
        <span
          aria-hidden="true"
          className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-gold-100 text-[1.05rem] font-semibold text-gold-600"
        >
          {initial}
        </span>

        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold text-ink">{review.authorName}</p>
          {review.authorRole && (
            <p className="truncate text-[0.83rem] text-muted">{review.authorRole}</p>
          )}
        </div>

        <div className="shrink-0">
          <StarRating rating={review.rating} />
        </div>
      </div>

      {review.title && (
        <h3 className="mt-4 text-[1rem] font-semibold leading-snug text-ink">
          {review.title}
        </h3>
      )}

      <p className="mt-2 flex-1 text-[0.92rem] leading-relaxed text-muted">
        {review.content}
      </p>

      <div className="mt-5 flex items-center justify-between gap-3 border-t border-line pt-4 text-[0.8rem]">
        <span className="text-muted">{formatDate(review.createdAt)}</span>
      </div>
    </article>
  );
}
