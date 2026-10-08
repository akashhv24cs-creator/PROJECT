/**
 * Places & Geocoding Autocomplete Service
 * Combines curated Zenera destinations dataset with live Maps API (Photon / OpenStreetMap)
 * for instant, zero-delay location suggestions across India.
 */

import { DESTINATIONS, getAllAvailableStops } from "../data/destinations";

// In-memory cache for place search queries
const placeCache = new Map();

// Top recommended pickup locations in/around Bangalore
export const POPULAR_BANGALORE_PICKUPS = [
  {
    id: "pickup-blr-center",
    name: "Bangalore",
    detail: "Karnataka, India",
    type: "city",
    icon: "",
  },
  {
    id: "pickup-blr-airport",
    name: "Kempegowda International Airport (BLR)",
    detail: "Devanahalli, Bangalore",
    type: "airport",
    icon: "",
  },
  {
    id: "pickup-blr-majestic",
    name: "Majestic / Kempegowda Bus Station",
    detail: "Central Bangalore",
    type: "station",
    icon: "",
  },
  {
    id: "pickup-blr-whitefield",
    name: "Whitefield",
    detail: "East Bangalore, IT Corridor",
    type: "locality",
    icon: "",
  },
  {
    id: "pickup-blr-ecity",
    name: "Electronic City",
    detail: "South Bangalore",
    type: "locality",
    icon: "",
  },
  {
    id: "pickup-blr-indiranagar",
    name: "Indiranagar",
    detail: "East Bangalore",
    type: "locality",
    icon: "",
  },
  {
    id: "pickup-blr-koramangala",
    name: "Koramangala",
    detail: "South Bangalore",
    type: "locality",
    icon: "",
  },
  {
    id: "pickup-blr-hsr",
    name: "HSR Layout",
    detail: "South-East Bangalore",
    type: "locality",
    icon: "",
  },
];

/**
 * Top curated weekend / holiday outstation destinations from Bangalore
 * Generated dynamically from authoritative DESTINATIONS dataset
 */
export const POPULAR_DESTINATIONS = DESTINATIONS.map((dest) => ({
  id: `dest-${dest.id}`,
  destId: dest.id,
  name: dest.name,
  detail: `${dest.state || "Karnataka"}${dest.distance ? ` • ${dest.distance}` : ""}`,
  type: "destination",
  icon: "",
  distance: dest.distance || "",
  raw: dest,
}));

/**
 * Search local curated destinations and spots instantly
 */
function searchLocalDestinations(query) {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const results = [];
  const seen = new Set();

  // 1. Check primary curated destinations
  DESTINATIONS.forEach((dest) => {
    const matchName = dest.name.toLowerCase().includes(q);
    const matchState = (dest.state || "").toLowerCase().includes(q);
    const matchTagline = (dest.tagline || "").toLowerCase().includes(q);

    if (matchName || matchState || matchTagline) {
      if (!seen.has(dest.name.toLowerCase())) {
        seen.add(dest.name.toLowerCase());
        results.push({
          id: `local-dest-${dest.id}`,
          destId: dest.id,
          name: dest.name,
          detail: `${dest.state || "South India"}${dest.distance ? ` • ${dest.distance}` : ""}`,
          type: "destination",
          icon: "",
          distance: dest.distance,
          raw: dest,
        });
      }
    }
  });

  return results;
}

/**
 * Fetch live place suggestions from Maps API (Photon Geocoder with Bangalore/India bias)
 */
async function fetchMapsApiPlaces(query, signal) {
  const q = query.trim();
  if (!q || q.length < 2) return [];

  try {
    // Photon Geocoder API with South India latitude/longitude centroid bias (12.9716, 77.5946)
    const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(q)}&limit=8&lat=12.9716&lon=77.5946`;
    const res = await fetch(url, { signal });
    if (!res.ok) throw new Error(`Maps API response ${res.status}`);

    const data = await res.json();
    if (!data || !Array.isArray(data.features)) return [];

    return data.features
      .map((f, idx) => {
        const p = f.properties || {};
        const name = p.name || p.street || p.city || q;
        const parts = [
          p.city || p.district || p.county,
          p.state,
          p.country === "India" ? "" : p.country,
        ].filter(Boolean);

        return {
          id: `maps-${p.osm_id || idx}-${name}`,
          name: name,
          detail: parts.join(", ") || "India",
          type: p.osm_value || "place",
          icon: "",
          lat: f.geometry?.coordinates?.[1],
          lon: f.geometry?.coordinates?.[0],
        };
      })
      .filter((item) => item.name && item.name.length > 0);
  } catch (err) {
    if (err.name === "AbortError") return [];
    console.warn("SAFE DIAGNOSTIC — Live Maps API fallback to local search:", err.message);
    return [];
  }
}

/**
 * Search places combining local dataset with live Maps API for pickups,
 * and strictly available destinations for destination selection.
 * @param {string} query Search input
 * @param {object} options Options { signal, isPickup }
 */
export async function searchPlaces(query = "", options = {}) {
  const q = (query || "").trim();

  // DESTINATION SEARCH: Strictly show available destinations from Zenera catalog
  if (!options.isPickup) {
    if (!q) {
      return POPULAR_DESTINATIONS;
    }
    const matched = searchLocalDestinations(q);
    return matched.length > 0 ? matched : [];
  }

  // PICKUP SEARCH: Local popular pickup spots + Live Maps Search
  if (!q) {
    return POPULAR_BANGALORE_PICKUPS;
  }

  const cacheKey = `pickup:${q.toLowerCase()}`;
  if (placeCache.has(cacheKey)) {
    return placeCache.get(cacheKey);
  }

  // 1. Instant local matches for pickups
  const localPickups = POPULAR_BANGALORE_PICKUPS.filter(
    (p) =>
      p.name.toLowerCase().includes(q.toLowerCase()) ||
      p.detail.toLowerCase().includes(q.toLowerCase())
  );

  // 2. Live Maps API matches
  let apiResults = [];
  try {
    apiResults = await fetchMapsApiPlaces(q, options.signal);
  } catch {
    apiResults = [];
  }

  // 3. Merge & Deduplicate
  const merged = [...localPickups];
  const seenNames = new Set(localPickups.map((r) => r.name.toLowerCase().trim()));

  apiResults.forEach((item) => {
    const clean = item.name.toLowerCase().trim();
    if (!seenNames.has(clean)) {
      seenNames.add(clean);
      merged.push(item);
    }
  });

  const finalResults = merged.slice(0, 8);
  if (finalResults.length > 0) {
    placeCache.set(cacheKey, finalResults);
  }

  return finalResults;
}
