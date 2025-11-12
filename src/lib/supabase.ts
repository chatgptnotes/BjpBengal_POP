import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// For demo purposes, create a placeholder client if credentials are missing
// This allows the landing page to load without requiring Supabase setup
let supabase: any;

if (!supabaseUrl || !supabaseAnonKey || supabaseUrl === 'https://your-project.supabase.co') {
  console.warn(
    'Supabase credentials not configured. Using demo mode. Some features may not work.'
  );
  // Create a mock client for demo purposes
  supabase = createClient(
    'https://demo.supabase.co',
    'demo-anon-key',
    { auth: { persistSession: false } }
  );
} else {
  supabase = createClient(supabaseUrl, supabaseAnonKey);
}

export { supabase };
export default supabase;