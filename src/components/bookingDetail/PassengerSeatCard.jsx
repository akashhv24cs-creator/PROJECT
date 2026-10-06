import { useAuth } from "../../hooks/useAuth";
import { getVehicleInfo } from "../bookings/bookingUtils";

export default function PassengerSeatCard({ booking }) {
  const { userProfile, currentUser } = useAuth();
  if (!booking) return null;

  const vehicleMeta = getVehicleInfo(booking.vehicleType);

  const passengerName =
    booking.contactName ||
    userProfile?.name ||
    currentUser?.displayName ||
    "Lead Traveler";

  const passengerPhone =
    booking.contactPhone ||
    userProfile?.phone ||
    currentUser?.phoneNumber ||
    "Registered Phone";

  const driverAssignedStatuses = [
    "driver_assigned",
    "driver_en_route",
    "driver_arrived",
    "trip_started",
    "ongoing",
    "trip_completed",
    "completed",
    "reviewed",
  ];
  const isDriverAssigned = driverAssignedStatuses.includes((booking.status || "").toLowerCase());

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
      
      {/* 1. CONTACT DETAILS CARD */}
      <div className="rounded-3xl border border-[#E2E8F0] dark:border-[#1E2E42] bg-white dark:bg-[#0E1A29] p-5 sm:p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0] dark:border-[#1E2E42]">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-orange block">
              Lead Traveler
            </span>
            <h3 className="font-extrabold text-base sm:text-lg text-charcoal dark:text-white">
              Customer & Contact Details
            </h3>
          </div>
        </div>

        <div className="space-y-3 text-xs">
          <div className="flex items-center justify-between p-3 rounded-2xl bg-[#F5F7FA] dark:bg-[#152436] border border-[#E2E8F0] dark:border-[#1E2E42]">
            <div>
              <span className="text-[10px] font-bold uppercase text-slate-400 block">
                Primary Contact
              </span>
              <p className="font-extrabold text-sm text-charcoal dark:text-white">
                {passengerName}
              </p>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-[10px]">
              Verified
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-2xl bg-[#F5F7FA] dark:bg-[#152436] border border-[#E2E8F0] dark:border-[#1E2E42]">
              <span className="text-[10px] font-bold uppercase text-slate-400 block">
                Contact Number
              </span>
              <p className="font-bold text-xs text-charcoal dark:text-white font-mono mt-0.5">
                {passengerPhone}
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-[#F5F7FA] dark:bg-[#152436] border border-[#E2E8F0] dark:border-[#1E2E42]">
              <span className="text-[10px] font-bold uppercase text-slate-400 block">
                Booking Reference
              </span>
              <p className="font-bold text-xs text-orange font-mono mt-0.5 truncate">
                #{booking.bookingId || booking.id}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. VEHICLE & DRIVER DETAILS */}
      <div className="rounded-3xl border border-[#E2E8F0] dark:border-[#1E2E42] bg-white dark:bg-[#0E1A29] p-5 sm:p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0] dark:border-[#1E2E42]">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-orange block">
              Fleet & Chauffeur
            </span>
            <h3 className="font-extrabold text-base sm:text-lg text-charcoal dark:text-white">
              Vehicle & Driver Details
            </h3>
          </div>
        </div>

        {/* Fleet Specifications */}
        <div className="p-3.5 rounded-2xl bg-[#F5F7FA] dark:bg-[#152436] border border-[#E2E8F0] dark:border-[#1E2E42] space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-extrabold text-charcoal dark:text-white">
              {vehicleMeta.name} — {vehicleMeta.seats}
            </span>
            <span className="text-orange font-bold text-[11px]">
              Reserved Private Cab
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Dedicated AC vehicle with executive legroom, sanitized cabin, and luggage boot space.
          </p>
        </div>

        {/* Driver Assignment Live Info */}
        <div className="p-3.5 rounded-2xl border border-dashed border-[#CBD5E1] dark:border-[#334155] bg-white dark:bg-[#0E1A29]">
          {isDriverAssigned && booking.driverName ? (
            <div className="flex items-center justify-between text-xs">
              <div>
                <span className="text-[10px] font-bold uppercase text-emerald-600 dark:text-emerald-400 block">
                  Assigned Driver
                </span>
                <p className="font-extrabold text-sm text-charcoal dark:text-white">
                  {booking.driverName}
                </p>
                {booking.driverPhone && (
                  <p className="text-[11px] text-slate-500 font-mono">
                    {booking.driverPhone}
                  </p>
                )}
              </div>
              {booking.vehicleNumber && (
                <div className="text-right">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">
                    Cab Number
                  </span>
                  <span className="font-mono font-extrabold text-xs px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-charcoal dark:text-white">
                    {booking.vehicleNumber}
                  </span>
                </div>
              )}
            </div>
          ) : (
            <div className="text-xs text-slate-500 dark:text-slate-400">
              <div>
                <p className="font-bold text-charcoal dark:text-white">
                  Chauffeur Assignment in Progress
                </p>
                <p className="text-[11px] text-slate-400">
                  Driver details & live GPS tracking will be sent 2 hours before pickup.
                </p>
              </div>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
