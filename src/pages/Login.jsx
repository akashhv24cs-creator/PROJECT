import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../hooks/useAuth";
import { useTheme } from "../context/ThemeContext";
import { usePageSEO } from "../hooks/usePageSEO";
import { formatAuthError, formatPhoneNumber, clearRecaptcha } from "../services/auth.service";
import { LINKS } from "../../index.js";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, isAuthenticated, sendOTP, verifyOTP } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  usePageSEO({
    title: "Login / Signup | Zenera Trips",
    description: "Enter your mobile number to sign in or register with Zenera Trips.",
    robots: "noindex, nofollow",
  });

  // Redirect if already authenticated and coming from a protected route attempt
  const redirectPath = location.state?.from?.pathname || new URLSearchParams(location.search).get("redirect");
  useEffect(() => {
    if (isAuthenticated && redirectPath) {
      navigate(redirectPath, { replace: true });
    }
  }, [isAuthenticated, navigate, redirectPath]);

  // Clean up reCAPTCHA on unmount
  useEffect(() => {
    return () => {
      clearRecaptcha();
    };
  }, []);

  // Auth flow step: "phone" | "otp"
  const [step, setStep] = useState("phone");
  const [phone, setPhone] = useState("");
  const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);
  const [confirmationResult, setConfirmationResult] = useState(null);

  // Active status states: "idle" | "sending" | "verifying" | "success" | "error"
  const [authState, setAuthState] = useState("idle");
  const [errorMessage, setErrorMessage] = useState("");

  // Countdown timer for Resend OTP (28 seconds)
  const [timer, setTimer] = useState(28);
  const timerRef = useRef(null);

  // Refs for 6 individual OTP input elements
  const otpInputRefs = useRef([]);

  useEffect(() => {
    if (step === "otp" && timer > 0) {
      timerRef.current = setTimeout(() => setTimer((t) => t - 1), 1000);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [step, timer]);

  // Auto-focus first OTP input when transitioning to OTP step
  useEffect(() => {
    if (step === "otp" && otpInputRefs.current[0]) {
      setTimeout(() => {
        otpInputRefs.current[0]?.focus();
      }, 150);
    }
  }, [step]);

  // Validate 10-digit Indian phone number (starting with 6-9)
  const validatePhone = (num) => {
    const clean = num.replace(/\D/g, "");
    return clean.length === 10 && /^[6-9]/.test(clean);
  };

  const handlePhoneChange = (e) => {
    const val = e.target.value.replace(/\D/g, "").slice(0, 10);
    setPhone(val);
    if (errorMessage) setErrorMessage("");
    if (authState === "error") setAuthState("idle");
  };

  // Handle Send OTP via Firebase Phone Auth
  const handleSendOTP = async (e) => {
    if (e) e.preventDefault();
    setErrorMessage("");

    const cleanDigits = phone.replace(/\D/g, "");
    if (!validatePhone(cleanDigits)) {
      setErrorMessage("Please enter a valid 10-digit Indian mobile number.");
      setAuthState("error");
      return;
    }

    // Prevent multiple concurrent requests
    if (authState === "sending" || authState === "verifying") {
      console.warn("⚠️ Already sending OTP, ignoring duplicate request");
      return;
    }

    setAuthState("sending");
    console.log("🔵 Sending OTP for:", cleanDigits);

    try {
      // Add a small delay to ensure DOM is ready
      await new Promise((resolve) => setTimeout(resolve, 100));

      const result = await sendOTP(cleanDigits, "recaptcha-container");
      console.log("✅ OTP sent successfully");

      setConfirmationResult(result);
      setStep("otp");
      setOtpDigits(["", "", "", "", "", ""]);
      setTimer(28);
      setAuthState("idle");
    } catch (err) {
      console.error("❌ Error sending OTP:", err);
      setErrorMessage(formatAuthError(err));
      setAuthState("error");
      // Try to clear reCAPTCHA on error so user can retry
      try {
        clearRecaptcha();
      } catch (e) {
        console.warn("⚠️ Could not clear reCAPTCHA on error", e);
      }
    }
  };

  // Handle Resend OTP
  const handleResendOTP = async () => {
    if (timer > 0 || authState === "sending" || authState === "verifying") return;
    setErrorMessage("");

    // Prevent multiple concurrent requests
    if (authState === "sending" || authState === "verifying") {
      console.warn("⚠️ Already sending OTP, ignoring duplicate request");
      return;
    }

    setAuthState("sending");

    try {
      const cleanDigits = phone.replace(/\D/g, "");
      // Add a small delay to ensure DOM is ready
      await new Promise((resolve) => setTimeout(resolve, 100));

      const result = await sendOTP(cleanDigits, "recaptcha-container");
      setConfirmationResult(result);
      setTimer(28);
      setOtpDigits(["", "", "", "", "", ""]);
      setAuthState("idle");
      if (otpInputRefs.current[0]) {
        otpInputRefs.current[0].focus();
      }
    } catch (err) {
      console.error("❌ Error resending OTP:", err);
      setErrorMessage(formatAuthError(err));
      setAuthState("error");
      // Try to clear reCAPTCHA on error
      try {
        clearRecaptcha();
      } catch (e) {
        console.warn("⚠️ Could not clear reCAPTCHA on error", e);
      }
    }
  };

  // Handle OTP digit box change
  const handleOtpDigitChange = (index, value) => {
    const cleanVal = value.replace(/\D/g, "");
    if (errorMessage) setErrorMessage("");
    if (authState === "error") setAuthState("idle");

    // Handle full pasted OTP (e.g. 6 digits)
    if (cleanVal.length > 1) {
      const pastedDigits = cleanVal.slice(0, 6).split("");
      const newOtp = [...otpDigits];
      pastedDigits.forEach((digit, i) => {
        if (i < 6) newOtp[i] = digit;
      });
      setOtpDigits(newOtp);
      const nextIndex = Math.min(pastedDigits.length, 5);
      otpInputRefs.current[nextIndex]?.focus();
      return;
    }

    const newDigits = [...otpDigits];
    newDigits[index] = cleanVal;
    setOtpDigits(newDigits);

    // Auto-advance to next box if digit entered
    if (cleanVal && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  // Handle OTP key navigation (Backspace, Left/Right arrows)
  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace") {
      if (!otpDigits[index] && index > 0) {
        otpInputRefs.current[index - 1]?.focus();
      } else {
        const newDigits = [...otpDigits];
        newDigits[index] = "";
        setOtpDigits(newDigits);
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  // Handle OTP Paste event
  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pastedData) return;

    const newDigits = [...otpDigits];
    for (let i = 0; i < 6; i++) {
      newDigits[i] = pastedData[i] || "";
    }
    setOtpDigits(newDigits);

    const focusIndex = Math.min(pastedData.length, 5);
    otpInputRefs.current[focusIndex]?.focus();
  };

  // Handle Verify OTP
  const handleVerifyOTP = async (e) => {
    if (e) e.preventDefault();
    setErrorMessage("");

    const fullOtp = otpDigits.join("");
    if (fullOtp.length !== 6) {
      setErrorMessage("Please enter the complete 6-digit OTP.");
      setAuthState("error");
      return;
    }

    if (!confirmationResult) {
      setErrorMessage("Session expired. Please request a new OTP.");
      setAuthState("error");
      return;
    }

    setAuthState("verifying");

    try {
      await verifyOTP(confirmationResult, fullOtp);
      setAuthState("success");
      setTimeout(() => {
        const returnTarget = redirectPath || "/bookings";
        navigate(returnTarget, { replace: true });
      }, 1000);
    } catch (err) {
      console.error("Error verifying OTP:", err);
      setErrorMessage(formatAuthError(err));
      setAuthState("error");
    }
  };

  // Handle Return to Phone Step
  const handleChangeNumber = () => {
    clearRecaptcha();
    setStep("phone");
    setOtpDigits(["", "", "", "", "", ""]);
    setConfirmationResult(null);
    setErrorMessage("");
    setAuthState("idle");
    setTimer(28);
  };

  const formattedDisplayNumber = () => {
    const clean = phone.replace(/\D/g, "");
    if (clean.length === 10) {
      return `+91 ${clean.slice(0, 5)} ${clean.slice(5)}`;
    }
    return formatPhoneNumber(phone);
  };

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // If already authenticated and no pending redirect, show active session banner
  if (isAuthenticated && !redirectPath) {
    return (
      <div className="min-h-screen bg-[#FFFBF7] dark:bg-[#07111F] text-charcoal dark:text-white flex flex-col justify-between transition-colors duration-200">
        <header className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl overflow-hidden shadow-sm flex items-center justify-center bg-black/5 dark:bg-white/5 border border-[#E2E8F0] dark:border-[#1E2E42]">
              <img src="/favicon.svg" alt="Zenera Trips Logo" className="w-full h-full object-contain p-0.5 group-hover:scale-105 transition-transform" />
            </div>
            <div className="flex flex-col">
              <span className="font-heading font-extrabold text-xl text-charcoal dark:text-white tracking-tight leading-none group-hover:text-orange transition-colors">
                Zenera Trips
              </span>
              <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 tracking-wider uppercase leading-tight mt-0.5">
                Travel & Outstation
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={toggleTheme}
              className="p-2.5 rounded-full bg-white dark:bg-[#0E1A29] border border-[#E2E8F0] dark:border-[#1E2E42] text-charcoal dark:text-white/80 hover:text-orange dark:hover:text-orange transition-all shadow-sm cursor-pointer"
              title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
              aria-label="Toggle theme"
            >
              {isDark ? (
                <svg className="w-4 h-4 text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="5" fill="currentColor" />
                  <line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" />
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                  <line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" />
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                </svg>
              ) : (
                <svg className="w-4 h-4 text-charcoal" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" fill="currentColor" fillOpacity="0.2" />
                </svg>
              )}
            </button>
            <Link
              to="/"
              className="p-2.5 rounded-full bg-white dark:bg-[#0E1A29] border border-[#E2E8F0] dark:border-[#1E2E42] text-charcoal dark:text-white/80 hover:text-orange dark:hover:text-orange transition-all shadow-sm cursor-pointer"
              aria-label="Go to Home"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="19" y1="12" x2="5" y2="12" />
                <polyline points="12 19 5 12 12 5" />
              </svg>
            </Link>
          </div>
        </header>

        <main className="flex-1 flex items-center justify-center px-4 sm:px-6 py-12">
          <div className="bg-white dark:bg-[#0E1A29] border border-[#E2E8F0] dark:border-[#1E2E42] rounded-3xl p-8 max-w-md w-full text-center space-y-6 shadow-xl shadow-slate-900/5 dark:shadow-2xl">
            <div className="w-14 h-14 mx-auto rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <div>
              <span className="text-xs font-semibold uppercase tracking-widest text-orange block mb-1">
                Zenera Trips Session
              </span>
              <h1 className="font-extrabold text-2xl text-charcoal dark:text-white">
                You are logged in
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Phone: <span className="font-mono text-charcoal dark:text-white font-semibold">{currentUser?.phoneNumber || "Verified User"}</span>
              </p>
            </div>
            <div className="flex flex-col space-y-3 pt-2">
              <Link
                to="/dashboard"
                className="py-3.5 px-4 rounded-xl bg-orange text-white font-bold text-sm text-center hover:bg-orangeLight transition-all shadow-lg shadow-orange/20"
              >
                Go to Dashboard
              </Link>
              <Link
                to="/book"
                className="py-3.5 px-4 rounded-xl border border-[#E2E8F0] dark:border-[#1E2E42] bg-white dark:bg-[#152436] text-charcoal dark:text-white font-bold text-sm text-center hover:border-orange/40 transition-colors"
              >
                Book a Trip
              </Link>
              <Link
                to="/"
                className="py-2 px-4 text-xs text-slate-500 dark:text-slate-400 hover:text-orange text-center font-medium transition-colors"
              >
                Return to Homepage
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFFBF7] dark:bg-[#07111F] text-charcoal dark:text-white font-sans selection:bg-orange selection:text-white flex flex-col justify-between transition-colors duration-200">
      
      {/* Invisible reCAPTCHA Anchor Container */}
      <div id="recaptcha-container" />

      {/* Top Navigation Bar */}
      <header className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-4 sm:py-5 flex items-center justify-between border-b border-[#E2E8F0]/60 dark:border-[#1E2E42]/60">
        {/* Brand Logo Lockup */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl overflow-hidden shadow-sm flex items-center justify-center bg-black/5 dark:bg-white/5 border border-[#E2E8F0]/80 dark:border-[#1E2E42]">
            <img src="/favicon.svg" alt="Zenera Trips Logo" className="w-full h-full object-contain p-0.5 group-hover:scale-105 transition-transform" />
          </div>
          <div className="flex flex-col">
            <span className="font-heading font-extrabold text-lg sm:text-xl text-charcoal dark:text-white tracking-tight leading-none group-hover:text-orange transition-colors">
              Zenera Trips
            </span>
            <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 tracking-wider uppercase leading-tight mt-0.5 hidden sm:block">
              Travel & Outstation
            </span>
          </div>
        </Link>

        {/* Right Actions: Support, Theme Toggle, Close/Home */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          <a
            href={LINKS.whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white dark:bg-[#0E1A29] border border-[#E2E8F0] dark:border-[#1E2E42] hover:border-orange/50 text-slate-600 dark:text-slate-300 hover:text-orange transition-all text-xs font-semibold shadow-sm"
          >
            <svg className="w-3.5 h-3.5 text-orange" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
              <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
            </svg>
            <span>24/7 Support</span>
          </a>

          {/* Theme Toggle Button */}
          <button
            type="button"
            onClick={toggleTheme}
            className="p-2 sm:p-2.5 rounded-full bg-white dark:bg-[#0E1A29] border border-[#E2E8F0] dark:border-[#1E2E42] text-charcoal dark:text-white/80 hover:text-orange dark:hover:text-orange transition-all shadow-sm cursor-pointer"
            title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            aria-label="Toggle theme"
          >
            {isDark ? (
              <svg className="w-4 h-4 text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="5" fill="currentColor" />
                <line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" />
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                <line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" />
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
              </svg>
            ) : (
              <svg className="w-4 h-4 text-charcoal" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" fill="currentColor" fillOpacity="0.2" />
              </svg>
            )}
          </button>

          <Link
            to="/"
            className="p-2 sm:p-2.5 rounded-full bg-white dark:bg-[#0E1A29] border border-[#E2E8F0] dark:border-[#1E2E42] text-charcoal dark:text-white/80 hover:text-orange dark:hover:text-orange transition-all shadow-sm cursor-pointer"
            title="Return to Home"
            aria-label="Return to Home"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </Link>
        </div>
      </header>

      {/* Main Two-Column Layout */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-10 lg:py-12 flex items-center justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-stretch w-full max-w-6xl">
          
          {/* ========================================================
              LEFT COLUMN: BRAND / TRAVEL EXPERIENCE (~45% screen)
             ======================================================== */}
          <div className="lg:col-span-5 hidden lg:flex flex-col justify-between rounded-3xl relative overflow-hidden p-8 lg:p-10 border border-[#E2E8F0] dark:border-[#1E2E42] shadow-xl shadow-slate-900/5 dark:shadow-2xl min-h-[580px]">
            
            {/* Background Travel Image (Theme Responsive) */}
            <div className="absolute inset-0 z-0">
              <img
                src="/login-bus-light.jpg"
                alt="Scenic mountain road with Zenera tour coach"
                className={`w-full h-full object-cover object-center transition-opacity duration-700 ${
                  isDark ? "opacity-0" : "opacity-100"
                }`}
              />
              <img
                src="/login-bus-dark.jpg"
                alt="Cinematic night mountain road with Zenera tour coach"
                className={`w-full h-full object-cover object-center transition-opacity duration-700 ${
                  isDark ? "opacity-100" : "opacity-0"
                }`}
              />

              {/* Light Mode Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-white/95 via-white/80 to-white/35 dark:hidden" />
              <div className="absolute inset-0 bg-gradient-to-r from-white/90 via-transparent to-transparent dark:hidden" />

              {/* Dark Mode Overlay */}
              <div className="hidden dark:block absolute inset-0 bg-gradient-to-t from-[#07111F]/95 via-[#07111F]/80 to-[#07111F]/40" />
              <div className="hidden dark:block absolute inset-0 bg-gradient-to-r from-[#07111F]/90 via-transparent to-transparent" />
            </div>

            {/* Top Brand & Tagline */}
            <div className="relative z-10 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange/10 border border-orange/20 text-orange text-xs font-semibold backdrop-blur-md">
                <span className="w-1.5 h-1.5 rounded-full bg-orange animate-pulse" />
                <span>Next-Gen Travel Platform</span>
              </div>

              <h2 className="font-extrabold text-3xl sm:text-4xl text-charcoal dark:text-white tracking-tight leading-[1.12]">
                Travel More.<br />
                Worry Less.<br />
                <span className="text-orange">Zenera Trips.</span>
              </h2>

              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-normal leading-relaxed max-w-sm">
                Book buses, cabs and tour packages with ease and comfort.
              </p>
            </div>

            {/* Middle: 3 Small Trust Indicators */}
            <div className="relative z-10 space-y-3 my-6">
              {/* Trust Indicator 1: Safe & Secure */}
              <div className="flex items-center gap-3 p-2.5 rounded-2xl bg-white/80 dark:bg-[#0E1A29]/80 backdrop-blur-md border border-[#E2E8F0]/80 dark:border-[#1E2E42]/80 shadow-sm">
                <div className="w-8 h-8 rounded-xl bg-orange/10 border border-orange/20 text-orange flex items-center justify-center shrink-0">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    <path d="m9 12 2 2 4-4" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-bold text-xs text-charcoal dark:text-white leading-tight">
                    Safe & Secure
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Your safety is our priority
                  </p>
                </div>
              </div>

              {/* Trust Indicator 2: Best Prices */}
              <div className="flex items-center gap-3 p-2.5 rounded-2xl bg-white/80 dark:bg-[#0E1A29]/80 backdrop-blur-md border border-[#E2E8F0]/80 dark:border-[#1E2E42]/80 shadow-sm">
                <div className="w-8 h-8 rounded-xl bg-orange/10 border border-orange/20 text-orange flex items-center justify-center shrink-0">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
                    <line x1="7" y1="7" x2="7.01" y2="7" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-bold text-xs text-charcoal dark:text-white leading-tight">
                    Best Prices
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Get the best deals
                  </p>
                </div>
              </div>

              {/* Trust Indicator 3: 24/7 Support */}
              <div className="flex items-center gap-3 p-2.5 rounded-2xl bg-white/80 dark:bg-[#0E1A29]/80 backdrop-blur-md border border-[#E2E8F0]/80 dark:border-[#1E2E42]/80 shadow-sm">
                <div className="w-8 h-8 rounded-xl bg-orange/10 border border-orange/20 text-orange flex items-center justify-center shrink-0">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-bold text-xs text-charcoal dark:text-white leading-tight">
                    24/7 Support
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    We're here to help you anytime
                  </p>
                </div>
              </div>
            </div>

            {/* Bottom Trusted Stat */}
            <div className="relative z-10 pt-4 border-t border-[#E2E8F0]/80 dark:border-[#1E2E42]/80 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex items-center text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-3.5 h-3.5 fill-current" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <span className="text-xs font-semibold text-charcoal dark:text-white">
                  Trusted by 50K+ happy travelers
                </span>
              </div>
            </div>
          </div>

          {/* ========================================================
              RIGHT COLUMN: LOGIN / OTP CARD
             ======================================================== */}
          <div className="lg:col-span-7 flex flex-col justify-center max-w-xl mx-auto w-full">
            
            {/* Mobile Hero Banner (Compact view for small screens) */}
            <div className="lg:hidden relative rounded-2xl overflow-hidden mb-6 h-36 sm:h-44 w-full border border-[#E2E8F0] dark:border-[#1E2E42] shadow-sm">
              <img
                src="/login-bus-light.jpg"
                alt="Scenic travel with Zenera Trips"
                className={`w-full h-full object-cover transition-opacity duration-500 ${
                  isDark ? "opacity-0" : "opacity-100"
                }`}
              />
              <img
                src="/login-bus-dark.jpg"
                alt="Cinematic night travel with Zenera Trips"
                className={`w-full h-full object-cover transition-opacity duration-500 ${
                  isDark ? "opacity-100" : "opacity-0"
                }`}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex flex-col justify-end p-4 text-white">
                <span className="text-xs font-bold uppercase tracking-wider text-orange">Zenera Trips</span>
                <h3 className="text-lg font-bold">Your trip starts here.</h3>
              </div>
            </div>

            {/* Authentication Card */}
            <div className="bg-white dark:bg-[#0E1A29] border border-[#E2E8F0] dark:border-[#1E2E42] rounded-3xl p-6 sm:p-9 lg:p-10 shadow-xl shadow-slate-900/5 dark:shadow-2xl relative overflow-hidden transition-colors duration-200">
              
              {/* Minimal 2-Step Progress Indicator */}
              <div className="mb-7 pb-5 border-b border-[#E2E8F0] dark:border-[#1E2E42]">
                <div className="flex items-center justify-between text-xs font-semibold mb-2">
                  <span className={`flex items-center gap-1.5 ${step === "phone" ? "text-orange" : "text-emerald-500"}`}>
                    {step === "otp" ? (
                      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    ) : "1"} Phone Number
                  </span>
                  <span className={`flex items-center gap-1.5 ${step === "otp" ? "text-orange" : "text-slate-400"}`}>
                    2 Verify OTP
                  </span>
                </div>

                {/* Progress Bar Track */}
                <div className="w-full h-1.5 bg-slate-100 dark:bg-[#152436] rounded-full overflow-hidden flex">
                  <div
                    className={`h-full bg-orange transition-all duration-300 rounded-full ${
                      step === "phone" ? "w-1/2" : "w-full"
                    }`}
                  />
                </div>
              </div>

              {/* Step Forms */}
              <AnimatePresence mode="wait">
                
                {/* STEP 1: PHONE LOGIN / SIGNUP */}
                {step === "phone" ? (
                  <motion.div
                    key="login-step-phone"
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 12 }}
                    transition={{ duration: 0.25 }}
                    className="space-y-6"
                  >
                    {/* Header */}
                    <div>
                      <h2 className="font-extrabold text-2xl sm:text-3xl text-charcoal dark:text-white tracking-tight">
                        Login / Signup
                      </h2>
                      <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                        Enter your mobile number to continue
                      </p>
                    </div>

                    {/* Inline Error Message */}
                    {errorMessage && (
                      <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs sm:text-sm flex items-start gap-2.5">
                        <svg className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="10" />
                          <line x1="12" y1="8" x2="12" y2="12" />
                          <line x1="12" y1="16" x2="12.01" y2="16" />
                        </svg>
                        <div className="flex-1">
                          <p>{errorMessage}</p>
                        </div>
                      </div>
                    )}

                    {/* Phone Input Form */}
                    <form onSubmit={handleSendOTP} className="space-y-5">
                      <div className="space-y-1.5">
                        <label htmlFor="phone-input" className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                          Mobile Number
                        </label>

                        {/* Country Code + Phone Input */}
                        <div className="border border-[#E2E8F0] dark:border-[#1E2E42] rounded-2xl bg-[#F5F7FA] dark:bg-[#0A1420] focus-within:border-orange focus-within:ring-2 focus-within:ring-orange/20 transition-all p-2.5 sm:p-3 flex items-center gap-3">
                          {/* Country Selector */}
                          <div className="flex items-center gap-2 pl-2 pr-1 select-none shrink-0 text-charcoal dark:text-white font-bold text-sm">
                            <span className="font-mono">+91</span>
                            <svg className="w-3.5 h-3.5 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <polyline points="6 9 12 15 18 9" />
                            </svg>
                          </div>

                          {/* Vertical Divider */}
                          <div className="w-[1px] h-8 bg-[#E2E8F0] dark:border-[#1E2E42] shrink-0" />

                          {/* Phone input */}
                          <div className="flex-1">
                            <input
                              id="phone-input"
                              type="tel"
                              inputMode="numeric"
                              pattern="[0-9]*"
                              maxLength={10}
                              value={phone}
                              onChange={handlePhoneChange}
                              placeholder="98765 43210"
                              className="w-full bg-transparent font-mono text-base sm:text-lg font-semibold text-charcoal dark:text-white placeholder:text-slate-400 outline-none leading-tight"
                              autoComplete="tel-national"
                              autoFocus
                            />
                          </div>
                        </div>
                      </div>

                      {/* Security message */}
                      <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                        <svg className="w-3.5 h-3.5 text-orange shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                        </svg>
                        <span>We'll send you a 6-digit OTP to verify your number</span>
                      </div>

                      {/* Send OTP Button */}
                      <button
                        id="send-otp-button"
                        type="submit"
                        disabled={phone.replace(/\D/g, "").length !== 10 || authState === "sending"}
                        className="w-full py-4 px-6 rounded-2xl bg-orange hover:bg-orangeLight active:scale-[0.99] text-white font-bold text-sm sm:text-base tracking-wide transition-all duration-200 shadow-lg shadow-orange/30 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {authState === "sending" ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            <span>Sending OTP...</span>
                          </>
                        ) : (
                          <>
                            <span>Send OTP</span>
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M5 12h14" />
                              <path d="m12 5 7 7-7 7" />
                            </svg>
                          </>
                        )}
                      </button>
                    </form>

                    {/* Terms & Privacy */}
                    <div className="pt-2 text-center text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                      <span>By continuing, you agree to our </span>
                      <a href="#terms" className="text-orange hover:underline font-semibold">Terms & Conditions</a>
                      <span> and </span>
                      <a href="#privacy" className="text-orange hover:underline font-semibold">Privacy Policy</a>
                    </div>
                  </motion.div>
                ) : (
                  /* STEP 2: OTP VERIFICATION */
                  <motion.div
                    key="login-step-otp"
                    initial={{ opacity: 0, x: 12 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -12 }}
                    transition={{ duration: 0.25 }}
                    className="space-y-6"
                  >
                    {/* Header */}
                    <div>
                      <h2 className="font-extrabold text-2xl sm:text-3xl text-charcoal dark:text-white tracking-tight">
                        Verify OTP
                      </h2>
                      <div className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 flex flex-wrap items-center gap-1.5">
                        <span>Enter the 6-digit OTP sent to</span>
                        <span className="font-mono font-bold text-orange">
                          {formattedDisplayNumber()}
                        </span>
                        <button
                          type="button"
                          onClick={handleChangeNumber}
                          className="ml-1 text-xs text-slate-600 dark:text-slate-300 hover:text-orange underline font-semibold cursor-pointer transition-colors"
                        >
                          Change Number
                        </button>
                      </div>
                    </div>

                    {/* Inline Error Message */}
                    {errorMessage && (
                      <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs sm:text-sm flex items-start gap-2.5">
                        <svg className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="10" />
                          <line x1="12" y1="8" x2="12" y2="12" />
                          <line x1="12" y1="16" x2="12.01" y2="16" />
                        </svg>
                        <div className="flex-1">
                          <p>{errorMessage}</p>
                        </div>
                      </div>
                    )}

                    {/* 6 OTP Boxes Form */}
                    <form onSubmit={handleVerifyOTP} className="space-y-6">
                      <div
                        className="flex items-center justify-center gap-2 sm:gap-3"
                        onPaste={handleOtpPaste}
                      >
                        {otpDigits.map((digit, index) => (
                          <input
                            key={`otp-box-${index}`}
                            ref={(el) => (otpInputRefs.current[index] = el)}
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            maxLength={1}
                            value={digit}
                            onChange={(e) => handleOtpDigitChange(index, e.target.value)}
                            onKeyDown={(e) => handleOtpKeyDown(index, e)}
                            aria-label={`Digit ${index + 1} of 6-digit OTP`}
                            className="w-11 h-13 sm:w-13 sm:h-15 md:w-14 md:h-16 rounded-xl sm:rounded-2xl border-2 border-[#E2E8F0] dark:border-[#1E2E42] bg-[#F5F7FA] dark:bg-[#0A1420] text-center font-mono font-bold text-xl sm:text-2xl text-charcoal dark:text-white focus:border-orange focus:ring-4 focus:ring-orange/15 outline-none transition-all shadow-sm"
                          />
                        ))}
                      </div>

                      {/* Resend OTP Timer & Actions */}
                      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-1">
                        <div>
                          {timer > 0 ? (
                            <span>Resend OTP in <strong className="font-mono text-orange">{formatTimer(timer)}</strong></span>
                          ) : (
                            <button
                              type="button"
                              onClick={handleResendOTP}
                              disabled={authState === "sending"}
                              className="text-orange hover:text-orangeLight font-bold cursor-pointer transition-colors hover:underline"
                            >
                              {authState === "sending" ? "Resending..." : "Resend OTP"}
                            </button>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={handleChangeNumber}
                          className="text-slate-600 dark:text-slate-400 hover:text-orange font-medium cursor-pointer transition-colors"
                        >
                          Change Number
                        </button>
                      </div>

                      {/* Verify Button */}
                      <button
                        type="submit"
                        disabled={otpDigits.join("").length !== 6 || authState === "verifying"}
                        className="w-full py-4 px-6 rounded-2xl bg-orange hover:bg-orangeLight active:scale-[0.99] text-white font-bold text-sm sm:text-base tracking-wide transition-all duration-200 shadow-lg shadow-orange/30 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {authState === "verifying" ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            <span>Verifying...</span>
                          </>
                        ) : authState === "success" ? (
                          <>
                            <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                            <span>Verified! Redirecting...</span>
                          </>
                        ) : (
                          <>
                            <span>Verify & Continue</span>
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M5 12h14" />
                              <path d="m12 5 7 7-7 7" />
                            </svg>
                          </>
                        )}
                      </button>
                    </form>

                    {/* Security Footnote */}
                    <div className="flex items-center justify-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 pt-1">
                      <svg className="w-3.5 h-3.5 text-emerald-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                      </svg>
                      <span>Your data is 100% secure with us</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

        </div>
      </main>

      {/* Subtle Footer */}
      <footer className="py-5 text-center text-xs text-slate-500 dark:text-slate-400 font-medium border-t border-[#E2E8F0]/60 dark:border-[#1E2E42]/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2.5">
          <p>© {new Date().getFullYear()} Zenera Trips. All rights reserved.</p>
          <div className="flex items-center gap-4 text-[11px] sm:text-xs">
            <a href="#privacy" className="hover:text-orange transition-colors">Privacy Policy</a>
            <span>•</span>
            <a href="#terms" className="hover:text-orange transition-colors">Terms of Service</a>
            <span>•</span>
            <a href="#refund" className="hover:text-orange transition-colors">Refund Policy</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
