import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const attributions = JSON.parse(
  fs.readFileSync(path.join(__dirname, "..", "src", "data", "imageAttributions.json"), "utf8")
);

const publicDir = path.join(__dirname, "..", "public");

// Verified stop image map
const STOP_IMAGE_MAP = {
  // Mysore
  "srirangapatna": "/destinations/srirangapatna.jpg",
  "ranganathittu": "/destinations/ranganathittu.jpg",
  "brindavan-gardens": "/destinations/brindavan-gardens.jpg",
  "chamundi-hills": "/destinations/chamundi-hills.jpg",
  "nanjangud": "/destinations/nanjangud.jpg",
  "somnathpur": "/destinations/somnathpur.jpg",

  // Coorg
  "abbey-falls": "/destinations/abbey-falls.jpg",
  "bylakuppe-temple": "/destinations/bylakuppe.jpg",
  "rajas-seat": "/destinations/rajas-seat.jpg",
  "dubare-camp": "/destinations/dubare-camp.jpg",
  "mandalpatti": "/destinations/mandalpatti.jpg",

  // Chikmagalur
  "mullayanagiri": "/destinations/mullayanagiri.jpg",
  "baba-budangiri": "/destinations/baba-budangiri.jpg",
  "jhari-falls": "/destinations/jhari-falls.jpg",
  "hirekolale-lake": "/destinations/hirekolale-lake.jpg",

  // Ooty
  "doddabetta": "/destinations/doddabetta.jpg",
  "pykara-lake": "/destinations/pykara-lake.jpg",
  "coonoor": "/destinations/coonoor.jpg",

  // Hampi
  "vittala-temple": "/destinations/vittala-temple.jpg",
  "virupaksha-temple": "/destinations/virupaksha-temple.jpg",

  // Gokarna
  "om-beach": "/destinations/om-beach.jpg",
  "murudeshwar": "/destinations/murudeshwar.jpg",

  // Goa
  "palolem-beach": "/destinations/palolem-beach.jpg",

  // Wayanad
  "banasura-dam": "/destinations/banasura-dam.jpg",

  // Sakleshpur
  "manjarabad-fort": "/destinations/manjarabad-fort.jpg",

  // Dandeli
  "dandeli-rafting": "/destinations/dandeli-rafting.jpg",

  // Udupi
  "st-marys-island": "/destinations/st-marys-island.jpg",

  // Mangalore
  "panambur-beach": "/destinations/panambur-beach.jpg",

  // Kabini
  "kabini-backwaters": "/destinations/kabini-safari.jpg",

  // Bandipur
  "bandipur-safari": "/destinations/bandipur-safari.jpg",

  // Shivamogga
  "sakrebyle-camp": "/destinations/sakrebyle-camp.jpg",

  // Jog Falls
  "jog-viewpoint": "/destinations/jog-viewpoint.jpg",

  // Dharmasthala
  "ratnagiri-bahubali": "/destinations/ratnagiri-bahubali.jpg",

  // Kukke Subramanya
  "kukke-temple-shrine": "/destinations/kukke-temple.jpg",

  // Bengaluru
  "bangalore-palace-stop": "/destinations/bangalore-palace.jpg",

  // Badami
  "badami-caves-stop": "/destinations/badami-caves.jpg",

  // Tirupati
  "tirumala-temple": "/destinations/tirumala-temple.jpg"
};

// Verified destination hero image map
const DEST_HERO_IMAGE_MAP = {
  "mysore": "/destinations/mysore.jpg",
  "coorg": "/destinations/coorg.jpg",
  "chikmagalur": "/destinations/chikmagalur.jpg",
  "ooty": "/destinations/ooty.jpg",
  "hampi": "/destinations/hampi.jpg",
  "gokarna": "/destinations/gokarna.jpg",
  "goa": "/destinations/goa.jpg",
  "wayanad": "/destinations/wayanad.jpg",
  "sakleshpur": "/destinations/sakleshpur.jpg",
  "dandeli": "/destinations/dandeli.jpg",
  "udupi": "/destinations/udupi.jpg",
  "mangalore": "/destinations/mangalore.jpg",
  "kabini": "/destinations/kabini.jpg",
  "bandipur": "/destinations/bandipur.jpg",
  "shivamogga": "/destinations/shivamogga.jpg",
  "jog-falls": "/destinations/jog-falls.jpg",
  "dharmasthala": "/destinations/dharmasthala.jpg",
  "kukke-subramanya": "/destinations/kukke-subramanya.jpg",
  "bengaluru": "/destinations/bengaluru.jpg",
  "badami": "/destinations/badami.jpg",
  "tirupati": "/destinations/tirupati.jpg"
};

// Validate that every single file exists in public/
let missingFiles = 0;
for (const [stopId, imgPath] of Object.entries(STOP_IMAGE_MAP)) {
  const fullPath = path.join(publicDir, imgPath.replace(/^\//, ""));
  if (!fs.existsSync(fullPath)) {
    console.error(`MISSING STOP IMAGE: ${stopId} -> ${fullPath}`);
    missingFiles++;
  }
}
for (const [destId, imgPath] of Object.entries(DEST_HERO_IMAGE_MAP)) {
  const fullPath = path.join(publicDir, imgPath.replace(/^\//, ""));
  if (!fs.existsSync(fullPath)) {
    console.error(`MISSING DEST IMAGE: ${destId} -> ${fullPath}`);
    missingFiles++;
  }
}

if (missingFiles > 0) {
  console.error(`Abort: ${missingFiles} images are missing!`);
  process.exit(1);
} else {
  console.log("✓ All 21 destination images and all 35+ stop images exist on disk!");
}
