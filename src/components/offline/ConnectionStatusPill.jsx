export default function ConnectionStatusPill({ isOnline }) {
  return (
    <div
      className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-xs font-extrabold uppercase tracking-wider transition-colors ${
        isOnline
          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
          : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
      }`}
    >
      <span
        className={`w-2 h-2 rounded-full ${
          isOnline ? "bg-emerald-500 animate-pulse" : "bg-amber-500"
        }`}
      />
      <span>{isOnline ? "Connection Restored" : "Offline Mode"}</span>
    </div>
  );
}
