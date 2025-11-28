# Quick Start Guide
## BjpBengal POP - Get Running in 15 Minutes

**Goal**: Get the application running with a working database and test user

---

## Prerequisites (2 minutes)

1. ✅ Node.js installed
2. ✅ Supabase account created
3. ✅ New Supabase project created

---

## Step 1: Environment Setup (3 minutes)

### 1.1 Get Supabase Credentials

1. Go to your Supabase project dashboard
2. Click **Settings** > **API**
3. Copy these values:
   - Project URL
   - `anon` public key

### 1.2 Create `.env` file

Create `.env` in project root:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

---

## Step 2: Install Dependencies (2 minutes)

```bash
cd /Users/apple/Desktop/Hope_projects/BjpBengal_POP
npm install
```

---

## Step 3: Database Setup (5 minutes)

### 3.1 Run Core Migrations

Go to Supabase Dashboard > **SQL Editor** > **New Query**

**Run these 3 files in order** (copy-paste each one):

#### Migration 1: Database Schema
File: `supabase/migrations/00_complete_schema.sql`
- Creates all tables
- Takes ~30 seconds

#### Migration 2: Security Policies
File: `supabase/migrations/01_rls_policies.sql`
- Sets up Row-Level Security
- Takes ~15 seconds

#### Migration 3: Test Organization
File: `supabase/migrations/03_dev_organization.sql`
- Creates "Development Organization"
- Takes ~5 seconds

### 3.2 Create Superadmin User

**Option A - Dashboard (Recommended)**:
1. Go to **Authentication** > **Users**
2. Click **Add User**
3. Email: `admin@test.com`
4. Password: `Test@123`
5. Check "Auto Confirm User"
6. Click **Add User**

**Then run this SQL to assign role**:
```sql
UPDATE users
SET role = 'superadmin',
    organization_id = '00000000-0000-0000-0000-000000000001'
WHERE email = 'admin@test.com';
```

---

## Step 4: Start Application (2 minutes)

```bash
npm run dev
```

Open browser: `http://localhost:5173/`

---

## Step 5: Login & Test (3 minutes)

### 5.1 Login
- Email: `admin@test.com`
- Password: `Test@123`

### 5.2 Test Pages

Navigate to these pages to verify setup:
- ✅ `/constituencies` - Constituencies List
- ✅ `/wards` - Wards List
- ✅ `/booths` - Booths List
- ✅ `/user-management` - User Management

**Note**: Lists will be empty until you add data. This is normal.

---

## Optional: Add Sample Data (5 minutes)

### West Bengal Constituencies

Run this migration to add all WB constituencies:

File: `supabase/migrations/12_insert_all_constituencies.sql`

This adds:
- 294 Assembly constituencies
- 42 Parliamentary constituencies
- Complete geographic data

After running, refresh `/constituencies` page to see data!

### Sample Voters

Run these migrations in order:
1. `06_insert_50_sample_voters.sql` - Adds 50 test voters
2. `07_add_demographic_columns.sql` - Adds demographic fields
3. `08_update_sample_voters_caste.sql` - Updates demographics

---

## Quick Troubleshooting

### Can't login?

1. Check user exists:
```sql
SELECT * FROM auth.users WHERE email = 'admin@test.com';
```

2. Check user profile:
```sql
SELECT * FROM users WHERE email = 'admin@test.com';
```

3. If missing, recreate user via Dashboard

### Empty pages?

Normal! You need to:
- Run constituency migration for data
- OR manually create entries via the application

### Connection error?

1. Check `.env` file has correct Supabase URL
2. Check Supabase project is active
3. Check network connection

---

## Next Steps

✅ **You're now ready to use the application!**

**Recommended actions**:
1. Create additional users via User Management
2. Add constituencies data (run migration #12)
3. Explore all features
4. Review `DATABASE_SETUP.md` for detailed information

---

## Summary of What You Have

### Pages Ready to Use:
- User Management - Create/Edit/Delete users
- Constituencies List - Manage constituencies
- Wards List - Manage wards
- Booths List - Manage polling booths

### Features Working:
- User authentication
- Role-based access control
- CRUD operations
- Sorting and filtering
- Search functionality
- CSV export
- Statistics dashboards

### Database Tables Created:
- 35+ tables for complete campaign management
- Row-level security configured
- Multi-tenant support ready
- Geographic data support (PostGIS)

---

**Total Time**: ~15 minutes
**Status**: ✅ Application fully functional

For detailed information, see `DATABASE_SETUP.md`
