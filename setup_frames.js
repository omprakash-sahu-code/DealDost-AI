const fs = require('fs');
const path = require('path');

const sourceDir = path.join(__dirname, '..', 'deal_dost_frames');
const targetDir = path.join(__dirname, 'public', 'frames');

if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

const files = fs.readdirSync(sourceDir).filter(f => f.endsWith('.jpg'));

// Sort by the numerical value in the filename
files.sort((a, b) => {
  const numA = parseInt(a.match(/(\d+)/)[0], 10);
  const numB = parseInt(b.match(/(\d+)/)[0], 10);
  return numA - numB;
});

files.forEach((file, index) => {
  const sourcePath = path.join(sourceDir, file);
  // We're converting existing jpgs directly into webp by extensions since browser HTML5 canvas drawImage supports it
  const targetPath = path.join(targetDir, `frame_${index}.webp`);
  fs.copyFileSync(sourcePath, targetPath);
});

console.log(`Successfully mapped ${files.length} frames.`);
