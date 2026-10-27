import { reviewBreakdown } from "@/lib/reviews";
import type { PublishedReview } from "@/lib/reviews";

/**
 * Rating distribution for the reviews wall. Bars show the share of reviews
 * at each star level.
 */
export function ReviewsSummary({
  reviews,
  className = "",
}: {
  reviews: PublishedReview[];
  className?: string;
}) {
  const breakdown = reviewBreakdown(reviews);
  const total = reviews.length;
  const average = total
    ? reviews.reduce((n, r) => n + r.rating, 0) / total
    : 0;

  return (
    <div className={`card p-6 ${className}`}>
      <h2 className="text-[1.1rem] font-semibold">Rating breakdown</h2>

      {total === 0 ? (
        <p className="mt-3 text-[0.9rem] text-muted">
          No approved reviews yet. Numbers appear here as soon as the first
          real student review is published.
        </p>
      ) : (
        <>
          <div className="mt-4 flex items-end gap-3">
            <span className="text-[2.4rem] font-semibold leading-none text-ink">
              {average.toFixed(1)}
            </span>
            <span className="pb-1 text-[0.85rem] text-muted">
              out of 5 · {total} review{total === 1 ? "" : "s"}
            </span>
          </div>

          <ul className="mt-5 space-y-2.5">
            {breakdown.map((row) => (
              <li key={row.stars} className="flex items-center gap-3">
                <span className="w-12 shrink-0 text-[0.82rem] text-muted">
                  {row.stars} star
                </span>
                <span
                  aria-hidden="true"
                  className="h-2 flex-1 overflow-hidden rounded-full bg-line"
                >
                  <span
                    className="block h-full rounded-full bg-gold"
                    style={{ width: `${row.percent}%` }}
                  />
                </span>
                <span className="w-16 shrink-0 text-right text-[0.78rem] text-muted">
                  {row.count} ({row.percent}%)
                </span>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
