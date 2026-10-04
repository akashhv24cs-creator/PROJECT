import { useState } from "react";

export default function DestinationImage({
  src,
  alt = "Destination in South India",
  aspectRatio = "aspect-[16/10]",
  className = "",
  imgClassName = "",
  showBadge = false,
  badgeText = "",
  badgeIcon = "",
}) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(!src);

  return (
    <div
      className={`relative overflow-hidden bg-slate-200 dark:bg-[#152436] ${aspectRatio} ${className}`}
    >
      {/* Loading Skeleton */}
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 dark:from-[#152436] dark:via-[#1E2E42] dark:to-[#152436] animate-pulse" />
      )}

      {/* Clean Fallback if image unavailable / error */}
      {hasError ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center bg-gradient-to-br from-slate-100 to-slate-200 dark:from-[#0E1A29] dark:to-[#152436] text-slate-500 dark:text-slate-400">
          <svg className="w-8 h-8 mb-1 text-slate-400 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
          </svg>
          <span className="text-xs font-heading font-semibold text-charcoal dark:text-white line-clamp-1">
            {alt}
          </span>
          <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
            Verified Destination
          </span>
        </div>
      ) : (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          onLoad={() => setIsLoaded(true)}
          onError={() => setHasError(true)}
          className={`w-full h-full object-cover transition-all duration-500 ease-out ${
            isLoaded ? "opacity-100 scale-100" : "opacity-0 scale-105"
          } ${imgClassName}`}
        />
      )}

      {/* Optional Top Overlay Badge */}
      {showBadge && badgeText && (
        <div className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full bg-black/50 backdrop-blur-md border border-white/20 text-white font-medium text-[11px] shadow-sm z-10 flex items-center gap-1">
          {badgeIcon && <span>{badgeIcon}</span>}
          <span>{badgeText}</span>
        </div>
      )}
    </div>
  );
}
