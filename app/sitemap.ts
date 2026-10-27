import type { MetadataRoute } from "next";
import { asc, eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { categories, courses } from "@/db/schema";
import { SITE_URL } from "@/lib/seo";

/**
 * Sitemap.
 *
 * `lastmod` comes from the row's own updatedAt — Google uses it to decide what
 * to re-crawl, and it is the cheapest signal available for a catalogue that
 * changes rarely but meaningfully.
 *
 * Course entries carry their image when one exists. An image sitemap entry is
 * what puts a course into Google Images, which is a real source of discovery
 * for "graphic design course Lusaka" style searches.
 */

const BASE = SITE_URL;

export const dynamic = "force-static";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [courseRows, categoryRows] = await Promise.all([
    db.query.courses.findMany({
      where: eq(courses.isPublished, true),
      orderBy: [asc(courses.createdAt)],
    }),
    db.query.categories.findMany({ orderBy: [asc(categories.position)] }),
  ]);

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${BASE}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${BASE}/subscribe`, changeFrequency: "weekly", priority: 0.95 },
    { url: `${BASE}/courses`, changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE}/cohorts`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE}/reviews`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE}/about`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE}/faq`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE}/contact`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE}/support`, changeFrequency: "monthly", priority: 0.4 },
    { url: `${BASE}/privacy`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${BASE}/terms`, changeFrequency: "yearly", priority: 0.2 },
  ];

  return [
    ...staticRoutes,
    ...courseRows.map((c) => ({
      url: `${BASE}/courses/${c.slug}`,
      lastModified: c.updatedAt ?? c.createdAt ?? new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
      images: c.image ? [c.image] : [],
    })),
    ...categoryRows.map((c) => ({
      url: `${BASE}/courses?category=${c.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
  ];
}
