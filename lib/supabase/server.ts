import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/types/database";

export function createSupabaseServerClient() {
  const supabaseUrl = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey =
    process.env.SUPABASE_SECRET_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Supabaseの環境変数が設定されていません。");
  }

  return createClient<Database>(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false
    }
  });
}
