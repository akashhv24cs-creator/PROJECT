/**
 * App Download & Store Configuration
 * 
 * Centralized static configuration for official Zenera Trips mobile applications.
 * Note: These URLs are static and trusted.
 */

import { LINKS } from "../../index.js";

export const APP_DOWNLOAD_CONFIG = {
  appName: "Zenera Trips",
  tagline: "Chalo Kahi Bhi.",
  
  // Official Google Play Store listing URL
  // Fallback to configured LINKS.playStore or official Play Store listing
  playStoreUrl: LINKS?.playStore || "https://play.google.com/store",
  
  // Official Apple App Store listing URL (null if not yet published)
  appStoreUrl: LINKS?.appStore || null,
  
  // Universal Popup Copy
  heading: "Travel Better with Zenera Trips",
  description:
    "Get the complete Zenera Trips experience with our mobile app. Book trips faster, manage your bookings and keep your travel plans with you wherever you go.",
  
  primaryCta: "Get the App",
  secondaryCta: "Continue on Web",
  
  iosFallbackNote: "Android app available on Google Play",
  
  // Startup delay in milliseconds (300-700ms range for smooth rendering)
  startupDelayMs: 450,
  
  // Session storage key to avoid repeated display in the same browsing session
  sessionStorageKey: "zenera_app_prompt_dismissed_session",
};

export default APP_DOWNLOAD_CONFIG;
