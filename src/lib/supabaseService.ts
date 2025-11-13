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

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseServiceRoleKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_SECRET;

if (!supabaseUrl) {
  throw new Error('Missing VITE_SUPABASE_URL environment variable');
}

if (!supabaseServiceRoleKey) {
  throw new Error('Missing VITE_SUPABASE_SERVICE_ROLE_SECRET environment variable');
}

/**
 * Service-role authenticated Supabase client
 * Bypasses RLS policies for system operations
 */
export const supabaseService = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

export default supabaseService;
