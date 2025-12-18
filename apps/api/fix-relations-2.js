const fs = require('fs');
const path = require('path');

// Additional relation name fixes
const replacements = [
  // _count relation fixes
  { pattern: /(\s+)tasks:/g, replacement: '$1Task:' },
  { pattern: /(\s+)announcements:/g, replacement: '$1Announcement:' },
  { pattern: /(\s+)materials:/g, replacement: '$1CourseMaterial:' },
  { pattern: /(\s+)module:/g, replacement: '$1Module:' },
  
  // Property access fixes
  { pattern: /\.user\b/g, replacement: '.User' },
  { pattern: /enrollment\.CourseId/g, replacement: 'enrollment.courseId' },
  { pattern: /\.course\./g, replacement: '.Course.' },
  
  // Where clause fixes that were missed
  { pattern: /where:\s*\{\s*Course:\s*\{/g, replacement: 'where: { Course: {' },
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
