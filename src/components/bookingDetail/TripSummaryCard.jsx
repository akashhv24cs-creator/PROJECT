import { motion } from "framer-motion";
import {
  getStatusConfig,
  formatDate,
  formatTime,
  getDestinationImage,
  getVehicleInfo,
} from "../bookings/bookingUtils";

export default function TripSummaryCard({ booking }) {
  if (!booking) return null;

  const statusMeta = getStatusConfig(booking.status);
  const imageSrc = getDestinationImage(booking);
  const vehicleMeta = getVehicleInfo(booking.vehicleName || booking.vehicleType, booking.vehicleId);

  const startCity = booking.startLocation || "Bangalore";
  const endCity =
    booking.destination ||
    (Array.isArray(booking.majorDestinations) && booking.majorDestinations[0]) ||
    "Outstation Destination";

  const tripTitle =
    booking.packageName ||
    booking.tripTitle ||
    `${endCity} Trip`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="relative rounded-3xl border border-[#E2E8F0] dark:border-[#1E2E42] bg-white dark:bg-[#0E1A29] overflow-hidden shadow-sm hover:shadow-md transition-shadow"
    >
      {/* Top Hero Banner with Destination Image */}
      <div className="relative h-48 sm:h-60 w-full overflow-hidden bg-slate-900">
        <img
          src={imageSrc}
          alt={endCity}
          onError={(e) => {
            e.target.src = "/tour-packages-hero.jpg";
          }}
          className="w-full h-full object-cover opacity-90 transition-transform duration-700 hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />
        
        {/* Floating Top Badges */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white font-extrabold text-xs tracking-wider uppercase flex items-center gap-1.5">
              <span>{booking.vehicleType || "Chauffeur Ride"}</span>
            </span>
          </div>

          <span
            className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider backdrop-blur-md border shadow-sm ${statusMeta.badgeClass}`}
          >
            {statusMeta.label}
          </span>
        </div>

        {/* Bottom Banner Content */}
        <div className="absolute bottom-4 left-4 right-4 text-white">
          <span className="text-[11px] font-bold uppercase tracking-widest text-orange block mb-1">
            Zenera Outstation Experience
          </span>
          <h2 className="font-extrabold text-2xl sm:text-3xl text-white tracking-tight">
            {tripTitle}
          </h2>
          <p className="text-xs sm:text-sm text-white/80 font-medium flex items-center gap-2 mt-1">
            <span>{startCity}</span>
            <span className="text-orange font-bold">→</span>
            <span>{endCity}</span>
          </p>
        </div>
      </div>

      {/* Card Body Quick Meta Row */}
      <div className="p-5 sm:p-6 bg-white dark:bg-[#0E1A29] grid grid-cols-2 sm:grid-cols-4 gap-4 divide-y sm:divide-y-0 sm:divide-x divide-[#E2E8F0] dark:divide-[#1E2E42]">
        
        {/* Origin / Departure */}
        <div className="pt-2 sm:pt-0">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-0.5">
            Departure City
          </span>
          <p className="font-extrabold text-sm sm:text-base text-charcoal dark:text-white truncate">
            {startCity}
          </p>
          <span className="text-xs text-orange font-bold">
            {formatTime(booking.requestedStartDate)}
          </span>
        </div>

        {/* Destination */}
        <div className="pt-2 sm:pt-0 sm:pl-4">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-0.5">
            Destination
          </span>
          <p className="font-extrabold text-sm sm:text-base text-charcoal dark:text-white truncate">
            {endCity}
          </p>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {booking.requestedEndDate ? formatDate(booking.requestedEndDate) : "Return Journey"}
          </span>
        </div>

        {/* Travel Date */}
        <div className="pt-2 sm:pt-0 sm:pl-4 col-span-1">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-0.5">
            Journey Date
          </span>
          <p className="font-extrabold text-sm sm:text-base text-charcoal dark:text-white">
            {formatDate(booking.requestedStartDate)}
          </p>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Confirmed Slot
          </span>
        </div>

        {/* Vehicle & Capacity */}
        <div className="pt-2 sm:pt-0 sm:pl-4 col-span-1">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-0.5">
            Fleet Vehicle
          </span>
          <p className="font-extrabold text-sm sm:text-base text-charcoal dark:text-white truncate">
            {vehicleMeta.name}
          </p>
          <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
            {vehicleMeta.seats}
          </span>
        </div>

      </div>
    </motion.div>
  );
}
