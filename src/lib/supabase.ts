import { createClient } from '@supabase/supabase-js';

// Hardcoded credentials for now to bypass .env loading issues
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://iybdskfzjbhzxyxfazwr.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml5YmRza2Z6amJoenh5eGZhendyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA3OTQzMDMsImV4cCI6MjA4NjM3MDMwM30.EkauLQPhCYCEZdCsX4CZErjLrvg3tk2reVMDP8JMaOQ';
const supabaseServiceRoleKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_SECRET || '';

console.log('[Supabase] Initializing client...');
console.log('[Supabase] URL:', supabaseUrl);
console.log('[Supabase] Key exists:', !!supabaseAnonKey);

// Create Supabase client with proper configuration
const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storageKey: 'pulse-of-people-auth',
  },
  global: {
    headers: {
      'X-Client-Info': 'pulse-of-people-web',
    },
  },
});

// Admin client with service role key (bypasses RLS) - use for server-side operations only
const supabaseAdmin = supabaseServiceRoleKey
  ? createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    })
  : supabase; // Fallback to regular client if no service role key

console.log('[Supabase] ✓ Client initialized successfully');
console.log('[Supabase] Admin client:', supabaseServiceRoleKey ? 'enabled' : 'disabled (using anon)');

export { supabase, supabaseAdmin };
export default supabase;