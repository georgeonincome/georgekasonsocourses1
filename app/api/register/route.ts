import { NextResponse } from "next/server";
import { z } from "zod";

import { createAccount } from "@/lib/session";

const registerSchema = z.object({
  name: z.string().trim().min(1, "Please give your name.").max(120),
  email: z.string().trim().email("Please give a valid email address."),
  password: z.string().min(8, "Use at least 8 characters.").max(200),
  phone: z.string().trim().max(40).optional(),
});

/**
 * POST /api/register
 *
 * Creates the account. Signing in happens client-side through Auth.js
 * immediately afterwards, so the session cookie is issued by the same
 * code path that handles a normal sign-in.
 */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Please check the form." },
      { status: 400 },
    );
  }

  const result = await createAccount(parsed.data);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 409 });
  }

  return NextResponse.json({ ok: true, email: result.email }, { status: 201 });
}
