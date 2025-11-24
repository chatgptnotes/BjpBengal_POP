# BJP West Bengal Superadmin Setup Guide

## Overview
This guide will help you set up your new Supabase database and create a superadmin account for BJP West Bengal.

---

## Step 1: Access Supabase Dashboard

1. Go to: https://supabase.com/dashboard
2. Login to your account
3. Select project: `mmmvpotyplosbsodnxwn`
4. Or direct link: https://supabase.com/dashboard/project/mmmvpotyplosbsodnxwn

---

## Step 2: Run Database Migrations

### 2.1 Open SQL Editor
1. Click on "SQL Editor" in the left sidebar
2. Click "New Query"

### 2.2 Run Complete Schema Migration
1. Open file: `supabase/migrations/00_complete_schema.sql`
2. Copy ALL contents
3. Paste into Supabase SQL Editor
4. Click "Run" button
5. **Wait for completion** (may take 30-60 seconds)
6. Verify: Should see "Success. No rows returned"

### 2.3 Run RLS Policies
1. Open file: `supabase/migrations/01_rls_policies.sql`
2. Copy ALL contents
3. Paste into Supabase SQL Editor
4. Click "Run"
5. Verify success

### 2.4 Run Additional Migrations (in order)
1. `02_voter_calls_schema.sql` - Run this
2. `04_auto_create_user_trigger.sql` - Run this

---

## Step 3: Create BJP Organization & Superadmin

### 3.1 Run Setup Script
1. Open file: `setup_bjp_superadmin.sql` (in project root)
2. Copy ALL contents
3. Paste into Supabase SQL Editor
4. Click "Run"
5. You should see messages:
   - Organization created
   - State inserted
   - Helper functions created

### 3.2 Verify Organization Created
Run this query:
```sql
SELECT id, name, slug, state, subscription_status
FROM organizations
WHERE slug = 'bjp-wb';
```

You should see:
- Name: "Bharatiya Janata Party - West Bengal"
- State: "West Bengal"
- Status: "active"

---

## Step 4: Create Superadmin User Account

### 4.1 Go to Authentication
1. Click "Authentication" in left sidebar
2. Click "Users" tab
3. Click "Add User" button (green button, top right)

### 4.2 Fill User Details
**IMPORTANT: Fill exactly as shown:**

- **Email**: `admin@bjp.com`
- **Password**: `Admin@123`
- **Auto Confirm User**: ✅ CHECK THIS BOX
- **Send Email**: ❌ UNCHECK THIS BOX

Click "Create User" button

### 4.3 Copy User ID
After creation, you'll see the new user in the list.
1. Click on the user email "admin@bjp.com"
2. You'll see user details with a **UUID** (something like: `a1b2c3d4-e5f6-...`)
3. **COPY THIS ENTIRE UUID** - you'll need it in the next step

---

## Step 5: Create Superadmin Profile

### 5.1 Open SQL Editor Again
1. Go back to "SQL Editor"
2. Create new query

### 5.2 Run Profile Creation Command
**Replace `YOUR_USER_ID` with the UUID you copied in Step 4.3**

```sql
SELECT create_superadmin_profile(
  'YOUR_USER_ID'::uuid,
  'admin@bjp.com',
  'BJP West Bengal Super Admin'
);
```

Example (replace with your actual UUID):
```sql
SELECT create_superadmin_profile(
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890'::uuid,
  'admin@bjp.com',
  'BJP West Bengal Super Admin'
);
```

Click "Run"

You should see: "Superadmin profile created successfully"

---

## Step 6: Grant Superadmin Permissions

### 6.1 Run Permissions Grant
**Again, replace `YOUR_USER_ID` with your actual UUID:**

```sql
SELECT grant_superadmin_permissions('YOUR_USER_ID'::uuid);
```

Click "Run"

You should see: "All permissions granted to superadmin"

---

## Step 7: Verify Setup

### 7.1 Check User Profile
```sql
SELECT id, email, role, organization_id, state, is_active
FROM user_profiles
WHERE email = 'admin@bjp.com';
```

Should show:
- Email: admin@bjp.com
- Role: superadmin
- State: West Bengal
- Active: true

### 7.2 Check Permissions
```sql
SELECT permission, granted_at
FROM user_permissions
WHERE user_id = 'YOUR_USER_ID'::uuid;
```

Should show 12 permissions including:
- manage_organizations
- manage_tenants
- manage_users
- view_all_organizations
- etc.

---

## Step 8: Test Login

### 8.1 Go to Application
1. Open browser: http://localhost:5174/
2. Click "Login" button

### 8.2 Enter Credentials
- **Email**: `admin@bjp.com`
- **Password**: `Admin@123`
- Click "Login"

### 8.3 Expected Result
You should:
- ✅ Successfully login
- ✅ Redirect to Superadmin Dashboard (`/dashboard/superadmin`)
- ✅ See "BJP West Bengal" branding
- ✅ See all navigation options available

---

## Step 9: Test Multi-Authentication Features

### 9.1 Check Dashboard Access
Try accessing these URLs directly (after logging in):

- `/dashboard/superadmin` - ✅ Should work
- `/super-admin/dashboard` - ✅ Should work
- `/super-admin/tenants` - ✅ Should work
- `/admin/dashboard` - ✅ Should work (superadmin can access all)
- `/user-management` - ✅ Should work

### 9.2 Check User Profile Menu
1. Click on user icon (top right)
2. Should see:
   - Your email: admin@bjp.com
   - Role: Super Administrator
   - Organization: BJP West Bengal

### 9.3 Check Permissions
Superadmin should be able to:
- ✅ Create new users
- ✅ Manage all organizations
- ✅ Access all dashboards
- ✅ View all data (no geographic filtering)
- ✅ Modify system settings

---

## Troubleshooting

### Issue 1: "Invalid login credentials"
**Cause**: User not created or password mismatch
**Fix**:
1. Go to Supabase → Authentication → Users
2. Check if `admin@bjp.com` exists
3. If not, create it again (Step 4)
4. If yes, reset password:
   - Click on user
   - Click "Send Password Reset"
   - Or delete and recreate

### Issue 2: Login works but redirects to wrong page
**Cause**: User profile not created or role not set
**Fix**:
1. Run this query:
```sql
SELECT * FROM user_profiles WHERE email = 'admin@bjp.com';
```
2. If no results, re-run Step 5
3. If role is not 'superadmin', run:
```sql
UPDATE user_profiles
SET role = 'superadmin'
WHERE email = 'admin@bjp.com';
```

### Issue 3: "Unauthorized" or "Access Denied"
**Cause**: Permissions not granted
**Fix**: Re-run Step 6 (grant permissions)

### Issue 4: Can't see any data
**Cause**: Organization not assigned
**Fix**:
```sql
UPDATE user_profiles
SET organization_id = '22222222-2222-2222-2222-222222222222'
WHERE email = 'admin@bjp.com';
```

### Issue 5: RLS blocking access
**Cause**: RLS policies too restrictive for superadmin
**Fix**: Superadmin should bypass RLS. Check if this policy exists:
```sql
-- Check for superadmin bypass policy
SELECT * FROM pg_policies
WHERE tablename = 'user_profiles'
AND policyname LIKE '%superadmin%';
```

---

## Success Checklist

After completing all steps, verify:

- [ ] Database has all tables (35+)
- [ ] Organization "BJP West Bengal" exists
- [ ] State "West Bengal" exists
- [ ] Superadmin user created in auth.users
- [ ] User profile exists with role = 'superadmin'
- [ ] 12 permissions granted
- [ ] Can login with admin@bjp.com / Admin@123
- [ ] Redirects to superadmin dashboard
- [ ] Can access all routes
- [ ] No "unauthorized" errors
- [ ] User menu shows correct role and organization

---

## Next Steps

Once superadmin is working:

1. **Add More Users**:
   - Go to User Management
   - Create admin, manager, analyst users
   - Assign geographic scopes

2. **Import Data**:
   - Add 23 West Bengal districts
   - Add 294 constituencies
   - Import polling booths

3. **Configure Features**:
   - Set up voter database
   - Configure sentiment analysis
   - Enable voice agent

4. **Deploy to Production**:
   - Push to Vercel
   - Update production environment variables
   - Configure custom domain

---

## Credentials Summary

**Superadmin Account:**
- Email: `admin@bjp.com`
- Password: `Admin@123`
- Role: `superadmin`
- Organization: `BJP West Bengal`
- Access: Full system access, all features

**Database:**
- URL: `https://mmmvpotyplosbsodnxwn.supabase.co`
- Project: BJP West Bengal Campaign Manager

---

## Support

If you encounter any issues not covered in troubleshooting:

1. Check browser console for errors (F12 → Console tab)
2. Check Supabase logs (Dashboard → Logs)
3. Verify all migrations ran successfully
4. Ensure .env file has correct Supabase credentials

---

**Setup should take 15-20 minutes total**

Good luck! 🚀
