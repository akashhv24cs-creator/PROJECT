import { Link } from "react-router-dom";

export default function CheckoutStatusModal({
  status,
  errorMessage,
  onRetry,
  onClose,
  bookingId,
}) {
  if (!status) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/70 dark:bg-black/85 backdrop-blur-sm" />

      <div className="relative w-full max-w-md bg-white dark:bg-[#0E1A29] rounded-3xl border border-[#E2E8F0] dark:border-[#1E2E42] shadow-2xl p-6 sm:p-8 space-y-5 z-10 text-charcoal dark:text-white text-center">
        
        {/* Processing State */}
        {status === "processing" && (
          <div className="space-y-4 py-2">
            <div className="w-16 h-16 rounded-3xl bg-orange/10 text-orange border border-orange/20 flex items-center justify-center mx-auto">
              <div className="w-8 h-8 border-3 border-orange border-t-transparent rounded-full animate-spin" />
            </div>
            <div className="space-y-1">
              <h3 className="font-extrabold text-lg sm:text-xl">
                Verifying Payment...
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Please wait while we verify your transaction with Cashfree Payments.
              </p>
            </div>
          </div>
        )}

        {/* Failed State */}
        {status === "failed" && (
          <div className="space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 flex items-center justify-center mx-auto text-2xl">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <div className="space-y-1">
              <h3 className="font-extrabold text-lg sm:text-xl text-rose-600 dark:text-rose-400">
                Payment Unsuccessful
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {errorMessage || "We couldn't complete your transaction. Your booking has not been confirmed."}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <button
                type="button"
                onClick={onRetry}
                className="w-full py-3 px-4 rounded-xl bg-orange hover:bg-orangeLight text-white font-extrabold text-xs transition-all shadow-md shadow-orange/20 cursor-pointer"
              >
                Try Again
              </button>
              <Link
                to={bookingId ? `/bookings/${bookingId}` : "/bookings"}
                className="w-full py-3 px-4 rounded-xl border border-[#E2E8F0] dark:border-[#1E2E42] text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold transition-colors text-center"
              >
                Back to Booking
              </Link>
            </div>
          </div>
        )}

        {/* Pending State */}
        {status === "pending" && (
          <div className="space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 flex items-center justify-center mx-auto text-2xl">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="space-y-1">
              <h3 className="font-extrabold text-lg sm:text-xl text-amber-600 dark:text-amber-400">
                Payment Processing
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Your transaction is awaiting final bank confirmation. Please do not initiate another payment.
              </p>
            </div>
            <div className="pt-2">
              <Link
                to={bookingId ? `/bookings/${bookingId}` : "/bookings"}
                className="inline-block w-full py-3 px-4 rounded-xl bg-orange hover:bg-orangeLight text-white font-extrabold text-xs transition-all shadow-md shadow-orange/20 text-center"
              >
                View Booking Status
              </Link>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
