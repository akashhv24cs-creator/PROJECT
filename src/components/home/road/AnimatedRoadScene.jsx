import { useEffect, useRef, useState, useMemo } from "react";
import { useTheme } from "../../../context/ThemeContext";

/**
 * ZENERA TRIPS — 2D Animated Scenic Travel Road Scene
 * 
 * Layer Architecture:
 * 1. Sky & Sun Atmosphere
 * 2. Soft Drifting Clouds (Subtle Parallax)
 * 3. Layered Mountain Ranges
 * 4. Distant City Skyline
 * 5. Calm Shimmering Blue Lake
 * 6. Rolling Green Hills & Forests
 * 7. Foreground Roadside Vegetation & Flowers
 * 8. Highway Guardrail & Posts
 * 9. Dark Asphalt Road with Moving Lane Markings
 * 10. 3 Autonomous 2D Vehicles (SUV, Sedan, Luxury Coach Bus)
 */

export default function AnimatedRoadScene() {
  const { isDark } = useTheme();
  const containerRef = useRef(null);
  const [containerWidth, setContainerWidth] = useState(1200);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  // Measure container width for offscreen spawn calculations
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.clientWidth || 1200);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);
    const handleMotionChange = (e) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener("change", handleMotionChange);

    return () => {
      window.removeEventListener("resize", handleResize);
      mediaQuery.removeEventListener("change", handleMotionChange);
    };
  }, []);

  return (
    <section className="relative w-full overflow-hidden select-none bg-[#FFFBF7] dark:bg-[#07111F] py-8 sm:py-12 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-6 sm:mb-8">
          <h2 className="font-heading font-extrabold text-2xl sm:text-3xl lg:text-4xl text-charcoal dark:text-white tracking-tight uppercase">
            <span>YOUR JOURNEY, </span>
            <span className="text-blink-orange">ON THE ROAD</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-2">
            Comfortable outstation road trips with verified drivers across scenic routes.
          </p>
        </div>

        {/* 2D Scenic Travel Scene Frame */}
        <div
          ref={containerRef}
          className="relative w-full h-[360px] sm:h-[430px] lg:h-[480px] rounded-3xl overflow-hidden shadow-2xl border border-[#E2E8F0] dark:border-[#1E2E42] bg-gradient-to-b from-[#38BDF8] via-[#7DD3FC] to-[#BAE6FD] dark:from-[#0B192C] dark:via-[#0F2844] dark:to-[#07111F]"
        >
          {/* 1. SKY ATMOSPHERE & SUN/MOON AURA */}
          <div className="absolute inset-0 pointer-events-none z-0">
            <div
              className={`absolute top-4 right-16 sm:right-28 w-28 h-28 sm:w-36 sm:h-36 rounded-full blur-2xl opacity-70 ${isDark ? "bg-[#38BDF8]/20" : "bg-[#FEF08A]/60"
                }`}
            />
          </div>

          {/* 2. SOFT DRIFTING CLOUDS (PARALLAX LAYER) */}
          <CloudsLayer isDark={isDark} reducedMotion={prefersReducedMotion} />

          {/* 3. LAYERED MOUNTAINS */}
          <MountainsLayer isDark={isDark} />

          {/* 4. DISTANT CITY SKYLINE */}
          <CitySkylineLayer isDark={isDark} />

          {/* 5. CALM BLUE LAKE / WATER */}
          <LakeLayer isDark={isDark} reducedMotion={prefersReducedMotion} />

          {/* 6. ROLLING GREEN HILLS & TREES */}
          <GreenHillsLayer isDark={isDark} />

          {/* 7. ROADSIDE VEGETATION & FLOWERS */}
          <VegetationLayer isDark={isDark} />

          {/* 8. HIGHWAY GUARDRAIL */}
          <GuardrailLayer isDark={isDark} />

          {/* 9. WIDE DARK ASPHALT HIGHWAY */}
          <RoadLayer isDark={isDark} reducedMotion={prefersReducedMotion} />

          {/* 10. INDEPENDENT MOVING VEHICLES (SUV, SEDAN, COACH BUS) */}
          <VehiclesManager
            containerWidth={containerWidth}
            isDark={isDark}
            reducedMotion={prefersReducedMotion}
          />
        </div>
      </div>
    </section>
  );
}

/* ==========================================================================
   LAYER 1: CLOUDS
   ========================================================================== */
function CloudsLayer({ isDark, reducedMotion }) {
  return (
    <div className="absolute top-0 inset-x-0 h-44 overflow-hidden pointer-events-none z-10">
      <div
        className={`absolute top-4 ${reducedMotion ? "left-[10%]" : "animate-cloud-drift-slow"}`}
        style={{ opacity: isDark ? 0.35 : 0.85 }}
      >
        <svg width="160" height="55" viewBox="0 0 150 50" fill={isDark ? "#334155" : "#FFFFFF"}>
          <path d="M20,38 Q20,20 38,20 Q46,8 65,8 Q80,2 96,14 Q108,6 122,18 Q135,20 135,38 Q135,46 120,46 L32,46 Q20,46 20,38 Z" />
        </svg>
      </div>

      <div
        className={`absolute top-10 ${reducedMotion ? "left-[55%]" : "animate-cloud-drift-medium"}`}
        style={{ opacity: isDark ? 0.25 : 0.75 }}
      >
        <svg width="210" height="70" viewBox="0 0 200 65" fill={isDark ? "#1E293B" : "#FFFFFF"}>
          <path d="M25,48 Q25,28 48,28 Q60,12 82,12 Q100,5 120,18 Q140,8 160,22 Q175,26 175,48 Q175,58 150,58 L45,58 Q25,58 25,48 Z" />
        </svg>
      </div>

      <div
        className={`absolute top-3 ${reducedMotion ? "left-[82%]" : "animate-cloud-drift-fast"}`}
        style={{ opacity: isDark ? 0.2 : 0.6 }}
      >
        <svg width="120" height="45" viewBox="0 0 110 40" fill={isDark ? "#334155" : "#FFFFFF"}>
          <path d="M15,30 Q15,16 30,16 Q38,8 52,8 Q65,4 76,12 Q88,8 98,16 Q105,22 105,30 Q105,38 90,38 L28,38 Q15,38 15,30 Z" />
        </svg>
      </div>
    </div>
  );
}

/* ==========================================================================
   LAYER 2: MOUNTAINS (Layered Distant & Mid Peaks)
   ========================================================================== */
function MountainsLayer({ isDark }) {
  return (
    <div className="absolute inset-x-0 bottom-[180px] sm:bottom-[210px] lg:bottom-[235px] h-56 pointer-events-none z-15">
      {/* Distant Soft Mountain Ridges */}
      <svg
        viewBox="0 0 1440 200"
        preserveAspectRatio="none"
        className="absolute bottom-10 left-0 w-full h-48"
      >
        <path
          d="M0,200 L0,110 Q120,40 240,95 T480,65 T720,45 T960,80 T1200,55 T1440,90 L1440,200 Z"
          fill={isDark ? "#0E243A" : "#7DD3FC"}
          opacity={isDark ? "0.6" : "0.65"}
        />
      </svg>

      {/* Near Rocky Mountain Ridges with Snow-Tips */}
      <svg
        viewBox="0 0 1440 200"
        preserveAspectRatio="none"
        className="absolute bottom-0 left-0 w-full h-44"
      >
        <path
          d="M0,200 L0,95 L90,45 L180,105 L290,30 L400,110 L520,40 L640,115 L760,25 L880,100 L1010,35 L1140,105 L1270,50 L1380,90 L1440,75 L1440,200 Z"
          fill={isDark ? "#123456" : "#38BDF8"}
          opacity={isDark ? "0.9" : "0.85"}
        />
        {/* Snow Peaks */}
        <polygon points="85,55 90,45 95,55" fill="#FFFFFF" opacity="0.9" />
        <polygon points="280,42 290,30 300,42" fill="#FFFFFF" opacity="0.9" />
        <polygon points="510,52 520,40 530,52" fill="#FFFFFF" opacity="0.9" />
        <polygon points="750,38 760,25 770,38" fill="#FFFFFF" opacity="0.9" />
        <polygon points="1000,48 1010,35 1020,48" fill="#FFFFFF" opacity="0.9" />
        <polygon points="1260,60 1270,50 1280,60" fill="#FFFFFF" opacity="0.9" />
      </svg>
    </div>
  );
}

/* ==========================================================================
   LAYER 3: DISTANT CITY SKYLINE
   ========================================================================== */
function CitySkylineLayer({ isDark }) {
  return (
    <div className="absolute inset-x-0 bottom-[160px] sm:bottom-[185px] lg:bottom-[205px] h-20 pointer-events-none z-18 opacity-45 dark:opacity-35">
      <svg
        viewBox="0 0 1440 80"
        preserveAspectRatio="none"
        className="w-full h-full"
      >
        {/* Skyline Silhouette */}
        <path
          d="M0,80 L0,70 L40,70 L40,55 L55,55 L55,70 L90,70 L90,45 L105,45 L105,35 L112,20 L120,35 L120,70 L160,70 L160,50 L180,50 L180,70 L240,70 L240,40 L265,40 L265,70 L320,70 L320,55 L340,55 L340,70 L400,70 L400,45 L415,30 L430,45 L430,70 L500,70 L500,50 L530,50 L530,70 L600,70 L600,35 L625,35 L625,70 L700,70 L700,48 L725,48 L725,70 L800,70 L800,42 L815,25 L830,42 L830,70 L900,70 L900,52 L930,52 L930,70 L1000,70 L1000,38 L1030,38 L1030,70 L1100,70 L1100,50 L1130,50 L1130,70 L1200,70 L1200,45 L1225,45 L1225,70 L1300,70 L1300,35 L1320,22 L1340,35 L1340,70 L1440,70 L1440,80 Z"
          fill={isDark ? "#1E293B" : "#0284C7"}
        />
      </svg>
    </div>
  );
}

/* ==========================================================================
   LAYER 4: CALM BLUE LAKE / WATER
   ========================================================================== */
function LakeLayer({ isDark, reducedMotion }) {
  return (
    <div className="absolute inset-x-0 bottom-[140px] sm:bottom-[160px] lg:bottom-[180px] h-20 pointer-events-none z-20 overflow-hidden">
      <div
        className={`w-full h-full ${isDark
            ? "bg-gradient-to-b from-[#0A2540] via-[#0C3358] to-[#0E416F]"
            : "bg-gradient-to-b from-[#0284C7] via-[#0369A1] to-[#075985]"
          }`}
      />
      {/* Shimmer Water Reflections */}
      <div
        className={`absolute inset-0 opacity-40 ${reducedMotion ? "" : "animate-water-shimmer"
          }`}
        style={{
          backgroundImage: `repeating-linear-gradient(90deg, transparent, transparent 50px, rgba(255,255,255,0.4) 50px, rgba(255,255,255,0.4) 75px)`,
          backgroundSize: "200% 100%",
        }}
      />
    </div>
  );
}

/* ==========================================================================
   LAYER 5: ROLLING GREEN HILLS & TREES
   ========================================================================== */
function GreenHillsLayer({ isDark }) {
  return (
    <div className="absolute inset-x-0 bottom-[115px] sm:bottom-[135px] lg:bottom-[150px] h-20 pointer-events-none z-25">
      <svg
        viewBox="0 0 1440 80"
        preserveAspectRatio="none"
        className="w-full h-full"
      >
        {/* Rolling Green Ridge */}
        <path
          d="M0,80 L0,40 Q180,20 360,35 T720,22 T1080,32 T1440,20 L1440,80 Z"
          fill={isDark ? "#064E3B" : "#16A34A"}
        />
        {/* Layer of Pine & Deciduous Trees */}
        {Array.from({ length: 52 }).map((_, i) => {
          const x = i * 28 + (i % 3) * 3;
          const h = 24 + (i % 5) * 5;
          const isPine = i % 2 === 0;
          return isPine ? (
            <polygon
              key={i}
              points={`${x},46 ${x + 8},${46 - h} ${x + 16},46`}
              fill={i % 3 === 0 ? (isDark ? "#022C22" : "#14532D") : isDark ? "#064E3B" : "#15803D"}
            />
          ) : (
            <circle
              key={i}
              cx={x + 8}
              cy={46 - h * 0.45}
              r={h * 0.48}
              fill={i % 3 === 1 ? (isDark ? "#065F46" : "#22C55E") : isDark ? "#047857" : "#16A34A"}
            />
          );
        })}
      </svg>
    </div>
  );
}

/* ==========================================================================
   LAYER 6: FOREGROUND ROADSIDE VEGETATION & WILDFLOWERS
   ========================================================================== */
function VegetationLayer({ isDark }) {
  return (
    <div className="absolute inset-x-0 bottom-[104px] sm:bottom-[122px] lg:bottom-[136px] h-10 pointer-events-none z-28 overflow-hidden">
      <svg
        viewBox="0 0 1440 40"
        preserveAspectRatio="none"
        className="w-full h-full"
      >
        <path
          d="M0,40 L0,15 Q240,5 480,12 T960,8 T1440,14 L1440,40 Z"
          fill={isDark ? "#042F2E" : "#15803D"}
        />
        {/* Roadside Wildflowers */}
        {Array.from({ length: 40 }).map((_, i) => {
          const x = i * 36 + (i % 4) * 5;
          const colors = ["#FF6A00", "#FDE047", "#FFFFFF", "#F472B6", "#A78BFA"];
          const c = colors[i % colors.length];
          return (
            <circle
              key={i}
              cx={x}
              cy={12 + (i % 3) * 3}
              r={2.5}
              fill={c}
              opacity={0.9}
            />
          );
        })}
      </svg>
    </div>
  );
}

/* ==========================================================================
   LAYER 7: HIGHWAY GUARDRAIL
   ========================================================================== */
function GuardrailLayer({ isDark }) {
  return (
    <div className="absolute inset-x-0 bottom-[104px] sm:bottom-[122px] lg:bottom-[136px] h-6 pointer-events-none z-30 flex flex-col justify-end">
      <div className="w-full h-[3.5px] bg-[#94A3B8] dark:bg-[#475569] shadow-xs" />
      <div className="w-full h-[2px] bg-[#CBD5E1] dark:bg-[#64748B]" />
      <div
        className="w-full h-3.5 flex justify-between px-2"
        style={{
          backgroundImage: `repeating-linear-gradient(90deg, transparent, transparent 36px, ${isDark ? "#475569" : "#64748B"
            } 36px, ${isDark ? "#475569" : "#64748B"} 40px)`,
        }}
      />
    </div>
  );
}

/* ==========================================================================
   LAYER 8: DARK ASPHALT HIGHWAY ROAD
   ========================================================================== */
function RoadLayer({ isDark, reducedMotion }) {
  return (
    <div className="absolute inset-x-0 bottom-0 h-[108px] sm:h-[126px] lg:h-[140px] pointer-events-none z-35 overflow-hidden">
      <div className="w-full h-full bg-gradient-to-b from-[#1E293B] via-[#0F172A] to-[#020617] relative">
        {/* Top Safety Stripe */}
        <div className="absolute top-0 inset-x-0 h-[3px] bg-[#FF6A00]" />

        {/* Center Dashed White Moving Lane Line */}
        <div className="absolute top-[48%] inset-x-0 h-[3.5px] overflow-hidden">
          <div
            className={`w-[200%] h-full flex ${reducedMotion ? "" : "animate-road-markings"
              }`}
          >
            {Array.from({ length: 50 }).map((_, i) => (
              <div
                key={i}
                className="h-[3.5px] w-10 sm:w-12 bg-white/95 rounded-xs shrink-0 mr-10 sm:mr-12"
              />
            ))}
          </div>
        </div>

        {/* Bottom Solid White Edge Line */}
        <div className="absolute bottom-3 inset-x-0 h-[2.5px] bg-white/80" />
      </div>
    </div>
  );
}

/* ==========================================================================
   LAYER 9: VEHICLES MANAGER (SUV, SEDAN, LUXURY COACH BUS)
   ========================================================================== */
function VehiclesManager({ containerWidth, isDark, reducedMotion }) {
  const VEHICLE_CONFIGS = useMemo(
    () => [
      {
        id: "suv",
        type: "suv",
        baseSpeedMin: 8,
        baseSpeedMax: 12,
        width: 175,
        height: 62,
        laneY: 28,
        zIndex: 42,
      },
      {
        id: "sedan",
        type: "sedan",
        baseSpeedMin: 9,
        baseSpeedMax: 14,
        width: 160,
        height: 52,
        laneY: 56,
        zIndex: 40,
      },
      {
        id: "bus",
        type: "bus",
        baseSpeedMin: 12,
        baseSpeedMax: 18,
        width: 250,
        height: 80,
        laneY: 10,
        zIndex: 45,
      },
    ],
    []
  );

  return (
    <div className="absolute inset-0 pointer-events-none z-40 overflow-hidden">
      {VEHICLE_CONFIGS.map((config, index) => (
        <SingleVehicle
          key={config.id}
          config={config}
          vehicleIndex={index}
          containerWidth={containerWidth}
          isDark={isDark}
          reducedMotion={reducedMotion}
        />
      ))}
    </div>
  );
}

function SingleVehicle({ config, vehicleIndex, containerWidth, isDark, reducedMotion }) {
  const getRandomParams = (isInitial = false) => {
    const direction = isInitial
      ? vehicleIndex % 2 === 0
        ? 1
        : -1
      : Math.random() > 0.5
        ? 1
        : -1;

    const duration =
      config.baseSpeedMin + Math.random() * (config.baseSpeedMax - config.baseSpeedMin);

    const initialDelay = isInitial ? vehicleIndex * 2.5 : 3 + Math.random() * 6;

    return { direction, duration, initialDelay };
  };

  const [state, setState] = useState(() => getRandomParams(true));
  const [cycleKey, setCycleKey] = useState(0);

  const handleAnimationEnd = () => {
    const nextParams = getRandomParams(false);
    setTimeout(() => {
      setState(nextParams);
      setCycleKey((k) => k + 1);
    }, nextParams.initialDelay * 1000);
  };

  if (reducedMotion) {
    const staticPositions = [containerWidth * 0.2, containerWidth * 0.55, containerWidth * 0.8];
    const posX = staticPositions[vehicleIndex] || containerWidth * 0.3;
    return (
      <div
        className="absolute transition-all duration-300"
        style={{
          bottom: `${config.laneY}px`,
          left: `${posX}px`,
          zIndex: config.zIndex,
          transform: state.direction === -1 ? "scaleX(-1)" : "scaleX(1)",
        }}
      >
        <VehicleGraphic type={config.type} isDark={isDark} isMoving={false} />
      </div>
    );
  }

  const startX = state.direction === 1 ? -config.width - 100 : containerWidth + 100;
  const endX = state.direction === 1 ? containerWidth + 100 : -config.width - 100;

  return (
    <div
      key={cycleKey}
      onAnimationEnd={handleAnimationEnd}
      className="absolute vehicle-moving-track"
      style={{
        bottom: `${config.laneY}px`,
        left: 0,
        zIndex: config.zIndex,
        animationName: "vehicleTravel",
        animationDuration: `${state.duration}s`,
        animationTimingFunction: "linear",
        animationDelay: `${state.initialDelay}s`,
        animationFillMode: "both",
        "--start-x": `${startX}px`,
        "--end-x": `${endX}px`,
      }}
    >
      {/* Horizontal Flip on Right-to-Left Travel */}
      <div
        className="relative"
        style={{
          transform: state.direction === -1 ? "scaleX(-1)" : "scaleX(1)",
          transformOrigin: "center center",
        }}
      >
        <VehicleGraphic
          type={config.type}
          isDark={isDark}
          isMoving={true}
          direction={state.direction}
        />
      </div>
    </div>
  );
}

function VehicleGraphic({ type, isDark, isMoving, direction }) {
  if (type === "suv") {
    return <SUVVector isDark={isDark} isMoving={isMoving} direction={direction} />;
  }
  if (type === "sedan") {
    return <SedanVector isDark={isDark} isMoving={isMoving} direction={direction} />;
  }
  return <CoachBusVector isDark={isDark} isMoving={isMoving} direction={direction} />;
}

/* ==========================================================================
   1. SUV VECTOR GRAPHIC
   ========================================================================== */
function SUVVector({ isDark, isMoving }) {
  const RX = 42;
  const FX = 135;
  const CY = 48;
  const R = 14;

  return (
    <div className={`relative ${isMoving ? "animate-suspension" : ""}`}>
      {/* Ground Contact Shadow */}
      <div className="absolute -bottom-2 left-4 right-4 h-3 bg-black/60 rounded-full blur-[3px] pointer-events-none" />

      <svg width="175" height="62" viewBox="0 0 175 62" fill="none" className="block">
        <defs>
          <linearGradient id="suvBodyGrad2" x1="0" y1="0" x2="0" y2="62" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="35%" stopColor="#F1F5F9" />
            <stop offset="75%" stopColor="#CBD5E1" />
            <stop offset="100%" stopColor="#475569" />
          </linearGradient>
          <linearGradient id="suvGlassGrad2" x1="0" y1="10" x2="0" y2="32" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#0F172A" />
            <stop offset="50%" stopColor="#1E293B" />
            <stop offset="100%" stopColor="#020617" />
          </linearGradient>
        </defs>

        {/* Roof Rails */}
        <rect x="45" y="4" width="78" height="2.5" rx="1" fill="#475569" />
        <rect x="52" y="6" width="5" height="4" fill="#334155" />
        <rect x="112" y="6" width="5" height="4" fill="#334155" />

        {/* SUV Body Hull with Wheel Arches */}
        <path
          d={`M 8,48 
              L 10,30 
              Q 12,22 25,20 
              L 48,10 
              Q 56,8 66,8 
              L 120,8 
              Q 135,8 145,18 
              L 162,30 
              Q 170,33 170,40 
              L 170,48 
              Q 170,50 165,50 
              L ${FX + 18},50 
              A 18,18 0 0,0 ${FX - 18},50 
              L ${RX + 18},50 
              A 18,18 0 0,0 ${RX - 18},50 
              L 10,50 
              Q 8,50 8,48 Z`}
          fill="url(#suvBodyGrad2)"
          stroke="#475569"
          strokeWidth="1.5"
        />

        {/* Tinted Cabin Windows */}
        <path
          d="M 48,22 L 64,11 L 118,11 Q 128,11 135,18 L 150,25 Q 152,26 150,26 L 48,26 Z"
          fill="url(#suvGlassGrad2)"
        />
        {/* Window Pillars */}
        <rect x="82" y="11" width="4.5" height="15" fill="#0F172A" />
        <rect x="110" y="11" width="4.5" height="15" fill="#0F172A" />

        {/* Signature Zenera Orange Speed Stripe */}
        <path d="M 10,38 L 168,38" stroke="#FF6A00" strokeWidth="3" strokeLinecap="round" />

        {/* Door Seam Lines */}
        <path d="M 60,26 L 60,48 M 96,26 L 96,48" stroke="#94A3B8" strokeWidth="1.2" />
        {/* Handles */}
        <rect x="66" y="30" width="9" height="2.5" rx="1" fill="#334155" />
        <rect x="102" y="30" width="9" height="2.5" rx="1" fill="#334155" />

        {/* Headlight & Taillight */}
        <rect x="162" y="33" width="8" height="6" rx="2" fill="#FEF08A" />
        <rect x="8" y="32" width="5" height="8" rx="1.5" fill="#EF4444" />

        {/* Side Mirror */}
        <rect x="52" y="21" width="6" height="5" rx="1.5" fill="#1E293B" />

        {/* Front & Rear Alloy Wheels */}
        <WheelGroup cx={RX} cy={CY} radius={R} isMoving={isMoving} />
        <WheelGroup cx={FX} cy={CY} radius={R} isMoving={isMoving} />
      </svg>
    </div>
  );
}

/* ==========================================================================
   2. SEDAN VECTOR GRAPHIC
   ========================================================================== */
function SedanVector({ isDark, isMoving }) {
  const RX = 36;
  const FX = 125;
  const CY = 40;
  const R = 12;

  return (
    <div className={`relative ${isMoving ? "animate-suspension" : ""}`}>
      {/* Ground Contact Shadow */}
      <div className="absolute -bottom-1.5 left-3 right-3 h-3 bg-black/60 rounded-full blur-[3px] pointer-events-none" />

      <svg width="160" height="52" viewBox="0 0 160 52" fill="none" className="block">
        <defs>
          <linearGradient id="sedanBodyGrad2" x1="0" y1="0" x2="0" y2="52" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="35%" stopColor="#F8FAFC" />
            <stop offset="75%" stopColor="#CBD5E1" />
            <stop offset="100%" stopColor="#334155" />
          </linearGradient>
        </defs>

        {/* Aerodynamic Sedan Body with Wheel Arches */}
        <path
          d={`M 6,40 
              L 8,26 
              Q 15,16 32,15 
              L 55,7 
              Q 65,5 78,5 
              L 102,5 
              Q 115,5 125,12 
              L 148,24 
              Q 156,28 156,34 
              L 156,42 
              Q 156,44 150,44 
              L ${FX + 15},44 
              A 15,15 0 0,0 ${FX - 15},44 
              L ${RX + 15},44 
              A 15,15 0 0,0 ${RX - 15},44 
              L 8,44 
              Q 6,44 6,40 Z`}
          fill="url(#sedanBodyGrad2)"
          stroke="#475569"
          strokeWidth="1.4"
        />

        {/* Sleek Tinted Windows */}
        <path
          d="M 42,18 L 60,9 L 102,9 Q 112,9 120,15 L 135,21 Q 137,22 135,22 L 42,22 Z"
          fill="#0F172A"
        />
        {/* Window Pillar */}
        <rect x="82" y="9" width="4" height="13" fill="#020617" />

        {/* Zenera Orange Accent Line */}
        <path d="M 8,33 L 154,33" stroke="#FF6A00" strokeWidth="2.5" strokeLinecap="round" />

        {/* Headlight & Taillight */}
        <rect x="149" y="27" width="7" height="5" rx="1.5" fill="#FEF08A" />
        <rect x="6" y="27" width="5" height="6" rx="1" fill="#EF4444" />

        {/* Front & Rear Alloy Wheels */}
        <WheelGroup cx={RX} cy={CY} radius={R} isMoving={isMoving} />
        <WheelGroup cx={FX} cy={CY} radius={R} isMoving={isMoving} />
      </svg>
    </div>
  );
}

/* ==========================================================================
   3. COACH BUS VECTOR GRAPHIC
   ========================================================================== */
function CoachBusVector({ isDark, isMoving }) {
  const RX = 65;
  const FX = 195;
  const CY = 63;
  const R = 17;

  return (
    <div className={`relative ${isMoving ? "animate-suspension" : ""}`}>
      {/* Ground Contact Shadow */}
      <div className="absolute -bottom-2 left-4 right-4 h-4 bg-black/65 rounded-full blur-[3.5px] pointer-events-none" />

      <svg width="250" height="80" viewBox="0 0 250 80" fill="none" className="block">
        <defs>
          <linearGradient id="busBodyGrad2" x1="0" y1="0" x2="0" y2="80" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="35%" stopColor="#F8FAFC" />
            <stop offset="75%" stopColor="#E2E8F0" />
            <stop offset="100%" stopColor="#475569" />
          </linearGradient>
          <linearGradient id="busGlassGrad2" x1="0" y1="12" x2="0" y2="42" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#0F172A" />
            <stop offset="50%" stopColor="#1E293B" />
            <stop offset="100%" stopColor="#020617" />
          </linearGradient>
        </defs>

        {/* Roof AC Unit */}
        <rect x="75" y="2" width="95" height="6" rx="2.5" fill="#334155" />
        <rect x="82" y="4" width="10" height="2.5" fill="#64748B" />
        <rect x="100" y="4" width="10" height="2.5" fill="#64748B" />
        <rect x="118" y="4" width="10" height="2.5" fill="#64748B" />
        <rect x="136" y="4" width="10" height="2.5" fill="#64748B" />

        {/* Luxury Coach Body with Wheel Arches */}
        <path
          d={`M 8,68 
              L 8,16 
              Q 8,8 20,8 
              L 216,8 
              Q 235,8 240,22 
              L 245,58 
              Q 245,68 235,68 
              L ${FX + 21},68 
              A 21,21 0 0,0 ${FX - 21},68 
              L ${RX + 21},68 
              A 21,21 0 0,0 ${RX - 21},68 
              L 14,68 
              Q 8,68 8,68 Z`}
          fill="url(#busBodyGrad2)"
          stroke="#475569"
          strokeWidth="1.6"
        />

        {/* Panoramic Passenger Windows */}
        <path
          d="M 20,16 L 214,16 Q 226,16 230,26 L 233,40 L 20,40 Z"
          fill="url(#busGlassGrad2)"
        />
        {/* Window Pillars */}
        {Array.from({ length: 6 }).map((_, i) => (
          <rect key={i} x={46 + i * 29} y="16" width="3.5" height="24" fill="#0F172A" />
        ))}

        {/* Signature Zenera Orange Speed Stripe */}
        <rect x="8" y="45" width="235" height="4.5" fill="#FF6A00" />
        <rect x="8" y="51" width="235" height="2" fill="#1E293B" />

        {/* Electronic LED Destination Board */}
        <rect x="188" y="12" width="40" height="9" rx="2" fill="#020617" />
        <text x="208" y="18.5" fill="#F59E0B" fontSize="6.5" fontWeight="bold" fontFamily="monospace" textAnchor="middle">
          ZENERA
        </text>

        {/* Cargo Compartment Hatches */}
        <rect x="90" y="55" width="24" height="9" rx="1.5" stroke="#94A3B8" strokeWidth="1" />
        <rect x="122" y="55" width="24" height="9" rx="1.5" stroke="#94A3B8" strokeWidth="1" />

        {/* Headlights & Taillights */}
        <rect x="238" y="53" width="6" height="9" rx="2" fill="#FEF08A" />
        <rect x="8" y="48" width="4" height="12" rx="1.5" fill="#EF4444" />

        {/* Front & Rear Alloy Wheels */}
        <WheelGroup cx={RX} cy={CY} radius={R} isMoving={isMoving} />
        <WheelGroup cx={FX} cy={CY} radius={R} isMoving={isMoving} />
      </svg>
    </div>
  );
}

/* ==========================================================================
   ROTATING ALLOY WHEEL COMPONENT (Pure SVG Pivot Rotation)
   ========================================================================== */
function WheelGroup({ cx, cy, radius, isMoving }) {
  return (
    <g transform={`translate(${cx}, ${cy})`}>
      {/* 1. Outer Tyre */}
      <circle cx="0" cy="0" r={radius} fill="#090D16" stroke="#1E293B" strokeWidth="1.5" />
      {/* 2. Inner Rim */}
      <circle cx="0" cy="0" r={radius * 0.72} fill="#334155" />
      {/* 3. Red Brake Caliper */}
      <path
        d={`M -${radius * 0.4} -${radius * 0.4} A ${radius * 0.55} ${radius * 0.55} 0 0 1 ${radius * 0.4} -${radius * 0.4} L 0 0 Z`}
        fill="#EF4444"
      />
      {/* 4. Alloy Spokes with Native SVG Center-Pivot Animation */}
      <g>
        {isMoving && (
          <animateTransform
            attributeName="transform"
            type="rotate"
            from="0 0 0"
            to="360 0 0"
            dur="0.45s"
            repeatCount="indefinite"
          />
        )}
        <circle cx="0" cy="0" r={radius * 0.66} fill="none" stroke="#E2E8F0" strokeWidth="1.2" />
        <line x1={-radius * 0.62} y1="0" x2={radius * 0.62} y2="0" stroke="#FFFFFF" strokeWidth="2.2" />
        <line x1="0" y1={-radius * 0.62} x2="0" y2={radius * 0.62} stroke="#FFFFFF" strokeWidth="2.2" />
        <line
          x1={-radius * 0.44}
          y1={-radius * 0.44}
          x2={radius * 0.44}
          y2={radius * 0.44}
          stroke="#CBD5E1"
          strokeWidth="1.6"
        />
        <line
          x1={-radius * 0.44}
          y1={radius * 0.44}
          x2={radius * 0.44}
          y2={-radius * 0.44}
          stroke="#CBD5E1"
          strokeWidth="1.6"
        />
      </g>
      {/* 5. Center Zenera Orange Hub */}
      <circle cx="0" cy="0" r={radius * 0.24} fill="#FF6A00" />
    </g>
  );
}
