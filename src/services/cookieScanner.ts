import { Cookie, ConsentCategory } from "../types";

class CookieScanner {
  // Database of known cookies and their categories
  private knownCookies: Record<string, Partial<Cookie>> = {
    _ga: {
      category: "analytics",
      provider: "Google Analytics",
      description: "Used to distinguish users.",
    },
    _gid: {
      category: "analytics",
      provider: "Google Analytics",
      description: "Used to distinguish users.",
    },
    _fbp: {
      category: "advertising",
      provider: "Facebook",
      description: "Used by Facebook for advertising purposes.",
    },
    _hjid: {
      category: "analytics",
      provider: "Hotjar",
      description: "Sets a unique ID for the session.",
    },
    PHPSESSID: {
      category: "necessary",
      provider: "Website",
      description: "Preserves user session state across page requests.",
    },
    CONSENT: {
      category: "necessary",
      provider: "Google",
      description:
        "Used to detect if the visitor has accepted the marketing category in the cookie banner.",
    },
    __cfduid: {
      category: "necessary",
      provider: "Cloudflare",
      description:
        "Used by the content network, Cloudflare, to identify trusted web traffic.",
    },
    // Add more known cookies here
  };

  // Get all cookies currently set in the browser
  scanCookies(): Cookie[] {
    if (typeof document === "undefined") return [];

    const cookies: Cookie[] = [];
    const cookieStrings = document.cookie.split(";");

    cookieStrings.forEach((cookieStr) => {
      const parts = cookieStr.trim().split("=");
      if (parts.length >= 1) {
        const name = parts[0].trim();
        const value = parts.slice(1).join("=").trim();

        cookies.push(
          this.categorize({
            name,
            value,
            domain: this.getCookieDomain(),
            path: "/",
            category: "uncategorized",
          })
        );
      }
    });

    return cookies;
  }

  // Categorize a cookie based on known patterns or names
  categorize(cookie: Cookie): Cookie {
    // Check if it's a known cookie
    const knownCookie = this.knownCookies[cookie.name];
    if (knownCookie) {
      return { ...cookie, ...knownCookie };
    }

    // Apply heuristics for categorization
    if (
      cookie.name.startsWith("_ga") ||
      cookie.name.startsWith("_gid") ||
      cookie.name.includes("analytics")
    ) {
      return {
        ...cookie,
        category: "analytics",
        provider: "Analytics Service",
      };
    }

    if (
      cookie.name.includes("ad") ||
      cookie.name.includes("fb") ||
      cookie.name.includes("pixel")
    ) {
      return {
        ...cookie,
        category: "advertising",
        provider: "Advertising Service",
      };
    }

    if (
      cookie.name.includes("sess") ||
      cookie.name.includes("csrf") ||
      cookie.name.includes("token")
    ) {
      return { ...cookie, category: "necessary", provider: "Website" };
    }

    if (
      cookie.name.includes("pref") ||
      cookie.name.includes("theme") ||
      cookie.name.includes("lang")
    ) {
      return { ...cookie, category: "functional", provider: "Website" };
    }

    // Default to uncategorized
    return { ...cookie, category: "uncategorized" };
  }

  // Get the domain used for setting cookies
  private getCookieDomain(): string {
    if (typeof window === "undefined") return "";

    const hostname = window.location.hostname;

    // If localhost or IP address, return as is
    if (
      hostname === "localhost" ||
      /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(hostname)
    ) {
      return hostname;
    }

    // Get the top two levels of the domain
    const parts = hostname.split(".");
    if (parts.length > 2) {
      // Handle special cases like co.uk
      if (
        parts[parts.length - 2] === "co" ||
        parts[parts.length - 2] === "com"
      ) {
        return `.${parts[parts.length - 3]}.${parts[parts.length - 2]}.${
          parts[parts.length - 1]
        }`;
      }
      return `.${parts[parts.length - 2]}.${parts[parts.length - 1]}`;
    }

    return `.${hostname}`;
  }

  // Add a custom cookie to the known database
  addKnownCookie(
    name: string,
    category: ConsentCategory,
    provider?: string,
    description?: string
  ): void {
    this.knownCookies[name] = { category, provider, description };
  }

  // Bulk import cookie definitions
  importCookieDefinitions(definitions: Record<string, Partial<Cookie>>): void {
    this.knownCookies = { ...this.knownCookies, ...definitions };
  }
}

export default CookieScanner;
