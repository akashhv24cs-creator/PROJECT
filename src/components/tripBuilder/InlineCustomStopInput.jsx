import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  searchDestinationsAndStops,
  getAllAvailableStops,
} from "../../data/destinations.js";
import {
  validateCustomStopAgainstRoute,
  filterAllowedStopsForRoute,
} from "../../services/routeValidation.service";

/**
 * InlineCustomStopInput
 * 
 * Renders an inline custom stop slot directly inside the Journey / Itinerary timeline.
 * Features:
 * - Instant automatic focus on mount
 * - Route-aware search suggestions with Along Route / Outside Corridor badges
 * - Keyboard navigation (Arrow keys, Enter, Escape)
 * - Safe validation against route corridor before adding
 * - Cancel / Dismiss action
 */
export default function InlineCustomStopInput({
  slotLetter = "C",
  primaryWaypoints = [],
  currentDestination,
  pickupLocation = "Bangalore",
  existingStops = [],
  onSelectStop,
  onCancel,
  className = "",
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [validationError, setValidationError] = useState("");
  const inputRef = useRef(null);
  const containerRef = useRef(null);

  // Auto-focus input immediately upon mount
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // Compute effective primary route waypoints
  const effectivePrimaryWaypoints =
    primaryWaypoints && primaryWaypoints.length > 0
      ? primaryWaypoints
      : [
          pickupLocation || "Bangalore",
          typeof currentDestination === "object"
            ? currentDestination?.name
            : currentDestination || "Destination",
        ];

  // Existing stop IDs & names to avoid duplicates
  const existingStopIds = new Set(
    existingStops.map((s) => (s.id || s.name || "").toLowerCase())
  );

  // Quick route-allowed recommendation suggestions when query is empty
  const [quickRecommendations, setQuickRecommendations] = useState([]);
  useEffect(() => {
    const allStops = getAllAvailableStops();
    const allowed = filterAllowedStopsForRoute(
      allStops,
      effectivePrimaryWaypoints
    ).filter(
      (s) =>
        !existingStopIds.has((s.id || s.name || "").toLowerCase()) &&
        s.name?.toLowerCase() !==
          (typeof currentDestination === "object"
            ? currentDestination?.name?.toLowerCase()
            : currentDestination?.toLowerCase())
    );
    setQuickRecommendations(allowed.slice(0, 4));
  }, [currentDestination, primaryWaypoints, existingStops]);

  // Search & route-annotate suggestions when query changes
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setHighlightedIndex(-1);
      return;
    }

    const matched = searchDestinationsAndStops(query);
    const annotated = matched.map((item) => {
      const check = validateCustomStopAgainstRoute(
        item,
        effectivePrimaryWaypoints
      );
      const isAlreadyAdded = existingStopIds.has(
        (item.id || item.name || "").toLowerCase()
      );
      return {
        ...item,
        isValid: check.isValid,
        reason: check.reason,
        distanceToRouteKm: check.distanceToRouteKm,
        isAlreadyAdded,
      };
    });

    // Sort: Valid route stops first, then alphabetically
    annotated.sort((a, b) => {
      if (a.isValid && !b.isValid) return -1;
      if (!a.isValid && b.isValid) return 1;
      return 0;
    });

    setResults(annotated.slice(0, 7));
    setHighlightedIndex(annotated.findIndex((r) => r.isValid && !r.isAlreadyAdded));
  }, [query, effectivePrimaryWaypoints, existingStops]);

  const handleSelect = (item) => {
    setValidationError("");

    // Validate stop against route corridor
    const check = validateCustomStopAgainstRoute(
      item,
      effectivePrimaryWaypoints
    );

    if (!check.isValid) {
      setValidationError(
        check.reason ||
          `"${item.name || item}" is outside your selected route corridor. Please choose a nearby or route-relevant stop.`
      );
      return;
    }

    if (existingStopIds.has((item.id || item.name || "").toLowerCase())) {
      setValidationError(`"${item.name}" is already in your itinerary.`);
      return;
    }

    if (onSelectStop) {
      onSelectStop({
        id: item.id || `stop-${Date.now()}`,
        name: item.name,
        image: item.image,
        alt: item.alt || item.name,
        distance: item.distance || (check.distanceToRouteKm ? `${Math.round(check.distanceToRouteKm)} km off route` : "En-route"),
        categoryName: item.categoryName || item.type || "Custom Stop",
        isPrimary: false,
      });
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Escape") {
      e.preventDefault();
      if (onCancel) onCancel();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (results.length > 0) {
        setHighlightedIndex((prev) => (prev + 1) % results.length);
      }
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (results.length > 0) {
        setHighlightedIndex((prev) =>
          prev <= 0 ? results.length - 1 : prev - 1
        );
      }
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (
        highlightedIndex >= 0 &&
        highlightedIndex < results.length &&
        results[highlightedIndex]
      ) {
        handleSelect(results[highlightedIndex]);
      } else if (query.trim()) {
        // Free-text input validation
        handleSelect({
          id: query.trim().toLowerCase().replace(/[^a-z0-9]/g, "-"),
          name: query.trim(),
          type: "Custom Stop",
        });
      }
    }
  };

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0, y: -8, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -6, scale: 0.98 }}
      transition={{ duration: 0.2 }}
      className={`flex items-start gap-2.5 sm:gap-3 w-full min-w-0 ${className}`}
    >
      {/* Timeline Badge */}
      <div className="flex flex-col items-center shrink-0">
        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-orange/15 border-2 border-orange text-orange flex items-center justify-center font-heading font-extrabold text-xs shadow-sm shrink-0 ring-4 ring-orange/10 animate-pulse">
          {slotLetter}
        </div>
        <div className="w-0.5 h-6 bg-slate-300 dark:bg-[#1E2E42] my-1" />
      </div>

      {/* Inline Slot Container */}
      <div className="flex-1 min-w-0 p-3.5 rounded-2xl bg-white dark:bg-[#0E1A29] border-2 border-orange shadow-lg shadow-orange/10 space-y-3 relative">
        
        {/* Slot Header with Badge & Cancel Button */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-orange animate-ping" />
            <span className="text-[10px] sm:text-[11px] font-heading font-extrabold uppercase tracking-wider text-orange block">
              ADD CUSTOM STOP
            </span>
          </div>

          <button
            type="button"
            onClick={onCancel}
            className="text-[11px] font-heading font-bold text-slate-400 hover:text-red-500 transition-colors flex items-center gap-1 cursor-pointer px-1.5 py-0.5 rounded-md hover:bg-red-500/10"
            title="Cancel adding stop (Esc)"
          >
            <span>Cancel</span>
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Search Input Bar */}
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setValidationError("");
            }}
            onKeyDown={handleKeyDown}
            placeholder="Search nearby stop (e.g. Hassan, Belur, Mullayanagiri)..."
            className="w-full pl-8 pr-8 py-2 rounded-xl bg-[#F5F7FA] dark:bg-[#07111F] border border-[#E2E8F0] dark:border-[#1E2E42] text-xs font-semibold text-charcoal dark:text-white placeholder-slate-400 focus:outline-none focus:border-orange focus:ring-2 focus:ring-orange/20 transition-all"
            aria-label="Search custom stop"
          />

          <svg
            className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>

          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setValidationError("");
                inputRef.current?.focus();
              }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-charcoal dark:hover:text-white text-xs cursor-pointer"
            >
              ✕
            </button>
          )}
        </div>

        {/* Validation Rejection Alert */}
        {validationError && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-[11px] flex items-start gap-2"
          >
            <svg className="w-4 h-4 shrink-0 text-rose-500 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p className="font-medium leading-snug">{validationError}</p>
          </motion.div>
        )}

        {/* Quick Add Route Pills (Shown when input is empty) */}
        {!query && quickRecommendations.length > 0 && (
          <div className="space-y-1.5 pt-0.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block font-heading">
              Quick Suggestions Along Route:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {quickRecommendations.map((rec) => (
                <button
                  key={rec.id}
                  type="button"
                  onClick={() => handleSelect(rec)}
                  className="px-2.5 py-1 rounded-lg bg-[#F5F7FA] dark:bg-[#152436] hover:bg-orange/10 hover:text-orange hover:border-orange/40 border border-[#E2E8F0] dark:border-[#1E2E42] text-[11px] font-heading font-bold text-charcoal dark:text-slate-200 transition-all flex items-center gap-1 cursor-pointer"
                >
                  <span>+ {rec.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Autocomplete Suggestions List */}
        {query && results.length > 0 && (
          <div className="border border-[#E2E8F0] dark:border-[#1E2E42] rounded-xl overflow-hidden divide-y divide-slate-100 dark:divide-[#1E2E42] max-h-56 overflow-y-auto bg-white dark:bg-[#07111F]">
            {results.map((item, idx) => {
              const isHighlighted = idx === highlightedIndex;

              return (
                <div
                  key={item.id || idx}
                  onClick={() => !item.isAlreadyAdded && handleSelect(item)}
                  onMouseEnter={() => setHighlightedIndex(idx)}
                  className={`p-2.5 flex items-center justify-between gap-2.5 transition-colors cursor-pointer ${
                    isHighlighted
                      ? "bg-orange/10 dark:bg-orange/15"
                      : "hover:bg-slate-50 dark:hover:bg-[#152436]"
                  } ${item.isAlreadyAdded ? "opacity-50 cursor-default" : ""}`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <strong className="font-heading font-bold text-xs text-charcoal dark:text-white truncate block">
                        {item.name}
                      </strong>
                      {item.isValid ? (
                        <span className="px-1.5 py-0.2 rounded bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold text-[9px] uppercase tracking-wider shrink-0">
                          Along Route
                        </span>
                      ) : (
                        <span className="px-1.5 py-0.2 rounded bg-rose-500/15 text-rose-600 dark:text-rose-400 font-bold text-[9px] uppercase tracking-wider shrink-0">
                          Outside Corridor
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-400 block truncate">
                      {item.type || item.categoryName || "Place"} • {item.state || item.parentDestination || "South India"}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!item.isAlreadyAdded) handleSelect(item);
                    }}
                    disabled={item.isAlreadyAdded}
                    className={`px-2.5 py-1 rounded-lg font-heading font-bold text-[10px] shrink-0 uppercase tracking-wider transition-all cursor-pointer ${
                      item.isAlreadyAdded
                        ? "bg-slate-100 dark:bg-[#1E2E42] text-slate-400 cursor-default"
                        : item.isValid
                        ? "bg-orange hover:bg-orangeLight text-white shadow-xs"
                        : "bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400"
                    }`}
                  >
                    {item.isAlreadyAdded ? "Added" : "+ Add"}
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Zero Results State */}
        {query && results.length === 0 && (
          <div className="p-3 text-center text-xs text-slate-400 space-y-1">
            <p>No verified spots found matching "{query}".</p>
            <p className="text-[10px] text-slate-500">
              Press Enter to add "{query}" or pick from suggested stops.
            </p>
          </div>
        )}

        {/* Keyboard Helper Footer */}
        <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-100 dark:border-[#1E2E42]/60">
          <span>Press <strong>Enter</strong> to add · <strong>Esc</strong> to cancel</span>
        </div>

      </div>
    </motion.div>
  );
}
