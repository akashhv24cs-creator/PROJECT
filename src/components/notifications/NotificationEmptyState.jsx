import { Link } from "react-router-dom";

export default function NotificationEmptyState({
  category = "all",
  searchQuery = "",
  onClearSearch,
}) {
  if (searchQuery) {
    return (
      <div className="rounded-3xl border border-[#E2E8F0] dark:border-[#1E2E42] bg-white dark:bg-[#0E1A29] p-8 sm:p-12 text-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-orange/10 text-orange border border-orange/20 flex items-center justify-center mx-auto">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <div className="space-y-1">
          <h3 className="font-extrabold text-base sm:text-lg text-charcoal dark:text-white">
            No matching notifications
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            No notifications found matching "{searchQuery}". Try searching with different keywords.
          </p>
        </div>
        {onClearSearch && (
          <button
            type="button"
            onClick={onClearSearch}
            className="py-2 px-4 rounded-xl border border-[#E2E8F0] dark:border-[#1E2E42] text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Clear Search
          </button>
        )}
      </div>
    );
  }

  const categoryHeadings = {
    all: {
      title: "You're all caught up",
      desc: "You don't have any new notifications right now.",
      cta: true,
    },
    bookings: {
      title: "No booking notifications",
      desc: "Your chauffeur assignments and trip status updates will appear here.",
      cta: true,
    },
    offers: {
      title: "No promotional offers",
      desc: "Seasonal outstation discounts and holiday deals will appear here.",
      cta: true,
    },
    updates: {
      title: "No system updates",
      desc: "Important account and policy updates will appear here.",
      cta: false,
    },
    reminders: {
      title: "No active reminders",
      desc: "Departure reminders for your scheduled journeys will appear here.",
      cta: false,
    },
  };

  const current = categoryHeadings[category] || categoryHeadings.all;

  return (
    <div className="rounded-3xl border border-[#E2E8F0] dark:border-[#1E2E42] bg-white dark:bg-[#0E1A29] p-8 sm:p-12 text-center space-y-4">
      <div className="w-16 h-16 rounded-2xl bg-orange/10 text-orange border border-orange/20 flex items-center justify-center mx-auto">
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
      </div>

      <div className="space-y-1">
        <h3 className="font-extrabold text-lg sm:text-xl text-charcoal dark:text-white">
          {current.title}
        </h3>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
          {current.desc}
        </p>
      </div>

      {current.cta && (
        <div className="pt-2">
          <Link
            to="/packages"
            className="inline-flex items-center gap-2 py-2.5 px-5 rounded-2xl bg-orange hover:bg-orangeLight text-white font-bold text-xs shadow-md shadow-orange/20 transition-all"
          >
            <span>Explore Tour Packages</span>
            <span>→</span>
          </Link>
        </div>
      )}
    </div>
  );
}
