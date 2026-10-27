import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { courses, enrollments, orders } from "@/db/schema";

/**
 * POST /api/enroll
 *
 * Body: { slug: string, token?: string }
 *
 * Enrols the signed-in learner in a published course and records a pending
 * order (no payment gateway is wired up yet — an admin marks the order paid
 * by hand). Responds 201 with the new enrolment id.
 */
const handlers = {
  async POST(request: Request) {
    let body: { slug?: string; token?: string };
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
        { error: "You must be signed in to enrol" },
        { status: 401 },
      );
    }

    const course = await db.query.courses.findFirst({
      where: eq(courses.slug, slug),
    });
    if (!course || !course.isPublished) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    const existing = await db.query.enrollments.findFirst({
      where: and(
        eq(enrollments.userId, userId),
        eq(enrollments.courseId, course.id),
      ),
    });
    if (existing) {
      return NextResponse.json(
        { error: "You are already enrolled in this course" },
        { status: 409 },
      );
    }

    const now = new Date();
    const reference = `ORD-${userId}-${slug}-${Date.now()}`;

    const [order] = await db
      .insert(orders)
      .values({
        reference,
        userId,
        email: email ?? `${userId}@unknown.local`,
        status: "pending",
        paymentProvider: "manual",
        total: course.price,
        currency: course.currency,
        createdAt: now,
      })
      .returning();

    const [enrollment] = await db
      .insert(enrollments)
      .values({
        userId,
        courseId: course.id,
        orderId: order.id,
        status: "active",
        progress: 0,
        enrolledAt: now,
      })
      .returning();

    return NextResponse.json({ enrollmentId: enrollment.id }, { status: 201 });
  },
};

export const { POST } = handlers;
