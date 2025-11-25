# Demo Login Credentials

**Authentication has been bypassed for testing purposes.**

You can now login immediately without any database setup!

## Available Demo Accounts

### 1. Demo Admin (Superadmin)
- **Email:** `demo@admin.com`
- **Password:** `demo123`
- **Role:** Superadmin
- **Access:** Full access to all features including Constituency Insights Dashboard

### 2. Demo Analyst
- **Email:** `demo@analyst.com`
- **Password:** `demo123`
- **Role:** Analyst
- **Access:** Analytics and constituency dashboards

### 3. Demo Manager
- **Email:** `demo@manager.com`
- **Password:** `demo123`
- **Role:** Manager
- **Access:** District management features

### 4. Test User
- **Email:** `test@test.com`
- **Password:** `test123`
- **Role:** Superadmin
- **Access:** Full access to all features

---

## Quick Start

1. **Go to:** http://localhost:5174/login

2. **Login with any demo account above**

3. **Access the Constituency Insights Dashboard:**
   - After login, navigate to: http://localhost:5174/insights/constituency/wb_kolkata_bhowanipore
   - Or use the sidebar menu: Analytics → Constituency Insights

---

## Features Available

With demo login, you can test:
- ✅ Constituency Insights Dashboard (50 West Bengal constituencies)
- ✅ Time-series analysis (Live, 7/30/90 days, Last/Previous elections)
- ✅ Voter segment analysis (Youth, Women, SC/ST, OBC, Urban, Rural)
- ✅ All dashboard features without database constraints
- ✅ Full navigation and UI testing

---

## Notes

- **No database required** - Demo mode bypasses all authentication
- **Instant access** - No waiting for setup or configuration
- **All permissions granted** - Full access to test all features
- **Persistent across refreshes** - Session maintained in memory

---

## To Switch Back to Real Authentication

When you're ready to set up real authentication:
1. Remove or comment out the demo mode code in `src/contexts/AuthContext.tsx` (lines 285-320)
2. Complete the Supabase authentication setup
3. Use real credentials from the database

---

**Happy Testing! 🎉**
