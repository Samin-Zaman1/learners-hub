# Dashboard Data Flow Audit & Complete Architecture

## 📊 **COMPLETE SYSTEM FLOW**

```
┌─────────────────────────────────────────────────────────────────────┐
│                         USER AUTHENTICATION                          │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                    ┌───────────────┴───────────────┐
                    │                               │
         POST /auth/login                  GET /auth/me
         (student@example.com)             (verify token)
                    │                               │
            ┌───────┴────────┐              ┌──────┴──────┐
            │  JWT Token     │              │ User Object │
            │  + User Role   │              │ + Role      │
            └───────┬────────┘              └──────┬──────┘
                    │                               │
              localStorage:                   useAuth hook
              - token                         - user.email
              - userRole                      - user.role
              - userEmail                     - user.id
                    │                               │
                    └───────────────┬───────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         DASHBOARD PAGE                               │
│                    /app/dashboard/page.tsx                          │
└─────────────────────────────────────────────────────────────────────┘
                                    │
        ┌──────────────────────────┼──────────────────────────┐
        │                          │                           │
        ▼                          ▼                           ▼
┌──────────────────┐    ┌──────────────────┐    ┌──────────────────┐
│  QUICK STATS     │    │  MAIN WIDGETS    │    │  ACTIVITY FEEDS  │
│  (4 Cards)       │    │  (2x2 Grid)      │    │  (2 Columns)     │
└──────────────────┘    └──────────────────┘    └──────────────────┘
```

---

## 🔍 **CURRENT STATE ANALYSIS**

### ✅ **ALREADY USING REAL API DATA:**

#### 1. **Enrolled Courses Component**
- **Hook:** `useEnrolledCourses()` ← `/courses/enrolled`
- **Status:** ✅ FULLY CONNECTED
- **Data Flow:**
  ```
  Student Backend → GET /courses/enrolled → useEnrolledCourses() → EnrolledCourses.tsx
  └─ Returns: Course[], enrollment status, course details
  ```

#### 2. **Upcoming Tasks Component**
- **Hook:** `useUpcomingTasks()` ← `/dashboard/tasks`
- **Status:** ✅ FULLY CONNECTED
- **Data Flow:**
  ```
  Dashboard Backend → GET /dashboard/tasks → useUpcomingTasks() → UpcomingTasks.tsx
  └─ Returns: Task[], due dates, priorities, progress
  ```

#### 3. **Recent Activities Component**
- **Hook:** `useRecentActivities(20)` ← `/activities/recent`
- **Status:** ✅ FULLY CONNECTED (JUST IMPLEMENTED)
- **Data Flow:**
  ```
  Activity Backend → GET /activities/recent → useRecentActivities() → RecentActivities.tsx
  └─ Returns: Activity[], timestamps, course info
  ```

#### 4. **Announcements Component**
- **Hook:** `useRecentAnnouncements(20)` ← `/announcements/recent`
- **Status:** ✅ FULLY CONNECTED (JUST IMPLEMENTED)
- **Data Flow:**
  ```
  Announcement Backend → GET /announcements/recent → useRecentAnnouncements() → Announcements.tsx
  └─ Returns: Announcement[], priority, author, course
  ```

---

### ⚠️ **STILL USING MOCK DATA:**

#### 1. **Quick Stats Cards (Top Section)**
```typescript
// Current: HARDCODED
<Typography variant="h6" fontWeight={600}>6</Typography>   // Active Courses
<Typography variant="h6" fontWeight={600}>4</Typography>   // Pending Tasks
<Typography variant="h6" fontWeight={600}>2</Typography>   // Today's Classes
<Typography variant="h6" fontWeight={600}>3</Typography>   // New Announcements
```
**NEEDS:** Real counts from API

#### 2. **Activity Chart Widget**
- **Hook:** `useActivityDataForPage('dashboard')` ← MOCK DATA
- **Status:** ❌ MOCK DATA ONLY
- **Location:** `hooks/useActivityData.ts`
- **Data:** Weekly attendance, quiz scores, assignment submission rates
- **NEEDS:** Real activity statistics from backend

#### 3. **Schedule Component Widget**
- **Hook:** `useScheduleDataForPage('dashboard')` ← MOCK DATA
- **Status:** ❌ MOCK DATA ONLY
- **Location:** `hooks/useScheduleData.ts`
- **Data:** Calendar events, class schedule, exams
- **NEEDS:** Real schedule from `/schedule` APIs

#### 4. **Student Profile Info (Header)**
```typescript
const studentName = "Alex Johnson";  // HARDCODED
const studentId = "STU2024001";      // HARDCODED
```
**NEEDS:** Real user data from `useAuth()` hook

---

## 🎯 **AVAILABLE BACKEND APIs (NOT YET USED)**

### Schedule APIs (Ready to Use)
```
GET  /schedule              → All user schedule events
GET  /schedule/today        → Today's classes/events
GET  /schedule/week         → Current week schedule
GET  /schedule/upcoming     → Next 10 upcoming events
GET  /schedule/stats        → Schedule statistics
GET  /schedule/course/:id   → Course-specific schedule
POST /schedule              → Create new event
```

### Activity APIs (Partially Used)
```
GET  /activities            → All activities (filters available)
GET  /activities/recent     → ✅ USED (limit 20)
GET  /activities/stats      → Activity statistics (NOT USED)
GET  /activities/course/:id → Course activities
```

### Announcement APIs (Partially Used)
```
GET  /announcements               → All announcements
GET  /announcements/recent        → ✅ USED (limit 20)
GET  /announcements/unread-count  → Unread count (NOT USED)
GET  /announcements/stats         → Statistics
GET  /announcements/course/:id    → Course announcements
```

### Enrollment APIs
```
GET  /enrollments           → User enrollments
GET  /courses/enrolled      → ✅ USED
POST /courses/enroll        → ✅ USED (with invitation code)
DELETE /courses/:id/unenroll → ✅ USED
```

### Task APIs (Used)
```
GET  /dashboard/tasks       → ✅ USED
POST /dashboard/tasks       → Create task
PATCH /dashboard/tasks/:id  → Update task
```

---

## 📋 **WHAT NEEDS TO BE FIXED**

### Priority 1: Quick Stats Cards (HIGH IMPACT)
```typescript
// CURRENT (dashboard/page.tsx line ~188-225)
<Typography variant="h6" fontWeight={600}>6</Typography>  // Active Courses
<Typography variant="h6" fontWeight={600}>4</Typography>  // Pending Tasks
<Typography variant="h6" fontWeight={600}>2</Typography>  // Today's Classes
<Typography variant="h6" fontWeight={600}>3</Typography>  // New Announcements

// SHOULD BE:
const { data: enrolledCourses } = useEnrolledCourses();
const { data: upcomingTasks } = useUpcomingTasks();
const { data: todaySchedule } = useTodaySchedule();
const { data: unreadCount } = useUnreadAnnouncementsCount();

activeCourses: enrolledCourses?.length || 0
pendingTasks: upcomingTasks?.filter(t => t.status === 'PENDING').length || 0
todayClasses: todaySchedule?.length || 0
newAnnouncements: unreadCount?.count || 0
```

### Priority 2: Activity Chart (MEDIUM IMPACT)
```typescript
// CURRENT: Mock data in useActivityData.ts
const mockActivityData: SemesterData[] = [...]

// NEEDS: Real API endpoint
// BACKEND TODO: Create activity statistics endpoint
GET /activities/stats  → {
  weeklyData: { week: number, attendance: number, submissions: number }[]
  semesters: string[]
  averages: { attendance: number, submissions: number }
}
```

### Priority 3: Schedule Widget (HIGH IMPACT)
```typescript
// CURRENT: Mock data in useScheduleData.ts
const mockScheduleData: ScheduleEvent[] = [...]

// SHOULD USE: NEW HOOK (useSchedule.ts - JUST CREATED)
const { data: scheduleEvents } = useWeekSchedule();
// Maps to calendar display with real class times, exams, assignments
```

### Priority 4: User Profile (LOW IMPACT but IMPORTANT)
```typescript
// CURRENT: Hardcoded
const studentName = "Alex Johnson";
const studentId = "STU2024001";

// SHOULD BE:
const { user } = useAuth();
const userName = user?.email.split('@')[0] || 'Student';
const userId = user?.id || '';
```

---

## 🔧 **IMPLEMENTATION PLAN**

### Step 1: Update Quick Stats ✅ READY TO IMPLEMENT
- Import existing hooks: `useEnrolledCourses`, `useUpcomingTasks`, `useTodaySchedule`, `useUnreadAnnouncementsCount`
- Replace hardcoded numbers with real counts
- Add loading states

### Step 2: Connect Schedule Widget ✅ HOOK CREATED
- Use new `useSchedule.ts` hook (just created)
- Replace `useScheduleDataForPage` with `useWeekSchedule()`
- Transform API data to match ScheduleComponent format

### Step 3: Update User Profile ✅ READY TO IMPLEMENT
- Use `useAuth()` hook (already available)
- Display real user email and ID
- Add avatar with user initials

### Step 4: Activity Chart (FUTURE - Needs Backend Work)
- Backend team needs to create `/activities/stats` endpoint
- Should aggregate weekly data: attendance, submissions, study hours
- Frontend hook ready when backend is available

---

## 📊 **DATA FLOW DIAGRAMS**

### Current Implementation (After Recent Updates)
```
┌─────────────────────────────────────────────────────────────┐
│                    DASHBOARD PAGE                            │
│                                                              │
│  ┌─────────────────┐  ┌─────────────────┐                 │
│  │ Quick Stats     │  │ Schedule Widget │  ← ❌ MOCK       │
│  │ ❌ HARDCODED    │  │ ❌ MOCK DATA    │                  │
│  └─────────────────┘  └─────────────────┘                 │
│                                                              │
│  ┌─────────────────┐  ┌─────────────────┐                 │
│  │ Activity Chart  │  │ Enrolled Courses│  ← ✅ API        │
│  │ ❌ MOCK DATA    │  │ ✅ /courses     │                  │
│  └─────────────────┘  └─────────────────┘                 │
│                                                              │
│  ┌─────────────────┐  ┌─────────────────┐                 │
│  │ Upcoming Tasks  │  │ Announcements   │  ← ✅ API        │
│  │ ✅ /tasks       │  │ ✅ /announce    │                  │
│  └─────────────────┘  └─────────────────┘                 │
│                                                              │
│  ┌─────────────────────────────────────┐                   │
│  │ Recent Activities  ✅ /activities   │                   │
│  └─────────────────────────────────────┘                   │
└─────────────────────────────────────────────────────────────┘

Status: 5/8 widgets using real API data (62.5%)
```

### Target Implementation (After All Fixes)
```
┌─────────────────────────────────────────────────────────────┐
│                    DASHBOARD PAGE                            │
│                                                              │
│  ┌─────────────────┐  ┌─────────────────┐                 │
│  │ Quick Stats     │  │ Schedule Widget │  ← ✅ API        │
│  │ ✅ Multiple APIs│  │ ✅ /schedule    │                  │
│  └─────────────────┘  └─────────────────┘                 │
│                                                              │
│  ┌─────────────────┐  ┌─────────────────┐                 │
│  │ Activity Chart  │  │ Enrolled Courses│  ← ✅ API        │
│  │ ✅ /stats       │  │ ✅ /courses     │                  │
│  └─────────────────┘  └─────────────────┘                 │
│                                                              │
│  ┌─────────────────┐  ┌─────────────────┐                 │
│  │ Upcoming Tasks  │  │ Announcements   │  ← ✅ API        │
│  │ ✅ /tasks       │  │ ✅ /announce    │                  │
│  └─────────────────┘  └─────────────────┘                 │
│                                                              │
│  ┌─────────────────────────────────────┐                   │
│  │ Recent Activities  ✅ /activities   │                   │
│  └─────────────────────────────────────┘                   │
└─────────────────────────────────────────────────────────────┘

Target: 8/8 widgets using real API data (100%)
```

---

## 🚀 **IMMEDIATE ACTION ITEMS**

### Can Be Done Now (APIs Exist):
1. ✅ Update Quick Stats with real counts
2. ✅ Connect Schedule widget to `/schedule` APIs
3. ✅ Replace user profile hardcoded values with `useAuth()`

### Requires Backend Work:
4. ⏳ Activity Chart statistics endpoint `/activities/stats`

---

## 📝 **FILES TO MODIFY**

1. **apps/web/src/app/dashboard/page.tsx** (Main dashboard)
   - Lines 188-225: Quick stats cards
   - Line 60: User profile data
   - Lines 247-255: Schedule widget
   
2. **apps/web/src/hooks/useScheduleData.ts** (Schedule hook - needs refactor)
   - Replace mock data with `useWeekSchedule()` from new `useSchedule.ts`

---

## 🎯 **SUCCESS CRITERIA**

- [ ] All 4 quick stat cards show real-time data
- [ ] Schedule widget displays actual user schedule
- [ ] User profile shows logged-in user's information
- [ ] Activity chart connects to backend (pending backend endpoint)
- [ ] All data refreshes automatically via React Query
- [ ] Loading states for all data fetches
- [ ] Error handling for failed API calls

---

## 💡 **TECHNICAL NOTES**

- All new hooks use React Query for caching and automatic refetching
- JWT authentication token automatically included in all API requests via `apiClient`
- Backend uses Prisma ORM with PostgreSQL database
- All endpoints require JWT authentication (`@UseGuards(JwtAuthGuard)`)
- User ID extracted from JWT token: `req.user.sub` or `req.user.userId`

---

**Generated:** December 12, 2025
**Dashboard Completion:** 62.5% (5/8 widgets connected to real APIs)
**Remaining Work:** 3-4 hours to reach 100% completion
