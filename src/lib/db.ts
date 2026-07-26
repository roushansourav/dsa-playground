import { drizzle } from "drizzle-orm/vercel-postgres";
import { sql } from "@vercel/postgres";

import * as schema from "./schema";

export const db = drizzle(sql, { schema });

export function isDatabaseConfigured(): boolean {
  return Boolean(process.env.POSTGRES_URL);
}
