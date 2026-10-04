import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cancelBooking } from "../../services/booking.service";
import { useAuth } from "../../hooks/useAuth";
import { formatDate } from "./bookingUtils";

export default function CancelBookingModal({
  isOpen,
  booking,
  onClose,
  onSuccess,
}) {
  const { currentUser } = useAuth();
  const [cancelling, setCancelling] = useState(false);
  const [error, setError] = useState(null);

  if (!booking) return null;

  const startCity = booking.startLocation || "Bangalore";
  const endCity =
    booking.destination ||
    (Array.isArray(booking.majorDestinations) && booking.majorDestinations[0]) ||
    "Outstation";
  const bookingCode = booking.bookingId || booking.id;

  const handleConfirmCancel = async () => {
    if (!currentUser?.uid || !booking?.id || cancelling) return;

    setCancelling(true);
    setError(null);

    try {
      const targetId = booking.bookingId || booking.id;
      const res = await cancelBooking(currentUser.uid, targetId);

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
              <h3 className="font-extrabold text-xl sm:text-2xl tracking-tight">
                Cancel this booking?
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                Please confirm that you want to cancel this trip.
              </p>
            </div>

            {/* Trip Preview Pill */}
            <div className="p-3.5 rounded-2xl bg-[#F5F7FA] dark:bg-[#07111F] border border-[#E2E8F0] dark:border-[#1E2E42] space-y-1 text-xs">
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

            {/* Refund notice */}
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
              Any eligible advance refund will be calculated automatically according to the standard cancellation policy and credited to your original payment method.
            </p>

            {/* Error banner if any */}
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
                className="w-full sm:flex-1 py-3 px-4 rounded-xl border border-[#E2E8F0] dark:border-[#1E2E42] hover:bg-black/5 dark:hover:bg-white/5 font-bold text-xs transition-colors cursor-pointer disabled:opacity-50"
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
                    <span>Cancelling...</span>
                  </>
                ) : (
                  <span>Cancel Booking</span>
                )}
              </button>
            </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
