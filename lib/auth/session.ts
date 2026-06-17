import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { getDb } from "@/lib/db";
import { profiles } from "@/lib/db/schema";

export async function getCurrentUser() {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  return data.user ?? null;
}

export async function ensureProfile(userId: string, email: string) {
  const db = getDb();
  if (!db) return;

  await db
    .insert(profiles)
    .values({ id: userId, email })
    .onConflictDoNothing({ target: profiles.id });
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Unauthorized");
  }
  return user;
}
