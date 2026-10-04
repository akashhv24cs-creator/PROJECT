/**
 * ZENERA TRIPS — Route-Aware Custom Stop & Geodesic Validation Verification Suite
 * 
 * Verifies that custom stops are strictly bounded by geographical route corridors
 * and destination radii across various multi-destination routes in India.
 */

import assert from "assert";
import fs from "fs";

// Load backend coordinates & validation engine directly from functions/index.js
const {
  CANONICAL_COORDINATES,
  haversineDistanceKm,
  pointToSegmentDistanceKm,
  validateCustomStopAgainstRoute,
} = (() => {
  const code = fs.readFileSync("functions/index.js", "utf-8");
  
  // Extract functions using Function constructor sandbox
  const match = code.match(/\/\/ =+[\s\S]*?CANONICAL_COORDINATES\s*=\s*\{([\s\S]*?)\};\s*const MAX_CUSTOM_STOP_ROUTE_DEVIATION_KM[\s\S]*?function validateCustomStopAgainstRoute[\s\S]*?\n\}/);
  
  if (!match) {
    throw new Error("Failed to extract validation engine from functions/index.js");
  }

  const moduleExports = {};
  const fn = new Function("exports", match[0] + "\nexports.CANONICAL_COORDINATES = CANONICAL_COORDINATES;\nexports.haversineDistanceKm = haversineDistanceKm;\nexports.pointToSegmentDistanceKm = pointToSegmentDistanceKm;\nexports.validateCustomStopAgainstRoute = validateCustomStopAgainstRoute;");
  fn(moduleExports);
  return moduleExports;
})();

console.log("============================================================");
console.log("ZENERA TRIPS — ROUTE-AWARE STOP VALIDATION TEST SUITE");
console.log("============================================================\n");

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`✅ [PASS] ${name}`);
    passed++;
  } catch (err) {
    console.error(`❌ [FAIL] ${name}`);
    console.error(`   Error: ${err.message}`);
    failed++;
  }
}

// -----------------------------------------------------------------------------
// 1. Geodesic Distance Math Parity
// -----------------------------------------------------------------------------
test("Haversine Distance: Bangalore to Mysore should be ~125-145 km", () => {
  const blr = CANONICAL_COORDINATES["bangalore"];
  const mys = CANONICAL_COORDINATES["mysore"];
  const dist = haversineDistanceKm(blr, mys);
  assert(dist >= 120 && dist <= 145, `Expected 120-145 km, got ${dist} km`);
});

test("Haversine Distance: Bangalore to Chikmagalur should be ~200-245 km", () => {
  const blr = CANONICAL_COORDINATES["bangalore"];
  const ckm = CANONICAL_COORDINATES["chikmagalur"];
  const dist = haversineDistanceKm(blr, ckm);
  assert(dist >= 200 && dist <= 245, `Expected 200-245 km, got ${dist} km`);
});

test("Point-to-Segment Corridor: Hassan along Bangalore -> Chikmagalur route", () => {
  const blr = CANONICAL_COORDINATES["bangalore"];
  const ckm = CANONICAL_COORDINATES["chikmagalur"];
  const hsn = CANONICAL_COORDINATES["hassan"];
  const segDist = pointToSegmentDistanceKm(hsn, blr, ckm);
  assert(segDist <= 30, `Expected <= 30 km perpendicular corridor distance, got ${segDist} km`);
});

// -----------------------------------------------------------------------------
// 2. Bangalore -> Chikmagalur Route Validation (Core User Requirement)
// -----------------------------------------------------------------------------
const blrToCkmRoute = ["Bangalore", "Chikmagalur"];

test("Bangalore -> Chikmagalur: Hassan is ALLOWED (along highway corridor)", () => {
  const result = validateCustomStopAgainstRoute("Hassan", blrToCkmRoute);
  assert.strictEqual(result.isValid, true, `Expected valid: ${result.reason}`);
});

test("Bangalore -> Chikmagalur: Belur is ALLOWED (along route / near Chikmagalur)", () => {
  const result = validateCustomStopAgainstRoute("Belur", blrToCkmRoute);
  assert.strictEqual(result.isValid, true, `Expected valid: ${result.reason}`);
});

test("Bangalore -> Chikmagalur: Halebidu is ALLOWED (along route)", () => {
  const result = validateCustomStopAgainstRoute("Halebidu", blrToCkmRoute);
  assert.strictEqual(result.isValid, true, `Expected valid: ${result.reason}`);
});

test("Bangalore -> Chikmagalur: Mullayanagiri is ALLOWED (destination proximity)", () => {
  const result = validateCustomStopAgainstRoute("Mullayanagiri", blrToCkmRoute);
  assert.strictEqual(result.isValid, true, `Expected valid: ${result.reason}`);
});

test("Bangalore -> Chikmagalur: Baba Budangiri is ALLOWED (destination proximity)", () => {
  const result = validateCustomStopAgainstRoute("Baba Budangiri", blrToCkmRoute);
  assert.strictEqual(result.isValid, true, `Expected valid: ${result.reason}`);
});

test("Bangalore -> Chikmagalur: Sakleshpur is ALLOWED (route deviation within threshold)", () => {
  const result = validateCustomStopAgainstRoute("Sakleshpur", blrToCkmRoute);
  assert.strictEqual(result.isValid, true, `Expected valid: ${result.reason}`);
});

test("Bangalore -> Chikmagalur: Tumakuru is ALLOWED (route deviation within corridor)", () => {
  const result = validateCustomStopAgainstRoute("Tumakuru", blrToCkmRoute);
  assert.strictEqual(result.isValid, true, `Expected valid: ${result.reason}`);
});

// REJECTIONS for Bangalore -> Chikmagalur
test("Bangalore -> Chikmagalur: Mumbai is REJECTED (too far, >700 km)", () => {
  const result = validateCustomStopAgainstRoute("Mumbai", blrToCkmRoute);
  assert.strictEqual(result.isValid, false, "Expected invalid for Mumbai");
  assert(result.reason.includes("too far from your"), "Expected 'too far' reason message");
});

test("Bangalore -> Chikmagalur: Delhi is REJECTED (too far, >1500 km)", () => {
  const result = validateCustomStopAgainstRoute("Delhi", blrToCkmRoute);
  assert.strictEqual(result.isValid, false, "Expected invalid for Delhi");
});

test("Bangalore -> Chikmagalur: Chennai is REJECTED (opposite direction)", () => {
  const result = validateCustomStopAgainstRoute("Chennai", blrToCkmRoute);
  assert.strictEqual(result.isValid, false, "Expected invalid for Chennai");
});

test("Bangalore -> Chikmagalur: Hyderabad is REJECTED (too far north-east)", () => {
  const result = validateCustomStopAgainstRoute("Hyderabad", blrToCkmRoute);
  assert.strictEqual(result.isValid, false, "Expected invalid for Hyderabad");
});

test("Bangalore -> Chikmagalur: Kolkata is REJECTED (distant metro)", () => {
  const result = validateCustomStopAgainstRoute("Kolkata", blrToCkmRoute);
  assert.strictEqual(result.isValid, false, "Expected invalid for Kolkata");
});

// -----------------------------------------------------------------------------
// 3. Bangalore -> Mysore Route Validation
// -----------------------------------------------------------------------------
const blrToMysRoute = ["Bangalore", "Mysore"];

test("Bangalore -> Mysore: Srirangapatna is ALLOWED (on expressway)", () => {
  const result = validateCustomStopAgainstRoute("Srirangapatna", blrToMysRoute);
  assert.strictEqual(result.isValid, true, `Expected valid: ${result.reason}`);
});

test("Bangalore -> Mysore: Ranganathittu is ALLOWED (near Mysore)", () => {
  const result = validateCustomStopAgainstRoute("Ranganathittu", blrToMysRoute);
  assert.strictEqual(result.isValid, true, `Expected valid: ${result.reason}`);
});

test("Bangalore -> Mysore: Mandya is ALLOWED (along route)", () => {
  const result = validateCustomStopAgainstRoute("Mandya", blrToMysRoute);
  assert.strictEqual(result.isValid, true, `Expected valid: ${result.reason}`);
});

test("Bangalore -> Mysore: Ramanagara is ALLOWED (along route)", () => {
  const result = validateCustomStopAgainstRoute("Ramanagara", blrToMysRoute);
  assert.strictEqual(result.isValid, true, `Expected valid: ${result.reason}`);
});

test("Bangalore -> Mysore: Hassan is REJECTED (>80 km off Bangalore-Mysore corridor)", () => {
  const result = validateCustomStopAgainstRoute("Hassan", blrToMysRoute);
  assert.strictEqual(result.isValid, false, "Expected Hassan to be rejected for Bangalore -> Mysore");
});

test("Bangalore -> Mysore: Chikmagalur is REJECTED (>130 km off Bangalore-Mysore corridor)", () => {
  const result = validateCustomStopAgainstRoute("Chikmagalur", blrToMysRoute);
  assert.strictEqual(result.isValid, false, "Expected Chikmagalur to be rejected for Bangalore -> Mysore");
});

test("Bangalore -> Mysore: Mumbai is REJECTED", () => {
  const result = validateCustomStopAgainstRoute("Mumbai", blrToMysRoute);
  assert.strictEqual(result.isValid, false, "Expected Mumbai to be rejected for Bangalore -> Mysore");
});

// -----------------------------------------------------------------------------
// 4. Bangalore -> Coorg Route Validation
// -----------------------------------------------------------------------------
const blrToCoorgRoute = ["Bangalore", "Coorg"];

test("Bangalore -> Coorg: Kushalnagar is ALLOWED", () => {
  const result = validateCustomStopAgainstRoute("Kushalnagar", blrToCoorgRoute);
  assert.strictEqual(result.isValid, true, `Expected valid: ${result.reason}`);
});

test("Bangalore -> Coorg: Bylakuppe Temple is ALLOWED", () => {
  const result = validateCustomStopAgainstRoute("Bylakuppe Temple", blrToCoorgRoute);
  assert.strictEqual(result.isValid, true, `Expected valid: ${result.reason}`);
});

test("Bangalore -> Coorg: Abbey Falls is ALLOWED", () => {
  const result = validateCustomStopAgainstRoute("Abbey Falls", blrToCoorgRoute);
  assert.strictEqual(result.isValid, true, `Expected valid: ${result.reason}`);
});

test("Bangalore -> Coorg: Dubare Camp is ALLOWED", () => {
  const result = validateCustomStopAgainstRoute("Dubare Camp", blrToCoorgRoute);
  assert.strictEqual(result.isValid, true, `Expected valid: ${result.reason}`);
});

test("Bangalore -> Coorg: Delhi is REJECTED", () => {
  const result = validateCustomStopAgainstRoute("Delhi", blrToCoorgRoute);
  assert.strictEqual(result.isValid, false);
});

// -----------------------------------------------------------------------------
// 5. Multi-Destination Route (Bangalore -> Mysore -> Ooty)
// -----------------------------------------------------------------------------
const multiDestRoute = ["Bangalore", "Mysore", "Ooty"];

test("Bangalore -> Mysore -> Ooty: Bandipur is ALLOWED (between Mysore & Ooty)", () => {
  const result = validateCustomStopAgainstRoute("Bandipur", multiDestRoute);
  assert.strictEqual(result.isValid, true, `Expected valid: ${result.reason}`);
});

test("Bangalore -> Mysore -> Ooty: Mudumalai is ALLOWED (between Mysore & Ooty)", () => {
  const result = validateCustomStopAgainstRoute("Mudumalai", multiDestRoute);
  assert.strictEqual(result.isValid, true, `Expected valid: ${result.reason}`);
});

test("Bangalore -> Mysore -> Ooty: Coonoor is ALLOWED (near Ooty)", () => {
  const result = validateCustomStopAgainstRoute("Coonoor", multiDestRoute);
  assert.strictEqual(result.isValid, true, `Expected valid: ${result.reason}`);
});

test("Bangalore -> Mysore -> Ooty: Mumbai is REJECTED", () => {
  const result = validateCustomStopAgainstRoute("Mumbai", multiDestRoute);
  assert.strictEqual(result.isValid, false);
});

console.log("\n============================================================");
console.log(`TOTAL TESTS: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
console.log("============================================================\n");

if (failed > 0) {
  process.exit(1);
}
