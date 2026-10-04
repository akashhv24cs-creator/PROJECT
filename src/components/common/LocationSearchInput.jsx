import { useState, useEffect, useRef, useCallback } from "react";
import { searchPlaces } from "../../services/places.service";

/**
 * Interactive Place Autocomplete Input Component
 * Uses live Maps Geocoding API + curated destinations dataset.
 * Dropdown opens as soon as the user focuses or begins typing.
 */
export default function LocationSearchInput({
  value = "",
  onChange,
  onSelect,
  placeholder = "Search place or city...",
  label = "",
  id = "place-input",
  required = false,
  isPickup = false,
  className = "",
  inputClassName = "",
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const abortControllerRef = useRef(null);
  const debounceTimerRef = useRef(null);

  // Fetch suggestions
  const fetchSuggestions = useCallback(
    async (query) => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();

      setIsLoading(true);
      try {
        const results = await searchPlaces(query, {
          isPickup,
          signal: abortControllerRef.current.signal,
        });
        setSuggestions(results);
      } catch (err) {
        if (err.name !== "AbortError") {
          console.warn("SAFE DIAGNOSTIC — Places search error:", err);
        }
      } finally {
        setIsLoading(false);
      }
    },
    [isPickup]
  );

  // Trigger search on value change
  const handleInputChange = (e) => {
    const val = e.target.value;
    onChange(val);
    setIsOpen(true);
    setHighlightedIndex(-1);

    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(() => {
      fetchSuggestions(val);
    }, 180);
  };

  // On Focus, open dropdown with instant suggestions
  const handleFocus = () => {
    setIsOpen(true);
    fetchSuggestions(value);
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  // Keyboard navigation
  const handleKeyDown = (e) => {
    if (!isOpen || suggestions.length === 0) {
      if (e.key === "ArrowDown") {
        setIsOpen(true);
        fetchSuggestions(value);
      }
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1));
    } else if (e.key === "Enter") {
      if (highlightedIndex >= 0 && highlightedIndex < suggestions.length) {
        e.preventDefault();
        handleSelectSuggestion(suggestions[highlightedIndex]);
      }
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  const handleSelectSuggestion = (item) => {
    const selectedName = item.name;
    onChange(selectedName);
    if (onSelect) {
      onSelect(item);
    }
    setIsOpen(false);
    setHighlightedIndex(-1);
  };

  const handleClear = () => {
    onChange("");
    setSuggestions([]);
    if (inputRef.current) inputRef.current.focus();
    fetchSuggestions("");
  };

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      {label && (
        <label
          htmlFor={id}
          className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1.5"
        >
          {label}
        </label>
      )}

      <div className="relative">
        {/* Left Pin Icon */}
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-orange">
          {isPickup ? (
            <svg
              className="w-4 h-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 2a8 8 0 0 0-8 8c0 5.25 8 12 8 12s8-6.75 8-12a8 8 0 0 0-8-8z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
          ) : (
            <svg
              className="w-4 h-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
          )}
        </div>

        {/* Input Field */}
        <input
          ref={inputRef}
          id={id}
          type="text"
          value={value}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          required={required}
          autoComplete="off"
          className={`w-full bg-[#F5F7FA] dark:bg-[#0A1420] border border-[#E2E8F0] dark:border-[#1E2E42] rounded-xl pl-10 pr-9 py-3.5 text-charcoal dark:text-white text-xs sm:text-sm font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange focus:border-orange transition-all ${inputClassName}`}
        />

        {/* Right Action Icons: Spinner or Clear Button */}
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center gap-1.5">
          {isLoading && (
            <div className="w-3.5 h-3.5 border-2 border-orange border-t-transparent rounded-full animate-spin" />
          )}
          {value && (
            <button
              type="button"
              onClick={handleClear}
              className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700 hover:bg-orange hover:text-white text-slate-500 dark:text-slate-300 text-xs flex items-center justify-center transition-colors cursor-pointer"
              title="Clear input"
            >
              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-white dark:bg-[#0E1A29] border border-[#E2E8F0] dark:border-[#1E2E42] rounded-2xl shadow-2xl max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60 animate-in fade-in slide-in-from-top-2 duration-150">
          
          {/* Header pill */}
          <div className="px-3.5 py-2 bg-slate-50 dark:bg-[#0A1420] text-[10px] font-heading font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-400 flex items-center justify-between">
            <span>{value.trim() ? "Maps Suggestions" : isPickup ? "Popular Pickup Spots" : "Popular Destinations"}</span>
            <span className="text-[9px] font-normal text-slate-400">Powered by Maps</span>
          </div>

          {/* Results List */}
          {suggestions.length > 0 ? (
            suggestions.map((item, idx) => {
              const isHighlighted = idx === highlightedIndex;

              return (
                <div
                  key={item.id || idx}
                  onClick={() => handleSelectSuggestion(item)}
                  onMouseEnter={() => setHighlightedIndex(idx)}
                  className={`px-3.5 py-2.5 flex items-center justify-between gap-3 cursor-pointer transition-colors ${
                    isHighlighted
                      ? "bg-orange/10 text-orange dark:bg-orange/15"
                      : "hover:bg-slate-50 dark:hover:bg-slate-800/40 text-charcoal dark:text-white"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <svg className="w-4 h-4 text-orange shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <div className="min-w-0">
                      <p className="font-heading font-bold text-xs sm:text-sm truncate">
                        {item.name}
                      </p>
                      {item.detail && (
                        <p className="text-[10px] sm:text-[11px] text-slate-400 dark:text-slate-400 truncate">
                          {item.detail}
                        </p>
                      )}
                    </div>
                  </div>

                  {item.distance && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-orange/10 text-orange shrink-0">
                      {item.distance}
                    </span>
                  )}
                </div>
              );
            })
          ) : (
            <div className="px-4 py-4 text-center text-xs text-slate-400 dark:text-slate-400">
              {isLoading ? "Searching Maps..." : "No matching places found. Try typing a city or landmark."}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
