import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { and, eq } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/lib/db";
import { platformSettings } from "@/db/schema";
import { saveAnnouncement } from "@/lib/settings";

/**
 * announces the strip above the header. Admin-only. One row in
 * platform_settings (category "site", key "announcement_bar").
 */
const barSchema = z.object({
  enabled: z.boolean(),
  text: z.string().trim().max(160),
  href: z.string().trim().max(160).optional().or(z.literal("")),
  cta: z.string().trim().max(40).optional().or(z.literal("")),
});

export async function GET() {
  const session = await auth();
  if (session?.user?.role !== "admin") {
    return NextResponse.json({ error: "Admin only." }, { status: 403 });
  }
  const row = (
    await db
      .select()
      .from(platformSettings)
      .where(
        and(
          eq(platformSettings.category, "site"),
          eq(platformSettings.key, "announcement_bar"),
        ),
      )
  )[0];
  return NextResponse.json({
    announcement: row ? JSON.parse(row.value) : { enabled: false, text: "" },
  });
}

export async function POST(request: Request) {
  const session = await auth();
  if (session?.user?.role !== "admin") {
    return NextResponse.json({ error: "Admin only." }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const parsed = barSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Please check the form." },
      { status: 400 },
    );
  }

  await saveAnnouncement({
    enabled: parsed.data.enabled,
    text: parsed.data.text,
    href: parsed.data.href || "/cohorts",
    cta: parsed.data.cta || "See more →",
  });

  return NextResponse.json({ ok: true });
}
