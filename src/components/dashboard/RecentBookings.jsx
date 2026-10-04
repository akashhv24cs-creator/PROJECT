import { parseDate } from "../bookings/bookingUtils";

const formatDate = (ts) => {
  if (!ts) return "N/A";
  const dateObj = parseDate(ts);
  if (!dateObj) return "Flexible Date";

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const day = dateObj.getDate();
  const month = months[dateObj.getMonth()];
  const year = dateObj.getFullYear();
  return `${day} ${month} ${year}`;
};

const formatStatusText = (status) => {
  if (!status) return "Trip";
  return status
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

export default function RecentBookings({ bookings = [], loading, onExploreRoutes }) {
  if (loading) {
    return (
      <div className="bg-theme-card border border-theme-border rounded-3xl p-6 sm:p-8 backdrop-blur-md flex flex-col items-center justify-center min-h-[300px] shadow-theme-card">
        <div className="w-8 h-8 border-2 border-orange border-t-transparent rounded-full animate-spin mb-3" />
        <span className="text-xs text-theme-text-muted font-body">Loading booking history...</span>
      </div>
    );
  }

  return (
    <div className="bg-theme-card border border-theme-border rounded-3xl p-6 sm:p-8 backdrop-blur-md flex flex-col justify-between shadow-theme-card transition-colors duration-200">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-theme-border">
        <h3 className="font-heading font-extrabold text-xl text-theme-text-primary tracking-tight">
          Recent Bookings
        </h3>
        <span className="text-xs text-theme-text-muted font-body font-medium">
          {bookings.length > 0 ? `${bookings.length} ${bookings.length === 1 ? "Trip" : "Trips"}` : "History"}
        </span>
      </div>

      {bookings.length > 0 ? (
        <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
          {bookings.map((item) => (
            <div
              key={item.id}
              onClick={() => {
                if (item?.id) {
                  window.location.href = `/bookings/${item.id}`;
                }
              }}
              className="p-4 rounded-2xl bg-theme-surface-secondary border border-theme-border hover:border-orange/40 hover:bg-theme-surface transition-all cursor-pointer space-y-2 group shadow-sm"
            >
              <div className="flex items-center justify-between">
                <span className="font-heading font-bold text-theme-text-primary group-hover:text-orange transition-colors text-sm capitalize">
                  {item.startLocation} → {item.majorDestinations?.join(", ") || "Outstation"}
                </span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-theme-surface text-theme-text-secondary border border-theme-border capitalize">
                  {formatStatusText(item.status)}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs text-theme-text-muted">
                <span className="font-mono">{item.vehicleType}</span>
                <div className="flex items-center gap-2">
                  <span>{formatDate(item.requestedStartDate || item.createdAt)}</span>
                  <span className="text-orange font-bold group-hover:translate-x-0.5 transition-transform">→</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="flex flex-col items-center justify-center text-center py-8 px-4">
          <div className="w-16 h-16 rounded-2xl bg-theme-surface-secondary border border-theme-border flex items-center justify-center mb-4 text-theme-text-muted">
            <svg className="w-8 h-8 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>

          <h4 className="font-heading font-bold text-lg text-theme-text-primary mb-1">
            No past trips yet
          </h4>

          <p className="font-body text-theme-text-secondary text-xs max-w-xs leading-relaxed mb-5">
            Your completed outstation trips, vehicle receipts, and route summaries will appear here once you take a trip.
          </p>

          <button
            onClick={onExploreRoutes}
            className="inline-flex items-center gap-1.5 text-orange hover:text-orangeLight font-heading font-bold text-xs transition-colors duration-200 cursor-pointer"
          >
            <span>Explore Popular Routes</span>
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}

