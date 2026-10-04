const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const BRAIN_DIR = 'C:\\Users\\HP\\.gemini\\antigravity-ide\\brain\\1b9fb815-a5e0-45b7-a01f-fd13f9800058';
const PUBLIC_DIR = path.resolve(__dirname, '../public');
const VEHICLES_DIR = path.join(PUBLIC_DIR, 'vehicles');

async function processBigCar() {
  const carSource = path.join(BRAIN_DIR, 'big_real_travel_suv_1787675502901.jpg');
  const carOut = path.join(VEHICLES_DIR, 'realistic-travel-car.png');

  if (!fs.existsSync(carSource)) {
    console.error('Car source not found:', carSource);
    return;
  }

  console.log('Processing big real travel SUV image with flood fill background removal...');
  const { data, info } = await sharp(carSource)
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height, channels } = info;
  const totalPixels = width * height;
  const visited = new Uint8Array(totalPixels);
  const queue = new Int32Array(totalPixels);
  let head = 0;
  let tail = 0;

  // Function to check if pixel is background (near white or faint studio shadow)
  const isBg = (idx) => {
    const r = data[idx * channels];
    const g = data[idx * channels + 1];
    const b = data[idx * channels + 2];
    const maxDiff = Math.max(Math.abs(r - g), Math.abs(g - b), Math.abs(r - b));
    // Studio white background
    return (r > 218 && g > 218 && b > 218 && maxDiff < 18) || (r > 238 && g > 238 && b > 238);
  };

  // Seed all borders
  for (let x = 0; x < width; x++) {
    const topIdx = x;
    const botIdx = (height - 1) * width + x;
    if (isBg(topIdx) && !visited[topIdx]) {
      visited[topIdx] = 1;
      queue[tail++] = topIdx;
    }
    if (isBg(botIdx) && !visited[botIdx]) {
      visited[botIdx] = 1;
      queue[tail++] = botIdx;
    }
  }
  for (let y = 0; y < height; y++) {
    const leftIdx = y * width;
    const rightIdx = y * width + (width - 1);
    if (isBg(leftIdx) && !visited[leftIdx]) {
      visited[leftIdx] = 1;
      queue[tail++] = leftIdx;
    }
    if (isBg(rightIdx) && !visited[rightIdx]) {
      visited[rightIdx] = 1;
      queue[tail++] = rightIdx;
    }
  }

  // Flood fill from borders
  while (head < tail) {
    const curr = queue[head++];
    const cx = curr % width;
    const cy = Math.floor(curr / width);

    const neighbors = [
      cx > 0 ? curr - 1 : -1,
      cx < width - 1 ? curr + 1 : -1,
      cy > 0 ? curr - width : -1,
      cy < height - 1 ? curr + width : -1,
    ];

    for (let i = 0; i < 4; i++) {
      const n = neighbors[i];
      if (n !== -1 && !visited[n] && isBg(n)) {
        visited[n] = 1;
        queue[tail++] = n;
      }
    }
  }

  // Create RGBA buffer
  const rgbaBuffer = Buffer.alloc(width * height * 4);
  let minX = width, maxX = 0, minY = height, maxY = 0;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x;
      const srcOffset = idx * channels;
      const dstOffset = idx * 4;

      let r = data[srcOffset];
      let g = data[srcOffset + 1];
      let b = data[srcOffset + 2];

      if (visited[idx]) {
        rgbaBuffer[dstOffset] = 0;
        rgbaBuffer[dstOffset + 1] = 0;
        rgbaBuffer[dstOffset + 2] = 0;
        rgbaBuffer[dstOffset + 3] = 0;
      } else {
        let bgNeighborCount = 0;
        if (x > 0 && visited[idx - 1]) bgNeighborCount++;
        if (x < width - 1 && visited[idx + 1]) bgNeighborCount++;
        if (y > 0 && visited[idx - width]) bgNeighborCount++;
        if (y < height - 1 && visited[idx + width]) bgNeighborCount++;

        let alpha = 255;
        if (bgNeighborCount > 0 && (r > 195 && g > 195 && b > 195)) {
          alpha = Math.max(30, 255 - bgNeighborCount * 55);
        }

        rgbaBuffer[dstOffset] = r;
        rgbaBuffer[dstOffset + 1] = g;
        rgbaBuffer[dstOffset + 2] = b;
        rgbaBuffer[dstOffset + 3] = alpha;

        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }

  const cropW = Math.max(10, maxX - minX + 1);
  const cropH = Math.max(10, maxY - minY + 1);

  await sharp(rgbaBuffer, { raw: { width, height, channels: 4 } })
    .extract({ left: minX, top: minY, width: cropW, height: cropH })
    .png({ quality: 95, compressionLevel: 8 })
    .toFile(carOut);

  console.log(`Saved ultra-clean big real car (${cropW}x${cropH}) to:`, carOut);
}

processBigCar();
