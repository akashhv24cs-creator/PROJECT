import { useState, useMemo, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { searchDestinationsAndStops, getAllAvailableStops } from "../../data/destinations.js";
import {
  validateCustomStopAgainstRoute,
  filterAllowedStopsForRoute,
} from "../../services/routeValidation.service.ts";
import DestinationImage from "../common/DestinationImage.jsx";

export default function AddStopSearch({
  selectedStops = [],
  onAddStop,
  onRemoveStop,
  currentDestinationId = "",
  currentDestination,
  pickupLocation = "Bangalore",
  primaryWaypoints = [],
}) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [validationError, setValidationError] = useState("");
  const dropdownRef = useRef(null);

  // Compute active primary route waypoints
  const effectivePrimaryWaypoints = useMemo(() => {
    if (primaryWaypoints && primaryWaypoints.length > 0) {
      return primaryWaypoints;
    }
    const waypoints = [pickupLocation || "Bangalore"];
    if (currentDestination?.name || currentDestinationId) {
      waypoints.push(currentDestination?.name || currentDestinationId);
    }
    return waypoints;
  }, [primaryWaypoints, pickupLocation, currentDestination, currentDestinationId]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Search Results evaluated against planned route
  const searchResults = useMemo(() => {
    const rawStops = !query.trim()
      ? getAllAvailableStops()
      : searchDestinationsAndStops(query);

    // Evaluate each stop against the active route corridor
    const evaluated = rawStops.map((stop) => {
      const validation = validateCustomStopAgainstRoute(stop, effectivePrimaryWaypoints);
      return {
        ...stop,
        isValidForRoute: validation.isValid,
        validationReason: validation.reason,
        distanceToRouteKm: validation.distanceToRouteKm,
      };
    });

    if (!query.trim()) {
      // Prioritize valid route stops on empty search query
      const validStops = evaluated.filter((s) => s.isValidForRoute);
      return validStops.slice(0, 10);
    }

    // Sort matching results: Valid route stops first, then out-of-route matches
    return evaluated.sort((a, b) => {
      if (a.isValidForRoute && !b.isValidForRoute) return -1;
      if (!a.isValidForRoute && b.isValidForRoute) return 1;
      return 0;
    });
  }, [query, effectivePrimaryWaypoints]);

  // Route-aware Quick Add Pills
  const quickPills = useMemo(() => {
    const candidatePills = [
      { id: "srirangapatna", name: "Srirangapatna" },
      { id: "ranganathittu", name: "Ranganathittu" },
      { id: "mysore", name: "Mysore" },
      { id: "coorg", name: "Coorg" },
      { id: "abbey-falls", name: "Abbey Falls" },
      { id: "bylakuppe-temple", name: "Bylakuppe Temple" },
      { id: "hassan", name: "Hassan" },
      { id: "belur", name: "Belur" },
      { id: "halebidu", name: "Halebidu" },
      { id: "chikmagalur", name: "Chikmagalur" },
      { id: "mullayanagiri", name: "Mullayanagiri" },
      { id: "baba-budangiri", name: "Baba Budangiri" },
      { id: "sakleshpur", name: "Sakleshpur" },
      { id: "ooty", name: "Ooty" },
      { id: "doddabetta", name: "Doddabetta" },
      { id: "pykara-lake", name: "Pykara Lake" },
      { id: "wayanad", name: "Wayanad" },
      { id: "banasura-dam", name: "Banasura Dam" },
      { id: "hampi", name: "Hampi" },
      { id: "gokarna", name: "Gokarna" },
      { id: "om-beach", name: "Om Beach" },
    ];

    // Filter to only pills relevant to the active route
    return candidatePills
      .filter((p) => p.id !== currentDestinationId && p.name.toLowerCase() !== String(currentDestinationId).toLowerCase())
      .filter((p) => {
        const check = validateCustomStopAgainstRoute(p, effectivePrimaryWaypoints);
        return check.isValid;
      })
      .slice(0, 8);
  }, [currentDestinationId, effectivePrimaryWaypoints]);

  const isStopSelected = (stopId) => {
    return selectedStops.some(
      (s) => s.id === stopId || s.name.toLowerCase() === String(stopId).toLowerCase()
    );
  };

  const handleSelectStop = (stop) => {
    setValidationError("");

    // Route-Aware Verification
    const validation = validateCustomStopAgainstRoute(stop, effectivePrimaryWaypoints);

    if (!validation.isValid) {
      setValidationError(
        validation.reason ||
          `"${stop.name || stop}" is too far from your selected route. Please choose a nearby stop or a location along your trip.`
      );
      return;
    }

    if (!isStopSelected(stop.id || stop.name)) {
      onAddStop({
        id: stop.id || String(stop.name || stop).toLowerCase().replace(/\s+/g, "-"),
        name: stop.name || stop,
        distance: stop.distance || (validation.distanceToRouteKm ? `~${Math.round(validation.distanceToRouteKm)} km off-route` : "Custom Stop"),
        distanceKm: typeof stop.distanceKm === "number" ? stop.distanceKm : 20,
        category: stop.category || "custom",
        categoryName: stop.categoryName || "Added by You",
        image: stop.image || "/destinations/coorg.jpg",
        alt: stop.alt || `${stop.name || stop}, South India`,
        description: stop.description || "User-added custom stop in your personalized itinerary.",
        parentDestination: stop.parentDestination,
        coordinates: stop.coordinates,
      });
    }

    setQuery("");
    setIsOpen(false);
  };

  return (
    <section id="add-your-own-stop" className="space-y-4">
      {/* Section Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-[#152436] text-slate-700 dark:text-slate-300 text-[11px] font-bold uppercase tracking-wider mb-2">
          <span>Route-Aware Route Builder</span>
        </div>
        <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-charcoal dark:text-white tracking-tight uppercase">
          ADD YOUR OWN STOP
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 font-normal leading-relaxed">
          Add intermediate towns, viewpoint detours, or scenic stops along your{" "}
          <strong className="text-orange">
            {effectivePrimaryWaypoints[0]} → {effectivePrimaryWaypoints[effectivePrimaryWaypoints.length - 1]}
          </strong>{" "}
          trip corridor.
        </p>
      </div>

      {/* Validation Error Notice */}
      {validationError && (
        <div className="p-3.5 sm:p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300 text-xs flex items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 shrink-0 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p className="font-medium">{validationError}</p>
          </div>
          <button
            type="button"
            onClick={() => setValidationError("")}
            className="text-[11px] font-bold underline cursor-pointer shrink-0"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Search Input Box */}
      <div ref={dropdownRef} className="relative">
        <div className="relative flex items-center">
          <div className="absolute left-4 pointer-events-none text-slate-400">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </div>

          <input
            type="text"
            value={query}
            onFocus={() => {
              setIsOpen(true);
              setValidationError("");
            }}
            onChange={(e) => {
              setQuery(e.target.value);
              setIsOpen(true);
              setValidationError("");
            }}
            placeholder="Search stops along your route (e.g. Hassan, Belur, Abbey Falls)..."
            className="w-full pl-12 pr-10 py-3.5 sm:py-4 rounded-2xl bg-white dark:bg-[#0E1A29] border border-[#CBD5E1] dark:border-[#1E2E42] text-charcoal dark:text-white placeholder-slate-400 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-orange shadow-sm transition-all"
          />

          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setIsOpen(false);
                setValidationError("");
              }}
              className="absolute right-3.5 text-slate-400 hover:text-charcoal dark:hover:text-white text-xs p-1 cursor-pointer"
              title="Clear"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Dropdown Results Overlay */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.2 }}
              className="absolute top-full left-0 right-0 z-50 mt-2 bg-white dark:bg-[#0E1A29] rounded-2xl border border-[#E2E8F0] dark:border-[#1E2E42] shadow-2xl overflow-hidden max-h-96 overflow-y-auto"
            >
              <div className="p-3 border-b border-[#E2E8F0] dark:border-[#1E2E42] flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                <span>{query ? `Places matching "${query}"` : "Verified Stops Along Your Route"}</span>
                <span className="font-mono">{searchResults.length} places</span>
              </div>

              {searchResults.length === 0 ? (
                <div className="p-6 text-center text-slate-500 dark:text-slate-400 space-y-2">
                  <p className="text-xs">No matching verified stops found for "{query}".</p>
                  <button
                    type="button"
                    onClick={() => {
                      handleSelectStop({
                        id: query.toLowerCase().replace(/\s+/g, "-"),
                        name: query,
                        distance: "Custom Location",
                        categoryName: "Added by You",
                        image: "/destinations/coorg.jpg",
                        alt: query,
                        description: `Custom outstation stop along your route.`,
                      });
                    }}
                    className="px-4 py-2 rounded-xl bg-orange text-white font-bold text-xs shadow-sm cursor-pointer"
                  >
                    Check & Add "{query}"
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-[#E2E8F0] dark:divide-[#1E2E42]">
                  {searchResults.map((item) => {
                    const added = isStopSelected(item.id);
                    const isValid = item.isValidForRoute;

                    return (
                      <div
                        key={item.id}
                        className={`p-3 sm:p-4 flex items-center justify-between gap-3 transition-colors ${
                          isValid
                            ? "hover:bg-slate-50 dark:hover:bg-[#152436]"
                            : "bg-slate-50/50 dark:bg-[#07111F]/50 opacity-75"
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {/* Image Thumbnail */}
                          <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-slate-200 dark:border-white/10 bg-slate-900">
                            <DestinationImage
                              src={item.image}
                              alt={item.alt || item.name}
                              aspectRatio="aspect-square"
                            />
                          </div>

                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <h4 className="font-heading font-bold text-sm text-charcoal dark:text-white truncate">
                                {item.name}
                              </h4>
                              {isValid ? (
                                <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold">
                                  Along Route
                                </span>
                              ) : (
                                <span className="text-[10px] px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 font-medium">
                                  Outside Corridor
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                              {item.type} {item.distance ? `· ${item.distance}` : ""}
                            </p>
                          </div>
                        </div>

                        {/* Add Button / Action */}
                        <div className="shrink-0">
                          {added ? (
                            <span className="px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-heading font-bold text-xs inline-flex items-center gap-1">
                              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              </svg>
                              <span>Added</span>
                            </span>
                          ) : isValid ? (
                            <button
                              type="button"
                              onClick={() => handleSelectStop(item)}
                              className="px-3.5 py-1.5 rounded-xl bg-orange hover:bg-orangeLight text-white font-heading font-bold text-xs shadow-sm transition-all inline-flex items-center gap-1 cursor-pointer"
                            >
                              <span>+ Add</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                setValidationError(
                                  item.validationReason ||
                                    `"${item.name}" is not on your selected route. Custom stops must be along the trip corridor.`
                                );
                              }}
                              className="px-3 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-heading font-medium text-xs cursor-pointer hover:bg-amber-500/20 hover:text-amber-600 transition-all"
                              title="Click for details"
                            >
                              <span>Off Route</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Quick Add Pills */}
      {quickPills.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap pt-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Nearby on Route:
          </span>
          {quickPills.map((pill) => {
            const added = isStopSelected(pill.id);
            const allStops = getAllAvailableStops();
            const match = allStops.find((s) => s.id === pill.id) || {
              id: pill.id,
              name: pill.name,
              image: `/destinations/${pill.id}.jpg`,
              categoryName: "Nearby Stop",
            };

            return (
              <button
                key={pill.id}
                type="button"
                onClick={() => (added ? onRemoveStop(pill.id) : handleSelectStop(match))}
                className={`px-3 py-1 rounded-xl text-xs font-heading font-semibold transition-all duration-200 inline-flex items-center gap-1 cursor-pointer ${
                  added
                    ? "bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
                    : "bg-white dark:bg-[#0E1A29] text-slate-600 dark:text-slate-300 hover:text-charcoal dark:hover:text-white border border-[#E2E8F0] dark:border-[#1E2E42] hover:border-orange/50"
                }`}
              >
                {added ? (
                  <svg className="w-3 h-3 text-emerald-600 dark:text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <span>+</span>
                )}
                <span>{pill.name}</span>
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
}
