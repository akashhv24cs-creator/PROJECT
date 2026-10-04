import { motion } from "framer-motion";
import DestinationImage from "../../common/DestinationImage";

/**
 * People Also Visit — Nearby Recommended Stops
 * Suggests authentic nearby attractions for the active destination without restricting the user.
 */
export default function PeopleAlsoVisit({
  destination,
  onAddStop,
  userStops = [],
  className = "",
}) {
  if (!destination || !destination.nearbyStops || destination.nearbyStops.length === 0) {
    return null;
  }

  const nearbyStops = destination.nearbyStops;
  const userStopIds = new Set(userStops.map((s) => s.id));

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-orange text-sm">✨</span>
          <h4 className="font-heading font-extrabold text-sm sm:text-base text-charcoal dark:text-white uppercase tracking-wider">
            People Also Visit Around {destination.name}
          </h4>
        </div>
        <span className="text-[11px] text-slate-400 font-medium hidden sm:inline-block">
          Curated suggestions • Add any stop
        </span>
      </div>

      {/* Horizontal Carousel (Mobile) / Grid (Desktop) */}
      <div className="flex sm:grid sm:grid-cols-3 lg:grid-cols-4 gap-3.5 overflow-x-auto scrollbar-none pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
        {nearbyStops.slice(0, 4).map((stop) => {
          const isAdded = userStopIds.has(stop.id);

          return (
            <motion.div
              key={stop.id}
              whileHover={{ y: -3 }}
              transition={{ duration: 0.2 }}
              className="w-[240px] sm:w-auto shrink-0 bg-white dark:bg-[#0E1A29] rounded-2xl border border-[#E2E8F0] dark:border-[#1E2E42] overflow-hidden shadow-xs hover:shadow-md hover:border-orange/40 transition-all flex flex-col justify-between"
            >
              {/* Thumbnail */}
              <div className="relative aspect-[16/10] overflow-hidden bg-slate-100 dark:bg-[#152436]">
                <DestinationImage
                  src={stop.image}
                  alt={stop.alt || stop.name}
                  aspectRatio="aspect-auto"
                  className="w-full h-full"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent pointer-events-none" />

                {stop.distance && (
                  <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-white font-mono text-[9px] font-semibold">
                    📍 {stop.distance}
                  </span>
                )}

                <div className="absolute bottom-2 left-2.5 right-2.5 text-white pointer-events-none">
                  <h5 className="font-heading font-bold text-xs leading-tight drop-shadow-sm">
                    {stop.name}
                  </h5>
                </div>
              </div>

              {/* Body */}
              <div className="p-3 flex-1 flex flex-col justify-between space-y-2">
                <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                  {stop.description}
                </p>

                <button
                  type="button"
                  onClick={() => onAddStop({ ...stop, parentDestination: destination.name })}
                  className={`w-full py-1.5 px-2.5 rounded-xl font-heading font-bold text-[11px] transition-all flex items-center justify-center gap-1 cursor-pointer ${
                    isAdded
                      ? "bg-emerald-600/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                      : "bg-[#F8FAFC] dark:bg-[#07111F] hover:bg-orange hover:text-white text-slate-700 dark:text-slate-200 border border-[#E2E8F0] dark:border-[#1E2E42]"
                  }`}
                >
                  <span>{isAdded ? "✓ Added to Trip" : "+ Add Stop"}</span>
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
