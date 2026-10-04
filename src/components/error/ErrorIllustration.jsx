import { motion } from "framer-motion";

export default function ErrorIllustration() {
  return (
    <div className="relative w-full max-w-lg mx-auto select-none">
      
      {/* Background Ambient Coral/Orange Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 sm:w-96 h-72 sm:h-96 bg-amber-500/10 dark:bg-rose-500/15 rounded-full blur-3xl pointer-events-none" />

      {/* Main SVG Vector Travel Scene */}
      <motion.svg
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        viewBox="0 0 600 400"
        className="w-full h-auto drop-shadow-md"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Mountain Gradients */}
          <linearGradient id="errMountainBack" x1="300" y1="80" x2="300" y2="300" gradientUnits="userSpaceOnUse">
            <stop stopColor="#94A3B8" stopOpacity="0.3" />
            <stop offset="1" stopColor="#CBD5E1" stopOpacity="0.1" />
          </linearGradient>
          <linearGradient id="errMountainFront" x1="300" y1="120" x2="300" y2="300" gradientUnits="userSpaceOnUse">
            <stop stopColor="#64748B" stopOpacity="0.4" />
            <stop offset="1" stopColor="#94A3B8" stopOpacity="0.2" />
          </linearGradient>

          {/* Road Gradient */}
          <linearGradient id="errRoadGrad" x1="300" y1="200" x2="300" y2="400" gradientUnits="userSpaceOnUse">
            <stop stopColor="#334155" />
            <stop offset="1" stopColor="#1E293B" />
          </linearGradient>

          {/* Bus Orange Gradient */}
          <linearGradient id="errBusOrange" x1="0" y1="0" x2="1" y2="0">
            <stop stopColor="#FF6A00" />
            <stop offset="1" stopColor="#FF7A1A" />
          </linearGradient>

          {/* Hazard Badge Gradient */}
          <linearGradient id="hazardGrad" x1="0" y1="0" x2="0" y2="1">
            <stop stopColor="#F59E0B" />
            <stop offset="1" stopColor="#D97706" />
          </linearGradient>
        </defs>

        {/* 1. Backdrop Sky Silhouette */}
        <path d="M0 50 Q150 20 300 40 T600 50 L600 350 L0 350 Z" className="fill-[#F5F7FA]/60 dark:fill-[#0E1A29]/60" />

        {/* 2. Distant Soft Mountains */}
        <path
          d="M20 280 L140 130 Q160 105 180 130 L280 240 L380 90 Q400 65 420 90 L580 280 Z"
          fill="url(#errMountainBack)"
        />
        <path
          d="M0 300 L90 190 Q110 165 130 190 L240 300 L320 180 Q340 155 360 180 L520 320 L600 300 L600 400 L0 400 Z"
          fill="url(#errMountainFront)"
        />

        {/* 3. Floating Clouds */}
        <g className="opacity-60 dark:opacity-30 fill-white dark:fill-slate-600">
          <path d="M70 70 Q85 55 105 65 Q125 50 145 65 Q160 70 155 85 L70 85 Z" />
          <path d="M430 50 Q445 35 465 45 Q485 30 505 45 Q520 50 515 65 L430 65 Z" />
        </g>

        {/* 4. Winding Highway Road */}
        <path
          d="M180 400 C200 320 340 260 360 210 C370 185 350 170 330 170 C310 170 290 185 300 210 C320 260 460 320 480 400 Z"
          fill="url(#errRoadGrad)"
        />
        
        {/* Road Dashed Centerline */}
        <path
          d="M330 400 C340 330 330 240 330 170"
          stroke="#F59E0B"
          strokeWidth="4"
          strokeDasharray="14 10"
          strokeLinecap="round"
        />

        {/* 5. Zenera Travel Bus (Parked Safely on the Roadside) */}
        <g transform="translate(190, 210)">
          {/* Bus Shadow */}
          <ellipse cx="90" cy="115" rx="85" ry="12" fill="black" opacity="0.25" />

          {/* Main Bus Body */}
          <rect x="15" y="20" width="150" height="85" rx="14" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="2" />
          
          {/* Lower Orange Brand Band */}
          <path d="M15 65 H165 V91 Q165 105 151 105 H29 Q15 105 15 91 Z" fill="url(#errBusOrange)" />

          {/* Windshield & Side Windows */}
          <rect x="25" y="30" width="30" height="28" rx="6" fill="#1E293B" />
          <rect x="62" y="30" width="24" height="28" rx="4" fill="#334155" />
          <rect x="92" y="30" width="24" height="28" rx="4" fill="#334155" />
          <rect x="122" y="30" width="32" height="28" rx="4" fill="#334155" />

          {/* Zenera Logo Mark on Bus Side */}
          <text x="60" y="88" fill="#FFFFFF" fontFamily="sans-serif" fontWeight="900" fontSize="11" letterSpacing="1">
            ZENERA
          </text>

          {/* Amber Hazard Flasher Lights */}
          <rect x="18" y="75" width="8" height="10" rx="3" fill="#F59E0B" />
          <rect x="154" y="75" width="8" height="10" rx="3" fill="#F59E0B" />

          {/* Wheels */}
          <g>
            <circle cx="45" cy="105" r="16" fill="#0F172A" />
            <circle cx="45" cy="105" r="8" fill="#94A3B8" />
            <circle cx="135" cy="105" r="16" fill="#0F172A" />
            <circle cx="135" cy="105" r="8" fill="#94A3B8" />
          </g>
        </g>

        {/* 6. Hazard Warning Symbol Overhead with Pulse Accent */}
        <g transform="translate(280, 100)">
          {/* Outer Warning Pulse Circle */}
          <circle cx="20" cy="20" r="32" fill="#F59E0B" opacity="0.15" />
          <circle cx="20" cy="20" r="24" fill="#F59E0B" opacity="0.25" />

          {/* Warning Triangle */}
          <path
            d="M20 2 L38 34 Q39 36 37 38 L3 38 Q1 36 2 34 Z"
            fill="url(#hazardGrad)"
            stroke="#B45309"
            strokeWidth="2"
          />

          {/* Exclamation Mark */}
          <path d="M20 14 V24" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" />
          <circle cx="20" cy="30" r="1.5" fill="#FFFFFF" />
        </g>

        {/* 7. Scenic Roadside Foliage & Trees */}
        <g className="fill-emerald-700/80 dark:fill-emerald-800/80">
          <circle cx="110" cy="330" r="18" />
          <circle cx="125" cy="325" r="14" />
          <circle cx="490" cy="340" r="22" />
          <circle cx="510" cy="335" r="16" />
        </g>

      </motion.svg>
    </div>
  );
}
