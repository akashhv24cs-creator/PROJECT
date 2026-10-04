import { formatDate, formatTime } from "../bookings/bookingUtils";

export default function ConfirmationPaymentSummary({
  booking,
  payments = [],
}) {
  if (!booking) return null;

  const totalAmount = booking.totalAmount || booking.estimatedFare || booking.totalFare || 0;
  const advancePercent = booking.advancePercent || 25;
  const advancePaid = booking.advanceAmount || Math.round((totalAmount * advancePercent) / 100);
  const balanceDue = Math.max(0, totalAmount - advancePaid);

  const latestPayment = payments[0] || null;
  const paymentMethod = latestPayment?.method || "Cashfree Secure Gateway";
  const transactionId = latestPayment?.id || booking.paymentSessionId || booking.orderId || `CF-${(booking.bookingId || booking.id || "123456").slice(-8).toUpperCase()}`;

  const paymentDate = latestPayment?.createdAt || booking.createdAt || new Date();

  return (
    <div className="rounded-3xl border border-[#E2E8F0] dark:border-[#1E2E42] bg-white dark:bg-[#0E1A29] p-5 sm:p-6 shadow-sm space-y-4">
      
      {/* Header with Status Badge */}
      <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0] dark:border-[#1E2E42]">
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-orange block">
            Billing
          </span>
          <h3 className="font-extrabold text-base sm:text-lg text-charcoal dark:text-white">
            Payment Summary
          </h3>
        </div>

        <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[10px] font-extrabold uppercase tracking-wider">
          Advance Paid
        </span>
      </div>

      {/* Paid Amount Highlight */}
      <div className="p-4 rounded-2xl bg-emerald-500/[0.04] dark:bg-emerald-500/[0.06] border border-emerald-500/20 space-y-1">
        <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 dark:text-emerald-300 block">
          Deposit Settled
        </span>
        <p className="font-mono font-extrabold text-2xl sm:text-3xl text-emerald-600 dark:text-emerald-400">
          ₹{advancePaid.toLocaleString("en-IN")}
        </p>
        <p className="text-[11px] text-slate-500 dark:text-slate-400">
          Total Trip Value: ₹{totalAmount.toLocaleString("en-IN")}
        </p>
      </div>

      {/* Payment Ledger Metadata */}
      <div className="space-y-2 text-xs text-slate-500 dark:text-slate-400">
        <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#F5F7FA] dark:bg-[#152436] border border-[#E2E8F0] dark:border-[#1E2E42]">
          <span>Payment Channel</span>
          <span className="font-bold text-charcoal dark:text-white font-sans truncate max-w-[130px]">
            {paymentMethod}
          </span>
        </div>

        <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#F5F7FA] dark:bg-[#152436] border border-[#E2E8F0] dark:border-[#1E2E42]">
          <span>Transaction Ref</span>
          <span className="font-mono font-bold text-slate-600 dark:text-slate-300 truncate max-w-[130px]">
            {transactionId}
          </span>
        </div>

        <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#F5F7FA] dark:bg-[#152436] border border-[#E2E8F0] dark:border-[#1E2E42]">
          <span>Payment Date</span>
          <span className="font-medium text-slate-600 dark:text-slate-300">
            {formatDate(paymentDate)}
          </span>
        </div>

        {balanceDue > 0 && (
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-orange/5 dark:bg-orange/10 border border-orange/20 font-bold text-orange">
            <span>Balance to Chauffeur</span>
            <span className="font-mono font-extrabold text-sm">
              ₹{balanceDue.toLocaleString("en-IN")}
            </span>
          </div>
        )}
      </div>

      {/* Security Statement */}
      <div className="pt-2 flex items-center gap-2 text-[11px] text-slate-400">
        <svg className="w-4 h-4 text-emerald-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
        <span>Processed via 256-bit SSL encrypted gateway</span>
      </div>

    </div>
  );
}
