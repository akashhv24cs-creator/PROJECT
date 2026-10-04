import { Link } from "react-router-dom";

export default function CheckoutHeader({ bookingId }) {
  return (
    <div className="pb-4 border-b border-[#E2E8F0] dark:border-[#1E2E42] space-y-3">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
        <Link to="/" className="hover:text-orange transition-colors">
          Home
        </Link>
        <span>/</span>
        <Link to="/bookings" className="hover:text-orange transition-colors">
          Bookings
        </Link>
        <span>/</span>
        <span className="text-charcoal dark:text-white">Secure Checkout</span>
      </nav>

      {/* Title & Security Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-extrabold text-2xl sm:text-3xl lg:text-4xl text-charcoal dark:text-white tracking-tight">
              Secure Checkout
            </h1>
            {bookingId && (
              <span className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-[#152436] border border-[#E2E8F0] dark:border-[#1E2E42] text-[11px] font-mono font-extrabold text-slate-600 dark:text-slate-300">
                #{bookingId.slice(-6).toUpperCase()}
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Complete your advance deposit to confirm your outstation trip and chauffeur dispatch
          </p>
        </div>

        {/* 100% Secure Badge */}
        <div className="self-start sm:self-auto flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 text-xs font-bold shrink-0">
          <svg className="w-4 h-4 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <span>256-Bit SSL Encrypted</span>
        </div>
      </div>
    </div>
  );
}
