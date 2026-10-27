import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { reviews } from "@/db/schema";

/**
 * PATCH /api/admin/reviews/[id]/approve
 *
 * Admin-only. Approves a submitted review so it appears on the site.
 */
const handlers = {
  async PATCH(
    _request: Request,
    { params }: { params: Promise<{ id: string }> },
  ) {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "You must be signed in" },
        { status: 401 },
      );
    }
    if (session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 },
      );
    }

    const { id } = await params;
    const reviewId = Number(id);
    if (!Number.isInteger(reviewId) || reviewId <= 0) {
      return NextResponse.json({ error: "Invalid review id" }, { status: 400 });
    }

    const review = await db.query.reviews.findFirst({
      where: eq(reviews.id, reviewId),
    });
    if (!review) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }

    const [updated] = await db
      .update(reviews)
      .set({ isApproved: true })
      .where(eq(reviews.id, reviewId))
      .returning();

    return NextResponse.json({ ok: true, review: updated });
  },
};

export const { PATCH } = handlers;
