# 📊 Left Sidebar Navigation Structure

Complete navigation hierarchy organized as **Tab → Sub-items**

---

## 📍 Left Sidebar Layout

The sidebar has **2 levels**:
1. **Primary Sidebar** (64px wide, collapsed) - Shows icons only
2. **Secondary Sidebar** (280px wide) - Opens on hover/click with full menu items

---

## 🗂️ Navigation Structure

### **Tab 1: Main Dashboard** (Blue - #3B82F6)
├── 1.1 POP Dashboard → `/dashboard/legacy` [Badge: Live]
└── 1.2 Role-Based Dashboard → `/dashboard/legacy`

**Total items:** 2

---

### **Tab 2: Data Intelligence** (Green - #10B981)
├── **2.1 Voter Personas** → `/voter-personas` [Badge: ML]
│   ├── 2.1.1 → Persona Library → `/voter-personas?tab=0`
│   ├── 2.1.2 → Persona Comparison → `/voter-personas?tab=1`
│   ├── 2.1.3 → Geographic Map → `/voter-personas?tab=2`
│   ├── 2.1.4 → Trends & Migration → `/voter-personas?tab=3`
│   ├── 2.1.5 → Persuasion Scoring → `/voter-personas/persuasion` [Badge: New]
│   └── 2.1.6 → Audience Export → `/voter-personas/export`
├── 2.2 Social Media Channels → `/social-media-channels`
├── 2.3 TV Broadcast Analysis → `/tv-broadcast-analysis`
├── 2.4 Press Monitoring → `/press-media-monitoring`
├── 2.5 Influencer Tracking → `/influencer-tracking`
├── 2.6 Voter Sentiment Analysis → `/voter-sentiment-analysis` [Badge: AI]
├── 2.7 Voice Agent Chat → `/voice-agent-chat` [Badge: AI]
├── 2.8 Conversation Bot → `/conversation-bot`
├── 2.9 Political Polling → `/political-polling`
├── 2.10 Data Capture Kit → `/data-kit`
└── 2.11 Data Submission → `/submit-data`

**Total items:** 17 (including 6 sub-items under Voter Personas)

---

### **Tab 3: Analytics & Insights** (Purple - #8B5CF6)
├── 3.1 Analytics Dashboard → `/analytics-dashboard`
├── 3.2 Advanced Charts → `/advanced-charts`
├── 3.3 AI Insights → `/ai-insights`
├── 3.4 Reports → `/reports`
├── 3.5 Competitor Analysis → `/competitor-analysis`
└── 3.6 Data Tracking → `/data-tracking`

**Total items:** 6

---

### **Tab 4: Competitor Intelligence** (Orange - #F59E0B)
├── 4.1 Competitor Registry → `/competitors/registry`
├── 4.2 Social Media Monitor → `/competitors/monitor`
├── 4.3 Sentiment Dashboard → `/competitors/sentiment`
├── 4.4 Competitor Analysis → `/competitor-analysis`
└── 4.5 Competitor Tracking → `/competitor-tracking`

**Total items:** 5

---

### **Tab 5: Maps & Territory** (Cyan - #06B6D4)
├── 5.1 Regional Map → `/regional-map`
├── 5.2 West Bengal Map → `/west-bengal-map`
├── 5.3 Voter Database → `/voter-database`
├── 5.4 My Constituency → `/constituency`
├── **5.5 Wards Management**
│   ├── 5.5.1 Wards List → `/wards`
│   ├── 5.5.2 Upload Wards → `/wards/upload` [Badge: New]
│   └── 5.5.3 Wards & Booths Analytics → `/wards-booths/analytics`
└── **5.6 Booths Management**
    ├── 5.6.1 Booths List → `/booths`
    ├── 5.6.2 Upload Booths → `/booths/upload` [Badge: New]
    └── 5.6.3 Booths Map → `/booths/map`

**Total items:** 11 (including Wards & Booths sub-sections)

---

### **Tab 6: Campaign Operations** (Pink - #EC4899)
├── 6.1 Field Workers → `/field-workers`
├── 6.2 Data Capture Kit → `/data-kit`
└── 6.3 Data Tracking → `/data-tracking`

**Total items:** 3

---

### **Tab 7: Alerts & Engagement** (Red - #EF4444)
├── 7.1 Alert Center → `/alerts`
├── 7.2 Social Listening → `/social-media-channels`
└── 7.3 Bot Engagement → `/conversation-bot`

**Total items:** 3

---

### **Bottom Section (Always Visible)**

#### **Tab 8: Settings** (Gray - #6B7280)
├── 8.1 General Settings → `/settings`
├── 8.2 Profile Settings → `/settings`
└── 8.3 Social Media Settings → `/settings`

**Total items:** 3

---

#### **User Actions** (Not a tab, fixed buttons)
├── User Profile → Profile dropdown menu
└── Notifications [Badge: 3] → Notifications panel

---

## 📊 Summary Statistics

| Tab | Category | Items | Color |
|-----|----------|-------|-------|
| 1 | Main Dashboard | 2 | Blue |
| 2 | Data Intelligence | 17 | Green |
| 3 | Analytics & Insights | 6 | Purple |
| 4 | Competitor Intelligence | 5 | Orange |
| 5 | Maps & Territory | 11 | Cyan |
| 6 | Campaign Operations | 3 | Pink |
| 7 | Alerts & Engagement | 3 | Red |
| 8 | Settings | 3 | Gray |

**Total Navigation Items:** 50+

---

## 🔍 Constituency-Related Items

### **In Tab 5 (Maps & Territory):**

**Item 5.4: My Constituency** → `/constituency`

This opens the **citizen engagement platform** with **5 internal tabs**:

1. **Local Issues Tab**
   - Report new issues
   - Filter by 8 categories
   - View, support, and comment on issues
   - Track issue status

2. **Representatives Tab**
   - MP, MLA, Mayor contact info
   - Meeting schedules
   - Performance ratings

3. **Events Tab**
   - Town halls
   - Community meetings
   - Online events

4. **Insights Tab**
   - Issue analytics
   - Response metrics
   - Trending topics

5. **Report Tab**
   - Generate reports
   - Download data
   - Share insights

---

## 🎯 How Navigation Works

### **Step 1: Click Primary Sidebar Icon**
User clicks one of the 7 colored icons on the left (64px sidebar)

### **Step 2: Secondary Sidebar Opens**
A 280px sidebar slides in from the left showing all menu items for that category

### **Step 3: Click Menu Item**
User clicks a specific menu item to navigate to that page

### **Step 4: Auto-Close (Optional)**
If not pinned, the secondary sidebar auto-closes after navigation

---

## 📱 Special Features

### **Pin/Unpin**
- Click the pin icon to keep secondary sidebar open
- Unpinned sidebar auto-closes after navigation

### **Tooltips**
- Hover over primary sidebar icons to see category names
- Instant visual feedback

### **Active State**
- Active category shows colored icon
- Active menu item highlighted in blue
- Left border indicator on active category

### **Badges**
- "Live" - Real-time data
- "ML" - Machine learning powered
- "AI" - AI-powered feature
- "New" - Recently added feature

---

## 🗺️ Constituency Access Paths

### **Path 1: Direct from Maps Tab**
Tab 5 (Maps & Territory) → Item 5.4 (My Constituency)

### **Path 2: From Admin State Dashboard**
Admin Dashboard → Click constituency on map → View Details → Drills to constituency page

### **Path 3: URL Direct**
Navigate to: `http://localhost:5174/constituency`

---

## 📂 File Locations

**Primary Sidebar:** `src/components/navigation/PrimarySidebar.tsx:36-87`
- Defines 7 main categories + Settings
- Icon-only collapsed view (64px)

**Secondary Sidebar:** `src/components/navigation/SecondarySidebar.tsx:1`
- Expandable menu with full item names (280px)
- Shows when category is selected

**Menu Data:** `src/components/navigation/menuData.ts:60-347`
- Complete menu structure
- All 50+ navigation items
- URL routes for each item

---

## 🎨 Visual Design

### **Primary Sidebar (Icon Bar)**
- Width: 64px (fixed)
- Background: Dark gray (#1F2937)
- Icons: White (#FFFFFF) → Colored on hover/active
- Tooltips appear on hover

### **Secondary Sidebar (Menu Panel)**
- Width: 280px (slides in/out)
- Background: Light gray (#F9FAFB)
- Items: Dark text (#374151)
- Active items: Blue background (#EFF6FF)
- Hover: Light gray (#F3F4F6)

### **Badges**
- Background: Light blue (#DBEAFE)
- Text: Dark blue (#1E40AF)
- Border radius: 12px
- Font size: 11px

---

## 🚀 Quick Reference

**Most Used Navigation Items:**

1. **Admin State Dashboard** → Click "Main Dashboard" icon → Select dashboard
2. **West Bengal Map** → Tab 5 (Maps) → Item 5.2
3. **My Constituency** → Tab 5 (Maps) → Item 5.4
4. **Voter Personas** → Tab 2 (Data Intelligence) → Item 2.1
5. **Social Media** → Tab 2 (Data Intelligence) → Item 2.2
6. **Analytics** → Tab 3 (Analytics) → Item 3.1
7. **Field Workers** → Tab 6 (Operations) → Item 6.1
8. **Settings** → Bottom tab → Settings

---

**File:** `SIDEBAR_NAVIGATION_STRUCTURE.md`
**Total Tabs:** 8 (7 main + 1 bottom)
**Total Menu Items:** 50+
**Constituency Items:** 1 main + 5 internal tabs
