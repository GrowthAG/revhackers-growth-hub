const fs = require('fs');
const path = require('path');

function findFiles(dir, pattern, fileList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      findFiles(filePath, pattern, fileList);
    } else if (filePath.match(pattern)) {
      fileList.push(filePath);
    }
  }
  return fileList;
}

const allFiles = [...findFiles('src/components/diagnostics', /\.tsx$/), ...findFiles('src/pages', /Score\.tsx$/)];

allFiles.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    
    // Remove "uppercase" 
    content = content.replace(/\buppercase\b/g, '');
    
    // Remove tracking-wider, tracking-wide, tracking-tight, tracking-tighter
    content = content.replace(/\btracking-wider\b/g, '');
    content = content.replace(/\btracking-wide\b/g, '');
    content = content.replace(/\btracking-tight\b/g, '');
    content = content.replace(/\btracking-tighter\b/g, '');
    
    // text-xxs -> text-xs
    content = content.replace(/\btext-xxs\b/g, 'text-xs');
    
    // text-2xs -> text-xs
    content = content.replace(/\btext-2xs\b/g, 'text-xs');
    
    // cleanup double spaces
    content = content.replace(/  +/g, ' ');

    fs.writeFileSync(file, content, 'utf8');
});

console.log('Fixed remaining files');
