import { motion } from "framer-motion";
import {
  getStatusConfig,
  formatDate,
  formatTime,
  getDestinationImage,
  getVehicleInfo,
  NON_CANCELLABLE_STATUSES,
} from "./bookingUtils";

export default function BookingCard({
  booking,
  onViewDetails,
  onDownloadTicket,
  onCancelBooking,
}) {
  const statusMeta = getStatusConfig(booking.status);
  const imageSrc = getDestinationImage(booking);
  const vehicleMeta = getVehicleInfo(booking.vehicleName || booking.vehicleType, booking.vehicleId);

  const startCity = booking.startLocation || "Bangalore";
  const endCity =
    booking.destination ||
    (Array.isArray(booking.majorDestinations) && booking.majorDestinations[0]) ||
    "Outstation Trip";

  const totalAmount = booking.totalFare || booking.totalAmount || booking.estimatedFare;
  const isCancelled = booking.status?.toLowerCase() === "cancelled";
  const isCompleted = ["trip_completed", "completed", "reviewed"].includes(
    booking.status?.toLowerCase()
  );
  const canCancel =
    booking && !NON_CANCELLABLE_STATUSES.includes(booking.status?.toLowerCase());

  const bookingCode = booking.bookingId || booking.id;

  return (
    <motion.article
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={`group relative rounded-3xl border bg-white dark:bg-[#0E1A29] p-4 sm:p-5 transition-all duration-200 shadow-sm hover:shadow-md ${
        isCancelled
          ? "border-rose-500/20 dark:border-rose-500/20 bg-rose-500/[0.02] dark:bg-rose-500/[0.02]"
          : "border-[#E2E8F0] dark:border-[#1E2E42] hover:border-orange/40 dark:hover:border-orange/40"
      }`}
    >
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5">
        
        {/* Left Side: Thumbnail + Info */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 min-w-0 w-full lg:w-auto flex-1">
          
          {/* Destination Thumbnail */}
          <div
            onClick={() => onViewDetails(booking)}
            className="relative w-full sm:w-40 h-32 sm:h-28 rounded-2xl overflow-hidden shrink-0 border border-[#E2E8F0] dark:border-[#1E2E42] cursor-pointer bg-slate-100 dark:bg-slate-800"
          >
            <img
              src={imageSrc}
              alt={endCity}
              onError={(e) => {
                e.target.src = "/tour-packages-hero.jpg";
              }}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
            
            <div className="absolute bottom-2 left-2.5 right-2.5 flex items-center justify-between text-[11px] text-white font-bold">
              <span className="truncate">{booking.vehicleType || "Group Ride"}</span>
              <span>{vehicleMeta.icon}</span>
            </div>
          </div>

          {/* Core Booking Details */}
          <div className="space-y-2 min-w-0 flex-1">
            
            {/* Top Bar: Status */}
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${statusMeta.badgeClass}`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${statusMeta.dotClass}`} />
                {statusMeta.label}
              </span>

              {booking.advancePaidPercent !== undefined && !isCancelled && (
                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  {booking.advancePaidPercent}% Paid
                </span>
              )}

              {isCancelled && booking.refundStatus && (
                <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20 capitalize">
                  Refund: {booking.refundStatus}
                </span>
              )}
            </div>

            {/* Route Headline */}
            <h3
              onClick={() => onViewDetails(booking)}
              className="font-extrabold text-base sm:text-lg text-charcoal dark:text-white group-hover:text-orange transition-colors cursor-pointer flex items-center gap-2 truncate"
            >
              <span>{startCity}</span>
              <span className="text-orange text-sm font-bold">→</span>
              <span>{endCity}</span>
            </h3>

            {/* Travel Specs Grid / Row */}
            <div className="flex flex-wrap items-center gap-y-1.5 gap-x-4 text-xs text-slate-500 dark:text-slate-400">
              
              {/* Travel Date */}
              <div className="flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="font-semibold text-charcoal dark:text-slate-200">
                  {formatDate(booking.requestedStartDate)}
                </span>
              </div>

              {/* Time */}
              <div className="flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{formatTime(booking.requestedStartDate)}</span>
              </div>

              {/* Vehicle / Passengers */}
              <div className="flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span>{vehicleMeta.seats}</span>
              </div>

              {/* Vehicle Type */}
              <div className="flex items-center gap-1.5 hidden sm:flex">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600" />
                <span className="font-medium text-slate-600 dark:text-slate-300">
                  {booking.vehicleType || "Standard AC"}
                </span>
              </div>

            </div>

          </div>
        </div>

        {/* Right Side: Fare & Action Buttons */}
        <div className="flex flex-row lg:flex-col items-center lg:items-end justify-between w-full lg:w-auto pt-3 lg:pt-0 border-t lg:border-t-0 border-[#E2E8F0] dark:border-[#1E2E42] gap-3">
          
          {/* Fare display */}
          <div className="text-left lg:text-right">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
              {isCancelled ? "Original Amount" : "Estimated Fare"}
            </span>
            <span
              className={`font-extrabold text-lg sm:text-xl font-mono ${
                isCancelled
                  ? "text-slate-400 line-through"
                  : "text-orange"
              }`}
            >
              {totalAmount ? `₹${Number(totalAmount).toLocaleString("en-IN")}` : "Calculated at end"}
            </span>
          </div>

          {/* Action Group */}
          <div className="flex items-center gap-2">
            {/* View Details button (opens right-side drawer) */}
            <button
              type="button"
              onClick={() => onViewDetails(booking)}
              className="py-2.5 px-4 rounded-xl bg-orange hover:bg-orangeLight text-white font-bold text-xs transition-all shadow-sm shadow-orange/20 cursor-pointer flex items-center gap-1"
            >
              <span>View Details</span>
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
              </svg>
            </button>

            {/* Cancel Booking Action if cancellable */}
            {canCancel && onCancelBooking && (
              <button
                type="button"
                onClick={() => onCancelBooking(booking)}
                className="p-2.5 rounded-xl hover:bg-rose-500/10 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors cursor-pointer"
                title="Cancel this booking"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}

          </div>

        </div>

      </div>
    </motion.article>
  );
}
