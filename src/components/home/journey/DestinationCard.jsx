import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import DestinationImage from "../../common/DestinationImage";

/**
 * Floating / Structured Destination Info Card
 * Displays destination details, authentic image, highlights, and quick action buttons.
 */
export default function DestinationCard({
  destination,
  stopIndex = 0,
  totalStops = 8,
  onAddToTrip,
  isAddedToTrip = false,
  className = "",
}) {
  const navigate = useNavigate();

  if (!destination) return null;

  const handleDirectBook = (e) => {
    e.stopPropagation();
    navigate(`/book?destination=${encodeURIComponent(destination.route || destination.name)}`);
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={destination.id}
        initial={{ opacity: 0, y: 16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -12, scale: 0.98 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className={`bg-white/95 dark:bg-[#0E1A29]/95 backdrop-blur-xl rounded-3xl border border-[#E2E8F0] dark:border-[#1E2E42] shadow-xl overflow-hidden flex flex-col justify-between ${className}`}
      >
        {/* Card Header & Thumbnail */}
        <div className="relative aspect-[16/9] overflow-hidden bg-slate-100 dark:bg-[#152436]">
          <DestinationImage
            src={destination.image}
            alt={destination.alt || `${destination.name}, ${destination.state}`}
            aspectRatio="aspect-auto"
            className="w-full h-full"
            imgClassName="hover:scale-105 transition-transform duration-700 ease-out"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent pointer-events-none" />

          {/* Location & Region Badge */}
          <div className="absolute top-3 left-3 flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white font-medium text-[11px] flex items-center gap-1 shadow-sm">
              📍 {destination.location ? destination.location.split(",")[0] : destination.name}, {destination.state}
            </span>
          </div>

          {/* Stop Counter Pill */}
          <div className="absolute top-3 right-3">
            <span className="px-2.5 py-1 rounded-full bg-orange text-white font-heading font-bold text-[10px] uppercase tracking-wider shadow-md">
              Stop {stopIndex + 1} of {totalStops}
            </span>
          </div>

          {/* Destination Name Overlay */}
          <div className="absolute bottom-3 left-4 right-4 text-white pointer-events-none">
            <span className="text-[11px] font-semibold text-orangeLight uppercase tracking-wider block drop-shadow-xs">
              {destination.tagline}
            </span>
            <h3 className="font-heading font-extrabold text-2xl sm:text-3xl text-white tracking-tight uppercase leading-tight drop-shadow-sm">
              {destination.name}
            </h3>
          </div>
        </div>

        {/* Card Body */}
        <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-4">
          <div>
            {/* Highlights List */}
            {destination.highlights && destination.highlights.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-3">
                {destination.highlights.slice(0, 3).map((hl, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-0.5 rounded-lg bg-[#F1F5F9] dark:bg-[#1E2E42] text-slate-700 dark:text-slate-300 text-[11px] font-medium"
                  >
                    ✨ {hl.split("&")[0].trim()}
                  </span>
                ))}
              </div>
            )}

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-normal line-clamp-3">
              {destination.description || destination.overview}
            </p>
          </div>

          {/* Quick Metrics Bar */}
          <div className="py-2.5 px-3.5 rounded-2xl bg-[#F8FAFC] dark:bg-[#07111F] border border-[#E2E8F0] dark:border-[#1E2E42] flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-300">
            <div className="flex items-center gap-1.5">
              <span className="text-orange font-bold">⏱ Duration:</span>
              <span className="font-medium">{destination.duration || "2 Days"}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-orange font-bold">🛣 Drive:</span>
              <span className="font-medium">{destination.distance ? destination.distance.split("(")[0].trim() : "Scenic Route"}</span>
            </div>
          </div>

          {/* Actions Bar */}
          <div className="pt-3 border-t border-[#E2E8F0] dark:border-[#1E2E42] flex items-center gap-3">
            <Link
              to={`/destinations/${destination.id}`}
              className="flex-1 py-2.5 px-4 rounded-xl border border-slate-300 dark:border-slate-700 hover:border-orange text-charcoal dark:text-white hover:text-orange text-center font-heading font-bold text-xs transition-all duration-200 inline-flex items-center justify-center gap-1.5"
            >
              <span>Explore Guide</span>
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            </Link>

            <button
              type="button"
              onClick={() => onAddToTrip(destination)}
              className={`flex-1 py-2.5 px-4 rounded-xl font-heading font-bold text-xs transition-all duration-200 inline-flex items-center justify-center gap-1.5 shadow-md cursor-pointer ${
                isAddedToTrip
                  ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                  : "bg-orange hover:bg-orangeLight text-white"
              }`}
            >
              <span>{isAddedToTrip ? "✓ In Your Trip" : "+ Add to Trip"}</span>
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
