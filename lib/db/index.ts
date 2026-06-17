import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

let client: ReturnType<typeof postgres> | null = null;
let db: ReturnType<typeof drizzle<typeof schema>> | null = null;

export function getDb() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    return null;
  }

  if (!db) {
    client = postgres(url, { max: 1 });
    db = drizzle(client, { schema });
  }

  return db;
}

export function isDatabaseConfigured() {
  return Boolean(process.env.DATABASE_URL);
}
