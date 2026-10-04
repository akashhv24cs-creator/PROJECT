import { useState, useRef, useEffect } from "react";
import { searchDestinationsAndStops } from "../../../data/destinations";

/**
 * Add Your Own Stop — Destination Search & Direct Addition
 * Allows travelers to search and add any valid destination or spot across India to their custom trip.
 */
export default function AddYourOwnStop({ onAddStop, userStops = [], className = "" }) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState([]);
  const dropdownRef = useRef(null);

  const userStopIds = new Set(userStops.map((s) => s.id));

  useEffect(() => {
    if (query.trim().length > 0) {
      const matched = searchDestinationsAndStops(query);
      setResults(matched.slice(0, 6));
      setIsOpen(true);
    } else {
      setResults([]);
      setIsOpen(false);
    }
  }, [query]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const handleSelect = (item) => {
    onAddStop(item);
    setQuery("");
    setIsOpen(false);
  };

  return (
    <div ref={dropdownRef} className={`relative ${className}`}>
      <div className="flex items-center gap-2 mb-1.5">
        <span className="text-orange text-xs">🔍</span>
        <span className="font-heading font-extrabold text-xs uppercase tracking-wider text-charcoal dark:text-white">
          Add Your Own Stop
        </span>
      </div>

      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.trim().length > 0 && setIsOpen(true)}
          placeholder="Search any destination, temple, peak, or beach..."
          className="w-full pl-9 pr-4 py-2.5 rounded-2xl bg-white dark:bg-[#0E1A29] border border-[#E2E8F0] dark:border-[#1E2E42] text-xs text-charcoal dark:text-white placeholder-slate-400 focus:outline-none focus:border-orange focus:ring-2 focus:ring-orange/20 transition-all"
        />

        <svg
          className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.3-4.3" />
        </svg>

        {query && (
          <button
            type="button"
            onClick={() => setQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-charcoal dark:hover:text-white text-xs"
          >
            ✕
          </button>
        )}
      </div>

      {/* Autocomplete Dropdown */}
      {isOpen && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1.5 bg-white dark:bg-[#0E1A29] rounded-2xl border border-[#E2E8F0] dark:border-[#1E2E42] shadow-2xl overflow-hidden z-30 divide-y divide-slate-100 dark:divide-[#1E2E42] max-h-72 overflow-y-auto">
          {results.map((item) => {
            const isAdded = userStopIds.has(item.id);

            return (
              <div
                key={item.id}
                onClick={() => !isAdded && handleSelect(item)}
                className={`p-3 flex items-center justify-between gap-3 hover:bg-orange/5 dark:hover:bg-[#152436] transition-colors cursor-pointer ${
                  isAdded ? "opacity-60 cursor-default" : ""
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-[#1E2E42] overflow-hidden shrink-0">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                  <div className="min-w-0">
                    <h5 className="font-heading font-bold text-xs text-charcoal dark:text-white truncate">
                      {item.name}
                    </h5>
                    <span className="text-[10px] text-slate-400 block truncate">
                      {item.type} • {item.state || item.parentDestination || "India"}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelect(item);
                  }}
                  disabled={isAdded}
                  className={`px-2.5 py-1 rounded-lg font-heading font-bold text-[10px] shrink-0 transition-colors ${
                    isAdded
                      ? "bg-slate-100 dark:bg-[#1E2E42] text-slate-400 cursor-default"
                      : "bg-orange hover:bg-orangeLight text-white cursor-pointer"
                  }`}
                >
                  {isAdded ? "Added" : "+ Add"}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
