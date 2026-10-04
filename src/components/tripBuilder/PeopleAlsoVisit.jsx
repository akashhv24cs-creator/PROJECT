import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import DestinationImage from "../common/DestinationImage.jsx";

export default function PeopleAlsoVisit({
  destination,
  recommendations = [],
  selectedStops = [],
  onAddStop,
  onRemoveStop,
  title = "PEOPLE ALSO VISIT",
  subtitle = "Make the most of your journey with places travelers often explore around this destination.",
}) {
  const stopsList = recommendations.length > 0 ? recommendations : destination?.nearbyStops || [];
  const [activeCategory, setActiveCategory] = useState("all");

  // Extract unique categories present in these recommendations
  const availableCategories = useMemo(() => {
    const map = new Map();
    map.set("all", "All Suggestions");

    stopsList.forEach((stop) => {
      if (stop.category && stop.categoryName) {
        map.set(stop.category, stop.categoryName);
      }
    });

    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [stopsList]);

  // Filter stops by active category
  const filteredStops = useMemo(() => {
    if (activeCategory === "all") return stopsList;
    return stopsList.filter((s) => s.category === activeCategory);
  }, [stopsList, activeCategory]);

  const [previewStop, setPreviewStop] = useState(null);

  const isStopSelected = (stopId) => {
    return selectedStops.some((s) => s.id === stopId || s.name.toLowerCase() === stopId.toLowerCase());
  };

  if (!stopsList || stopsList.length === 0) {
    return null;
  }

  return (
    <section id="people-also-visit" className="space-y-5">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange/10 border border-orange/20 text-orange text-[11px] font-bold uppercase tracking-wider mb-2">
            <span>Optional Suggestions</span>
          </div>
          <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-charcoal dark:text-white tracking-tight uppercase">
            {title}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 font-normal leading-relaxed max-w-2xl">
            {subtitle}
          </p>
        </div>

        <div className="text-xs text-slate-500 dark:text-slate-400 font-medium shrink-0">
          <span className="text-orange font-bold font-mono">{selectedStops.length}</span> stop{selectedStops.length === 1 ? "" : "s"} added
        </div>
      </div>

      {/* Category Filter Pills & Drag Helper */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
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

        <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-[#152436] text-[11px] font-medium text-slate-500 dark:text-slate-400">
          <span>Click card to inspect or <strong>+ Add</strong></span>
        </div>
      </div>

      {/* Recommendations Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
        <AnimatePresence mode="popLayout">
          {filteredStops.map((stop) => {
            const added = isStopSelected(stop.id);

            return (
              <motion.div
                key={stop.id}
                layout
                draggable={!added}
                onDragStart={(e) => {
                  if (added) return;
                  e.dataTransfer.setData("application/json", JSON.stringify(stop));
                  e.dataTransfer.setData("text/plain", stop.name);
                  e.dataTransfer.effectAllowed = "copy";
                }}
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.25 }}
                onClick={() => setPreviewStop(stop)}
                className={`flex flex-col justify-between rounded-2xl border transition-all duration-200 overflow-hidden bg-white dark:bg-[#0E1A29] cursor-pointer group ${
                  added
                    ? "border-orange/60 dark:border-orange/50 shadow-md ring-1 ring-orange/30"
                    : "border-[#E2E8F0] dark:border-[#1E2E42] hover:border-orange/40 shadow-xs hover:shadow-lg"
                }`}
              >
                {/* Thumbnail Image with Accurate Landmark Representation */}
                <div className="relative overflow-hidden aspect-[16/10] bg-slate-900">
                  <DestinationImage
                    src={stop.image}
                    alt={stop.alt || `${stop.name}, South India`}
                    aspectRatio="aspect-auto"
                    className="w-full h-full"
                    imgClassName="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent pointer-events-none" />

                  {/* Distance Badge */}
                  {stop.distance && (
                    <div className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white font-mono text-[10px] font-semibold flex items-center gap-1 shadow-sm">
                      <svg className="w-3 h-3 text-orangeLight" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 16 14" />
                      </svg>
                      <span>{stop.distance}</span>
                    </div>
                  )}

                  {/* Category Pill */}
                  {stop.categoryName && (
                    <div className="absolute top-2.5 right-2.5 px-2.5 py-0.5 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white font-medium text-[10px] shadow-xs">
                      {stop.categoryName}
                    </div>
                  )}

                  {/* Place Name */}
                  <div className="absolute bottom-2.5 left-3 right-3 text-white pointer-events-none">
                    <h3 className="font-heading font-bold text-base sm:text-lg leading-tight drop-shadow-sm group-hover:text-orangeLight transition-colors">
                      {stop.name}
                    </h3>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
                    {stop.description}
                  </p>

                  {/* Highlights Checklist */}
                  {stop.highlights && stop.highlights.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {stop.highlights.slice(0, 2).map((h, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-md bg-[#F5F7FA] dark:bg-[#152436] text-slate-600 dark:text-slate-300 text-[10px] font-medium border border-[#E2E8F0] dark:border-[#1E2E42]"
                        >
                          • {h}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="pt-3 border-t border-[#E2E8F0] dark:border-[#1E2E42] flex items-center justify-between">
                    <span className="text-[11px] text-slate-400 font-medium">
                      {added ? "Included in journey" : "Optional suggestion"}
                    </span>

                    {added ? (
                      <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                        <span className="px-2.5 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-heading font-bold inline-flex items-center gap-1">
                          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                          <span>Added</span>
                        </span>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onRemoveStop(stop.id);
                          }}
                          className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-[#152436] text-slate-500 hover:text-red-500 text-xs font-semibold transition-colors cursor-pointer"
                          title="Remove stop"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onAddStop(stop);
                        }}
                        className="px-3.5 py-1.5 rounded-xl bg-orange hover:bg-orangeLight active:scale-[0.98] text-white font-heading font-bold text-xs shadow-sm transition-all inline-flex items-center gap-1.5 cursor-pointer"
                      >
                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <line x1="12" y1="5" x2="12" y2="19" />
                          <line x1="5" y1="12" x2="19" y2="12" />
                        </svg>
                        <span>+ Add Stop</span>
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Stop Details Preview Modal */}
      <AnimatePresence>
        {previewStop && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/65 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-lg bg-white dark:bg-[#0E1A29] rounded-3xl border border-[#E2E8F0] dark:border-[#1E2E42] shadow-2xl overflow-hidden flex flex-col max-h-[85vh] z-10"
            >
              {/* Modal Image Header */}
              <div className="relative aspect-[16/10] overflow-hidden bg-slate-900 shrink-0">
                <DestinationImage
                  src={previewStop.image}
                  alt={previewStop.alt || previewStop.name}
                  aspectRatio="aspect-auto"
                  className="w-full h-full"
                  imgClassName="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent pointer-events-none" />

                <button
                  type="button"
                  onClick={() => setPreviewStop(null)}
                  className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/60 backdrop-blur-md text-white hover:bg-orange flex items-center justify-center text-sm transition-colors cursor-pointer"
                  title="Close"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>

                <div className="absolute bottom-3 left-4 right-4 text-white">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-orangeLight font-bold block">
                    {previewStop.distance || "Nearby Attraction"} · {previewStop.categoryName || "Attraction"}
                  </span>
                  <h3 className="font-heading font-extrabold text-xl sm:text-2xl drop-shadow-sm leading-tight">
                    {previewStop.name}
                  </h3>
                </div>
              </div>

              {/* Modal Content Body */}
              <div className="p-5 sm:p-6 overflow-y-auto space-y-4 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                <p className="leading-relaxed">
                  {previewStop.description}
                </p>

                {/* Highlights List */}
                {previewStop.highlights && previewStop.highlights.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-[#E2E8F0] dark:border-[#1E2E42]">
                    <h4 className="font-heading font-bold text-charcoal dark:text-white uppercase tracking-wider text-xs">
                      Key Highlights & Landmarks
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {previewStop.highlights.map((h, i) => (
                        <div key={i} className="flex items-center gap-2 p-2 rounded-xl bg-[#F5F7FA] dark:bg-[#152436] border border-[#E2E8F0] dark:border-[#1E2E42] text-xs">
                          <span className="text-orange font-bold">•</span>
                          <span>{h}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Attribution & Verified Source */}
                {previewStop.imageSource && (
                  <div className="pt-2 text-[11px] text-slate-400 flex items-center justify-between">
                    <span>Photo source: {previewStop.imageSource} ({previewStop.imageCredit || "Verified"})</span>
                    <span>{previewStop.imageLicense || "CC BY-SA"}</span>
                  </div>
                )}
              </div>

              {/* Modal Footer CTA */}
              <div className="p-4 sm:p-5 border-t border-[#E2E8F0] dark:border-[#1E2E42] bg-[#F5F7FA] dark:bg-[#0A1420] flex items-center justify-between shrink-0">
                <button
                  type="button"
                  onClick={() => setPreviewStop(null)}
                  className="px-4 py-2 rounded-xl bg-white dark:bg-[#152436] border border-[#E2E8F0] dark:border-[#1E2E42] text-slate-600 dark:text-slate-300 font-bold text-xs cursor-pointer"
                >
                  Close
                </button>

                {isStopSelected(previewStop.id) ? (
                  <button
                    type="button"
                    onClick={() => {
                      onRemoveStop(previewStop.id);
                      setPreviewStop(null);
                    }}
                    className="px-5 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-heading font-bold text-xs shadow-md transition-colors cursor-pointer"
                  >
                    Remove from Trip
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      onAddStop(previewStop);
                      setPreviewStop(null);
                    }}
                    className="px-5 py-2.5 rounded-xl bg-orange hover:bg-orangeLight text-white font-heading font-bold text-xs shadow-md shadow-orange/25 transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <span>+ Add to Trip Planner</span>
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
