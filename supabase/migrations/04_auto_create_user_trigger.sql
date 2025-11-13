-- Migration: Auto-Create Users Table Record on Signup
-- Description: Creates a trigger that automatically creates a users table record
--              when a new user signs up via Supabase Auth

-- Create the trigger function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert new user into users table
  INSERT INTO public.users (
    id,
    auth_user_id,
    email,
    username,
    organization_id,
    role,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,                                              -- Use auth user id as primary key
    NEW.id,                                              -- Store auth user id reference
    NEW.email,                                           -- Email from auth
    SPLIT_PART(NEW.email, '@', 1),                      -- Generate username from email (part before @)
    '00000000-0000-0000-0000-000000000001'::uuid,       -- Default to dev organization
    'user',                                              -- Default role
    NOW(),
    NOW()
  )
  ON CONFLICT (auth_user_id) DO NOTHING;                -- Skip if already exists

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger on auth.users table
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Comment for documentation
COMMENT ON FUNCTION public.handle_new_user() IS
  'Automatically creates a users table record when a new user signs up via Supabase Auth';
