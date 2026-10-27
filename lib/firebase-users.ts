import { eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { users } from "@/db/schema";
import type { FirebaseIdentity } from "@/lib/firebase-admin";

/**
 * Turn a verified Google identity into a row in this app's own users table.
 *
 * Email is the join key, deliberately. A student who first registered with a
 * password and later taps "Continue with Google" with the same address is the
 * same person, so they must land on the same account — otherwise they would
 * end up with two identities and a course paid for on one of them.
 */
export async function findOrCreateUser(identity: FirebaseIdentity) {
  const email = (identity.email ?? "").toLowerCase();
  if (!email) return null;

  const existing = await db.query.users.findFirst({
    where: (u, { eq: eqOp }) => eqOp(u.email, email),
  });

  if (existing) {
    // Google is authoritative for the display name and photo, but never for the
    // role — that is this app's to assign, and a student must not be able to
    // grant themselves admin by renaming a Google account.
    const patch: Partial<{ name: string; image: string; updatedAt: Date }> = {};
    if (identity.name && identity.name !== existing.name) patch.name = identity.name;
    if (identity.picture && identity.picture !== existing.image) patch.image = identity.picture;

    if (Object.keys(patch).length > 0) {
      patch.updatedAt = new Date();
      await db.update(users).set(patch).where(eq(users.id, existing.id));
      // Return the merged row, not the pre-update copy: this value becomes the
      // session, and a stale name would show until the student signed in again.
      return { ...existing, ...patch };
    }

    return existing;
  }

  const inserted = await db
    .insert(users)
    .values({
      // The Firebase uid is a stable, collision-free primary key. It does not
      // matter that it looks nothing like the ids this app used before.
      id: identity.uid,
      email,
      name: identity.name ?? email.split("@")[0],
      image: identity.picture,
      // Google has already verified this address; there is nothing to send.
      emailVerified: new Date(),
      role: "student",
    })
    .onConflictDoNothing({ target: users.email })
    .returning();

  if (inserted[0]) return inserted[0];

  // Lost a race with a concurrent sign-in for the same address. Read the winner
  // back rather than failing a sign-in that actually succeeded.
  return db.query.users.findFirst({
    where: (u, { eq: eqOp }) => eqOp(u.email, email),
  });
}
