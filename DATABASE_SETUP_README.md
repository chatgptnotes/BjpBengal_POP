# BJP West Bengal - Database & Authentication Setup

## Quick Start Guide

This guide will help you set up the database and create your first superadmin account in **15-20 minutes**.

---

## Prerequisites

- ✅ New Supabase project created: `mmmvpotyplosbsodnxwn`
- ✅ Supabase credentials updated in `.env` file
- ✅ Project running locally: `npm run dev`

---

## Step-by-Step Setup

### 📋 Step 1: Access Supabase Dashboard

1. Go to: https://supabase.com/dashboard/project/mmmvpotyplosbsodnxwn
2. Login with your Supabase account

### 🗄️ Step 2: Run Database Migrations

#### 2.1 Open SQL Editor
1. Click **"SQL Editor"** in the left sidebar
2. Click **"New Query"** button

#### 2.2 Run Schema Migration
1. Open file: `supabase/migrations/00_complete_schema.sql`
2. Copy **ALL** contents (Cmd+A, Cmd+C)
3. Paste into Supabase SQL Editor
4. Click **"Run"** button (or press Cmd+Enter)
5. Wait 30-60 seconds
6. ✅ Should see: "Success. No rows returned"

#### 2.3 Run RLS Policies
1. Open file: `supabase/migrations/01_rls_policies.sql`
2. Copy ALL contents
3. Paste into SQL Editor
4. Click **"Run"**
5. ✅ Should see success message

#### 2.4 Run Additional Migrations
Repeat for these files (in order):
1. `02_voter_calls_schema.sql` - Voice agent tables
2. `04_auto_create_user_trigger.sql` - Auto-create user profiles

### 🏢 Step 3: Create BJP Organization

1. Open file: `setup_bjp_superadmin.sql` (in project root)
2. Copy ALL contents
3. Paste into SQL Editor
4. Click **"Run"**
5. ✅ Should see: Functions created, organization inserted

#### Verify Organization
Run this query:
```sql
SELECT id, name, slug, state FROM organizations WHERE slug = 'bjp-wb';
```

Expected output:
| id | name | slug | state |
|----|------|------|-------|
| 22222222-... | Bharatiya Janata Party - West Bengal | bjp-wb | West Bengal |

### 👤 Step 4: Create Superadmin User

#### 4.1 Create Auth User
1. Click **"Authentication"** in left sidebar
2. Click **"Users"** tab
3. Click **"Add User"** button (green, top right)

#### 4.2 Fill User Details
Fill exactly as shown:

| Field | Value |
|-------|-------|
| Email | `admin@bjp.com` |
| Password | `Admin@123` |
| Auto Confirm User | ✅ **CHECK THIS** |
| Send Email | ❌ **UNCHECK THIS** |

Click **"Create User"**

#### 4.3 Copy User ID
1. Find the new user in the list
2. Click on `admin@bjp.com`
3. Copy the **UUID** (looks like: `a1b2c3d4-e5f6-7890-abcd-ef1234567890`)
4. Save it - you'll need it in next step

### 👔 Step 5: Create User Profile

#### 5.1 Run Profile Creation
Go back to SQL Editor and run this command:

**⚠️ REPLACE `YOUR_USER_ID` with the UUID you copied in Step 4.3**

```sql
SELECT create_superadmin_profile(
  'YOUR_USER_ID'::uuid,
  'admin@bjp.com',
  'BJP West Bengal Super Admin'
);
```

Example:
```sql
SELECT create_superadmin_profile(
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890'::uuid,
  'admin@bjp.com',
  'BJP West Bengal Super Admin'
);
```

✅ Should see: "Superadmin profile created successfully"

#### 5.2 Grant Permissions
Run this command (again, replace `YOUR_USER_ID`):

```sql
SELECT grant_superadmin_permissions('YOUR_USER_ID'::uuid);
```

✅ Should see: "All permissions granted to superadmin"

### ✅ Step 6: Verify Setup

#### Check User Profile
```sql
SELECT id, email, role, organization_id, state, is_active
FROM user_profiles
WHERE email = 'admin@bjp.com';
```

Expected:
- Email: `admin@bjp.com`
- Role: `superadmin`
- State: `West Bengal`
- Active: `true`

#### Check Permissions
```sql
SELECT permission
FROM user_permissions
WHERE user_id = 'YOUR_USER_ID'::uuid;
```

Should show 12 permissions including:
- manage_organizations
- manage_tenants
- manage_users
- view_all_organizations

---

## 🧪 Test Login

### Test in Application

1. **Go to app**: http://localhost:5174/
2. **Click "Login"**
3. **Enter credentials:**
   - Email: `admin@bjp.com`
   - Password: `Admin@123`
4. **Click "Login"**

### Expected Result

✅ **Success!** You should:
- Login successfully
- Redirect to `/dashboard/superadmin`
- See "BJP West Bengal" branding
- See superadmin dashboard with all features

---

## 🔍 Troubleshooting

### Problem: "Invalid login credentials"

**Solution:**
1. Go to Supabase → Authentication → Users
2. Verify `admin@bjp.com` exists
3. Click on the user → "Send Password Reset Email"
4. Or delete user and recreate from Step 4

### Problem: Login works but redirects to `/login` again

**Solution:** User profile not created
```sql
-- Check if profile exists
SELECT * FROM user_profiles WHERE email = 'admin@bjp.com';

-- If not, re-run Step 5
```

### Problem: "Unauthorized" or "Access Denied"

**Solution:** Permissions not granted
```sql
-- Re-run permissions grant
SELECT grant_superadmin_permissions('YOUR_USER_ID'::uuid);
```

### Problem: Can't see any data

**Solution:** Organization not assigned
```sql
UPDATE user_profiles
SET organization_id = '22222222-2222-2222-2222-222222222222'
WHERE email = 'admin@bjp.com';
```

---

## ✅ Success Checklist

After setup, verify:

- [ ] Can login with `admin@bjp.com` / `Admin@123`
- [ ] Redirects to superadmin dashboard
- [ ] Can access `/super-admin/dashboard`
- [ ] Can access `/user-management`
- [ ] User menu shows:
  - Email: admin@bjp.com
  - Role: Super Administrator
  - Organization: BJP West Bengal
- [ ] No "unauthorized" errors
- [ ] No database connection errors

---

## 📝 Credentials Summary

**Superadmin Account:**
```
Email: admin@bjp.com
Password: Admin@123
Role: superadmin
Organization: BJP West Bengal
Access: Full system access
```

**Database:**
```
URL: https://mmmvpotyplosbsodnxwn.supabase.co
Project: BJP West Bengal Campaign Manager
```

---

## 🚀 Next Steps

Once superadmin is working:

### 1. Add Geographic Data
```sql
-- Insert West Bengal districts (example)
INSERT INTO districts (state_id, name, code) VALUES
('33333333-3333-3333-3333-333333333333', 'Kolkata', 'WB-KOL'),
('33333333-3333-3333-3333-333333333333', 'North 24 Parganas', 'WB-N24'),
-- ... add all 23 districts
```

### 2. Create Additional Users
- Use User Management UI: `/user-management`
- Create admin, manager, analyst roles
- Assign geographic scopes

### 3. Import Voter Data
- Use bulk import features
- Assign to booths and constituencies

### 4. Deploy to Production
```bash
npm run build
vercel --prod
```

---

## 📚 Additional Documentation

- **Detailed Setup**: See `SUPERADMIN_SETUP_GUIDE.md`
- **Multi-Authentication**: See architecture explanation in code comments
- **Database Schema**: See `supabase/migrations/00_complete_schema.sql`
- **RLS Policies**: See `supabase/migrations/01_rls_policies.sql`

---

## 🆘 Need Help?

1. Check browser console (F12 → Console)
2. Check Supabase logs (Dashboard → Logs)
3. Verify `.env` has correct credentials
4. Ensure all migrations ran successfully

---

**Total Setup Time: 15-20 minutes**

Good luck! 🎉
