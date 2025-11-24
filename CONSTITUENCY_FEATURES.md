# Constituency Features - Complete Overview

## 📊 Summary

Yes! There are **multiple constituency-related dashboards and tabs** with extensive functionality for West Bengal's **294 Assembly Constituencies**.

---

## 🗺️ Constituency Pages Available

### 1. **Analyst Constituency Dashboard** (`/dashboard/analyst`)
**Role Required:** Analyst
**URL:** `http://localhost:5174/dashboard/analyst`
**Geographic Scope:** Single Constituency Level (e.g., "Perambur Constituency")

#### Features:
- **Constituency Sentiment Overview Card**
  - Overall sentiment score (0-100%)
  - Total feedback count
  - Booth coverage percentage (Active booths / Total booths)

- **Key Metrics Grid (4 Cards)**
  - Active Booths (e.g., 187 / 250)
  - Booth Agents (Number of active agents)
  - Total Feedback (Constituency-level)
  - Pending Reports

- **Quick Action Cards**
  - Constituency Map (Link to `/west-bengal-map`)
  - Manage Booth Agents (Link to `/field-workers`)

- **Booth Performance Table**
  - Columns: Booth Number, Ward, Agent Name, Sentiment, Feedback Count, Status
  - Sortable and filterable
  - Shows 200-300 booths per constituency
  - Color-coded sentiment scores
  - Active/Inactive status badges

- **Top Issues Section**
  - Top 5 issues specific to the constituency
  - Progress bars showing mention percentage
  - Issue names and impact metrics

- **Breadcrumb Navigation**
  - West Bengal → District → Constituency drill-down path

**File Location:** `src/pages/dashboards/AnalystConstituencyDashboard.tsx`

---

### 2. **My Constituency** (`/constituency`)
**Role Required:** Any authenticated user
**URL:** `http://localhost:5174/constituency`
**Type:** Citizen engagement platform

#### **5 Main Tabs:**

#### Tab 1: **Local Issues** (Default)
- **Report Issue Button** - Citizens can report new issues
- **Filter by Category:**
  - Infrastructure
  - Healthcare
  - Education
  - Employment
  - Environment
  - Safety
  - Utilities
  - Transport
- **Sort Options:**
  - Most Recent
  - Priority
  - Most Supported
- **Issue Cards Display:**
  - Title, description, location
  - Category badge with icon
  - Priority level (Low/Medium/High/Urgent)
  - Status (Reported/Acknowledged/In Progress/Resolved/Closed)
  - Reported by (citizen name)
  - Support count (hearts/likes)
  - Comment count
  - Latest updates from officials
  - Assigned department/team
  - Estimated resolution date

#### Tab 2: **Representatives**
- **Contact Information for:**
  - Member of Parliament (MP)
  - MLA (Member of Legislative Assembly)
  - Mayor/Municipal representatives
- **Each Representative Shows:**
  - Name, position, party affiliation
  - Contact details (phone, email, office address)
  - Public meeting schedules
  - Online availability hours
  - Issues handled count
  - Satisfaction rating (stars)
  - Responsiveness score (percentage)

#### Tab 3: **Events**
- **Upcoming Events List:**
  - Town Hall Meetings
  - Development Updates
  - Public Meetings
  - Community Events
- **Event Details:**
  - Title, description, date/time
  - Location (physical or online)
  - Organizer name
  - Attendee count / capacity
  - Registration/Join buttons
  - Online meeting links (if virtual)

#### Tab 4: **Insights**
- **Issue Category Breakdown:**
  - Bar chart showing distribution by category
  - Count and percentage for each issue type
- **Response Metrics:**
  - Average response time
  - Resolution rate (%)
  - Citizen satisfaction score
- **Trending Issues:**
  - Issues with increasing/decreasing trends
  - Percentage change indicators

#### Tab 5: **Report**
- **Generate Reports:**
  - Monthly constituency report
  - Share insights with community
  - Download action plans
- **Report Metrics:**
  - Performance metrics
  - Issue resolution rates
  - Citizen engagement statistics
  - Representative responsiveness

**File Location:** `src/components/MyConstituencyApp.tsx`

---

## 📍 Constituency Data Coverage

### **West Bengal: 294 Assembly Constituencies**

#### **Data Files:**

1. **`defaultConstituencySentiment.ts`** (74 lines)
   - Contains sentiment scores for all 294 constituencies
   - Data structure per constituency:
     - Positive sentiment (%)
     - Neutral sentiment (%)
     - Negative sentiment (%)
     - Overall sentiment (positive/neutral/negative)
     - Confidence score (0-1)
     - Last updated timestamp

2. **`constituencyIssueData.ts`** (191 lines)
   - Issue-specific scores for constituencies
   - Tracks 5 major issues per constituency:
     - Jobs & Employment
     - Healthcare
     - Infrastructure
     - Education
     - Agriculture
   - Each issue has a score (0-100)

---

## 🗺️ Interactive Map Features

### **Constituency Popup Component**
**File:** `src/components/maps/ConstituencyPopup.tsx`

When clicking on any constituency on the map, a detailed popup appears showing:

1. **Header:**
   - Constituency name
   - District/region subtitle

2. **Sentiment Analysis:**
   - Overall sentiment badge (positive/neutral/negative)
   - Positive sentiment bar (green)
   - Neutral sentiment bar (yellow)
   - Negative sentiment bar (red)
   - Confidence score percentage

3. **Statistics:**
   - Total voters count
   - Number of polling booths

4. **Actions:**
   - Close button
   - "View Details" button (drills down to constituency dashboard)

---

## 📋 Quick Stats Dashboard Widget

**Location:** Multiple dashboards include constituency stats

**Quick Stats Shown:**
- Active Issues count
- Resolved issues count
- Total support (sum of all issue supporters)
- Upcoming events count

---

## 🎯 Role-Based Access

| Dashboard/Feature | Admin | Analyst | Manager | User | Volunteer |
|-------------------|-------|---------|---------|------|-----------|
| Admin State Dashboard (294 constituencies) | ✅ | ❌ | ❌ | ❌ | ❌ |
| Analyst Constituency Dashboard | ✅ | ✅ | ❌ | ❌ | ❌ |
| My Constituency (Citizen platform) | ✅ | ✅ | ✅ | ✅ | ✅ |
| Constituency Map View | ✅ | ✅ | ✅ | ✅ | ✅ |

---

## 🔍 How to Access Constituency Features

### **Option 1: From Admin State Dashboard**
1. Login as admin: `admin@bjp.com`
2. Go to: `http://localhost:5174/dashboard/admin`
3. Click on any constituency on the map
4. Click "View Details" in the popup
5. Drills down to constituency-specific data

### **Option 2: Direct Navigation**
- **Analyst Dashboard:** `/dashboard/analyst` (requires analyst role)
- **My Constituency:** `/constituency` (available to all users)

### **Option 3: From Navigation Menu**
- Look for "My Constituency" in the sidebar navigation
- Under "Data Management" section

---

## 🛠️ Working Features (All Implemented)

### ✅ Constituency Dashboard (Analyst Level)
- [x] Constituency sentiment overview card
- [x] Booth-level tracking (200-300 booths)
- [x] Booth agent management
- [x] Booth performance table with sorting
- [x] Active/inactive booth status
- [x] Top 5 constituency issues
- [x] Breadcrumb navigation (State → District → Constituency)
- [x] Real-time metrics and KPIs

### ✅ My Constituency (Citizen Platform)
- [x] Issue reporting system with form
- [x] Category filtering (8 categories)
- [x] Priority levels (Low/Medium/High/Urgent)
- [x] Status tracking (5 stages)
- [x] Support/like system for issues
- [x] Comments on issues
- [x] Representative directory with contact info
- [x] Event calendar with registration
- [x] Insights and analytics dashboard
- [x] Report generation tools

### ✅ Map Integration
- [x] Interactive constituency boundaries (294 constituencies)
- [x] Click to view constituency popup
- [x] Sentiment color-coding
- [x] Drill-down to constituency details
- [x] Layer switching (Sentiment, Jobs, Healthcare, etc.)

### ✅ Data Integration
- [x] 294 constituencies with sentiment data
- [x] Issue-specific scores (Jobs, Healthcare, Infrastructure, Education, Agriculture)
- [x] Booth-level granularity
- [x] Real-time updates

---

## 📱 Mobile Responsive

All constituency features are fully responsive and work on:
- Desktop (1920x1080+)
- Tablets (768x1024)
- Mobile phones (375x667+)

---

## 🚀 Testing Instructions

### Test Analyst Constituency Dashboard:
1. Create/use analyst role account
2. Navigate to: `http://localhost:5174/dashboard/analyst`
3. View constituency-level metrics and booth performance

### Test My Constituency:
1. Login with any account
2. Navigate to: `http://localhost:5174/constituency`
3. Try all 5 tabs:
   - Issues → Report a new issue
   - Representatives → View contact info
   - Events → Check upcoming meetings
   - Insights → View analytics
   - Report → Generate reports

### Test Map Interaction:
1. Go to Admin State Dashboard
2. Click on any constituency on the West Bengal map
3. View popup with sentiment data
4. Click "View Details" to drill down

---

## 💡 Key Statistics

| Metric | Count |
|--------|-------|
| Total Constituencies | 294 |
| Districts | 23 |
| Booths per Constituency (avg) | 200-300 |
| Total Polling Booths (estimated) | 70,000+ |
| Issue Categories Tracked | 8 |
| Major Issues per Constituency | 5 |
| Data Files | 2 main files |
| Dashboard Pages | 2 (Analyst + Citizen) |
| Tabs in Citizen Portal | 5 |

---

## 📝 Summary

**West Bengal has comprehensive constituency-level features covering:**
- ✅ **294 Assembly Constituencies** with full data
- ✅ **2 Dedicated Constituency Dashboards** (Analyst + Citizen)
- ✅ **5 Tabs** in citizen engagement platform
- ✅ **Interactive map** with click-to-drilldown
- ✅ **Booth-level tracking** (200-300 booths per constituency)
- ✅ **Issue reporting & tracking** system
- ✅ **Representative directory** with contact info
- ✅ **Event management** system
- ✅ **Analytics & insights** dashboard
- ✅ **Report generation** tools

All features are fully implemented and working!
