import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";

import * as schema from "@/db/schema";

/**
 * A second client for migrations and seeding, pointed at a remote Turso
 * database. Vercel has no persistent filesystem, so the local `file:` URL
 * used in development cannot work in production — the hosted app talks to
 * Turso over libSQL instead.
 */
export function createRemoteDb() {
  const url = process.env.DATABASE_URL;
  if (!url || !url.startsWith("libsql://")) {
    throw new Error(
      "DATABASE_URL must be a libsql:// URL (Turso) to migrate a remote database.",
    );
  }
  const client = createClient({
    url,
    authToken: process.env.DATABASE_AUTH_TOKEN,
  });
  return drizzle(client, { schema });
}
