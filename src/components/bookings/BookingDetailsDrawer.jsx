import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import {
  getStatusConfig,
  formatDate,
  formatTime,
  formatDateTime,
  getDestinationImage,
  getVehicleInfo,
  NON_CANCELLABLE_STATUSES,
} from "./bookingUtils";
import { subscribeToBookingPayments } from "../../services/payment.service";
import { useAuth } from "../../hooks/useAuth";
import { LINKS } from "../../../index.js";

export default function BookingDetailsDrawer({
  isOpen,
  booking,
  onClose,
  onDownloadTicket,
  onCancelBooking,
}) {
  const { currentUser } = useAuth();
  const [payments, setPayments] = useState([]);
  const [paymentsLoading, setPaymentsLoading] = useState(false);

  // Close on ESC key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  // Subscribe to live payments for this booking
  useEffect(() => {
    if (!isOpen || !booking || !currentUser?.uid) {
      setPayments([]);
      return;
    }

    setPaymentsLoading(true);
    const targetBookingId = booking.bookingId || booking.id;

    const unsubscribe = subscribeToBookingPayments(
      currentUser.uid,
      targetBookingId,
      (livePayments) => {
        setPayments(livePayments);
        setPaymentsLoading(false);
      },
      (err) => {
        console.error("BookingDetailsDrawer payments error:", err);
        setPaymentsLoading(false);
      }
    );

    return () => {
      if (typeof unsubscribe === "function") unsubscribe();
    };
  }, [isOpen, booking, currentUser?.uid]);

  if (!booking) return null;

  const statusMeta = getStatusConfig(booking.status);
  const imageSrc = getDestinationImage(booking);
  const vehicleMeta = getVehicleInfo(booking.vehicleName || booking.vehicleType, booking.vehicleId);

  const startCity = booking.startLocation || "Bangalore";
  const endCity =
    booking.destination ||
    (Array.isArray(booking.majorDestinations) && booking.majorDestinations[0]) ||
    "Outstation Trip";

  const totalAmount = booking.totalFare || booking.totalAmount || booking.estimatedFare;
  const totalAmountPaid = payments.reduce((acc, p) => {
    const status = (p.status || "").toLowerCase();
    if (status !== "failed" && typeof p.amount === "number") {
      return acc + p.amount;
    }
    return acc;
  }, 0);

  const balanceDue =
    typeof totalAmount === "number" && totalAmount > 0
      ? Math.max(0, totalAmount - totalAmountPaid)
      : null;

  const isCancelled = booking.status?.toLowerCase() === "cancelled";
  const canCancel =
    booking && !NON_CANCELLABLE_STATUSES.includes(booking.status?.toLowerCase());

  const bookingCode = booking.bookingId || booking.id;

  // Refund info
  const refundInfo = (() => {
    for (const pmt of payments) {
      if (pmt.refundStatus || typeof pmt.refundAmount === "number" || pmt.refundedAt) {
        return {
          status: pmt.refundStatus || "Processing",
          amount: pmt.refundAmount || 0,
          date: pmt.refundedAt || pmt.refundInitiatedAt,
          reason: pmt.deductionReason,
        };
      }
    }
    if (booking.refundStatus || typeof booking.refundAmount === "number") {
      return {
        status: booking.refundStatus || "Processing",
        amount: booking.refundAmount || 0,
        date: booking.refundedAt || booking.cancelledAt,
        reason: booking.deductionReason,
      };
    }
    return null;
  })();

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
          
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 dark:bg-black/75 backdrop-blur-sm transition-opacity"
            aria-hidden="true"
          />

          {/* Slide-over Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 280 }}
            className="relative w-full max-w-lg bg-white dark:bg-[#0E1A29] border-l border-[#E2E8F0] dark:border-[#1E2E42] shadow-2xl flex flex-col h-full z-10 overflow-hidden"
          >
            {/* Drawer Top Header */}
            <div className="p-5 sm:p-6 border-b border-[#E2E8F0] dark:border-[#1E2E42] flex items-center justify-between gap-4 shrink-0 bg-white/80 dark:bg-[#0E1A29]/80 backdrop-blur-md sticky top-0 z-10">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${statusMeta.badgeClass}`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${statusMeta.dotClass}`} />
                    {statusMeta.label}
                  </span>

                  <span className="font-mono text-xs font-bold text-slate-500 dark:text-slate-400">
                    #{bookingCode}
                  </span>
                </div>

                <h2 className="font-extrabold text-lg sm:text-xl text-charcoal dark:text-white truncate">
                  Booking Details
                </h2>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="w-9 h-9 rounded-full bg-[#F5F7FA] dark:bg-[#152436] hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center transition-colors cursor-pointer"
                title="Close drawer"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Scrollable Content Body */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
              
              {/* Trip Hero Banner in Drawer */}
              <div className="relative rounded-2xl overflow-hidden border border-[#E2E8F0] dark:border-[#1E2E42] h-40 shrink-0">
                <img
                  src={imageSrc}
                  alt={endCity}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                <div className="absolute bottom-3 left-3 right-3 text-white">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-orange block">
                    {booking.vehicleType} • {vehicleMeta.seats}
                  </span>
                  <h3 className="font-extrabold text-xl leading-tight">
                    {startCity} → {endCity}
                  </h3>
                </div>
              </div>

              {/* 1. ROUTE VISUALIZATION TIMELINE */}
              <div className="p-4 sm:p-5 rounded-2xl bg-[#F5F7FA] dark:bg-[#07111F] border border-[#E2E8F0] dark:border-[#1E2E42] space-y-4">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
                  Route Timeline
                </span>

                {/* Origin */}
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="font-extrabold text-sm text-charcoal dark:text-white capitalize">
                        {startCity}
                      </h4>
                      <span className="font-mono text-xs font-bold text-orange">
                        {formatTime(booking.requestedStartDate)}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Doorstep Pickup / City Origin
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {formatDate(booking.requestedStartDate)}
                    </p>
                  </div>
                </div>

                {/* Vertical Connector Line & Intermediate Stops */}
                <div className="ml-3 pl-6 border-l-2 border-dashed border-orange/40 py-1 space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                    <span className="text-[11px] font-semibold text-orange">
                      {booking.majorDestinations?.length > 1
                        ? `Via ${booking.majorDestinations.slice(0, 2).join(", ")}`
                        : "Direct Chauffeur Route"}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">Express Journey</span>
                  </div>

                  {booking.majorDestinations && booking.majorDestinations.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {booking.majorDestinations.map((dest, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded-md bg-white dark:bg-[#0E1A29] border border-[#E2E8F0] dark:border-[#1E2E42] text-[10px] font-semibold text-slate-600 dark:text-slate-300"
                        >
                          {dest}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Destination */}
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-orange/20 text-orange border border-orange/30 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="w-2 h-2 rounded-full bg-orange" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="font-extrabold text-sm text-charcoal dark:text-white capitalize">
                        {endCity}
                      </h4>
                      <span className="font-mono text-xs font-bold text-slate-400">
                        {booking.requestedEndDate ? formatDate(booking.requestedEndDate, false) : "Scheduled Return"}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Destination Drop & Outstation Itinerary
                    </p>
                  </div>
                </div>
              </div>

              {/* 2. TRIP SPECS & PASSENGERS */}
              <div className="p-4 sm:p-5 rounded-2xl bg-[#F5F7FA] dark:bg-[#07111F] border border-[#E2E8F0] dark:border-[#1E2E42] space-y-3">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
                  Trip Specifications
                </span>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-2.5 rounded-xl bg-white dark:bg-[#0E1A29] border border-[#E2E8F0] dark:border-[#1E2E42]">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block mb-0.5">
                      Vehicle Type
                    </span>
                    <span className="font-extrabold text-charcoal dark:text-white">
                      {booking.vehicleType}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-white dark:bg-[#0E1A29] border border-[#E2E8F0] dark:border-[#1E2E42]">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block mb-0.5">
                      Capacity
                    </span>
                    <span className="font-extrabold text-charcoal dark:text-white">
                      {vehicleMeta.seats}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-white dark:bg-[#0E1A29] border border-[#E2E8F0] dark:border-[#1E2E42]">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block mb-0.5">
                      Booking Date
                    </span>
                    <span className="font-semibold text-charcoal dark:text-slate-200">
                      {formatDateTime(booking.createdAt)}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-white dark:bg-[#0E1A29] border border-[#E2E8F0] dark:border-[#1E2E42]">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block mb-0.5">
                      GPS Tracking
                    </span>
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Live Enabled
                    </span>
                  </div>
                </div>
              </div>

              {/* 3. DRIVER NOTICE / STATUS */}
              {!isCancelled && (
                <div className="p-4 rounded-2xl bg-sky-500/10 border border-sky-500/20 text-xs flex items-start gap-3">
                  <div className="space-y-0.5 flex-1">
                    <h4 className="font-extrabold text-sky-900 dark:text-sky-200">
                      {booking.assignedAt ? "Driver Assigned" : "Commercial Driver Assignment"}
                    </h4>
                    <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-snug">
                      {booking.assignedAt
                        ? `Assigned on ${formatDateTime(booking.assignedAt)}. Vehicle registration & driver contact details are active.`
                        : "Verified chauffeur & vehicle license details are dispatched prior to your scheduled departure."}
                    </p>
                  </div>
                </div>
              )}

              {/* 4. PAYMENT BREAKDOWN SUMMARY */}
              <div className="p-4 sm:p-5 rounded-2xl bg-[#F5F7FA] dark:bg-[#07111F] border border-[#E2E8F0] dark:border-[#1E2E42] space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-[#E2E8F0] dark:border-[#1E2E42]">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                    Payment Summary
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">INR (₹)</span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 dark:text-slate-400">Estimated Total Fare</span>
                    <span className="font-extrabold text-charcoal dark:text-white font-mono">
                      {totalAmount ? `₹${Number(totalAmount).toLocaleString("en-IN")}` : "Calculated at end"}
                    </span>
                  </div>

                  {totalAmountPaid > 0 && (
                    <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400 font-semibold">
                      <span>Advance Amount Paid</span>
                      <span className="font-mono font-bold">-₹{totalAmountPaid.toLocaleString("en-IN")}</span>
                    </div>
                  )}

                  {balanceDue !== null && !isCancelled && (
                    <div className="pt-2 border-t border-[#E2E8F0] dark:border-[#1E2E42] flex items-center justify-between font-extrabold">
                      <span className="text-orange">Balance Due to Driver at Trip End</span>
                      <span className="text-base text-orange font-mono">
                        ₹{balanceDue.toLocaleString("en-IN")}
                      </span>
                    </div>
                  )}
                </div>

                {/* Refund Section if cancelled */}
                {isCancelled && refundInfo && (
                  <div className="mt-3 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs space-y-1.5">
                    <div className="flex items-center justify-between font-bold text-rose-700 dark:text-rose-300">
                      <span>Refund Status</span>
                      <span className="uppercase text-[10px]">{refundInfo.status}</span>
                    </div>
                    {refundInfo.amount > 0 ? (
                      <p className="font-extrabold text-emerald-600 dark:text-emerald-400 font-mono text-sm">
                        Refund Amount: ₹{refundInfo.amount.toLocaleString("en-IN")}
                      </p>
                    ) : (
                      <p className="text-slate-500 dark:text-slate-400">No refund applicable.</p>
                    )}
                    {refundInfo.reason && (
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        {refundInfo.reason}
                      </p>
                    )}
                  </div>
                )}
              </div>

            </div>

            {/* Drawer Bottom Actions */}
            <div className="p-4 sm:p-5 border-t border-[#E2E8F0] dark:border-[#1E2E42] bg-white/95 dark:bg-[#0E1A29]/95 backdrop-blur-md shrink-0 flex flex-col gap-2.5">
              <div className="flex items-center gap-2">
                {!isCancelled && (
                  <button
                    type="button"
                    onClick={() => {
                      onDownloadTicket(booking);
                    }}
                    className="flex-1 py-3 px-4 rounded-xl bg-orange hover:bg-orangeLight text-white font-bold text-xs transition-all shadow-md shadow-orange/25 cursor-pointer flex items-center justify-center gap-2"
                  >
                    <span>Download / Print Ticket</span>
                  </button>
                )}

                <a
                  href={`${LINKS.whatsapp}?text=${encodeURIComponent(
                    `Hello Zenera Support, I need help with my booking #${bookingCode}.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-3 px-4 rounded-xl border border-[#E2E8F0] dark:border-[#1E2E42] hover:bg-black/5 dark:hover:bg-white/5 text-slate-700 dark:text-slate-200 font-bold text-xs transition-all flex items-center justify-center gap-1.5"
                  title="Contact WhatsApp Support"
                >
                  <span className="hidden sm:inline">Support</span>
                </a>
              </div>

              {canCancel && onCancelBooking && (
                <button
                  type="button"
                  onClick={() => {
                    onCancelBooking(booking);
                  }}
                  className="w-full py-2 px-3 rounded-xl hover:bg-rose-500/10 text-rose-600 dark:text-rose-400 font-bold text-xs transition-colors cursor-pointer text-center"
                >
                  Cancel Booking
                </button>
              )}
            </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
