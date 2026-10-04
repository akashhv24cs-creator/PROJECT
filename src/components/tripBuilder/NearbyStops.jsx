import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function NearbyStops({
  destination,
  selectedStops = [],
  onAddStop,
  onRemoveStop,
}) {
  const nearbyStops = destination?.nearbyStops || [];
  const [activeCategory, setActiveCategory] = useState("all");

  // Extract unique categories present in this destination's nearby stops
  const availableCategories = useMemo(() => {
    const map = new Map();
    map.set("all", "All Stops");

    nearbyStops.forEach((stop) => {
      if (stop.category && stop.categoryName) {
        map.set(stop.category, stop.categoryName);
      }
    });

    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [nearbyStops]);

  // Filter stops by active category
  const filteredStops = useMemo(() => {
    if (activeCategory === "all") return nearbyStops;
    return nearbyStops.filter((s) => s.category === activeCategory);
  }, [nearbyStops, activeCategory]);

  const isStopSelected = (stopId) => {
    return selectedStops.some((s) => s.id === stopId);
  };

  if (!nearbyStops || nearbyStops.length === 0) {
    return null;
  }

  return (
    <section id="nearby-stops" className="space-y-6">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange/10 border border-orange/20 text-orange text-xs font-semibold mb-2">
            <span>Smart Trip Stops</span>
          </div>
          <h2 className="font-heading font-bold text-2xl sm:text-3xl text-charcoal dark:text-white tracking-tight">
            Explore Nearby Stops
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 font-normal leading-relaxed">
            Personalize your journey by adding places around <strong className="text-charcoal dark:text-white">{destination.name}</strong>.
          </p>
        </div>

        <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
          <span className="text-orange font-bold font-mono">{selectedStops.length}</span> of {nearbyStops.length} stops added
        </div>
      </div>

      {/* Category Filter Pills (Horizontal Scroll on Mobile) */}
      {availableCategories.length > 2 && (
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1 -mx-2 px-2 sm:mx-0 sm:px-0">
          {availableCategories.map((cat) => {
            const isActive = activeCategory === cat.id;

            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-heading font-semibold transition-all duration-200 shrink-0 cursor-pointer ${
                  isActive
                    ? "bg-orange text-white shadow-sm"
                    : "bg-white dark:bg-[#0E1A29] text-slate-600 dark:text-slate-300 hover:text-charcoal dark:hover:text-white border border-[#E2E8F0] dark:border-[#1E2E42]"
                }`}
              >
                <span>{cat.name}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Stops Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
        <AnimatePresence mode="popLayout">
          {filteredStops.map((stop) => {
            const added = isStopSelected(stop.id);

            return (
              <motion.div
                key={stop.id}
                layout
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.25 }}
                className={`flex flex-col justify-between rounded-2xl border transition-all duration-200 overflow-hidden bg-white dark:bg-[#0E1A29] ${
                  added
                    ? "border-orange/60 dark:border-orange/50 shadow-md ring-1 ring-orange/30"
                    : "border-[#E2E8F0] dark:border-[#1E2E42] hover:border-orange/30 shadow-xs"
                }`}
              >
                {/* Thumbnail Image with Distance Badge */}
                <div className="relative aspect-[16/9] overflow-hidden bg-slate-200 dark:bg-[#152436]">
                  <img
                    src={stop.image}
                    alt={stop.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                  {/* Distance Badge */}
                  <div className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full bg-black/50 backdrop-blur-md border border-white/20 text-white font-mono text-[10px] font-semibold flex items-center gap-1">
                    <svg className="w-3 h-3 text-orangeLight" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                    <span>{stop.distance}</span>
                  </div>

                  {/* Category Pill */}
                  <div className="absolute top-2.5 right-2.5 px-2.5 py-0.5 rounded-full bg-white/90 dark:bg-[#0E1A29]/90 text-charcoal dark:text-white font-medium text-[10px] shadow-xs">
                    {stop.categoryName}
                  </div>

                  {/* Stop Name */}
                  <div className="absolute bottom-2.5 left-3 right-3 text-white">
                    <h3 className="font-heading font-bold text-base sm:text-lg leading-tight drop-shadow-sm">
                      {stop.name}
                    </h3>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
                    {stop.description}
                  </p>

                  {/* Key Highlights */}
                  {stop.highlights && stop.highlights.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {stop.highlights.slice(0, 2).map((h, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-[#152436] text-slate-600 dark:text-slate-300 text-[10px] font-medium"
                        >
                          • {h}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Add / Remove Action Button */}
                  <div className="pt-3 border-t border-[#E2E8F0] dark:border-[#1E2E42] flex items-center justify-between">
                    <span className="text-[11px] text-slate-400 font-medium">
                      {added ? "Added to your route" : "Optional road stop"}
                    </span>

                    {added ? (
                      <div className="flex items-center gap-1.5">
                        <span className="px-2.5 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-heading font-bold inline-flex items-center gap-1">
                          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                          <span>Added</span>
                        </span>

                        <button
                          type="button"
                          onClick={() => onRemoveStop(stop.id)}
                          className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-[#152436] text-slate-500 hover:text-red-500 text-xs font-semibold transition-colors cursor-pointer"
                          title="Remove stop"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => onAddStop(stop)}
                        className="px-3.5 py-1.5 rounded-xl bg-orange hover:bg-orangeLight active:scale-[0.98] text-white font-heading font-bold text-xs shadow-sm transition-all inline-flex items-center gap-1.5 cursor-pointer"
                      >
                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <line x1="12" y1="5" x2="12" y2="19" />
                          <line x1="5" y1="12" x2="19" y2="12" />
                        </svg>
                        <span>Add Stop</span>
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </section>
  );
}
