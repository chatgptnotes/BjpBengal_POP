# Create Test Superadmin User

You're getting a login error because the `admin@bjp.com` user doesn't exist yet in Supabase.

## Option 1: Manual Creation (Recommended - 2 minutes)

### Step 1: Create Auth User in Supabase Dashboard

1. Open your **Supabase Project Dashboard**
2. Go to **Authentication** → **Users** (left sidebar)
3. Click the **"Add User"** button (top right)
4. Fill in the form:
   - **Email:** `admin@bjp.com`
   - **Password:** `Admin@123`
   - **Auto Confirm User:** ✅ **YES** (check this box!)
   - **Send Email:** ❌ NO (uncheck this)
5. Click **"Create User"**
6. **Copy the User ID (UUID)** that appears in the user list

### Step 2: Run SQL Commands

1. In Supabase Dashboard, go to **SQL Editor** (left sidebar)
2. Click **"New Query"**
3. Paste and run this SQL (replace `YOUR_USER_ID` with the UUID you copied):

```sql
-- Insert organization
INSERT INTO organizations (name, slug, type, contact_email, phone, address, state, status, subscription_plan, is_active)
VALUES (
  'Bharatiya Janata Party - West Bengal',
  'bjp-wb',
  'party',
  'admin@bjp.com',
  '+91-33-22801000',
  'BJP State Office, Kolkata, West Bengal',
  'West Bengal',
  'active',
  'premium',
  true
)
ON CONFLICT (slug) DO NOTHING
RETURNING id;

-- Get organization ID (note the id from above, or run this):
SELECT id FROM organizations WHERE slug = 'bjp-wb';

-- Create user profile (replace YOUR_USER_ID and YOUR_ORG_ID)
INSERT INTO user_profiles (
  id,
  email,
  full_name,
  role,
  status,
  is_super_admin,
  organization_id,
  permissions,
  phone,
  designation,
  state,
  district
)
VALUES (
  'YOUR_USER_ID'::uuid,  -- Replace with actual auth user ID
  'admin@bjp.com',
  'BJP West Bengal Super Admin',
  'superadmin',
  'active',
  true,
  'YOUR_ORG_ID'::uuid,  -- Replace with organization id from above
  ARRAY['*'],
  '+91-9999999999',
  'State Coordinator',
  'West Bengal',
  'Kolkata'
)
ON CONFLICT (id) DO UPDATE SET
  role = 'superadmin',
  is_super_admin = true,
  status = 'active';

-- Verify setup
SELECT * FROM user_profiles WHERE email = 'admin@bjp.com';
```

### Step 3: Login

1. Go to `http://localhost:5174/login`
2. Click **"Quick Login as Superadmin"** button
   - OR manually enter:
   - Email: `admin@bjp.com`
   - Password: `Admin@123`
3. You should now be logged in!
4. Navigate to: `http://localhost:5174/dashboard/admin`

---

## Option 2: Automated Creation (Requires Service Role Key)

If you have the Supabase Service Role Key:

### Step 1: Add Service Role Key to .env

```bash
# Add this line to your .env file:
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

**Where to find it:**
- Supabase Dashboard → Settings → API
- Copy the "service_role" key (starts with "eyJ...")

### Step 2: Run the Script

```bash
node create-test-user.js
```

This will automatically create:
- Auth user in Supabase Authentication
- Organization record in `organizations` table
- User profile in `user_profiles` table

---

## Troubleshooting

### Still getting login errors?

1. **Check browser console:**
   - Press F12 → Console tab
   - Look for authentication errors

2. **Verify user exists:**
   - Supabase Dashboard → Authentication → Users
   - Should see `admin@bjp.com` in the list

3. **Verify profile exists:**
   - Supabase Dashboard → SQL Editor
   - Run: `SELECT * FROM user_profiles WHERE email = 'admin@bjp.com';`
   - Should return one row with `role='superadmin'`

4. **Clear browser cache:**
   - Logout completely
   - Clear site data (F12 → Application → Clear Storage)
   - Try logging in again

### Invalid credentials error?

- Make sure password is exactly: `Admin@123` (case-sensitive)
- Make sure email is: `admin@bjp.com` (lowercase)

---

## After Successful Login

Once logged in, you'll have access to:
- **Admin State Dashboard:** `/dashboard/admin`
- West Bengal map with 7 interactive layers
- All admin features and analytics

**Direct link:** `http://localhost:5174/dashboard/admin`
