import { NextResponse } from "next/server";

import { getCourseWithCurriculum } from "@/lib/courses";
import { db } from "@/lib/db";
import { formatPrice } from "@/lib/format";

/**
 * GET /api/course/[slug]
 *
 * A single course with its curriculum and categories. 404 when the slug is
 * unknown or the course is not published.
 */
const handlers = {
  async GET(
    _request: Request,
    { params }: { params: Promise<{ slug: string }> },
  ) {
    const { slug } = await params;

    const result = await getCourseWithCurriculum(slug);
    if (!result) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    const { course, topics, categories } = result;

    if (!course.isPublished) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    const reviews = await db.query.reviews.findMany({
      where: (r, { and, eq }) =>
        and(eq(r.courseId, course.id), eq(r.isApproved, true)),
    });

    return NextResponse.json({
      ...course,
      priceFormatted: formatPrice(course.price, course.currency),
      categories: categories.map((c) => ({ slug: c.slug, name: c.name })),
      topics: topics.map((topic) => ({
        id: topic.id,
        title: topic.title,
        position: topic.position,
        lessons: topic.lessons.map((lesson) => ({
          id: lesson.id,
          title: lesson.title,
          slug: lesson.slug,
          durationMinutes: lesson.durationMinutes,
          isPreview: lesson.isPreview,
          position: lesson.position,
        })),
      })),
      reviews,
    });
  },
};

export const { GET } = handlers;
