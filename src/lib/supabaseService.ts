/**
 * Supabase Service-Role Client
 *
 * This client uses the service_role key which bypasses Row-Level Security (RLS) policies.
 *
 * SECURITY WARNING:
 * - Only use this client for server-side/backend operations
 * - Never expose this client to the frontend/browser
 * - Only use for system operations like polling service, admin tasks, etc.
 *
 * Use cases:
 * - Call polling service (background job)
 * - System-initiated operations
 * - Admin operations that need to bypass RLS
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseServiceRoleKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_SECRET;

if (!supabaseUrl) {
  throw new Error('Missing VITE_SUPABASE_URL environment variable');
}

/**
 * Service-role authenticated Supabase client
 * Bypasses RLS policies for system operations
 *
 * Note: This will be null if VITE_SUPABASE_SERVICE_ROLE_SECRET is not configured.
 * Check for null before using this client.
 */
export const supabaseService: SupabaseClient | null = supabaseServiceRoleKey
  ? createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  : null;

/**
 * Helper function to get the service client or throw an error if not configured
 */
export function requireServiceClient(): SupabaseClient {
  if (!supabaseService) {
    throw new Error(
      'Service role client not available. Set VITE_SUPABASE_SERVICE_ROLE_SECRET in your .env file. ' +
      'This is required for admin operations and background services.'
    );
  }
  return supabaseService;
}

export default supabaseService;
