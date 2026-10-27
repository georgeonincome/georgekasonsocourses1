import { NextResponse } from "next/server";
import { desc } from "drizzle-orm";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { reviews } from "@/db/schema";

/**
 * GET /api/admin/reviews
 *
 * Admin-only. Every review — approved or not — newest first, so a moderator
 * can clear the queue.
 */
const handlers = {
  async GET() {
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

    const rows = await db.query.reviews.findMany({
      orderBy: [desc(reviews.createdAt)],
      limit: 100,
    });

    const courseRows = await db.query.courses.findMany({
      columns: { id: true, slug: true },
    });
    const slugById = new Map(courseRows.map((c) => [c.id, c.slug]));

    return NextResponse.json(
      rows.map((r) => ({
        id: r.id,
        authorName: r.authorName,
        authorRole: r.authorRole,
        rating: r.rating,
        title: r.title,
        content: r.content,
        isApproved: r.isApproved,
        courseSlug: r.courseId ? (slugById.get(r.courseId) ?? null) : null,
        createdAt: r.createdAt,
      })),
    );
  },
};

export const { GET } = handlers;
