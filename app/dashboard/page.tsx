import Link from "next/link";
import { redirect } from "next/navigation";
import { desc, eq, inArray } from "drizzle-orm";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { pageMeta } from "@/lib/seo";
import { accessOf } from "@/lib/subscription";
import {
  certificates,
  courses,
  enrollments,
  lessonProgress,
  quizAttempts,
} from "@/db/schema";

export const dynamic = "force-dynamic";

export const metadata = pageMeta({
  title: "Dashboard",
  description: "Your learning dashboard on The $100 Guy courses platform.",
  path: "/dashboard",
  noindex: true,
});

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login?next=/dashboard");
  const userId = session.user.id;

  const [myEnrollments, completedLessons, myCertificates, myAttempts] =
    await Promise.all([
      db.query.enrollments.findMany({
        where: eq(enrollments.userId, userId),
        orderBy: [desc(enrollments.enrolledAt)],
      }),
      db.query.lessonProgress.findMany({
        where: eq(lessonProgress.userId, userId),
      }),
      db.query.certificates.findMany({
        where: eq(certificates.userId, userId),
      }),
      db.query.quizAttempts.findMany({
        where: eq(quizAttempts.userId, userId),
        orderBy: [desc(quizAttempts.createdAt)],
      }),
    ]);

  const courseIds = myEnrollments.map((e) => e.courseId);
  const enrolledCourses = courseIds.length
    ? await db.query.courses.findMany({ where: inArray(courses.id, courseIds) })
    : [];
  const courseById = new Map(enrolledCourses.map((c) => [c.id, c]));

  const passed = myAttempts.filter((a) => a.passed).length;
  const member = await accessOf(userId);

  return (
    <div className="section">
      <div className="wrap">
        <span className="eyebrow">Dashboard</span>
        <h1 className="h-display text-[2.1rem] sm:text-[2.6rem]">
          Hello{userName(session.user.name) ? `, ${userName(session.user.name)}` : ""}
        </h1>
        <p className="mt-3 max-w-2xl text-[1rem] text-muted">
          Pick up where you left off, or start something new.
        </p>

        {/* ── membership state — the first thing the student must know ── */}
        {member.status === "active" && member.endsAt ? (
          <div className="mt-7 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-line bg-surface p-6">
            <p className="text-[0.95rem] font-semibold text-ink">
              Membership active until{" "}
              {member.endsAt.toLocaleDateString("en-GB", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
              {member.daysRemaining > 0 ? ` — ${member.daysRemaining} day${member.daysRemaining === 1 ? "" : "s"} left` : ""}
              {" — "}every catalogue course and live cohort seat is open to you.
            </p>
            <Link href="/subscribe" className="btn btn-ghost !py-2.5 !text-[0.9rem]">
              Add more time
            </Link>
          </div>
        ) : member.status === "ended" ? (
          <div className="mt-7 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-line bg-surface p-6">
            <p className="text-[0.95rem] font-semibold text-ink">
              Your plan has ended — your progress and certificates are safe.
            </p>
            <Link href="/subscribe" className="btn btn-gold !py-2.5 !text-[0.9rem]">
              Renew your membership
            </Link>
          </div>
        ) : (
          <div className="mt-7 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-line bg-surface p-6">
            <p className="text-[0.95rem] font-semibold text-ink">
              You are browsing without a membership — one payment unlocks every
              published course.
            </p>
            <Link href="/subscribe" className="btn btn-gold !py-2.5 !text-[0.9rem]">
              Get my membership
            </Link>
          </div>
        )}

        <div className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { k: "Courses enrolled", v: String(myEnrollments.length) },
            { k: "Lessons completed", v: String(completedLessons.length) },
            { k: "Quizzes passed", v: String(passed) },
            { k: "Certificates", v: String(myCertificates.length) },
          ].map((s) => (
            <div
              key={s.k}
              className="card p-6"
            >
              <p className="text-[0.78rem] uppercase tracking-[0.12em] text-muted">
                {s.k}
              </p>
              <p className="mt-1.5 text-[1.9rem] font-semibold text-navy">
                {s.v}
              </p>
            </div>
          ))}
        </div>

        <section className="mt-12">
          <div className="flex items-end justify-between gap-4">
            <h2 className="text-[1.5rem] font-semibold tracking-[-0.01em]">
              Your courses
            </h2>
            <Link
              href="/courses"
              className="text-[0.92rem] font-semibold text-gold-600 hover:text-gold"
            >
              Browse more →
            </Link>
          </div>

          {myEnrollments.length === 0 ? (
            <div className="mt-6 rounded-xl border border-line bg-surface px-6 py-12 text-center">
              <p className="text-[1.05rem] font-semibold">
                You have not enrolled in anything yet
              </p>
              <p className="mx-auto mt-2 max-w-md text-[0.95rem] text-muted">
                Start with Learn to Earn — it is the one that turns a skill
                you already have into your first payment.
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <Link href="/courses/learn-to-earn" className="btn btn-gold">
                  See Learn to Earn
                </Link>
                <Link href="/courses" className="btn btn-ghost">
                  All courses
                </Link>
              </div>
            </div>
          ) : (
            <ul className="mt-6 grid gap-5 sm:grid-cols-2">
              {myEnrollments.map((e) => {
                const course = courseById.get(e.courseId);
                if (!course) return null;
                return (
                  <li key={e.id} className="card p-6">
                    <Link
                      href={`/learn/${course.slug}`}
                      className="text-[1.1rem] font-semibold leading-snug hover:text-gold-600"
                    >
                      {course.title}
                    </Link>
                    <p className="mt-2 line-clamp-2 text-[0.92rem] text-muted">
                      {course.description}
                    </p>
                    <div className="mt-5">
                      <div className="flex justify-between text-[0.82rem] text-muted">
                        <span>Progress</span>
                        <span>{e.progress}%</span>
                      </div>
                      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-line">
                        <div
                          className="h-full rounded-full bg-gold"
                          style={{ width: `${Math.min(100, Math.max(0, e.progress))}%` }}
                        />
                      </div>
                    </div>
                    <Link
                      href={`/learn/${course.slug}`}
                      className="btn btn-navy mt-5 !py-2.5 !px-5 !text-[0.9rem]"
                    >
                      {e.progress > 0 ? "Continue" : "Start course"}
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        {myCertificates.length > 0 && (
          <section className="mt-12">
            <h2 className="text-[1.5rem] font-semibold tracking-[-0.01em]">
              Your certificates
            </h2>
            <ul className="mt-5 space-y-3">
              {myCertificates.map((c) => {
                const course = courseById.get(c.courseId);
                return (
                  <li key={c.id} className="card flex flex-wrap items-center justify-between gap-3 p-5">
                    <div>
                      <p className="font-semibold">
                        {course?.title ?? "Course certificate"}
                      </p>
                      <p className="mt-1 text-[0.85rem] text-muted">
                        Reference {c.reference}
                      </p>
                    </div>
                    <span className="rounded-full bg-surface px-3 py-1.5 text-[0.82rem] text-muted">
                      Issued{" "}
                      {c.issuedAt
                        ? new Date(c.issuedAt).toLocaleDateString("en-GB")
                        : "—"}
                    </span>
                  </li>
                );
              })}
            </ul>
          </section>
        )}
      </div>
    </div>
  );
}

function userName(name?: string | null) {
  if (!name) return "";
  return name.split(" ")[0];
}
