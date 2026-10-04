import { motion } from "framer-motion";

export default function NotificationTabs({
  activeTab,
  onChangeTab,
  counts = {},
}) {
  const tabs = [
    { id: "all", label: "All", count: counts.all },
    { id: "bookings", label: "Bookings", count: counts.bookings },
    { id: "offers", label: "Offers", count: counts.offers },
    { id: "updates", label: "Updates", count: counts.updates },
    { id: "reminders", label: "Reminders", count: counts.reminders },
  ];

  return (
    <div className="border-b border-[#E2E8F0] dark:border-[#1E2E42] overflow-x-auto scrollbar-none">
      <div className="flex items-center gap-1 sm:gap-2 min-w-max pb-0.5">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const count = tab.count ?? 0;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onChangeTab(tab.id)}
              className={`relative py-3 px-3.5 sm:px-4 text-xs sm:text-sm font-bold transition-colors cursor-pointer flex items-center gap-2 rounded-t-xl ${
                isActive
                  ? "text-orange dark:text-orange font-extrabold"
                  : "text-slate-500 dark:text-slate-400 hover:text-charcoal dark:hover:text-white"
              }`}
            >
              <span>{tab.label}</span>
              {count > 0 && (
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold ${
                    isActive
                      ? "bg-orange/15 text-orange"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
                  }`}
                >
                  {count}
                </span>
              )}

              {/* Active Animated Underline */}
              {isActive && (
                <motion.div
                  layoutId="notification-tab-indicator"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange rounded-full"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
