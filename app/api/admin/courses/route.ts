import { NextResponse } from "next/server";
import { asc } from "drizzle-orm";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { categories, courseCategories, courses } from "@/db/schema";

/**
 * GET /api/admin/courses
 *
 * Admin-only. Every course with the fields the management view needs.
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

    const [rows, links, categoryList] = await Promise.all([
      db.query.courses.findMany({ orderBy: [asc(courses.createdAt)] }),
      db.query.courseCategories.findMany(),
      db.query.categories.findMany(),
    ]);

    const categoryById = new Map(categoryList.map((c) => [c.id, c]));
    const categoryByCourse = new Map<number, string[]>();
    for (const link of links) {
      const cat = categoryById.get(link.categoryId);
      if (!cat) continue;
      const list = categoryByCourse.get(link.courseId) ?? [];
      list.push(cat.slug);
      categoryByCourse.set(link.courseId, list);
    }

    return NextResponse.json(
      rows.map((course) => ({
        id: course.id,
        slug: course.slug,
        title: course.title,
        description: course.description,
        price: course.price,
        currency: course.currency,
        category: categoryByCourse.get(course.id)?.[0] ?? null,
        level: course.level,
        isPublished: course.isPublished,
        isFeatured: course.isFeatured,
        lessonCount: course.lessonCount,
        enrollmentCount: course.enrollmentCount,
      })),
    );
  },
};

export const { GET } = handlers;
