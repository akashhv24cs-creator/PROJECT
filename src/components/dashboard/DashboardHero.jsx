import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { LINKS } from "../../../index.js";
import { parseDate } from "../bookings/bookingUtils";

const formatDateTime = (ts) => {
  if (!ts) return "N/A";
  const dateObj = parseDate(ts);
  if (!dateObj) return "—";

  return dateObj.toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatNotificationType = (type) => {
  if (!type) return { title: "Notification", desc: "You have a new update for your trip." };
  const lower = type.toLowerCase();
  const map = {
    driver_arrived: {
      title: "Driver Arrived",
      desc: "Your driver has arrived at your pickup location.",
    },
    driver_assigned: {
      title: "Driver Assigned",
      desc: "A driver has been assigned for your upcoming trip.",
    },
    driver_en_route: {
      title: "Driver En Route",
      desc: "Your driver is on the way to your pickup location.",
    },
    trip_started: {
      title: "Trip Started",
      desc: "Your journey has officially started. Have a pleasant trip!",
    },
    trip_completed: {
      title: "Trip Completed",
      desc: "Your trip has been completed successfully.",
    },
    booking_confirmed: {
      title: "Booking Confirmed",
      desc: "Your trip reservation has been confirmed.",
    },
    payment_success: {
      title: "Payment Successful",
      desc: "Your payment was processed successfully.",
    },
    payment_failed: {
      title: "Payment Failed",
      desc: "Your payment transaction could not be completed.",
    },
    booking_cancelled: {
      title: "Booking Cancelled",
      desc: "Your trip reservation has been cancelled.",
    },
  };

  if (map[lower]) return map[lower];

  const formattedTitle = type
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

  return {
    title: formattedTitle,
    desc: `New update regarding your ride (${formattedTitle}).`,
  };
};

const formatNotificationStatus = (status) => {
  if (!status) return "Delivered";
  const lower = status.toLowerCase();
  if (lower === "delivered") return "Delivered";
  if (lower === "sent") return "Sent";
  if (lower === "failed") return "Failed";
  return status.charAt(0).toUpperCase() + status.slice(1);
};

export default function DashboardHero({
  userName = "Traveler",
  notifications = [],
  notificationsLoading = false,
  notificationsError = null,
}) {
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  const notificationCount = notifications.length;

  return (
    <div className="relative pt-6 pb-2">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-theme-card border border-theme-border p-6 rounded-3xl backdrop-blur-md shadow-theme-card transition-colors duration-200">
        
        {/* Welcome greeting */}
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange to-orangeLight flex items-center justify-center font-heading font-extrabold text-white text-xl shadow-lg shadow-orange/20 border border-orange/40 flex-shrink-0">
            {userName.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-theme-text-primary tracking-tight">
                Welcome back, {userName}
              </h1>
            </div>
            <p className="font-body text-theme-text-secondary text-sm">
              Manage your group rides, track vehicles & view bookings.
            </p>
          </div>
        </div>

        {/* Shortcuts: Notifications & Profile */}
        <div className="flex items-center gap-3 self-end sm:self-center">
          
          {/* Notifications Shortcut */}
          <div className="relative">
            <button
              onClick={() => {
                setShowNotifications(!showNotifications);
                setShowProfile(false);
              }}
              className="relative flex items-center justify-center w-12 h-12 rounded-2xl bg-theme-surface-secondary border border-theme-border hover:bg-theme-surface text-theme-text-primary transition-all duration-200 cursor-pointer"
              aria-label="Notifications"
            >
              <svg className="w-5 h-5 text-theme-text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              {notificationCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-orange text-white text-[11px] font-bold flex items-center justify-center border-2 border-theme-card animate-pulse">
                  {notificationCount}
                </span>
              )}
            </button>

            {/* Notifications Dropdown Panel */}
            <AnimatePresence>
              {showNotifications && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 mt-3 w-80 sm:w-96 rounded-2xl bg-theme-surface border border-theme-border shadow-theme-elevated p-5 z-50 overflow-hidden text-theme-text-primary"
                >
                  <div className="flex items-center justify-between pb-3 mb-3 border-b border-theme-border">
                    <span className="font-heading font-bold text-theme-text-primary text-base flex items-center gap-2">
                      <span>Notifications</span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-orange/20 text-orange border border-orange/30">
                        {notificationCount}
                      </span>
                    </span>
                    <button
                      onClick={() => setShowNotifications(false)}
                      className="text-theme-text-muted hover:text-theme-text-primary text-xs cursor-pointer"
                    >
                      Close
                    </button>
                  </div>

                  <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                    {notificationsLoading ? (
                      <div className="py-8 text-center space-y-2">
                        <div className="w-5 h-5 border-2 border-orange border-t-transparent rounded-full animate-spin mx-auto" />
                        <p className="text-xs text-theme-text-muted">Loading notifications...</p>
                      </div>
                    ) : notificationsError ? (
                      <div className="p-3 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-800 dark:text-amber-200 text-xs">
                        Unable to load notifications.
                      </div>
                    ) : notifications.length === 0 ? (
                      <div className="py-8 text-center space-y-1">
                        <svg className="w-6 h-6 mx-auto mb-1 text-theme-text-muted opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                        </svg>
                        <p className="font-heading font-semibold text-theme-text-primary text-xs">No notifications yet.</p>
                      </div>
                    ) : (
                      notifications.map((n) => {
                        const meta = formatNotificationType(n.type);
                        const statusLabel = formatNotificationStatus(n.status);
                        return (
                          <div
                            key={n.id}
                            onClick={() => {
                              if (n.bookingId) {
                                setShowNotifications(false);
                                window.location.href = `/bookings/${n.bookingId}`;
                              }
                            }}
                            className={`p-3.5 rounded-xl bg-theme-surface-secondary border border-theme-border transition-all duration-200 space-y-1.5 ${
                              n.bookingId ? "hover:border-orange/40 hover:bg-theme-surface cursor-pointer group" : ""
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-heading font-bold text-theme-text-primary text-xs flex items-center gap-1.5 group-hover:text-orange transition-colors">
                                <span>{meta.title}</span>
                              </span>
                              <span className="text-[10px] font-mono text-theme-text-muted">
                                {formatDateTime(n.sentAt)}
                              </span>
                            </div>

                            <p className="font-body text-theme-text-secondary text-xs leading-relaxed">
                              {meta.desc}
                            </p>

                            <div className="flex items-center justify-between pt-1 text-[10px]">
                              <span className="px-2 py-0.5 rounded-md bg-theme-surface border border-theme-border text-theme-text-muted font-semibold uppercase tracking-wider">
                                {statusLabel}
                              </span>

                              {n.bookingId && (
                                <span className="text-orange font-semibold hover:underline flex items-center gap-1">
                                  <span>Booking: #{n.bookingId.slice(0, 8)}</span>
                                  <span>→</span>
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Profile Shortcut */}
          <div className="relative">
            <button
              onClick={() => {
                setShowProfile(!showProfile);
                setShowNotifications(false);
              }}
              className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl bg-theme-surface-secondary border border-theme-border hover:bg-theme-surface text-theme-text-primary transition-all duration-200 cursor-pointer"
            >
              <div className="w-7 h-7 rounded-full bg-orange text-white flex items-center justify-center font-heading font-bold text-xs">
                {userName.charAt(0)}
              </div>
              <span className="font-body text-sm font-semibold text-theme-text-primary hidden sm:inline">Profile</span>
              <svg className="w-4 h-4 text-theme-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Profile Dropdown Panel */}
            <AnimatePresence>
              {showProfile && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 mt-3 w-72 rounded-2xl bg-theme-surface border border-theme-border shadow-theme-elevated p-5 z-50 text-theme-text-primary"
                >
                  <div className="flex items-center gap-3 pb-4 mb-4 border-b border-theme-border">
                    <div className="w-10 h-10 rounded-xl bg-orange text-white font-heading font-bold flex items-center justify-center text-lg">
                      {userName.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-heading font-bold text-theme-text-primary text-sm">{userName}</h4>
                      <p className="font-body text-theme-text-muted text-xs">Customer Account</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <button
                      onClick={() => {
                        setShowProfile(false);
                        navigate("/profile");
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl text-theme-text-secondary hover:text-theme-text-primary hover:bg-theme-surface-secondary font-medium text-xs flex items-center gap-2 cursor-pointer transition-colors"
                    >
                      Personal Profile & Settings
                    </button>
                    <button
                      onClick={() => {
                        setShowProfile(false);
                        navigate("/bookings");
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl text-theme-text-secondary hover:text-theme-text-primary hover:bg-theme-surface-secondary font-medium text-xs flex items-center gap-2 cursor-pointer transition-colors"
                    >
                      My Bookings & Receipts
                    </button>
                    <a
                      href={LINKS.whatsapp}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full text-left px-3 py-2 rounded-xl text-green-600 dark:text-green-400 hover:bg-theme-surface-secondary font-medium text-xs flex items-center gap-2 transition-colors block"
                    >
                      WhatsApp 24/7 Support
                    </a>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>

      </div>
    </div>
  );
}
