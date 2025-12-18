import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting comprehensive database seeding...\n');

  // Create password hash
  const passwordHash = await bcrypt.hash('Student@123', 10);

  // ========== USERS ==========
  console.log('👥 Creating users...');
  
  // Students
  const students: any[] = [];
  const studentEmails = [
    { email: 'alice.johnson@example.com', firstName: 'Alice', lastName: 'Johnson' },
    { email: 'bob.smith@example.com', firstName: 'Bob', lastName: 'Smith' },
    { email: 'charlie.brown@example.com', firstName: 'Charlie', lastName: 'Brown' },
    { email: 'diana.prince@example.com', firstName: 'Diana', lastName: 'Prince' },
    { email: 'eve.anderson@example.com', firstName: 'Eve', lastName: 'Anderson' },
    { email: 'frank.miller@example.com', firstName: 'Frank', lastName: 'Miller' },
    { email: 'grace.lee@example.com', firstName: 'Grace', lastName: 'Lee' },
    { email: 'henry.wilson@example.com', firstName: 'Henry', lastName: 'Wilson' },
  ];

  for (const studentData of studentEmails) {
    const student = await prisma.user.upsert({
      where: { email: studentData.email },
      update: {},
      create: { 
        email: studentData.email, 
        passwordHash,
        firstName: studentData.firstName,
        lastName: studentData.lastName,
        role: 'STUDENT',
        verified: true,
        profileImage: `https://ui-avatars.com/api/?name=${studentData.firstName}+${studentData.lastName}&background=random`
      }
    });
    students.push(student);
  }
  console.log(`✅ Created ${students.length} students`);

  // Instructors
  const instructors: any[] = [];
  const instructorEmails = [
    { email: 'dr.wilson@example.com', firstName: 'Sarah', lastName: 'Wilson' },
    { email: 'prof.chen@example.com', firstName: 'Michael', lastName: 'Chen' },
    { email: 'dr.rodriguez@example.com', firstName: 'Emily', lastName: 'Rodriguez' },
    { email: 'prof.martinez@example.com', firstName: 'Carlos', lastName: 'Martinez' },
  ];

  for (const instrData of instructorEmails) {
    const instructor = await prisma.user.upsert({
      where: { email: instrData.email },
      update: {},
      create: { 
        email: instrData.email, 
        passwordHash,
        firstName: instrData.firstName,
        lastName: instrData.lastName,
        role: 'INSTRUCTOR',
        verified: true,
        profileImage: `https://ui-avatars.com/api/?name=${instrData.firstName}+${instrData.lastName}&background=random`
      }
    });
    instructors.push(instructor);
  }
  console.log(`✅ Created ${instructors.length} instructors\n`);

  const [instructor1, instructor2, instructor3, instructor4] = instructors;

  // ========== COURSES ==========
  console.log('📚 Creating courses...');
  
  const courses: any[] = [];
  const coursesData = [
    {
      title: 'Advanced Calculus',
      code: 'MATH301',
      description: 'Comprehensive study of differential and integral calculus, series, and multi-variable calculus.',
      instructorId: instructor1.id,
      color: '#1e40af',
      credits: 4,
      semester: 'Spring 2025',
      status: 'ACTIVE' as const,
      level: 'Advanced',
      maxEnrollments: 30,
      invitationCode: 'MATH301-2025'
    },
    {
      title: 'Physics Laboratory',
      code: 'PHYS201',
      description: 'Hands-on physics experiments covering mechanics, thermodynamics, and electromagnetism.',
      instructorId: instructor1.id,
      color: '#0d9488',
      credits: 3,
      semester: 'Spring 2025',
      status: 'ACTIVE' as const,
      level: 'Intermediate',
      maxEnrollments: 25,
      invitationCode: 'PHYS201-2025'
    },
    {
      title: 'Data Structures & Algorithms',
      code: 'CS301',
      description: 'In-depth study of fundamental data structures and algorithm design techniques.',
      instructorId: instructor2.id,
      color: '#10b981',
      credits: 4,
      semester: 'Spring 2025',
      status: 'ACTIVE' as const,
      level: 'Advanced',
      maxEnrollments: 35,
      invitationCode: 'CS301-2025'
    },
    {
      title: 'Web Development Fundamentals',
      code: 'CS201',
      description: 'Introduction to modern web development with HTML, CSS, JavaScript, and React.',
      instructorId: instructor2.id,
      color: '#3b82f6',
      credits: 3,
      semester: 'Spring 2025',
      status: 'ACTIVE' as const,
      level: 'Beginner',
      maxEnrollments: 40,
      invitationCode: 'CS201-2025'
    },
    {
      title: 'English Literature',
      code: 'ENG250',
      description: 'Analysis of classic and contemporary English literature from various periods.',
      instructorId: instructor3.id,
      color: '#8b5cf6',
      credits: 3,
      semester: 'Spring 2025',
      status: 'ACTIVE' as const,
      level: 'Intermediate',
      maxEnrollments: 30,
      invitationCode: 'ENG250-2025'
    },
    {
      title: 'Organic Chemistry',
      code: 'CHEM301',
      description: 'Study of carbon compounds, reaction mechanisms, and synthesis strategies.',
      instructorId: instructor3.id,
      color: '#06b6d4',
      credits: 4,
      semester: 'Spring 2025',
      status: 'ACTIVE' as const,
      level: 'Advanced',
      maxEnrollments: 28,
      invitationCode: 'CHEM301-2025'
    },
    {
      title: 'Modern History',
      code: 'HIST201',
      description: 'Exploration of 20th and 21st century world events and their impacts.',
      instructorId: instructor4.id,
      color: '#f97316',
      credits: 3,
      semester: 'Spring 2025',
      status: 'ACTIVE' as const,
      level: 'Intermediate',
      maxEnrollments: 35,
      invitationCode: 'HIST201-2025'
    },
    {
      title: 'Introduction to Psychology',
      code: 'PSY101',
      description: 'Fundamentals of human behavior, cognition, and psychological processes.',
      instructorId: instructor4.id,
      color: '#ec4899',
      credits: 3,
      semester: 'Spring 2025',
      status: 'ACTIVE' as const,
      level: 'Beginner',
      maxEnrollments: 45,
      invitationCode: 'PSY101-2025'
    }
  ];

  for (const courseData of coursesData) {
    const course = await prisma.course.upsert({
      where: { code: courseData.code },
      update: { ...courseData, updatedAt: new Date() },
      create: { ...courseData, updatedAt: new Date() }
    });
    courses.push(course);
  }
  console.log(`✅ Created ${courses.length} courses\n`);

  const [mathCourse, physicsCourse, dsaCourse, webDevCourse, litCourse, chemCourse, historyCourse, psychCourse] = courses;

  // ========== ENROLLMENTS ==========
  console.log('📝 Enrolling students in courses...');
  
  let enrollmentCount = 0;
  // Enroll students in various courses
  const enrollmentMap = [
    { student: students[0], courses: [mathCourse, physicsCourse, dsaCourse, webDevCourse] },
    { student: students[1], courses: [mathCourse, webDevCourse, litCourse, psychCourse] },
    { student: students[2], courses: [physicsCourse, chemCourse, dsaCourse] },
    { student: students[3], courses: [webDevCourse, litCourse, historyCourse, psychCourse] },
    { student: students[4], courses: [mathCourse, chemCourse, dsaCourse] },
    { student: students[5], courses: [physicsCourse, webDevCourse, historyCourse] },
    { student: students[6], courses: [litCourse, psychCourse, chemCourse] },
    { student: students[7], courses: [mathCourse, dsaCourse, historyCourse] },
  ];

  for (const { student, courses: studentCourses } of enrollmentMap) {
    for (const course of studentCourses) {
      const existing = await prisma.enrollment.findUnique({
        where: {
          userId_courseId: {
            userId: student.id,
            courseId: course.id
          }
        }
      });

      if (!existing) {
        await prisma.enrollment.create({
          data: {
            userId: student.id,
            courseId: course.id,
            progress: Math.floor(Math.random() * 80) + 10, // 10-90%
            status: 'ACTIVE'
          }
        });
        enrollmentCount++;
      }
    }
  }
  console.log(`✅ Created ${enrollmentCount} enrollments\n`);

  // ========== TASKS & SUBMISSIONS ==========
  console.log('📋 Creating tasks and submissions...');
  
  const tasksData = [
    // Math Course Tasks
    { title: 'Calculus Problem Set 1', description: 'Solve derivatives and integrals from Chapter 3', courseId: mathCourse.id, userId: instructor1.id, createdBy: instructor1.id, dueDate: new Date('2025-12-20'), dueTime: '23:59', priority: 'HIGH' as const, type: 'assignment', maxPoints: 100, estimatedTime: '3 hours' },
    { title: 'Linear Algebra Quiz', description: 'Matrix operations and eigenvalues', courseId: mathCourse.id, userId: instructor1.id, createdBy: instructor1.id, dueDate: new Date('2025-12-18'), dueTime: '14:00', priority: 'MEDIUM' as const, type: 'quiz', maxPoints: 50, estimatedTime: '1 hour' },
    { title: 'Midterm Exam Prep', description: 'Study chapters 1-5', courseId: mathCourse.id, userId: instructor1.id, createdBy: instructor1.id, dueDate: new Date('2025-12-22'), dueTime: '09:00', priority: 'HIGH' as const, type: 'exam', maxPoints: 200, estimatedTime: '6 hours' },
    
    // Physics Course Tasks
    { title: 'Lab Report - Pendulum', description: 'Complete lab report with data analysis', courseId: physicsCourse.id, userId: instructor1.id, createdBy: instructor1.id, dueDate: new Date('2025-12-19'), dueTime: '17:00', priority: 'HIGH' as const, type: 'report', maxPoints: 75, estimatedTime: '4 hours' },
    { title: 'Thermodynamics Problems', description: 'Problems 1-15 from textbook', courseId: physicsCourse.id, userId: instructor1.id, createdBy: instructor1.id, dueDate: new Date('2025-12-21'), dueTime: '23:59', priority: 'MEDIUM' as const, type: 'assignment', maxPoints: 60, estimatedTime: '2 hours' },
    
    // DSA Course Tasks
    { title: 'Binary Search Tree Implementation', description: 'Implement BST with insert, delete, and search', courseId: dsaCourse.id, userId: instructor2.id, createdBy: instructor2.id, dueDate: new Date('2025-12-25'), dueTime: '23:59', priority: 'HIGH' as const, type: 'project', maxPoints: 150, estimatedTime: '10 hours' },
    { title: 'Algorithm Analysis Report', description: 'Analyze time complexity of sorting algorithms', courseId: dsaCourse.id, userId: instructor2.id, createdBy: instructor2.id, dueDate: new Date('2025-12-17'), dueTime: '23:59', priority: 'MEDIUM' as const, type: 'report', maxPoints: 80, estimatedTime: '5 hours' },
    
    // Web Dev Course Tasks
    { title: 'Build Personal Portfolio', description: 'Create responsive portfolio website', courseId: webDevCourse.id, userId: instructor2.id, createdBy: instructor2.id, dueDate: new Date('2025-12-24'), dueTime: '23:59', priority: 'HIGH' as const, type: 'project', maxPoints: 120, estimatedTime: '8 hours' },
    { title: 'JavaScript Quiz', description: 'ES6 features and async programming', courseId: webDevCourse.id, userId: instructor2.id, createdBy: instructor2.id, dueDate: new Date('2025-12-16'), dueTime: '14:00', priority: 'MEDIUM' as const, type: 'quiz', maxPoints: 40, estimatedTime: '45 minutes' },
    
    // Literature Course Tasks
    { title: 'Shakespeare Essay', description: 'Analyze themes in Hamlet', courseId: litCourse.id, userId: instructor3.id, createdBy: instructor3.id, dueDate: new Date('2025-12-23'), dueTime: '23:59', priority: 'HIGH' as const, type: 'essay', maxPoints: 100, estimatedTime: '6 hours' },
    { title: 'Poetry Analysis', description: 'Analyze 3 poems from the Romantic period', courseId: litCourse.id, userId: instructor3.id, createdBy: instructor3.id, dueDate: new Date('2025-12-19'), dueTime: '23:59', priority: 'MEDIUM' as const, type: 'assignment', maxPoints: 60, estimatedTime: '3 hours' },
    
    // Chemistry Course Tasks
    { title: 'Organic Reactions Lab', description: 'Complete synthesis and write report', courseId: chemCourse.id, userId: instructor3.id, createdBy: instructor3.id, dueDate: new Date('2025-12-20'), dueTime: '17:00', priority: 'HIGH' as const, type: 'lab', maxPoints: 90, estimatedTime: '5 hours' },
    
    // History Course Tasks
    { title: 'World War II Research Paper', description: '10-page research paper on a WWII topic', courseId: historyCourse.id, userId: instructor4.id, createdBy: instructor4.id, dueDate: new Date('2025-12-26'), dueTime: '23:59', priority: 'HIGH' as const, type: 'paper', maxPoints: 150, estimatedTime: '12 hours' },
    
    // Psychology Course Tasks
    { title: 'Cognitive Psychology Exam', description: 'Chapters 1-8 coverage', courseId: psychCourse.id, userId: instructor4.id, createdBy: instructor4.id, dueDate: new Date('2025-12-21'), dueTime: '10:00', priority: 'HIGH' as const, type: 'exam', maxPoints: 100, estimatedTime: '2 hours' },
  ];

  let taskCount = 0;
  let submissionCount = 0;
  
  for (const taskData of tasksData) {
    const existing = await prisma.task.findFirst({
      where: { title: taskData.title, courseId: taskData.courseId }
    });

    if (!existing) {
      const task = await prisma.task.create({
        data: {
          ...taskData,
          updatedAt: new Date()
        }
      });
      taskCount++;

      // Get enrolled students for this course
      const enrolledStudents = await prisma.enrollment.findMany({
        where: { courseId: taskData.courseId },
        select: { userId: true }
      });

      // Create submissions for each student
      const statuses: Array<'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'GRADED'> = ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'GRADED'];
      
      for (const enrollment of enrolledStudents) {
        const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
        const isGraded = randomStatus === 'GRADED';
        
        await prisma.taskSubmission.create({
          data: {
            taskId: task.id,
            studentId: enrollment.userId,
            status: randomStatus,
            submittedAt: isGraded || randomStatus === 'COMPLETED' ? new Date() : null,
            points: isGraded ? Math.floor(Math.random() * (taskData.maxPoints || 100)) : null,
            gradedBy: isGraded ? taskData.createdBy : null,
            gradedAt: isGraded ? new Date() : null,
            feedback: isGraded ? 'Good work! Keep it up.' : null
          }
        });
        submissionCount++;
      }
    }
  }
  console.log(`✅ Created ${taskCount} tasks with ${submissionCount} submissions\n`);

  // ========== SCHEDULE EVENTS ==========
  console.log('📅 Creating schedule events...');
  
  let scheduleCount = 0;
  const daysOfWeek = [1, 2, 3, 4, 5]; // Monday to Friday
  
  // Create recurring classes for each enrolled student
  for (const { student, courses: studentCourses } of enrollmentMap) {
    for (const course of studentCourses) {
      // 2-3 class sessions per week
      const sessionsPerWeek = 2 + Math.floor(Math.random() * 2);
      
      for (let i = 0; i < sessionsPerWeek; i++) {
        const dayOfWeek = daysOfWeek[Math.floor(Math.random() * daysOfWeek.length)];
        const startHour = 8 + Math.floor(Math.random() * 8); // 8 AM to 4 PM
        const duration = Math.random() > 0.5 ? 90 : 60; // 60 or 90 minutes
        
        const startTime = `${startHour.toString().padStart(2, '0')}:00`;
        const endHour = startHour + Math.floor(duration / 60);
        const endMin = duration % 60;
        const endTime = `${endHour.toString().padStart(2, '0')}:${endMin.toString().padStart(2, '0')}`;
        
        // Create for next 4 weeks
        for (let week = 0; week < 4; week++) {
          const eventDate = new Date();
          eventDate.setDate(eventDate.getDate() + (week * 7) + dayOfWeek);
          
          const existing = await prisma.scheduleEvent.findFirst({
            where: {
              userId: student.id,
              courseId: course.id,
              date: eventDate,
              startTime: startTime
            }
          });
          
          if (!existing) {
            await prisma.scheduleEvent.create({
              data: {
                userId: student.id,
                courseId: course.id,
                title: `${course.title} - Lecture`,
                instructor: `${instructors.find(i => i.id === course.instructorId)?.firstName} ${instructors.find(i => i.id === course.instructorId)?.lastName}`,
                startTime,
                endTime,
                location: `Room ${100 + Math.floor(Math.random() * 400)}`,
                type: 'lecture',
                date: eventDate,
                color: course.color,
                dayOfWeek,
                recurrence: 'weekly',
                startDate: eventDate,
                endDate: new Date(eventDate.getTime() + (8 * 7 * 24 * 60 * 60 * 1000)) // 8 weeks
              }
            });
            scheduleCount++;
          }
        }
      }
    }
  }
  console.log(`✅ Created ${scheduleCount} schedule events\n`);

  // ========== ANNOUNCEMENTS ==========
  console.log('📢 Creating announcements...');
  
  const announcementsData = [
    { courseId: mathCourse.id, title: 'Midterm Exam Schedule', content: 'The midterm exam will be held on December 22nd at 9 AM in Hall A. Please bring your calculators and student IDs.', author: `${instructor1.firstName} ${instructor1.lastName}`, type: 'URGENT' as const, priority: 'HIGH' as const },
    { courseId: mathCourse.id, title: 'Office Hours This Week', content: 'I will be available for extra office hours this week on Tuesday and Thursday from 2-4 PM.', author: `${instructor1.firstName} ${instructor1.lastName}`, type: 'GENERAL' as const, priority: 'MEDIUM' as const },
    { courseId: physicsCourse.id, title: 'Lab Safety Reminder', content: 'Please remember to wear safety goggles and lab coats at all times in the laboratory.', author: `${instructor1.firstName} ${instructor1.lastName}`, type: 'REMINDER' as const, priority: 'HIGH' as const },
    { courseId: dsaCourse.id, title: 'Project Deadline Extension', content: 'Due to popular request, the BST project deadline has been extended to December 25th.', author: `${instructor2.firstName} ${instructor2.lastName}`, type: 'URGENT' as const, priority: 'HIGH' as const },
    { courseId: webDevCourse.id, title: 'Guest Lecture Next Week', content: 'We will have a guest speaker from Google next Wednesday discussing modern web frameworks.', author: `${instructor2.firstName} ${instructor2.lastName}`, type: 'EVENT' as const, priority: 'MEDIUM' as const },
    { courseId: litCourse.id, title: 'Reading List Updated', content: 'The required reading list has been updated. Please check the course materials section.', author: `${instructor3.firstName} ${instructor3.lastName}`, type: 'GENERAL' as const, priority: 'MEDIUM' as const },
    { courseId: chemCourse.id, title: 'Lab Report Guidelines', content: 'Updated lab report guidelines have been posted. Please review before submitting your reports.', author: `${instructor3.firstName} ${instructor3.lastName}`, type: 'REMINDER' as const, priority: 'MEDIUM' as const },
    { courseId: historyCourse.id, title: 'Research Paper Topics', content: 'The list of approved research paper topics is now available. Choose your topic by this Friday.', author: `${instructor4.firstName} ${instructor4.lastName}`, type: 'GENERAL' as const, priority: 'MEDIUM' as const },
    { courseId: psychCourse.id, title: 'Study Group Formation', content: 'Students interested in forming study groups for the upcoming exam, please see me after class.', author: `${instructor4.firstName} ${instructor4.lastName}`, type: 'GENERAL' as const, priority: 'LOW' as const },
  ];
  
  let announcementCount = 0;
  for (const announcementData of announcementsData) {
    const existing = await prisma.announcement.findFirst({
      where: { title: announcementData.title, courseId: announcementData.courseId }
    });
    
    if (!existing) {
      const announcement = await prisma.announcement.create({
        data: {
          ...announcementData,
          updatedAt: new Date()
        }
      });
      announcementCount++;
      
      // Create read status for enrolled students
      const enrolledStudents = await prisma.enrollment.findMany({
        where: { courseId: announcementData.courseId },
        select: { userId: true }
      });
      
      for (const enrollment of enrolledStudents) {
        const isRead = Math.random() > 0.5;
        await prisma.announcementRead.create({
          data: {
            userId: enrollment.userId,
            announcementId: announcement.id,
            isRead,
            readAt: isRead ? new Date() : null
          }
        });
      }
    }
  }
  console.log(`✅ Created ${announcementCount} announcements\n`);

  // ========== ACTIVITIES ==========
  console.log('📊 Creating activities...');
  
  let activityCount = 0;
  const activityTypes: Array<'ASSIGNMENT' | 'GRADE' | 'SUBMISSION' | 'ANNOUNCEMENT' | 'ACHIEVEMENT'> = ['ASSIGNMENT', 'GRADE', 'SUBMISSION', 'ANNOUNCEMENT', 'ACHIEVEMENT'];
  
  // Create activities for last 4 weeks
  for (const student of students.slice(0, 3)) { // Just first 3 students for performance
    const studentEnrollments = await prisma.enrollment.findMany({
      where: { userId: student.id },
      include: { Course: true }
    });
    
    for (let week = 0; week < 4; week++) {
      for (let i = 0; i < 3; i++) { // 3 activities per week
        const enrollment = studentEnrollments[Math.floor(Math.random() * studentEnrollments.length)];
        const activityType = activityTypes[Math.floor(Math.random() * activityTypes.length)];
        const activityDate = new Date();
        activityDate.setDate(activityDate.getDate() - (week * 7) - Math.floor(Math.random() * 7));
        
        await prisma.activity.create({
          data: {
            userId: student.id,
            courseId: enrollment.courseId,
            type: activityType,
            title: `${activityType} - ${enrollment.Course.title}`,
            description: `Completed ${activityType.toLowerCase()} for ${enrollment.Course.title}`,
            timestamp: activityDate,
            status: Math.random() > 0.3 ? 'COMPLETED' : 'IN_PROGRESS',
            progress: Math.floor(Math.random() * 100),
            grade: activityType === 'GRADE' ? `${Math.floor(Math.random() * 30) + 70}%` : null
          }
        });
        activityCount++;
      }
    }
  }
  console.log(`✅ Created ${activityCount} activities\n`);

  // ========== COURSE MODULES & MATERIALS ==========
  console.log('📖 Creating course modules and materials...');
  
  let moduleCount = 0;
  let materialCount = 0;
  
  const modulesData = [
    { courseId: mathCourse.id, title: 'Introduction to Calculus', description: 'Basic concepts and notation', order: 1 },
    { courseId: mathCourse.id, title: 'Derivatives', description: 'Rules and applications of derivatives', order: 2 },
    { courseId: mathCourse.id, title: 'Integrals', description: 'Integration techniques', order: 3 },
    { courseId: dsaCourse.id, title: 'Arrays and Linked Lists', description: 'Basic data structures', order: 1 },
    { courseId: dsaCourse.id, title: 'Trees and Graphs', description: 'Advanced data structures', order: 2 },
    { courseId: webDevCourse.id, title: 'HTML & CSS Fundamentals', description: 'Building blocks of the web', order: 1 },
    { courseId: webDevCourse.id, title: 'JavaScript Basics', description: 'Programming for the web', order: 2 },
  ];
  
  for (const moduleData of modulesData) {
    const existing = await prisma.courseModule.findFirst({
      where: { title: moduleData.title, courseId: moduleData.courseId }
    });
    
    if (!existing) {
      const module = await prisma.courseModule.create({
        data: moduleData
      });
      moduleCount++;
      
      // Add 2-3 materials per module
      const materialsPerModule = 2 + Math.floor(Math.random() * 2);
      const materialTypes: Array<'DOCUMENT' | 'VIDEO' | 'LINK' | 'QUIZ'> = ['DOCUMENT', 'VIDEO', 'LINK', 'QUIZ'];
      
      for (let i = 0; i < materialsPerModule; i++) {
        const materialType = materialTypes[Math.floor(Math.random() * materialTypes.length)];
        await prisma.courseMaterial.create({
          data: {
            courseId: moduleData.courseId,
            moduleId: module.id,
            title: `${module.title} - Material ${i + 1}`,
            description: `Learning material for ${module.title}`,
            type: materialType,
            fileUrl: materialType === 'LINK' ? 'https://example.com/resource' : undefined,
            content: materialType === 'DOCUMENT' ? 'Sample course content here...' : undefined,
            order: i + 1
          }
        });
        materialCount++;
      }
    }
  }
  console.log(`✅ Created ${moduleCount} modules with ${materialCount} materials\n`);

  console.log('✨ Database seeding completed successfully!\n');
  console.log('📊 Summary:');
  console.log(`   - Users: ${students.length + instructors.length}`);
  console.log(`   - Courses: ${courses.length}`);
  console.log(`   - Enrollments: ${enrollmentCount}`);
  console.log(`   - Tasks: ${taskCount}`);
  console.log(`   - Submissions: ${submissionCount}`);
  console.log(`   - Schedule Events: ${scheduleCount}`);
  console.log(`   - Announcements: ${announcementCount}`);
  console.log(`   - Activities: ${activityCount}`);
  console.log(`   - Modules: ${moduleCount}`);
  console.log(`   - Materials: ${materialCount}\n`);
  
  console.log('🔐 Test Accounts:');
  console.log('   Students: alice.johnson@example.com, bob.smith@example.com, etc.');
  console.log('   Instructors: dr.wilson@example.com, prof.chen@example.com, etc.');
  console.log('   Password (all): Student@123\n');

  /*
  // REMOVED OLD CODE - Create sample schedule events
  const scheduleEvents = [
    {
      userId: user.id,
      title: 'Mathematics Lecture',
      instructor: 'Dr. Sarah Wilson',
      startTime: '09:00',
      endTime: '10:30',
      type: 'class',
      location: 'Room 201',
      courseId: mathCourse?.id,
      date: new Date('2024-12-13'),
      color: mathCourse?.color || '#667eea'
    },
    {
      userId: user.id,
      title: 'Physics Lab',
      instructor: 'Prof. Michael Chen',
      startTime: '14:00',
      endTime: '16:00',
      type: 'class',
      location: 'Lab 105',
      courseId: physicsCourse?.id,
      date: new Date('2024-12-13'),
      color: physicsCourse?.color || '#8b5cf6'
    },
    {
      userId: user.id,
      title: 'CS Lecture',
      instructor: 'Dr. Emily Rodriguez',
      startTime: '11:00',
      endTime: '12:30',
      type: 'class',
      location: 'Room 401',
      courseId: csCourse?.id,
      date: new Date('2024-12-14'),
      color: csCourse?.color || '#10b981'
    },
    {
      userId: user.id,
      title: 'Math Midterm Exam',
      instructor: 'Dr. Sarah Wilson',
      startTime: '09:00',
      endTime: '11:00',
      type: 'exam',
      location: 'Hall A',
      courseId: mathCourse?.id,
      date: new Date('2024-12-16'),
      color: '#ef4444'
    },
    {
      userId: user.id,
      title: 'Study Group',
      instructor: null,
      startTime: '16:00',
      endTime: '18:00',
      type: 'meeting',
      location: 'Library',
      courseId: mathCourse?.id,
      date: new Date('2024-12-15'),
      color: mathCourse?.color || '#667eea'
    }
  ];

  // Insert schedule events
  for (const eventData of scheduleEvents) {
    const existing = await prisma.scheduleEvent.findFirst({
      where: {
        userId: eventData.userId,
        title: eventData.title,
        date: eventData.date
      }
    });

    if (!existing) {
      await prisma.scheduleEvent.create({
        data: eventData
      });
    }
  }

  console.log('Seeded instructor-created schedule events');

  // Create sample activities for weekly stats
  const activityTypes = ['ATTENDANCE', 'SUBMISSION', 'QUIZ', 'EXAM', 'ACHIEVEMENT'];
  const sampleActivities: any[] = [];

  // Generate activities for the last 10 weeks
  for (let week = 0; week < 10; week++) {
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - (week * 7));

    // 3-5 activities per week
    const activitiesPerWeek = 3 + Math.floor(Math.random() * 3);
    
    for (let i = 0; i < activitiesPerWeek; i++) {
      const activityDate = new Date(weekStart);
      activityDate.setDate(activityDate.getDate() - Math.floor(Math.random() * 7));

      const randomCourse = [mathCourse, physicsCourse, csCourse][Math.floor(Math.random() * 3)];
      const randomType = activityTypes[Math.floor(Math.random() * activityTypes.length)];

      if (randomCourse) {
        sampleActivities.push({
          userId: user.id,
          courseId: randomCourse.id,
          type: randomType,
          title: `${randomType} - ${randomCourse.title}`,
          description: `Completed ${randomType.toLowerCase()} for ${randomCourse.title}`,
          timestamp: activityDate,
          status: Math.random() > 0.2 ? 'COMPLETED' : 'IN_PROGRESS',
          progress: Math.floor(Math.random() * 100)
        });
      }
    }
  }

  // Insert activities
  for (const activityData of sampleActivities) {
    const existing = await prisma.activity.findFirst({
      where: {
        userId: activityData.userId,
        title: activityData.title,
        timestamp: activityData.timestamp
      }
    });

    if (!existing) {
      await prisma.activity.create({
        data: activityData
      });
    }
  }

  console.log('Seeded sample activities');
  */
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });