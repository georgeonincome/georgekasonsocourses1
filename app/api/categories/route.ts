import { NextResponse } from "next/server";

import { getCategories } from "@/lib/courses";

/** GET /api/categories — the course categories, in display order. */
const handlers = {
  async GET() {
    const categories = await getCategories();
    return NextResponse.json(categories);
  },
};

export const { GET } = handlers;
