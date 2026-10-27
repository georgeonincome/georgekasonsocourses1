import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";

import * as schema from "@/db/schema";

/**
 * libSQL client — works with a local SQLite file in development and a Turso
 * remote database in production (Vercel has no persistent filesystem, so the
 * file URL would not survive a serverless deploy).
 */
const url = process.env.DATABASE_URL ?? "file:./local.db";

const client = createClient({
  url,
  authToken: url.startsWith("libsql://") ? process.env.DATABASE_AUTH_TOKEN : undefined,
});

export const db = drizzle(client, { schema });
export { schema };
