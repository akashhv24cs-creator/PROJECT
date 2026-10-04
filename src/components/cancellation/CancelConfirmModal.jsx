import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cancelBooking } from "../../services/booking.service";
import { useAuth } from "../../hooks/useAuth";
import { formatDate } from "../bookings/bookingUtils";

export default function CancelConfirmModal({
  isOpen,
  booking,
  onClose,
  onSuccess,
}) {
  const { currentUser } = useAuth();
  const [cancelling, setCancelling] = useState(false);
  const [selectedReason, setSelectedReason] = useState("Change of travel plans");
  const [error, setError] = useState(null);

  if (!booking) return null;

  const startCity = booking.startLocation || "Bangalore";
  const endCity =
    booking.destination ||
    (Array.isArray(booking.majorDestinations) && booking.majorDestinations[0]) ||
    "Outstation";
  const bookingCode = booking.bookingId || booking.id;

  const cancellationReasons = [
    "Change of travel plans",
    "Emergency / Medical reasons",
    "Found alternative transport",
    "Weather / Destination conditions",
    "Booked by mistake",
    "Other reasons",
  ];

  const handleConfirmCancel = async () => {
    if (!currentUser?.uid || !booking?.id || cancelling) return;

    setCancelling(true);
    setError(null);

    try {
      const targetId = booking.bookingId || booking.id;
      const res = await cancelBooking(currentUser.uid, targetId, selectedReason);

      if (res.success) {
        if (onSuccess) {
          onSuccess({
            message: res.message || "Booking cancelled successfully.",
            refundAmount: res.refundAmount,
            deductionReason: res.deductionReason,
          });
        }
        onClose();
      } else {
        setError(res.error || "Unable to cancel booking. Please try again.");
      }
    } catch (err) {
      console.error("Cancel booking error:", err);
      setError("An unexpected error occurred. Please contact support.");
    } finally {
      setCancelling(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
          
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              if (!cancelling) onClose();
            }}
            className="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-sm"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-md bg-white dark:bg-[#0E1A29] rounded-3xl border border-[#E2E8F0] dark:border-[#1E2E42] shadow-2xl p-6 sm:p-7 space-y-5 z-10 text-charcoal dark:text-white"
          >
            {/* Header */}
            <div className="space-y-1.5">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 flex items-center justify-center text-xl font-bold mb-3">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="font-extrabold text-xl sm:text-2xl tracking-tight">
                Cancel this booking?
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                Please select a reason and confirm your trip cancellation.
              </p>
            </div>

            {/* Trip Preview */}
            <div className="p-3.5 rounded-2xl bg-[#F5F7FA] dark:bg-[#152436] border border-[#E2E8F0] dark:border-[#1E2E42] space-y-1 text-xs">
              <div className="flex items-center justify-between font-bold">
                <span className="truncate">
                  {startCity} → {endCity}
                </span>
                <span className="font-mono text-slate-400">#{bookingCode}</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {formatDate(booking.requestedStartDate)} • {booking.vehicleType}
              </p>
            </div>

            {/* Reason Selector */}
            <div className="space-y-1.5 text-xs">
              <label className="font-bold text-slate-700 dark:text-slate-200 block">
                Reason for Cancellation
              </label>
              <select
                value={selectedReason}
                onChange={(e) => setSelectedReason(e.target.value)}
                disabled={cancelling}
                className="w-full p-3 rounded-xl border border-[#CBD5E1] dark:border-[#334155] bg-[#F5F7FA] dark:bg-[#152436] text-charcoal dark:text-white font-medium text-xs focus:ring-2 focus:ring-orange focus:outline-none cursor-pointer"
              >
                {cancellationReasons.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            {/* Refund notice */}
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              Your eligible advance refund will be calculated automatically according to the cancellation policy and reversed to your source payment method.
            </p>

            {/* Error Message if any */}
            {error && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-semibold">
                {error}
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <button
                type="button"
                disabled={cancelling}
                onClick={onClose}
                className="w-full sm:flex-1 py-3 px-4 rounded-xl border border-[#E2E8F0] dark:border-[#1E2E42] hover:bg-slate-100 dark:hover:bg-[#152436] font-bold text-xs transition-colors cursor-pointer disabled:opacity-50"
              >
                Keep Booking
              </button>

              <button
                type="button"
                disabled={cancelling}
                onClick={handleConfirmCancel}
                className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition-all shadow-md shadow-rose-600/20 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {cancelling ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <span>Confirm Cancellation</span>
                )}
              </button>
            </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
