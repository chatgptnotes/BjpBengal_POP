import { createClient } from '@supabase/supabase-js';

// Hardcoded credentials for now to bypass .env loading issues
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://mmmvpotyplosbsodnxwn.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1tbXZwb3R5cGxvc2Jzb2RueHduIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM5NjI5NjksImV4cCI6MjA3OTUzODk2OX0.DLWA5p-9jcl1q2yaQIuIeqJ7Ys1dDBg0I0YqfLV8Bcs';

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

console.log('[Supabase] ✓ Client initialized successfully');

export { supabase };
export default supabase;