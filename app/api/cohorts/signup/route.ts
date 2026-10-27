import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/lib/db";
import { cohorts, cohortSignups } from "@/db/schema";

/**
 * POST /api/cohorts/signup
 *
 * "Reserve your seat" for a live cohort. Creates a lead with money attached:
 * George sees it in /admin, confirms the mobile-money payment on WhatsApp and
 * flips the signup to confirmed.
 */
const signupSchema = z.object({
  cohortSlug: z.string().trim().min(1),
  name: z.string().trim().min(1, "Please give a name.").max(120),
  email: z.string().trim().email("Please use a valid email address."),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  message: z.string().trim().max(2000).optional().or(z.literal("")),
});

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const parsed = signupSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Please check the form." },
      { status: 400 },
    );
  }
  const { cohortSlug, name, email, phone, message } = parsed.data;

  const cohort = (
    await db.select().from(cohorts).where(eq(cohorts.slug, cohortSlug))
  )[0];
  if (!cohort || !cohort.isPublished) {
    return NextResponse.json({ error: "Cohort not found." }, { status: 404 });
  }

  await db.insert(cohortSignups).values({
    cohortId: cohort.id,
    name,
    email,
    phone: phone || null,
    message: message || null,
  });

  return NextResponse.json({
    ok: true,
    message:
      "Seat reserved. Send the signup fee to the number George answered on WhatsApp and your seat is confirmed.",
  });
}
