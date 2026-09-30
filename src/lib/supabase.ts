/*
 * Supabase Client Utility
 * 
 * Creates a Supabase client for server-side use in API routes.
 * Uses the service role key to bypass Row Level Security (RLS),
 * since all authentication is handled by NextAuth JWT — not Supabase Auth.
 * 
 * The session pooler connection is configured in the Supabase dashboard;
 * the JS client connects via the REST API (supabase URL + key), not
 * a raw PostgreSQL connection string.
 */
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error(
    "Missing Supabase environment variables. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local"
  );
}

// Server-side client with service role key (full database access)
// Used by API routes — NOT exposed to the browser
export const supabase = createClient(supabaseUrl, supabaseServiceKey);
