import { createClient } from "@supabase/supabase-js";

/**
 * Browser Supabase client. Values come from the project's API settings
 * (Project Settings → API) and live in .env.local / Vercel env vars.
 *
 * We fall back to harmless placeholders when the env isn't set so that builds
 * and prerendering don't crash; `isSupabaseConfigured` lets the UI show a
 * helpful message at runtime instead.
 */
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(url && anonKey);

export const supabase = createClient(
  url || "http://localhost:54321",
  anonKey || "public-anon-key",
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
);
