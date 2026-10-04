import { formatDate, formatTime, formatDateTime, getVehicleInfo } from "../bookings/bookingUtils";

export default function TripInfoGrid({ booking }) {
  if (!booking) return null;

  const vehicleMeta = getVehicleInfo(booking.vehicleName || booking.vehicleType, booking.vehicleId);
  const passengerCount =
    booking.passengers ||
    booking.passengerCount ||
    vehicleMeta.seats ||
    "Standard Capacity";

  const bookingDate = formatDateTime(booking.createdAt) || "Instant Reservation";

  const cards = [
    {
      label: "Travel Date",
      primary: formatDate(booking.requestedStartDate),
      secondary: formatTime(booking.requestedStartDate),
      accent: "text-orange",
    },
    {
      label: "Passengers",
      primary: typeof passengerCount === "number" ? `${passengerCount} Travelers` : passengerCount,
      secondary: "Sanitized Vehicle",
      accent: "text-blue-500",
    },
    {
      label: "Vehicle Fleet",
      primary: vehicleMeta.name,
      secondary: vehicleMeta.seats,
      accent: "text-emerald-500",
    },
    {
      label: "Booking Placed",
      primary: bookingDate,
      secondary: "Confirmed via Portal",
      accent: "text-purple-500",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
      {cards.map((card, idx) => (
        <div
          key={idx}
          className="rounded-2xl border border-[#E2E8F0] dark:border-[#1E2E42] bg-white dark:bg-[#0E1A29] p-4 sm:p-5 space-y-2 shadow-sm hover:border-orange/30 transition-colors"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
              {card.label}
            </span>
          </div>

          <div>
            <h4 className="font-extrabold text-sm sm:text-base text-charcoal dark:text-white truncate">
              {card.primary}
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
              {card.secondary}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
