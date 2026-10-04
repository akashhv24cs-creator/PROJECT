import { useNavigate } from "react-router-dom";

export default function NotificationCard({
  notification,
  onMarkAsRead,
}) {
  const navigate = useNavigate();
  const { id, type = "general", category = "general", title, message, sentAt, read, actionUrl } = notification;

  const isUnread = !read;

  // Format sentAt timestamp
  const formatTime = (ts) => {
    if (!ts) return "";
    try {
      let d = null;
      if (ts.toDate && typeof ts.toDate === "function") d = ts.toDate();
      else if (ts.seconds) d = new Date(ts.seconds * 1000);
      else if (typeof ts === "string" || typeof ts === "number") d = new Date(ts);
      if (d && !isNaN(d.getTime())) {
        return d.toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        });
      }
    } catch {
      return "";
    }
    return "";
  };

  const getIcon = () => {
    switch (category) {
      case "bookings":
        return (
          <div className="w-10 h-10 rounded-2xl bg-orange/10 text-orange border border-orange/20 flex items-center justify-center shrink-0">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
            </svg>
          </div>
        );
      case "offers":
        return (
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center justify-center shrink-0">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
          </div>
        );
      case "reminders":
        return (
          <div className="w-10 h-10 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 flex items-center justify-center shrink-0">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="w-10 h-10 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 flex items-center justify-center shrink-0">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </div>
        );
    }
  };

  const handleClick = () => {
    if (isUnread && onMarkAsRead) {
      onMarkAsRead(id);
    }
    if (actionUrl) {
      navigate(actionUrl);
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`group relative p-4 sm:p-5 rounded-3xl border transition-all duration-200 cursor-pointer ${
        isUnread
          ? "bg-white dark:bg-[#0E1A29] border-orange/40 dark:border-orange/30 shadow-sm hover:border-orange hover:shadow-md"
          : "bg-white/80 dark:bg-[#0E1A29]/70 border-[#E2E8F0] dark:border-[#1E2E42] hover:border-slate-300 dark:hover:border-slate-700"
      }`}
    >
      <div className="flex items-start gap-3.5 sm:gap-4">
        {/* Semantic Icon */}
        {getIcon()}

        {/* Content Body */}
        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-start justify-between gap-3">
            <h3
              className={`text-xs sm:text-sm tracking-tight truncate ${
                isUnread
                  ? "font-extrabold text-charcoal dark:text-white"
                  : "font-bold text-slate-700 dark:text-slate-200"
              }`}
            >
              {title}
            </h3>

            {/* Timestamp & Unread Dot */}
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-[11px] font-medium text-slate-400 font-mono">
                {formatTime(sentAt)}
              </span>
              {isUnread && (
                <span
                  className="w-2 h-2 rounded-full bg-orange animate-pulse"
                  title="Unread notification"
                />
              )}
            </div>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
            {message}
          </p>

          {/* Action Link Hint */}
          {actionUrl && (
            <div className="pt-1 flex items-center gap-1 text-[11px] font-bold text-orange opacity-90 group-hover:opacity-100 transition-opacity">
              <span>View details</span>
              <svg className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
