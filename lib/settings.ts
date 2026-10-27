import { and, eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { platformSettings } from "@/db/schema";

/**
 * The site's editable switches: the announcement bar, the WhatsApp line, any
 * future toggle. Rows hold a category + key + JSON value, edited from
 * /admin — the same shape the benchmark stores in `platform_settings`.
 */

export type AnnouncementBar = {
  enabled: boolean;
  text: string;
  href: string;
  cta: string;
};

export type PlatformSettings = {
  announcement: AnnouncementBar;
};

const DEFAULT_ANNOUNCEMENT: AnnouncementBar = {
  enabled: false,
  text: "",
  href: "/subscribe",
  cta: "Reserve your seat →",
};

function parseAnnouncement(raw: unknown): AnnouncementBar {
  if (typeof raw !== "object" || raw === null) return DEFAULT_ANNOUNCEMENT;
  const v = raw as Partial<AnnouncementBar>;
  return {
    enabled: Boolean(v.enabled),
    text: typeof v.text === "string" ? v.text : "",
    href: typeof v.href === "string" && v.href ? v.href : "/subscribe",
    cta: typeof v.cta === "string" && v.cta ? v.cta : DEFAULT_ANNOUNCEMENT.cta,
  };
}

export async function fetchAnnouncement(): Promise<AnnouncementBar> {
  try {
    const row = await db
      .select()
      .from(platformSettings)
      .where(
        and(
          eq(platformSettings.category, "site"),
          eq(platformSettings.key, "announcement_bar"),
        ),
      );
    if (!row[0]) return DEFAULT_ANNOUNCEMENT;
    try {
      return parseAnnouncement(JSON.parse(row[0].value));
    } catch {
      return DEFAULT_ANNOUNCEMENT;
    }
  } catch {
    // The settings table may not exist yet on a fresh database.
    return DEFAULT_ANNOUNCEMENT;
  }
}

export async function saveAnnouncement(value: AnnouncementBar) {
  await db
    .insert(platformSettings)
    .values({
      category: "site",
      key: "announcement_bar",
      value: JSON.stringify(value),
      description: "Top strip shown above the site navigation",
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: [platformSettings.category, platformSettings.key],
      set: {
        value: JSON.stringify(value),
        updatedAt: new Date(),
      },
    });
}
