/**
 * ZENERA TRIPS — Authoritative Route Distance & Itinerary Calculation Engine
 *
 * Normalizes multi-stop itineraries (Origin, Primary Destinations, Secondary Stops, Return)
 * and computes accurate sequential road distance and leg breakdowns.
 */

import {
  CANONICAL_COORDINATES,
  Coordinates,
  resolveLocationCoordinates,
  haversineDistanceKm,
} from "./routeValidation.service";

export interface ItineraryPoint {
  id?: string;
  type: "origin" | "destination" | "secondary-stop" | "custom-stop" | "return";
  name: string;
  lat?: number;
  lng?: number;
  distanceKm?: number;
  isPrimary?: boolean;
  categoryName?: string;
}

export interface RouteLeg {
  from: string;
  to: string;
  fromType?: string;
  toType?: string;
  distanceKm: number;
}

export interface RouteCalculationResult {
  orderedItinerary: ItineraryPoint[];
  legs: RouteLeg[];
  totalDistanceKm: number;
  actualDistanceKm: number;
}

export interface BuildItineraryParams {
  origin?: string | { name: string; lat?: number; lng?: number };
  startLocation?: string;
  pickupLocation?: string;
  destination?: string | any;
  destinations?: Array<string | any>;
  primaryDestinations?: Array<string | any>;
  secondaryStops?: Array<string | any>;
  detailedDestinations?: Array<string | any>;
  stops?: Array<string | any>;
  userStops?: Array<string | any>;
  orderedItinerary?: Array<ItineraryPoint | any>;
  tripType?: "round-trip" | "one-way" | string;
}

/**
 * Known real road distances (in km) between major South Indian transit pairs.
 * Used to provide authoritative road navigation accuracy.
 */
export const KNOWN_ROAD_DISTANCES: Record<string, number> = {
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

/**
 * Normalizes location key for matching known road distances.
 */
function toSlug(name: string): string {
  if (!name) return "";
  return String(name)
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

/**
 * Computes road distance between two geographical points.
 * Uses curated network distance table when available, or Geodesic Haversine with standard 1.25 road-winding multiplier.
 */
export function calculatePointToPointRoadDistance(p1: ItineraryPoint | string, p2: ItineraryPoint | string): number {
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

  // 2. Check if either point has a predefined distanceKm property
  if (typeof p2 === "object" && typeof p2.distanceKm === "number" && p2.distanceKm > 0) {
    return p2.distanceKm;
  }
  if (typeof p1 === "object" && typeof p1.distanceKm === "number" && p1.distanceKm > 0) {
    return p1.distanceKm;
  }

  // 3. Geodesic coordinates calculation with road network curvature factor
  const coords1 = resolveLocationCoordinates(p1);
  const coords2 = resolveLocationCoordinates(p2);

  if (coords1 && coords2) {
    const straightLine = haversineDistanceKm(coords1, coords2);
    // Standard South Indian regional road network routing factor (1.25x)
    const roadKm = Math.round(straightLine * 1.25);
    return Math.max(5, roadKm);
  }

  // Fallback if coordinates cannot be established
  return 20;
}

/**
 * Builds an authoritative normalized ordered itinerary from diverse user inputs.
 * Preserves user-selected stop order, primary destinations, and return leg.
 */
export function buildOrderedItinerary(params: BuildItineraryParams): ItineraryPoint[] {
  // 1. If explicit ordered itinerary array is already provided, sanitize and preserve exact user order
  if (Array.isArray(params.orderedItinerary) && params.orderedItinerary.length > 0) {
    return params.orderedItinerary.map((pt, idx) => {
      const name = typeof pt === "object" ? pt.name || pt.id || `Stop ${idx + 1}` : String(pt);
      const coords = resolveLocationCoordinates(pt);
      const isNumDist = typeof pt === "object" && typeof pt.distanceKm === "number" && Number.isFinite(pt.distanceKm);
      const item: ItineraryPoint = {
        id: typeof pt === "object" && pt.id ? pt.id : idx === 0 ? "origin" : idx === params.orderedItinerary!.length - 1 && (pt.type === "return" || name.toLowerCase().includes("bangalore")) ? "return" : `point-${idx}`,
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

  const originPoint: ItineraryPoint = {
    id: "origin",
    type: "origin",
    name: originName || "Bangalore, Karnataka",
    lat: originCoords?.lat || 12.9716,
    lng: originCoords?.lng || 77.5946,
    distanceKm: 0,
    isPrimary: true,
  };

  // 3. Collect Primary Destination(s)
  const rawDests: any[] = [];
  if (params.destination) rawDests.push(params.destination);
  if (Array.isArray(params.destinations)) rawDests.push(...params.destinations);
  if (Array.isArray(params.primaryDestinations)) rawDests.push(...params.primaryDestinations);

  const primaryDestPoints: ItineraryPoint[] = [];
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

  if (primaryDestPoints.length === 0 && rawDests.length > 0) {
    const rawDest = rawDests[0];
    const destName = typeof rawDest === "object" ? rawDest.name || rawDest.id : String(rawDest);
    if (destName) {
      const coords = resolveLocationCoordinates(destName);
      primaryDestPoints.push({
        id: typeof rawDest === "object" && rawDest.id ? rawDest.id : "dest-1",
        type: "destination",
        name: destName,
        lat: coords?.lat || 0,
        lng: coords?.lng || 0,
        distanceKm: 0,
        isPrimary: true,
        categoryName: "Primary Destination",
      });
    }
  }

  // 4. Collect Secondary / Custom Stops
  const rawStops: any[] = [];
  if (Array.isArray(params.userStops)) rawStops.push(...params.userStops);
  if (Array.isArray(params.secondaryStops)) rawStops.push(...params.secondaryStops);
  if (Array.isArray(params.stops)) rawStops.push(...params.stops);
  if (Array.isArray(params.detailedDestinations)) rawStops.push(...params.detailedDestinations);

  const stopPoints: ItineraryPoint[] = [];
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

  const preDestStops: ItineraryPoint[] = [];
  const postDestStops: ItineraryPoint[] = [];

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

  const result: ItineraryPoint[] = [
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


/**
 * Calculates road legs and total road distance for an ordered itinerary.
 */
export function calculateRouteLegs(itinerary: ItineraryPoint[]): { legs: RouteLeg[]; totalDistanceKm: number; orderedItinerary: ItineraryPoint[] } {
  if (!Array.isArray(itinerary) || itinerary.length === 0) {
    return { legs: [], totalDistanceKm: 0, orderedItinerary: [] };
  }

  const enrichedItinerary: ItineraryPoint[] = itinerary.map((pt, idx) => {
    const rawName = typeof pt === "object" ? pt.name || pt.id || `Stop ${idx + 1}` : String(pt);
    const coords = resolveLocationCoordinates(pt);
    const item: ItineraryPoint = {
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

  const legs: RouteLeg[] = [];
  let totalDistanceKm = 0;

  // Point 0 (origin): distance is 0 km
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

    // Segment distance for to point
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
 * High-level helper to normalize itinerary, compute legs, and total distance in a single call.
 */
export function calculateAuthoritativeRoute(params: BuildItineraryParams): RouteCalculationResult {
  const rawItinerary = buildOrderedItinerary(params);
  const { legs, totalDistanceKm, orderedItinerary } = calculateRouteLegs(rawItinerary);

  return {
    orderedItinerary,
    legs,
    totalDistanceKm,
    actualDistanceKm: totalDistanceKm,
  };
}
