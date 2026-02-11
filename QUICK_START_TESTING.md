# Quick Start Testing Guide
**Application**: Pulse of People - BJP Bengal Dashboard
**Status**: ✅ Ready for Testing
**Date**: 2026-02-11

---

## 🚀 Immediate Testing Steps

### 1. Access the Application
```
URL: http://localhost:5173/
```

### 2. Login
```
Navigate to: http://localhost:5173/login

Credentials:
Email:    demo@admin.com
Password: demo123
Role:     Superadmin
```

### 3. Verify Dashboard
```
After login, you should see:
- Dashboard with analytics
- Charts and visualizations
- Navigation menu
- User profile
```

---

## ✅ Pre-Test Verification

### Check Dev Server
```bash
# Verify server is running
lsof -ti:5173

# Should show process IDs
# If not running: npm run dev
```

### Check Browser Console
```
Open browser DevTools (F12)
Look for:
✅ [Supabase] ✓ Client initialized successfully
✅ No red errors
✅ No failed network requests
```

---

## 🧪 Testing Checklist

### Priority 1: Critical Path
- [ ] **Home Page** - http://localhost:5173/
  - Loads without errors
  - Navigation works

- [ ] **Login Page** - http://localhost:5173/login
  - Form displays correctly
  - Can enter credentials
  - Login button works

- [ ] **Authentication**
  - Login with demo@admin.com / demo123
  - Redirects to dashboard
  - User session persists

- [ ] **Dashboard** - http://localhost:5173/dashboard
  - Page loads without errors
  - Data displays correctly
  - Charts render

### Priority 2: Core Features
- [ ] **Navigation**
  - Menu items accessible
  - Routes work correctly
  - Back button functional

- [ ] **Database Connectivity**
  - Data loads from Supabase
  - No connection errors
  - Queries execute successfully

- [ ] **Permissions**
  - Superadmin has full access
  - Protected routes work
  - Permission checks active

### Priority 3: UI Components
- [ ] **Charts & Visualizations**
  - Charts render correctly
  - Data updates properly
  - No rendering errors

- [ ] **Forms**
  - Input fields work
  - Validation works
  - Submit actions work

- [ ] **Modals & Dialogs**
  - Open/close correctly
  - Content displays
  - Actions work

---

## 🐛 What to Look For

### Browser Console
**Good Signs** ✅:
```
[Supabase] Initializing client...
[Supabase] ✓ Client initialized successfully
[Login] ✓ Authentication successful
```

**Bad Signs** ❌:
```
Error: Network request failed
TypeError: Cannot read property...
Failed to fetch
Authentication error
```

### Visual Issues
**Check For**:
- Broken images
- Layout issues
- Missing styles
- Animation glitches
- Loading indicators stuck

### Functionality Issues
**Test**:
- Buttons respond to clicks
- Forms accept input
- Navigation works
- Data updates
- Logout works

---

## 📊 Expected Behavior

### Login Flow
```
1. Navigate to /login
   ↓
2. Enter: demo@admin.com / demo123
   ↓
3. Click "Sign In"
   ↓
4. See loading indicator
   ↓
5. Redirect to /dashboard
   ↓
6. Dashboard displays with data
```

### Dashboard Display
```
Should see:
- Header with logo and user menu
- Sidebar navigation
- Main content area with:
  - Overview statistics
  - Charts (voter sentiment, trends)
  - Recent activities
  - Quick actions
```

---

## 🔧 Troubleshooting

### Login Fails
```bash
# Check Supabase connection
# Look for console errors
# Verify credentials
# Clear browser cache
# Try incognito mode
```

### Dashboard Empty
```bash
# Check browser console
# Verify auth succeeded
# Check Supabase RLS policies
# Verify database has data
```

### Page Won't Load
```bash
# Check dev server running
lsof -ti:5173

# Restart server
npm run dev

# Clear cache
rm -rf .vite
npm run dev
```

### Build Errors
```bash
# Reinstall dependencies
rm -rf node_modules
npm install

# Rebuild
npm run build
```

---

## 📱 Browser Compatibility

**Recommended Browsers**:
- ✅ Chrome (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Edge (latest)

**Not Supported**:
- ❌ Internet Explorer
- ❌ Old browser versions

---

## 🎯 Success Criteria

### Minimum Viable Test
```
✅ Application loads
✅ Login works
✅ Dashboard displays
✅ No console errors
✅ Navigation works
```

### Full Test Pass
```
✅ All pages load
✅ All features work
✅ No errors in console
✅ Data updates correctly
✅ UI responsive
✅ Performance acceptable
```

---

## 📞 Getting Help

### If Stuck
1. Check `DIAGNOSTIC_SUMMARY.md` for detailed info
2. Review `FIXES_APPLIED.md` for what was fixed
3. Check browser console for specific errors
4. Review Supabase dashboard for database issues

### Log Files
```bash
# Browser console (F12)
# Network tab for API calls
# Supabase logs in dashboard
```

---

## 🎉 Test Complete

After successful testing, document:
- [ ] What works correctly
- [ ] What needs fixing
- [ ] Any performance issues
- [ ] Any UX improvements
- [ ] Browser-specific issues

---

## Quick Commands

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Check TypeScript
npx tsc --noEmit

# Install dependencies
npm install

# Clear cache and restart
rm -rf .vite node_modules
npm install
npm run dev
```

---

## Test Credentials Reference

```
SUPERADMIN:
Email:    demo@admin.com
Password: demo123

Other test accounts available in Login page
(Click "Other Demo Credentials")
```

---

**Ready to Test!** 🚀

**Start here**: http://localhost:5173/login
**Credentials**: demo@admin.com / demo123
**Expected**: Successful login → Dashboard with data

Good luck with testing!
