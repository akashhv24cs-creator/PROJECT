import NotificationCard from "./NotificationCard";

export default function NotificationGroup({
  label,
  notifications = [],
  onMarkAsRead,
}) {
  if (!notifications || notifications.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 px-1">
        <span className="text-[11px] font-extrabold uppercase tracking-widest text-slate-400">
          {label}
        </span>
        <div className="flex-1 h-px bg-[#E2E8F0] dark:bg-[#1E2E42]" />
        <span className="text-[10px] font-mono font-bold text-slate-400">
          {notifications.length}
        </span>
      </div>

      <div className="space-y-2.5">
        {notifications.map((item) => (
          <NotificationCard
            key={item.id}
            notification={item}
            onMarkAsRead={onMarkAsRead}
          />
        ))}
      </div>
    </div>
  );
}
