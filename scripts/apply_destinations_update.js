import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataPath = path.join(__dirname, "..", "src", "data", "destinations.js");
let code = fs.readFileSync(dataPath, "utf8");

// Update Wayanad hero
code = code.replace(
  /id:\s*"wayanad"[\s\S]*?image:\s*"\/destinations\/kerala\.jpg"/,
  (m) => m.replace("/destinations/kerala.jpg", "/destinations/wayanad.jpg")
);

// Explicit verified image updates for each stop
const STOP_UPDATES = [
  {
    id: "nanjangud",
    image: "/destinations/nanjangud.jpg",
    source: "Wikimedia Commons",
    credit: "MADHURANTHAKAN JAGADEESAN",
    license: "CC BY-SA 4.0",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:N-KA-B159_Srikanteshwara_Temple_Gopuram_Nanjangud.jpg"
  },
  {
    id: "somnathpur",
    image: "/destinations/somnathpur.jpg",
    source: "Wikimedia Commons",
    credit: "Shridevi thirumalesh",
    license: "CC BY-SA 3.0",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Chennakesava_Temple,_Somanathapura.jpg"
  },
  {
    id: "rajas-seat",
    image: "/destinations/rajas-seat.jpg",
    source: "Wikimedia Commons",
    credit: "Akshayprabhu2005",
    license: "CC BY-SA 3.0",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Raja_seat_at_madikeri.JPG"
  },
  {
    id: "dubare-camp",
    image: "/destinations/dubare-camp.jpg",
    source: "Wikimedia Commons",
    credit: "Shital 90",
    license: "CC BY-SA 4.0",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Dubare_Elephant_Camp.jpg"
  },
  {
    id: "mandalpatti",
    image: "/destinations/mandalpatti.jpg",
    source: "Wikimedia Commons",
    credit: "Smithasalian",
    license: "CC BY-SA 4.0",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Mandalpatti.jpg"
  },
  {
    id: "baba-budangiri",
    image: "/destinations/baba-budangiri.jpg",
    source: "Wikimedia Commons",
    credit: "Gpkp",
    license: "CC BY-SA 4.0",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Baba_Budangiri,_Chikmagalur_(2024)_37.jpg"
  },
  {
    id: "jhari-falls",
    image: "/destinations/jhari-falls.jpg",
    source: "Wikimedia Commons",
    credit: "L. Shyamal",
    license: "CC BY-SA 4.0",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Jhari_Falls.jpg"
  },
  {
    id: "hirekolale-lake",
    image: "/destinations/hirekolale-lake.jpg",
    source: "Wikimedia Commons",
    credit: "Ryna",
    license: "CC BY-SA 3.0",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Hirekolale_Lake.jpg"
  },
  {
    id: "pykara-lake",
    image: "/destinations/pykara-lake.jpg",
    source: "Wikimedia Commons",
    credit: "Kumarvaibhavame",
    license: "CC BY-SA 4.0",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Pykara_Lake_Ooty.jpg"
  },
  {
    id: "coonoor",
    image: "/destinations/coonoor.jpg",
    source: "Wikimedia Commons",
    credit: "SHUVADIP",
    license: "CC BY-SA 4.0",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Tea_plantations_in_Coonoor_(1).jpg"
  },
  {
    id: "vittala-temple",
    image: "/destinations/vittala-temple.jpg",
    source: "Wikimedia Commons",
    credit: "A.Davey",
    license: "CC BY 2.0",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Stone_chariot,_Vittala_temple,_Hampi.jpg"
  },
  {
    id: "virupaksha-temple",
    image: "/destinations/virupaksha-temple.jpg",
    source: "Wikimedia Commons",
    credit: "A.Davey",
    license: "CC BY 2.0",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Virupaksha_Temple,_Hampi.jpg"
  },
  {
    id: "palolem-beach",
    image: "/destinations/palolem-beach.jpg",
    source: "Wikimedia Commons",
    credit: "Vyacheslav Argenberg",
    license: "CC BY 4.0",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Palolem_beach_Goa.jpg"
  },
  {
    id: "manjarabad-fort",
    image: "/destinations/manjarabad-fort.jpg",
    source: "Wikimedia Commons",
    credit: "Ashwin Kumar",
    license: "CC BY-SA 2.0",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Manjarabad_Fort.jpg"
  },
  {
    id: "dandeli-rafting",
    image: "/destinations/dandeli-rafting.jpg",
    source: "Wikimedia Commons",
    credit: "Anand Nair",
    license: "CC BY-SA 3.0",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Rafting_in_Dandeli.jpg"
  },
  {
    id: "st-marys-island",
    image: "/destinations/st-marys-island.jpg",
    source: "Wikimedia Commons",
    credit: "Manjunath.D",
    license: "CC BY-SA 4.0",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:St._Mary%27s_Islands.jpg"
  },
  {
    id: "panambur-beach",
    image: "/destinations/panambur-beach.jpg",
    source: "Wikimedia Commons",
    credit: "Hari Prasad Nadig",
    license: "CC BY-SA 2.0",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Panambur_Beach,_Mangalore.jpg"
  },
  {
    id: "kabini-backwaters",
    image: "/destinations/kabini-safari.jpg",
    source: "Wikimedia Commons",
    credit: "L. Shyamal",
    license: "CC BY-SA 3.0",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Kabini_River.jpg"
  },
  {
    id: "bandipur-safari",
    image: "/destinations/bandipur-safari.jpg",
    source: "Wikimedia Commons",
    credit: "Yathin S Krishnappa",
    license: "CC BY-SA 3.0",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Bandipur_National_Park.jpg"
  },
  {
    id: "sakrebyle-camp",
    image: "/destinations/sakrebyle-camp.jpg",
    source: "Wikimedia Commons",
    credit: "Kalyan3",
    license: "CC BY-SA 3.0",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Sakrebailu_elephant_camp_1.jpg"
  },
  {
    id: "jog-viewpoint",
    image: "/destinations/jog-viewpoint.jpg",
    source: "Wikimedia Commons",
    credit: "Arkadeep Meta",
    license: "CC BY-SA 4.0",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Jog_Falls,_Karnataka,_India.jpg"
  },
  {
    id: "ratnagiri-bahubali",
    image: "/destinations/ratnagiri-bahubali.jpg",
    source: "Wikimedia Commons",
    credit: "Dinesh Kannambadi",
    license: "CC BY-SA 3.0",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Gommateswara_Dharmasthala.jpg"
  },
  {
    id: "kukke-temple-shrine",
    image: "/destinations/kukke-temple.jpg",
    source: "Wikimedia Commons",
    credit: "Premnath Kudva",
    license: "CC BY-SA 3.0",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Kukke_Subramanya_Temple.jpg"
  },
  {
    id: "bangalore-palace-stop",
    image: "/destinations/bangalore-palace.jpg",
    source: "Wikimedia Commons",
    credit: "Muhammad Mahdi Karim",
    license: "GNU FDL 1.2",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:BLR_palace_main_entrance.jpg"
  },
  {
    id: "badami-caves-stop",
    image: "/destinations/badami-caves.jpg",
    source: "Wikimedia Commons",
    credit: "Dinesh Kannambadi",
    license: "CC BY-SA 3.0",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Badami_cave_temples.jpg"
  },
  {
    id: "tirumala-temple",
    image: "/destinations/tirumala-temple.jpg",
    source: "Wikimedia Commons",
    credit: "Adityamadhav83",
    license: "CC BY-SA 3.0",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Tirumala_gopurams.JPG"
  }
];

for (const u of STOP_UPDATES) {
  // Regex to match the stop block by its id
  const reg = new RegExp(
    `(id:\\s*"${u.id}",[\\s\\S]*?image:\\s*)"[^"]+"([\\s\\S]*?description:)`,
    "m"
  );
  if (reg.test(code)) {
    code = code.replace(reg, (match, prefix, suffix) => {
      let extra = `imageSource: "${u.source}",\n        imageCredit: "${u.credit}",\n        imageLicense: "${u.license}",\n        sourceUrl: "${u.sourceUrl}",\n        `;
      if (!suffix.includes("slug:")) {
        extra = `slug: "${u.id}",\n        ` + extra;
      }
      return `${prefix}"${u.image}",\n        ${extra}${suffix}`;
    });
    console.log(`✓ Updated stop: ${u.id} -> ${u.image}`);
  } else {
    console.warn(`⚠ Could not match regex for stop: ${u.id}`);
  }
}

fs.writeFileSync(dataPath, code, "utf8");
console.log("\nSuccessfully updated src/data/destinations.js!");
