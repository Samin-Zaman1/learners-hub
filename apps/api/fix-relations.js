const fs = require('fs');
const path = require('path');

// Patterns to replace
const replacements = [
  // In includes/selects
  { pattern: /(\s+)course:\s*\{/g, replacement: '$1Course: {' },
  { pattern: /(\s+)user:\s*\{/g, replacement: '$1User: {' },
  { pattern: /(\s+)task:\s*\{/g, replacement: '$1Task: {' },
  { pattern: /(\s+)enrollments:\s*(true|\{)/g, replacement: '$1Enrollment: $2' },
  { pattern: /(\s+)instructor:\s*\{/g, replacement: '$1User: {' },
  
  // In property access
  { pattern: /enrollment\.course\b/g, replacement: 'enrollment.Course' },
  { pattern: /\.task\b/g, replacement: '.Task' },
  
  // In _count
  { pattern: /_count:\s*\{\s*enrollments:/g, replacement: '_count: { Enrollment:' },
  
  // In where clauses - be careful not to replace field names, only relation filters
  { pattern: /where:\s*\{\s*course:\s*\{/g, replacement: 'where: { Course: {' },
  { pattern: /where:\s*\{\s*task:\s*\{/g, replacement: 'where: { Task: {' },
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
