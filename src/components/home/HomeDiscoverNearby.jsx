import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { DESTINATIONS } from "../../data/destinations";
import DestinationImage from "../common/DestinationImage";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" } },
};

export default function HomeDiscoverNearby() {
  const navigate = useNavigate();
  const [selectedDestId, setSelectedDestId] = useState("mysore");

  const currentDest =
    DESTINATIONS.find((d) => d.id === selectedDestId) || DESTINATIONS[0];
  const nearbyStops = currentDest.nearbyStops || [];

  const handleStartTripWithStop = (stopName) => {
    navigate(`/book?destination=${encodeURIComponent(currentDest.name)}&stops=${encodeURIComponent(stopName)}`);
  };

  return (
    <section
      id="discover-nearby"
      className="py-16 sm:py-24 bg-white dark:bg-[#0E1A29] border-b border-[#E2E8F0] dark:border-[#1E2E42] transition-colors duration-200"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-40px" }}
          variants={fadeUp}
          className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 sm:mb-12"
        >
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange/10 border border-orange/20 text-orange text-[11px] font-bold uppercase tracking-wider mb-2">
              <span>Recommendation Engine</span>
            </div>
            <h2 className="font-heading font-extrabold text-3xl sm:text-4xl lg:text-5xl text-charcoal dark:text-white tracking-tight uppercase">
              PEOPLE ALSO VISIT
            </h2>
            <p className="text-xs sm:text-sm lg:text-base text-slate-600 dark:text-slate-300 mt-1 max-w-2xl font-normal leading-relaxed">
              Make the most of your journey with places travelers often explore around popular destinations. These are suggestions only — choose whatever stops you like!
            </p>
          </div>

          <Link
            to={`/destinations/${currentDest.id}`}
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-heading font-bold text-orange hover:text-orangeLight transition-colors shrink-0"
          >
            <span>Explore {currentDest.name} Guide</span>
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14" />
              <path d="m12 5 7 7-7 7" />
            </svg>
          </Link>
        </motion.div>

        {/* Destination Switcher Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 mb-8">
          {DESTINATIONS.map((dest) => {
            const isSelected = selectedDestId === dest.id;

            return (
              <button
                key={dest.id}
                type="button"
                onClick={() => setSelectedDestId(dest.id)}
                className={`px-4 py-2 rounded-2xl text-xs font-heading font-bold transition-all duration-200 shrink-0 cursor-pointer flex items-center gap-2 ${
                  isSelected
                    ? "bg-orange text-white shadow-md shadow-orange/25"
                    : "bg-[#F5F7FA] dark:bg-[#07111F] text-slate-600 dark:text-slate-300 hover:text-charcoal dark:hover:text-white border border-[#E2E8F0] dark:border-[#1E2E42]"
                }`}
              >
                <span>{dest.name}</span>
                {dest.nearbyStops && (
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono font-semibold ${
                      isSelected
                        ? "bg-white/20 text-white"
                        : "bg-orange/10 text-orange dark:bg-orange/20"
                    }`}
                  >
                    {dest.nearbyStops.length}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Recommendations Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
          <AnimatePresence mode="wait">
            {nearbyStops.slice(0, 4).map((stop) => (
              <motion.div
                key={`${currentDest.id}-${stop.id}`}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.25 }}
                className="group flex flex-col justify-between rounded-3xl bg-[#FFFBF7] dark:bg-[#07111F] border border-[#E2E8F0] dark:border-[#1E2E42] overflow-hidden shadow-sm hover:shadow-xl hover:border-orange/40 transition-all duration-300"
              >
                {/* Thumbnail Image */}
                <div className="relative">
                  <DestinationImage
                    src={stop.image}
                    alt={stop.alt || `${stop.name}, South India`}
                    aspectRatio="aspect-[16/10]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

                  {/* Distance Badge */}
                  {stop.distance && (
                    <div className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full bg-black/50 backdrop-blur-md border border-white/20 text-white font-mono text-[10px] font-semibold flex items-center gap-1 shadow-sm">
                      <svg className="w-3 h-3 text-orangeLight" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 16 14" />
                      </svg>
                      <span>{stop.distance}</span>
                    </div>
                  )}

                  {/* Category Pill */}
                  {stop.categoryName && (
                    <div className="absolute top-2.5 right-2.5 px-2.5 py-0.5 rounded-full bg-white/90 dark:bg-[#0E1A29]/90 text-charcoal dark:text-white font-medium text-[10px] shadow-xs">
                      {stop.categoryName}
                    </div>
                  )}

                  {/* Stop Name */}
                  <div className="absolute bottom-2.5 left-3 right-3 text-white pointer-events-none">
                    <h3 className="font-heading font-bold text-base leading-tight drop-shadow-sm">
                      {stop.name}
                    </h3>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-2 font-normal">
                    {stop.description}
                  </p>

                  {/* Action Buttons */}
                  <div className="pt-3 border-t border-[#E2E8F0] dark:border-[#1E2E42] flex items-center justify-between gap-2">
                    <Link
                      to={`/destinations/${currentDest.id}`}
                      className="text-[11px] font-bold text-slate-500 dark:text-slate-400 hover:text-orange transition-colors"
                    >
                      View Details
                    </Link>

                    <button
                      type="button"
                      onClick={() => handleStartTripWithStop(stop.name)}
                      className="px-3 py-1.5 rounded-xl bg-orange hover:bg-orangeLight text-white font-heading font-bold text-xs shadow-sm transition-all inline-flex items-center gap-1 cursor-pointer"
                    >
                      <span>+ Add to Trip</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

      </div>
    </section>
  );
}
