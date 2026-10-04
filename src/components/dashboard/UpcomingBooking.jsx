import { motion } from "framer-motion";
import { parseDate } from "../bookings/bookingUtils";

const formatDate = (ts) => {
  if (!ts) return "N/A";
  const dateObj = parseDate(ts);
  if (!dateObj) return "Flexible Date";

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const day = dateObj.getDate();
  const month = months[dateObj.getMonth()];
  const year = dateObj.getFullYear();
  return `${day} ${month} ${year}`;
};

const formatStatusText = (status) => {
  if (!status) return "Active";
  return status
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

export default function UpcomingBooking({ booking, loading, onBookClick }) {
  if (loading) {
    return (
      <div className="bg-theme-card border border-theme-border rounded-3xl p-6 sm:p-8 backdrop-blur-md flex flex-col items-center justify-center min-h-[300px] shadow-theme-card">
        <div className="w-8 h-8 border-2 border-orange border-t-transparent rounded-full animate-spin mb-3" />
        <span className="text-xs text-theme-text-muted font-body">Loading upcoming ride...</span>
      </div>
    );
  }

  return (
    <div className="bg-theme-card border border-theme-border rounded-3xl p-6 sm:p-8 backdrop-blur-md flex flex-col justify-between shadow-theme-card transition-colors duration-200">
      {/* Card Header */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-theme-border">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-orange animate-pulse" />
          <h3 className="font-heading font-extrabold text-xl text-theme-text-primary tracking-tight">
            Upcoming Booking
          </h3>
        </div>
        {booking ? (
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-orange/20 text-orange border border-orange/30 capitalize">
            {formatStatusText(booking.status)}
          </span>
        ) : (
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-theme-surface-secondary text-theme-text-muted border border-theme-border">
            Status: Idle
          </span>
        )}
      </div>

      {booking ? (
        <div className="space-y-5">
          {/* Location & Route Display */}
          <div className="p-4 rounded-2xl bg-theme-surface-secondary border border-theme-border space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-orange/10 border border-orange/20 flex items-center justify-center flex-shrink-0 text-orange">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-orange">
                  Pickup Location
                </span>
                <p className="font-heading font-bold text-theme-text-primary text-base capitalize">
                  {booking.startLocation}
                </p>
              </div>
            </div>

            {booking.majorDestinations && booking.majorDestinations.length > 0 && (
              <div className="pt-2 border-t border-theme-border flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-theme-surface border border-theme-border flex items-center justify-center flex-shrink-0 text-slate-400">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                </div>
                <div className="flex-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-theme-text-muted">
                    Destinations
                  </span>
                  <p className="font-heading font-semibold text-theme-text-primary text-sm capitalize">
                    {booking.majorDestinations.join(" • ")}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Vehicle & Date Details */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3.5 rounded-xl bg-theme-surface-secondary border border-theme-border">
              <span className="text-[10px] text-theme-text-muted uppercase tracking-wider block mb-0.5 font-medium">
                Vehicle Type
              </span>
              <span className="font-heading font-bold text-theme-text-primary text-sm">
                {booking.vehicleType}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-theme-surface-secondary border border-theme-border">
              <span className="text-[10px] text-theme-text-muted uppercase tracking-wider block mb-0.5 font-medium">
                Trip Dates
              </span>
              <span className="font-body text-theme-text-primary text-xs font-medium">
                {formatDate(booking.requestedStartDate)} → {formatDate(booking.requestedEndDate)}
              </span>
            </div>
          </div>

          {/* Footer Metadata */}
          <div className="flex items-center justify-between pt-2 border-t border-theme-border text-xs">
            {booking.advancePaidPercent !== undefined ? (
              <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-semibold text-[11px]">
                {booking.advancePaidPercent}% Advance Paid
              </span>
            ) : (
              <span className="text-theme-text-muted text-[11px] font-medium">Outstation Ride</span>
            )}

            <button
              onClick={() => {
                if (booking?.id) {
                  window.location.href = `/bookings/${booking.id}`;
                } else if (onBookClick) {
                  onBookClick();
                }
              }}
              className="text-orange hover:text-orangeLight font-heading font-bold text-xs flex items-center gap-1 cursor-pointer transition-colors"
            >
              <span>Manage Trip</span>
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      ) : (
        /* Empty State Presentation */
        <div className="flex flex-col items-center justify-center text-center py-10 px-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="w-20 h-20 rounded-3xl bg-theme-surface-secondary border border-theme-border flex items-center justify-center mb-5 text-orange shadow-inner"
          >
            <svg className="w-10 h-10 text-orange" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M8 7h8m-8 4h8m-9 5h10a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </motion.div>

          <h4 className="font-heading font-bold text-2xl text-theme-text-primary mb-2">
            No upcoming trips
          </h4>

          <p className="font-body text-theme-text-secondary text-sm max-w-sm leading-relaxed mb-6">
            You don't have any scheduled rides right now. Ready for an outstation weekend get-away or group tour?
          </p>

          <button
            onClick={onBookClick}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-orange text-white font-heading font-bold text-sm hover:bg-orangeLight transition-all duration-200 shadow-lg shadow-orange/20 cursor-pointer"
          >
            <span>Book a Trip</span>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}

