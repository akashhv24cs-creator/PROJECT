import { useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { LINKS } from "../../../index.js";

export default function NotificationSettingsPanel({
  unreadCount = 0,
  onMarkAllAsRead,
  markingAll = false,
  onAlert,
}) {
  const { userProfile, updateProfileData } = useAuth();
  const prefs = userProfile?.preferences || {};

  const [notifBooking, setNotifBooking] = useState(prefs.notifBooking !== false);
  const [notifOffers, setNotifOffers] = useState(prefs.notifOffers !== false);
  const [notifPayment, setNotifPayment] = useState(prefs.notifPayment !== false);
  const [notifReminders, setNotifReminders] = useState(prefs.notifReminders !== false);
  const [saving, setSaving] = useState(false);

  const handleToggle = async (key, currentValue, setter) => {
    const newValue = !currentValue;
    setter(newValue);

    const newPreferences = {
      ...prefs,
      notifBooking: key === "notifBooking" ? newValue : notifBooking,
      notifOffers: key === "notifOffers" ? newValue : notifOffers,
      notifPayment: key === "notifPayment" ? newValue : notifPayment,
      notifReminders: key === "notifReminders" ? newValue : notifReminders,
    };

    setSaving(true);
    try {
      const res = await updateProfileData({
        preferences: newPreferences,
      });
      if (res.success && onAlert) {
        onAlert({
          type: "success",
          message: "Notification preference updated.",
        });
      }
    } catch (err) {
      console.error("Failed to update notification preferences:", err);
    } finally {
      setSaving(false);
    }
  };

  const settingsList = [
    {
      key: "notifBooking",
      title: "Booking Updates",
      desc: "Live chauffeur assignment & route updates",
      value: notifBooking,
      setter: setNotifBooking,
    },
    {
      key: "notifReminders",
      title: "Trip Reminders",
      desc: "Departure alerts 2 hours before journey",
      value: notifReminders,
      setter: setNotifReminders,
    },
    {
      key: "notifPayment",
      title: "Payment Invoices",
      desc: "Instant digital receipt confirmations",
      value: notifPayment,
      setter: setNotifPayment,
    },
    {
      key: "notifOffers",
      title: "Offers & Deals",
      desc: "Special seasonal discounts & tour packages",
      value: notifOffers,
      setter: setNotifOffers,
    },
  ];

  return (
    <div className="space-y-6">
      
      {/* 1. UNREAD SUMMARY CARD */}
      <div className="rounded-3xl border border-[#E2E8F0] dark:border-[#1E2E42] bg-white dark:bg-[#0E1A29] p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0] dark:border-[#1E2E42]">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-orange block">
              Overview
            </span>
            <h3 className="font-extrabold text-base sm:text-lg text-charcoal dark:text-white">
              Unread Summary
            </h3>
          </div>

          <div className="w-8 h-8 rounded-xl bg-orange/10 text-orange flex items-center justify-center">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-orange/5 dark:bg-orange/10 border border-orange/20 text-center space-y-1">
          <p className="font-mono font-extrabold text-3xl sm:text-4xl text-orange">
            {unreadCount}
          </p>
          <p className="text-xs font-bold text-slate-600 dark:text-slate-300">
            Unread Notifications
          </p>
        </div>

        {unreadCount > 0 ? (
          <button
            type="button"
            onClick={onMarkAllAsRead}
            disabled={markingAll}
            className="w-full py-2.5 px-4 rounded-xl bg-orange hover:bg-orangeLight text-white font-extrabold text-xs transition-all shadow-md shadow-orange/20 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
            <span>{markingAll ? "Marking as read..." : "Mark all as read"}</span>
          </button>
        ) : (
          <p className="text-center text-xs text-slate-400 py-1">
            All notifications are up to date
          </p>
        )}
      </div>

      {/* 2. NOTIFICATION SETTINGS CARD */}
      <div className="rounded-3xl border border-[#E2E8F0] dark:border-[#1E2E42] bg-white dark:bg-[#0E1A29] p-6 shadow-sm space-y-5">
        <div className="pb-3 border-b border-[#E2E8F0] dark:border-[#1E2E42]">
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-orange block">
            Preferences
          </span>
          <h3 className="font-extrabold text-base sm:text-lg text-charcoal dark:text-white">
            Notification Settings
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Choose what alerts you wish to receive
          </p>
        </div>

        <div className="divide-y divide-[#E2E8F0] dark:divide-[#1E2E42]">
          {settingsList.map((item) => (
            <div
              key={item.key}
              className="py-3.5 first:pt-0 last:pb-0 flex items-center justify-between gap-3"
            >
              <div className="space-y-0.5 max-w-[190px]">
                <h4 className="font-bold text-xs text-charcoal dark:text-white">
                  {item.title}
                </h4>
                <p className="text-[11px] text-slate-400 leading-tight">
                  {item.desc}
                </p>
              </div>

              {/* Accessible Custom Toggle */}
              <button
                type="button"
                role="switch"
                aria-checked={item.value}
                onClick={() => handleToggle(item.key, item.value, item.setter)}
                disabled={saving}
                className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  item.value ? "bg-orange" : "bg-slate-300 dark:bg-slate-700"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    item.value ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 3. NEED HELP / CONCIERGE CARD */}
      <div className="rounded-3xl border border-[#E2E8F0] dark:border-[#1E2E42] bg-white dark:bg-[#0E1A29] p-6 shadow-sm space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center justify-center text-base shrink-0">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <div>
            <h4 className="font-extrabold text-sm text-charcoal dark:text-white">
              Trip Inquiries?
            </h4>
            <p className="text-[11px] text-slate-400">
              24/7 Outstation Concierge
            </p>
          </div>
        </div>

        <a
          href={LINKS.whatsapp}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full py-2.5 px-4 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 font-bold text-xs transition-all flex items-center justify-center gap-2"
        >
          <span>Chat with Support</span>
          <span>→</span>
        </a>
      </div>

    </div>
  );
}
