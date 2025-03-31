import { createClient } from '@supabase/supabase-js';

// Environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
// For admin operations, ideally use a service role key
// If you don't have one, we'll fall back to the anon key but with limitations
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey;

// Regular client for public operations
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Admin client with elevated privileges for admin operations
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});