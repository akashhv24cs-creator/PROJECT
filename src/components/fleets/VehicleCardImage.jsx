import React, { useState } from "react";

/**
 * Real Vehicle Photographic Image Component for Fleet Cards
 * Maps vehicle name/type to authentic photography while keeping pricing 100% decoupled.
 */

const VEHICLE_IMAGE_MAP = {
  "dzire": "/vehicles/dzire.jpg",
  "sedan": "/vehicles/dzire.jpg",
  "hatchback": "/vehicles/dzire.jpg",
  "honda": "/vehicles/dzire.jpg",
  "ertiga": "/vehicles/ertiga.jpg",
  "innova": "/vehicles/innova-crysta.jpg",
  "innova crysta": "/vehicles/innova-crysta.jpg",
  "innova-crysta": "/vehicles/innova-crysta.jpg",
  "suv": "/vehicles/innova-crysta.jpg",
  "toyota": "/vehicles/innova-crysta.jpg",
  "tt": "/vehicles/tempo-traveller.jpg",
  "tempo": "/vehicles/tempo-traveller.jpg",
  "tempo-traveller": "/vehicles/tempo-traveller.jpg",
  "tempo traveller": "/vehicles/tempo-traveller.jpg",
  "urbania": "/vehicles/tempo-traveller.jpg",
  "mini bus": "/vehicles/mini-bus.jpg",
  "mini-bus": "/vehicles/mini-bus.jpg",
  "minibus": "/vehicles/mini-bus.jpg",
  "bus": "/vehicles/luxury-bus.jpg",
  "luxury-bus": "/vehicles/luxury-bus.jpg",
  "luxury bus": "/vehicles/luxury-bus.jpg",
};

export default function VehicleCardImage({ vehicleId, vehicleName, className = "" }) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  const id = (vehicleId || "").trim().toLowerCase();
  const name = (vehicleName || "").trim().toLowerCase();

  let imageSrc = VEHICLE_IMAGE_MAP[id] || VEHICLE_IMAGE_MAP[name] || "/vehicles/innova-crysta.jpg";

  if (!VEHICLE_IMAGE_MAP[id] && !VEHICLE_IMAGE_MAP[name]) {
    if (name.includes("dzire") || name.includes("etios") || name.includes("sedan") || name.includes("honda") || name.includes("hatchback")) {
      imageSrc = "/vehicles/dzire.jpg";
    } else if (name.includes("ertiga")) {
      imageSrc = "/vehicles/ertiga.jpg";
    } else if (name.includes("innova") || name.includes("crysta") || name.includes("suv") || name.includes("toyota")) {
      imageSrc = "/vehicles/innova-crysta.jpg";
    } else if (name.includes("tempo") || name.includes("traveller") || name.includes("urbania") || name === "tt") {
      imageSrc = "/vehicles/tempo-traveller.jpg";
    } else if (name.includes("mini bus") || name.includes("minibus") || name.includes("mini-bus")) {
      imageSrc = "/vehicles/mini-bus.jpg";
    } else if (name.includes("luxury bus") || name.includes("bus")) {
      imageSrc = "/vehicles/luxury-bus.jpg";
    }
  }

  return (
    <div className={`w-full aspect-[16/10] bg-slate-100 dark:bg-[#152436] rounded-2xl flex items-center justify-center relative overflow-hidden ${className}`}>
      {/* Loading Skeleton */}
      {!imageLoaded && !hasError && (
        <div className="absolute inset-0 bg-slate-200 dark:bg-[#1E2E42] animate-pulse rounded-2xl" />
      )}

      {/* Real Vehicle Photograph */}
      <img
        src={`${imageSrc}?v=2026_left_aligned`}
        alt={vehicleName || "Zenera Fleet Vehicle"}
        onLoad={() => setImageLoaded(true)}
        onError={() => {
          setHasError(true);
          setImageLoaded(true);
        }}
        className={`w-full h-full object-cover object-center rounded-2xl transition-all duration-300 ${
          imageLoaded ? "opacity-100 scale-100" : "opacity-0 scale-95"
        }`}
        loading="lazy"
      />

      {/* Subtle Bottom Scrim for Visual Polish */}
      <div className="absolute inset-x-0 bottom-0 h-6 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
    </div>
  );
}
