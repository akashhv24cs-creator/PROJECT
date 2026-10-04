import { Link } from "react-router-dom";

export default function CancellationHeader({ bookingId }) {
  return (
    <div className="pb-4 border-b border-[#E2E8F0] dark:border-[#1E2E42] space-y-3">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
        <Link to="/" className="hover:text-orange transition-colors">
          Home
        </Link>
        <span>/</span>
        <Link to="/bookings" className="hover:text-orange transition-colors">
          Bookings
        </Link>
        <span>/</span>
        <span className="text-charcoal dark:text-white">Cancellation & Refund</span>
      </nav>

      {/* Title & Ref */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-extrabold text-2xl sm:text-3xl lg:text-4xl text-charcoal dark:text-white tracking-tight">
              Cancellation & Refund
            </h1>
            {bookingId && (
              <span className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-[#152436] border border-[#E2E8F0] dark:border-[#1E2E42] text-[11px] font-mono font-extrabold text-slate-600 dark:text-slate-300">
                #{bookingId.slice(-6).toUpperCase()}
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Review your cancellation timeline, breakdown of charges, and automated refund settlement
          </p>
        </div>
      </div>
    </div>
  );
}
