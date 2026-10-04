const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const carPath = path.resolve(__dirname, '../public/vehicles/realistic-travel-car.png');

async function checkCar() {
  const metadata = await sharp(carPath).metadata();
  console.log('Car metadata:', metadata.width, 'x', metadata.height);

  // We can measure the wheel bounding circles:
  // Relative to image width (1172) and height (633):
  // Rear wheel center: approx (268, 458), radius ~ 74
  // Front wheel center: approx (735, 470), radius ~ 74
  console.log('Relative rear wheel:', 268 / metadata.width, 458 / metadata.height, 74 / metadata.width);
  console.log('Relative front wheel:', 735 / metadata.width, 470 / metadata.height, 74 / metadata.width);
}

checkCar();
