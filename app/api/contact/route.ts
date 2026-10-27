import { NextResponse } from "next/server";
import { z } from "zod";

const contactSchema = z.object({
  name: z.string().trim().min(1, "Please give a name.").max(120),
  email: z.string().trim().email("Please give a valid email address."),
  subject: z.string().trim().min(1).max(160),
  message: z.string().trim().min(10, "Please write a little more.").max(4000),
});

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Please check the form." },
      { status: 400 },
    );
  }

  const { name, email, subject, message } = parsed.data;

  // No mail provider is configured yet, so the message is written to the
  // server log rather than silently dropped. Wire a provider here and this
  // becomes the only line that changes.
  console.log(
    `[contact] ${new Date().toISOString()} from ${name} <${email}> — ${subject}\n${message}`,
  );

  return NextResponse.json({ ok: true });
}
