import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

/**
 * Your Journey Panel / Bottom Sheet
 * Manages the user's custom-selected route and converts it into a seamless booking request.
 */
export default function YourJourneyDrawer({
  userStops = [],
  onRemoveStop,
  onClearTrip,
  className = "",
  isMobile = false,
}) {
  const navigate = useNavigate();
  const [isOpenMobile, setIsOpenMobile] = useState(false);

  const handleBookCustomTrip = () => {
    if (userStops.length === 0) return;

    const primaryDest = userStops[0]?.name || "Mysore";
    const additionalStops = userStops
      .slice(1)
      .map((s) => s.name)
      .join(", ");

    const queryParams = new URLSearchParams();
    queryParams.set("destination", primaryDest);
    if (additionalStops) {
      queryParams.set("stops", additionalStops);
    }

    navigate(`/book?${queryParams.toString()}`);
  };

  // Mobile Bottom Sheet / Floating Pill
  if (isMobile) {
    return (
      <>
        {/* Floating Mobile Summary Bar */}
        {userStops.length > 0 && (
          <div className="fixed bottom-4 left-4 right-4 z-40">
            <div className="bg-charcoal dark:bg-[#07111F] text-white p-3.5 rounded-2xl shadow-2xl border border-white/10 flex items-center justify-between gap-3">
              <div
                onClick={() => setIsOpenMobile(!isOpenMobile)}
                className="flex items-center gap-2.5 cursor-pointer flex-1 min-w-0"
              >
                <div className="w-8 h-8 rounded-xl bg-orange flex items-center justify-center font-heading font-extrabold text-xs shrink-0">
                  {userStops.length}
                </div>
                <div className="min-w-0">
                  <span className="font-heading font-bold text-xs uppercase tracking-wider block truncate">
                    Your Custom Journey
                  </span>
                  <span className="text-[10px] text-slate-300 block truncate">
                    {userStops.map((s) => s.name).join(" → ")}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsOpenMobile(!isOpenMobile)}
                  className="px-2.5 py-1.5 rounded-xl bg-white/10 text-xs font-medium"
                >
                  {isOpenMobile ? "Close" : "View"}
                </button>
                <button
                  type="button"
                  onClick={handleBookCustomTrip}
                  className="px-3.5 py-1.5 rounded-xl bg-orange hover:bg-orangeLight text-white font-heading font-bold text-xs shadow-md"
                >
                  Book Trip →
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Mobile Modal Drawer */}
        <AnimatePresence>
          {isOpenMobile && (
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              className="fixed inset-x-0 bottom-20 z-50 mx-4 bg-white dark:bg-[#0E1A29] rounded-3xl border border-[#E2E8F0] dark:border-[#1E2E42] shadow-2xl p-5 max-h-[70vh] flex flex-col justify-between"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-[#1E2E42]">
                <div className="flex items-center gap-2">
                  <span className="text-orange">🗺️</span>
                  <h4 className="font-heading font-extrabold text-sm uppercase tracking-wider text-charcoal dark:text-white">
                    Your Journey ({userStops.length} stops)
                  </h4>
                </div>
                <button
                  type="button"
                  onClick={() => setIsOpenMobile(false)}
                  className="w-7 h-7 rounded-full bg-slate-100 dark:bg-[#1E2E42] flex items-center justify-center text-xs text-slate-500"
                >
                  ✕
                </button>
              </div>

              {/* Stops list */}
              <div className="py-3 flex-1 overflow-y-auto space-y-2.5 divide-y divide-slate-100 dark:divide-[#1E2E42]">
                {userStops.map((stop, i) => (
                  <div key={stop.id || i} className="pt-2 first:pt-0 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="w-5 h-5 rounded-full bg-orange/10 text-orange font-mono text-[10px] font-bold flex items-center justify-center shrink-0">
                        {i + 1}
                      </span>
                      <span className="font-heading font-bold text-xs text-charcoal dark:text-white truncate">
                        {stop.name}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => onRemoveStop(stop.id)}
                      className="text-slate-400 hover:text-red-500 text-xs px-2 py-1"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>

              {/* Actions */}
              <div className="pt-3 border-t border-slate-100 dark:border-[#1E2E42] flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClearTrip}
                  className="px-3 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-red-500"
                >
                  Clear All
                </button>
                <button
                  type="button"
                  onClick={handleBookCustomTrip}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-orange hover:bg-orangeLight text-white font-heading font-bold text-xs text-center shadow-lg"
                >
                  Proceed to Booking →
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </>
    );
  }

  // Desktop Panel Layout
  return (
    <div
      className={`bg-white/95 dark:bg-[#0E1A29]/95 backdrop-blur-xl rounded-3xl border border-[#E2E8F0] dark:border-[#1E2E42] p-5 shadow-lg flex flex-col justify-between space-y-4 ${className}`}
    >
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-[#1E2E42]">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-orange" />
          <h4 className="font-heading font-extrabold text-sm uppercase tracking-wider text-charcoal dark:text-white">
            Your Journey ({userStops.length})
          </h4>
        </div>
        {userStops.length > 0 && (
          <button
            type="button"
            onClick={onClearTrip}
            className="text-[11px] font-medium text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
          >
            Reset
          </button>
        )}
      </div>

      {/* Selected Stops Vertical Timeline */}
      {userStops.length === 0 ? (
        <div className="py-8 text-center text-slate-400 space-y-2">
          <div className="text-2xl">🚗</div>
          <p className="text-xs font-medium">No stops added yet.</p>
          <p className="text-[11px] text-slate-500">
            Click <strong>+ Add to Trip</strong> on any destination or search below.
          </p>
        </div>
      ) : (
        <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
          {userStops.map((stop, i) => (
            <div
              key={stop.id || i}
              className="p-2.5 rounded-2xl bg-[#F8FAFC] dark:bg-[#07111F] border border-[#E2E8F0] dark:border-[#1E2E42] flex items-center justify-between gap-3 group"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="w-6 h-6 rounded-full bg-orange/15 text-orange font-mono text-[11px] font-bold flex items-center justify-center shrink-0">
                  {i + 1}
                </span>
                <div className="min-w-0">
                  <h5 className="font-heading font-bold text-xs text-charcoal dark:text-white truncate">
                    {stop.name}
                  </h5>
                  <span className="text-[10px] text-slate-400 block truncate">
                    {stop.state || stop.parentDestination || "South India"}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => onRemoveStop(stop.id)}
                title="Remove Stop"
                className="w-6 h-6 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 flex items-center justify-center text-xs transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Book Custom Trip CTA */}
      <div className="pt-3 border-t border-slate-100 dark:border-[#1E2E42]">
        <button
          type="button"
          onClick={handleBookCustomTrip}
          disabled={userStops.length === 0}
          className={`w-full py-3 px-4 rounded-2xl font-heading font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer ${
            userStops.length === 0
              ? "bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed"
              : "bg-orange hover:bg-orangeLight text-white shadow-orange/25 hover:shadow-lg"
          }`}
        >
          <span>Book This Custom Trip</span>
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M5 12h14" />
            <path d="m12 5 7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}
