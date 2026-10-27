/**
 * Shown by Suspense while a route segment streams in. It sits inside the root
 * layout, so the header and footer stay interactive and only the page body is
 * replaced — the student can still navigate away mid-load.
 *
 * Kept deliberately light: a skeleton that mirrors the shape of the page
 * (hero block, then a card grid) is what makes a wait feel short.
 */
function SkeletonBlock({ className }: { className: string }) {
  return <div className={`animate-pulse rounded-lg bg-line/60 ${className}`} />;
}

export default function Loading() {
  return (
    <div className="bg-surface" aria-busy="true" aria-live="polite">
      {/* Hero */}
      <section className="bg-navy text-white">
        <div className="wrap py-16 sm:py-24">
          <SkeletonBlock className="mb-5 h-4 w-32" />
          <SkeletonBlock className="mb-4 h-9 w-full max-w-2xl sm:h-12" />
          <SkeletonBlock className="mb-3 h-9 w-full max-w-xl sm:h-12" />
          <SkeletonBlock className="mt-6 h-4 w-full max-w-lg" />
          <SkeletonBlock className="mt-2 h-4 w-full max-w-md" />
          <div className="mt-9 flex gap-4">
            <SkeletonBlock className="h-11 w-44 !rounded-[10px]" />
            <SkeletonBlock className="h-11 w-36 !rounded-[10px]" />
          </div>
        </div>
      </section>

      {/* Course grid */}
      <section className="section">
        <div className="wrap">
          <SkeletonBlock className="mb-4 h-4 w-28" />
          <SkeletonBlock className="mb-10 h-8 w-64" />
          <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="card overflow-hidden">
                <SkeletonBlock className="h-44 !rounded-none" />
                <div className="space-y-3 p-5">
                  <SkeletonBlock className="h-4 w-20" />
                  <SkeletonBlock className="h-5 w-full" />
                  <SkeletonBlock className="h-4 w-2/3" />
                  <div className="flex items-center justify-between pt-2">
                    <SkeletonBlock className="h-5 w-16" />
                    <SkeletonBlock className="h-9 w-28 !rounded-[10px]" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
