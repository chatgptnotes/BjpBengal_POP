# Database Setup Guide
## BjpBengal POP - Supabase Database Configuration

**Last Updated**: November 28, 2025
**Author**: Claude Code Assistant
**Project**: BJP West Bengal - Pulse of People Platform

---

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Quick Start](#quick-start)
3. [Detailed Setup Steps](#detailed-setup-steps)
4. [Migration Files Overview](#migration-files-overview)
5. [Testing & Verification](#testing--verification)
6. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before starting, ensure you have:

- ✅ Supabase account created
- ✅ New Supabase project created
- ✅ Supabase project URL and API keys
- ✅ Database password saved
- ✅ `.env` file configured with Supabase credentials

### Environment Variables

Your `.env` file should contain:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

---

## Quick Start

**⏱️ Estimated Time**: 30-40 minutes

### Step 1: Access Supabase SQL Editor

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor** in the left sidebar
3. Click **New Query**

### Step 2: Run Migrations in Order

Execute the migration files in this exact order:

```bash
# Core Schema & Structure (MUST run first)
1. 00_complete_schema.sql          # Main database schema (all tables)
2. 01_rls_policies.sql             # Row-level security policies

# Organization Setup
3. 03_dev_organization.sql         # Create development organization

# User Management
4. 04_auto_create_user_trigger.sql # Auto-create user on auth signup
5. 04_assign_dev_org_to_users.sql  # Assign users to dev organization
6. 05_fix_admin_user_organization.sql # Fix admin organization assignment
7. 11_fix_rls_for_seed_admins.sql  # Fix RLS for seed admin users

# Geographic Data (West Bengal)
8. 12_insert_all_constituencies.sql # Insert all WB constituencies

# Sample/Test Data
9. 06_insert_50_sample_voters.sql  # Insert 50 sample voters
10. 07_add_demographic_columns.sql  # Add demographic columns
11. 08_update_sample_voters_caste.sql # Update voter demographics
12. 09_add_booth_column.sql         # Add booth column to voters
13. 10_ensure_all_voter_columns.sql # Ensure all voter columns exist

# Additional Features
14. 02_voter_calls_schema.sql       # Voter calls tracking
15. 03_news_sentiment_tables.sql    # News sentiment analysis
16. 04_trending_topics.sql          # Trending topics tracking
17. 05_district_sentiment_ai.sql    # AI sentiment analysis
18. 09_voter_personas_schema.sql    # Voter personas/segmentation
19. 13_competitor_tracking_schema.sql # Competitor tracking

# (Run remaining migrations as needed)
```

### Step 3: Create Test Superadmin User

After running all migrations, create a superadmin user for testing:

**Option A - Via Supabase Dashboard**:
1. Go to **Authentication** > **Users**
2. Click **Add User**
3. Email: `admin@bjpwestbengal.org`
4. Password: `Admin@123` (change after first login)
5. Confirm email automatically

**Option B - Via SQL**:

```sql
-- First, create the auth user
INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
)
VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    'admin@bjpwestbengal.org',
    crypt('Admin@123', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{}',
    false,
    '',
    '',
    '',
    ''
);

-- Then, create the user profile (this should be auto-created by trigger)
-- If not, run manually:
INSERT INTO users (
    auth_user_id,
    email,
    username,
    first_name,
    last_name,
    role,
    organization_id,
    is_active
)
SELECT
    id,
    'admin@bjpwestbengal.org',
    'bjpadmin',
    'BJP',
    'Administrator',
    'superadmin',
    '00000000-0000-0000-0000-000000000001'::uuid,
    true
FROM auth.users
WHERE email = 'admin@bjpwestbengal.org';
```

---

## Detailed Setup Steps

### Phase 1: Core Database Structure (5-10 minutes)

#### File: `00_complete_schema.sql`
**What it does**:
- Creates all 35+ database tables
- Sets up organizations, users, permissions
- Creates geographic tables (constituencies, wards, polling booths)
- Sets up voter tracking and campaign management
- Enables PostGIS for geographic data
- Creates indexes for performance

**How to run**:
1. Open Supabase SQL Editor
2. Copy entire contents of `00_complete_schema.sql`
3. Paste and click **Run**
4. Wait for success message (should take 20-30 seconds)

**Tables Created**:
- `organizations` - Multi-tenant support
- `users` - User profiles
- `permissions`, `role_permissions`, `user_permissions` - RBAC
- `constituencies` - Electoral constituencies
- `wards` - Administrative wards
- `polling_booths` - Polling booth locations
- `voters` - Voter database
- Plus 25+ more tables

---

#### File: `01_rls_policies.sql`
**What it does**:
- Implements Row-Level Security (RLS)
- Ensures users only see their organization's data
- Protects sensitive voter and user information

**How to run**:
1. Copy contents of `01_rls_policies.sql`
2. Paste in new SQL Editor query
3. Click **Run**

**Security Features**:
- Organization-based data isolation
- Role-based access control
- Superadmin bypass for management

---

### Phase 2: Organization & User Setup (5 minutes)

#### File: `03_dev_organization.sql`
**What it does**:
- Creates "Development Organization" for testing
- UUID: `00000000-0000-0000-0000-000000000001`
- Subscription: Free plan, Active status

#### Files: User Management Triggers
- `04_auto_create_user_trigger.sql` - Automatically creates user profile when someone signs up
- `04_assign_dev_org_to_users.sql` - Assigns new users to dev organization
- `05_fix_admin_user_organization.sql` - Ensures admin users have correct organization
- `11_fix_rls_for_seed_admins.sql` - Fixes RLS for admin accounts

---

### Phase 3: Geographic Data (10-15 minutes)

#### File: `12_insert_all_constituencies.sql`
**What it does**:
- Inserts all West Bengal constituencies
- Includes assembly and parliamentary constituencies
- Adds geographic boundaries and demographic data

**Data Included**:
- 294 Assembly constituencies
- 42 Parliamentary constituencies
- District information
- Voter count estimates
- Reserved categories (SC/ST)

---

### Phase 4: Sample Data (5 minutes)

These files create test data for development:

- `06_insert_50_sample_voters.sql` - 50 sample voters
- `07_add_demographic_columns.sql` - Demographic fields
- `08_update_sample_voters_caste.sql` - Caste/category data
- `09_add_booth_column.sql` - Booth assignments
- `10_ensure_all_voter_columns.sql` - All voter fields

---

### Phase 5: Advanced Features (10 minutes)

Optional but recommended:

- `02_voter_calls_schema.sql` - Voter outreach tracking
- `03_news_sentiment_tables.sql` - News monitoring
- `04_trending_topics.sql` - Trending topics analysis
- `05_district_sentiment_ai.sql` - AI sentiment analysis
- `09_voter_personas_schema.sql` - Voter segmentation
- `13_competitor_tracking_schema.sql` - Opposition monitoring

---

## Migration Files Overview

### Critical Migrations (Must Run)
| Order | File | Purpose | Time |
|-------|------|---------|------|
| 1 | `00_complete_schema.sql` | Database structure | 30s |
| 2 | `01_rls_policies.sql` | Security policies | 15s |
| 3 | `03_dev_organization.sql` | Test organization | 5s |
| 4 | `04_auto_create_user_trigger.sql` | User auto-creation | 5s |
| 5 | `12_insert_all_constituencies.sql` | WB geography | 60s |

### Optional Migrations (Recommended)
| File | Purpose |
|------|---------|
| `06_insert_50_sample_voters.sql` | Test voter data |
| `02_voter_calls_schema.sql` | Call tracking |
| `09_voter_personas_schema.sql` | Voter segmentation |
| `13_competitor_tracking_schema.sql` | Competitor analysis |

---

## Testing & Verification

### Step 1: Verify Tables Created

Run this query to check all tables:

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
```

**Expected tables** (should see 35+):
- audit_logs
- constituencies
- organizations
- permissions
- polling_booths
- role_permissions
- user_permissions
- users
- voters
- wards
- (and many more...)

### Step 2: Verify Organization Created

```sql
SELECT * FROM organizations WHERE slug = 'dev-org';
```

**Expected result**:
- Name: "Development Organization"
- Subscription: "free"
- Status: "active"

### Step 3: Test User Login

1. Go to your application: `http://localhost:5173/`
2. Try to login with:
   - Email: `admin@bjpwestbengal.org`
   - Password: `Admin@123`
3. You should be redirected to the dashboard

### Step 4: Verify Data in Application

Navigate to these pages to verify:
- ✅ `/constituencies` - Should show West Bengal constituencies
- ✅ `/wards` - Should show wards (if seeded)
- ✅ `/booths` - Should show polling booths (if seeded)
- ✅ `/user-management` - Should show users

---

## Troubleshooting

### Issue: "relation does not exist"

**Cause**: Migrations run out of order
**Solution**:
1. Drop all tables: `DROP SCHEMA public CASCADE; CREATE SCHEMA public;`
2. Re-run migrations in correct order

### Issue: "permission denied for table"

**Cause**: RLS policies blocking access
**Solution**:
1. Verify user has correct role
2. Check organization_id matches
3. Temporarily disable RLS for testing:
   ```sql
   ALTER TABLE table_name DISABLE ROW LEVEL SECURITY;
   ```

### Issue: "duplicate key value violates unique constraint"

**Cause**: Running insert migrations multiple times
**Solution**:
- Most migrations use `ON CONFLICT DO NOTHING`
- Safe to re-run
- If error persists, check for duplicate data

### Issue: User can't see any data

**Cause**: Organization not assigned
**Solution**:
```sql
UPDATE users
SET organization_id = '00000000-0000-0000-0000-000000000001'
WHERE email = 'your-email@example.com';
```

### Issue: Login not working

**Checklist**:
1. ✅ User exists in `auth.users` table
2. ✅ Email is confirmed (`email_confirmed_at` is not null)
3. ✅ User profile exists in `users` table
4. ✅ Organization ID is assigned
5. ✅ `.env` file has correct Supabase credentials

---

## Next Steps After Setup

1. **Test Login** - Login with superadmin account
2. **Create Test Users** - Use User Management page to create users
3. **Add Sample Data** - Use upload pages for wards/booths
4. **Verify Features** - Test all CRUD operations on each page
5. **Review Reports** - Check analytics and reports functionality

---

## Support & Documentation

- **Supabase Docs**: https://supabase.com/docs
- **PostgreSQL Docs**: https://www.postgresql.org/docs/
- **PostGIS Docs**: https://postgis.net/documentation/

---

## Database Schema Summary

### Core Tables
- **organizations** - Multi-tenant organizations
- **users** - User profiles with roles
- **permissions** - Granular permissions
- **role_permissions** - Role-to-permission mapping
- **user_permissions** - User-specific overrides

### Geographic Tables
- **constituencies** - Electoral constituencies
- **wards** - Administrative wards
- **polling_booths** - Polling locations
- **voters** - Voter database

### Campaign Tables
- **campaigns** - Campaign management
- **campaign_teams** - Team assignments
- **voter_interactions** - Voter contact tracking
- **voter_calls** - Phone banking
- **door_to_door_visits** - Ground operations

### Analytics Tables
- **voter_personas** - Voter segmentation
- **sentiment_analysis** - Opinion tracking
- **news_articles** - Media monitoring
- **social_media_posts** - Social tracking
- **competitor_profiles** - Opposition research

---

**End of Database Setup Guide**

*For questions or issues, check the troubleshooting section or consult the Supabase documentation.*
