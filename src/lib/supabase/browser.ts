import { createClient, type SupabaseClient } from "@supabase/supabase-js";
let client: SupabaseClient | null = null;
let configuredUrl = "";
export function browserClient(config: { url: string; key: string }) {
  if (typeof window === "undefined") return null;
  if (!client || configuredUrl !== config.url) {
    configuredUrl = config.url;
    client = createClient(config.url, config.key, {
      auth: { persistSession: false, detectSessionInUrl: false },
    });
  }
  return client;
}
