import { ConsentState, ConsentCategory } from "../types";

interface Script {
  src?: string;
  content?: string;
  type?: string;
  category: ConsentCategory;
  original: HTMLScriptElement;
  replacement?: HTMLScriptElement;
  loaded: boolean;
}

class CookieBlocker {
  private readonly scripts: Script[] = [];
  private consentCookieName: string = "gdpr_consent";
  private readonly categoryMap: Record<string, ConsentCategory> = {
    "google-analytics": "analytics",
    gtag: "analytics",
    facebook: "advertising",
    fbevents: "advertising",
    hotjar: "analytics",
    amplitude: "analytics",
    pinterest: "advertising",
    twitter: "advertising",
    linkedin: "advertising",
    segment: "analytics",
  };

  constructor() {
    // Observe DOM changes to catch dynamically added scripts
    if (
      typeof window !== "undefined" &&
      typeof MutationObserver !== "undefined"
    ) {
      const observer = new MutationObserver(this.handleDomMutations.bind(this));
      observer.observe(document.documentElement, {
        childList: true,
        subtree: true,
      });
    }
  }

  // Initialize by scanning and categorizing all scripts
  init(): void {
    if (typeof document === "undefined") return;

    // Get all script elements on the page
    const scriptElements = document.querySelectorAll("script");

    scriptElements.forEach((script) => {
      const category = this.categorizeScript(script);

      // Only track non-necessary scripts
      if (category !== "necessary") {
        this.scripts.push({
          src: script.src,
          content: script.innerHTML,
          type: script.type,
          category,
          original: script,
          loaded: true, // Assume already loaded for scripts present at init
        });
      }
    });
  }

  // Set the consent cookie name so we know which cookie to preserve
  setConsentCookieName(name: string): void {
    this.consentCookieName = name;
  }

  // Block scripts based on consent state
  applyConsent(consent: ConsentState): void {
    // Loop through all tracked scripts
    this.scripts.forEach((script) => {
      const hasConsent = consent[script.category];

      if (!hasConsent && script.loaded) {
        // Block the script by disabling it
        this.blockScript(script);
      } else if (hasConsent && !script.loaded) {
        // Unblock the script by re-enabling it
        this.unblockScript(script);
      }
    });

    // Update local storage and cookies based on consent
    this.updateStorageAccess(consent);
  }

  // Block a script by removing it from DOM
  private blockScript(script: Script): void {
    try {
      // Remove the original script
      if (script.original && script.original.parentNode) {
        script.original.parentNode.removeChild(script.original);
      }

      // Create a disabled version
      const replacement = document.createElement("script");
      replacement.type = "text/plain"; // This prevents execution

      if (script.src) replacement.setAttribute("data-blocked-src", script.src);
      if (script.content) replacement.textContent = script.content;
      replacement.setAttribute("data-consent-category", script.category);

      script.replacement = replacement;
      script.loaded = false;

      // Add the disabled version
      document.head.appendChild(replacement);
    } catch (e) {
      console.error("Failed to block script", e);
    }
  }

  // Unblock a script by re-enabling it
  private unblockScript(script: Script): void {
    try {
      // Remove the disabled version
      if (script.replacement && script.replacement.parentNode) {
        script.replacement.parentNode.removeChild(script.replacement);
      }

      // Create an enabled version
      const newScript = document.createElement("script");
      newScript.type = script.type || "text/javascript";

      if (script.src) newScript.src = script.src;
      if (script.content) newScript.textContent = script.content;

      script.original = newScript;
      script.loaded = true;

      // Add the enabled version
      document.head.appendChild(newScript);
    } catch (e) {
      console.error("Failed to unblock script", e);
    }
  }

  // Update localStorage and cookie access based on consent
  private updateStorageAccess(consent: ConsentState): void {
    // No way to truly block cookies in JS, but we can clear them if no consent
    if (!consent.functional && !consent.analytics && !consent.advertising) {
      this.clearNonEssentialCookies();
    }

    // For localStorage, we can override methods if needed
    // This is complex and not always reliable, consider middleware solutions instead
  }

  // Clear all non-essential cookies
  private clearNonEssentialCookies(): void {
    const cookies = document.cookie.split(";");
    const encodedConsentName = encodeURIComponent(this.consentCookieName);

    cookies.forEach((cookie) => {
      const name = cookie.split("=")[0].trim();

      // Skip the consent cookie (check both raw and encoded names)
      if (
        name === this.consentCookieName ||
        name === encodedConsentName
      ) {
        return;
      }

      // Delete cookie
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/;`;

      // Try with domain
      const domain = window.location.hostname;
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=${domain};`;
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=.${domain};`;
    });
  }

  // Categorize scripts based on source or content
  private categorizeScript(script: HTMLScriptElement): ConsentCategory {
    // Default to necessary unless we identify otherwise
    let category: ConsentCategory = "necessary";

    // Check src attribute first
    if (script.src) {
      const src = script.src.toLowerCase();

      // Check for known patterns in src
      for (const keyword in this.categoryMap) {
        if (src.includes(keyword)) {
          return this.categoryMap[keyword];
        }
      }
    }

    // If no src, check inline content
    if (script.textContent) {
      const content = script.textContent.toLowerCase();

      // Check for known patterns in content
      for (const keyword in this.categoryMap) {
        if (content.includes(keyword)) {
          return this.categoryMap[keyword];
        }
      }

      // Additional checks for specific patterns
      if (
        content.includes("function gtag()") ||
        content.includes("googletagmanager")
      ) {
        return "analytics";
      }

      if (content.includes("fbq(") || content.includes("facebook-pixel")) {
        return "advertising";
      }
    }

    // Check data attributes
    if (script.dataset.consentCategory) {
      const declared = script.dataset.consentCategory as ConsentCategory;
      if (
        [
          "necessary",
          "functional",
          "analytics",
          "advertising",
          "uncategorized",
        ].includes(declared)
      ) {
        return declared;
      }
    }

    return category;
  }

  // Handle DOM mutations to catch dynamic script additions
  private handleDomMutations(mutations: MutationRecord[]): void {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeName === "SCRIPT") {
          const script = node as HTMLScriptElement;
          const category = this.categorizeScript(script);

          // Skip necessary scripts
          if (category === "necessary") return;

          // Add to tracked scripts
          this.scripts.push({
            src: script.src,
            content: script.innerHTML,
            type: script.type,
            category,
            original: script,
            loaded: true,
          });

          // Check if we need to block it
          const consentCookie = document.cookie
            .split(";")
            .find((c) => c.trim().startsWith("gdpr_consent="));

          if (consentCookie) {
            try {
              const consent = JSON.parse(
                decodeURIComponent(consentCookie.split("=")[1])
              );
              if (!consent[category]) {
                // Remove it and add as disabled
                if (script.parentNode) {
                  script.parentNode.removeChild(script);
                  const replacement = document.createElement("script");
                  replacement.type = "text/plain";
                  if (script.src)
                    replacement.setAttribute("data-blocked-src", script.src);
                  if (script.innerHTML)
                    replacement.textContent = script.innerHTML;
                  replacement.setAttribute("data-consent-category", category);
                  document.head.appendChild(replacement);
                }
              }
            } catch (e) {
              console.error("Failed to parse consent cookie", e);
            }
          }
        }
      });
    });
  }

  // Add custom script categorization rules
  addCategoryRule(pattern: string, category: ConsentCategory): void {
    this.categoryMap[pattern.toLowerCase()] = category;
  }
}

export default CookieBlocker;
