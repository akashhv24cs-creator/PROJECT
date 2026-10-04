import https from "https";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DEST_DIR = path.join(__dirname, "..", "public", "destinations");

if (!fs.existsSync(DEST_DIR)) {
  fs.mkdirSync(DEST_DIR, { recursive: true });
}

// Curated verified queries for each landmark
const PLACES = [
  {
    id: "nanjangud",
    filename: "nanjangud.jpg",
    query: "Srikanteshwara Temple Nanjangud gopuram",
    preferredFile: "File:N-KA-B159_Srikanteshwara_Temple_Gopuram_Nanjangud.jpg",
    fallbackFile: "File:Srikanteshwara_Temple_Nanjangud.jpg"
  },
  {
    id: "somnathpur",
    filename: "somnathpur.jpg",
    query: "Chennakesava Temple Somanathapura",
    preferredFile: "File:Keshava_temple_at_Somanathapura.jpg",
    fallbackFile: "File:Chennakesava_Temple,_Somanathapura.jpg"
  },
  {
    id: "rajas-seat",
    filename: "rajas-seat.jpg",
    query: "Raja's Seat Madikeri Coorg",
    preferredFile: "File:Raja's_Seat_view_point_in_Madikeri_Coorg_4.jpg",
    fallbackFile: "File:Raja's_Seat,_Madikeri,_Karnataka.jpg"
  },
  {
    id: "dubare-camp",
    filename: "dubare-camp.jpg",
    query: "Dubare Elephant Camp Coorg",
    preferredFile: "File:Dubare_Elephant_Camp.jpg",
    fallbackFile: "File:Elephants_in_Dubare.jpg"
  },
  {
    id: "mandalpatti",
    filename: "mandalpatti.jpg",
    query: "Mandalpatti Peak Coorg",
    preferredFile: "File:Mandalpatti_Peak.jpg",
    fallbackFile: "File:Mandalpatti.jpg"
  },
  {
    id: "baba-budangiri",
    filename: "baba-budangiri.jpg",
    query: "Baba Budangiri Chikmagalur",
    preferredFile: "File:Baba_Budangiri_hills_Chikmagalur.jpg",
    fallbackFile: "File:Bababudangiri_range.jpg"
  },
  {
    id: "jhari-falls",
    filename: "jhari-falls.jpg",
    query: "Jhari Falls Chikmagalur",
    preferredFile: "File:Jhari_Falls_Chikmagalur.jpg",
    fallbackFile: "File:Jhari_Falls,_Chikkamagaluru.jpg"
  },
  {
    id: "hirekolale-lake",
    filename: "hirekolale-lake.jpg",
    query: "Hirekolale Lake Chikmagalur",
    preferredFile: "File:Hirekolale_Lake,_Chikmagalur.jpg",
    fallbackFile: "File:Hirekolale_lake.jpg"
  },
  {
    id: "pykara-lake",
    filename: "pykara-lake.jpg",
    query: "Pykara Lake Ooty",
    preferredFile: "File:Pykara_Lake_Ooty.jpg",
    fallbackFile: "File:Pykara_Lake_and_waterfalls.jpg"
  },
  {
    id: "coonoor",
    filename: "coonoor.jpg",
    query: "Coonoor Nilgiri tea",
    preferredFile: "File:Coonoor_Tea_Garden.jpg",
    fallbackFile: "File:Sim's_Park_Coonoor.jpg"
  },
  {
    id: "vittala-temple",
    filename: "vittala-temple.jpg",
    query: "Stone Chariot Hampi",
    preferredFile: "File:Stone_chariot,_Vittala_temple,_Hampi.jpg",
    fallbackFile: "File:Stone_Chariot_at_Vijaya_Vittala_Temple,_Hampi.jpg"
  },
  {
    id: "virupaksha-temple",
    filename: "virupaksha-temple.jpg",
    query: "Virupaksha Temple Hampi",
    preferredFile: "File:Virupaksha_Temple,_Hampi.jpg",
    fallbackFile: "File:Virupaksha_Temple_Tower_Hampi.jpg"
  },
  {
    id: "palolem-beach",
    filename: "palolem-beach.jpg",
    query: "Palolem Beach Goa",
    preferredFile: "File:Palolem_beach_Goa.jpg",
    fallbackFile: "File:Palolem_Beach.jpg"
  },
  {
    id: "wayanad",
    filename: "wayanad.jpg",
    query: "Chembra Peak Wayanad",
    preferredFile: "File:Chembra_Peak_Heart_Lake.jpg",
    fallbackFile: "File:Banasura_Sagar_Dam_Wayanad.jpg"
  },
  {
    id: "manjarabad-fort",
    filename: "manjarabad-fort.jpg",
    query: "Manjarabad Fort Sakleshpur",
    preferredFile: "File:Manjarabad_Fort,_Sakleshpur.jpg",
    fallbackFile: "File:Manjarabad_fort_entrance.jpg"
  },
  {
    id: "dandeli-rafting",
    filename: "dandeli-rafting.jpg",
    query: "Rafting in Dandeli Kali River",
    preferredFile: "File:Rafting_in_Dandeli.jpg",
    fallbackFile: "File:Kali_River_Dandeli.jpg"
  },
  {
    id: "st-marys-island",
    filename: "st-marys-island.jpg",
    query: "St. Mary's Islands Malpe Udupi",
    preferredFile: "File:St._Mary's_Islands.jpg",
    fallbackFile: "File:St._Mary's_Island,_Malpe,_Udupi,_Karnataka,_India.jpg"
  },
  {
    id: "panambur-beach",
    filename: "panambur-beach.jpg",
    query: "Panambur Beach Mangalore",
    preferredFile: "File:Panambur_Beach,_Mangalore.jpg",
    fallbackFile: "File:Panambur_Beach.jpg"
  },
  {
    id: "kabini-safari",
    filename: "kabini-safari.jpg",
    query: "Kabini River wildlife sanctuary",
    preferredFile: "File:Kabini_River_Wildlife.jpg",
    fallbackFile: "File:Kabini_Backwaters.jpg"
  },
  {
    id: "bandipur-safari",
    filename: "bandipur-safari.jpg",
    query: "Bandipur National Park Tiger Safari",
    preferredFile: "File:Tiger_in_Bandipur_National_Park.jpg",
    fallbackFile: "File:Bandipur_National_Park.jpg"
  },
  {
    id: "sakrebyle-camp",
    filename: "sakrebyle-camp.jpg",
    query: "Sakrebyle Elephant Camp Shivamogga",
    preferredFile: "File:Sakrebyle_Elephant_Camp,_Shivamogga.jpg",
    fallbackFile: "File:Sakrebailu_Elephant_Camp.jpg"
  },
  {
    id: "jog-viewpoint",
    filename: "jog-viewpoint.jpg",
    query: "Jog Falls Karnataka India",
    preferredFile: "File:Jog_Falls,_Karnataka,_India.jpg",
    fallbackFile: "File:Jog_Falls_in_monsoon.jpg"
  },
  {
    id: "ratnagiri-bahubali",
    filename: "ratnagiri-bahubali.jpg",
    query: "Gommateshwara Statue Dharmasthala",
    preferredFile: "File:Gommateshwara_Statue,_Dharmasthala.jpg",
    fallbackFile: "File:Bahubali_statue_at_Dharmasthala.jpg"
  },
  {
    id: "kukke-temple",
    filename: "kukke-temple.jpg",
    query: "Kukke Subramanya Temple Karnataka",
    preferredFile: "File:Kukke_Subramanya_Temple.jpg",
    fallbackFile: "File:Kukke_Subramanya.jpg"
  },
  {
    id: "bangalore-palace",
    filename: "bangalore-palace.jpg",
    query: "Bangalore Palace",
    preferredFile: "File:Bangalore_Palace,_Bangalore.jpg",
    fallbackFile: "File:Bangalore_Palace_Facade.jpg"
  },
  {
    id: "badami-caves",
    filename: "badami-caves.jpg",
    query: "Badami cave temples Agastya Lake",
    preferredFile: "File:Badami_cave_temples.jpg",
    fallbackFile: "File:Badami_Cave_Temples_and_Agastya_Lake.jpg"
  },
  {
    id: "tirumala-temple",
    filename: "tirumala-temple.jpg",
    query: "Tirumala Venkateswara Temple Gopuram",
    preferredFile: "File:Tirumala_Venkateswara_Temple.jpg",
    fallbackFile: "File:Tirumala_temple_gopuram.jpg"
  }
];

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { "User-Agent": "ZeneraTrips/1.0 (travel@zeneratrips.com)" } }, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          resolve(null);
        }
      });
    }).on("error", reject);
  });
}

async function getImageUrlByFileTitle(fileTitle) {
  const url = `https://commons.wikimedia.org/w/api.php?action=query&titles=${encodeURIComponent(
    fileTitle
  )}&prop=imageinfo&iiprop=url|size|extmetadata&format=json`;
  const json = await fetchJson(url);
  if (!json?.query?.pages) return null;
  const pages = Object.values(json.query.pages);
  const page = pages.find((p) => p.imageinfo?.[0]?.url);
  if (page && page.imageinfo[0].url) {
    return {
      title: page.title,
      url: page.imageinfo[0].url,
      descUrl: page.imageinfo[0].descriptionurl,
      artist: page.imageinfo[0].extmetadata?.Artist?.value?.replace(/<[^>]*>?/gm, "") || "Wikimedia Contributor",
      license: page.imageinfo[0].extmetadata?.LicenseShortName?.value || "CC BY-SA 4.0"
    };
  }
  return null;
}

async function searchImageByQuery(query) {
  const url = `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrnamespace=6&gsrsearch=${encodeURIComponent(
    query
  )}&gsrlimit=5&prop=imageinfo&iiprop=url|size|extmetadata&format=json`;
  const json = await fetchJson(url);
  if (!json?.query?.pages) return null;
  const pages = Object.values(json.query.pages);
  for (const page of pages) {
    const info = page.imageinfo?.[0];
    if (info && info.url && (info.url.endsWith(".jpg") || info.url.endsWith(".JPG") || info.url.endsWith(".png") || info.url.includes(".jpg?") || info.url.includes(".JPG?"))) {
      return {
        title: page.title,
        url: info.url,
        descUrl: info.descriptionurl,
        artist: info.extmetadata?.Artist?.value?.replace(/<[^>]*>?/gm, "") || "Wikimedia Contributor",
        license: info.extmetadata?.LicenseShortName?.value || "CC BY-SA 4.0"
      };
    }
  }
  return null;
}

function downloadFile(fileUrl, destPath) {
  return new Promise((resolve, reject) => {
    https.get(fileUrl, { headers: { "User-Agent": "ZeneraTrips/1.0 (travel@zeneratrips.com)" } }, (res) => {
      // Handle redirects
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return downloadFile(res.headers.location, destPath).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`Failed to download: Status ${res.statusCode}`));
      }
      const fileStream = fs.createWriteStream(destPath);
      res.pipe(fileStream);
      fileStream.on("finish", () => {
        fileStream.close();
        resolve(true);
      });
      fileStream.on("error", reject);
    }).on("error", reject);
  });
}

async function run() {
  console.log(`Starting verified image acquisition for ${PLACES.length} landmarks...`);
  const metaRecords = {};

  for (const place of PLACES) {
    const targetFile = path.join(DEST_DIR, place.filename);
    console.log(`\nProcessing [${place.id}] -> ${place.filename}...`);

    let imageInfo = null;
    if (place.preferredFile) {
      imageInfo = await getImageUrlByFileTitle(place.preferredFile);
    }
    if (!imageInfo && place.fallbackFile) {
      imageInfo = await getImageUrlByFileTitle(place.fallbackFile);
    }
    if (!imageInfo) {
      imageInfo = await searchImageByQuery(place.query);
    }

    if (imageInfo && imageInfo.url) {
      try {
        console.log(`  Downloading from: ${imageInfo.url.substring(0, 80)}...`);
        await downloadFile(imageInfo.url, targetFile);
        const stats = fs.statSync(targetFile);
        console.log(`  ✓ Saved ${place.filename} (${Math.round(stats.size / 1024)} KB)`);
        metaRecords[place.id] = {
          file: `/destinations/${place.filename}`,
          source: "Wikimedia Commons",
          credit: imageInfo.artist,
          license: imageInfo.license,
          sourceUrl: imageInfo.descUrl || imageInfo.url
        };
      } catch (err) {
        console.error(`  ✗ Download error for ${place.id}:`, err.message);
      }
    } else {
      console.warn(`  ⚠ Could not find image for query: ${place.query}`);
    }
  }

  // Save metadata JSON
  fs.writeFileSync(
    path.join(__dirname, "..", "src", "data", "imageAttributions.json"),
    JSON.stringify(metaRecords, null, 2),
    "utf8"
  );
  console.log("\nFinished downloading verified images and generated imageAttributions.json!");
}

run();
