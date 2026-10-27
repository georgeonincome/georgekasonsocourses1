import { NextResponse } from "next/server";

import { getAllCourses } from "@/lib/courses";
import { db } from "@/lib/db";
import { formatPrice } from "@/lib/format";

/**
 * GET /api/courses
 *
 * Lists the published catalogue. Optional query filters:
 *   ?category=<category slug>   ?level=<beginner|intermediate|advanced|all-levels>
 *   ?search=<free text>
 */
const handlers = {
  async GET(request: Request) {
    const url = new URL(request.url);
    const category = url.searchParams.get("category")?.trim().toLowerCase();
    const level = url.searchParams.get("level")?.trim().toLowerCase();
    const search = url.searchParams.get("search")?.trim().toLowerCase();

    const [all, links, categoryList] = await Promise.all([
      getAllCourses(),
      db.query.courseCategories.findMany(),
      db.query.categories.findMany(),
    ]);

    const categoryById = new Map(categoryList.map((c) => [c.id, c]));

    /** courseId -> category slugs */
    const slugsByCourse = new Map<number, string[]>();
    for (const link of links) {
      const cat = categoryById.get(link.categoryId);
      if (!cat) continue;
      const list = slugsByCourse.get(link.courseId) ?? [];
      list.push(cat.slug);
      slugsByCourse.set(link.courseId, list);
    }

    let list = all;

    if (category) {
      list = list.filter((course) =>
        (slugsByCourse.get(course.id) ?? []).includes(category),
      );
    }

    if (level) {
      list = list.filter((course) => course.level === level);
    }

    if (search) {
      list = list.filter((course) =>
        [course.title, course.subtitle, course.description].some((field) =>
          field?.toLowerCase().includes(search),
        ),
      );
    }

    return NextResponse.json(
      list.map((course) => ({
        ...course,
        category: slugsByCourse.get(course.id)?.[0] ?? null,
        priceFormatted: formatPrice(course.price, course.currency),
      })),
    );
  },
};

export const { GET } = handlers;
