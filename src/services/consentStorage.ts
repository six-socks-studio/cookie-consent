import { ConsentState, ConsentRecord, ConsentConfig } from "../types";

class ConsentStorage {
  private readonly config: ConsentConfig;
  private readonly consentRecords: ConsentRecord[] = [];

  constructor(config: ConsentConfig) {
    this.config = config;
  }

  // Save consent to storage (cookie or localStorage)
  saveConsent(consent: ConsentState): void {
    const consentData = JSON.stringify(consent);

    if (this.config.storageMethod === "cookie") {
      this.setCookie(
        this.config.cookieName,
        consentData,
        this.config.consentExpiryDays,
        this.config.cookieDomain
      );
    } else {
      try {
        localStorage.setItem(this.config.cookieName, consentData);
      } catch (e) {
        console.error("Failed to save consent to localStorage", e);
        // Fallback to cookie if localStorage fails
        this.setCookie(
          this.config.cookieName,
          consentData,
          this.config.consentExpiryDays,
          this.config.cookieDomain
        );
      }
    }

    // Log consent for compliance if enabled
    if (this.config.logConsent) {
      this.logConsentRecord(consent);
    }
  }

  // Retrieve consent from storage
  getConsent(): ConsentState | null {
    let consentData: string | null = null;

    if (this.config.storageMethod === "cookie") {
      consentData = this.getCookie(this.config.cookieName);
    } else {
      try {
        consentData = localStorage.getItem(this.config.cookieName);
      } catch (e) {
        // Fallback to cookie if localStorage fails
        consentData = this.getCookie(this.config.cookieName);
      }
    }

    if (!consentData) return null;

    try {
      return JSON.parse(consentData);
    } catch (e) {
      console.error("Failed to parse consent data", e);
      return null;
    }
  }

  // Clear consent from storage
  clearConsent(): void {
    if (this.config.storageMethod === "cookie") {
      this.deleteCookie(this.config.cookieName);
    } else {
      try {
        localStorage.removeItem(this.config.cookieName);
      } catch (e) {
        // Fallback to cookie if localStorage fails
        this.deleteCookie(this.config.cookieName);
      }
    }
  }

  // Export consent records (for GDPR compliance)
  exportConsentRecords(): ConsentRecord[] {
    return [...this.consentRecords];
  }

  // Check if consent is expired
  isConsentExpired(consent: ConsentState): boolean {
    const now = Date.now();
    const expiryTime =
      consent.timestamp + this.config.consentExpiryDays * 24 * 60 * 60 * 1000;
    return now > expiryTime;
  }

  // Create a unique identifier for consent tracking
  private generateConsentUuid(): string {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === "x" ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  // Log consent for compliance
  private logConsentRecord(consent: ConsentState): void {
    const uuid = consent.uuid || this.generateConsentUuid();

    const record: ConsentRecord = {
      timestamp: Date.now(),
      uuid,
      userAgent:
        typeof navigator !== "undefined" ? navigator.userAgent : undefined,
      consented: {
        necessary: consent.necessary,
        functional: consent.functional,
        analytics: consent.analytics,
        advertising: consent.advertising,
        uncategorized: consent.uncategorized,
      },
      explicitConsent: true, // This would depend on how consent was gathered
      method: "save_preferences", // This would be passed in based on user action
    };

    this.consentRecords.push(record);

    // In a real implementation, you might want to:
    // 1. Send this to your backend API
    // 2. Store in IndexedDB for local persistence
    // 3. Provide export functionality for compliance
  }

  // Helper methods for cookie manipulation
  private setCookie(
    name: string,
    value: string,
    expiryDays: number,
    domain?: string
  ): void {
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + expiryDays);

    let cookieString = `${encodeURIComponent(name)}=${encodeURIComponent(
      value
    )}; expires=${expiryDate.toUTCString()}; path=/; SameSite=Lax`;

    if (domain) {
      cookieString += `; domain=${domain}`;
    }

    // Add secure flag if on HTTPS
    if (
      typeof window !== "undefined" &&
      window.location.protocol === "https:"
    ) {
      cookieString += "; Secure";
    }

    document.cookie = cookieString;
  }

  private getCookie(name: string): string | null {
    if (typeof document === "undefined") return null;

    const nameEQ = encodeURIComponent(name) + "=";
    const ca = document.cookie.split(";");

    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === " ") c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) {
        return decodeURIComponent(c.substring(nameEQ.length, c.length));
      }
    }

    return null;
  }

  private deleteCookie(name: string): void {
    document.cookie = `${encodeURIComponent(
      name
    )}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; SameSite=Lax`;

    // Also try with domain if set
    if (this.config.cookieDomain) {
      document.cookie = `${encodeURIComponent(
        name
      )}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=${
        this.config.cookieDomain
      }; SameSite=Lax`;
    }
  }
}

export default ConsentStorage;
