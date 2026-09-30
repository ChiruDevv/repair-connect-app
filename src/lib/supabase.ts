/*
 * Supabase Client Utility
 * 
 * Creates a Supabase client for server-side use in API routes.
 * Uses the service role key to bypass Row Level Security (RLS),
 * since all authentication is handled by NextAuth JWT — not Supabase Auth.
 * 
 * The client is created lazily (on first use) to avoid build-time errors
 * when environment variables aren't available during static page generation.
 */
import { createClient, SupabaseClient } from "@supabase/supabase-js";

let _supabase: SupabaseClient | null = null;

// Lazy singleton: created on first access, not at import time
// This prevents build errors when env vars aren't set during static generation
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    if (!_supabase) {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

      if (!supabaseUrl || !supabaseServiceKey) {
        throw new Error(
          "Missing Supabase environment variables. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local"
        );
      }

      _supabase = createClient(supabaseUrl, supabaseServiceKey);
    }
    return (_supabase as any)[prop];
  },
});
