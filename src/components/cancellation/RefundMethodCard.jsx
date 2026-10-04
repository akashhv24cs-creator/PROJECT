export default function RefundMethodCard({ booking, payments = [] }) {
  if (!booking) return null;

  const latestPayment = payments[0] || null;
  const paymentMethod = latestPayment?.method || "Original Payment Source (Cashfree Online)";
  const refCode = latestPayment?.id || booking.paymentSessionId || booking.orderId || `CF-${(booking.bookingId || booking.id || "123456").slice(-8).toUpperCase()}`;

  return (
    <div className="rounded-3xl border border-[#E2E8F0] dark:border-[#1E2E42] bg-white dark:bg-[#0E1A29] p-5 sm:p-6 shadow-sm space-y-3">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-orange/10 text-orange border border-orange/20 flex items-center justify-center shrink-0">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
        </div>
        <div>
          <h4 className="font-extrabold text-sm sm:text-base text-charcoal dark:text-white">
            Refund Method
          </h4>
          <p className="text-[11px] text-slate-400">
            Source Account Settlement
          </p>
        </div>
      </div>

      <div className="p-3 rounded-2xl bg-[#F5F7FA] dark:bg-[#152436] border border-[#E2E8F0] dark:border-[#1E2E42] space-y-1 text-xs">
        <div className="flex items-center justify-between">
          <span className="text-slate-400">Destination</span>
          <span className="font-bold text-charcoal dark:text-white truncate max-w-[150px]">
            {paymentMethod}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-slate-400">Payment Ref</span>
          <span className="font-mono text-slate-500 dark:text-slate-400 truncate max-w-[150px]">
            {refCode}
          </span>
        </div>
      </div>

      <p className="text-[11px] text-slate-400 leading-relaxed">
        Refunds are automatically reversed to the originating bank or UPI handle used during checkout.
      </p>
    </div>
  );
}
