import { useState } from "react";
import { LINKS } from "../../../index.js";

export default function QuickActions({ onBookClick, onAIChatClick }) {
  const [toastMessage, setToastMessage] = useState(null);

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const actions = [
    {
      title: "Book a Trip",
      desc: "Select vehicle, route & confirm ride",
      badge: "Fast Booking",
      onClick: onBookClick,
      primary: true,
    },
    {
      title: "Zenera AI Assistant",
      desc: "Instant itineraries, fare & vehicle advice",
      badge: "AI Powered",
      onClick: onAIChatClick,
      primary: true,
    },
    {
      title: "Live GPS Tracking",
      desc: "Track assigned vehicle on live map",
      badge: "Real-time",
      onClick: () => triggerToast("GPS tracking will activate once a vehicle is assigned to your trip."),
    },
    {
      title: "WhatsApp Support",
      desc: "Direct help for custom group quotes",
      badge: "24/7 Support",
      onClick: () => window.open(LINKS.whatsapp, "_blank"),
    },
  ];

  return (
    <div className="relative">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-heading font-extrabold text-xl text-theme-text-primary tracking-tight">
          Quick Actions
        </h3>
        <span className="text-xs text-theme-text-muted font-body font-medium">Shortcuts</span>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {actions.map((act) => (
          <div
            key={act.title}
            onClick={act.onClick}
            className={`group relative flex flex-col justify-between p-5 rounded-2xl border transition-all duration-300 cursor-pointer shadow-theme-card ${
              act.primary
                ? "bg-orange/15 border-orange/40 hover:bg-orange/20 hover:border-orange shadow-lg shadow-orange/10"
                : "bg-theme-card border-theme-border hover:border-orange/40 hover:bg-theme-surface-secondary"
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                    act.primary
                      ? "bg-orange text-white"
                      : "bg-theme-surface-secondary text-theme-text-secondary border border-theme-border"
                  }`}
                >
                  {act.badge}
                </span>
              </div>

              <h4 className="font-heading font-bold text-theme-text-primary text-base mb-1 group-hover:text-orange transition-colors duration-200">
                {act.title}
              </h4>
              <p className="font-body text-theme-text-secondary text-xs leading-relaxed">
                {act.desc}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-theme-border flex items-center text-xs font-bold text-orange group-hover:translate-x-1 transition-transform duration-200">
              <span>Access</span>
              <svg className="w-3.5 h-3.5 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        ))}
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-theme-surface border border-orange/50 text-theme-text-primary px-5 py-3 rounded-2xl shadow-theme-elevated flex items-center gap-3 text-xs font-body animate-bounce">
          <svg className="w-4 h-4 text-orange shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
