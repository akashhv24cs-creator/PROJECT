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

// Top curated weekend / holiday outstation destinations from Bangalore
export const POPULAR_DESTINATIONS = [
  {
    id: "dest-coorg",
    name: "Coorg (Madikeri)",
    detail: "Karnataka • ~260 km",
    type: "destination",
    icon: "",
    distance: "~260 km",
  },
  {
    id: "dest-ooty",
    name: "Ooty",
    detail: "Tamil Nadu • ~270 km",
    type: "destination",
    icon: "",
    distance: "~270 km",
  },
  {
    id: "dest-chikmagalur",
    name: "Chikmagalur",
    detail: "Karnataka • ~245 km",
    type: "destination",
    icon: "",
    distance: "~245 km",
  },
  {
    id: "dest-mysore",
    name: "Mysore",
    detail: "Karnataka • ~145 km",
    type: "destination",
    icon: "",
    distance: "~145 km",
  },
  {
    id: "dest-wayanad",
    name: "Wayanad",
    detail: "Kerala • ~280 km",
    type: "destination",
    icon: "",
    distance: "~280 km",
  },
  {
    id: "dest-pondicherry",
    name: "Pondicherry",
    detail: "Tamil Nadu / Puducherry • ~310 km",
    type: "destination",
    icon: "",
    distance: "~310 km",
  },
  {
    id: "dest-gokarna",
    name: "Gokarna",
    detail: "Karnataka • ~490 km",
    type: "destination",
    icon: "",
    distance: "~490 km",
  },
  {
    id: "dest-kodaikanal",
    name: "Kodaikanal",
    detail: "Tamil Nadu • ~465 km",
    type: "destination",
    icon: "",
    distance: "~465 km",
  },
  {
    id: "dest-hampi",
    name: "Hampi",
    detail: "Karnataka • ~340 km",
    type: "destination",
    icon: "",
    distance: "~340 km",
  },
  {
    id: "dest-munnar",
    name: "Munnar",
    detail: "Kerala • ~480 km",
    type: "destination",
    icon: "",
    distance: "~480 km",
  },
];

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
          name: dest.name,
          detail: `${dest.state || "South India"}${dest.distance ? ` • ${dest.distance}` : ""}`,
          type: "destination",
          icon: "",
          distance: dest.distance,
          raw: dest,
        });
      }
    }

    // 2. Check nearby tourist spots within this destination
    if (dest.nearbyStops && Array.isArray(dest.nearbyStops)) {
      dest.nearbyStops.forEach((stop) => {
        if (stop.name.toLowerCase().includes(q) && !seen.has(stop.name.toLowerCase())) {
          seen.add(stop.name.toLowerCase());
          results.push({
            id: `local-stop-${stop.id || stop.name}`,
            name: stop.name,
            detail: `${dest.name}, ${dest.state || "Karnataka"}${stop.distance ? ` • ${stop.distance}` : ""}`,
            type: "attraction",
            icon: "",
            distance: stop.distance,
            raw: stop,
          });
        }
      });
    }
  });

  return results.slice(0, 5);
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
 * Search places combining local dataset with live Maps API
 * @param {string} query Search input
 * @param {object} options Options { signal, isPickup }
 */
export async function searchPlaces(query = "", options = {}) {
  const q = (query || "").trim();
  if (!q) {
    return options.isPickup ? POPULAR_BANGALORE_PICKUPS : POPULAR_DESTINATIONS;
  }

  const cacheKey = `${options.isPickup ? "pickup:" : "dest:"}${q.toLowerCase()}`;
  if (placeCache.has(cacheKey)) {
    return placeCache.get(cacheKey);
  }

  // 1. Instant local matches
  const localResults = searchLocalDestinations(q);

  // 2. Live Maps API matches
  let apiResults = [];
  try {
    apiResults = await fetchMapsApiPlaces(q, options.signal);
  } catch {
    apiResults = [];
  }

  // 3. Merge & Deduplicate
  const merged = [...localResults];
  const seenNames = new Set(localResults.map((r) => r.name.toLowerCase().trim()));

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
