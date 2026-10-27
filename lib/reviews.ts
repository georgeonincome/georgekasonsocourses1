import { and, desc, eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { reviews } from "@/db/schema";
import type { Review } from "@/db/schema";

/**
 * Reviews that are approved and published to the site.
 */
export async function getPublishedReviews(limit = 12) {
  const rows = await db
    .select()
    .from(reviews)
    .where(eq(reviews.isApproved, true))
    .orderBy(desc(reviews.createdAt))
    .limit(limit);
  return rows;
}

export async function getReviewsForCourse(courseId: number) {
  const rows = await db
    .select()
    .from(reviews)
    .where(and(eq(reviews.courseId, courseId), eq(reviews.isApproved, true)))
    .orderBy(desc(reviews.createdAt));
  return rows;
}

export type PublishedReview = Pick<
  Review,
  | "id"
  | "courseId"
  | "authorName"
  | "authorRole"
  | "rating"
  | "title"
  | "content"
  | "isFeatured"
  | "createdAt"
>;

export function reviewAverage(rows: PublishedReview[]) {
  if (!rows.length) return null;
  const sum = rows.reduce((n, r) => n + r.rating, 0);
  return sum / rows.length;
}

export function reviewBreakdown(rows: PublishedReview[]) {
  const buckets = [5, 4, 3, 2, 1].map((stars) => ({
    stars,
    count: rows.filter((r) => r.rating === stars).length,
  }));
  const total = rows.length || 1;
  return buckets.map((b) => ({ ...b, percent: Math.round((b.count / total) * 100) }));
}
