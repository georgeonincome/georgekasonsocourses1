import Link from "next/link";
import { asc, eq } from "drizzle-orm";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { cohorts } from "@/db/schema";
import { accessOf } from "@/lib/subscription";
import { formatPrice } from "@/lib/format";
import { JsonLd } from "@/components/json-ld";
import { breadcrumbNode, pageMeta } from "@/lib/seo";
import { CohortSignupForm } from "@/components/cohort-signup-form";

export const dynamic = "force-dynamic";

/**
 * Live classes. The benchmark made live cohorts a paying surface in their own
 * right: a calendar, a seat count, a price and a "reserve" form. Members get
 * the seat free — the cohort list should advertise that hard.
 */
export const metadata = pageMeta({
  title: "Live classes — cohorts with a real teacher in the room",
  description:
    "Train live with George J. Kasonso: scheduled multi-day cohorts over WhatsApp and video, replay points so you never fall behind. Members reserve a seat free; non-members pay per cohort.",
  path: "/cohorts",
});

export default async function CohortsPage() {
  const session = await auth();
  const rows = await db
    .select()
    .from(cohorts)
    .where(eq(cohorts.isPublished, true))
    .orderBy(asc(cohorts.sortOrder));

  const member = await accessOf(session?.user?.id ?? null);
  const memberActive = member.status === "active";

  return (
    <>
      <JsonLd
        nodes={[
          breadcrumbNode([
            { name: "Home", path: "/" },
            { name: "Live classes", path: "/cohorts" },
          ]),
        ]}
      />
      <div className="section">
        <div className="wrap">
          <span className="eyebrow">Live classes</span>
          <h1 className="h-display text-[2.1rem] sm:text-[2.7rem]">
            Not a video you watch alone — a class with a teacher in the room.
          </h1>
          <p className="mt-4 max-w-2xl text-[1.02rem] text-muted">
            Each cohort runs on a set calendar, day by day, with a WhatsApp
            group for questions between sessions. Miss a night and you keep
            your seat — replays pick up from where you left off.
          </p>

          {memberActive && member.endsAt && (
            <div className="mt-8 rounded-2xl border border-line bg-surface p-6">
              <p className="text-[0.95rem] font-semibold text-ink">
                Your membership already covers a seat in every cohort below.
              </p>
              <p className="mt-1.5 text-[0.9rem] text-muted">
                Active until{" "}
                {member.endsAt.toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
                . Reserve normally — no extra payment for the seat.
              </p>
            </div>
          )}

          <div className="mt-10 grid gap-8 lg:grid-cols-2">
            {rows.map((c) => {
              const base =
                c.status === "completed"
                  ? "opacity-90"
                  : "border-gold shadow-lift";
              return (
                <section
                  key={c.slug}
                  className={`flex flex-col rounded-2xl border border-line bg-white p-7 ${base}`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <span
                      className={`rounded-full px-3 py-1 text-[0.72rem] font-bold uppercase tracking-[0.1em] ${
                        c.status === "active"
                          ? "bg-emerald-50 text-emerald-700"
                          : c.status === "completed"
                            ? "bg-surface text-muted"
                            : "bg-amber-50 text-amber-700"
                      }`}
                    >
                      {c.status}
                    </span>
                    {memberActive && c.price ? (
                      <span className="text-[0.82rem] font-semibold text-ink">
                        Included in membership
                      </span>
                    ) : null}
                  </div>

                  <h2 className="mt-4 text-[1.3rem] font-semibold leading-snug">
                    {c.title}
                  </h2>
                  {c.description && (
                    <p className="mt-2.5 text-[0.95rem] leading-relaxed text-muted">
                      {c.description}
                    </p>
                  )}

                  {c.scheduleLabel && (
                    <p className="mt-4 flex items-center gap-2 text-[0.9rem] font-medium text-ink">
                      <span aria-hidden="true">📅</span> {c.scheduleLabel}
                    </p>
                  )}
                  {c.startDate && (
                    <p className="mt-1.5 text-[0.85rem] text-muted">
                      Starts {c.startDate}
                      {c.endDate ? ` · ends ${c.endDate}` : ""}
                      {c.totalDays ? ` · ${c.totalDays} days` : ""}
                    </p>
                  )}
                  {typeof c.seats === "number" && (
                    <p className="mt-1.5 text-[0.85rem] text-muted">
                      {c.seats} seats · kept small so questions get answered
                    </p>
                  )}

                  {!memberActive && (
                    <p className="mt-4 text-[1.05rem] font-semibold text-gold-700">
                      {c.price
                        ? formatPrice(c.price, "ZMW")
                        : "Free with any membership"}
                    </p>
                  )}

                  {c.status !== "completed" && (
                    <div className="mt-5 border-t border-line pt-4">
                      <CohortSignupForm
                        cohortSlug={c.slug}
                        priceLabel={
                          memberActive || !c.price
                            ? "included in membership"
                            : formatPrice(c.price, "ZMW")
                        }
                      />
                    </div>
                  )}
                </section>
              );
            })}
          </div>

          {!memberActive && (
            <div className="mt-12 max-w-3xl rounded-2xl border border-line bg-surface p-7 text-center">
              <p className="text-[1rem] font-semibold text-ink">
                Doing more than one cohort? The membership pays for itself.
              </p>
              <p className="mt-2 text-[0.95rem] text-muted">
                One payment unlocks every published course and a free seat in
                every live class while it is active.
              </p>
              <Link href="/subscribe" className="btn btn-gold mt-5">
                See the membership plans
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
