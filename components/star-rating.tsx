export function StarRating({
  rating,
  size = 14,
}: {
  rating: number;
  size?: number;
}) {
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;

  return (
    <span
      className="inline-flex items-center gap-0.5 text-gold"
      aria-label={`${rating.toFixed(1)} out of 5`}
    >
      {[0, 1, 2, 3, 4].map((i) => {
        const fill = i < full ? 1 : i === full && half ? 0.5 : 0;
        return (
          <svg
            key={i}
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            <defs>
              <linearGradient id={`half-${i}`}>
                <stop offset="50%" stopColor="currentColor" />
                <stop offset="50%" stopColor="transparent" />
              </linearGradient>
            </defs>
            <path
              d="M12 2l2.9 6.3 6.9.8-5.1 4.7 1.4 6.8L12 17.3 5.9 20.6l1.4-6.8L2.2 9.1l6.9-.8L12 2z"
              fill={
                fill === 1
                  ? "currentColor"
                  : fill === 0.5
                    ? `url(#half-${i})`
                    : "none"
              }
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinejoin="round"
            />
          </svg>
        );
      })}
    </span>
  );
}
