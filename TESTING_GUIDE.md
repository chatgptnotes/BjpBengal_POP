# Quick Testing Guide - Data Loading Fixes

## 🚀 Quick Start (3 minutes)

### Step 1: Start Application
```bash
npm run dev
```

### Step 2: Seed Database
1. Open browser: `http://localhost:5173/seed-data`
2. Click **"Seed Database Now"** button
3. Wait for green success log
4. You should see:
   ```
   ✅ Constituency data created
   ✅ Sentiment data created (30 records)
   ✅ Demographic data created (5 segments)
   ✅ Issue data created (5 issues)
   ✅ Sample voters created (50 voters)
   ✅ Social media posts created (2 posts)
   ✅ News articles created (2 articles)
   ```

### Step 3: Test Key Pages

#### A. Voter Database
```
URL: http://localhost:5173/voter-database
```
**Should Show:**
- Total Voters: 50
- Strong Support: ~15-20
- Moderate Support: ~20-25
- Demographics pie chart
- Voter list with names

**If Empty:**
- Blue banner with "Seed Database Now" button appears
- Click button to populate

---

#### B. Social Media Channels
```
URL: http://localhost:5173/social-media-channels
```
**Navigate to "Posts" tab**

**Should Show:**
- 2 social media posts
- Engagement metrics (likes, shares, comments)
- Platform icons

**If Empty:**
- Seed banner on Posts tab
- Click to populate database

---

#### C. Constituency Insights Dashboard
```
URL: http://localhost:5173/dashboard/constituency-insights
```
**Select "Beleghata - Kolkata" from dropdown**

**Should Show:**
- Sentiment data timeline
- Demographics panel
- Top 5 issues
- Historical voting data
- Leader analysis section

**If Empty:**
- Auto-seeds on mount (constituency leaders & election data)
- Sentiment data uses mock fallback if DB empty

---

#### D. Press Media Monitoring
```
URL: http://localhost:5173/press-media-monitoring
```
**Should Show:**
- News articles (mock data always available)
- Sentiment analysis
- Party comparison stats
- District detection

**Features:**
- "Save" button to save to database
- "Sync Now" to fetch real news from APIs

---

## 🧪 Detailed Test Scenarios

### Scenario 1: Fresh Database (Empty)
**Goal:** Verify empty state handling

1. Clear database (if possible) OR use fresh Supabase project
2. Navigate to each page:
   - `/voter-database` → Should show seed banner
   - `/social-media-channels` (Posts tab) → Should show seed banner
   - `/dashboard/constituency-insights` → Auto-seeds, shows data
3. Verify banners have:
   - Clear message
   - "Seed Database Now" button
   - "Open in New Tab" button
   - Quick start instructions

**Pass Criteria:**
✅ No blank/broken pages
✅ All banners display correctly
✅ Buttons navigate to `/seed-data`

---

### Scenario 2: Seeding Process
**Goal:** Verify data creation works correctly

1. Navigate to `/seed-data`
2. Click "Seed Database Now"
3. Watch console log output
4. Verify completion message

**Pass Criteria:**
✅ No console errors
✅ Log shows each step completing
✅ Final count shows:
   - 1 constituency
   - 30 sentiment records
   - 5 demographics
   - 5 issues
   - 50 voters
   - 2 social posts
   - 2 news articles
✅ Success message at end

---

### Scenario 3: Post-Seed Verification
**Goal:** Verify all data appears correctly

1. After seeding, refresh browser
2. Visit each page and check:

**Voter Database:**
- ✅ Total voters = 50
- ✅ Charts show data
- ✅ Voter list populated
- ✅ Ward distribution visible

**Social Media:**
- ✅ 2 posts in Posts tab
- ✅ Engagement metrics show
- ✅ Platform icons correct

**Constituency Insights:**
- ✅ Select Beleghata from dropdown
- ✅ All panels load
- ✅ No error messages
- ✅ Charts render

**Press Monitoring:**
- ✅ Articles display
- ✅ Sentiment stats calculate
- ✅ Party comparison works

---

### Scenario 4: Navigation Flow
**Goal:** Verify seed data page is accessible

1. Start on any page showing empty banner
2. Click "Seed Database Now" button
3. Should navigate to `/seed-data`
4. Seed completes
5. Use browser back button
6. Original page should now show data (may need refresh)

**Pass Criteria:**
✅ Navigation works smoothly
✅ No broken links
✅ Data persists after seeding

---

### Scenario 5: Re-seeding
**Goal:** Verify can seed multiple times without errors

1. Seed database once
2. Navigate to `/seed-data` again
3. Click "Seed Database Now" again
4. Should complete without errors (upsert behavior)

**Pass Criteria:**
✅ No duplicate errors
✅ Completes successfully
✅ Data still accessible

---

## 📊 Expected Results Summary

| Page | Empty State | After Seeding |
|------|-------------|---------------|
| Voter Database | Seed banner | 50 voters, charts populated |
| Social Media Channels | Seed banner on Posts | 2 posts with metrics |
| Constituency Insights | Auto-seeds, shows data | Full dashboard with real data |
| Press Monitoring | Mock data always | Can save to DB, fetch real news |

---

## 🐛 Common Issues & Fixes

### Issue: "Failed to load data" on Constituency Insights
**Likely Cause:** Database tables don't exist
**Fix:**
1. Run Supabase migrations
2. Check tables exist: `constituencies`, `sentiment_data`, etc.
3. Verify RLS policies

### Issue: Seed button does nothing
**Likely Cause:** Supabase connection issue
**Fix:**
1. Check `.env` file has correct Supabase URL and key
2. Check browser console for errors
3. Verify network connectivity

### Issue: Data disappears after refresh
**Likely Cause:** Data not actually saved to database
**Fix:**
1. Check Network tab - verify POST requests succeeded
2. Check Supabase dashboard - verify data in tables
3. Hard refresh browser (Cmd+Shift+R)

### Issue: Banners don't show
**Likely Cause:** Component import missing
**Fix:**
1. Check file imports in component
2. Verify `SeedDataBanner` component exists
3. Check console for import errors

---

## ✅ Checklist for Complete Test

- [ ] Seed data page accessible at `/seed-data`
- [ ] Seed button creates all data successfully
- [ ] Voter Database shows banner when empty
- [ ] Voter Database shows 50 voters after seeding
- [ ] Social Media shows banner on Posts tab when empty
- [ ] Social Media shows 2 posts after seeding
- [ ] Constituency Insights auto-seeds and displays data
- [ ] Press Monitoring displays articles
- [ ] All navigation links work
- [ ] No console errors
- [ ] All charts/graphs render
- [ ] Can re-seed without errors

---

## 🎯 Success Criteria

**All tests pass if:**
1. ✅ No blank/broken pages
2. ✅ Clear guidance when database is empty
3. ✅ One-click seeding works
4. ✅ All data displays correctly after seeding
5. ✅ No console errors during testing
6. ✅ Navigation flows smoothly

---

## 📝 Test Report Template

```
Test Date: __________
Tester: __________

RESULTS:
[ ] Seed Data Page Works
[ ] Voter Database - Empty State
[ ] Voter Database - With Data
[ ] Social Media - Empty State
[ ] Social Media - With Data
[ ] Constituency Insights - Loads Correctly
[ ] Press Monitoring - Shows Articles
[ ] Navigation - All Links Work
[ ] Re-seeding - No Errors

ISSUES FOUND:
1. ___________________________
2. ___________________________
3. ___________________________

OVERALL: PASS / FAIL

NOTES:
_________________________________
_________________________________
```

---

## 🚦 Quick Health Check

Run this quick check before demo:

```bash
# 1. Start app
npm run dev

# 2. Open browser console
# Navigate to: http://localhost:5173/seed-data

# 3. Click seed button
# Should see green logs

# 4. Check pages in order:
# - /voter-database (should show 50 voters)
# - /social-media-channels (Posts tab - 2 posts)
# - /dashboard/constituency-insights (full dashboard)
# - /press-media-monitoring (articles visible)

# 5. If ALL show data → READY FOR DEMO ✅
# If ANY show errors → Check console & fix
```

**Time Required:** 2-3 minutes
**Result:** Ready for demo or list of issues to fix
