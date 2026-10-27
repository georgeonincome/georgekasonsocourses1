import { eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { enrollments, orderItems, orders } from "@/db/schema";
import { grantMembershipFromOrder } from "@/lib/subscription";

/**
 * The single place a paid order turns into access. The manual-approval
 * button, the gateway webhook and any future auto-confirm all funnel through
 * this — otherwise two payment paths leave the database in two different
 * states, and a real buyer ends up locked out of something they paid for.
 *
 * A membership order (kind: "membership") creates or renews a subscription
 * and enrols the buyer into every published course. A course order grants
 * the enrolments listed on it.
 */
export async function fulfilOrder(orderId: number) {
  const order = await db.query.orders.findFirst({
    where: eq(orders.id, orderId),
  });
  if (!order) return { order: null, granted: 0 };

  if (order.status === "paid") {
    // Already fulfilled — believable on webhook retries. Idempotent.
    return { order, granted: 0, already: true };
  }

  const paymentReference =
    order.paymentReference ?? `MANUAL-${order.reference}`;
  const now = new Date();

  const [updated] = await db
    .update(orders)
    .set({
      status: "paid",
      paymentReference,
      paidAt: now,
    })
    .where(eq(orders.id, order.id))
    .returning();

  if (order.kind === "membership") {
    const result = await grantMembershipFromOrder({
      id: order.id,
      userId: order.userId,
      email: order.email,
      productSlug: order.productSlug,
    });
    return {
      order: updated,
      granted: "granted" in result && result.granted ? 1 : 0,
    };
  }

  const items = await db.query.orderItems.findMany({
    where: eq(orderItems.orderId, order.id),
  });

  let granted = 0;
  for (const item of items) {
    if (!order.userId) continue;
    const existing = await db.query.enrollments.findFirst({
      where: (e, { and, eq: eEq }) =>
        and(eEq(e.userId, order.userId!), eEq(e.courseId, item.courseId)),
    });
    if (existing) continue;
    await db.insert(enrollments).values({
      userId: order.userId,
      courseId: item.courseId,
      orderId: order.id,
      status: "active",
      progress: 0,
      enrolledAt: now,
    });
    granted++;
  }

  return { order: updated, granted };
}
