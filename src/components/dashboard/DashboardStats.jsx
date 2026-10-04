export default function DashboardStats({ activeCount = 0, completedCount = 0, totalCount = 0 }) {
  const stats = [
    {
      label: "Active Bookings",
      value: String(activeCount),
      sub: activeCount > 0 ? "Active ride scheduled" : "Ready for new ride",
    },
    {
      label: "Trips Completed",
      value: String(completedCount),
      sub: completedCount > 0 ? "Past rides completed" : "First trip bonus ready",
    },
    {
      label: "Total Reservations",
      value: String(totalCount),
      sub: totalCount > 0 ? "Total bookings placed" : "Welcome bonus credited",
    },
    {
      label: "Booking Protection",
      value: "100%",
      sub: "Pay 25% to confirm",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 my-6">
      {stats.map((item) => (
        <div
          key={item.label}
          className="flex flex-col p-5 rounded-2xl bg-theme-card border border-theme-border shadow-theme-card hover:border-orange/30 hover:bg-orange/5 transition-all duration-300 group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="font-body text-theme-text-secondary text-xs font-medium">
              {item.label}
            </span>
          </div>

          <span className="font-heading font-extrabold text-2xl sm:text-3xl text-orange mb-1 group-hover:translate-x-0.5 transition-transform duration-200">
            {item.value}
          </span>

          <span className="font-body text-theme-text-muted text-[11px] font-medium">
            {item.sub}
          </span>
        </div>
      ))}
    </div>
  );
}

