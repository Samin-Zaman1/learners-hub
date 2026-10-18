# Instructor-Driven Architecture Design

## 🎯 Core Principle
**Instructors create all course content. Students consume and track their progress.**

---

## 📊 Schema Changes Required

### 1. **Task Model** - Change from user-specific to course-specific

**BEFORE:**
```prisma
model Task {
  id            String      @id @default(cuid())
  userId        String      // ❌ Individual student creates tasks
  courseId      String?
  // ...
}
```

**AFTER:**
```prisma
model Task {
  id            String      @id @default(cuid())
  courseId      String      // ✅ Required - instructor creates for course
  createdBy     String      // ✅ Instructor who created it
  title         String
  description   String?
  dueDate       DateTime
  type          String      // assignment, quiz, exam, reading
  priority      TaskPriority
  maxPoints     Int?        // Total points possible
  
  course        Course      @relation(fields: [courseId], references: [id])
  creator       User        @relation("CreatedTasks", fields: [createdBy], references: [id])
  submissions   TaskSubmission[] // Student submissions
}

// NEW: Track individual student progress
model TaskSubmission {
  id            String      @id @default(cuid())
  taskId        String
  studentId     String
  status        TaskStatus  @default(PENDING)
  progress      Int         @default(0)
  grade         String?
  points        Int?
  submittedAt   DateTime?
  feedback      String?
  
  task          Task        @relation(fields: [taskId], references: [id])
  student       User        @relation(fields: [studentId], references: [id])
  
  @@unique([taskId, studentId])
}
```

### 2. **ScheduleEvent Model** - Change to course-level

**BEFORE:**
```prisma
model ScheduleEvent {
  id         String   @id @default(cuid())
  userId     String   // ❌ Each student has own schedule
  courseId   String?
  // ...
}
```

**AFTER:**
```prisma
model ScheduleEvent {
  id            String   @id @default(cuid())
  courseId      String   // ✅ Required - course schedule
  createdBy     String   // ✅ Instructor who created
  title         String
  type          String   // class, lab, exam, office-hours
  startTime     String
  endTime       String
  location      String?
  recurrence    String?  // weekly, daily, one-time
  dayOfWeek     Int?     // 0=Sunday, 1=Monday, etc
  startDate     DateTime
  endDate       DateTime?
  
  course        Course   @relation(fields: [courseId], references: [id])
  creator       User     @relation("CreatedSchedules", fields: [createdBy], references: [id])
}
```

### 3. **Announcement Model** - Add creator tracking

**CURRENT (Good, but enhance):**
```prisma
model Announcement {
  id            String                @id @default(cuid())
  courseId      String?
  author        String  // ❌ Just a string
  // ...
}
```

**ENHANCED:**
```prisma
model Announcement {
  id            String                @id @default(cuid())
  courseId      String                // ✅ Required
  createdBy     String                // ✅ Instructor ID
  title         String
  content       String
  type          AnnouncementType
  priority      AnnouncementPriority
  isPinned      Boolean               @default(false)
  attachments   Json?
  
  course        Course                @relation(fields: [courseId], references: [id])
  creator       User                  @relation("CreatedAnnouncements", fields: [createdBy], references: [id])
  reads         AnnouncementRead[]
}
```

### 4. **Activity Model** - Keep student-specific (this is correct)

```prisma
model Activity {
  id          String       @id @default(cuid())
  userId      String       // ✅ Student's activity log
  courseId    String?
  taskId      String?      // NEW: Link to task
  type        ActivityType
  title       String
  timestamp   DateTime     @default(now())
  
  user        User         @relation(fields: [userId], references: [id])
  course      Course?      @relation(fields: [courseId], references: [id])
  task        Task?        @relation(fields: [taskId], references: [id])
}
```

---

## 🔄 Data Flow

### **Instructor Creates Task:**
```
1. Instructor goes to /instructor/courses/[id]/tasks
2. Creates task: "Assignment 1 - Calculus"
3. Backend creates ONE Task record (courseId = MATH301)
4. All enrolled students automatically see it
5. Backend auto-creates TaskSubmission for each enrolled student
```

### **Student Sees Task:**
```
1. Student logs in, goes to /dashboard
2. Frontend calls: GET /tasks (returns tasks from enrolled courses)
3. Shows all tasks with student's submission status
4. Student submits → updates TaskSubmission record
5. Activity auto-created when status changes
```

### **Instructor Creates Schedule:**
```
1. Instructor: "Math class every Monday 9-11am"
2. Creates ScheduleEvent (courseId, recurrence: weekly, dayOfWeek: 1)
3. All enrolled students see it on their calendar
```

---

## 🛠️ API Endpoint Changes

### **Instructor Endpoints (Create/Update/Delete):**
```
POST   /instructor/courses/:id/tasks          - Create assignment
GET    /instructor/courses/:id/tasks          - List course tasks
PUT    /instructor/courses/:id/tasks/:taskId  - Update task
DELETE /instructor/courses/:id/tasks/:taskId  - Delete task

POST   /instructor/courses/:id/schedule       - Create class schedule
GET    /instructor/courses/:id/schedule       - List course schedule
PUT    /instructor/courses/:id/schedule/:id   - Update event
DELETE /instructor/courses/:id/schedule/:id   - Delete event

POST   /instructor/courses/:id/announcements  - Create announcement
GET    /instructor/courses/:id/announcements  - List announcements
PUT    /instructor/courses/:id/announcements/:id
DELETE /instructor/courses/:id/announcements/:id

GET    /instructor/courses/:id/submissions    - See all student submissions
PUT    /instructor/courses/:id/submissions/:id - Grade submission
```

### **Student Endpoints (Read + Track Progress):**
```
GET    /student/tasks                         - All tasks from enrolled courses
GET    /student/tasks/:id                     - Task details
PUT    /student/tasks/:id/submit              - Submit/update submission
POST   /student/tasks/:id/complete            - Mark as completed

GET    /student/schedule                      - Calendar from enrolled courses
GET    /student/schedule/today                - Today's classes

GET    /student/announcements                 - All from enrolled courses
POST   /student/announcements/:id/read        - Mark as read

GET    /student/activities                    - Own activity log
```

---

## 🎨 UI Changes Needed

### **Instructor Portal - NEW Pages:**
1. `/instructor/courses/[id]/tasks` - Manage assignments
2. `/instructor/courses/[id]/schedule` - Set class times
3. `/instructor/courses/[id]/announcements` - Post updates
4. `/instructor/courses/[id]/submissions` - Grade student work

### **Student Dashboard - CHANGE:**
1. `/tasks` - READ ONLY list (can only update submission status)
2. `/schedule` - READ ONLY calendar (shows all enrolled courses)
3. `/announcements` - READ ONLY feed
4. Remove "Create Task" button ❌
5. Add "Submit" button on tasks ✅

---

## 📋 Migration Steps

1. **Schema Update** - Add new models, modify existing
2. **Create Migration** - `npx prisma migrate dev`
3. **Backend Services** - Create InstructorTaskService, etc.
4. **Backend Controllers** - Add instructor endpoints
5. **Frontend Components** - Build instructor management UIs
6. **Update Student UI** - Make read-only, add submission tracking
7. **Seed Data** - Update to use new structure
8. **Test Flow** - Instructor creates → Students see

---

## ✅ Benefits

- **Clear Ownership**: Instructors control all course content
- **Consistency**: All students see same tasks/schedule
- **Progress Tracking**: Individual submission status per student
- **Scalability**: One task → 1000 students (not 1000 task records)
- **Real LMS**: Matches Canvas, Blackboard, Moodle architecture
- **Grading**: Instructors can grade submissions centrally

---

## 🚀 Implementation Priority

**Phase 1 (High Priority):**
- [ ] Schema changes for Task → TaskSubmission
- [ ] Instructor task creation endpoints
- [ ] Student task viewing with submission status

**Phase 2 (Medium Priority):**
- [ ] Schedule event changes
- [ ] Announcement enhancements
- [ ] Student submission workflow

**Phase 3 (Nice to Have):**
- [ ] Grading interface
- [ ] Bulk task creation
- [ ] Schedule templates
