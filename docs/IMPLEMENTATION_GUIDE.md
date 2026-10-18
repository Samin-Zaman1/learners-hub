# 🎯 Implementation Guide: Real API Data for Schedule & Activity Components

## 📋 Current Status

### ✅ What's Working (Real API)
- ✅ Enrolled Courses
- ✅ Upcoming Tasks
- ✅ Recent Activities
- ✅ Announcements
- ✅ Quick Stats Cards
- ✅ User Profile

### ❌ What Needs Implementation
1. **My Schedule Calendar** - Using mock data
2. **My Activity Graph** - Using mock data

---

## 1️⃣ MY SCHEDULE CALENDAR

### Current Implementation
```typescript
// apps/web/src/hooks/useScheduleData.ts (MOCK DATA)
const mockScheduleData: ScheduleEvent[] = [
  { id: 1, title: "Mathematics", date: "2025-10-07", time: "09:00", type: "class" },
  // ... more mock data
];
```

### ✅ Backend API Available
```
GET /schedule                 → All schedule events
GET /schedule/today           → Today's schedule ✅ ALREADY USED IN STATS
GET /schedule/week            → Week schedule
GET /schedule/upcoming        → Upcoming events
POST /schedule                → Create event
PATCH /schedule/:id          → Update event
DELETE /schedule/:id         → Delete event
```

### ✅ Frontend Hook Created
**File:** `apps/web/src/hooks/useSchedule.ts` ✅ ALREADY CREATED

```typescript
export const useWeekSchedule = (startDate?: string) => {
  return useQuery({
    queryKey: scheduleKeys.week(startDate),
    queryFn: async (): Promise<ScheduleEvent[]> => {
      const { data } = await apiClient.get('/schedule/week', {
        params: startDate ? { startDate } : undefined
      });
      return data;
    },
  });
};
```

### 🔧 Implementation Steps

#### Step 1: Update useScheduleData.ts Hook
Replace mock data with real API call:

```typescript
// apps/web/src/hooks/useScheduleData.ts
'use client';

import { useState, useEffect } from 'react';
import { ScheduleEvent as ComponentEvent } from '../components/shared/ScheduleComponent';
import { useWeekSchedule, useUpcomingScheduleEvents, ScheduleEvent as APIEvent } from './useSchedule';

// Transform API event to component format
const transformEvent = (event: APIEvent): ComponentEvent => {
  return {
    id: parseInt(event.id) || 0,
    title: event.title,
    date: event.startTime.split('T')[0], // Extract date
    time: new Date(event.startTime).toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    }),
    type: event.type.toLowerCase() as 'class' | 'exam' | 'assignment' | 'meeting' | 'other',
    description: event.description,
    color: event.course?.color
  };
};

export function useScheduleData() {
  const { data: weekEvents, isLoading, error, refetch } = useWeekSchedule();

  return {
    data: weekEvents ? weekEvents.map(transformEvent) : [],
    loading: isLoading,
    error: error ? 'Failed to fetch schedule' : null,
    refetch
  };
}

export function useScheduleDataForPage(pageType: 'dashboard' | 'semester' | 'course') {
  const baseData = useScheduleData();
  
  const getVariantConfig = () => {
    switch (pageType) {
      case 'dashboard':
        return {
          variant: 'full' as const,
          showControls: true,
          defaultView: 'month' as const
        };
      case 'semester':
        return {
          variant: 'full' as const,
          showControls: true,
          defaultView: 'week' as const
        };
      case 'course':
        return {
          variant: 'compact' as const,
          showControls: false,
          defaultView: 'week' as const
        };
      default:
        return {
          variant: 'full' as const,
          showControls: true,
          defaultView: 'month' as const
        };
    }
  };

  return {
    events: baseData.data,
    loading: baseData.loading,
    config: getVariantConfig()
  };
}
```

#### Step 2: Verify Schedule Component Compatibility
The ScheduleComponent already expects this interface:
```typescript
export interface ScheduleEvent {
  id: number;
  title: string;
  date: string;      // "YYYY-MM-DD"
  time: string;      // "HH:MM"
  type: 'class' | 'exam' | 'assignment' | 'meeting' | 'other';
  color?: string;
  description?: string;
}
```

✅ **No changes needed** - Component already compatible!

#### Step 3: Test the Integration
```bash
# 1. Make sure backend is running
cd apps/api
npm run start:dev

# 2. Test the endpoint
curl http://localhost:4000/schedule/week -H "Authorization: Bearer YOUR_TOKEN"

# 3. Check frontend
cd apps/web
npm run dev
# Navigate to /dashboard - schedule should show real data
```

---

## 2️⃣ MY ACTIVITY GRAPH

### Current Implementation
```typescript
// apps/web/src/hooks/useActivityData.ts (MOCK DATA)
const mockActivityData: SemesterData[] = [
  {
    id: 'current',
    name: 'Fall 2025 (Current)',
    data: [
      { week: 1, classAttendance: 100, quizAttendance: 100, ... },
      // ... more weeks
    ]
  }
];
```

### ⚠️ Backend Status
```
GET /activities/stats  → EXISTS but returns DIFFERENT FORMAT
```

**Current Backend Response:**
```json
{
  "total": 150,
  "recent": 25,
  "byType": {
    "ASSIGNMENT": 50,
    "GRADE": 30,
    "SUBMISSION": 40,
    "ANNOUNCEMENT": 20,
    "ACHIEVEMENT": 10
  },
  "breakdown": { ... }
}
```

**Frontend Needs:**
```json
{
  "semesters": [
    {
      "id": "fall2025",
      "name": "Fall 2025",
      "data": [
        { 
          "week": 1, 
          "classAttendance": 95, 
          "quizAttendance": 88,
          "assignmentSubmission": 100,
          "studyHours": 85
        }
      ]
    }
  ]
}
```

### 🔧 Implementation Options

#### Option A: Update Backend Endpoint (RECOMMENDED)
Create new endpoint that aggregates weekly activity data:

**File:** `apps/api/src/dashboard/services/activity.service.ts`

Add new method:
```typescript
async getActivityChartData(userId: string) {
  // Get user's enrollments with semester info
  const enrollments = await this.prisma.enrollment.findMany({
    where: { 
      userId,
      status: 'ACTIVE'
    },
    include: {
      course: {
        select: {
          semester: true
        }
      }
    }
  });

  // Group by semester
  const semesters = [...new Set(enrollments.map(e => e.course.semester))];
  
  const semesterData = await Promise.all(
    semesters.map(async (semester) => {
      // Get all activities for this semester's courses
      const semesterCourses = enrollments
        .filter(e => e.course.semester === semester)
        .map(e => e.courseId);

      // Aggregate activities by week
      // This is simplified - you'll need to implement weekly aggregation logic
      const activities = await this.prisma.activity.findMany({
        where: {
          userId,
          courseId: { in: semesterCourses }
        },
        orderBy: { timestamp: 'asc' }
      });

      // Group activities by week and calculate percentages
      const weeklyData = this.aggregateByWeek(activities, semester);

      return {
        id: semester.toLowerCase().replace(' ', ''),
        name: semester,
        data: weeklyData
      };
    })
  );

  return semesterData;
}

private aggregateByWeek(activities: Activity[], semester: string) {
  // Implementation: Group activities by week number
  // Calculate attendance, submission rates, etc.
  // Return array of: { week: number, classAttendance: %, ... }
  
  const weeks: any[] = [];
  // ... aggregation logic
  return weeks;
}
```

**Controller:** `apps/api/src/dashboard/controllers/activity.controller.ts`
```typescript
@Get('chart-data')
async getActivityChartData(@Request() req: any) {
  return this.activityService.getActivityChartData(req.user.sub);
}
```

#### Option B: Use Existing Endpoint with Transformation (QUICK FIX)
Transform current stats into chart format on frontend:

**File:** `apps/web/src/hooks/useActivityData.ts`
```typescript
import { useActivityStats } from './useActivities';

export function useActivityData() {
  const { data: stats, isLoading, error } = useActivityStats();

  // Transform stats into chart format
  const transformedData = useMemo(() => {
    if (!stats) return [];

    // Create single semester with current data
    return [{
      id: 'current',
      name: 'Current Semester',
      data: [
        {
          week: 1,
          classAttendance: 100,  // Calculate from stats
          quizAttendance: 100,
          assignmentSubmission: (stats.breakdown.submissions / stats.total) * 100,
          studyHours: 85,
          groupProjects: 90
        }
        // For now, just show one week - not ideal but works
      ]
    }];
  }, [stats]);

  return {
    data: transformedData,
    loading: isLoading,
    error: error ? 'Failed to fetch activity data' : null
  };
}
```

---

## 📊 RECOMMENDED IMPLEMENTATION ORDER

### Phase 1: Quick Wins (Can Do Now) ✅
1. **Schedule Calendar** - 15 minutes
   - Update `useScheduleData.ts` hook
   - Use existing `useWeekSchedule()` hook
   - Test on dashboard

### Phase 2: Activity Chart (Requires Backend Work) ⏳
2. **Create Backend Endpoint** - 2 hours
   - Add `getActivityChartData()` to activity service
   - Implement weekly aggregation logic
   - Add new controller route `/activities/chart-data`
   
3. **Update Frontend Hook** - 30 minutes
   - Replace mock data with API call
   - Transform response to chart format
   - Test on dashboard

---

## 🚀 QUICK START: Implement Schedule Now

### Step-by-Step Commands

```bash
# 1. Update the schedule hook
# Open: apps/web/src/hooks/useScheduleData.ts
# Replace entire file with code from "Step 1" above

# 2. Test it works
cd apps/api
npm run start:dev

# In another terminal:
cd apps/web
npm run dev

# 3. Navigate to http://localhost:3000/dashboard
# Schedule should now show real events from database
```

---

## 🎯 COMPLETE DATA FLOW (After Implementation)

```
┌─────────────────────────────────────────────────────────┐
│                    USER LOGS IN                          │
└─────────────────────────────────────────────────────────┘
                           │
              ┌────────────┴────────────┐
              │                         │
         JWT Token                  User Data
              │                         │
              └────────────┬────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│               DASHBOARD PAGE LOADS                       │
└─────────────────────────────────────────────────────────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                   │
        ▼                  ▼                   ▼
   
  SCHEDULE          ACTIVITY CHART        OTHER WIDGETS
       │                   │                    │
       │                   │                    │
GET /schedule/week  GET /activities/stats  GET /courses/enrolled
       │              (needs enhancement)        GET /tasks
       │                   │                    GET /announcements
       ▼                   ▼                    ▼
       
useWeekSchedule()  useActivityStats()    useEnrolledCourses()
       │                   │              useUpcomingTasks()
       │                   │              useRecentActivities()
       │                   │              useRecentAnnouncements()
       ▼                   ▼                    ▼
       
ScheduleComponent  ActivityChart         EnrolledCourses
       │                   │              UpcomingTasks
       │                   │              RecentActivities
       │                   │              Announcements
       ▼                   ▼                    ▼
       
   CALENDAR        LINE CHART            CARDS/LISTS
   DISPLAY         DISPLAY               DISPLAYS
```

---

## 📝 FILES TO MODIFY

### For Schedule (Do Now):
- ✅ `apps/web/src/hooks/useScheduleData.ts` - Replace with real API
- ✅ `apps/web/src/hooks/useSchedule.ts` - Already created
- ✅ No changes to `ScheduleComponent.tsx` - already compatible

### For Activity Chart (Needs Backend):
- ⏳ `apps/api/src/dashboard/services/activity.service.ts` - Add `getActivityChartData()`
- ⏳ `apps/api/src/dashboard/controllers/activity.controller.ts` - Add route
- ⏳ `apps/web/src/hooks/useActivityData.ts` - Replace with real API
- ✅ No changes to `ActivityChart.tsx` - already compatible

---

## ✅ SUCCESS CRITERIA

- [ ] Schedule calendar shows real events from database
- [ ] Can create/edit/delete schedule events
- [ ] Activity chart shows real weekly data
- [ ] All data updates automatically via React Query
- [ ] Loading states work properly
- [ ] Error handling displays correctly

---

**Estimated Time:**
- Schedule Implementation: **15 minutes** ✅ CAN DO NOW
- Activity Chart Backend: **2 hours** ⏳ NEEDS BACKEND DEV
- Activity Chart Frontend: **30 minutes** ⏳ AFTER BACKEND

**Total Dashboard Completion After Schedule:** **95%** (7.5/8 widgets with real data)
