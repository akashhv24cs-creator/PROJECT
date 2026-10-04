import { formatDate, formatTime, getStatusConfig } from "../bookings/bookingUtils";

export default function CancellationTripDetails({ booking }) {
  if (!booking) return null;

  const statusMeta = getStatusConfig(booking.status || "cancelled");
  const vehicleName = booking.vehicleName || booking.vehicleType || "Luxury Outstation Fleet";
  const startCity = booking.startLocation || "Bengaluru";
  const destinations = booking.majorDestinations || (booking.destination ? [booking.destination] : ["Outstation Trip"]);
  const endCity = destinations[0] || "Outstation";

  const passengerCount = booking.passengersCount || booking.passengerDetails?.length || 1;
  const seats = booking.seats || booking.selectedSeats || [];

  return (
    <div className="rounded-3xl border border-[#E2E8F0] dark:border-[#1E2E42] bg-white dark:bg-[#0E1A29] p-6 sm:p-7 shadow-sm space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E2E8F0] dark:border-[#1E2E42]">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-orange/10 border border-orange/20 flex items-center justify-center text-orange shrink-0">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M8 7h8m-8 4h8m-8 4h4m5 4H7a2 2 0 01-2-2V5a2 2 0 012-2h10a2 2 0 012 2v14a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-orange block">
              Trip Itinerary
            </span>
            <h3 className="font-extrabold text-base sm:text-lg text-charcoal dark:text-white">
              {vehicleName}
            </h3>
            <p className="text-xs text-slate-400">
              AC Sanitized Outstation Fleet
            </p>
          </div>
        </div>

        <span
          className={`self-start sm:self-center px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider border ${statusMeta.badgeClass}`}
        >
          {statusMeta.label}
        </span>
      </div>

      {/* Route Timeline */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#F5F7FA] dark:bg-[#152436] border border-[#E2E8F0] dark:border-[#1E2E42] space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          
          {/* Origin */}
          <div className="space-y-1 min-w-0">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
              Departure Point
            </span>
            <h4 className="font-extrabold text-sm sm:text-base text-charcoal dark:text-white truncate">
              {startCity}
            </h4>
            <p className="text-xs font-mono text-orange font-bold">
              {formatTime(booking.requestedStartDate)}
            </p>
          </div>

          {/* Timeline Connector */}
          <div className="hidden sm:flex flex-col items-center px-4 flex-1">
            <span className="text-[11px] font-semibold text-slate-400 mb-1">
              Non-Stop Express
            </span>
            <div className="w-full flex items-center">
              <span className="w-2 h-2 rounded-full bg-orange" />
              <span className="flex-1 h-0.5 bg-orange/40" />
              <span className="w-2 h-2 rounded-full bg-slate-400" />
            </div>
            <span className="text-[10px] text-slate-400 mt-1">
              Assigned Route
            </span>
          </div>

          {/* Destination */}
          <div className="space-y-1 text-left sm:text-right min-w-0">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
              Destination
            </span>
            <h4 className="font-extrabold text-sm sm:text-base text-charcoal dark:text-white truncate">
              {endCity}
            </h4>
            <p className="text-xs text-slate-400">
              {booking.requestedEndDate ? formatDate(booking.requestedEndDate) : "Return Included"}
            </p>
          </div>

        </div>
      </div>

      {/* Meta Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
        <div className="p-3 rounded-2xl bg-[#F5F7FA] dark:bg-[#152436] border border-[#E2E8F0] dark:border-[#1E2E42] space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">
            Travel Date
          </span>
          <p className="font-bold text-charcoal dark:text-white truncate">
            {formatDate(booking.requestedStartDate)}
          </p>
        </div>

        <div className="p-3 rounded-2xl bg-[#F5F7FA] dark:bg-[#152436] border border-[#E2E8F0] dark:border-[#1E2E42] space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">
            Travelers
          </span>
          <p className="font-bold text-charcoal dark:text-white">
            {passengerCount} {passengerCount === 1 ? "Passenger" : "Passengers"}
          </p>
        </div>

        <div className="p-3 rounded-2xl bg-[#F5F7FA] dark:bg-[#152436] border border-[#E2E8F0] dark:border-[#1E2E42] space-y-1 col-span-2 sm:col-span-1">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">
            Assigned Seats
          </span>
          <p className="font-mono font-bold text-orange truncate">
            {seats.length > 0 ? seats.join(", ") : "Assigned on Board"}
          </p>
        </div>
      </div>

    </div>
  );
}
