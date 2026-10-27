import { and, asc, desc, eq, sql } from "drizzle-orm";

import { db } from "@/lib/db";
import {
  categories,
  courseCategories,
  courses,
  enrollments,
  reviews,
  topics,
  lessons,
} from "@/db/schema";
import type { Course } from "@/db/schema";

export async function getAllCourses(opts: { publishedOnly?: boolean } = {}) {
  return db.query.courses.findMany({
    where: opts.publishedOnly === false ? undefined : eq(courses.isPublished, true),
    orderBy: [asc(courses.createdAt)],
  });
}

export async function getCourseBySlug(slug: string) {
  return db.query.courses.findFirst({ where: eq(courses.slug, slug) });
}

export async function getCourseWithCurriculum(slug: string) {
  const course = await getCourseBySlug(slug);
  if (!course) return null;

  const courseTopics = await db.query.topics.findMany({
    where: eq(topics.courseId, course.id),
    orderBy: [asc(topics.position)],
  });

  const withLessons = await Promise.all(
    courseTopics.map(async (t) => ({
      ...t,
      lessons: await db.query.lessons.findMany({
        where: eq(lessons.topicId, t.id),
        orderBy: [asc(lessons.position)],
      }),
    })),
  );

  const categoryRows = await db.query.courseCategories.findMany({
    where: eq(courseCategories.courseId, course.id),
  });

  const categoryList = categoryRows.length
    ? await db.query.categories.findMany({
        where: sql`id IN ${categoryRows.map((r) => r.categoryId)}`,
      })
    : [];

  return { course, topics: withLessons, categories: categoryList };
}

export async function getCategories() {
  return db.query.categories.findMany({ orderBy: [asc(categories.position)] });
}

export async function getCourseCategoriesMap() {
  const rows = await db.query.courseCategories.findMany();
  const map = new Map<number, string[]>();
  for (const r of rows) {
    const list = map.get(r.courseId) ?? [];
    list.push(String(r.categoryId));
    map.set(r.courseId, list);
  }
  return map;
}

export async function getReviewsForCourse(courseId: number) {
  return db.query.reviews.findMany({
    where: and(eq(reviews.courseId, courseId), eq(reviews.isApproved, true)),
    orderBy: [desc(reviews.createdAt)],
  });
}

export async function getEnrollmentsForUser(userId: string) {
  return db.query.enrollments.findMany({
    where: eq(enrollments.userId, userId),
    orderBy: [desc(enrollments.enrolledAt)],
  });
}

export async function getEnrolledCourseSlugs(userId: string) {
  const rows = await db.query.enrollments.findMany({
    where: eq(enrollments.userId, userId),
  });
  return new Set(rows.map((r) => r.courseId));
}

export function averageRating(course: Pick<Course, "ratingSum" | "ratingCount">) {
  if (!course.ratingCount) return null;
  return course.ratingSum / course.ratingCount;
}
