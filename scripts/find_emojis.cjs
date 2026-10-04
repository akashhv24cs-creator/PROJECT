const fs = require('fs');
const path = require('path');

// Unicode ranges for emoji characters
// Also includes common symbol checkmarks/stars/warning symbols like ✓, ❌, ⚠️, ✦, ✨, ⭐, 🚗, 📍, etc.
const emojiRegex = /[\u{1F300}-\u{1FAFF}\u{1F000}-\u{1FFFF}\u{2600}-\u{27BF}\u{2300}-\u{23FF}\u{2B50}\u{FE0F}\u{2714}\u{2716}\u{2705}\u{274C}\u{26A0}\u{2728}\u{2708}\u{2709}\u{2702}\u{270F}\u{2712}\u{2721}\u{2733}\u{2734}\u{2744}\u{2747}\u{2753}\u{2754}\u{2755}\u{2757}\u{2763}\u{2764}\u{2795}\u{2796}\u{2797}\u{27A1}\u{27B0}\u{27BF}\u{2934}\u{2935}\u{2B05}\u{2B06}\u{2B07}\u{2B1B}\u{2B1C}\u{2B55}\u{3030}\u{303D}\u{3297}\u{3299}]/gu;

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    if (file === 'node_modules' || file === 'dist' || file === '.git' || file === '.firebase' || file === 'scripts') return;
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(filePath));
    } else if (/\.(jsx?|tsx?|html|json)$/.test(file)) {
      results.push(filePath);
    }
  });
  return results;
}

const files = walk('.');
let summary = {};
let totalMatches = 0;

files.forEach(f => {
  const content = fs.readFileSync(f, 'utf8');
  const lines = content.split('\n');
  let fileMatches = [];
  lines.forEach((line, idx) => {
    const matches = line.match(emojiRegex);
    if (matches) {
      fileMatches.push({ lineNum: idx + 1, matches, line: line.trim() });
      totalMatches += matches.length;
    }
  });
  if (fileMatches.length > 0) {
    summary[f] = fileMatches;
  }
});

console.log('Total files with emojis: ' + Object.keys(summary).length);
console.log('Total emoji instances: ' + totalMatches);

for (const [file, matches] of Object.entries(summary)) {
  console.log(`\n--- ${file} (${matches.length} matches) ---`);
  matches.forEach(m => {
    console.log(`  L${m.lineNum}: [${m.matches.join('')}] ${m.line}`);
  });
}
