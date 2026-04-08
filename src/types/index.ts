export type ConsentCategory =
  | "necessary"
  | "functional"
  | "analytics"
  | "advertising"
  | "uncategorized";

export interface Cookie {
  name: string;
  domain: string;
  path: string;
  value?: string;
  expiryDate?: Date;
  category: ConsentCategory;
  description?: string;
  provider?: string;
}

export interface ConsentState {
  necessary: boolean; // Always true, cannot be disabled
  functional: boolean;
  analytics: boolean;
  advertising: boolean;
  uncategorized: boolean;
  timestamp: number;
  updated?: number;
  uuid?: string; // For consent proof
}

export interface ConsentConfig {
  storageMethod: "cookie" | "localStorage";
  cookieName: string;
  cookieExpiry: number; // Days
  privacyPolicyUrl: string;
  companyName: string;
  contactEmail?: string;
  blockedContentMessage?: string;
  autoBlockCookies: boolean;
  regionBased: boolean;
  requireConsentInEU: boolean;
  euCountryCodes?: string[];
  consentExpiryDays: number;
  defaultConsent: Partial<ConsentState>;
  cookieDomain?: string;
  logConsent: boolean;
  bannerConfig: BannerConfig;
  language?: string;
  translations?: Record<string, Translation>;
  customStyles?: CustomStyles;
}

export interface BannerConfig {
  position:
    | "top"
    | "bottom"
    | "top-left"
    | "top-right"
    | "bottom-left"
    | "bottom-right";
  layout: "box" | "bar" | "floating";
  rejectButtonEnabled: boolean;
  settingsButtonEnabled: boolean;
  acceptAllButtonLabel?: string;
  rejectAllButtonLabel?: string;
  settingsButtonLabel?: string;
  bannerHeading?: string;
  bannerDescription?: string;
  showPoweredBy: boolean;
}

export interface Translation {
  consentTitle: string;
  consentDescription: string;
  acceptButton: string;
  rejectButton: string;
  settingsButton: string;
  closeButton: string;
  necessary: {
    title: string;
    description: string;
  };
  functional: {
    title: string;
    description: string;
  };
  analytics: {
    title: string;
    description: string;
  };
  advertising: {
    title: string;
    description: string;
  };
  uncategorized: {
    title: string;
    description: string;
  };
  blockedContent: string;
  privacyPolicy: string;
  poweredBy?: string;
}

export interface CustomStyles {
  fontFamily?: string;
  bannerBackgroundColor?: string;
  bannerTextColor?: string;
  primaryButtonColor?: string;
  primaryButtonTextColor?: string;
  secondaryButtonColor?: string;
  secondaryButtonTextColor?: string;
  switchActiveColor?: string;
  linkColor?: string;
  borderRadius?: string;
  darkMode?: boolean;
}

export interface GDPROptions {
  storeConsent: boolean;
  consentLogging: boolean;
  explicitAction: boolean; // Require explicit consent, no implied consent
  respectDoNotTrack: boolean;
  enableTcf?: boolean; // Support IAB Transparency & Consent Framework
  tcfVendorIds?: number[]; // IAB TCF vendor IDs
}

export interface ConsentRecord {
  timestamp: number;
  uuid: string;
  ipAddress?: string; // Anonymized
  userAgent?: string;
  consented: Partial<ConsentState>;
  explicitConsent: boolean;
  doNotTrackHonored?: boolean;
  method: "accept_all" | "accept_selected" | "reject_all" | "save_preferences";
}
