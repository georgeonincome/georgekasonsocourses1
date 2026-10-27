import { desc, eq } from "drizzle-orm";

import { db } from "@/lib/db";
import {
  courses,
  enrollments,
  subscriptionPlans,
  subscriptions,
} from "@/db/schema";

/**
 * Membership is the money spine of Learn2Earn: one payment unlocks every
 * published course for the plan's period — the same model the Click2Skill
 * benchmark sells by ("not one course — everything opens the day you join").
 *
 * Two shapes the rest of the app leans on:
 *
 *  - `accessOf(userId)`            → the honest membership state for a student.
 *  - `grantMembershipFromOrder()`  → the single place an order turns into
 *    access, so the manual-approval button and the payment gateway leave the
 *    database in the same state.
 */

export type MemberAccess = {
  status: "none" | "active" | "ended";
  planCode: string | null;
  planName: string | null;
  startsAt: Date | null;
  endsAt: Date | null;
  /** Whole days left; 0 when not active. */
  daysRemaining: number;
};

export type MembershipPlan = typeof subscriptionPlans.$inferSelect;

const DAY_MS = 24 * 60 * 60 * 1000;

export async function getVisiblePlans(): Promise<{
  all: MembershipPlan[];
  recommended: MembershipPlan | null;
}> {
  const rows = await db
    .select()
    .from(subscriptionPlans)
    .where(eq(subscriptionPlans.isVisible, true));

  return {
    all: rows,
    recommended: rows.find((p) => p.isRecommended) ?? null,
  };
}

export function planFeatures(plan: { features: string }): string[] {
  try {
    const parsed = JSON.parse(plan.features);
    return Array.isArray(parsed) ? (parsed as string[]) : [];
  } catch {
    return [];
  }
}

export async function accessOf(userId: string | null | undefined): Promise<MemberAccess> {
  const none: MemberAccess = {
    status: "none",
    planCode: null,
    planName: null,
    startsAt: null,
    endsAt: null,
    daysRemaining: 0,
  };
  if (!userId) return none;

  const subs = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.userId, userId))
    .orderBy(desc(subscriptions.endsAt));

  const active = subs.find(
    (s) =>
      new Date(s.endsAt).getTime() > Date.now() && s.status !== "cancelled",
  );
  if (!active) return { ...none, status: subs.length ? "ended" : "none" };

  const endsAt = new Date(active.endsAt);
  const daysRemaining = Math.max(
    0,
    Math.ceil((endsAt.getTime() - Date.now()) / DAY_MS),
  );

  const planRows = await db
    .select()
    .from(subscriptionPlans)
    .where(eq(subscriptionPlans.code, active.planCode));

  return {
    status: "active",
    planCode: active.planCode,
    planName: planRows[0]?.name ?? active.planCode,
    startsAt: new Date(active.startsAt),
    endsAt,
    daysRemaining,
  };
}

/**
 * Turn a paid membership order into access.
 *
 *  - No buyer record yet → the caller must have created one first; the order's
 *    `userId` is required.
 *  - Renewing buyer → the new window is written after the current one.
 *    Days stack, so an early renewal of a longer plan never costs the buyer
 *    the days they already have.
 *  - Every published course gets an enrollment row, so "My courses", progress
 *    and reviews all treat the catalogue like any library.
 */
export async function grantMembershipFromOrder(order: {
  id: number;
  userId: string | null;
  email: string;
  productSlug: string | null;
}) {
  if (!order.userId) {
    return { granted: false as const, reason: "no-user" as const };
  }

  const planCode = order.productSlug ?? "quarterly";
  const plan = (
    await db
      .select()
      .from(subscriptionPlans)
      .where(eq(subscriptionPlans.code, planCode))
  )[0];
  if (!plan) {
    return { granted: false as const, reason: "unknown-plan" as const };
  }

  const now = new Date();
  const current = await accessOf(order.userId);
  const startsAt =
    current.status === "active" && current.endsAt && current.endsAt > now
      ? current.endsAt
      : now;
  const endsAt = new Date(startsAt.getTime() + plan.durationDays * DAY_MS);

  await db.insert(subscriptions).values({
    userId: order.userId,
    planCode,
    orderId: order.id,
    startsAt,
    endsAt,
    status: "active",
  });

  const catalogue = await db
    .select({ id: courses.id })
    .from(courses)
    .where(eq(courses.isPublished, true));

  let enrolled = 0;
  for (const course of catalogue) {
    const existing = await db.query.enrollments.findFirst({
      where: (e, { and: andOp }) =>
        andOp(
          eq(enrollments.userId, order.userId!),
          eq(enrollments.courseId, course.id),
        ),
    });
    if (existing) continue;
    await db
      .insert(enrollments)
      .values({
        userId: order.userId,
        courseId: course.id,
        orderId: order.id,
        status: "active",
        progress: 0,
        enrolledAt: now,
      });
    enrolled++;
  }

  return { granted: true as const, planCode, endsAt, enrolled };
}


