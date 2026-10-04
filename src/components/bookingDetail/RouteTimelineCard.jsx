import { formatDate, formatTime } from "../bookings/bookingUtils";

export default function RouteTimelineCard({ booking }) {
  if (!booking) return null;

  const startCity = booking.startLocation || "Bangalore";
  const endCity =
    booking.destination ||
    (Array.isArray(booking.majorDestinations) && booking.majorDestinations[0]) ||
    "Outstation Destination";

  const departureTime = formatTime(booking.requestedStartDate);
  const departureDate = formatDate(booking.requestedStartDate);
  const returnDate = booking.requestedEndDate ? formatDate(booking.requestedEndDate) : null;

  const stops = Array.isArray(booking.majorDestinations) && booking.majorDestinations.length > 0
    ? booking.majorDestinations
    : [];

  const pickupPoint = booking.pickupAddress || "Doorstep Chauffeur Pickup / City Origin";
  const dropPoint = booking.dropAddress || `${endCity} Central Drop / Sightseeing Point`;

  return (
    <div className="rounded-3xl border border-[#E2E8F0] dark:border-[#1E2E42] bg-white dark:bg-[#0E1A29] p-5 sm:p-7 shadow-sm">
      
      {/* Header */}
      <div className="flex items-center justify-between gap-4 pb-5 mb-6 border-b border-[#E2E8F0] dark:border-[#1E2E42]">
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-orange block">
            Journey Blueprint
          </span>
          <h3 className="font-extrabold text-lg sm:text-xl text-charcoal dark:text-white">
            Route & Travel Timeline
          </h3>
        </div>

        <span className="px-3 py-1 rounded-xl bg-orange/10 border border-orange/20 text-orange font-extrabold text-xs">
          Direct Outstation Route
        </span>
      </div>

      {/* ========================================================
          DESKTOP HORIZONTAL TIMELINE (Hidden on mobile)
         ======================================================== */}
      <div className="hidden md:block py-4">
        <div className="grid grid-cols-12 items-center gap-4">
          
          {/* Origin / Departure (Cols 1-4) */}
          <div className="col-span-4 space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 ring-4 ring-emerald-500/20" />
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                Origin & Pickup
              </span>
            </div>
            <h4 className="font-extrabold text-lg text-charcoal dark:text-white truncate">
              {startCity}
            </h4>
            <div className="text-xs text-orange font-bold font-mono">
              {departureTime} • {departureDate}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
              {pickupPoint}
            </p>
          </div>

          {/* Center Connector Track & Stops (Cols 5-8) */}
          <div className="col-span-4 flex flex-col items-center justify-center px-2">
            <span className="text-[11px] font-bold text-orange uppercase tracking-wider mb-2">
              {stops.length > 0 ? `Via ${stops.slice(0, 2).join(", ")}` : "Direct Chauffeur Route"}
            </span>

            {/* Track Line with Animated Indicator */}
            <div className="relative w-full flex items-center justify-center">
              <div className="w-full h-1 bg-gradient-to-r from-emerald-500 via-orange to-orange rounded-full" />
              <div className="absolute w-7 h-7 rounded-full bg-white dark:bg-[#0E1A29] border-2 border-orange flex items-center justify-center shadow-md text-orange">
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M5 12h14" />
                  <path d="m12 5 7 7-7 7" />
                </svg>
              </div>
            </div>

            <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 mt-2">
              Verified Chauffeur Assigned
            </span>
          </div>

          {/* Destination / Drop (Cols 9-12) */}
          <div className="col-span-4 text-right space-y-1.5">
            <div className="flex items-center justify-end gap-2">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                Destination
              </span>
              <span className="w-3.5 h-3.5 rounded-full bg-orange ring-4 ring-orange/20" />
            </div>
            <h4 className="font-extrabold text-lg text-charcoal dark:text-white truncate">
              {endCity}
            </h4>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              {returnDate ? `Return by ${returnDate}` : "Flexible Multi-Day Return"}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
              {dropPoint}
            </p>
          </div>

        </div>
      </div>

      {/* ========================================================
          MOBILE VERTICAL TIMELINE (Hidden on desktop)
         ======================================================== */}
      <div className="block md:hidden space-y-6">
        
        {/* Origin Step */}
        <div className="flex items-start gap-4">
          <div className="flex flex-col items-center">
            <span className="w-4 h-4 rounded-full bg-emerald-500 ring-4 ring-emerald-500/20 shrink-0" />
            <div className="w-0.5 h-16 bg-gradient-to-b from-emerald-500 to-orange my-1" />
          </div>
          <div className="flex-1 min-w-0 pb-2">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
              Pickup Point
            </span>
            <h4 className="font-extrabold text-base text-charcoal dark:text-white">
              {startCity}
            </h4>
            <span className="text-xs text-orange font-bold font-mono">
              {departureTime} • {departureDate}
            </span>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {pickupPoint}
            </p>
          </div>
        </div>

        {/* Destination Step */}
        <div className="flex items-start gap-4">
          <div className="flex flex-col items-center">
            <span className="w-4 h-4 rounded-full bg-orange ring-4 ring-orange/20 shrink-0" />
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
              Destination
            </span>
            <h4 className="font-extrabold text-base text-charcoal dark:text-white">
              {endCity}
            </h4>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {returnDate ? `Return: ${returnDate}` : "Flexible Return Schedule"}
            </span>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {dropPoint}
            </p>
          </div>
        </div>

      </div>

      {/* Intermediate Major Destinations / Via Points (if any) */}
      {stops.length > 0 && (
        <div className="mt-5 pt-4 border-t border-[#E2E8F0] dark:border-[#1E2E42] flex flex-wrap items-center gap-2">
          <span className="text-[10px] font-extrabold uppercase text-slate-400">
            En Route Stops:
          </span>
          {stops.map((stop, idx) => (
            <span
              key={idx}
              className="px-2.5 py-1 rounded-lg bg-[#F5F7FA] dark:bg-[#152436] border border-[#E2E8F0] dark:border-[#1E2E42] text-xs font-semibold text-charcoal dark:text-slate-200"
            >
              {stop}
            </span>
          ))}
        </div>
      )}

    </div>
  );
}
