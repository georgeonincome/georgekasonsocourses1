import { eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { users } from "@/db/schema";
import { hashPassword } from "@/lib/password";

/**
 * Reset the admin password.
 *
 *   npx tsx db/reset-admin-password.ts <new-password>
 *
 * The admin account is the only way into /admin — it approves reviews, sees
 * orders and manages the catalogue. If the password is lost, run this
 * against the production database:
 *
 *   DATABASE_URL="libsql://..." DATABASE_AUTH_TOKEN="..." \
 *     npx tsx db/reset-admin-password.ts 'the-new-password'
 */
async function main() {
  const password = process.argv[2] ?? process.env.ADMIN_PASSWORD;
  if (!password) {
    console.error(
      "Usage: npx tsx db/reset-admin-password.ts <new-password>",
    );
    process.exit(1);
  }
  if (password.length < 8) {
    console.error("The password must be at least 8 characters.");
    process.exit(1);
  }

  const email = (process.env.ADMIN_EMAIL ?? "admin@learn2earn.online").toLowerCase();
  const existing = await db.query.users.findFirst({
    where: (u, { eq: e }) => e(u.email, email),
  });

  if (!existing) {
    await db.insert(users).values({
      id: "admin",
      name: "George J. Kasonso",
      email,
      passwordHash: await hashPassword(password),
      role: "admin",
    });
    console.log(`Admin account created: ${email}`);
  } else {
    await db
      .update(users)
      .set({ passwordHash: await hashPassword(password), role: "admin" })
      .where(eq(users.id, existing.id));
    console.log(`Admin password updated: ${email}`);
  }

  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
