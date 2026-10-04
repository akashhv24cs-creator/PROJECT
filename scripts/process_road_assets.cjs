const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const BRAIN_DIR = 'C:\\Users\\HP\\.gemini\\antigravity-ide\\brain\\1b9fb815-a5e0-45b7-a01f-fd13f9800058';
const PUBLIC_ROAD_DIR = path.resolve(__dirname, '../public/road');

if (!fs.existsSync(PUBLIC_ROAD_DIR)) {
  fs.mkdirSync(PUBLIC_ROAD_DIR, { recursive: true });
}

async function processRoadAssets() {
  const mountainSource = path.join(BRAIN_DIR, 'scenic_road_mountains_bg_1787674998424.jpg');
  if (fs.existsSync(mountainSource)) {
    await sharp(mountainSource)
      .jpeg({ quality: 92 })
      .toFile(path.join(PUBLIC_ROAD_DIR, 'scenic-mountains.jpg'));
    console.log('Saved scenic-mountains.jpg');
  }
}

processRoadAssets();
