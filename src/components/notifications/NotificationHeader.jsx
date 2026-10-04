import { Link } from "react-router-dom";

export default function NotificationHeader({
  unreadCount = 0,
  onMarkAllAsRead,
  markingAll = false,
}) {
  return (
    <div className="pb-4 border-b border-[#E2E8F0] dark:border-[#1E2E42] space-y-3">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
        <Link to="/" className="hover:text-orange transition-colors">
          Home
        </Link>
        <span>/</span>
        <span className="text-charcoal dark:text-white">Notifications</span>
      </nav>

      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-extrabold text-2xl sm:text-3xl lg:text-4xl text-charcoal dark:text-white tracking-tight">
              Notifications
            </h1>
            {unreadCount > 0 && (
              <span className="px-2.5 py-0.5 rounded-full bg-orange/10 text-orange border border-orange/20 text-xs font-extrabold">
                {unreadCount} new
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Stay updated with your trips, booking progress, and special offers
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            type="button"
            onClick={onMarkAllAsRead}
            disabled={markingAll}
            className="self-start sm:self-auto py-2 px-4 rounded-xl bg-slate-100 dark:bg-[#152436] hover:bg-slate-200 dark:hover:bg-[#1C2F46] border border-[#E2E8F0] dark:border-[#1E2E42] text-charcoal dark:text-white hover:text-orange dark:hover:text-orange text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
          >
            <svg className="w-3.5 h-3.5 text-orange" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
            <span>{markingAll ? "Marking..." : "Mark all as read"}</span>
          </button>
        )}
      </div>
    </div>
  );
}
