import { DEFAULT_JOURNEY_STOPS } from "./JourneyRoadCanvas";

/**
 * Journey Progress & Navigation Controls Bar
 * Displays current stop number, interactive timeline dots, and prev/next/auto-cruise controls.
 */
export default function JourneyProgress({
  activeStopIndex = 0,
  totalStops = 7,
  stops = DEFAULT_JOURNEY_STOPS,
  onPrev,
  onNext,
  onSelectStop,
  isAutoPlaying = false,
  onToggleAutoPlay,
  className = "",
}) {
  const currentStops = stops && stops.length > 0 ? stops : DEFAULT_JOURNEY_STOPS;
  const count = currentStops.length;
  const safeIndex = Math.min(activeStopIndex, count - 1);

  return (
    <div
      className={`bg-white/90 dark:bg-[#0E1A29]/90 backdrop-blur-md rounded-2xl border border-[#E2E8F0] dark:border-[#1E2E42] p-3 sm:p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-6 ${className}`}
    >
      {/* Step Counter & Auto-drive status */}
      <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-orange animate-pulse" />
          <span className="font-heading font-extrabold text-xs sm:text-sm uppercase tracking-wider text-charcoal dark:text-white">
            {safeIndex + 1} / {count} Destinations
          </span>
        </div>

        <button
          type="button"
          onClick={onToggleAutoPlay}
          className={`px-3 py-1 rounded-xl text-[11px] font-heading font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
            isAutoPlaying
              ? "bg-orange/15 text-orange border border-orange/30"
              : "bg-slate-100 dark:bg-[#1E2E42] text-slate-600 dark:text-slate-300 hover:text-charcoal dark:hover:text-white"
          }`}
          title={isAutoPlaying ? "Pause Auto-Drive" : "Start Auto-Drive"}
        >
          <span>{isAutoPlaying ? "⏸ Pause Tour" : "▶ Auto Cruise"}</span>
        </button>
      </div>

      {/* Interactive Timeline Progress Dots */}
      <div className="flex items-center gap-1.5 sm:gap-2 flex-1 max-w-md w-full justify-center">
        {currentStops.map((stop, idx) => {
          const isActive = idx === safeIndex;
          const isPassed = idx < safeIndex;
          const label = stop.name || stop.title || `Stop ${idx + 1}`;

          return (
            <button
              key={stop.id || idx}
              type="button"
              onClick={() => onSelectStop(idx)}
              aria-label={`Jump to ${label}`}
              className="group relative py-2 px-0.5 focus:outline-none cursor-pointer flex-1"
            >
              <div
                className={`h-2 rounded-full transition-all duration-300 ${
                  isActive
                    ? "bg-orange shadow-md shadow-orange/30"
                    : isPassed
                    ? "bg-orange/40 dark:bg-orange/50"
                    : "bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600"
                }`}
              />

              {/* Tooltip on hover */}
              <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2 py-1 rounded-md bg-black/85 text-white text-[10px] font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
                {label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Prev / Next Navigation Buttons */}
      <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
        <button
          type="button"
          onClick={onPrev}
          className="flex-1 sm:flex-initial px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-[#1E2E42] hover:border-orange bg-white dark:bg-[#07111F] text-charcoal dark:text-white font-heading font-bold text-xs transition-colors flex items-center justify-center gap-1 cursor-pointer"
        >
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="m15 18-6-6 6-6" />
          </svg>
          <span>Prev</span>
        </button>

        <button
          type="button"
          onClick={onNext}
          className="flex-1 sm:flex-initial px-3.5 py-1.5 rounded-xl bg-orange hover:bg-orangeLight text-white font-heading font-bold text-xs transition-colors flex items-center justify-center gap-1 shadow-sm cursor-pointer"
        >
          <span>Next</span>
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="m9 18 6-6-6-6" />
          </svg>
        </button>
      </div>
    </div>
  );
}
