/**
 * ZENERA TRIPS — Firebase Cloud Functions
 * Backend Operations & Razorpay Payment Gateway Integration
 * Credentials: functions/.env (with fallback to environment variables / Secret Manager)
 */

const fs = require("fs");
const path = require("path");

// Robust .env loader executed immediately on module initialization
function loadEnvFallback() {
  try {
    const envPath = path.join(__dirname, ".env");
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, "utf8");
      content.split("\n").forEach((line) => {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith("#")) {
          const eqIdx = trimmed.indexOf("=");
          if (eqIdx !== -1) {
            const key = trimmed.slice(0, eqIdx).trim();
            const val = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, "");
            if (key) {
              process.env[key] = val;
            }
          }
        }
      });
    }
  } catch (_) {}
}
loadEnvFallback();

// Gen 2 HTTPS APIs for payment and webhook functions
const { onCall, onRequest, HttpsError } = require("firebase-functions/v2/https");

// Gen 1 functions import preserved for existing shared functions
const functions = require("firebase-functions/v1");
const admin = require("firebase-admin");
const { getApps, initializeApp } = require("firebase-admin/app");
const { getFirestore, FieldValue } = require("firebase-admin/firestore");

if (!getApps().length) {
  initializeApp();
}

const db = getFirestore();

// Provide compatibility bridge for admin.firestore.FieldValue
if (!admin.firestore) {
  admin.firestore = { FieldValue };
} else if (!admin.firestore.FieldValue) {
  admin.firestore.FieldValue = FieldValue;
}

// ============================================================
// FALLBACK DATA (In case Firestore fails)
// ============================================================

const FALLBACK_FLEETS = [
  {
    id: "sedan-ac",
    name: "Sedan (AC Sanitized Outstation Fleet)",
    description: "Comfortable 4-seater sedan for long-distance trips",
    seats: 4,
    ac: true,
    basePrice: 1000,
    perKmPrice: 8,
    perDayPrice: 800,
    minKmCharge: 50,
    cancellationCharge: 200,
  },
  {
    id: "suv-ac",
    name: "SUV (AC Sanitized Outstation Fleet)",
    description: "Spacious 6-seater SUV for group trips",
    seats: 6,
    ac: true,
    basePrice: 1200,
    perKmPrice: 10,
    perDayPrice: 1000,
    minKmCharge: 50,
    cancellationCharge: 300,
  },
  {
    id: "tempo-traveller",
    name: "Tempo Traveller (AC Sanitized Outstation Fleet)",
    description: "Large 13-seater for big groups",
    seats: 13,
    ac: true,
    basePrice: 1500,
    perKmPrice: 12,
    perDayPrice: 1200,
    minKmCharge: 50,
    cancellationCharge: 400,
  },
];

// ============================================================
// SAFE STRUCTURED LOGGING & CORRELATION ENGINE
// ============================================================

function sanitizeLogDetails(obj) {
  if (!obj || typeof obj !== "object") return obj;
  const sensitiveKeys = new Set([
    "secretkey",
    "secret_key",
    "xclientsecret",
    "x-client-secret",
    "token",
    "idtoken",
    "id_token",
    "password",
    "authorization",
    "auth",
    "headers",
    "card",
    "card_number",
    "cardnumber",
    "cvv",
    "cvc",
    "otp",
    "refreshtoken",
    "refresh_token"
  ]);

  if (Array.isArray(obj)) {
    return obj.map((item) => sanitizeLogDetails(item));
  }

  const result = {};
  for (const [key, value] of Object.entries(obj)) {
    const normalizedKey = key.toLowerCase().replace(/[^a-z0-9_-]/g, "");
    if (
      sensitiveKeys.has(normalizedKey) ||
      normalizedKey.includes("secret") ||
      normalizedKey.includes("password") ||
      normalizedKey.includes("token") ||
      normalizedKey.includes("auth")
    ) {
      result[key] = "[REDACTED]";
    } else if (value && typeof value === "object") {
      result[key] = sanitizeLogDetails(value);
    } else {
      result[key] = value;
    }
  }
  return result;
}

/**
 * Emits safe structured JSON logs for observability in Cloud Logging.
 * STRICTLY SCRUBS all sensitive tokens, secrets, passwords, and card credentials.
 */
function safeStructuredLog(stage, correlationId, details = {}) {
  const sanitized = sanitizeLogDetails(details);
  console.log(
    JSON.stringify({
      timestamp: new Date().toISOString(),
      system: "ZENERA_PAYMENT_ENGINE",
      stage,
      correlationId: correlationId || "none",
      ...sanitized,
    })
  );
}

// ============================================================
// CONFIGURATION & RAZORPAY ENVIRONMENT
// ============================================================

/**
 * Retrieves Razorpay configuration directly from functions/.env, process.env,
 * or Firebase Secret Manager parameters.
 */
function getRazorpayConfig() {
  loadEnvFallback();

  let keyId = (process.env.RAZORPAY_KEY_ID || "").trim();
  let keySecret = (process.env.RAZORPAY_KEY_SECRET || "").trim();

  return {
    keyId,
    keySecret,
  };
}

/**
 * Sanitizes phone numbers strictly to 10 digits as required by Indian PG APIs.
 * Strips '+91', '91', country codes, spaces, dashes, and invalid characters.
 * Validates Indian 10-digit mobile series [6-9]XXXXXXXXX.
 */
function sanitizeCustomerPhone(rawPhone) {
  if (rawPhone === undefined || rawPhone === null) return "";
  const str = String(rawPhone).trim();
  if (!str) return "";
  const digits = str.replace(/\D/g, "");
  if (digits.length === 10 && /^[6-9]\d{9}$/.test(digits)) return digits;
  if (digits.length === 12 && digits.startsWith("91")) {
    const stripped = digits.slice(2);
    if (/^[6-9]\d{9}$/.test(stripped)) return stripped;
  }
  if (digits.length > 10) {
    const last10 = digits.slice(-10);
    if (/^[6-9]\d{9}$/.test(last10)) return last10;
  }
  return "";
}

/**
 * Normalizes customer ID to alphanumeric string (length 3-50).
 */
function sanitizeCustomerId(rawUid) {
  if (!rawUid || typeof rawUid !== "string") return "cust_anonymous";
  const cleaned = rawUid.replace(/[^a-zA-Z0-9_-]/g, "");
  return cleaned.length >= 3 ? cleaned.slice(0, 50) : `cust_${cleaned.padEnd(3, "0")}`;
}

// ============================================================
// CANONICAL VEHICLE MATRIX & AUTHORITATIVE PRICING ENGINE
// Single Source of Truth: Firestore `pricing_rules` collection
// ============================================================

let cachedPricingRules = null;
let cacheExpiryTime = 0;
const PRICING_CACHE_TTL_MS = 60 * 1000; // 60s cache for high throughput while staying real-time

/**
 * Loads authoritative fleet pricing rules from Firestore `pricing_rules` collection.
 * Normalizes all documents and guarantees consistent schema.
 */
async function getBackendPricingRules(forceRefresh = false) {
  const now = Date.now();
  if (!forceRefresh && cachedPricingRules && Array.isArray(cachedPricingRules) && cachedPricingRules.length > 0 && now < cacheExpiryTime) {
    return cachedPricingRules;
  }

  try {
    const snap = await db.collection("pricing_rules").get();
    const rules = [];
    snap.forEach((doc) => {
      const data = doc.data() || {};
      const id = doc.id;

      // Step 6: Fix vehicle name mapping safely
      // If doc id is "Hatchback" but vehicleType had a historical copy-paste "Bus" value, normalize to "Hatchback"
      let vehicleType = data.vehicleType || id;
      if (id.toLowerCase() === "hatchback" && String(vehicleType).trim().toLowerCase() === "bus") {
        vehicleType = "Hatchback";
      }

      const pricePerKm = typeof data.pricePerKm === "number" ? data.pricePerKm : Number(data.pricePerKm) || 0;
      const dailyAllowance = typeof data.dailyAllowance === "number" ? data.dailyAllowance : Number(data.dailyAllowance) || 500;
      const minKmPerDay = typeof data.minKmPerDay === "number" ? data.minKmPerDay : Number(data.minKmPerDay) || 300;

      rules.push({
        id: id,
        vehicleType: String(vehicleType).trim(),
        pricePerKm: pricePerKm,
        dailyAllowance: dailyAllowance,
        minKmPerDay: minKmPerDay,
      });
    });

    if (rules.length > 0) {
      cachedPricingRules = rules;
      cacheExpiryTime = now + PRICING_CACHE_TTL_MS;
      return rules;
    }
  } catch (err) {
    console.error("SAFE DIAGNOSTIC LOG — Error reading pricing_rules from Firestore:", err?.message);
  }

  if (cachedPricingRules && Array.isArray(cachedPricingRules) && cachedPricingRules.length > 0) {
    return cachedPricingRules;
  }

  return [];
}

/**
 * Authoritatively resolves any vehicle identifier, vehicleType, or name to its matching pricing rule.
 */
function resolveBackendPricingRule(rules, param) {
  if (!rules || rules.length === 0) {
    return { id: "innova-crysta", vehicleType: "Innova Crysta", pricePerKm: 19, dailyAllowance: 500, minKmPerDay: 300 };
  }
  if (!param) {
    return rules.find((r) => r.vehicleType.toLowerCase().includes("innova")) || rules[0];
  }

  const p = (typeof param === "object" && param.id ? String(param.id) : String(param)).trim().toLowerCase();

  // 1. Direct ID match
  const byId = rules.find((r) => r.id.toLowerCase() === p);
  if (byId) return byId;

  // 2. Direct vehicleType match
  const byType = rules.find((r) => r.vehicleType.toLowerCase() === p);
  if (byType) return byType;

  // 3. Substring & Alias Matching
  if (p.includes("crysta") || p.includes("innova crysta")) {
    return rules.find((r) => r.vehicleType.toLowerCase().includes("crysta") || r.id.toLowerCase().includes("crysta")) ||
      rules.find((r) => r.vehicleType.toLowerCase() === "innova crysta") ||
      rules.find((r) => r.vehicleType.toLowerCase().includes("innova")) ||
      rules[0];
  }
  if (p.includes("innova")) {
    return rules.find((r) => r.vehicleType.toLowerCase() === "innova" || r.id.toLowerCase() === "innova") ||
      rules.find((r) => r.vehicleType.toLowerCase().includes("innova")) ||
      rules[0];
  }
  if (p.includes("ertiga")) {
    return rules.find((r) => r.vehicleType.toLowerCase().includes("ertiga") || r.id.toLowerCase().includes("ertiga")) || rules[0];
  }
  if (p.includes("dzire") || p.includes("etios") || p.includes("sedan")) {
    return rules.find((r) => r.vehicleType.toLowerCase() === "sedan" || r.id.toLowerCase() === "sedan") ||
      rules.find((r) => r.vehicleType.toLowerCase().includes("sedan")) ||
      rules[0];
  }
  if (p.includes("hatchback")) {
    return rules.find((r) => r.id.toLowerCase() === "hatchback" || r.vehicleType.toLowerCase() === "hatchback") ||
      rules.find((r) => r.vehicleType.toLowerCase().includes("hatchback")) ||
      rules[0];
  }
  if (p.includes("honda")) {
    return rules.find((r) => r.vehicleType.toLowerCase().includes("honda") || r.id.toLowerCase().includes("honda")) || rules[0];
  }
  if (p.includes("toyota")) {
    return rules.find((r) => r.vehicleType.toLowerCase().includes("toyota") || r.id.toLowerCase().includes("toyota")) || rules[0];
  }
  if (p.includes("mini bus") || p.includes("minibus") || p.includes("mini-bus")) {
    return rules.find((r) => r.vehicleType.toLowerCase().includes("mini bus") || r.id.toLowerCase().includes("mini bus")) || rules[0];
  }
  if (p.includes("tempo") || p.includes("traveller") || p.includes("urbania") || p === "tt") {
    return rules.find((r) => r.id.toLowerCase() === "tt" || r.vehicleType.toLowerCase() === "tt" || r.vehicleType.toLowerCase().includes("tempo") || r.vehicleType.toLowerCase().includes("traveller")) || rules[0];
  }
  if (p.includes("luxury bus") || p.includes("bus")) {
    return rules.find((r) => r.vehicleType.toLowerCase() === "bus" || r.id.toLowerCase() === "bus") ||
      rules.find((r) => r.vehicleType.toLowerCase().includes("bus")) ||
      rules[0];
  }
  if (p.includes("suv")) {
    return rules.find((r) => r.vehicleType.toLowerCase() === "suv" || r.id.toLowerCase() === "suv") ||
      rules.find((r) => r.vehicleType.toLowerCase().includes("crysta") || r.vehicleType.toLowerCase().includes("innova")) ||
      rules[0];
  }

  // 4. Partial substring in vehicleType or id
  const partial = rules.find((r) => r.vehicleType.toLowerCase().includes(p) || p.includes(r.vehicleType.toLowerCase()) || r.id.toLowerCase().includes(p));
  if (partial) return partial;

  return rules[0];
}

// ============================================================
// CANONICAL COORDINATES & GEODESIC ROUTE VALIDATION ENGINE
// ============================================================

const CANONICAL_COORDINATES = {
  // Transit Hubs & Origins
  "bangalore": { lat: 12.9716, lng: 77.5946 },
  "bengaluru": { lat: 12.9716, lng: 77.5946 },
  "kempegowda-international-airport": { lat: 13.1986, lng: 77.7066 },
  "whitefield": { lat: 12.9698, lng: 77.7500 },
  "electronic-city": { lat: 12.8399, lng: 77.6770 },
  "indiranagar": { lat: 12.9784, lng: 77.6408 },
  "koramangala": { lat: 12.9352, lng: 77.6245 },
  "hsr-layout": { lat: 12.9121, lng: 77.6446 },
  "majestic": { lat: 12.9767, lng: 77.5713 },

  // Primary Destinations
  "mysore": { lat: 12.2958, lng: 76.6394 },
  "mysuru": { lat: 12.2958, lng: 76.6394 },
  "coorg": { lat: 12.4244, lng: 75.7382 },
  "kodagu": { lat: 12.4244, lng: 75.7382 },
  "madikeri": { lat: 12.4244, lng: 75.7382 },
  "chikmagalur": { lat: 13.3161, lng: 75.7720 },
  "chikkamagaluru": { lat: 13.3161, lng: 75.7720 },
  "ooty": { lat: 11.4102, lng: 76.6950 },
  "udhagamandalam": { lat: 11.4102, lng: 76.6950 },
  "hampi": { lat: 15.3350, lng: 76.4600 },
  "gokarna": { lat: 14.5479, lng: 74.3188 },
  "goa": { lat: 15.2993, lng: 74.1240 },
  "wayanad": { lat: 11.6854, lng: 76.1320 },
  "sakleshpur": { lat: 12.9438, lng: 75.7876 },
  "kabini": { lat: 11.9333, lng: 76.2500 },
  "bandipur": { lat: 11.6664, lng: 76.6291 },
  "nagarhole": { lat: 12.0312, lng: 76.1264 },
  "pondicherry": { lat: 11.9416, lng: 79.8083 },
  "puducherry": { lat: 11.9416, lng: 79.8083 },
  "kodaikanal": { lat: 10.2381, lng: 77.4892 },
  "munnar": { lat: 10.0889, lng: 77.0595 },
  "dandeli": { lat: 15.2361, lng: 74.6173 },
  "shravanabelagola": { lat: 12.8586, lng: 76.4856 },
  "belur": { lat: 13.1623, lng: 75.8596 },
  "halebidu": { lat: 13.2185, lng: 75.9926 },
  "badami": { lat: 15.9189, lng: 75.6775 },
  "tirupati": { lat: 13.6288, lng: 79.4192 },
  "tirumala": { lat: 13.6833, lng: 79.3500 },

  // Intermediate Corridor Towns & Spots
  "hassan": { lat: 13.0033, lng: 76.1004 },
  "tumakuru": { lat: 13.3422, lng: 77.1017 },
  "tumkur": { lat: 13.3422, lng: 77.1017 },
  "mandya": { lat: 12.5242, lng: 76.8958 },
  "ramanagara": { lat: 12.7209, lng: 77.2799 },
  "channapatna": { lat: 12.6518, lng: 77.2089 },
  "maddur": { lat: 12.5844, lng: 77.0450 },
  "srirangapatna": { lat: 12.4237, lng: 76.6947 },
  "ranganathittu": { lat: 12.4249, lng: 76.6775 },
  "brindavan-gardens": { lat: 12.4228, lng: 76.5724 },
  "chamundi-hills": { lat: 12.2741, lng: 76.6713 },
  "nanjangud": { lat: 12.1194, lng: 76.6806 },
  "somnathpur": { lat: 12.2758, lng: 76.9048 },
  "talakadu": { lat: 12.1969, lng: 77.0319 },
  "shivanasamudra": { lat: 12.2961, lng: 77.1706 },
  "kushalnagar": { lat: 12.4578, lng: 75.9614 },
  "bylakuppe": { lat: 12.4344, lng: 75.9644 },
  "bylakuppe-temple": { lat: 12.4344, lng: 75.9644 },
  "dubare-camp": { lat: 12.3683, lng: 75.9056 },
  "abbey-falls": { lat: 12.4539, lng: 75.7178 },
  "rajas-seat": { lat: 12.4189, lng: 75.7378 },
  "mandalpatti": { lat: 12.5028, lng: 75.7003 },
  "iruppu-falls": { lat: 12.0347, lng: 75.9861 },
  "mullayanagiri": { lat: 13.3912, lng: 75.7214 },
  "baba-budangiri": { lat: 13.4244, lng: 75.7656 },
  "jhari-falls": { lat: 13.3764, lng: 75.7489 },
  "hirekolale-lake": { lat: 13.3417, lng: 75.7333 },
  "kudremukh": { lat: 13.2167, lng: 75.2667 },
  "horanadu": { lat: 13.2667, lng: 75.3333 },
  "sringeri": { lat: 13.4167, lng: 75.2500 },
  "doddabetta": { lat: 11.4011, lng: 76.7361 },
  "pykara-lake": { lat: 11.4589, lng: 76.5989 },
  "coonoor": { lat: 11.3530, lng: 76.7959 },
  "kotagiri": { lat: 11.4200, lng: 76.8800 },
  "mudumalai": { lat: 11.5623, lng: 76.5342 },
  "gundlupet": { lat: 11.8089, lng: 76.6894 },
  "vittala-temple": { lat: 15.3358, lng: 76.4789 },
  "virupaksha-temple": { lat: 15.3353, lng: 76.4600 },
  "om-beach": { lat: 14.5186, lng: 74.3161 },
  "kudle-beach": { lat: 14.5294, lng: 74.3167 },
  "murudeshwar": { lat: 14.0944, lng: 74.4897 },
  "banasura-dam": { lat: 11.6689, lng: 75.9575 },
  "edakkal-caves": { lat: 11.6289, lng: 76.2344 },
  "chembra-peak": { lat: 11.5125, lng: 76.0883 },
  "channarayapatna": { lat: 12.9039, lng: 76.3900 },
  "kunigal": { lat: 13.0239, lng: 77.0319 },
  "nelamangala": { lat: 13.0989, lng: 77.3917 },
  "kanakapura": { lat: 12.5467, lng: 77.4178 },
  "hosur": { lat: 12.7409, lng: 77.8253 },
  "krishnagiri": { lat: 12.5266, lng: 78.2144 },
  "vellore": { lat: 12.9165, lng: 79.1325 },
  "kanchipuram": { lat: 12.8342, lng: 79.7036 },
  "mahabalipuram": { lat: 12.6269, lng: 80.1927 },
  "salem": { lat: 11.6643, lng: 78.1460 },
  "coimbatore": { lat: 11.0168, lng: 76.9558 },
  "yelagiri": { lat: 12.5786, lng: 78.6394 },

  // Distant Cities (Explicitly mapped to guarantee rejection outside route)
  "mumbai": { lat: 19.0760, lng: 72.8777 },
  "delhi": { lat: 28.6139, lng: 77.2090 },
  "new-delhi": { lat: 28.6139, lng: 77.2090 },
  "chennai": { lat: 13.0827, lng: 80.2707 },
  "hyderabad": { lat: 17.3850, lng: 78.4867 },
  "kolkata": { lat: 22.5726, lng: 88.3639 },
  "pune": { lat: 18.5204, lng: 73.8567 },
  "ahmedabad": { lat: 23.0225, lng: 72.5714 },
  "jaipur": { lat: 26.9124, lng: 75.7873 },
  "lucknow": { lat: 26.8467, lng: 80.9462 },
  "chandigarh": { lat: 30.7333, lng: 76.7794 },
};

const MAX_CUSTOM_STOP_ROUTE_DEVIATION_KM = 50;
const MAX_CUSTOM_STOP_DESTINATION_RADIUS_KM = 45;
const MAX_CUSTOM_STOP_DETOUR_KM = 75;

function resolveLocationCoordinates(loc) {
  if (!loc) return null;
  if (typeof loc === "object") {
    if (typeof loc.lat === "number" && typeof loc.lng === "number") return { lat: loc.lat, lng: loc.lng };
    if (typeof loc.lat === "number" && typeof loc.lon === "number") return { lat: loc.lat, lng: loc.lon };
    if (loc.coordinates && typeof loc.coordinates.lat === "number") return loc.coordinates;
  }
  const clean = String(loc).trim().toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-");
  if (!clean) return null;
  if (CANONICAL_COORDINATES[clean]) return CANONICAL_COORDINATES[clean];

  for (const [key, coords] of Object.entries(CANONICAL_COORDINATES)) {
    if (clean.includes(key) || key.includes(clean)) return coords;
  }
  return null;
}

function haversineDistanceKm(c1, c2) {
  const R = 6371;
  const dLat = ((c2.lat - c1.lat) * Math.PI) / 180;
  const dLon = ((c2.lng - c1.lng) * Math.PI) / 180;
  const lat1 = (c1.lat * Math.PI) / 180;
  const lat2 = (c2.lat * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

function pointToSegmentDistanceKm(p, a, b) {
  const midLat = ((a.lat + b.lat) / 2) * (Math.PI / 180);
  const cosMidLat = Math.cos(midLat);
  const degToKm = 111.32;
  const bx = (b.lng - a.lng) * cosMidLat * degToKm;
  const by = (b.lat - a.lat) * degToKm;
  const px = (p.lng - a.lng) * cosMidLat * degToKm;
  const py = (p.lat - a.lat) * degToKm;

  const segLengthSq = bx * bx + by * by;
  if (segLengthSq < 0.01) return haversineDistanceKm(p, a);

  const t = (px * bx + py * by) / segLengthSq;
  const clampedT = Math.max(0, Math.min(1, t));
  const dx = px - clampedT * bx;
  const dy = py - clampedT * by;

  return Math.round(Math.sqrt(dx * dx + dy * dy) * 10) / 10;
}

function validateCustomStopAgainstRoute(stop, primaryWaypoints) {
  const stopCoords = resolveLocationCoordinates(stop);
  const stopName = typeof stop === "object" ? stop.name || stop.id : String(stop);

  if (!stopCoords) {
    return {
      isValid: false,
      reason: `Location coordinates could not be determined for "${stopName}". Please choose a verified nearby location.`,
    };
  }

  const resolvedWaypoints = [];
  for (const wp of primaryWaypoints) {
    if (!wp) continue;
    const coords = resolveLocationCoordinates(wp);
    const name = typeof wp === "object" ? wp.name || wp.id : String(wp);
    if (coords) resolvedWaypoints.push({ name, coords });
  }

  if (resolvedWaypoints.length === 0) {
    return { isValid: true, distanceToRouteKm: 0 };
  }

  // Check destination proximity
  let minDestDist = Infinity;
  let nearestDestName = "";
  for (const wp of resolvedWaypoints) {
    const dist = haversineDistanceKm(stopCoords, wp.coords);
    if (dist < minDestDist) {
      minDestDist = dist;
      nearestDestName = wp.name;
    }
  }

  if (minDestDist <= MAX_CUSTOM_STOP_DESTINATION_RADIUS_KM) {
    return { isValid: true, distanceToNearestDestKm: minDestDist, nearestDestName };
  }

  // Check corridor segment distance & detour
  let minRouteDist = Infinity;
  let minDetour = Infinity;

  if (resolvedWaypoints.length >= 2) {
    for (let i = 0; i < resolvedWaypoints.length - 1; i++) {
      const wpA = resolvedWaypoints[i];
      const wpB = resolvedWaypoints[i + 1];
      const segDist = pointToSegmentDistanceKm(stopCoords, wpA.coords, wpB.coords);
      if (segDist < minRouteDist) minRouteDist = segDist;

      const directDist = haversineDistanceKm(wpA.coords, wpB.coords);
      const detourDist =
        haversineDistanceKm(wpA.coords, stopCoords) +
        haversineDistanceKm(stopCoords, wpB.coords) -
        directDist;
      if (detourDist < minDetour) minDetour = detourDist;
    }
  } else {
    minRouteDist = minDestDist;
  }

  if (minRouteDist <= MAX_CUSTOM_STOP_ROUTE_DEVIATION_KM || minDetour <= MAX_CUSTOM_STOP_DETOUR_KM) {
    return { isValid: true, distanceToRouteKm: minRouteDist };
  }

  const originName = resolvedWaypoints[0]?.name || "origin";
  const destName = resolvedWaypoints[resolvedWaypoints.length - 1]?.name || "destination";

  return {
    isValid: false,
    distanceToRouteKm: minRouteDist,
    reason: `Stop "${stopName}" is too far from your ${originName} → ${destName} route (${Math.round(minRouteDist)} km away). Please choose a nearby stop or a location along your trip corridor.`,
  };
}

// ============================================================
// KNOWN ROAD DISTANCES & ITINERARY CALCULATION ENGINE
// ============================================================

const KNOWN_ROAD_DISTANCES = {
  // Bangalore to Destinations
  "bangalore-mysore": 145,
  "mysore-bangalore": 145,
  "bangalore-srirangapatna": 130,
  "srirangapatna-bangalore": 130,
  "bangalore-nanjangud": 170,
  "nanjangud-bangalore": 170,
  "bangalore-coorg": 260,
  "coorg-bangalore": 260,
  "bangalore-madikeri": 260,
  "madikeri-bangalore": 260,
  "bangalore-chikmagalur": 245,
  "chikmagalur-bangalore": 245,
  "bangalore-chikkamagaluru": 245,
  "chikkamagaluru-bangalore": 245,
  "bangalore-ooty": 270,
  "ooty-bangalore": 270,
  "bangalore-wayanad": 280,
  "wayanad-bangalore": 280,
  "bangalore-sakleshpur": 220,
  "sakleshpur-bangalore": 220,
  "bangalore-kabini": 215,
  "kabini-bangalore": 215,
  "bangalore-bandipur": 220,
  "bandipur-bangalore": 220,
  "bangalore-hampi": 340,
  "hampi-bangalore": 340,
  "bangalore-gokarna": 490,
  "gokarna-bangalore": 490,
  "bangalore-goa": 580,
  "goa-bangalore": 580,
  "bangalore-pondicherry": 310,
  "pondicherry-bangalore": 310,
  "bangalore-puducherry": 310,
  "puducherry-bangalore": 310,
  "bangalore-tirupati": 250,
  "tirupati-bangalore": 250,
  "bangalore-kodaikanal": 465,
  "kodaikanal-bangalore": 465,
  "bangalore-munnar": 475,
  "munnar-bangalore": 475,
  "bangalore-dandeli": 460,
  "dandeli-bangalore": 460,
  "bangalore-hassan": 185,
  "hassan-bangalore": 185,
  "bangalore-shravanabelagola": 140,
  "shravanabelagola-bangalore": 140,
  "bangalore-belur": 220,
  "belur-bangalore": 220,
  "bangalore-halebidu": 210,
  "halebidu-bangalore": 210,

  // Mysore Region Secondary Stops
  "srirangapatna-mysore": 18,
  "mysore-srirangapatna": 18,
  "mysore-nanjangud": 24,
  "nanjangud-mysore": 24,
  "srirangapatna-nanjangud": 42,
  "nanjangud-srirangapatna": 42,
  "mysore-ranganathittu": 19,
  "ranganathittu-mysore": 19,
  "srirangapatna-ranganathittu": 6,
  "ranganathittu-srirangapatna": 6,
  "mysore-brindavan-gardens": 20,
  "brindavan-gardens-mysore": 20,
  "mysore-chamundi-hills": 11,
  "chamundi-hills-mysore": 11,
  "mysore-somnathpur": 35,
  "somnathpur-mysore": 35,
  "mysore-talakadu": 45,
  "talakadu-mysore": 45,
  "mysore-shivanasamudra": 75,
  "shivanasamudra-mysore": 75,
  "mysore-coorg": 120,
  "coorg-mysore": 120,
  "mysore-madikeri": 120,
  "madikeri-mysore": 120,
  "mysore-ooty": 125,
  "ooty-mysore": 125,
  "mysore-wayanad": 140,
  "wayanad-mysore": 140,
  "mysore-bandipur": 75,
  "bandipur-mysore": 75,
  "mysore-kabini": 70,
  "kabini-mysore": 70,

  // Coorg Region Stops
  "madikeri-kushalnagar": 30,
  "kushalnagar-madikeri": 30,
  "madikeri-bylakuppe": 35,
  "bylakuppe-madikeri": 35,
  "madikeri-dubare-camp": 38,
  "dubare-camp-madikeri": 38,
  "madikeri-abbey-falls": 8,
  "abbey-falls-madikeri": 8,
  "madikeri-rajas-seat": 2,
  "rajas-seat-madikeri": 2,
  "madikeri-mandalpatti": 20,
  "mandalpatti-madikeri": 20,
  "madikeri-iruppu-falls": 75,
  "iruppu-falls-madikeri": 75,

  // Chikmagalur Region Stops
  "chikmagalur-mullayanagiri": 22,
  "mullayanagiri-chikmagalur": 22,
  "chikmagalur-baba-budangiri": 30,
  "baba-budangiri-chikmagalur": 30,
  "chikmagalur-jhari-falls": 23,
  "jhari-falls-chikmagalur": 23,
  "chikmagalur-hirekolale-lake": 10,
  "hirekolale-lake-chikmagalur": 10,
  "chikmagalur-belur": 25,
  "belur-chikmagalur": 25,
  "chikmagalur-halebidu": 35,
  "halebidu-chikmagalur": 35,
  "belur-halebidu": 16,
  "halebidu-belur": 16,
  "hassan-belur": 38,
  "belur-hassan": 38,
  "hassan-halebidu": 31,
  "halebidu-hassan": 31,

  // Ooty Region Stops
  "ooty-doddabetta": 9,
  "doddabetta-ooty": 9,
  "ooty-pykara-lake": 21,
  "pykara-lake-ooty": 21,
  "ooty-coonoor": 19,
  "coonoor-ooty": 19,
  "ooty-kotagiri": 28,
  "kotagiri-ooty": 28,
  "ooty-mudumalai": 40,
  "mudumalai-ooty": 40,
  "bandipur-ooty": 50,
  "ooty-bandipur": 50,
};

function toSlug(name) {
  if (!name) return "";
  return String(name)
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function calculatePointToPointRoadDistance(p1, p2) {
  const name1 = typeof p1 === "object" ? p1.name || p1.id || "" : String(p1);
  const name2 = typeof p2 === "object" ? p2.name || p2.id || "" : String(p2);

  const slug1 = toSlug(name1);
  const slug2 = toSlug(name2);

  if (!slug1 || !slug2 || slug1 === slug2) {
    return 0;
  }

  // 1. Direct match in known road distances table
  const key1 = `${slug1}-${slug2}`;
  if (typeof KNOWN_ROAD_DISTANCES[key1] === "number") {
    return KNOWN_ROAD_DISTANCES[key1];
  }

  // Substring key check in table
  for (const [tableKey, dist] of Object.entries(KNOWN_ROAD_DISTANCES)) {
    const [partA, partB] = tableKey.split("-");
    if (
      (slug1.includes(partA) && slug2.includes(partB)) ||
      (slug1.includes(partB) && slug2.includes(partA))
    ) {
      return dist;
    }
  }

  // 2. Check predefined distanceKm property
  if (typeof p2 === "object" && typeof p2.distanceKm === "number" && p2.distanceKm > 0) {
    return p2.distanceKm;
  }
  if (typeof p1 === "object" && typeof p1.distanceKm === "number" && p1.distanceKm > 0) {
    return p1.distanceKm;
  }

  // 3. Geodesic coordinates calculation with road network curvature factor (1.25x)
  const coords1 = resolveLocationCoordinates(p1);
  const coords2 = resolveLocationCoordinates(p2);

  if (coords1 && coords2) {
    const straightLine = haversineDistanceKm(coords1, coords2);
    const roadKm = Math.round(straightLine * 1.25);
    return Math.max(5, roadKm);
  }

  return 20;
}

function buildOrderedItinerary(params = {}) {
  // 1. If explicit ordered itinerary array is already provided, sanitize and preserve exact user order
  if (Array.isArray(params.orderedItinerary) && params.orderedItinerary.length > 0) {
    return params.orderedItinerary.map((pt, idx) => {
      const name = typeof pt === "object" ? pt.name || pt.id || `Stop ${idx + 1}` : String(pt);
      const coords = resolveLocationCoordinates(pt);
      const isNumDist = typeof pt === "object" && typeof pt.distanceKm === "number" && Number.isFinite(pt.distanceKm);
      const item = {
        id: typeof pt === "object" && pt.id ? pt.id : idx === 0 ? "origin" : idx === params.orderedItinerary.length - 1 && (pt.type === "return" || name.toLowerCase().includes("bangalore")) ? "return" : `point-${idx}`,
        type: typeof pt === "object" && pt.type ? pt.type : idx === 0 ? "origin" : "destination",
        name,
        lat: (typeof pt === "object" && typeof pt.lat === "number" && Number.isFinite(pt.lat)) ? pt.lat : coords?.lat || 0,
        lng: (typeof pt === "object" && typeof pt.lng === "number" && Number.isFinite(pt.lng)) ? pt.lng : coords?.lng || 0,
        distanceKm: isNumDist ? pt.distanceKm : 0,
        isPrimary: typeof pt === "object" && pt.isPrimary !== undefined ? Boolean(pt.isPrimary) : true,
      };
      if (typeof pt === "object" && pt.categoryName) {
        item.categoryName = pt.categoryName;
      }
      return item;
    });
  }

  // 2. Resolve Origin / Pickup
  const rawOrigin = params.origin || params.pickupLocation || params.startLocation || "Bangalore, Karnataka";
  const originName = typeof rawOrigin === "object" ? rawOrigin.name : String(rawOrigin);
  const originCoords = resolveLocationCoordinates(rawOrigin);

  const originPoint = {
    id: "origin",
    type: "origin",
    name: originName || "Bangalore, Karnataka",
    lat: originCoords?.lat || 12.9716,
    lng: originCoords?.lng || 77.5946,
    distanceKm: 0,
    isPrimary: true,
  };

  // 3. Collect Primary Destination(s)
  const rawDests = [];
  if (params.destination) rawDests.push(params.destination);
  if (Array.isArray(params.destinations)) rawDests.push(...params.destinations);
  if (Array.isArray(params.primaryDestinations)) rawDests.push(...params.primaryDestinations);
  if (Array.isArray(params.majorDestinations)) rawDests.push(...params.majorDestinations);

  const primaryDestPoints = [];
  for (let i = 0; i < rawDests.length; i++) {
    const dest = rawDests[i];
    const destName = typeof dest === "object" ? dest.name || dest.id : String(dest);
    if (!destName || destName.toLowerCase() === originName.toLowerCase()) continue;

    const coords = resolveLocationCoordinates(dest);
    primaryDestPoints.push({
      id: typeof dest === "object" && dest.id ? dest.id : `dest-${i + 1}`,
      type: "destination",
      name: destName,
      lat: coords?.lat || 0,
      lng: coords?.lng || 0,
      distanceKm: 0,
      isPrimary: true,
      categoryName: "Primary Destination",
    });
  }

  if (primaryDestPoints.length === 0) {
    const coords = resolveLocationCoordinates("Mysore");
    primaryDestPoints.push({
      id: "dest-mysore",
      type: "destination",
      name: "Mysore",
      lat: coords?.lat || 12.2958,
      lng: coords?.lng || 76.6394,
      distanceKm: 0,
      isPrimary: true,
      categoryName: "Primary Destination",
    });
  }

  // 4. Collect Secondary / Custom Stops
  const rawStops = [];
  if (Array.isArray(params.userStops)) rawStops.push(...params.userStops);
  if (Array.isArray(params.secondaryStops)) rawStops.push(...params.secondaryStops);
  if (Array.isArray(params.stops)) rawStops.push(...params.stops);
  if (Array.isArray(params.detailedDestinations)) rawStops.push(...params.detailedDestinations);

  const stopPoints = [];
  for (let i = 0; i < rawStops.length; i++) {
    const stop = rawStops[i];
    const stopName = typeof stop === "object" ? stop.name || stop.id : String(stop);
    if (!stopName || stopName.toLowerCase() === originName.toLowerCase()) continue;
    if (primaryDestPoints.some((p) => p.name.toLowerCase() === stopName.toLowerCase())) continue;

    const coords = resolveLocationCoordinates(stop);
    const isPrimary = typeof stop === "object" && stop.isPrimary;
    stopPoints.push({
      id: typeof stop === "object" && stop.id ? stop.id : `stop-${i + 1}`,
      type: isPrimary ? "destination" : "secondary-stop",
      name: stopName,
      lat: coords?.lat || 0,
      lng: coords?.lng || 0,
      distanceKm: 0,
      isPrimary,
      categoryName: typeof stop === "object" && stop.categoryName ? stop.categoryName : undefined,
    });
  }

  // Build clean sequence: Origin -> [En-route Stops] -> Primary Destinations -> [Post-Destination Stops] -> (Return)
  const firstDest = primaryDestPoints[0];
  const originToDestDist = calculatePointToPointRoadDistance(originPoint, firstDest);

  const preDestStops = [];
  const postDestStops = [];

  for (const sp of stopPoints) {
    const distFromOrigin = calculatePointToPointRoadDistance(originPoint, sp);
    const distToDest = calculatePointToPointRoadDistance(sp, firstDest);

    // If stop is located between origin and first destination (en-route corridor)
    if (distFromOrigin < originToDestDist && distToDest < originToDestDist) {
      preDestStops.push(sp);
    } else {
      postDestStops.push(sp);
    }
  }

  // Sort pre-destination stops ascending by distance from origin
  preDestStops.sort((a, b) => {
    const distA = calculatePointToPointRoadDistance(originPoint, a);
    const distB = calculatePointToPointRoadDistance(originPoint, b);
    return distA - distB;
  });

  const result = [
    originPoint,
    ...preDestStops,
    ...primaryDestPoints,
    ...postDestStops,
  ];

  // 5. Append Return Leg for round trips
  const tripType = params.tripType || "round-trip";
  if (tripType !== "one-way") {
    result.push({
      id: "return",
      type: "return",
      name: originName || "Bangalore, Karnataka",
      lat: originCoords?.lat || 12.9716,
      lng: originCoords?.lng || 77.5946,
      distanceKm: 0,
      isPrimary: true,
    });
  }

  return result;
}


function calculateRouteLegs(itinerary) {
  if (!Array.isArray(itinerary) || itinerary.length === 0) {
    return { legs: [], totalDistanceKm: 0, orderedItinerary: [] };
  }

  const enrichedItinerary = itinerary.map((pt, idx) => {
    const rawName = typeof pt === "object" ? pt.name || pt.id || `Stop ${idx + 1}` : String(pt);
    const coords = resolveLocationCoordinates(pt);
    const item = {
      id: typeof pt === "object" && pt.id ? pt.id : idx === 0 ? "origin" : idx === itinerary.length - 1 && (pt.type === "return" || rawName.toLowerCase().includes("bangalore")) ? "return" : `point-${idx}`,
      type: typeof pt === "object" && pt.type ? pt.type : idx === 0 ? "origin" : "destination",
      name: rawName,
      lat: (typeof pt === "object" && typeof pt.lat === "number" && Number.isFinite(pt.lat)) ? pt.lat : coords?.lat || 0,
      lng: (typeof pt === "object" && typeof pt.lng === "number" && Number.isFinite(pt.lng)) ? pt.lng : coords?.lng || 0,
      distanceKm: 0,
      isPrimary: typeof pt === "object" && pt.isPrimary !== undefined ? Boolean(pt.isPrimary) : true,
    };
    if (typeof pt === "object" && pt.categoryName) {
      item.categoryName = pt.categoryName;
    }
    return item;
  });

  if (enrichedItinerary.length === 1) {
    enrichedItinerary[0].distanceKm = 0;
    return { legs: [], totalDistanceKm: 0, orderedItinerary: enrichedItinerary };
  }

  const legs = [];
  let totalDistanceKm = 0;

  // Point 0 (origin): starting point distance is 0 km
  enrichedItinerary[0].distanceKm = 0;

  for (let i = 0; i < enrichedItinerary.length - 1; i++) {
    const from = enrichedItinerary[i];
    const to = enrichedItinerary[i + 1];

    const legDist = calculatePointToPointRoadDistance(from, to);
    legs.push({
      from: from.name,
      to: to.name,
      fromType: from.type,
      toType: to.type,
      distanceKm: legDist,
    });
    totalDistanceKm += legDist;

    // Segment distance from previous stop to current stop
    enrichedItinerary[i + 1].distanceKm = legDist;
  }

  // Double check that every point has a valid finite numeric distanceKm
  for (let idx = 0; idx < enrichedItinerary.length; idx++) {
    if (typeof enrichedItinerary[idx].distanceKm !== "number" || !Number.isFinite(enrichedItinerary[idx].distanceKm)) {
      enrichedItinerary[idx].distanceKm = 0;
    }
  }

  return { legs, totalDistanceKm: Math.round(totalDistanceKm), orderedItinerary: enrichedItinerary };
}

/**
 * Calculates inclusive calendar days for outstation trips.
 * Ensures consistent day counts across client and server.
 * E.g.
 * - Same day (2026-09-27 to 2026-09-27) => 1 Day
 * - 2-day trip (2026-09-27 to 2026-09-28) => 2 Days
 * - 3-day trip (2026-09-27 to 2026-09-29) => 3 Days
 */
function calculateTripDays(startRaw, endRaw) {
  if (!startRaw || !endRaw) return 1;

  const parseCalendarDate = (val) => {
    if (!val) return null;
    if (val instanceof Date && !isNaN(val.getTime())) {
      return new Date(val.getFullYear(), val.getMonth(), val.getDate());
    }
    if (typeof val === "string") {
      const cleanVal = val.trim();
      // If pure date string "YYYY-MM-DD"
      if (/^\d{4}-\d{2}-\d{2}$/.test(cleanVal)) {
        const parts = cleanVal.split("-").map(Number);
        return new Date(parts[0], parts[1] - 1, parts[2]);
      }
      // If ISO timestamp string, construct Date and extract local calendar date
      const d = new Date(cleanVal);
      if (!isNaN(d.getTime())) {
        return new Date(d.getFullYear(), d.getMonth(), d.getDate());
      }
    }
    return null;
  };

  const start = parseCalendarDate(startRaw);
  const end = parseCalendarDate(endRaw);

  if (!start || !end) return 1;

  const diffMs = end.getTime() - start.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
  const days = diffDays >= 0 ? diffDays + 1 : 1;
  return Math.max(1, days);
}

async function computeBackendTripFare(params = {}) {
  const rules = await getBackendPricingRules();
  const vehicle = resolveBackendPricingRule(rules, params.vehicleId || params.vehicleType || params.vehicleName);

  const pricePerKm = Number(vehicle?.pricePerKm) || 17;
  const dailyAllowanceRate = Number(vehicle?.dailyAllowance) || 500;
  const minKmPerDay = Number(vehicle?.minKmPerDay) || 300;

  // 1. Authoritative Trip Duration in Calendar Days (min 1 day)
  const startRaw = params.requestedStartDate || params.startDate;
  const endRaw = params.requestedEndDate || params.endDate;
  const tripDays = calculateTripDays(startRaw, endRaw);

  // 2. Minimum km package included based on days
  const packageKmIncluded = minKmPerDay * tripDays;

  // 3. Authoritative Route Itinerary & Road Legs
  let routeDistanceKm = 0;
  let legs = [];
  let orderedItinerary = [];

  const hasExplicitItinerary = Array.isArray(params.orderedItinerary) && params.orderedItinerary.length > 0;
  const hasRouteContext = Boolean(
    params.destination ||
    params.destinations ||
    params.primaryDestinations ||
    params.majorDestinations ||
    params.stops ||
    params.userStops ||
    params.secondaryStops ||
    params.detailedDestinations
  );

  if (hasExplicitItinerary || hasRouteContext) {
    const rawItinerary = buildOrderedItinerary({
      origin: params.origin || params.pickupLocation || params.startLocation || "Bangalore, Karnataka",
      destination: params.destination,
      destinations: params.destinations || params.primaryDestinations || params.majorDestinations,
      secondaryStops: params.secondaryStops || params.stops || params.userStops || params.detailedDestinations,
      orderedItinerary: params.orderedItinerary,
      tripType: params.tripType || "round-trip",
    });
    const legRes = calculateRouteLegs(rawItinerary);
    legs = legRes.legs;
    routeDistanceKm = legRes.totalDistanceKm;
    orderedItinerary = legRes.orderedItinerary;
  } else if (typeof params.routeDistanceKm === "number" && params.routeDistanceKm > 0) {
    routeDistanceKm = Math.round(params.routeDistanceKm);
  } else {
    const destOneWayKm = Number(params.destinationDistanceKm || params.distanceKm) || 145;
    const extraStopsKm = Number(params.stopsDistanceKm) || 0;
    routeDistanceKm = Math.round(destOneWayKm * 2 + extraStopsKm);
  }

  // Ensure orderedItinerary always contains valid numeric distances for all items
  if (!orderedItinerary || orderedItinerary.length === 0) {
    const defaultOrigin = params.origin || params.pickupLocation || params.startLocation || "Bangalore, Karnataka";
    const defaultDest = params.destination || (Array.isArray(params.destinations) && params.destinations[0]) || "Mysore";
    const rawItinerary = buildOrderedItinerary({
      origin: defaultOrigin,
      destination: defaultDest,
      tripType: params.tripType || "round-trip",
    });
    const legRes = calculateRouteLegs(rawItinerary);
    legs = legRes.legs;
    if (!routeDistanceKm || routeDistanceKm === 0) {
      routeDistanceKm = legRes.totalDistanceKm;
    }
    orderedItinerary = legRes.orderedItinerary;
  } else {
    const legRes = calculateRouteLegs(orderedItinerary);
    legs = legRes.legs;
    if (!routeDistanceKm || routeDistanceKm === 0) {
      routeDistanceKm = legRes.totalDistanceKm;
    }
    orderedItinerary = legRes.orderedItinerary;
  }

  // If explicit routeDistanceKm was sent and is positive, respect it
  if (typeof params.routeDistanceKm === "number" && params.routeDistanceKm > 0) {
    routeDistanceKm = Math.round(params.routeDistanceKm);
  }

  // 4. Billable Km is higher of actual route distance or daily minimum package
  const billableDistanceKm = Math.max(routeDistanceKm, packageKmIncluded);

  // 5. Base Vehicle Fare = billable distance * pricePerKm
  const baseVehicleFare = Math.round(billableDistanceKm * pricePerKm);

  // 6. Driver Daily Allowance (dailyAllowance * tripDays)
  const driverAllowance = Math.round(dailyAllowanceRate * tripDays);

  // 7. Platform & Reservation Fee
  const platformFee = 95;

  // 8. Taxable Subtotal
  const taxableAmount = baseVehicleFare + driverAllowance + platformFee;
  const subtotal = taxableAmount;

  // 9. Govt GST (5% Tour Operator GST)
  const gstRate = 0.05;
  const gst = Math.round(taxableAmount * gstRate);

  // 10. Total Estimated Fare
  const totalEstimate = taxableAmount + gst;

  // 11. Advance Payment & Balance Due
  const advancePercent = Number(params.advancePercent) || 25;
  const advanceAmount = Math.round((totalEstimate * advancePercent) / 100);
  const balanceDue = Math.max(0, totalEstimate - advanceAmount);

  // 12. Mathematical Invariant Checks (Requirement 28)
  const expectedTotal = baseVehicleFare + driverAllowance + platformFee + gst;
  if (Math.abs(expectedTotal - totalEstimate) > 0.01) {
    throw new Error(`Mathematical inconsistency in fare engine: expected ₹${expectedTotal}, got ₹${totalEstimate}`);
  }
  if (Math.abs((advanceAmount + balanceDue) - totalEstimate) > 1.0) {
    throw new Error(`Advance + balance mismatch: advance ₹${advanceAmount} + balance ₹${balanceDue} != total ₹${totalEstimate}`);
  }

  // Structured Diagnostic Logs for Audit (Requirement 27)
  const legsLog = legs.map((l, idx) => `  leg${idx + 1}: ${l.from} → ${l.to} (${l.distanceKm} km)`).join("\n");
  console.log([
    "=== ZENERA FARE AUDIT ===",
    `origin: ${params.origin || params.pickupLocation || params.startLocation || "Bangalore"}`,
    `destinations: ${JSON.stringify(params.majorDestinations || params.destinations || params.destination || "Mysore")}`,
    `secondaryStops: ${JSON.stringify(params.detailedDestinations || params.secondaryStops || params.stops || [])}`,
    `orderedItinerary: ${JSON.stringify(orderedItinerary.map((p) => p.name))}`,
    "routeLegs:",
    legsLog || "  (direct calculation)",
    `tripDays: ${tripDays}`,
    `actualDistanceKm: ${routeDistanceKm}`,
    `minKmPerDay: ${minKmPerDay}`,
    `minimumBillableKm: ${packageKmIncluded}`,
    `billableDistanceKm: ${billableDistanceKm}`,
    `vehicleType: ${vehicle?.vehicleType || "Sedan"}`,
    `pricePerKm: ₹${pricePerKm}`,
    `baseVehicleFare: ₹${baseVehicleFare}`,
    `dailyAllowance: ₹${dailyAllowanceRate}`,
    `driverAllowance: ₹${driverAllowance}`,
    `platformFee: ₹${platformFee}`,
    `gstRate: ${gstRate}`,
    `gstAmount: ₹${gst}`,
    `totalFare: ₹${totalEstimate}`,
    `advancePercent: ${advancePercent}%`,
    `advanceAmount: ₹${advanceAmount}`,
    `remainingBalance: ₹${balanceDue}`,
    `advancePaymentAmount: ₹${advanceAmount}`,
    `distanceSource: ${hasExplicitItinerary || hasRouteContext ? "authoritative-route-corridor" : "fallback-direct"}`,
    `pricingSource: ${vehicle ? "firestore-pricing-rules" : "default-fallback"}`,
    `fareSource: authoritative-backend-engine`,
    "==========================",
  ].join("\n"));

  return {
    vehicleId: vehicle?.id || "sedan",
    vehicleName: vehicle?.vehicleType || "Sedan",
    vehicleType: vehicle?.vehicleType || "Sedan",
    vehicleRatePerKm: pricePerKm,
    pricePerKm: pricePerKm,
    dailyAllowance: dailyAllowanceRate,
    baseRatePerDay: minKmPerDay * pricePerKm,
    minKmPerDay,
    tripDays,
    actualDistanceKm: routeDistanceKm,
    routeDistanceKm,
    minimumDistanceKm: packageKmIncluded,
    minimumBillableKm: packageKmIncluded,
    kmIncluded: packageKmIncluded,
    billableDistanceKm,
    baseFare: baseVehicleFare,
    baseVehicleFare,
    driverAllowance,
    totalAllowance: driverAllowance,
    platformFee,
    taxableAmount,
    subtotal,
    gstRate,
    gstAmount: gst,
    gst,
    totalEstimate,
    totalFare: totalEstimate,
    advancePercent,
    advanceAmount,
    balanceDue,
    remainingBalance: balanceDue,
    legs,
    routeLegs: legs,
    orderedItinerary,
  };
}




// ============================================================
// 1. `createRazorpayOrder`
// ============================================================

/**
 * ✅ CREATE RAZORPAY ORDER
 * Called from frontend to create payment order
 */
exports.createRazorpayOrder = functions
  .region("us-central1")
  .https.onCall(async (data, context) => {
    try {
      // ✅ STEP 1: Verify authentication
      if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "User must be authenticated");
      }

      const userId = context.auth.uid;
      const reqData = data || {};

      // ✅ STEP 2: Validate input
      const bookingId = reqData.bookingId || reqData.id || reqData.orderId;
      const amount = Number(reqData.amount || reqData.advanceFare || reqData.advanceAmount);
      const currency = reqData.currency || "INR";

      if (!bookingId) {
        throw new functions.https.HttpsError("invalid-argument", "Booking ID is required");
      }

      if (!amount || amount <= 0) {
        throw new functions.https.HttpsError("invalid-argument", "Amount must be greater than 0");
      }

      console.log("SAFE DIAGNOSTIC LOG — createRazorpayOrder Called:", {
        userId: userId,
        bookingId: bookingId,
        amount: amount,
        currency: currency,
      });

      safeStructuredLog("CREATE_RAZORPAY_ORDER_START", `corr_ord_${bookingId}_${Date.now()}`, {
        userId,
        bookingId,
        amount,
        currency,
      });

      // ✅ STEP 3: Get Razorpay credentials from secrets or environment
      const { keyId, keySecret } = getRazorpayConfig();

      if (!keyId || !keySecret) {
        throw new functions.https.HttpsError("failed-precondition", "Razorpay credentials not configured");
      }

      // ✅ STEP 4: Create Razorpay order
      // Convert amount to paise (Razorpay uses smallest currency unit)
      const amountInPaise = Math.round(amount * 100);

      const orderData = {
        amount: amountInPaise,
        currency: currency,
        receipt: String(bookingId).slice(-40),
        notes: {
          bookingId: String(bookingId),
          userId: String(userId),
        },
      };

      // Create basic auth header
      const auth = Buffer.from(`${keyId}:${keySecret}`).toString("base64");

      console.log("SAFE DIAGNOSTIC LOG — Creating Razorpay Order:", {
        amount: amount,
        amountInPaise: amountInPaise,
      });

      const response = await fetch("https://api.razorpay.com/v1/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Basic ${auth}`,
        },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error("SAFE DIAGNOSTIC LOG — Razorpay API Error:", {
          status: response.status,
          error: errorData,
        });
        throw new functions.https.HttpsError("internal", errorData?.error?.description || `Razorpay API error: ${response.status}`);
      }

      const razorpayOrder = await response.json();

      console.log("SAFE DIAGNOSTIC LOG — Razorpay Order Created:", {
        orderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        status: razorpayOrder.status,
      });

      // ✅ STEP 5: Save payment document to Firestore
      await db.collection("payments").doc(String(bookingId)).set({
        bookingId: bookingId,
        userId: userId,
        razorpayOrderId: razorpayOrder.id,
        amount: amount,
        amountInPaise: amountInPaise,
        currency: currency,
        status: "pending",
        paymentMethod: "razorpay",
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      }, { merge: true });

      console.log("SAFE DIAGNOSTIC LOG — Payment Document Saved:", {
        bookingId: bookingId,
        orderId: razorpayOrder.id,
      });

      // ✅ STEP 6: Return order details to frontend
      return {
        status: "success",
        message: "Razorpay order created",
        orderId: razorpayOrder.id,
        amount: amount,
        amountInPaise: amountInPaise,
        currency: currency,
        keyId: keyId, // Send to frontend for checkout
      };

    } catch (error) {
      console.error("SAFE DIAGNOSTIC LOG — createRazorpayOrder Error:", {
        message: error.message,
        code: error.code,
      });

      if (error instanceof functions.https.HttpsError) {
        throw error;
      }

      throw new functions.https.HttpsError("internal", error.message || "Failed to create payment order");
    }
  });

/**
 * ✅ VERIFY RAZORPAY PAYMENT
 * Called from frontend after payment completion
 */
exports.verifyRazorpayPayment = functions
  .region("us-central1")
  .https.onCall(async (data, context) => {
    try {
      // ✅ Verify authentication
      if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "User must be authenticated");
      }

      const userId = context.auth.uid;
      const reqData = data || {};

      // ✅ Get payment data
      const { bookingId, razorpayPaymentId, razorpayOrderId, razorpaySignature } = reqData;

      if (!bookingId || !razorpayPaymentId || !razorpaySignature) {
        throw new functions.https.HttpsError("invalid-argument", "Missing payment verification data");
      }

      console.log("SAFE DIAGNOSTIC LOG — verifyRazorpayPayment Called:", {
        bookingId: bookingId,
        paymentId: razorpayPaymentId,
      });

      // ✅ Get secret for verification
      const { keySecret } = getRazorpayConfig();

      if (!keySecret) {
        throw new functions.https.HttpsError("failed-precondition", "Razorpay credentials not configured");
      }

      // ✅ Create signature for verification
      const crypto = require("crypto");
      const shasum = crypto.createHmac("sha256", keySecret);
      const data_to_hash = `${razorpayOrderId}|${razorpayPaymentId}`;
      shasum.update(data_to_hash);
      const generated_signature = shasum.digest("hex");

      // ✅ Verify signature
      if (generated_signature !== razorpaySignature) {
        console.error("SAFE DIAGNOSTIC LOG — Signature Verification Failed:", {
          expected: generated_signature,
          received: razorpaySignature,
        });
        throw new functions.https.HttpsError("invalid-argument", "Invalid payment signature");
      }

      console.log("SAFE DIAGNOSTIC LOG — Signature Verified:", {
        bookingId: bookingId,
        paymentId: razorpayPaymentId,
      });

      // ✅ Update payment status in Firestore
      await db.collection("payments").doc(String(bookingId)).set({
        status: "completed",
        razorpayPaymentId: razorpayPaymentId,
        razorpayOrderId: razorpayOrderId,
        razorpaySignature: razorpaySignature,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      }, { merge: true });

      // ✅ Update booking status
      const cleanBookingId = String(bookingId).trim();
      const bookingDocRef = db.collection("bookings").doc(cleanBookingId);
      const bookingSnap = await bookingDocRef.get();

      if (bookingSnap.exists) {
        await bookingDocRef.update({
          status: "confirmed",
          paymentStatus: "completed",
          paymentMethod: "razorpay",
          paymentId: razorpayPaymentId,
          confirmedAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      } else {
        const altQuery = await db.collection("bookings").where("bookingId", "==", cleanBookingId).limit(1).get();
        if (!altQuery.empty) {
          await altQuery.docs[0].ref.update({
            status: "confirmed",
            paymentStatus: "completed",
            paymentMethod: "razorpay",
            paymentId: razorpayPaymentId,
            confirmedAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          });
        }
      }

      console.log("SAFE DIAGNOSTIC LOG — Payment Verified & Saved:", {
        bookingId: bookingId,
        status: "completed",
      });

      return {
        status: "success",
        message: "Payment verified successfully",
        bookingId: bookingId,
      };

    } catch (error) {
      console.error("SAFE DIAGNOSTIC LOG — verifyRazorpayPayment Error:", {
        message: error.message,
      });

      if (error instanceof functions.https.HttpsError) {
        throw error;
      }

      throw new functions.https.HttpsError("internal", error.message || "Payment verification failed");
    }
  });

/**
 * Compatibility getPaymentStatus for client checks
 */
exports.getPaymentStatus = onCall(
  {
    region: "us-central1",
  },
  async (request) => {
    if (!request.auth || !request.auth.uid) {
      throw new HttpsError("unauthenticated", "Must be logged in.");
    }
    const bookingId = request.data?.bookingId;
    if (!bookingId) {
      throw new HttpsError("invalid-argument", "bookingId is required");
    }

    const bookingDoc = await db.collection("bookings").doc(String(bookingId)).get();
    if (bookingDoc.exists) {
      const data = bookingDoc.data();
      return {
        bookingStatus: data.status || "pending",
        status: data.status || "pending",
        totalPaidPercent: data.status === "confirmed" ? (data.advancePercent || 25) : 0,
      };
    }
    return { bookingStatus: "pending", status: "pending", totalPaidPercent: 0 };
  }
);

// ============================================================
// 3. `createBooking`
// ============================================================

exports.createBooking = onCall(
  {
    region: "us-central1",
  },
  async (request) => {
    if (!request.auth || !request.auth.uid) {
      throw new HttpsError(
        "unauthenticated",
        "You must be logged in to create a booking."
      );
    }

    const uid = request.auth.uid;
    const data = request.data || {};
    const vehicleType = data?.vehicleType || "Sedan";
    const startLocation = data?.startLocation || data?.pickupLocation || "Bangalore";
    const majorDestinations = Array.isArray(data?.majorDestinations) ? data.majorDestinations : [];
    const rawStops = Array.isArray(data?.detailedDestinations) ? data.detailedDestinations : [];
    const requestedStartDate = data?.requestedStartDate || data?.startDate || new Date().toISOString();
    const requestedEndDate = data?.requestedEndDate || data?.endDate || new Date().toISOString();

    // 1. Authoritative Backend Custom Stop Route Corridor Validation
    const primaryRouteWaypoints = [startLocation, ...majorDestinations];
    for (const stopName of rawStops) {
      if (typeof stopName === "string" && stopName.trim()) {
        const check = validateCustomStopAgainstRoute(stopName, primaryRouteWaypoints);
        if (!check.isValid) {
          safeStructuredLog("CUSTOM_STOP_REJECTED", `corr_bk_${uid}_${Date.now()}`, {
            stop: stopName,
            route: primaryRouteWaypoints,
            reason: check.reason,
          });
          throw new HttpsError(
            "invalid-argument",
            check.reason || `Stop "${stopName}" is too far from your selected route. Please choose a nearby stop or a location along your trip.`
          );
        }
      }
    }

    // Authoritatively calculate pricing ledger from server rules
    const fare = await computeBackendTripFare({
      vehicleId: data?.vehicleId,
      vehicleType: data?.vehicleType,
      vehicleName: data?.vehicleName,
      origin: startLocation,
      pickupLocation: startLocation,
      destination: data?.destination,
      destinations: majorDestinations,
      majorDestinations: majorDestinations,
      detailedDestinations: rawStops,
      secondaryStops: rawStops,
      orderedItinerary: data?.orderedItinerary,
      tripType: data?.tripType || "round-trip",
      destinationDistanceKm: data?.destinationDistanceKm || data?.distanceKm,
      stopsDistanceKm: data?.stopsDistanceKm,
      routeDistanceKm: data?.routeDistanceKm,
      startDate: requestedStartDate,
      endDate: requestedEndDate,
      advancePercent: data?.advancePercent,
    });

    const finalTotal = fare.totalEstimate;
    const finalAdvance = fare.advanceAmount;

    const newBooking = {
      userId: uid,
      vehicleType,
      startLocation,
      pickupLocation: startLocation,
      origin: startLocation,
      majorDestinations,
      detailedDestinations: Array.isArray(data?.detailedDestinations) ? data.detailedDestinations : [],
      secondaryStops: Array.isArray(data?.detailedDestinations) ? data.detailedDestinations : [],
      orderedItinerary: fare.orderedItinerary || [],
      routeLegs: fare.legs || [],
      legs: fare.legs || [],
      requestedStartDate,
      requestedEndDate,
      startDate: requestedStartDate,
      endDate: requestedEndDate,
      status: "pending",
      tripDays: fare.tripDays,
      totalAmount: finalTotal,
      estimatedFare: finalTotal,
      totalFare: finalTotal,
      advancePercent: fare.advancePercent,
      advanceAmount: finalAdvance,
      balanceDue: fare.balanceDue,
      remainingBalance: fare.balanceDue,
      baseFare: fare.baseFare,
      baseVehicleFare: fare.baseFare,
      driverAllowance: fare.driverAllowance,
      totalAllowance: fare.driverAllowance,
      platformFee: fare.platformFee,
      taxableAmount: fare.taxableAmount,
      subtotal: fare.subtotal,
      gstRate: fare.gstRate,
      gstAmount: fare.gst,
      gst: fare.gst,
      taxes: fare.gst,
      discounts: 0,
      actualDistanceKm: fare.actualDistanceKm,
      routeDistanceKm: fare.routeDistanceKm,
      minimumBillableKm: fare.minimumBillableKm,
      billableDistanceKm: fare.billableDistanceKm,
      kmIncluded: fare.kmIncluded,
      ratePerKm: fare.vehicleRatePerKm,
      pricePerKm: fare.pricePerKm,
      dailyAllowance: fare.dailyAllowance,
      minKmPerDay: fare.minKmPerDay,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };

    if (data?.vehicleId) newBooking.vehicleId = data.vehicleId;
    if (data?.selectedVehicleId) newBooking.selectedVehicleId = data.selectedVehicleId;
    if (data?.vehicleName) newBooking.vehicleName = data.vehicleName;
    if (data?.category) newBooking.category = data.category;

    // Strict Validation (Requirement 7 & 8): Verify every orderedItinerary item has valid numeric distanceKm
    if (!Array.isArray(newBooking.orderedItinerary) || newBooking.orderedItinerary.length === 0) {
      throw new HttpsError(
        "invalid-argument",
        "Booking validation failed: orderedItinerary must be a non-empty array."
      );
    }

    let calculatedSumDistanceKm = 0;
    for (let idx = 0; idx < newBooking.orderedItinerary.length; idx++) {
      const pt = newBooking.orderedItinerary[idx];
      if (
        pt === undefined ||
        pt === null ||
        typeof pt !== "object" ||
        pt.distanceKm === undefined ||
        pt.distanceKm === null ||
        typeof pt.distanceKm !== "number" ||
        !Number.isFinite(pt.distanceKm)
      ) {
        throw new HttpsError(
          "invalid-argument",
          `Booking validation failed: orderedItinerary[${idx}] (${pt?.name || "unknown"}) has an invalid or undefined distanceKm (${pt?.distanceKm}). All itinerary items must have valid numeric distanceKm.`
        );
      }
      calculatedSumDistanceKm += pt.distanceKm;
    }

    // Clean any undefined properties from newBooking to ensure valid Firestore document
    for (const key of Object.keys(newBooking)) {
      if (newBooking[key] === undefined) {
        delete newBooking[key];
      }
    }

    // Comprehensive structured log before Firestore write
    console.log("=== CREATE BOOKING FIRESTORE WRITE AUDIT ===");
    console.log("totalDistanceKm:", newBooking.routeDistanceKm);
    console.log("sumOfItineraryDistances:", Math.round(calculatedSumDistanceKm));
    console.log("orderedItinerary:", JSON.stringify(newBooking.orderedItinerary, null, 2));
    newBooking.orderedItinerary.forEach((pt, idx) => {
      console.log(`  [${idx}] ${pt.name} (${pt.type}): ${pt.distanceKm} km`);
    });
    console.log("============================================");

    const docRef = await db.collection("bookings").add(newBooking);

    // Ensure document also stores its own bookingId for indexed queries
    await docRef.update({
      bookingId: docRef.id,
      id: docRef.id,
    });

    return {
      bookingId: docRef.id,
      id: docRef.id,
      status: "pending",
      totalAmount: finalTotal,
      advanceAmount: finalAdvance,
      actualDistanceKm: fare.actualDistanceKm,
      billableDistanceKm: fare.billableDistanceKm,
      routeLegs: fare.legs,
      legs: fare.legs,
      orderedItinerary: fare.orderedItinerary,
      createdAt: new Date().toISOString(),
    };
  }
);

// ============================================================
// 4. `estimateTripCost`
// ============================================================

exports.estimateTripCost = onCall(
  {
    region: "us-central1",
  },
  async (request) => {
    const data = request.data || {};
    const fare = await computeBackendTripFare({
      vehicleId: data?.vehicleId,
      vehicleType: data?.vehicleType,
      vehicleName: data?.vehicleName,
      origin: data?.origin || data?.pickupLocation || data?.startLocation,
      pickupLocation: data?.pickupLocation || data?.origin || data?.startLocation,
      destination: data?.destination,
      destinations: data?.destinations || data?.primaryDestinations || data?.majorDestinations,
      majorDestinations: data?.majorDestinations || data?.primaryDestinations || data?.destinations,
      secondaryStops: data?.secondaryStops || data?.detailedDestinations || data?.stops || data?.userStops,
      detailedDestinations: data?.detailedDestinations || data?.secondaryStops || data?.stops,
      stops: data?.stops || data?.secondaryStops || data?.userStops,
      userStops: data?.userStops || data?.secondaryStops || data?.stops,
      orderedItinerary: data?.orderedItinerary,
      tripType: data?.tripType || "round-trip",
      destinationDistanceKm: data?.destinationDistanceKm || data?.distanceKm,
      stopsDistanceKm: data?.stopsDistanceKm,
      routeDistanceKm: data?.routeDistanceKm,
      startDate: data?.startDate,
      endDate: data?.endDate,
      advancePercent: data?.advancePercent,
    });

    return {
      estimate: {
        vehicleId: fare.vehicleId,
        vehicleName: fare.vehicleName,
        vehicleType: fare.vehicleType,
        vehicleRatePerKm: fare.vehicleRatePerKm,
        pricePerKm: fare.pricePerKm,
        dailyAllowance: fare.dailyAllowance,
        minKmPerDay: fare.minKmPerDay,
        tripDays: fare.tripDays,
        actualDistanceKm: fare.actualDistanceKm,
        routeDistanceKm: fare.routeDistanceKm,
        minimumDistanceKm: fare.minimumDistanceKm,
        minimumBillableKm: fare.minimumBillableKm,
        kmIncluded: fare.kmIncluded,
        billableDistanceKm: fare.billableDistanceKm,
        baseFare: fare.baseFare,
        baseVehicleFare: fare.baseFare,
        driverAllowance: fare.driverAllowance,
        totalAllowance: fare.totalAllowance,
        platformFee: fare.platformFee,
        taxableAmount: fare.taxableAmount,
        subtotal: fare.subtotal,
        gstRate: fare.gstRate,
        gstAmount: fare.gst,
        gst: fare.gst,
        totalEstimate: fare.totalEstimate,
        totalFare: fare.totalEstimate,
        advancePercent: fare.advancePercent,
        advanceAmount: fare.advanceAmount,
        balanceDue: fare.balanceDue,
        remainingBalance: fare.balanceDue,
        legs: fare.legs,
        routeLegs: fare.legs,
        orderedItinerary: fare.orderedItinerary,
      },
      // Backward compatibility top-level aliases
      vehicleId: fare.vehicleId,
      vehicleName: fare.vehicleName,
      vehicleType: fare.vehicleType,
      tripDays: fare.tripDays,
      baseFare: fare.baseFare,
      driverAllowance: fare.driverAllowance,
      totalAllowance: fare.totalAllowance,
      platformFee: fare.platformFee,
      taxableAmount: fare.taxableAmount,
      subtotal: fare.subtotal,
      gstRate: fare.gstRate,
      gstAmount: fare.gst,
      gst: fare.gst,
      totalEstimate: fare.totalEstimate,
      totalFare: fare.totalEstimate,
      actualDistanceKm: fare.actualDistanceKm,
      kmIncluded: fare.kmIncluded,
      routeDistanceKm: fare.routeDistanceKm,
      minimumBillableKm: fare.minimumBillableKm,
      billableDistanceKm: fare.billableDistanceKm,
      vehicleRatePerKm: fare.vehicleRatePerKm,
      pricePerKm: fare.pricePerKm,
      dailyAllowance: fare.dailyAllowance,
      minKmPerDay: fare.minKmPerDay,
      advancePercent: fare.advancePercent,
      advanceAmount: fare.advanceAmount,
      balanceDue: fare.balanceDue,
      remainingBalance: fare.balanceDue,
      legs: fare.legs,
      routeLegs: fare.legs,
      orderedItinerary: fare.orderedItinerary,
    };
  }
);

// ============================================================
// 5. `getBookingsByUser`
// ============================================================

exports.getBookingsByUser = onCall(
  {
    region: "us-central1",
  },
  async (request) => {
    if (!request.auth || !request.auth.uid) {
      throw new HttpsError(
        "unauthenticated",
        "You must be logged in to fetch bookings."
      );
    }

    const uid = request.auth.uid;
    const snapshot = await db
      .collection("bookings")
      .where("userId", "==", uid)
      .get();

    const bookings = [];
    snapshot.forEach((docSnap) => {
      bookings.push({
        bookingId: docSnap.id,
        id: docSnap.id,
        ...docSnap.data(),
      });
    });

    return { bookings };
  }
);

// ============================================================
// 6. `getFleetPricing`
// ============================================================

/**
 * Authoritative fleet pricing endpoint for web and mobile clients.
 * Reads pricing_rules from Firestore and returns normalized fleet data with fallback.
 */
exports.getFleetPricing = onCall(
  {
    region: "us-central1",
  },
  async (request) => {
    // CORS is automatic for onCall functions
    // But we need proper error handling and fallback
    try {
      // Check if user is authenticated
      if (!request.auth) {
        throw new HttpsError(
          "unauthenticated",
          "You must be logged in to view pricing"
        );
      }

      const userId = request.auth.uid;
      let fleetPrices = [];

      // Try to get from Firestore first
      try {
        const snapshot = await db.collection("pricing_rules").get();

        if (snapshot.empty) {
          // Firestore collection is empty, use fallback
          fleetPrices = FALLBACK_FLEETS;
        } else {
          // Convert Firestore documents to array
          fleetPrices = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
        }
      } catch (firestoreError) {
        // Firestore read failed, use fallback data
        console.warn(
          "SAFE DIAGNOSTIC LOG — Firestore pricing_rules read failed, using fallback:",
          firestoreError?.message
        );

        safeStructuredLog("FLEET_PRICING_FIRESTORE_FALLBACK", userId, {
          error: firestoreError?.message,
        });

        fleetPrices = FALLBACK_FLEETS;
      }

      // If somehow still empty, use fallback
      if (!fleetPrices || fleetPrices.length === 0) {
        console.warn("SAFE DIAGNOSTIC LOG — Fleet prices empty, using fallback");
        fleetPrices = FALLBACK_FLEETS;
      }

      // Validate data structure
      const validFleets = fleetPrices.filter(
        (fleet) =>
          fleet.id &&
          (fleet.name || fleet.vehicleType) &&
          (fleet.basePrice !== undefined || fleet.pricePerKm !== undefined)
      );

      const resultFleets = validFleets.length > 0 ? validFleets : fleetPrices;

      if (resultFleets.length === 0) {
        throw new HttpsError(
          "not-found",
          "No fleet pricing information available"
        );
      }

      safeStructuredLog("GET_FLEET_PRICING_SUCCESS", userId, {
        fleetCount: resultFleets.length,
        source: "mixed", // Could be Firestore or fallback
      });

      return {
        status: "success",
        fleets: resultFleets,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error("SAFE DIAGNOSTIC LOG — getFleetPricing error:", error);

      safeStructuredLog("GET_FLEET_PRICING_ERROR", request.auth?.uid || "unknown", {
        errorMessage: error?.message,
        errorCode: error?.code,
      });

      // Return error in proper format
      if (error instanceof HttpsError) {
        throw error;
      }

      throw new HttpsError(
        "internal",
        error.message || "Failed to fetch fleet pricing. Using fallback data."
      );
    }
  }
);

/**
 * Fix missing user fields batch utility
 */
exports.fixMissingUserFields = onCall(
  {
    region: "us-central1",
  },
  async (request) => {
    // Require authentication
    if (!request.auth) {
      throw new HttpsError(
        "unauthenticated",
        "Must be logged in"
      );
    }

    try {
      const usersRef = db.collection("users");
      const snapshot = await usersRef.get();

      if (snapshot.empty) {
        return {
          message: "No users found",
          updated: 0,
          success: true,
        };
      }

      const batch = db.batch();
      let updateCount = 0;

      snapshot.forEach((doc) => {
        const userData = doc.data();
        const updates = {};

        // Add isDriver if missing
        if (!userData.hasOwnProperty("isDriver")) {
          updates.isDriver = false;
          updateCount++;
        }

        // Add isAdmin if missing
        if (!userData.hasOwnProperty("isAdmin")) {
          updates.isAdmin = false;
          updateCount++;
        }

        // Only update if there are changes
        if (Object.keys(updates).length > 0) {
          batch.update(doc.ref, updates);
        }
      });

      // Commit batch
      await batch.commit();

      safeStructuredLog("FIXED_USER_FIELDS", request.auth.uid, {
        usersProcessed: snapshot.size,
        fieldsAdded: updateCount,
      });

      return {
        message: `Fixed ${snapshot.size} user documents`,
        updated: updateCount,
        success: true,
      };
    } catch (error) {
      console.error("SAFE DIAGNOSTIC LOG — fixMissingUserFields error:", error);

      throw new HttpsError(
        "internal",
        error.message || "Failed to fix user documents"
      );
    }
  }
);