import { useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";

export default function SecurityTab() {
  const { currentUser, userProfile, logout } = useAuth();
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const phone = userProfile?.phone || currentUser?.phoneNumber || "Verified Phone";
  const uid = userProfile?.uid || currentUser?.uid || "—";

  const handleConfirmLogout = async () => {
    setLoggingOut(true);
    try {
      await logout();
      navigate("/login", { replace: true });
    } catch (err) {
      console.error("Logout error:", err);
      setLoggingOut(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* 1. SECURITY & VERIFICATION CARD */}
      <div className="rounded-3xl border border-[#E2E8F0] dark:border-[#1E2E42] bg-white dark:bg-[#0E1A29] p-6 sm:p-8 shadow-sm space-y-6">
        <div className="pb-4 border-b border-[#E2E8F0] dark:border-[#1E2E42]">
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-orange block">
            Account Protection
          </span>
          <h3 className="font-extrabold text-lg sm:text-xl text-charcoal dark:text-white">
            Security & Authentication
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Manage your verified login credentials, sessions, and security protocols
          </p>
        </div>

        <div className="space-y-4">
          
          {/* Phone Auth Verification */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[#F5F7FA] dark:bg-[#152436] border border-[#E2E8F0] dark:border-[#1E2E42] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center justify-center shrink-0 mt-0.5">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h4 className="font-extrabold text-sm text-charcoal dark:text-white">
                  Phone OTP Verification
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                  {phone}
                </p>
                <p className="text-[11px] text-slate-400 mt-1">
                  Primary two-factor authentication method used for passwordless login.
                </p>
              </div>
            </div>

            <span className="self-start sm:self-center px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-bold shrink-0">
              Active & Verified
            </span>
          </div>

          {/* Active Session Info */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[#F5F7FA] dark:bg-[#152436] border border-[#E2E8F0] dark:border-[#1E2E42] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 flex items-center justify-center shrink-0 mt-0.5">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h4 className="font-extrabold text-sm text-charcoal dark:text-white">
                  Current Active Web Session
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Encrypted SSL / Firebase Token Session
                </p>
                <p className="text-[11px] text-slate-400 mt-1 font-mono">
                  Account Identifier: {uid}
                </p>
              </div>
            </div>

            <span className="self-start sm:self-center px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 text-xs font-bold shrink-0">
              This Device
            </span>
          </div>

        </div>
      </div>

      {/* 2. DANGER ZONE / LOGOUT CARD */}
      <div className="rounded-3xl border border-rose-500/20 bg-rose-500/[0.02] dark:bg-rose-500/[0.02] p-6 sm:p-8 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h4 className="font-extrabold text-base text-rose-600 dark:text-rose-400">
              Account Session Management
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Sign out from your Zenera Trips account on this device.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowLogoutModal(true)}
            className="self-start sm:self-auto py-2.5 px-5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-extrabold text-xs transition-all shadow-md shadow-rose-500/20 cursor-pointer flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span>Log Out of Account</span>
          </button>
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/70 dark:bg-black/85 backdrop-blur-sm"
            onClick={() => !loggingOut && setShowLogoutModal(false)}
          />

          <div className="relative w-full max-w-md bg-white dark:bg-[#0E1A29] rounded-3xl border border-[#E2E8F0] dark:border-[#1E2E42] shadow-2xl p-6 sm:p-7 space-y-5 z-10 text-charcoal dark:text-white">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 flex items-center justify-center text-xl">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </div>

            <div className="space-y-1">
              <h3 className="font-extrabold text-lg sm:text-xl">
                Log Out of Zenera Trips?
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                You will need to verify your mobile OTP again to access your active bookings and travel passes.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleConfirmLogout}
                disabled={loggingOut}
                className="flex-1 py-3 px-4 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-extrabold text-xs transition-all shadow-md shadow-rose-500/20 disabled:opacity-50 cursor-pointer text-center"
              >
                {loggingOut ? "Logging Out..." : "Confirm Log Out"}
              </button>
              <button
                type="button"
                onClick={() => setShowLogoutModal(false)}
                disabled={loggingOut}
                className="py-3 px-4 rounded-xl border border-[#E2E8F0] dark:border-[#1E2E42] text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold transition-colors cursor-pointer"
              >
                Keep Logged In
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
