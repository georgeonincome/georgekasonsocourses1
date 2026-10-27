import { redirect } from "next/navigation";
import Link from "next/link";
import { desc, eq } from "drizzle-orm";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  categories,
  cohortSignups,
  cohorts,
  courseCategories,
  courses,
  enrollments,
  orders,
  reviews,
} from "@/db/schema";
import { formatPrice } from "@/lib/format";
import { fetchAnnouncement } from "@/lib/settings";
import { ReviewCard } from "@/components/review-card";
import { ApproveReviewButton } from "@/components/approve-review-button";
import { AnnouncementEditor } from "@/components/announcement-editor";
import { MarkPaidButton } from "@/components/mark-paid-button";
import { pageMeta } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata = pageMeta({
  title: "Admin",
  description: "Administration area for The $100 Guy courses platform.",
  path: "/admin",
  noindex: true,
});

export default async function AdminPage() {
  const session = await auth();
  if (!session?.user) redirect("/login?next=/admin");
  if (session.user.role !== "admin") redirect("/dashboard");

  const [announcement, pending, orderRows, courseRows, enrollmentRows, linkRows, categoryRows, signupRows, cohortRows] =
    await Promise.all([
    fetchAnnouncement(),
    db.query.reviews.findMany({
      where: eq(reviews.isApproved, false),
      orderBy: [desc(reviews.createdAt)],
    }),
    db.query.orders.findMany({ orderBy: [desc(orders.createdAt)], limit: 50 }),
    db.query.courses.findMany({ orderBy: [desc(courses.enrollmentCount)] }),
    db.query.enrollments.findMany(),
    db.query.courseCategories.findMany(),
    db.query.categories.findMany(),
    db.query.cohortSignups.findMany({
      orderBy: [desc(cohortSignups.createdAt)],
      limit: 50,
    }),
    db.query.cohorts.findMany(),
  ]);

  const cohortById = new Map(cohortRows.map((c) => [c.id, c]));
  const planLabelByCode = new Map(
    (
      await db.query.subscriptionPlans.findMany()
    ).map((p) => [p.code, p.name]),
  );

  const categoryNameById = new Map(categoryRows.map((c) => [c.id, c.name]));
  const categoryByCourse = new Map<number, string>();
  for (const link of linkRows) {
    const name = categoryNameById.get(link.categoryId);
    if (name && !categoryByCourse.has(link.courseId)) {
      categoryByCourse.set(link.courseId, name);
    }
  }

  const revenue = orderRows
    .filter((o) => o.status === "paid")
    .reduce((n, o) => n + o.total, 0);

  return (
    <div className="section">
      <div className="wrap">
        <Revealish>
          <span className="eyebrow">Admin</span>
          <h1 className="h-display text-[2.1rem] sm:text-[2.6rem]">
            Control room
          </h1>
          <p className="mt-3 max-w-2xl text-[1rem] text-muted">
            The money and the approvals: pending orders and memberships,
            cohort seat reservations, the announcement strip, and reviews
            waiting on you. A pending order opens the student's courses the
            moment you confirm it here.
          </p>
        </Revealish>

        {/* ── stats ───────────────────────────────────────────────────── */}
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { k: "Courses", v: String(courseRows.length) },
            { k: "Enrolments", v: String(enrollmentRows.length) },
            { k: "Pending reviews", v: String(pending.length) },
            {
              k: "Paid revenue",
              v: formatPrice(revenue, "ZMW"),
            },
          ].map((s) => (
            <div key={s.k} className="stat-card !border-line !bg-white !text-ink">
              <p className="text-[0.78rem] uppercase tracking-[0.12em] text-muted">
                {s.k}
              </p>
              <p className="mt-1.5 text-[1.7rem] font-semibold text-navy">
                {s.v}
              </p>
            </div>
          ))}
        </div>

        {/* ── review queue ────────────────────────────────────────────── */}
        <section className="mt-14">
          <h2 className="text-[1.5rem] font-semibold tracking-[-0.01em]">
            Review queue
          </h2>
          <p className="mt-2 text-[0.95rem] text-muted">
            {pending.length
              ? `${pending.length} submission${pending.length === 1 ? "" : "s"} waiting for a decision.`
              : "Nothing waiting. New submissions land here."}
          </p>

          {pending.length === 0 ? (
            <p className="mt-6 rounded-xl border border-line bg-surface px-5 py-6 text-[0.95rem] text-muted">
              The queue is empty. New student submissions land here waiting
              for your decision.
            </p>
          ) : (
            <div className="mt-6 grid gap-5 lg:grid-cols-2">
              {pending.map((r) => (
                <div key={r.id} className="card p-6">
                  <ReviewCard review={r} />
                  <div className="mt-5 flex gap-3 border-t border-line pt-4">
                    <ApproveReviewButton reviewId={r.id} />
                    <Link
                      href={`/api/admin/reviews/${r.id}/approve`}
                      className="text-[0.9rem] text-muted hover:text-ink"
                    >
                      Review rules
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ── announcement bar ───────────────────────────────────────── */}
        <section className="mt-14">
          <h2 className="text-[1.5rem] font-semibold tracking-[-0.01em]">
            Announcement bar
          </h2>
          <p className="mt-2 max-w-2xl text-[0.95rem] text-muted">
            The strip above the header, shown on every page. Use it for cohort
            opens, price promos, anything time-sensitive. Turn it off and the
            strip disappears everywhere at once.
          </p>
          <AnnouncementEditor initial={announcement} />
        </section>

        {/* ── cohorts ─────────────────────────────────────────────────── */}
        <section className="mt-14">
          <h2 className="text-[1.5rem] font-semibold tracking-[-0.01em]">
            Cohort seat reservations
          </h2>
          <p className="mt-2 max-w-2xl text-[0.95rem] text-muted">
            "Reserve your seat" leads from the live-classes page. Confirm each
            lead's payment on WhatsApp, then flip the status to{" "}
            <code className="rounded bg-surface px-1.5 py-0.5 text-[0.85rem]">
              confirmed
            </code>{" "}
            in the database so the spot count stays honest.
          </p>
          {signupRows.length === 0 ? (
            <p className="mt-6 rounded-xl border border-line bg-surface px-5 py-6 text-[0.95rem] text-muted">
              No seat reservations yet.
            </p>
          ) : (
            <div className="mt-6 overflow-x-auto">
              <table className="w-full min-w-[680px] border-collapse text-left text-[0.92rem]">
                <thead>
                  <tr className="border-b border-line text-[0.78rem] uppercase tracking-[0.1em] text-muted">
                    <th className="py-3 pr-4 font-medium">Cohort</th>
                    <th className="py-3 pr-4 font-medium">Name</th>
                    <th className="py-3 pr-4 font-medium">Email</th>
                    <th className="py-3 pr-4 font-medium">Phone</th>
                    <th className="py-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {signupRows.map((s) => (
                    <tr key={s.id} className="border-b border-line/70">
                      <td className="py-3 pr-4 font-medium">
                        {cohortById.get(s.cohortId)?.title ?? "—"}
                      </td>
                      <td className="py-3 pr-4">{s.name}</td>
                      <td className="py-3 pr-4">{s.email}</td>
                      <td className="py-3 pr-4 text-muted">{s.phone ?? "—"}</td>
                      <td className="py-3">
                        <span
                          className={`rounded-full px-2.5 py-1 text-[0.75rem] font-medium ${
                            s.status === "confirmed"
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-amber-50 text-amber-700"
                          }`}
                        >
                          {s.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* ── orders ──────────────────────────────────────────────────── */}
        <section className="mt-14">
          <h2 className="text-[1.5rem] font-semibold tracking-[-0.01em]">
            Orders &amp; memberships
          </h2>
          {orderRows.length === 0 ? (
            <p className="mt-4 text-[0.95rem] text-muted">
              No orders yet. A checkout or membership signup creates one in{" "}
              <code className="rounded bg-surface px-1.5 py-0.5 text-[0.85rem]">
                pending
              </code>{" "}
              until a payment is confirmed.
            </p>
          ) : (
            <div className="mt-6 overflow-x-auto">
              <table className="w-full min-w-[760px] border-collapse text-left text-[0.92rem]">
                <thead>
                  <tr className="border-b border-line text-[0.78rem] uppercase tracking-[0.1em] text-muted">
                    <th className="py-3 pr-4 font-medium">Reference</th>
                    <th className="py-3 pr-4 font-medium">Email</th>
                    <th className="py-3 pr-4 font-medium">Kind</th>
                    <th className="py-3 pr-4 font-medium">Status</th>
                    <th className="py-3 pr-4 font-medium">Total</th>
                    <th className="py-3 pr-4 font-medium">Created</th>
                    <th className="py-3 font-medium">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {orderRows.map((o) => (
                    <tr key={o.id} className="border-b border-line/70">
                      <td className="py-3 pr-4 font-mono text-[0.85rem]">
                        {o.reference}
                      </td>
                      <td className="py-3 pr-4">
                        {o.email}{" "}
                        {o.kind === "membership" ? (
                          <span className="mt-0.5 block text-[0.78rem] text-muted">
                            membership ·{" "}
                            {planLabelByCode.get(o.productSlug ?? "") ??
                              o.productSlug ??
                              "—"}
                          </span>
                        ) : null}
                      </td>
                      <td className="py-3 pr-4">
                        <span
                          className={`rounded-full px-2.5 py-1 text-[0.75rem] font-medium ${
                            o.kind === "membership"
                              ? "bg-sky-50 text-sky-700"
                              : "bg-surface text-muted"
                          }`}
                        >
                          {o.kind === "membership" ? "membership" : "course"}
                        </span>
                      </td>
                      <td className="py-3 pr-4">
                        <span
                          className={`rounded-full px-2.5 py-1 text-[0.75rem] font-medium ${
                            o.status === "paid"
                              ? "bg-emerald-50 text-emerald-700"
                              : o.status === "pending"
                                ? "bg-amber-50 text-amber-700"
                                : "bg-surface text-muted"
                          }`}
                        >
                          {o.status}
                        </span>
                      </td>
                      <td className="py-3 pr-4 font-medium">
                        {formatPrice(o.total, o.currency)}
                      </td>
                      <td className="py-3 pr-4 text-muted">
                        {o.createdAt
                          ? new Date(o.createdAt).toLocaleDateString("en-GB")
                          : "—"}
                      </td>
                      <td className="py-3">
                        {o.status === "paid" ? (
                          <span className="text-[0.82rem] text-muted">
                            Unlocked
                          </span>
                        ) : (
                          <MarkPaidButton orderId={o.id} />
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* ── courses ─────────────────────────────────────────────────── */}
        <section className="mt-14">
          <h2 className="text-[1.5rem] font-semibold tracking-[-0.01em]">
            Catalogue
          </h2>
          <div className="mt-6 overflow-x-auto">
            <table className="w-full min-w-[720px] border-collapse text-left text-[0.92rem]">
              <thead>
                <tr className="border-b border-line text-[0.78rem] uppercase tracking-[0.1em] text-muted">
                  <th className="py-3 pr-4 font-medium">Course</th>
                  <th className="py-3 pr-4 font-medium">Category</th>
                  <th className="py-3 pr-4 font-medium">Level</th>
                  <th className="py-3 pr-4 font-medium">Price</th>
                  <th className="py-3 pr-4 font-medium">Lessons</th>
                  <th className="py-3 font-medium">Published</th>
                </tr>
              </thead>
              <tbody>
                {courseRows.map((c) => (
                  <tr key={c.id} className="border-b border-line/70">
                    <td className="py-3 pr-4 font-medium">
                      <Link
                        href={`/courses/${c.slug}`}
                        className="hover:text-gold-600"
                      >
                        {c.title}
                      </Link>
                    </td>
                    <td className="py-3 pr-4 text-muted">
                      {categoryByCourse.get(c.id) ?? "—"}
                    </td>
                    <td className="py-3 pr-4 text-muted">{c.level}</td>
                    <td className="py-3 pr-4 font-medium">
                      {formatPrice(c.price, c.currency)}
                    </td>
                    <td className="py-3 pr-4 text-muted">{c.lessonCount}</td>
                    <td className="py-3">
                      <span
                        className={`rounded-full px-2.5 py-1 text-[0.75rem] font-medium ${
                          c.isPublished
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-surface text-muted"
                        }`}
                      >
                        {c.isPublished ? "live" : "draft"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}

function Revealish({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
