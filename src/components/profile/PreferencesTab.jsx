import { useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useFleetPricing } from "../../services/fleet.service";

export default function PreferencesTab({ onAlert }) {
  const { userProfile, updateProfileData } = useAuth();
  const { fleets } = useFleetPricing();

  const prefs = userProfile?.preferences || {};
  const [vehiclePref, setVehiclePref] = useState(prefs.vehicle || "Innova Crysta");
  const [notifBooking, setNotifBooking] = useState(prefs.notifBooking !== false);
  const [notifOffers, setNotifOffers] = useState(prefs.notifOffers !== false);
  const [notifPayment, setNotifPayment] = useState(prefs.notifPayment !== false);
  const [notifReminders, setNotifReminders] = useState(prefs.notifReminders !== false);

  const [saving, setSaving] = useState(false);

  const handleToggle = async (key, currentValue, setter) => {
    const newValue = !currentValue;
    setter(newValue);

    const newPreferences = {
      vehicle: vehiclePref,
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
          message: "Your preferences have been saved.",
        });
      }
    } catch (err) {
      console.error("Preferences save error:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleVehicleChange = async (e) => {
    const newVehicle = e.target.value;
    setVehiclePref(newVehicle);

    const newPreferences = {
      vehicle: newVehicle,
      notifBooking,
      notifOffers,
      notifPayment,
      notifReminders,
    };

    setSaving(true);
    try {
      const res = await updateProfileData({
        preferences: newPreferences,
      });
      if (res.success && onAlert) {
        onAlert({
          type: "success",
          message: `Default vehicle preference set to ${newVehicle}.`,
        });
      }
    } catch (err) {
      console.error("Preferences save error:", err);
    } finally {
      setSaving(false);
    }
  };

  const notifications = [
    {
      key: "notifBooking",
      title: "Booking & Chauffeur Updates",
      desc: "Real-time SMS & alerts when a driver is assigned or arrives at pickup.",
      value: notifBooking,
      setter: setNotifBooking,
    },
    {
      key: "notifReminders",
      title: "Trip Departure Reminders",
      desc: "Get notified 2 hours and 30 minutes before your scheduled departure.",
      value: notifReminders,
      setter: setNotifReminders,
    },
    {
      key: "notifPayment",
      title: "Payment & Invoice Receipts",
      desc: "Instant digital receipt updates upon advance and balance settlements.",
      value: notifPayment,
      setter: setNotifPayment,
    },
    {
      key: "notifOffers",
      title: "Special Outstation Offers",
      desc: "Exclusive weekend getaway deals, seasonal discounts, and tour package drops.",
      value: notifOffers,
      setter: setNotifOffers,
    },
  ];

  return (
    <div className="space-y-6">
      
      {/* 1. VEHICLE & TRAVEL PREFERENCES */}
      <div className="rounded-3xl border border-[#E2E8F0] dark:border-[#1E2E42] bg-white dark:bg-[#0E1A29] p-6 sm:p-8 shadow-sm space-y-6">
        <div className="pb-4 border-b border-[#E2E8F0] dark:border-[#1E2E42]">
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-orange block">
            Travel Preferences
          </span>
          <h3 className="font-extrabold text-lg sm:text-xl text-charcoal dark:text-white">
            Preferred Outstation Fleet
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Default vehicle category pre-selected for your outstation fare estimates
          </p>
        </div>

        <div className="max-w-md space-y-2">
          <label className="text-xs font-bold text-charcoal dark:text-slate-200 block">
            Default Vehicle Model
          </label>
          <select
            value={vehiclePref}
            onChange={handleVehicleChange}
            disabled={saving}
            className="w-full bg-[#F5F7FA] dark:bg-[#152436] border border-[#E2E8F0] dark:border-[#1E2E42] focus:border-orange rounded-xl px-4 py-3 text-xs sm:text-sm text-charcoal dark:text-white focus:outline-none transition-all cursor-pointer"
          >
            <option value="Any Vehicle">Any Recommended Vehicle</option>
            {fleets.map((v) => (
              <option key={v.id || v.name} value={v.name}>
                {v.name} ({v.seats}) — ₹{v.pricePerKm || v.backendRatePerKm}/km
              </option>
            ))}
          </select>
          <p className="text-[11px] text-slate-400 mt-1">
            You can always change your vehicle during individual bookings.
          </p>
        </div>
      </div>

      {/* 2. NOTIFICATION PREFERENCES */}
      <div className="rounded-3xl border border-[#E2E8F0] dark:border-[#1E2E42] bg-white dark:bg-[#0E1A29] p-6 sm:p-8 shadow-sm space-y-6">
        <div className="pb-4 border-b border-[#E2E8F0] dark:border-[#1E2E42]">
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-orange block">
            Communications
          </span>
          <h3 className="font-extrabold text-lg sm:text-xl text-charcoal dark:text-white">
            Notification Settings
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Choose which alerts and travel communications you wish to receive
          </p>
        </div>

        <div className="divide-y divide-[#E2E8F0] dark:divide-[#1E2E42]">
          {notifications.map((item) => (
            <div
              key={item.key}
              className="py-4 first:pt-0 last:pb-0 flex items-center justify-between gap-4"
            >
              <div className="space-y-0.5 max-w-lg">
                <h4 className="font-extrabold text-sm text-charcoal dark:text-white">
                  {item.title}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {item.desc}
                </p>
              </div>

              {/* Accessible Custom Toggle Switch */}
              <button
                type="button"
                role="switch"
                aria-checked={item.value}
                onClick={() => handleToggle(item.key, item.value, item.setter)}
                disabled={saving}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  item.value ? "bg-orange" : "bg-slate-300 dark:bg-slate-700"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    item.value ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
