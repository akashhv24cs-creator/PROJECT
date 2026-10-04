import { useState, useMemo } from "react";
import CheckoutPriceBreakdown from "./CheckoutPriceBreakdown";
import { formatDate, formatTime } from "../bookings/bookingUtils";
import { calculateAuthoritativeFare } from "../../services/fleet.service";
import { calculateFareWithGST, validateFareDetails } from "../../utils/fareCalculation";

export default function CheckoutBookingSummary({ booking }) {
  const [mobileExpanded, setMobileExpanded] = useState(false);

  if (!booking) return null;

  const vehicleName = booking.vehicleName || booking.vehicleType || "Selected Vehicle";
  const startLoc = booking.pickupLocation || booking.startLocation || booking.origin || booking.pickup || "Pickup Location";
  const destinations = booking.majorDestinations || (booking.destination ? [booking.destination] : []);
  const destLoc = destinations[0] || booking.destination || "Destination";

  const advancePercent =
    typeof booking.advancePercent === "number" && booking.advancePercent > 0
      ? booking.advancePercent
      : 25;

  // Authoritatively derive complete fare details identical to fleets calculation engine
  const fareDetails = useMemo(() => {
    if (!booking) return null;

    const rawBase =
      typeof booking.baseFare === "number" && booking.baseFare > 0
        ? booking.baseFare
        : typeof booking.baseVehicleFare === "number" && booking.baseVehicleFare > 0
          ? booking.baseVehicleFare
          : typeof booking.baseCharges === "number" && booking.baseCharges > 0
            ? booking.baseCharges
            : 0;

    const rawDriver =
      typeof booking.driverAllowance === "number" && booking.driverAllowance >= 0
        ? booking.driverAllowance
        : typeof booking.totalAllowance === "number" && booking.totalAllowance >= 0
          ? booking.totalAllowance
          : 0;

    const advPct = typeof booking?.advancePercent === "number" && booking.advancePercent > 0 ? booking.advancePercent : 25;
    const rawPlatform = typeof booking.platformFee === "number" ? booking.platformFee : 95;
    const rawGst = typeof booking.gst === "number" ? booking.gst : typeof booking.taxes === "number" ? booking.taxes : typeof booking.gstAmount === "number" ? booking.gstAmount : 0;
    const rawTotal = typeof booking.totalFare === "number" && booking.totalFare > 0 ? booking.totalFare : typeof booking.totalAmount === "number" && booking.totalAmount > 0 ? booking.totalAmount : typeof booking.estimatedFare === "number" && booking.estimatedFare > 0 ? booking.estimatedFare : 0;
    const rawAdvance = typeof booking.advanceAmount === "number" && booking.advanceAmount > 0 ? booking.advanceAmount : (rawTotal > 0 ? Math.round(rawTotal * (advPct / 100)) : 0);
    const rawBalance = typeof booking.balanceDue === "number" && booking.balanceDue > 0 ? booking.balanceDue : typeof booking.remainingBalance === "number" && booking.remainingBalance > 0 ? booking.remainingBalance : (rawTotal > 0 ? Math.max(0, rawTotal - rawAdvance) : 0);

    // If booking already has stored total and base fare from the Fleets page, return exact stored structure
    if (rawTotal > 0 && rawBase > 0) {
      return {
        baseCharges: rawBase,
        driverAllowance: rawDriver,
        platformFee: rawPlatform,
        subtotal: rawBase + rawDriver + rawPlatform,
        gstRate: 0.05,
        gst: rawGst || Math.round((rawBase + rawDriver + rawPlatform) * 0.05),
        totalFare: rawTotal,
        advance: rawAdvance,
        balance: rawBalance,
        tripDays: booking.tripDays || 1,
      };
    }

    // 1. If base fare and driver allowance are directly available from Fleets page, compute exact breakdown
    if (rawBase > 0) {
      try {
        const details = calculateFareWithGST(rawBase, rawDriver);
        if (validateFareDetails(details)) {
          const advAmt = rawAdvance || Math.round(details.totalFare * (advancePercent / 100));
          const balAmt = rawBalance || Math.max(0, details.totalFare - advAmt);

          return {
            ...details,
            tripDays: booking.tripDays || 1,
            advance: advAmt,
            balance: balAmt,
          };
        }
      } catch (_) {}
    }

    // 2. Authoritative Pure Engine Fallback
    try {
      const authFare = calculateAuthoritativeFare({
        vehicle: booking.vehicleId || booking.selectedVehicleId || booking.vehicleType || booking.vehicleName || "sedan",
        origin: startLoc,
        destination: destLoc,
        destinations: destinations,
        secondaryStops: booking.detailedDestinations || booking.secondaryStops,
        orderedItinerary: booking.orderedItinerary,
        routeDistanceKm: booking.routeDistanceKm || booking.actualDistanceKm,
        tripDays: booking.tripDays,
        startDate: booking.startDate || booking.requestedStartDate,
        endDate: booking.endDate || booking.requestedEndDate,
        advancePercent: advancePercent,
      });

      if (authFare) {
        return {
          baseCharges: authFare.baseVehicleFare || authFare.baseFare,
          driverAllowance: authFare.driverAllowance,
          platformFee: authFare.platformFee || 95,
          subtotal: authFare.subtotal || (authFare.baseFare + authFare.driverAllowance + 95),
          gst: authFare.gst,
          totalFare: authFare.totalEstimate || authFare.totalFare,
          advance: authFare.advanceAmount,
          balance: authFare.balanceDue,
          tripDays: authFare.tripDays,
        };
      }
    } catch (_) {}

    return null;
  }, [booking, startLoc, destLoc, destinations, advancePercent]);

  const totalAmount =
    (typeof booking.totalFare === "number" && booking.totalFare > 0)
      ? booking.totalFare
      : (typeof booking.totalAmount === "number" && booking.totalAmount > 0)
        ? booking.totalAmount
        : (typeof booking.estimatedFare === "number" && booking.estimatedFare > 0)
          ? booking.estimatedFare
          : (typeof fareDetails?.totalFare === "number" && fareDetails.totalFare > 0)
            ? fareDetails.totalFare
            : 0;

  const payableNow =
    (typeof booking.advanceAmount === "number" && booking.advanceAmount > 0)
      ? booking.advanceAmount
      : (typeof booking.advanceFare === "number" && booking.advanceFare > 0)
        ? booking.advanceFare
        : (typeof fareDetails?.advance === "number" && fareDetails.advance > 0)
          ? fareDetails.advance
          : totalAmount > 0
            ? Math.round((totalAmount * advancePercent) / 100)
            : 0;

  const baseFare =
    (typeof booking.baseFare === "number" && booking.baseFare > 0)
      ? booking.baseFare
      : (typeof booking.baseVehicleFare === "number" && booking.baseVehicleFare > 0)
        ? booking.baseVehicleFare
        : (typeof booking.baseCharges === "number" && booking.baseCharges > 0)
          ? booking.baseCharges
          : (fareDetails?.baseCharges || 0);

  const driverAllowance =
    (typeof booking.driverAllowance === "number" && booking.driverAllowance >= 0)
      ? booking.driverAllowance
      : (typeof booking.totalAllowance === "number" && booking.totalAllowance >= 0)
        ? booking.totalAllowance
        : (fareDetails?.driverAllowance || 0);

  const platformFee =
    (typeof booking.platformFee === "number" && booking.platformFee > 0)
      ? booking.platformFee
      : (fareDetails?.platformFee || 95);

  const gst =
    (typeof booking.gst === "number" && booking.gst >= 0)
      ? booking.gst
      : (typeof booking.taxes === "number" && booking.taxes >= 0)
        ? booking.taxes
        : (typeof booking.gstAmount === "number" && booking.gstAmount >= 0)
          ? booking.gstAmount
          : (fareDetails?.gst || Math.round((baseFare + driverAllowance + platformFee) * 0.05));

  const balanceDue =
    (typeof booking.balanceDue === "number" && booking.balanceDue > 0)
      ? booking.balanceDue
      : (typeof booking.remainingBalance === "number" && booking.remainingBalance > 0)
        ? booking.remainingBalance
        : (typeof fareDetails?.balance === "number" && fareDetails.balance > 0)
          ? fareDetails.balance
          : Math.max(0, totalAmount - payableNow);

  const tripDays =
    (typeof booking.tripDays === "number" && booking.tripDays > 0)
      ? booking.tripDays
      : (fareDetails?.tripDays || 1);

  const passengerCount = booking.passengersCount || (booking.passengerDetails?.length) || 1;
  const seats = booking.seats || booking.selectedSeats || [];

  return (
    <div className="rounded-3xl border border-[#E2E8F0] dark:border-[#1E2E42] bg-white dark:bg-[#0E1A29] p-5 sm:p-6 shadow-sm space-y-5">
      
      {/* Header & Vehicle Info */}
      <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0] dark:border-[#1E2E42]">
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-orange block">
            Trip Reservation
          </span>
          <h3 className="font-extrabold text-base sm:text-lg text-charcoal dark:text-white">
            Booking Summary
          </h3>
        </div>

        {/* Mobile Expand Toggle */}
        <button
          type="button"
          onClick={() => setMobileExpanded(!mobileExpanded)}
          className="lg:hidden px-2.5 py-1 rounded-lg bg-orange/10 text-orange text-xs font-bold flex items-center gap-1 cursor-pointer"
        >
          <span>{mobileExpanded ? "Hide Details" : "View Details"}</span>
          <svg
            className={`w-3.5 h-3.5 transform transition-transform ${
              mobileExpanded ? "rotate-180" : ""
            }`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {/* Vehicle Category & Route Capsule */}
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-orange/10 border border-orange/20 flex items-center justify-center text-orange shrink-0">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M8 7h8m-8 4h8m-8 4h4m5 4H7a2 2 0 01-2-2V5a2 2 0 012-2h10a2 2 0 012 2v14a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div>
            <h4 className="font-extrabold text-sm sm:text-base text-charcoal dark:text-white leading-tight">
              {vehicleName}
            </h4>
            <span className="text-[11px] font-semibold text-slate-400">
              AC Sanitized Outstation Fleet
            </span>
          </div>
        </div>

        {/* Route Timeline */}
        <div className="p-3.5 rounded-2xl bg-[#F5F7FA] dark:bg-[#152436] border border-[#E2E8F0] dark:border-[#1E2E42] space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-charcoal dark:text-white">
            <span className="truncate max-w-[100px]">{startLoc}</span>
            <div className="flex items-center gap-1 px-2 text-slate-400">
              <span className="w-1.5 h-1.5 rounded-full bg-orange" />
              <span className="w-8 sm:w-12 h-0.5 bg-orange/40" />
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            </div>
            <span className="truncate max-w-[100px] text-right">{destLoc}</span>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
            <span>{booking.time || booking.tripTime || formatTime(booking.requestedStartDate)}</span>
            <span className="text-[10px] text-slate-400 uppercase font-sans">Non-Stop Express</span>
            <span>Est. Arrival</span>
          </div>
        </div>
      </div>

      {/* Expanded Trip Details (Always visible on Desktop, collapsible on Mobile) */}
      <div className={`space-y-4 ${mobileExpanded ? "block" : "hidden lg:block"}`}>
        {/* Meta Info Grid */}
        <div className="grid grid-cols-2 gap-2.5 text-xs">
          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#152436]/60 border border-[#E2E8F0] dark:border-[#1E2E42] space-y-0.5">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Travel Date</span>
            <p className="font-bold text-charcoal dark:text-white text-xs truncate">
              {formatDate(booking.startDate || booking.requestedStartDate)}
            </p>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#152436]/60 border border-[#E2E8F0] dark:border-[#1E2E42] space-y-0.5">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Passengers</span>
            <p className="font-bold text-charcoal dark:text-white text-xs">
              {passengerCount} {passengerCount === 1 ? "Traveler" : "Travelers"}
            </p>
          </div>
        </div>

        {/* Seat Allocation (if exists) */}
        {seats.length > 0 && (
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-[#152436]/60 border border-[#E2E8F0] dark:border-[#1E2E42] text-xs">
            <span className="text-slate-400 font-bold">Assigned Seats</span>
            <span className="font-mono font-extrabold text-orange">
              {seats.join(", ")}
            </span>
          </div>
        )}

        {/* Route Legs & Distance Corridor (if present) */}
        {Array.isArray(booking.routeLegs || booking.legs) && (booking.routeLegs || booking.legs).length > 0 && (
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#152436]/60 border border-[#E2E8F0] dark:border-[#1E2E42] space-y-2 text-xs">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-1.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Itinerary Route Legs</span>
              <span className="font-mono text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                {booking.actualDistanceKm || booking.routeDistanceKm} km actual ({booking.billableDistanceKm} km billable)
              </span>
            </div>
            <div className="space-y-1">
              {(booking.routeLegs || booking.legs).map((leg, idx) => (
                <div key={idx} className="flex items-center justify-between text-slate-600 dark:text-slate-300 text-[11px]">
                  <div className="flex items-center gap-1.5 min-w-0 truncate">
                    <span className="w-1.5 h-1.5 rounded-full bg-orange shrink-0" />
                    <span className="truncate">{leg.from}</span>
                    <span className="text-slate-400">→</span>
                    <span className="truncate font-medium text-charcoal dark:text-white">{leg.to}</span>
                  </div>
                  <span className="font-mono font-semibold text-charcoal dark:text-white shrink-0 ml-2">
                    {leg.distanceKm} km
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Price Breakdown Accordion */}
        <CheckoutPriceBreakdown
          baseFare={baseFare}
          driverAllowance={driverAllowance}
          platformFee={platformFee}
          gst={gst}
          totalAmount={totalAmount}
          advancePercent={advancePercent}
          payableNow={payableNow}
          balanceDue={balanceDue}
          tripDays={tripDays || booking.tripDays || 1}
          vehicleName={vehicleName}
        />
      </div>


      {/* Authoritative Amount Highlight */}
      <div className="pt-3 border-t border-[#E2E8F0] dark:border-[#1E2E42] flex items-center justify-between">
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
            Deposit Due Now
          </span>
          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
            {advancePercent}% Advance Booking
          </span>
        </div>

        <div className="text-right">
          <p className="font-mono font-extrabold text-xl sm:text-2xl text-charcoal dark:text-white">
            ₹{payableNow.toLocaleString("en-IN")}
          </p>
          <p className="text-[10px] text-slate-400">
            Total Fare: ₹{totalAmount.toLocaleString("en-IN")}
          </p>
        </div>
      </div>

    </div>
  );
}
