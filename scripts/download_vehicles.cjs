const fs = require('fs');
const path = require('path');
const https = require('https');

const VEHICLE_FILES = [
  {
    key: 'innova-crysta',
    title: 'File:Toyota_Innova_Crysta_2.4_Z_front_right.jpg',
    out: 'innova-crysta.jpg'
  },
  {
    key: 'dzire',
    title: 'File:Maruti_Suzuki_Dzire_VXi_VVT_(front).JPG',
    out: 'dzire.jpg'
  },
  {
    key: 'ertiga',
    title: 'File:2024_Suzuki_Ertiga_1.5_GLX_Hybrid_in_Snow_White_Pearl,_front_right,_06-16-2024.jpg',
    out: 'ertiga.jpg'
  },
  {
    key: 'tempo-traveller',
    title: 'File:ForceTravellerfront.JPG',
    out: 'tempo-traveller.jpg'
  },
  {
    key: 'mini-bus',
    title: 'File:ForceTravellerside.JPG',
    out: 'mini-bus.jpg'
  },
  {
    key: 'luxury-bus',
    title: 'File:Volvo_9400_B11R_Airavat_Club_Class.jpg',
    out: 'luxury-bus.jpg'
  }
];

function downloadFile(url, destPath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(destPath);
    https.get(url, { headers: { 'User-Agent': 'ZeneraTrips/1.0 (https://zeneratrips.com; dev@zeneratrips.com)' } }, (response) => {
      if (response.statusCode === 301 || response.statusCode === 302) {
        return downloadFile(response.headers.location, destPath).then(resolve).catch(reject);
      }
      if (response.statusCode !== 200) {
        return reject(new Error(`Failed to download ${url}: ${response.statusCode}`));
      }
      response.pipe(file);
      file.on('finish', () => {
        file.close(() => resolve(destPath));
      });
    }).on('error', (err) => {
      fs.unlink(destPath, () => {});
      reject(err);
    });
  });
}

async function getImageUrl(title) {
  const apiUrl = `https://commons.wikimedia.org/w/api.php?action=query&titles=${encodeURIComponent(title)}&prop=imageinfo&iiprop=url&format=json`;
  return new Promise((resolve, reject) => {
    https.get(apiUrl, { headers: { 'User-Agent': 'ZeneraTrips/1.0 (https://zeneratrips.com; dev@zeneratrips.com)' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          const pages = json.query.pages;
          const pageId = Object.keys(pages)[0];
          const info = pages[pageId]?.imageinfo?.[0];
          if (info && info.url) {
            resolve(info.url);
          } else {
            resolve(null);
          }
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

async function run() {
  const outDir = path.join(__dirname, '../public/vehicles');
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  for (const item of VEHICLE_FILES) {
    try {
      console.log(`Querying ${item.key}: ${item.title}...`);
      const url = await getImageUrl(item.title);
      if (url) {
        console.log(`Downloading ${item.key} from ${url}...`);
        const dest = path.join(outDir, item.out);
        await downloadFile(url, dest);
        console.log(`Saved ${item.out}`);
      } else {
        console.log(`No direct URL found for ${item.title}`);
      }
    } catch (e) {
      console.error(`Error with ${item.key}:`, e.message);
    }
  }
}

run();
