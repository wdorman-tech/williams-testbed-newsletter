import { createClient } from "@supabase/supabase-js";
import { requireEnv } from "./env.js";

export function createSupabaseAdminClient() {
  return createClient(
    requireEnv("VITE_SUPABASE_URL"),
    requireEnv("SUPABASE_SERVICE_ROLE_KEY")
  );
}

export function createSupabaseAuthClient() {
  return createClient(requireEnv("VITE_SUPABASE_URL"), requireEnv("VITE_SUPABASE_ANON_KEY"));
}
