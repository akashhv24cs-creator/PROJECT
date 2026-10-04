/**
 * ZENERA TRIPS — Route-Aware Custom Stop & Geodesic Validation Service
 *
 * Implements dynamic, coordinate-based geographical corridor validation
 * for custom stops along any primary trip route.
 *
 * Principle: Restrict stops strictly to the planned route corridor and destination radii.
 */

// ============================================================
// CONFIGURABLE ROUTE VALIDATION THRESHOLDS
// ============================================================

/**
 * Maximum perpendicular distance (in km) a custom stop can deviate
 * from the straight-line segment connecting consecutive route waypoints.
 * Default: 50 km (allows realistic highway corridors and en-route diversions).
 */
export const MAX_CUSTOM_STOP_ROUTE_DEVIATION_KM = 50;

/**
 * Maximum radial distance (in km) from any selected primary destination
 * or pickup origin where local sightseeing stops and attractions are permitted.
 * Default: 45 km (covers local district tourist clusters e.g. Mullayanagiri around Chikmagalur).
 */
export const MAX_CUSTOM_STOP_DESTINATION_RADIUS_KM = 45;

/**
 * Maximum additional detour distance (in km) that inserting this stop
 * adds to the segment (dist(A, Stop) + dist(Stop, B) - dist(A, B)).
 * Default: 75 km.
 */
export const MAX_CUSTOM_STOP_DETOUR_KM = 75;

// ============================================================
// CANONICAL COORDINATES REGISTRY
// Covers major South Indian destinations, transit hubs, and popular sightseeing spots.
// ============================================================

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface Waypoint {
  id?: string;
  name: string;
  lat?: number;
  lng?: number;
  coordinates?: Coordinates;
  isPrimary?: boolean;
}

export const CANONICAL_COORDINATES: Record<string, Coordinates> = {
  // --- Major Transit Origins & Hubs ---
  "bangalore": { lat: 12.9716, lng: 77.5946 },
  "bengaluru": { lat: 12.9716, lng: 77.5946 },
  "kempegowda-international-airport": { lat: 13.1986, lng: 77.7066 },
  "whitefield": { lat: 12.9698, lng: 77.7500 },
  "electronic-city": { lat: 12.8399, lng: 77.6770 },
  "indiranagar": { lat: 12.9784, lng: 77.6408 },
  "koramangala": { lat: 12.9352, lng: 77.6245 },
  "hsr-layout": { lat: 12.9121, lng: 77.6446 },
  "majestic": { lat: 12.9767, lng: 77.5713 },

  // --- Primary Destinations ---
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

  // --- Transit Corridor Intermediate Towns & Stops ---
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
  "honnavar": { lat: 14.2800, lng: 74.4500 },
  "palolem-beach": { lat: 15.0100, lng: 74.0231 },
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
  "erode": { lat: 11.3410, lng: 77.7172 },
  "coimbatore": { lat: 11.0168, lng: 76.9558 },
  "mettur": { lat: 11.7967, lng: 77.8017 },
  "yelagiri": { lat: 12.5786, lng: 78.6394 },

  // --- Distant Metro Cities (Explicitly Registered to Guarantee Immediate Accurate Rejection) ---
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
  "surat": { lat: 21.1702, lng: 72.8311 },
  "kochi": { lat: 9.9312, lng: 76.2673 },
  "trivandrum": { lat: 8.5241, lng: 76.9366 },
  "thiruvananthapuram": { lat: 8.5241, lng: 76.9366 },
  "calicut": { lat: 11.2588, lng: 75.7804 },
  "kozhikode": { lat: 11.2588, lng: 75.7804 },
  "mangalore": { lat: 12.9141, lng: 74.8560 },
  "mangaluru": { lat: 12.9141, lng: 74.8560 },
  "hubli": { lat: 15.3647, lng: 75.1240 },
  "hubballi": { lat: 15.3647, lng: 75.1240 },
  "dharwad": { lat: 15.4589, lng: 75.0078 },
  "belgaum": { lat: 15.8497, lng: 74.4977 },
  "belagavi": { lat: 15.8497, lng: 74.4977 },
  "shimoga": { lat: 13.9299, lng: 75.5681 },
  "shivamogga": { lat: 13.9299, lng: 75.5681 },
};

/**
 * Normalizes location key for dictionary lookup.
 */
export function normalizeLocationKey(name: string): string {
  if (!name) return "";
  return String(name)
    .trim()
    .toLowerCase()
    .replace(/[,\.()]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")[0]; // Main word fallback
}

/**
 * Resolves geographical coordinates for a location string or object.
 * Returns { lat, lng } or null if coordinates cannot be established.
 */
export function resolveLocationCoordinates(
  loc: string | Waypoint | any
): Coordinates | null {
  if (!loc) return null;

  // 1. If coordinates are already attached to object
  if (typeof loc === "object") {
    if (typeof loc.lat === "number" && typeof loc.lng === "number") {
      return { lat: loc.lat, lng: loc.lng };
    }
    if (typeof loc.lat === "number" && typeof loc.lon === "number") {
      return { lat: loc.lat, lng: loc.lon };
    }
    if (loc.coordinates && typeof loc.coordinates.lat === "number" && typeof loc.coordinates.lng === "number") {
      return { lat: loc.coordinates.lat, lng: loc.coordinates.lng };
    }
  }

  const rawName = typeof loc === "object" ? loc.id || loc.name : String(loc);
  const clean = String(rawName || "").trim().toLowerCase();
  if (!clean) return null;

  const slug = clean.replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-");

  // 2. Direct Slug Match in Canonical DB
  if (CANONICAL_COORDINATES[slug]) {
    return CANONICAL_COORDINATES[slug];
  }

  // 3. Substring & Alias Lookup
  for (const [key, coords] of Object.entries(CANONICAL_COORDINATES)) {
    if (slug.includes(key) || key.includes(slug)) {
      return coords;
    }
  }

  // 4. Word-by-word matching
  const words = clean.split(/[\s,]+/);
  for (const word of words) {
    if (word.length >= 4 && CANONICAL_COORDINATES[word]) {
      return CANONICAL_COORDINATES[word];
    }
  }

  return null;
}

// ============================================================
// GEODESIC & MATHEMATICAL CORRIDOR CALCULATIONS
// ============================================================

/**
 * Calculates geodesic distance between two points using the Haversine formula (km).
 */
export function haversineDistanceKm(c1: Coordinates, c2: Coordinates): number {
  const R = 6371; // Earth's mean radius in km
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

/**
 * Calculates the shortest perpendicular / cross-track distance from point P to line segment A -> B (km).
 */
export function pointToSegmentDistanceKm(
  p: Coordinates,
  a: Coordinates,
  b: Coordinates
): number {
  // Convert spherical coords to localized flat projection centered around segment midpoint
  const midLat = ((a.lat + b.lat) / 2) * (Math.PI / 180);
  const cosMidLat = Math.cos(midLat);

  // Cartesian coordinates in km relative to point A
  const degToKm = 111.32;
  const bx = (b.lng - a.lng) * cosMidLat * degToKm;
  const by = (b.lat - a.lat) * degToKm;
  const px = (p.lng - a.lng) * cosMidLat * degToKm;
  const py = (p.lat - a.lat) * degToKm;

  const segLengthSq = bx * bx + by * by;

  // Degenerate segment: A and B are same location
  if (segLengthSq < 0.01) {
    return haversineDistanceKm(p, a);
  }

  // Projection parameter t of point P onto segment AB
  const t = (px * bx + py * by) / segLengthSq;
  const clampedT = Math.max(0, Math.min(1, t));

  // Closest point on segment
  const closestX = clampedT * bx;
  const closestY = clampedT * by;

  const dx = px - closestX;
  const dy = py - closestY;

  return Math.round(Math.sqrt(dx * dx + dy * dy) * 10) / 10;
}

// ============================================================
// ROUTE-AWARE VALIDATION ENGINE
// ============================================================

export interface ValidationResult {
  isValid: boolean;
  reason?: string;
  distanceToRouteKm?: number;
  distanceToNearestDestKm?: number;
  nearestDestName?: string;
  matchedSegment?: string;
}

export interface RouteValidationOptions {
  maxRouteDeviationKm?: number;
  maxDestinationRadiusKm?: number;
  maxDetourKm?: number;
}

/**
 * Validates a prospective custom stop against the user's primary trip route waypoints.
 * Evaluates perpendicular corridor distance, destination proximity, and detour factor.
 *
 * @param stop The prospective stop location (string, place object, or waypoint)
 * @param primaryWaypoints Ordered list of primary route waypoints [Origin, Dest1, Dest2, ...]
 * @param options Configurable distance thresholds
 */
export function validateCustomStopAgainstRoute(
  stop: string | Waypoint | any,
  primaryWaypoints: (string | Waypoint | any)[],
  options: RouteValidationOptions = {}
): ValidationResult {
  const maxRouteDeviationKm =
    options.maxRouteDeviationKm ?? MAX_CUSTOM_STOP_ROUTE_DEVIATION_KM;
  const maxDestinationRadiusKm =
    options.maxDestinationRadiusKm ?? MAX_CUSTOM_STOP_DESTINATION_RADIUS_KM;
  const maxDetourKm = options.maxDetourKm ?? MAX_CUSTOM_STOP_DETOUR_KM;

  const stopCoords = resolveLocationCoordinates(stop);
  const stopName = typeof stop === "object" ? stop.name || stop.id : String(stop);

  // 1. Guard: Check if coordinates could be verified
  if (!stopCoords) {
    return {
      isValid: false,
      reason: `Location coordinates could not be verified for "${stopName}". Please choose a verified nearby location.`,
    };
  }

  // 2. Resolve coordinates for all primary waypoints
  const resolvedWaypoints: { name: string; coords: Coordinates }[] = [];
  for (const wp of primaryWaypoints) {
    if (!wp) continue;
    const coords = resolveLocationCoordinates(wp);
    const name = typeof wp === "object" ? wp.name || wp.id : String(wp);
    if (coords) {
      resolvedWaypoints.push({ name, coords });
    }
  }

  if (resolvedWaypoints.length === 0) {
    // No primary destinations selected yet: default to valid
    return { isValid: true, distanceToRouteKm: 0 };
  }

  // 3. Guard against exact duplicates of primary endpoints
  for (const wp of resolvedWaypoints) {
    const distToWp = haversineDistanceKm(stopCoords, wp.coords);
    if (distToWp < 2.0 && stopName.toLowerCase() === wp.name.toLowerCase()) {
      return {
        isValid: false,
        reason: `"${stopName}" is already selected as a primary destination in your trip.`,
      };
    }
  }

  // 4. Calculate Distance to Nearest Primary Destination Endpoint
  let minDestDist = Infinity;
  let nearestDestName = "";

  for (const wp of resolvedWaypoints) {
    const dist = haversineDistanceKm(stopCoords, wp.coords);
    if (dist < minDestDist) {
      minDestDist = dist;
      nearestDestName = wp.name;
    }
  }

  // If stop is within destination cluster radius, immediately ACCEPT
  if (minDestDist <= maxDestinationRadiusKm) {
    return {
      isValid: true,
      distanceToNearestDestKm: minDestDist,
      nearestDestName,
    };
  }

  // 5. Calculate Distance to Route Segments (Corridor check across all consecutive waypoints)
  let minRouteDist = Infinity;
  let matchedSegment = "";
  let minDetour = Infinity;

  if (resolvedWaypoints.length >= 2) {
    for (let i = 0; i < resolvedWaypoints.length - 1; i++) {
      const wpA = resolvedWaypoints[i];
      const wpB = resolvedWaypoints[i + 1];

      const segDist = pointToSegmentDistanceKm(stopCoords, wpA.coords, wpB.coords);
      if (segDist < minRouteDist) {
        minRouteDist = segDist;
        matchedSegment = `${wpA.name} → ${wpB.name}`;
      }

      // Detour factor: dist(A, Stop) + dist(Stop, B) - dist(A, B)
      const directDist = haversineDistanceKm(wpA.coords, wpB.coords);
      const detourDist =
        haversineDistanceKm(wpA.coords, stopCoords) +
        haversineDistanceKm(stopCoords, wpB.coords) -
        directDist;

      if (detourDist < minDetour) {
        minDetour = detourDist;
      }
    }
  } else {
    // Single primary waypoint: route distance equals distance to that waypoint
    minRouteDist = minDestDist;
    matchedSegment = resolvedWaypoints[0].name;
  }

  // 6. Final Multi-Factor Evaluation
  const isWithinRouteCorridor = minRouteDist <= maxRouteDeviationKm;
  const isReasonableDetour = minDetour <= maxDetourKm;

  if (isWithinRouteCorridor || isReasonableDetour) {
    return {
      isValid: true,
      distanceToRouteKm: minRouteDist,
      distanceToNearestDestKm: minDestDist,
      nearestDestName,
      matchedSegment,
    };
  }

  // 7. REJECT with clear, customer-friendly explanation
  const originName = resolvedWaypoints[0]?.name || "origin";
  const destName = resolvedWaypoints[resolvedWaypoints.length - 1]?.name || "destination";

  return {
    isValid: false,
    distanceToRouteKm: minRouteDist,
    distanceToNearestDestKm: minDestDist,
    nearestDestName,
    reason: `"${stopName}" is too far from your ${originName} → ${destName} route (${Math.round(minRouteDist)} km away). Please choose a nearby stop or a location along your trip.`,
  };
}

/**
 * Filters and annotates a list of suggested stops according to route relevance.
 */
export function filterAllowedStopsForRoute(
  stopsList: any[],
  primaryWaypoints: (string | Waypoint | any)[],
  options: RouteValidationOptions = {}
): any[] {
  if (!Array.isArray(stopsList) || stopsList.length === 0) return [];

  return stopsList.filter((stop) => {
    const result = validateCustomStopAgainstRoute(stop, primaryWaypoints, options);
    return result.isValid;
  });
}

/**
 * Calculates authoritative route distance (km) across ordered waypoints and custom stops
 * with zero double-counting.
 */
export function calculateDynamicRouteDistanceKm(
  primaryWaypoints: (string | Waypoint | any)[],
  customStops: (string | Waypoint | any)[] = []
): { oneWayKm: number; roundTripKm: number; extraStopsKm: number } {
  const resolvedWaypoints: Coordinates[] = [];

  for (const wp of primaryWaypoints) {
    const coords = resolveLocationCoordinates(wp);
    if (coords) resolvedWaypoints.push(coords);
  }

  if (resolvedWaypoints.length < 2) {
    return { oneWayKm: 145, roundTripKm: 290, extraStopsKm: 0 };
  }

  // Calculate base direct route distance through primary waypoints
  let baseDirectKm = 0;
  for (let i = 0; i < resolvedWaypoints.length - 1; i++) {
    baseDirectKm += haversineDistanceKm(resolvedWaypoints[i], resolvedWaypoints[i + 1]);
  }

  // Extra sightseeing stops distance calculation
  let extraStopsKm = 0;
  for (const stop of customStops) {
    const stopCoords = resolveLocationCoordinates(stop);
    if (stopCoords) {
      // Approximate additional sightseeing loop (avg 15-30 km per stop)
      extraStopsKm += 20;
    }
  }

  const oneWayKm = Math.round(baseDirectKm);
  const roundTripKm = Math.round(oneWayKm * 2 + extraStopsKm);

  return {
    oneWayKm,
    roundTripKm,
    extraStopsKm,
  };
}
