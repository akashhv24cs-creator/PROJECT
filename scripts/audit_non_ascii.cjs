const fs = require('fs');
const path = require('path');

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
let nonAsciiMap = {};

// Characters to preserve: currency, standard punctuation, standard typographic symbols
const preserveCodePoints = new Set([
  0x20B9, // ₹ (Indian Rupee)
  0x2022, // • (bullet)
  0x2013, // – (en dash)
  0x2014, // — (em dash)
  0x2018, // ‘
  0x2019, // ’
  0x201C, // “
  0x201D, // ”
  0x2026, // …
  0x2192, // →
  0x2190, // ←
  0x2191, // ↑
  0x2193, // ↓
  0x00B0, // °
  0x00A9, // ©
  0x00AE, // ®
  0x221E, // ∞
  0x00A0, // &nbsp;
  0x00E9, // é
  0x00E8, // è
  0x00E0, // à
  0x00FC, // ü
  0x00F6, // ö
  0x00E4, // ä
]);

files.forEach(f => {
  const content = fs.readFileSync(f, 'utf8');
  for (let ch of content) {
    const cp = ch.codePointAt(0);
    if (cp > 127 && !preserveCodePoints.has(cp)) {
      if (!nonAsciiMap[ch]) {
        nonAsciiMap[ch] = { char: ch, cp: '0x' + cp.toString(16).toUpperCase(), count: 0, files: new Set() };
      }
      nonAsciiMap[ch].count++;
      nonAsciiMap[ch].files.add(f);
    }
  }
});

for (let k of Object.keys(nonAsciiMap)) {
  const v = nonAsciiMap[k];
  console.log(`${v.char} (${v.cp}) - count: ${v.count}, files: ${Array.from(v.files).slice(0, 3).join(', ')}`);
}
