import { resolveVehicle } from "../../services/fleet.service";

export const UPCOMING_STATUSES = [
  "pending",
  "confirmed",
  "driver_assigned",
  "driver_en_route",
  "driver_arrived",
  "trip_started",
  "ongoing",
];

export const COMPLETED_STATUSES = ["trip_completed", "completed", "reviewed"];
export const CANCELLED_STATUSES = ["cancelled"];

export const NON_CANCELLABLE_STATUSES = [
  "cancelled",
  "trip_started",
  "ongoing",
  "trip_completed",
  "completed",
  "reviewed",
];

export const STATUS_CONFIG = {
  pending: {
    label: "Payment Pending",
    badgeClass: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    dotClass: "bg-amber-500",
    category: "upcoming",
  },
  confirmed: {
    label: "Confirmed",
    badgeClass: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    dotClass: "bg-emerald-500",
    category: "upcoming",
  },
  driver_assigned: {
    label: "Driver Assigned",
    badgeClass: "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20",
    dotClass: "bg-sky-500",
    category: "upcoming",
  },
  driver_en_route: {
    label: "Driver En Route",
    badgeClass: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
    dotClass: "bg-blue-500",
    category: "upcoming",
  },
  driver_arrived: {
    label: "Driver Arrived",
    badgeClass: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20",
    dotClass: "bg-indigo-500",
    category: "upcoming",
  },
  trip_started: {
    label: "Trip In Progress",
    badgeClass: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20 animate-pulse",
    dotClass: "bg-purple-500",
    category: "upcoming",
  },
  ongoing: {
    label: "Trip Ongoing",
    badgeClass: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
    dotClass: "bg-purple-500",
    category: "upcoming",
  },
  trip_completed: {
    label: "Completed",
    badgeClass: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    dotClass: "bg-emerald-500",
    category: "completed",
  },
  completed: {
    label: "Completed",
    badgeClass: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    dotClass: "bg-emerald-500",
    category: "completed",
  },
  reviewed: {
    label: "Completed",
    badgeClass: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    dotClass: "bg-emerald-500",
    category: "completed",
  },
  cancelled: {
    label: "Cancelled",
    badgeClass: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
    dotClass: "bg-rose-500",
    category: "cancelled",
  },
};

export const getStatusConfig = (status) => {
  if (!status || typeof status !== "string") {
    return {
      label: "Pending",
      badgeClass: "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20",
      dotClass: "bg-slate-400",
      category: "upcoming",
    };
  }
  const key = status.toLowerCase();
  return (
    STATUS_CONFIG[key] || {
      label: formatStatusText(status),
      badgeClass: "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20",
      dotClass: "bg-slate-400",
      category: "upcoming",
    }
  );
};

export const formatStatusText = (status) => {
  if (!status || typeof status !== "string") return "Pending";
  return status
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

export const parseDate = (ts) => {
  if (!ts) return null;
  try {
    if (ts instanceof Date && !isNaN(ts.getTime())) return ts;
    if (ts.toDate && typeof ts.toDate === "function") {
      const d = ts.toDate();
      if (d instanceof Date && !isNaN(d.getTime())) return d;
    }
    if (typeof ts.seconds === "number") {
      const d = new Date(ts.seconds * 1000 + (ts.nanoseconds ? ts.nanoseconds / 1000000 : 0));
      if (!isNaN(d.getTime())) return d;
    }
    if (typeof ts._seconds === "number") {
      const d = new Date(ts._seconds * 1000 + (ts._nanoseconds ? ts._nanoseconds / 1000000 : 0));
      if (!isNaN(d.getTime())) return d;
    }
    if (typeof ts === "string" || typeof ts === "number") {
      const d = new Date(ts);
      if (!isNaN(d.getTime())) return d;
    }
  } catch {
    return null;
  }
  return null;
};

export const formatDate = (ts, includeDay = true) => {
  try {
    const d = parseDate(ts);
    if (!d) return "Flexible Date";

    const options = {
      day: "numeric",
      month: "short",
      year: "numeric",
      ...(includeDay ? { weekday: "short" } : {}),
    };

    return d.toLocaleDateString("en-IN", options);
  } catch {
    return "Flexible Date";
  }
};

export const formatTime = (ts) => {
  try {
    const d = parseDate(ts);
    if (!d) return "07:30 AM";
    return d.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return "07:30 AM";
  }
};

export const formatDateTime = (ts) => {
  try {
    const d = parseDate(ts);
    if (!d) return "—";
    return d.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "—";
  }
};

export const getDestinationImage = (booking) => {
  if (!booking) return "/tour-packages-hero.jpg";
  try {
    const major = Array.isArray(booking.majorDestinations)
      ? booking.majorDestinations.join(" ")
      : typeof booking.majorDestinations === "string"
      ? booking.majorDestinations
      : "";
    const detailed = Array.isArray(booking.detailedDestinations)
      ? booking.detailedDestinations.join(" ")
      : typeof booking.detailedDestinations === "string"
      ? booking.detailedDestinations
      : "";
    const text = [
      booking.destination || "",
      major,
      detailed,
      booking.startLocation || "",
    ]
      .join(" ")
      .toLowerCase();

    if (text.includes("coorg") || text.includes("madikeri") || text.includes("kushalnagar")) {
      return "/destinations/coorg.jpg";
    }
    if (text.includes("ooty") || text.includes("nilgiri") || text.includes("coonoor")) {
      return "/destinations/ooty.jpg";
    }
    if (text.includes("chikmagalur") || text.includes("mullayanagiri") || text.includes("kudremukh")) {
      return "/destinations/chikmagalur.jpg";
    }
    if (text.includes("gokarna") || text.includes("murudeshwar") || text.includes("karwar")) {
      return "/destinations/gokarna.jpg";
    }
    if (text.includes("kerala") || text.includes("munnar") || text.includes("wayanad") || text.includes("alleppey")) {
      return "/destinations/kerala.jpg";
    }
    if (text.includes("mysore") || text.includes("mysuru") || text.includes("chamundi")) {
      return "/destinations/mysore.jpg";
    }
  } catch {
    return "/tour-packages-hero.jpg";
  }
  return "/tour-packages-hero.jpg";
};

export const getVehicleInfo = (vehicleType, vehicleId) => {
  try {
    const input = vehicleId || vehicleType;
    if (!input) {
      const def = resolveVehicle(null);
      return { id: def.id, name: def.name, seats: def.seats, icon: "", price: `₹${def.pricePerKm || def.backendRatePerKm}/km` };
    }
    const v = resolveVehicle(input);
    return {
      id: v.id,
      name: v.name,
      seats: v.seats,
      icon: "",
      price: `₹${v.pricePerKm || v.backendRatePerKm}/km`,
    };
  } catch {
    return { name: String(vehicleType || "Vehicle"), seats: "4–7 seats", icon: "", price: "Standard Fare" };
  }
};
