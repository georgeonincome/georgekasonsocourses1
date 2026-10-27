import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { courses, reviews } from "@/db/schema";

/**
 * POST /api/reviews/submit
 *
 * Body: { authorName, authorRole?, courseSlug?, rating (1-5), title?, content }
 *
 * Open to the public. New reviews land unapproved and are moderated by an
 * admin before they appear anywhere on the site.
 */
const handlers = {
  async POST(request: Request) {
    let body: {
      authorName?: string;
      authorRole?: string;
      courseSlug?: string;
      rating?: number;
      title?: string;
      content?: string;
    };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    const authorName = body?.authorName?.trim();
    if (!authorName) {
      return NextResponse.json(
        { error: "authorName is required" },
        { status: 400 },
      );
    }

    const content = body?.content?.trim();
    if (!content) {
      return NextResponse.json(
        { error: "content is required" },
        { status: 400 },
      );
    }

    const ratingRaw = Number(body?.rating);
    if (!Number.isFinite(ratingRaw)) {
      return NextResponse.json(
        { error: "rating must be a number between 1 and 5" },
        { status: 400 },
      );
    }
    const rating = Math.min(5, Math.max(1, Math.round(ratingRaw)));

    let courseId: number | null = null;
    const courseSlug = body?.courseSlug?.trim();
    if (courseSlug) {
      const course = await db.query.courses.findFirst({
        where: eq(courses.slug, courseSlug),
        columns: { id: true },
      });
      if (!course) {
        return NextResponse.json(
          { error: "Course not found" },
          { status: 404 },
        );
      }
      courseId = course.id;
    }

    const [row] = await db
      .insert(reviews)
      .values({
        courseId,
        userId: null,
        authorName,
        authorRole: body?.authorRole?.trim() || null,
        rating,
        title: body?.title?.trim() || null,
        content,
        isApproved: false,
      })
      .returning({ id: reviews.id });

    return NextResponse.json({ ok: true, id: row.id }, { status: 201 });
  },
};

export const { POST } = handlers;
