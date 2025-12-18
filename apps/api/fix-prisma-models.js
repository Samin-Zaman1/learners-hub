const fs = require('fs');
const path = require('path');

// Fix Prisma model references - they should be lowercase
const replacements = [
  { pattern: /prisma\.Course\b/g, replacement: 'prisma.course' },
  { pattern: /prisma\.User\b/g, replacement: 'prisma.user' },
  { pattern: /prisma\.Task\b/g, replacement: 'prisma.task' },
  { pattern: /prisma\.Enrollment\b/g, replacement: 'prisma.enrollment' },
  { pattern: /prisma\.Activity\b/g, replacement: 'prisma.activity' },
  { pattern: /prisma\.Announcement\b/g, replacement: 'prisma.announcement' },
  { pattern: /prisma\.ScheduleEvent\b/g, replacement: 'prisma.scheduleEvent' },
  { pattern: /prisma\.TaskSubmission\b/g, replacement: 'prisma.taskSubmission' },
  { pattern: /prisma\.CourseModule\b/g, replacement: 'prisma.courseModule' },
  { pattern: /prisma\.CourseMaterial\b/g, replacement: 'prisma.courseMaterial' },
  { pattern: /prisma\.Attendance\b/g, replacement: 'prisma.attendance' },
];

function fixFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let changed = false;
    
    replacements.forEach(({ pattern, replacement }) => {
      const newContent = content.replace(pattern, replacement);
      if (newContent !== content) {
        changed = true;
        content = newContent;
      }
    });
    
    if (changed) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Fixed: ${filePath}`);
      return true;
    }
    return false;
  } catch (error) {
    console.error(`Error fixing ${filePath}:`, error.message);
    return false;
  }
}

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  let fixedCount = 0;
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      fixedCount += walkDir(filePath);
    } else if (file.endsWith('.ts') && !file.endsWith('.spec.ts')) {
      if (fixFile(filePath)) {
        fixedCount++;
      }
    }
  });
  
  return fixedCount;
}

// Fix all TypeScript files in src directory
const srcDir = path.join(__dirname, 'src');
const fixedCount = walkDir(srcDir);
console.log(`\nTotal files fixed: ${fixedCount}`);
