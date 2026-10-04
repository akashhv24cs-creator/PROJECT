import { motion } from "framer-motion";

export default function NotFoundIllustration() {
  return (
    <div className="relative w-full max-w-lg mx-auto select-none">
      
      {/* Background Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 sm:w-96 h-72 sm:h-96 bg-orange/10 dark:bg-orange/15 rounded-full blur-3xl pointer-events-none" />

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
          {/* Sky Gradients */}
          <linearGradient id="skyLight" x1="300" y1="0" x2="300" y2="300" gradientUnits="userSpaceOnUse">
            <stop stopColor="#E0F2FE" stopOpacity="0.8" />
            <stop offset="1" stopColor="#FFFBF7" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="skyDark" x1="300" y1="0" x2="300" y2="300" gradientUnits="userSpaceOnUse">
            <stop stopColor="#1E293B" stopOpacity="0.5" />
            <stop offset="1" stopColor="#07111F" stopOpacity="0" />
          </linearGradient>

          {/* Mountain Gradients */}
          <linearGradient id="mountainBack" x1="300" y1="80" x2="300" y2="300" gradientUnits="userSpaceOnUse">
            <stop stopColor="#94A3B8" stopOpacity="0.3" />
            <stop offset="1" stopColor="#CBD5E1" stopOpacity="0.1" />
          </linearGradient>
          <linearGradient id="mountainFront" x1="300" y1="120" x2="300" y2="300" gradientUnits="userSpaceOnUse">
            <stop stopColor="#64748B" stopOpacity="0.4" />
            <stop offset="1" stopColor="#94A3B8" stopOpacity="0.2" />
          </linearGradient>

          {/* Road Gradient */}
          <linearGradient id="roadGrad" x1="300" y1="200" x2="300" y2="400" gradientUnits="userSpaceOnUse">
            <stop stopColor="#334155" />
            <stop offset="1" stopColor="#1E293B" />
          </linearGradient>

          {/* Bus Orange Gradient */}
          <linearGradient id="busOrange" x1="0" y1="0" x2="1" y2="0">
            <stop stopColor="#FF6A00" />
            <stop offset="1" stopColor="#FF7A1A" />
          </linearGradient>
        </defs>

        {/* 1. Backdrop Sky Silhouette */}
        <path d="M0 50 Q150 20 300 40 T600 50 L600 350 L0 350 Z" className="fill-[#F5F7FA]/60 dark:fill-[#0E1A29]/60" />

        {/* 2. Distant Soft Mountains */}
        <path
          d="M20 280 L140 130 Q160 105 180 130 L280 240 L380 90 Q400 65 420 90 L580 280 Z"
          fill="url(#mountainBack)"
        />
        <path
          d="M0 300 L90 190 Q110 165 130 190 L240 300 L320 180 Q340 155 360 180 L520 320 L600 300 L600 400 L0 400 Z"
          fill="url(#mountainFront)"
        />

        {/* 3. Floating Clouds */}
        <g className="opacity-60 dark:opacity-30 fill-white dark:fill-slate-600">
          <path d="M80 80 Q95 65 115 75 Q135 60 155 75 Q170 80 165 95 L80 95 Z" />
          <path d="M420 60 Q435 45 455 55 Q475 40 495 55 Q510 60 505 75 L420 75 Z" />
        </g>

        {/* 4. Winding Highway Road */}
        <path
          d="M180 400 C200 320 340 260 360 210 C370 185 350 170 330 170 C310 170 290 185 300 210 C320 260 460 320 480 400 Z"
          fill="url(#roadGrad)"
        />
        
        {/* Road Dashed Centerline */}
        <path
          d="M330 400 C340 330 330 240 330 170"
          stroke="#F59E0B"
          strokeWidth="4"
          strokeDasharray="14 10"
          strokeLinecap="round"
        />

        {/* 5. Zenera Travel Bus (Approaching the Detour) */}
        <g transform="translate(180, 220)">
          {/* Bus Shadow */}
          <ellipse cx="90" cy="115" rx="85" ry="12" fill="black" opacity="0.25" />

          {/* Main Bus Body */}
          <rect x="15" y="20" width="150" height="85" rx="14" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="2" />
          
          {/* Lower Orange Brand Band */}
          <path d="M15 65 H165 V91 Q165 105 151 105 H29 Q15 105 15 91 Z" fill="url(#busOrange)" />

          {/* Windshield & Side Windows */}
          <rect x="25" y="30" width="30" height="28" rx="6" fill="#1E293B" />
          <rect x="62" y="30" width="24" height="28" rx="4" fill="#334155" />
          <rect x="92" y="30" width="24" height="28" rx="4" fill="#334155" />
          <rect x="122" y="30" width="32" height="28" rx="4" fill="#334155" />

          {/* Zenera Logo Mark on Bus Side */}
          <text x="60" y="88" fill="#FFFFFF" fontFamily="sans-serif" fontWeight="900" fontSize="11" letterSpacing="1">
            ZENERA
          </text>

          {/* Headlights */}
          <rect x="18" y="75" width="8" height="10" rx="3" fill="#FEF08A" />
          <rect x="154" y="75" width="8" height="10" rx="3" fill="#EF4444" />

          {/* Wheels */}
          <g>
            <circle cx="45" cy="105" r="16" fill="#0F172A" />
            <circle cx="45" cy="105" r="8" fill="#94A3B8" />
            <circle cx="135" cy="105" r="16" fill="#0F172A" />
            <circle cx="135" cy="105" r="8" fill="#94A3B8" />
          </g>
        </g>

        {/* 6. Wooden Directional Signpost */}
        <g transform="translate(380, 200)">
          {/* Post */}
          <rect x="36" y="40" width="10" height="100" rx="2" fill="#78350F" />
          
          {/* Wooden Board (Pointing Left/Right) */}
          <g transform="rotate(-4, 40, 40)">
            <path
              d="M-30 15 L95 15 L115 35 L95 55 L-30 55 Q-35 55 -35 50 L-35 20 Q-35 15 -30 15 Z"
              fill="#9A3412"
              stroke="#EA580C"
              strokeWidth="2"
            />
            {/* Sign Text */}
            <text x="-20" y="33" fill="#FFF7ED" fontFamily="sans-serif" fontWeight="800" fontSize="10">
              Let's get
            </text>
            <text x="-20" y="47" fill="#FFF7ED" fontFamily="sans-serif" fontWeight="800" fontSize="10">
              you back →
            </text>
          </g>
        </g>

        {/* 7. Scenic Roadside Foliage & Trees */}
        <g className="fill-emerald-700/80 dark:fill-emerald-800/80">
          <circle cx="120" cy="330" r="18" />
          <circle cx="135" cy="325" r="14" />
          <circle cx="490" cy="340" r="22" />
          <circle cx="510" cy="335" r="16" />
        </g>

      </motion.svg>
    </div>
  );
}
