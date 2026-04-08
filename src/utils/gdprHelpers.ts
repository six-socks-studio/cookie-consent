/**
 * Helper functions for GDPR compliance
 */

import { ConsentRecord, ConsentState } from "../types";

// Anonymize IP address (remove last octet for IPv4, last 80 bits for IPv6)
export function anonymizeIp(ipAddress: string): string {
  if (!ipAddress) return "";

  // IPv4
  if (/^(\d{1,3}\.){3}\d{1,3}$/.test(ipAddress)) {
    return ipAddress.split(".").slice(0, 3).join(".") + ".0";
  }

  // IPv6
  if (ipAddress.includes(":")) {
    // Simple approach - keep first 48 bits (first 3 hextets)
    return ipAddress.split(":").slice(0, 3).join(":") + ":0000:0000:0000:0000";
  }

  return ipAddress;
}

// Check if user has Do Not Track enabled
export function isDoNotTrackEnabled(): boolean {
  if (typeof navigator === "undefined") return false;

  // Check various browser implementations with proper type checking
  if (
    navigator.doNotTrack === "1" ||
    navigator.doNotTrack === "yes" ||
    // Use optional chaining for non-standard properties
    (navigator as any)?.msDoNotTrack === "1" ||
    // Check window.doNotTrack safely
    (typeof window !== "undefined" &&
      "doNotTrack" in window &&
      (window as any).doNotTrack === "1")
  ) {
    return true;
  }

  return false;
}

// Check if user is in the EU based on timezone
// This is a basic heuristic and should be replaced with proper IP geolocation
export function isLikelyInEU(): boolean {
  if (typeof Intl === "undefined" || !Intl.DateTimeFormat) return false;

  try {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    // List of timezones mostly in EU
    const euTimezones = [
      "Europe/Vienna",
      "Europe/Brussels",
      "Europe/Sofia",
      "Europe/Zagreb",
      "Europe/Nicosia",
      "Europe/Prague",
      "Europe/Copenhagen",
      "Europe/Tallinn",
      "Europe/Helsinki",
      "Europe/Paris",
      "Europe/Berlin",
      "Europe/Athens",
      "Europe/Budapest",
      "Europe/Dublin",
      "Europe/Rome",
      "Europe/Riga",
      "Europe/Vilnius",
      "Europe/Luxembourg",
      "Europe/Malta",
      "Europe/Amsterdam",
      "Europe/Warsaw",
      "Europe/Lisbon",
      "Europe/Bucharest",
      "Europe/Belgrade",
      "Europe/Bratislava",
      "Europe/Ljubljana",
      "Europe/Madrid",
      "Europe/Stockholm",
      "Europe/London",
      "Europe/Isle_of_Man",
      "Europe/Jersey",
      "Europe/Guernsey",
    ];

    return euTimezones.includes(timezone);
  } catch (e) {
    return false;
  }
}

// Check if given consent is newer than x days
export function isConsentRecent(
  consent: ConsentState,
  maxDays: number
): boolean {
  if (!consent.timestamp) return false;

  const now = Date.now();
  const consentAge = now - consent.timestamp;
  const maxAge = maxDays * 24 * 60 * 60 * 1000;

  return consentAge <= maxAge;
}

// Format consent record for storage/API
export function formatConsentRecord(
  consent: ConsentState,
  method: "accept_all" | "accept_selected" | "reject_all" | "save_preferences"
): ConsentRecord {
  return {
    timestamp: Date.now(),
    uuid: consent.uuid || "",
    consented: {
      necessary: consent.necessary,
      functional: consent.functional,
      analytics: consent.analytics,
      advertising: consent.advertising,
      uncategorized: consent.uncategorized,
    },
    explicitConsent: true,
    doNotTrackHonored: isDoNotTrackEnabled(),
    method,
  };
}

// Get browser language for auto-translation
export function getBrowserLanguage(): string {
  if (typeof navigator === "undefined") return "en";

  return (
    navigator.language ||
    // @ts-ignore - handle older browsers
    navigator.userLanguage ||
    "en"
  ).split("-")[0];
}

// Check if user is from a country requiring consent (EU, UK, etc.)
export function isFromRegionRequiringConsent(
  euCountryCodes: string[] = []
): boolean {
  const isEU = isLikelyInEU();

  // Try to get country from language
  let countryFromLanguage = "";

  if (typeof navigator !== "undefined" && navigator.language) {
    const parts = navigator.language.split("-");
    if (parts.length > 1) {
      countryFromLanguage = parts[1].toUpperCase();
    }
  }

  // If we have a country code and it's in the EU list
  if (countryFromLanguage && euCountryCodes.includes(countryFromLanguage)) {
    return true;
  }

  return isEU;
}
