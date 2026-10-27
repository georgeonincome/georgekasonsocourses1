import { db } from "@/lib/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { hashPassword } from "@/lib/password";
import { randomUUID } from "node:crypto";

/**
 * A small, explicit account layer for email + password.
 *
 * Auth.js owns the session cookie and the OAuth flows; this module owns
 * creating accounts and checking credentials, because the credentials
 * provider in Auth.js refuses to create users (that is the point of it).
 * The two meet at `authorize`, which calls `verifyCredentials` here.
 */

export async function createAccount(input: {
  name: string;
  email: string;
  password: string;
  phone?: string | null;
}) {
  const email = input.email.trim().toLowerCase();
  const existing = await db.query.users.findFirst({
    where: (u, { eq: e }) => e(u.email, email),
  });
  if (existing) {
    return { ok: false as const, error: "An account with that email exists." };
  }

  const id = randomUUID();
  await db.insert(users).values({
    id,
    name: input.name.trim() || email.split("@")[0],
    email,
    passwordHash: await hashPassword(input.password),
    role: "student",
    phone: input.phone?.trim() || null,
  });

  return { ok: true as const, id, email };
}

export async function verifyCredentials(email: string, password: string) {
  const user = await db.query.users.findFirst({
    where: (u, { eq: e }) => e(u.email, email.trim().toLowerCase()),
  });
  if (!user?.passwordHash) return null;
  const { verifyPassword } = await import("@/lib/password");
  const ok = await verifyPassword(password, user.passwordHash);
  if (!ok) return null;
  return user;
}

export async function getUserById(id: string) {
  return db.query.users.findFirst({ where: eq(users.id, id) });
}
