const fs = require('fs');
const path = require('path');

// Read destinations.js
const destFile = fs.readFileSync(path.resolve(__dirname, '../src/data/destinations.js'), 'utf8');
const matches = destFile.match(/image:\s*["']([^"']+)["']/g) || [];

console.log('Checking all images in destinations.js...');
const missing = [];
matches.forEach(m => {
  const imgPath = m.replace(/image:\s*["']/, '').replace(/["']/, '');
  const fullPath = path.resolve(__dirname, '../public', imgPath.startsWith('/') ? imgPath.slice(1) : imgPath);
  if (!fs.existsSync(fullPath)) {
    missing.push(imgPath);
  }
});

console.log('Missing images:', [...new Set(missing)]);
