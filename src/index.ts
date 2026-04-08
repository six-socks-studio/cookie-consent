export * from "./types";
export * from "./components";
export * from "./hooks";
export * from "./context/CookieConsentContext";
export * from "./utils/cookieHelpers";
export * from "./utils/gdprHelpers";
export { default as CookieScanner } from "./services/cookieScanner";
export { default as CookieBlocker } from "./services/cookieBlocker";
export { default as ConsentStorage } from "./services/consentStorage";

// Default configuration
export const DEFAULT_CONFIG = {
  storageMethod: "cookie",
  cookieName: "gdpr_consent",
  cookieExpiry: 365, // Days
  privacyPolicyUrl: "/privacy-policy",
  companyName: "Your Company",
  autoBlockCookies: true,
  regionBased: true,
  requireConsentInEU: true,
  euCountryCodes: [
    "AT",
    "BE",
    "BG",
    "HR",
    "CY",
    "CZ",
    "DK",
    "EE",
    "FI",
    "FR",
    "DE",
    "GR",
    "HU",
    "IE",
    "IT",
    "LV",
    "LT",
    "LU",
    "MT",
    "NL",
    "PL",
    "PT",
    "RO",
    "SK",
    "SI",
    "ES",
    "SE",
    "GB",
  ],
  consentExpiryDays: 365,
  defaultConsent: {
    necessary: true,
    functional: false,
    analytics: false,
    advertising: false,
    uncategorized: false,
  },
  logConsent: true,
  bannerConfig: {
    position: "bottom",
    layout: "bar",
    rejectButtonEnabled: true,
    settingsButtonEnabled: true,
    showPoweredBy: true,
  },
  language: "en",
};
