/**
 * Helper functions for cookie management
 */

// Get all cookies as an object
export function getAllCookies(): Record<string, string> {
  if (typeof document === "undefined") return {};

  const cookies: Record<string, string> = {};
  const cookieString = document.cookie;

  if (cookieString === "") return cookies;

  const cookiePairs = cookieString.split(";");

  for (const cookiePair of cookiePairs) {
    const [name, value] = cookiePair.split("=").map((part) => part.trim());
    if (name && value) {
      cookies[decodeURIComponent(name)] = decodeURIComponent(value);
    }
  }

  return cookies;
}

// Set a cookie with options
export function setCookie(
  name: string,
  value: string,
  options: {
    expires?: Date | number;
    path?: string;
    domain?: string;
    secure?: boolean;
    sameSite?: "strict" | "lax" | "none";
  } = {}
): void {
  if (typeof document === "undefined") return;

  const { expires, path, domain, secure, sameSite } = options;

  let cookieString = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;

  if (expires) {
    if (typeof expires === "number") {
      const days = expires;
      const date = new Date();
      date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
      cookieString += `; expires=${date.toUTCString()}`;
    } else {
      cookieString += `; expires=${expires.toUTCString()}`;
    }
  }

  if (path) cookieString += `; path=${path}`;
  if (domain) cookieString += `; domain=${domain}`;
  if (secure) cookieString += "; secure";
  if (sameSite) cookieString += `; samesite=${sameSite}`;

  document.cookie = cookieString;
}

// Get a cookie by name
export function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;

  const cookies = getAllCookies();
  return cookies[name] || null;
}

// Delete a cookie
export function deleteCookie(
  name: string,
  options: { path?: string; domain?: string } = {}
): void {
  if (typeof document === "undefined") return;

  // Set expiration to a past date to delete
  setCookie(name, "", {
    ...options,
    expires: new Date(0),
  });
}

// Check if a specific cookie exists
export function hasCookie(name: string): boolean {
  return getCookie(name) !== null;
}

// Create a uniquely identifiable signature for consent tracking
export function generateConsentSignature(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);

  return `${timestamp}-${random}`;
}

// Get cookie domain for current site (handles subdomains)
export function getCurrentCookieDomain(): string {
  if (typeof window === "undefined") return "";

  const hostname = window.location.hostname;

  // For localhost or IP address, return as is
  if (hostname === "localhost" || /^(\d{1,3}\.){3}\d{1,3}$/.test(hostname)) {
    return hostname;
  }

  // Get the root domain (example.com from sub.example.com)
  const parts = hostname.split(".");
  if (parts.length <= 2) return hostname;

  // Handle special TLDs like .co.uk, .com.au
  const specialTLDs = ["co.uk", "com.au", "co.nz", "org.uk", "me.uk"];
  const lastTwoParts = parts.slice(-2).join(".");

  if (specialTLDs.includes(lastTwoParts)) {
    // For domain.co.uk, return domain.co.uk
    return parts.slice(-3).join(".");
  }

  // For sub.example.com, return example.com
  return parts.slice(-2).join(".");
}
