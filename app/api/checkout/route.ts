import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { courses, enrollments, orderItems, orders } from "@/db/schema";
import {
  createFlutterwavePayment,
  isFlutterwaveConfigured,
} from "@/lib/flutterwave";

/**
 * POST /api/checkout
 *
 * Body: { slug: string }
 *
 * Free courses are granted immediately. Paid courses create a pending order
 * that an admin marks paid by hand.
 *
 * With FLW_SECRET_KEY set, the order is paid through Flutterwave: the
 * student is sent to the hosted checkout and the webhook grants access.
 * Without it, the order waits for manual approval and the site still works.
 */
const handlers = {
  async POST(request: Request) {
    let body: { slug?: string; phone?: string; name?: string };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    const slug = body?.slug?.trim();
    if (!slug) {
      return NextResponse.json({ error: "slug is required" }, { status: 400 });
    }

    const session = await auth();
    const userId = session?.user?.id;
    const email = session?.user?.email;

    if (!userId) {
      return NextResponse.json(
        { error: "You must be signed in to check out" },
        { status: 401 },
      );
    }

    const course = await db.query.courses.findFirst({
      where: eq(courses.slug, slug),
    });
    if (!course || !course.isPublished) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    const now = new Date();

    if (course.price === 0) {
      const existing = await db.query.enrollments.findFirst({
        where: (e, { and, eq: eEq }) =>
          and(eEq(e.userId, userId), eEq(e.courseId, course.id)),
      });
      if (!existing) {
        await db.insert(enrollments).values({
          userId,
          courseId: course.id,
          status: "active",
          progress: 0,
          enrolledAt: now,
        });
      }
      return NextResponse.json({ status: "ok", immediate: true });
    }

    const reference = `ORD-${userId}-${Date.now()}`;
    const customerEmail = email ?? `${userId}@unknown.local`;
    const customerName = session?.user?.name?.trim() || "Student";
    const customerPhone =
      typeof body?.phone === "string" ? body.phone.trim() : null;

    const [order] = await db
      .insert(orders)
      .values({
        reference,
        userId,
        email: customerEmail,
        status: "pending",
        paymentReference: null,
        paymentProvider: isFlutterwaveConfigured() ? "flutterwave" : "manual",
        total: course.price,
        currency: course.currency,
        createdAt: now,
      })
      .returning();

    await db.insert(orderItems).values({
      orderId: order.id,
      courseId: course.id,
      price: course.price,
      title: course.title,
    });

    // With Flutterwave configured, send the student to the hosted checkout.
    // Without it, the order waits for manual approval — the site still works.
    if (isFlutterwaveConfigured()) {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
      const result = await createFlutterwavePayment({
        txRef: reference,
        amount: course.price / 100,
        currency: course.currency,
        email: customerEmail,
        name: customerName,
        phone: customerPhone,
        description: `Learn2Earn — ${course.title}`,
        redirectUrl: `${appUrl}/checkout/paid?tx_ref=${reference}`,
        orderId: order.id,
      });

      if (result.ok) {
        await db
          .update(orders)
          .set({ paymentReference: result.flwReference || reference })
          .where(eq(orders.id, order.id));
        return NextResponse.json({
          orderId: order.id,
          reference: order.reference,
          paymentUrl: result.paymentUrl,
          provider: "flutterwave",
        });
      }

      // The order stands; the student is not charged. Fall back to manual
      // approval rather than failing the checkout outright.
      await db
        .update(orders)
        .set({ paymentProvider: "manual" })
        .where(eq(orders.id, order.id));
      return NextResponse.json(
        {
          orderId: order.id,
          reference: order.reference,
          orderUrl: "/support?reason=paid",
          provider: "manual",
          warning: `Payment gateway unavailable: ${result.error}`,
        },
        { status: 202 },
      );
    }

    return NextResponse.json({
      orderId: order.id,
      reference: order.reference,
      orderUrl: "/support?reason=paid",
      provider: "manual",
    });
  },
};

export const { POST } = handlers;
