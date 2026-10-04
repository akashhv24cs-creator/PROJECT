import { motion } from "framer-motion";
import {
  getStatusConfig,
  formatDate,
  formatTime,
  getDestinationImage,
  getVehicleInfo,
} from "./bookingUtils";

export default function NextTripHighlight({
  trip,
  onViewDetails,
  onDownloadTicket,
}) {
  if (!trip) return null;

  const statusMeta = getStatusConfig(trip.status);
  const imageSrc = getDestinationImage(trip);
  const vehicleMeta = getVehicleInfo(trip.vehicleName || trip.vehicleType, trip.vehicleId);

  const startCity = trip.startLocation || "Bangalore";
  const endCity =
    trip.destination ||
    (Array.isArray(trip.majorDestinations) && trip.majorDestinations[0]) ||
    "Outstation";

  const totalAmount = trip.totalFare || trip.totalAmount || trip.estimatedFare;

  return (
    <motion.section
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="relative overflow-hidden rounded-3xl border border-orange/30 bg-gradient-to-r from-orange/10 via-[#FFFFFF] to-[#FFFFFF] dark:from-orange/15 dark:via-[#0E1A29] dark:to-[#0E1A29] p-5 sm:p-7 shadow-xl shadow-orange/5"
      aria-label="Your Next Trip"
    >
      {/* Decorative subtle background pattern */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-orange/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

      <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        
        {/* Left Side: Badge + Thumbnail + Route & Info */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 min-w-0 w-full lg:w-auto">
          
          {/* Image Thumbnail */}
          <div className="relative w-full sm:w-36 h-28 sm:h-28 rounded-2xl overflow-hidden shrink-0 border border-[#E2E8F0] dark:border-[#1E2E42] shadow-sm">
            <img
              src={imageSrc}
              alt={endCity}
              onError={(e) => {
                e.target.src = "/tour-packages-hero.jpg";
              }}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-[10px] text-white font-bold">
              <span className="truncate">{vehicleMeta.name}</span>
            </div>
          </div>

          {/* Details */}
          <div className="space-y-2 min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-orange text-white text-[10px] font-extrabold uppercase tracking-wider shadow-sm shadow-orange/30">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                Your Next Trip
              </span>

              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${statusMeta.badgeClass}`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${statusMeta.dotClass}`} />
                {statusMeta.label}
              </span>
            </div>

            <h2 className="font-extrabold text-xl sm:text-2xl text-charcoal dark:text-white tracking-tight flex items-center gap-2 truncate">
              <span>{startCity}</span>
              <span className="text-orange">→</span>
              <span>{endCity}</span>
            </h2>

            {/* Micro Specs */}
            <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-1.5">
                <strong className="text-charcoal dark:text-slate-200 font-semibold">
                  {formatDate(trip.requestedStartDate)}
                </strong>
              </div>

              <div className="flex items-center gap-1.5">
                <span>{formatTime(trip.requestedStartDate)}</span>
              </div>

              <div className="flex items-center gap-1.5">
                <span>{vehicleMeta.seats}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Fare & CTAs */}
        <div className="flex sm:flex-row lg:flex-col items-center sm:items-end justify-between w-full lg:w-auto pt-4 sm:pt-0 border-t lg:border-t-0 border-[#E2E8F0] dark:border-[#1E2E42] gap-4">
          {totalAmount && (
            <div className="text-left sm:text-right">
              <span className="text-[10px] uppercase font-extrabold tracking-wider text-slate-400 block">
                Total Fare
              </span>
              <span className="font-extrabold text-xl sm:text-2xl text-orange font-mono">
                ₹{Number(totalAmount).toLocaleString("en-IN")}
              </span>
            </div>
          )}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onViewDetails(trip)}
              className="py-2.5 px-5 rounded-xl bg-orange hover:bg-orangeLight text-white font-bold text-xs transition-all shadow-md shadow-orange/25 cursor-pointer flex items-center gap-1.5"
            >
              <span>View Details</span>
              <span>→</span>
            </button>
          </div>
        </div>

      </div>
    </motion.section>
  );
}
