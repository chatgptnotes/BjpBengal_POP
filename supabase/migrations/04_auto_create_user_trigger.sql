-- Migration: Auto-Create User Profile on Signup
-- Description: Creates a trigger that automatically creates a user_profiles table record
--              when a new user signs up via Supabase Auth

-- Create the trigger function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert new user into user_profiles table
  INSERT INTO public.user_profiles (
    id,
    email,
    full_name,
    role,
    organization_id,
    state,
    is_active,
    email_verified,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,                                              -- Use auth user id as primary key
    NEW.email,                                           -- Email from auth
    SPLIT_PART(NEW.email, '@', 1),                      -- Generate name from email (part before @)
    'user',                                              -- Default role
    NULL,                                                -- No organization by default
    NULL,                                                -- No state by default
    true,                                                -- Active by default
    NEW.email_confirmed_at IS NOT NULL,                 -- Set based on email confirmation
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;                          -- Skip if already exists

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop old trigger if exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create the trigger on auth.users table
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Comment for documentation
COMMENT ON FUNCTION public.handle_new_user() IS
  'Automatically creates a user_profiles table record when a new user signs up via Supabase Auth';
