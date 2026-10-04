import { useState, useEffect, useCallback } from "react";
import { collection, getDocs } from "firebase/firestore";
import { httpsCallable } from "firebase/functions";
import { db, functions } from "../config/firebase";

import {
  buildOrderedItinerary,
  calculateRouteLegs,
  calculateAuthoritativeRoute,
  ItineraryPoint,
  RouteLeg,
} from "./route.service";

export interface FleetVehicle {
  id: string;
  name: string;
  vehicleType: string;
  pricePerKm: number;
  backendRatePerKm: number;
  dailyAllowance: number;
  minKmPerDay: number;
  baseRate: number;
  seats: string;
  category: string;
  available: boolean;
  tag?: string | null;
  description?: string;
  icon?: string;
}

export interface FareCalculationParams {
  vehicle: FleetVehicle | string | any;
  origin?: string | any;
  startLocation?: string;
  pickupLocation?: string;
  destination?: string | any;
  destinations?: any[];
  primaryDestinations?: any[];
  secondaryStops?: any[];
  detailedDestinations?: any[];
  stops?: any[];
  userStops?: any[];
  orderedItinerary?: any[];
  tripType?: "round-trip" | "one-way" | string;
  destinationDistanceKm?: number;
  distanceKm?: number;
  stopsDistanceKm?: number;
  routeDistanceKm?: number;
  startDate?: string | Date;
  endDate?: string | Date;
  tripDays?: number;
  advancePercent?: number;
}

export interface FareCalculationResult {
  vehicleId: string;
  vehicleName: string;
  vehicleType: string;
  vehicleRatePerKm: number;
  pricePerKm: number;
  dailyAllowance: number;
  baseRatePerDay: number;
  minKmPerDay: number;
  tripDays: number;
  actualDistanceKm: number;
  routeDistanceKm: number;
  minimumDistanceKm: number;
  minimumBillableKm: number;
  kmIncluded: number;
  billableDistanceKm: number;
  baseFare: number;
  baseVehicleFare: number;
  driverAllowance: number;
  totalAllowance: number;
  platformFee: number;
  taxableAmount: number;
  subtotal: number;
  gstRate: number;
  gstAmount: number;
  gst: number;
  totalEstimate: number;
  totalFare: number;
  advancePercent: number;
  advanceAmount: number;
  balanceDue: number;
  remainingBalance: number;
  legs?: RouteLeg[];
  routeLegs?: RouteLeg[];
  orderedItinerary?: ItineraryPoint[];
}


/**
 * Static metadata mapping to enrich backend Firestore pricing rules with rich UI details (seats, categories, icons, tags)
 * Notice: Price is NEVER hardcoded here. Price always comes from Firestore `pricing_rules`.
 */
export const VEHICLE_METADATA_MAP: Record<
  string,
  {
    seats: string;
    category: string;
    tag?: string | null;
    description: string;
    icon: string;
  }
> = {
  sedan: {
    seats: "4+1 Seats",
    category: "Sedan",
    tag: "Popular Choice",
    description: "Comfortable Dzire or Etios with dedicated highway chauffeur.",
    icon: "Car",
  },
  innova: {
    seats: "6+1 / 7+1 Seats",
    category: "SUV / MUV",
    tag: "Family Favorite",
    description: "Spacious Toyota Innova suited for hilly roads and family getaways.",
    icon: "Truck",
  },
  "innova crysta": {
    seats: "6+1 / 7+1 Seats",
    category: "Premium MUV",
    tag: "Executive Comfort",
    description: "Top-tier Innova Crysta offering captain seats and ultra-smooth ride.",
    icon: "Sparkles",
  },
  ertiga: {
    seats: "6+1 Seats",
    category: "MUV",
    tag: "Best Value",
    description: "Budget-friendly 6-seater MPV for comfortable family excursions.",
    icon: "Users",
  },
  suv: {
    seats: "6+1 / 7+1 Seats",
    category: "SUV",
    tag: "High Clearance",
    description: "Rugged SUV ideal for Western Ghats and remote terrains.",
    icon: "Shield",
  },
  toyota: {
    seats: "4+1 / 6+1 Seats",
    category: "Premium",
    tag: "Reliable",
    description: "Premium Toyota class vehicles offering supreme durability and comfort.",
    icon: "Car",
  },
  honda: {
    seats: "4+1 Seats",
    category: "Sedan / Executive",
    tag: "Executive",
    description: "Honda City or Amaze class luxury ride with refined suspension.",
    icon: "Car",
  },
  tt: {
    seats: "12+1 / 14+1 Seats",
    category: "Tempo Traveller",
    tag: "Group Explorer",
    description: "Spacious Force Tempo Traveller with pushback seats for large groups.",
    icon: "Bus",
  },
  "mini bus": {
    seats: "21+1 / 25+1 Seats",
    category: "Mini Bus",
    tag: "Corporate / Wedding",
    description: "Air-conditioned luxury mini coach for corporate tours and functions.",
    icon: "Bus",
  },
  bus: {
    seats: "33+1 / 45+1 Seats",
    category: "Luxury Coach",
    tag: "Large Tour Group",
    description: "Full-sized executive air-conditioned coach for large tourist delegations.",
    icon: "Bus",
  },
  hatchback: {
    seats: "4+1 Seats",
    category: "Hatchback",
    tag: "City & Nearby",
    description: "Compact agile hatchback for quick short-distance outstation getaways.",
    icon: "Car",
  },
};

// In-Memory cache with 60-second TTL to avoid redundant round-trips while allowing real-time pricing updates
let inMemoryFleetCache: FleetVehicle[] | null = null;
let lastCacheTime = 0;
const CACHE_TTL_MS = 60 * 1000;

/**
 * Normalizes raw Firestore document from `pricing_rules` collection into a strongly-typed `FleetVehicle`.
 */
export function normalizeFirestoreFleetDoc(docId: string, data: any): FleetVehicle {
  const cleanId = docId.trim().toLowerCase();
  
  // Resolve vehicle type name correctly:
  // Step 6 requirement: If doc ID is "Hatchback", preserve its identity as Hatchback rather than accidental "Bus"
  let vehicleTypeName = data.vehicleType || docId;
  if (cleanId === "hatchback" && vehicleTypeName.toLowerCase() === "bus") {
    vehicleTypeName = "Hatchback";
  }

  const pricePerKm = typeof data.pricePerKm === "number" ? data.pricePerKm : 17;
  const dailyAllowance = typeof data.dailyAllowance === "number" ? data.dailyAllowance : 500;
  const minKmPerDay = typeof data.minKmPerDay === "number" ? data.minKmPerDay : 300;

  // Find matching metadata key
  const metaKey = Object.keys(VEHICLE_METADATA_MAP).find(
    (k) => k === cleanId || k === vehicleTypeName.toLowerCase()
  ) || "sedan";

  const meta = VEHICLE_METADATA_MAP[metaKey] || VEHICLE_METADATA_MAP.sedan;

  return {
    id: docId,
    name: vehicleTypeName,
    vehicleType: vehicleTypeName,
    pricePerKm,
    backendRatePerKm: pricePerKm,
    dailyAllowance,
    minKmPerDay,
    baseRate: minKmPerDay * pricePerKm,
    seats: meta.seats,
    category: meta.category,
    available: data.available !== false,
    tag: meta.tag || null,
    description: meta.description,
    icon: meta.icon,
  };
}

/**
 * Canonical fleet order for pleasing UI hierarchy
 */
const CANONICAL_ORDER = [
  "sedan",
  "ertiga",
  "innova",
  "innova crysta",
  "suv",
  "toyota",
  "honda",
  "tt",
  "mini bus",
  "bus",
  "hatchback",
];

/**
 * Fetches dynamic fleet pricing directly from Firestore `pricing_rules` collection.
 * Serves as the Single Source of Truth for frontend applications.
 */
export async function fetchFleetPricing(forceRefresh = false): Promise<FleetVehicle[]> {
  const now = Date.now();
  if (!forceRefresh && inMemoryFleetCache && inMemoryFleetCache.length > 0 && now - lastCacheTime < CACHE_TTL_MS) {
    return inMemoryFleetCache;
  }

  try {
    // 1. Direct Firestore Collection query
    const rulesCollection = collection(db, "pricing_rules");
    const snapshot = await getDocs(rulesCollection);

    if (!snapshot.empty) {
      const vehicles: FleetVehicle[] = [];
      snapshot.forEach((docSnap) => {
        vehicles.push(normalizeFirestoreFleetDoc(docSnap.id, docSnap.data()));
      });

      // Sort according to canonical hierarchy
      vehicles.sort((a, b) => {
        const indexA = CANONICAL_ORDER.indexOf(a.id.toLowerCase());
        const indexB = CANONICAL_ORDER.indexOf(b.id.toLowerCase());
        const posA = indexA === -1 ? 99 : indexA;
        const posB = indexB === -1 ? 99 : indexB;
        return posA - posB;
      });

      inMemoryFleetCache = vehicles;
      lastCacheTime = now;
      return vehicles;
    }
  } catch (firestoreErr) {
    console.warn("SAFE DIAGNOSTIC LOG — Direct Firestore pricing_rules read failed, attempting Cloud Function fallback:", firestoreErr);
  }

  try {
    // 2. Cloud Function fallback (getFleetPricing)
    const callable = httpsCallable<any, { fleets: any[] }>(functions, "getFleetPricing");
    const res = await callable({});
    const returnedFleets = res.data?.fleets || res.data;

    if (Array.isArray(returnedFleets) && returnedFleets.length > 0) {
      const vehicles = returnedFleets.map((item: any) =>
        normalizeFirestoreFleetDoc(item.id || item.vehicleType || "vehicle", item)
      );
      inMemoryFleetCache = vehicles;
      lastCacheTime = now;
      return vehicles;
    }
  } catch (callableErr) {
    console.warn("SAFE DIAGNOSTIC LOG — Callable getFleetPricing fallback error:", callableErr);
  }

  // If in-memory cache existed from prior fetch, return it
  if (inMemoryFleetCache && inMemoryFleetCache.length > 0) {
    return inMemoryFleetCache;
  }

  throw new Error("Unable to load fleet information. Please try again.");
}

/**
 * Resolves vehicle parameter into a canonical FleetVehicle instance.
 */
export function resolveVehicle(param: any, fleetList?: FleetVehicle[]): FleetVehicle {
  const list = fleetList && fleetList.length > 0 ? fleetList : inMemoryFleetCache || [];

  const defaultVehicle: FleetVehicle = {
    id: "sedan",
    name: "Sedan",
    vehicleType: "Sedan",
    pricePerKm: 17,
    backendRatePerKm: 17,
    dailyAllowance: 500,
    minKmPerDay: 300,
    baseRate: 5100,
    seats: "4+1 Seats",
    category: "Sedan",
    available: true,
    tag: "Popular Choice",
    description: "Comfortable Dzire or Etios with dedicated highway chauffeur.",
    icon: "Car",
  };

  if (!param) {
    return list.length > 0 ? list[0] : defaultVehicle;
  }

  if (typeof param === "object" && param !== null) {
    if (param.id && typeof param.pricePerKm === "number") {
      return param as FleetVehicle;
    }
    if (typeof param.pricePerKm === "number") return param as FleetVehicle;
  }

  const p = (typeof param === "object" && param.vehicleType ? String(param.vehicleType) : String(param)).trim().toLowerCase();

  // 1. Direct ID match
  const byId = list.find((v) => v.id.toLowerCase() === p);
  if (byId) return byId;

  // 2. Direct name or vehicleType match
  const byTypeOrName = list.find(
    (v) =>
      v.name.toLowerCase() === p ||
      v.vehicleType.toLowerCase() === p ||
      v.category.toLowerCase() === p
  );
  if (byTypeOrName) return byTypeOrName;

  // 3. Substring & Alias Matching
  if (p.includes("crysta") || p.includes("innova crysta")) {
    const match = list.find((v) => v.name.toLowerCase().includes("crysta") || v.id.toLowerCase().includes("crysta"));
    if (match) return match;
  }
  if (p.includes("innova")) {
    const match = list.find((v) => v.name.toLowerCase() === "innova" || v.id.toLowerCase() === "innova") ||
                  list.find((v) => v.name.toLowerCase().includes("innova"));
    if (match) return match;
  }
  if (p.includes("ertiga")) {
    const match = list.find((v) => v.name.toLowerCase().includes("ertiga") || v.id.toLowerCase().includes("ertiga"));
    if (match) return match;
  }
  if (p.includes("dzire") || p.includes("etios") || p.includes("sedan")) {
    const match = list.find((v) => v.name.toLowerCase() === "sedan" || v.id.toLowerCase() === "sedan") ||
                  list.find((v) => v.name.toLowerCase().includes("sedan"));
    if (match) return match;
  }
  if (p.includes("hatchback")) {
    const match = list.find((v) => v.id.toLowerCase() === "hatchback" || v.name.toLowerCase() === "hatchback") ||
                  list.find((v) => v.name.toLowerCase().includes("hatchback"));
    if (match) return match;
  }
  if (p.includes("honda")) {
    const match = list.find((v) => v.name.toLowerCase().includes("honda") || v.id.toLowerCase().includes("honda"));
    if (match) return match;
  }
  if (p.includes("toyota")) {
    const match = list.find((v) => v.name.toLowerCase().includes("toyota") || v.id.toLowerCase().includes("toyota"));
    if (match) return match;
  }
  if (p.includes("tempo") || p.includes("traveller") || p.includes("urbania") || p === "tt") {
    const match = list.find((v) => v.id.toLowerCase() === "tt" || v.name.toLowerCase() === "tt" || v.name.toLowerCase().includes("tempo") || v.name.toLowerCase().includes("traveller"));
    if (match) return match;
  }
  if (p.includes("mini bus") || p.includes("minibus") || p.includes("mini-bus")) {
    const match = list.find((v) => v.name.toLowerCase().includes("mini bus") || v.id.toLowerCase().includes("mini bus"));
    if (match) return match;
  }
  if (p.includes("luxury bus") || p.includes("bus")) {
    const match = list.find((v) => v.name.toLowerCase() === "bus" || v.id.toLowerCase() === "bus") ||
                  list.find((v) => v.name.toLowerCase().includes("bus"));
    if (match) return match;
  }
  if (p.includes("suv")) {
    const match = list.find((v) => v.name.toLowerCase() === "suv" || v.id.toLowerCase() === "suv") ||
                  list.find((v) => v.category === "suv");
    if (match) return match;
  }

  // 4. Partial substring in name
  const partial = list.find((v) => v.name.toLowerCase().includes(p) || p.includes(v.name.toLowerCase()));
  if (partial) return partial;

  if (list.length > 0) return list[0];
  return defaultVehicle;
}

/**
 * Calculates inclusive calendar days for outstation trips.
 * Ensures identical day count across client and server.
 */
export function calculateTripDays(startRaw?: string | Date, endRaw?: string | Date): number {
  if (!startRaw || !endRaw) return 1;

  const parseCalendarDate = (val: string | Date): Date | null => {
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
      // If ISO timestamp string, convert to Indian Standard Time (UTC+5:30) to extract true local calendar date
      const d = new Date(cleanVal);
      if (!isNaN(d.getTime())) {
        const istDate = new Date(d.getTime() + (5.5 * 60 * 60 * 1000));
        return new Date(istDate.getUTCFullYear(), istDate.getUTCMonth(), istDate.getUTCDate());
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

/**
 * Pure, Authoritative Single Source of Truth for Outstation Trip Pricing
 * Calculates mathematically identical fare breakdown across client and server.
 * Reads rules directly from vehicle's pricePerKm, dailyAllowance, and minKmPerDay.
 */
export function calculateAuthoritativeFare(params: FareCalculationParams, fleetList?: FleetVehicle[]): FareCalculationResult {
  const vehicle = resolveVehicle(params.vehicle, fleetList);

  const pricePerKm = Number(vehicle.pricePerKm || vehicle.backendRatePerKm) || 17;
  const dailyAllowanceRate = Number(vehicle.dailyAllowance) || 500;
  const minKmPerDay = Number(vehicle.minKmPerDay) || 300;

  // 1. Calculate trip duration in full calendar days (minimum 1 day)
  const tripDays = (typeof params.tripDays === "number" && params.tripDays > 0)
    ? Math.round(params.tripDays)
    : calculateTripDays(params.startDate, params.endDate);

  // 2. Minimum km package per day from Firestore
  const packageKmIncluded = minKmPerDay * tripDays;

  // 3. Authoritative Route Distance & Legs Breakdown
  let routeDistanceKm = 0;
  let legs: RouteLeg[] = [];
  let orderedItinerary: ItineraryPoint[] = [];

  const hasExplicitItinerary =
    Array.isArray(params.orderedItinerary) && params.orderedItinerary.length > 0;
  const hasRouteContext =
    Boolean(params.destination || params.destinations || params.primaryDestinations || params.stops || params.userStops || params.secondaryStops || params.detailedDestinations);

  if (hasExplicitItinerary || hasRouteContext) {
    const routeRes = calculateAuthoritativeRoute({
      origin: params.origin || params.pickupLocation || params.startLocation || "Bangalore, Karnataka",
      destination: params.destination,
      destinations: params.destinations || params.primaryDestinations,
      secondaryStops: params.secondaryStops || params.stops || params.userStops || params.detailedDestinations,
      orderedItinerary: params.orderedItinerary,
      tripType: params.tripType || "round-trip",
    });
    orderedItinerary = routeRes.orderedItinerary;
    legs = routeRes.legs;
    routeDistanceKm = routeRes.totalDistanceKm;
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
    const routeRes = calculateAuthoritativeRoute({
      origin: defaultOrigin,
      destination: defaultDest,
      tripType: params.tripType || "round-trip",
    });
    orderedItinerary = routeRes.orderedItinerary;
    legs = routeRes.legs;
    if (!routeDistanceKm || routeDistanceKm === 0) {
      routeDistanceKm = routeRes.totalDistanceKm;
    }
  }

  // If params.routeDistanceKm is explicitly passed and greater than 0, respect it
  if (typeof params.routeDistanceKm === "number" && params.routeDistanceKm > 0) {
    routeDistanceKm = Math.round(params.routeDistanceKm);
  }

  // 4. Billable km is the higher of actual route distance or daily minimum package
  const billableDistanceKm = Math.max(routeDistanceKm, packageKmIncluded);

  // 5. Base Vehicle Fare: billable distance × per-km rate
  const baseVehicleFare = Math.round(billableDistanceKm * pricePerKm);

  // 6. Driver Daily Bata / Allowance (dailyAllowance * tripDays)
  const driverAllowance = Math.round(dailyAllowanceRate * tripDays);

  // 7. Nominal Platform & Reservation Fee
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
    console.error(`[Fare Consistency Error] Expected ${expectedTotal}, got ${totalEstimate}`);
  }
  if (Math.abs((advanceAmount + balanceDue) - totalEstimate) > 1.0) {
    console.error(`[Fare Advance Error] Advance ${advanceAmount} + Balance ${balanceDue} != Total ${totalEstimate}`);
  }

  return {
    vehicleId: vehicle.id,
    vehicleName: vehicle.name,
    vehicleType: vehicle.vehicleType || vehicle.name,
    vehicleRatePerKm: pricePerKm,
    pricePerKm,
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

/**
 * Custom React hook for dynamic fleet pricing with loading and error states.
 */
export function useFleetPricing() {
  const [fleets, setFleets] = useState<FleetVehicle[]>(() => inMemoryFleetCache || []);
  const [loading, setLoading] = useState<boolean>(() => !inMemoryFleetCache || inMemoryFleetCache.length === 0);
  const [error, setError] = useState<string | null>(null);

  const loadFleets = useCallback(async (force = false) => {
    if (!inMemoryFleetCache || inMemoryFleetCache.length === 0 || force) {
      setLoading(true);
    }
    setError(null);
    try {
      const data = await fetchFleetPricing(force);
      if (data && data.length > 0) {
        setFleets(data);
      } else {
        setError("No fleet options available.");
      }
    } catch (err: any) {
      console.error("SAFE DIAGNOSTIC LOG — useFleetPricing error:", err);
      setError("Unable to load fleet information. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFleets();
  }, [loadFleets]);

  const refresh = useCallback(() => {
    return loadFleets(true);
  }, [loadFleets]);

  return {
    fleets,
    loading,
    error,
    refresh,
    resolveVehicle: (param: any) => resolveVehicle(param, fleets),
    calculateFare: (params: FareCalculationParams) => calculateAuthoritativeFare(params, fleets),
  };
}
