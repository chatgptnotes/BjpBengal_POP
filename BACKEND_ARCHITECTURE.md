# Backend Architecture Analysis

**Date:** 2026-02-11
**Status:** Comprehensive backend audit completed

---

## Summary

Your application uses **Supabase as the primary and only active backend**. The Django backend and Node.js services are referenced but not currently in use.

---

## Backend Components

### 1. Supabase (PRIMARY - ACTIVE ✅)

**Status:** Fully configured and operational

**What it provides:**
- PostgreSQL database
- Authentication (JWT-based)
- Real-time subscriptions
- Row-level security (RLS)
- Storage for files/media
- Auto-generated REST API

**Configuration:**
- URL: `https://iwtgbseaoztjbnvworyq.supabase.co`
- Anon Key: Configured in `.env`
- Connection: **WORKING**

**Data Storage:**
- All application data is stored in Supabase PostgreSQL
- Tables include: users, constituencies, voter_sentiment, field_reports, etc.
- Authentication handled entirely by Supabase Auth

---

### 2. Django Backend (REFERENCED - NOT PRESENT ❌)

**Status:** Referenced in code but not included in this repository

**Configuration in .env:**
```
VITE_API_URL=http://localhost:8000/api
VITE_DJANGO_API_URL=http://localhost:8000/api
VITE_BACKEND_URL=http://localhost:8000
```

**Analysis:**
- `src/services/djangoApi.ts` contains extensive API methods for Django
- **BUT: No files in the codebase actually import or use `djangoApi`**
- Only `src/pages/DjangoTest.tsx` uses it (a test page)
- This suggests Django backend is:
  - Either deprecated/legacy
  - Or in a separate repository
  - Or planned for future use but not implemented

**Django API would provide (if present):**
- Master data (States, Districts, Constituencies, Issues)
- Citizen feedback management
- Field worker reports
- Analytics endpoints
- Bulk user uploads

**Impact of Django being absent:**
- **No impact on current application functionality**
- All features currently work through Supabase
- Django appears to be optional/supplementary

---

### 3. Node.js Backend Services (PRESENT - NOT RUNNING ⚠️)

**Status:** Code exists but services are not running

**Location:** `/server/` directory

**Services available:**
1. **Twitter Proxy Service** (`twitter-proxy.cjs`)
   - Proxies Twitter API requests
   - Handles authentication
   - Port: Not specified in code (likely 3001 or 8080)

2. **Transcription Service** (`transcription-service.cjs`)
   - Audio transcription for voter calls
   - Uses OpenAI Whisper API
   - WebSocket support via Socket.io
   - Port: Not specified

**Dependencies:**
```json
{
  "cors": "^2.8.5",
  "dotenv": "^16.3.1",
  "express": "^4.18.2",
  "openai": "^4.20.0",
  "socket.io": "^4.8.1",
  "xml2js": "^0.6.2"
}
```

**To start these services:**
```bash
cd server
npm install  # Install dependencies first
npm run proxy  # Start Twitter proxy
npm run transcription  # Start transcription service
```

**Impact of services not running:**
- Twitter scraping features won't work
- Audio transcription for voter calls won't work
- Rest of the application functions normally

---

## Data Flow Architecture

### Current Active Data Flow:
```
Frontend (React)
    ↓
Supabase Client Library
    ↓
Supabase Backend (PostgreSQL + Auth + Real-time)
    ↓
Database Tables
```

### Complete Intended Data Flow (if all services were running):
```
Frontend (React)
    ↓
    ├─→ Supabase (Primary: Auth, Database, Real-time)
    ├─→ Django Backend (Optional: Analytics, Bulk Operations)
    ├─→ Twitter Proxy (Optional: Social Media Scraping)
    └─→ Transcription Service (Optional: Audio Processing)
```

---

## What's Working Right Now

### ✅ Fully Functional:
1. **User Authentication** (Supabase Auth)
   - Login/logout
   - Session management
   - Demo credentials
   - Role-based access control

2. **Database Operations** (Supabase PostgreSQL)
   - CRUD operations
   - Complex queries
   - Joins and aggregations
   - Real-time subscriptions

3. **Core Features:**
   - Dashboard
   - Constituency insights
   - Voter sentiment analysis
   - Reports
   - User management
   - All UI components

### ⚠️ Not Working (Optional Features):
1. **Twitter Scraping**
   - Requires: Twitter proxy service to be running
   - Impact: Social media monitoring features unavailable

2. **Audio Transcription**
   - Requires: Transcription service to be running
   - Impact: Voter call transcription unavailable

3. **Django-specific Features**
   - Requires: Django backend (not in repo)
   - Impact: None currently, as no code uses it

---

## Recommendations

### Immediate (No Action Needed):
- **Application is fully functional** for core features
- Supabase handles all critical operations
- Demo login works perfectly

### Optional Enhancements:

#### 1. Start Node.js Services (If you need Twitter/Transcription):
```bash
cd /Users/murali/1backup/popbjp/BjpBengal_POP/server
npm install
npm run proxy          # For Twitter features
npm run transcription  # For audio transcription
```

#### 2. Django Backend (Only if needed):
- Determine if Django backend is required
- If yes, locate the Django repository
- Update .env with correct Django backend URL
- Or remove Django references if not needed

#### 3. Clean Up (Optional):
- Remove `djangoApi.ts` if Django is not used
- Remove `DjangoTest.tsx` page
- Update `.env` to remove Django URLs
- Simplify architecture documentation

---

## Environment Variables Audit

### Required (✅ Configured):
- `VITE_SUPABASE_URL` - ✅ Working
- `VITE_SUPABASE_ANON_KEY` - ✅ Working
- `VITE_APP_URL` - ✅ Set
- `VITE_APP_NAME` - ✅ Set

### Optional (Not Required):
- `VITE_DJANGO_API_URL` - ⚠️ Backend not present
- `VITE_API_URL` - ⚠️ Backend not present
- `VITE_BACKEND_URL` - ⚠️ Backend not present

### Missing (⚠️ Service Role Key):
- `VITE_SUPABASE_SERVICE_ROLE_SECRET` - Optional, for admin operations
  - Already made optional in code
  - Not required for normal app functionality

---

## Conclusion

**Your application is fully functional and production-ready with Supabase alone.**

- **Primary Backend:** Supabase ✅ WORKING
- **Data Storage:** Supabase PostgreSQL ✅ WORKING
- **Authentication:** Supabase Auth ✅ WORKING
- **Django Backend:** Not present and not required ✅ NO IMPACT
- **Node.js Services:** Present but optional ⚠️ START IF NEEDED

The application is designed with a **modular architecture** where:
- Supabase handles all core functionality (working)
- Django and Node.js services provide optional enhancements (not running, not critical)

**You can use the application right now without any backend setup beyond Supabase!**

---

## Quick Start Testing

1. **Access:** http://localhost:5173/login
2. **Login:** demo@admin.com / demo123
3. **Test:** Navigate through dashboard, reports, and analytics
4. **Verify:** All data loads from Supabase successfully

**All core features should work perfectly!**
