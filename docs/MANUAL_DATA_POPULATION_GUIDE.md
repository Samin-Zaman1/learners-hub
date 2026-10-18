# 📝 Manual Data Population Guide - Frontend UI

Complete guide to manually populate all data types from the frontend interface.

---

## 🎯 Prerequisites

1. **Backend Running:** `cd apps/api && npm run start:dev` (Port 4000)
2. **Frontend Running:** `cd apps/web && npm run dev` (Port 3000)
3. **Database Ready:** Prisma migrations applied

---

## 👥 User Accounts (Already Seeded)

### Student Account
- **Email:** `student@example.com`
- **Password:** `Student@123`
- **Role:** STUDENT

### Instructor Accounts
- **Email:** `instructor1@example.com`
- **Password:** `Student@123`
- **Role:** INSTRUCTOR

- **Email:** `instructor2@example.com`
- **Password:** `Student@123`
- **Role:** INSTRUCTOR

---

## 📚 1. CREATE COURSES (As Instructor)

### Step-by-Step Flow:

#### A. Login as Instructor
1. Navigate to: `http://localhost:3000/login`
2. Enter credentials:
   - Email: `instructor1@example.com`
   - Password: `Student@123`
3. Click "Login"

#### B. Navigate to Course Creation
1. After login, you'll land on Instructor Dashboard
2. Click **"Create Course"** button (top right) OR
3. Navigate to: `http://localhost:3000/instructor/courses/create`

#### C. Fill Course Form

**Basic Information:**
```
Title: Introduction to Machine Learning
Code: CS401
Description: Learn the fundamentals of machine learning, including supervised and unsupervised learning algorithms.
Credits: 4
Semester: Fall 2025
Department: Computer Science
Schedule: Mon/Wed/Fri 10:00 AM - 11:30 AM
Location: Room 301
```

**Advanced Options:**
```
Max Enrollments: 30 (optional)
Prerequisites: CS201, MATH301 (optional)
Color: #667eea (blue) or choose from palette
```

#### D. Submit
1. Click **"Create Course"** button at bottom
2. Wait for success message
3. You'll be redirected to course details page

#### E. API Call Details
```
POST http://localhost:4000/courses
Headers: Authorization: Bearer <JWT_TOKEN>
Body: {
  "title": "Introduction to Machine Learning",
  "code": "CS401",
  "description": "...",
  "credits": 4,
  "semester": "Fall 2025",
  "department": "Computer Science",
  "schedule": "Mon/Wed/Fri 10:00 AM",
  "location": "Room 301",
  "maxEnrollments": 30,
  "color": "#667eea"
}

Response: {
  "id": "cm4...",
  "title": "Introduction to Machine Learning",
  "code": "CS401",
  "invitationCode": "ABCD-1234",
  ...
}
```

---

## 🎓 2. ENROLL STUDENTS IN COURSES

### Method 1: Generate Invitation Code (Instructor)

#### A. Get Invitation Code
1. Login as instructor
2. Navigate to: `http://localhost:3000/instructor/courses`
3. Click on any course card
4. View **"Invitation Code"** section (displays code like `ABCD-1234`)
5. Copy the code

#### B. Regenerate Code (if needed)
1. On course details page
2. Click **"Regenerate"** button in invitation code section
3. New code will be displayed

### Method 2: Student Enrolls via Code

#### A. Login as Student
1. Logout from instructor account
2. Login with: `student@example.com` / `Student@123`

#### B. Navigate to Enrollment Page
1. From sidebar, expand **"Courses"** menu
2. Click **"Enroll in Course"** OR
3. Navigate to: `http://localhost:3000/courses/enroll`

#### C. Enter Invitation Code
1. Type or paste the invitation code (e.g., `ABCD-1234`)
2. Click **"Preview Course"** button

#### D. Preview & Enroll
1. Dialog opens showing:
   - Course title, code, description
   - Instructor name
   - Credits, semester
2. Click **"Enroll Now"** button
3. Success message appears
4. You're enrolled!

#### E. API Calls
```
# Preview
GET http://localhost:4000/student/courses/preview/ABCD-1234
Response: { course details }

# Enroll
POST http://localhost:4000/student/courses/enroll
Body: { "invitationCode": "ABCD-1234" }
Response: { enrollment details }
```

---

## ✅ 3. CREATE TASKS (As Student)

### Step-by-Step Flow:

#### A. Navigate to Tasks Page
1. Login as student
2. From sidebar, click **"Tasks"** OR
3. Navigate to: `http://localhost:3000/tasks`

#### B. Open Create Dialog
1. Click **"+ Create Task"** button (top right)
2. Dialog opens with form

#### C. Fill Task Form

**Required Fields:**
```
Title: Complete ML Assignment 1
Description: Implement linear regression algorithm in Python
Due Date: 2025-12-20 (use date picker)
Priority: HIGH | MEDIUM | LOW
Type: assignment | quiz | exam | project | reading | other
Course: Select from dropdown (shows enrolled courses)
```

**Optional Fields:**
```
Due Time: 23:59 (HH:MM format)
Estimated Time: 5 hours
```

#### D. Submit
1. Click **"Create Task"** button
2. Task appears in the list
3. Dialog closes

#### E. Task Management
- **Update Status:** Use dropdown (PENDING → IN_PROGRESS → COMPLETED)
- **Update Progress:** Use slider (0-100%)
- **Edit Details:** Click edit icon
- **Delete:** Click delete icon

#### F. API Call
```
POST http://localhost:4000/dashboard/tasks
Body: {
  "title": "Complete ML Assignment 1",
  "description": "...",
  "dueDate": "2025-12-20",
  "dueTime": "23:59",
  "priority": "HIGH",
  "type": "assignment",
  "courseId": "cm4...",
  "estimatedTime": "5 hours"
}

Response: {
  "id": "cm4...",
  "title": "Complete ML Assignment 1",
  "status": "PENDING",
  "progress": 0,
  ...
}
```

---

## 📅 4. CREATE SCHEDULE EVENTS (Currently via API/Seed only)

**Note:** Schedule creation UI is not yet implemented in frontend. Use backend API directly:

### Via API (Using Postman/curl):

```bash
POST http://localhost:4000/schedule
Headers: 
  Authorization: Bearer <JWT_TOKEN>
  Content-Type: application/json
Body:
{
  "title": "Machine Learning Lecture",
  "instructor": "Dr. Smith",
  "startTime": "10:00",
  "endTime": "11:30",
  "type": "class",
  "location": "Room 301",
  "courseId": "cm4...",
  "date": "2025-12-16"
}
```

### Via Seed Script:
```bash
cd apps/api
npx ts-node prisma/seed.ts
```

**TODO:** Create frontend UI for schedule management (add to feature backlog)

---

## 📊 5. CREATE ACTIVITIES (Automatic + Manual via API)

### Automatic Creation
Activities are automatically created when you:
- ✅ Complete a task (creates SUBMISSION activity)
- ✅ Attend a class (creates ATTENDANCE activity via future feature)
- ✅ Submit a quiz (creates QUIZ activity)

### Manual Creation (via API):

```bash
POST http://localhost:4000/activities
Headers: 
  Authorization: Bearer <JWT_TOKEN>
  Content-Type: application/json
Body:
{
  "type": "ATTENDANCE",
  "title": "Attended ML Lecture",
  "description": "Week 3 - Linear Regression",
  "courseId": "cm4...",
  "status": "COMPLETED",
  "progress": 100
}

Types: ATTENDANCE | SUBMISSION | QUIZ | EXAM | ACHIEVEMENT | GRADE | CLASS | ASSIGNMENT | ANNOUNCEMENT
```

---

## 📢 6. CREATE ANNOUNCEMENTS (Instructor - via API only)

**Note:** Announcement creation UI not yet implemented. Use API:

```bash
POST http://localhost:4000/announcements
Headers: 
  Authorization: Bearer <JWT_TOKEN>
  Content-Type: application/json
Body:
{
  "courseId": "cm4...",
  "title": "Midterm Exam Date Change",
  "content": "The midterm exam has been rescheduled to December 18th at 2:00 PM.",
  "type": "ANNOUNCEMENT",
  "priority": "HIGH",
  "hasAttachment": false
}

Priority: HIGH | MEDIUM | LOW
Type: ANNOUNCEMENT | ASSIGNMENT | EXAM | EVENT | GENERAL | REMINDER
```

**TODO:** Create frontend UI for announcement management

---

## 🔄 Complete Data Population Flow

### Scenario: Instructor creates course, student enrolls and adds tasks

```
1. LOGIN AS INSTRUCTOR (instructor1@example.com)
   ↓
2. CREATE COURSE
   - Go to /instructor/courses/create
   - Fill form: "Data Structures" (CS201)
   - Submit → Gets invitation code: "WXYZ-5678"
   ↓
3. VIEW COURSE DETAILS
   - Navigate to /instructor/courses/{courseId}
   - See invitation code displayed
   - Share code with students
   ↓
4. LOGOUT
   ↓
5. LOGIN AS STUDENT (student@example.com)
   ↓
6. ENROLL IN COURSE
   - Go to /courses/enroll
   - Enter code: "WXYZ-5678"
   - Preview → Enroll
   ↓
7. VIEW ENROLLED COURSES
   - Dashboard shows new course
   - /courses shows course in "My Courses"
   ↓
8. CREATE TASKS FOR COURSE
   - Go to /tasks
   - Click "Create Task"
   - Fill form:
     * Title: "Study Binary Trees"
     * Course: Select "Data Structures"
     * Due: Tomorrow
     * Priority: HIGH
   - Submit
   ↓
9. MANAGE TASKS
   - Update status: PENDING → IN_PROGRESS
   - Update progress: 0% → 50%
   - Mark complete when done
   ↓
10. VIEW DASHBOARD
    - See new course in "Enrolled Courses"
    - See task in "Upcoming Tasks"
    - Activity chart updates automatically
    - Schedule shows course times
```

---

## 🎛️ Data Relationships

```
USER (Student)
  ├── ENROLLMENT (via invitation code)
  │   └── COURSE (created by instructor)
  ├── TASKS (manual creation)
  │   └── linked to COURSE
  ├── ACTIVITIES (auto-generated)
  │   └── linked to COURSE
  └── SCHEDULE EVENTS (shows courses)
      └── linked to COURSE

USER (Instructor)
  ├── COURSES (manual creation)
  │   ├── INVITATION CODE (auto-generated)
  │   ├── ENROLLMENTS (students join)
  │   ├── ANNOUNCEMENTS (future)
  │   └── MATERIALS (future)
  └── SCHEDULE EVENTS (future)
```

---

## 📋 Quick Reference Checklist

### As Instructor:
- [ ] Login at `/login`
- [ ] Create course at `/instructor/courses/create`
- [ ] View course details at `/instructor/courses/{id}`
- [ ] Copy invitation code from course page
- [ ] Monitor enrolled students
- [ ] Remove students if needed

### As Student:
- [ ] Login at `/login`
- [ ] Enroll in course at `/courses/enroll` (need invitation code)
- [ ] View enrolled courses at `/courses` or dashboard
- [ ] Create tasks at `/tasks`
- [ ] Update task status and progress
- [ ] View schedule at `/semester` or dashboard
- [ ] View activities at `/analytics` or dashboard

---

## 🚀 Testing Complete Flow

### 1. Test Course Creation & Enrollment (5 mins)

```bash
# Terminal 1: Start backend
cd apps/api
npm run start:dev

# Terminal 2: Start frontend
cd apps/web
npm run dev

# Browser:
1. http://localhost:3000/login
2. Login as instructor1@example.com
3. Create course: "Web Development 101"
4. Copy invitation code
5. Logout
6. Login as student@example.com
7. Go to /courses/enroll
8. Enter code
9. Enroll
10. Verify course appears in dashboard
```

### 2. Test Task Creation (2 mins)

```bash
# Browser (logged in as student):
1. Go to /tasks
2. Click "Create Task"
3. Fill form:
   - Title: "Complete Project Proposal"
   - Course: Select "Web Development 101"
   - Due: Next week
   - Priority: HIGH
4. Submit
5. Verify task appears in list
6. Change status to IN_PROGRESS
7. Set progress to 50%
8. Check dashboard - task should appear
```

### 3. Test Data Flow (1 min)

```bash
# Browser (logged in as student):
1. Dashboard → Check "Enrolled Courses" widget
   ✓ Shows "Web Development 101"
2. Dashboard → Check "Upcoming Tasks" widget
   ✓ Shows "Complete Project Proposal"
3. Dashboard → Check "Activity Chart"
   ✓ Shows activity data (after backend processes)
4. Dashboard → Check "My Schedule"
   ✓ Shows course schedule events
```

---

## 🔍 Troubleshooting

### Course not appearing after creation
**Problem:** Course created but not showing in instructor dashboard  
**Solution:**
1. Check API response in Network tab (F12)
2. Verify JWT token is valid (check localStorage)
3. Hard refresh page (Ctrl+F5)
4. Check backend logs for errors

### Cannot enroll with invitation code
**Problem:** "Invalid invitation code" error  
**Solution:**
1. Verify code is correct (case-sensitive)
2. Check if code was regenerated (old codes are invalidated)
3. Verify course has available spots (if maxEnrollments set)
4. Check if already enrolled in the course

### Tasks not showing course dropdown
**Problem:** Course dropdown is empty when creating task  
**Solution:**
1. Ensure student is enrolled in at least one course
2. Check enrollment status (must be ACTIVE)
3. Verify API call to `/student/courses/enrolled` returns data
4. Check browser console for errors

### Dashboard data not updating
**Problem:** New data doesn't appear on dashboard  
**Solution:**
1. React Query cache may be stale - wait 5 minutes
2. Or force refresh: Logout and login again
3. Or hard refresh: Ctrl+F5
4. Check React Query DevTools (if installed)

---

## 📊 Data Validation Rules

### Course Creation:
- ✅ Title: Required, 3-200 characters
- ✅ Code: Required, unique, 3-20 characters (e.g., CS101)
- ✅ Credits: Required, 1-12
- ✅ Semester: Required
- ✅ Color: Optional, hex format (#RRGGBB)

### Task Creation:
- ✅ Title: Required, 3-200 characters
- ✅ Description: Optional, max 1000 characters
- ✅ Due Date: Required, cannot be in past
- ✅ Priority: Required (HIGH, MEDIUM, LOW)
- ✅ Type: Required (assignment, quiz, exam, etc.)
- ✅ Course: Optional, must be enrolled if specified

### Enrollment:
- ✅ Invitation Code: Required, 8 characters (XXXX-XXXX)
- ✅ Must not be already enrolled
- ✅ Course must have available spots (if limited)

---

## 🎯 Next Steps / Feature Requests

### Missing UI Features (Need Implementation):
1. **Schedule Event Creation** - Create classes, exams, meetings from UI
2. **Announcement Creation** - Instructor creates announcements from UI
3. **Activity Manual Entry** - Manually log attendance, submissions
4. **Course Materials Upload** - Upload PDFs, videos, assignments
5. **Grade Management** - Instructor assigns grades to students
6. **Bulk Enrollment** - Upload CSV to enroll multiple students
7. **Course Editing** - Edit course details after creation
8. **Task Bulk Actions** - Mark multiple tasks as complete

### Currently Available via API Only:
- Schedule events → Use `POST /schedule`
- Announcements → Use `POST /announcements`
- Activities → Use `POST /activities`
- Grades → Use `POST /grades`

---

## 📞 API Endpoint Reference

### Courses:
```
POST   /courses                    Create course (instructor)
GET    /courses/:id                Get course details
GET    /instructor/courses         List instructor's courses
POST   /courses/:id/generate-code  Generate invitation code
GET    /courses/:id/invitation-code Get current code
```

### Enrollment:
```
POST   /student/courses/enroll     Enroll with code
GET    /student/courses/enrolled   List enrolled courses
DELETE /student/courses/:id/unenroll Unenroll from course
GET    /student/courses/preview/:code Preview before enroll
```

### Tasks:
```
POST   /dashboard/tasks            Create task
GET    /dashboard/tasks            List tasks (with filters)
PATCH  /dashboard/tasks/:id        Update task
DELETE /dashboard/tasks/:id        Delete task
GET    /dashboard/tasks/upcoming   Upcoming tasks
```

### Schedule:
```
POST   /schedule                   Create event
GET    /schedule/week              Week schedule
GET    /schedule/today             Today's schedule
PATCH  /schedule/:id               Update event
DELETE /schedule/:id               Delete event
```

### Activities:
```
POST   /activities                 Create activity
GET    /activities                 List activities
GET    /activities/recent          Recent activities
GET    /activities/weekly-stats    Weekly statistics (for chart)
```

---

## ✅ Summary

### Can Populate via UI ✅:
1. **Courses** - `/instructor/courses/create` (instructor)
2. **Enrollments** - `/courses/enroll` (student with code)
3. **Tasks** - `/tasks` (student)

### Must Use API 📡:
1. **Schedule Events** - `POST /schedule`
2. **Announcements** - `POST /announcements`
3. **Activities** - `POST /activities` (or auto-generated)

### Auto-Generated 🤖:
1. **Invitation Codes** - Created with course
2. **User IDs** - Created at signup
3. **Activity Timestamps** - Created with activities
4. **Weekly Stats** - Calculated from activities

---

**Last Updated:** December 12, 2025  
**Version:** 1.0  
**Status:** ✅ Complete and Tested
