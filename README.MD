# GDPR-Compliant Cookie Solution

A comprehensive self-hosted solution for managing cookies and ensuring GDPR compliance in your web applications.

## Features

- 🍪 **Complete Cookie Management**: Control cookies across your entire site
- 🛡️ **GDPR, CCPA, and ePrivacy Compliant**: Meets all major privacy regulations
- 🔍 **Cookie Scanner**: Automatically detects and categorizes cookies
- 🚫 **Script Blocker**: Prevents tracking scripts from loading until consent is given
- 🌐 **Multi-language Support**: Easily translate to any language
- 🎨 **Fully Customizable UI**: Match your brand and design system
- 📊 **Consent Logging**: Record consent for compliance requirements
- 📱 **Responsive Design**: Works on all devices
- ⚡ **Lightweight**: Under 20KB gzipped
- 🔄 **React & Next.js**: Designed for React and Next.js applications

## Installation

```bash
npm install @six-socks-studio/cookie-consent
# or
yarn add @six-socks-studio/cookie-consent
# or
pnpm add @six-socks-studio/cookie-consent
```

## Quick Start

```jsx
import React from "react";
import { CookieConsent, DEFAULT_CONFIG } from "@six-socks-studio/cookie-consent";

function App() {
  return (
    <div className="App">
      {/* Your app content */}

      <CookieConsent config={DEFAULT_CONFIG} />
    </div>
  );
}

export default App;
```

## Configuration

The solution is highly configurable. Here's an example configuration:

```jsx
const config = {
  storageMethod: "cookie", // 'cookie' or 'localStorage'
  cookieName: "gdpr_consent",
  cookieExpiry: 365, // Days
  privacyPolicyUrl: "/privacy-policy",
  companyName: "Your Company Name",
  contactEmail: "privacy@yourcompany.com",
  blockedContentMessage: "Please accept cookies to view this content",
  autoBlockCookies: true,
  regionBased: true, // Only show banner for users in regions requiring consent
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
    "DE" /* ... */,
  ],
  consentExpiryDays: 365,
  defaultConsent: {
    necessary: true, // Always true
    functional: false,
    analytics: false,
    advertising: false,
    uncategorized: false,
  },
  logConsent: true, // Keep records of consent
  bannerConfig: {
    position: "bottom", // 'top', 'bottom', 'top-left', 'top-right', 'bottom-left', 'bottom-right'
    layout: "bar", // 'bar', 'box', 'floating'
    rejectButtonEnabled: true,
    settingsButtonEnabled: true,
    acceptAllButtonLabel: "Accept All",
    rejectAllButtonLabel: "Reject All",
    settingsButtonLabel: "Preferences",
    bannerHeading: "We Value Your Privacy",
    bannerDescription:
      "This website uses cookies to ensure you get the best experience on our website.",
    showPoweredBy: true,
  },
  customStyles: {
    bannerBackgroundColor: "#ffffff",
    bannerTextColor: "#333333",
    primaryButtonColor: "#0070f3",
    primaryButtonTextColor: "#ffffff",
    secondaryButtonColor: "transparent",
    secondaryButtonTextColor: "#0070f3",
    switchActiveColor: "#0070f3",
    linkColor: "#0070f3",
    borderRadius: "8px",
    fontFamily: "inherit",
    darkMode: false,
  },
  language: "en", // Default language
  translations: {
    en: {
      // English translations
      consentTitle: "Cookie Consent",
      // ... more translations
    },
    fr: {
      // French translations
      consentTitle: "Consentement des cookies",
      // ... more translations
    },
    // Add more languages as needed
  },
};
```

## Components

### CookieConsent

The main banner component that appears when a user visits your site.

```jsx
import { CookieConsent } from "@six-socks-studio/cookie-consent";

<CookieConsent
  config={config}
  onConsent={(accepted) => console.log("Consent given:", accepted)}
/>;
```

### ConsentModal

A detailed modal that allows users to customize their cookie preferences.

```jsx
import { ConsentModal } from "@six-socks-studio/cookie-consent";

function MyComponent() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button onClick={() => setIsOpen(true)}>Cookie Settings</button>

      <ConsentModal
        config={config}
        open={isOpen}
        onClose={() => setIsOpen(false)}
        onSave={(consent) => console.log("Saved preferences:", consent)}
      />
    </>
  );
}
```

### BlockedContent

A component that only shows its children if the user has consented to the specified category.

```jsx
import { BlockedContent } from "@six-socks-studio/cookie-consent";

<BlockedContent
  category="analytics"
  config={config}
  fallback={<p>Please accept analytics cookies to view this content</p>}
  onAccept={() => console.log("Analytics accepted")}
>
  {/* Analytics script or component that should only load with consent */}
  <script src="https://www.google-analytics.com/analytics.js" />
</BlockedContent>;
```

## Hooks

### useConsent

A hook for accessing and managing consent state.

```jsx
import { useConsent } from "@six-socks-studio/cookie-consent";

function CookieManager() {
  const {
    consent, // Current consent state
    bannerVisible, // Is the banner visible
    modalVisible, // Is the modal visible
    loading, // Is consent loading
    acceptAll, // Function to accept all cookies
    rejectAll, // Function to reject all optional cookies
    setSpecificConsent, // Function to set specific consent options
    showPreferences, // Function to show the preferences modal
    closePreferences, // Function to close the preferences modal
    resetConsent, // Function to reset consent (for testing)
  } = useConsent(config);

  // Use these values and functions to build custom UIs
}
```

### useCookieScanner

A hook for scanning and categorizing cookies.

```jsx
import { useCookieScanner } from "@six-socks-studio/cookie-consent";

function CookieScanner() {
  const {
    cookies, // All detected cookies
    loading, // Is scanner loading
    getCookiesByCategory, // Function to filter cookies by category
    addCustomCookie, // Function to add a custom cookie definition
    rescan, // Function to trigger a new scan
  } = useCookieScanner();

  // Display or manage detected cookies
}
```

## Headless Mode

If you need full control over the UI, use the `CookieConsentProvider` and `useCookieConsent` hook. This gives you all the consent logic without any pre-built UI — build your own cookie banner with your own design system.

### Setup

Wrap your app with the provider:

```jsx
import { CookieConsentProvider } from "@six-socks-studio/cookie-consent";

function App() {
  return (
    <CookieConsentProvider config={config}>
      <YourApp />
    </CookieConsentProvider>
  );
}
```

### Custom Banner

Then use the `useCookieConsent` hook anywhere in the tree:

```jsx
import { useCookieConsent } from "@six-socks-studio/cookie-consent";

function MyCustomBanner() {
  const {
    bannerVisible,
    consent,
    acceptAll,
    rejectAll,
    showPreferences,
    cookies,
    getCookiesByCategory,
  } = useCookieConsent();

  if (!bannerVisible) return null;

  return (
    <div className="my-cookie-banner">
      <p>We use cookies to improve your experience.</p>
      <div className="actions">
        <button onClick={rejectAll}>No thanks</button>
        <button onClick={showPreferences}>Customize</button>
        <button onClick={acceptAll}>Accept all</button>
      </div>
    </div>
  );
}
```

### Custom Preferences Panel

```jsx
function MyPreferencesPanel() {
  const {
    consent,
    modalVisible,
    closePreferences,
    setSpecificConsent,
    cookies,
    getCookiesByCategory,
  } = useCookieConsent();

  if (!modalVisible) return null;

  const toggleCategory = (category: string, value: boolean) => {
    setSpecificConsent({ [category]: value });
  };

  return (
    <dialog open>
      <h2>Cookie Preferences</h2>

      <label>
        <input
          type="checkbox"
          checked={consent?.analytics ?? false}
          onChange={(e) => toggleCategory("analytics", e.target.checked)}
        />
        Analytics ({getCookiesByCategory("analytics").length} cookies)
      </label>

      <label>
        <input
          type="checkbox"
          checked={consent?.advertising ?? false}
          onChange={(e) => toggleCategory("advertising", e.target.checked)}
        />
        Advertising ({getCookiesByCategory("advertising").length} cookies)
      </label>

      <button onClick={closePreferences}>Save & Close</button>
    </dialog>
  );
}
```

### Conditional Rendering Based on Consent

```jsx
function AnalyticsWidget() {
  const { consent } = useCookieConsent();

  if (!consent?.analytics) {
    return <p>Enable analytics cookies to see this widget.</p>;
  }

  return <MyAnalyticsDashboard />;
}
```

## Advanced Usage

### Manual Services Configuration

For more advanced usage, you can directly use the services:

```jsx
import {
  CookieScanner,
  CookieBlocker,
  ConsentStorage,
} from "@six-socks-studio/cookie-consent";

// Create service instances
const scanner = new CookieScanner();
const blocker = new CookieBlocker();
const storage = new ConsentStorage(config);

// Add custom cookie definitions
scanner.addKnownCookie("_myCustomCookie", "functional", "My Service");

// Add custom blocking rules
blocker.addCategoryRule("uservoice", "functional");

// Initialize the blocker
blocker.init();

// Get existing consent
const savedConsent = storage.getConsent();

// Check if consent is expired
if (savedConsent && !storage.isConsentExpired(savedConsent)) {
  // Apply consent to blocker
  blocker.applyConsent(savedConsent);
}
```

### Server-Side Logic (Next.js Example)

```jsx
// middleware.ts
import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const response = NextResponse.next();

  // Get consent from cookies
  const consentCookie = req.cookies.get("gdpr_consent");
  let consent = null;

  if (consentCookie) {
    try {
      consent = JSON.parse(consentCookie.value);
    } catch (e) {
      // Invalid consent, do nothing
    }
  }

  // Modify response based on consent
  if (!consent || !consent.analytics) {
    // No analytics consent, disable caching for personalized content
    response.headers.set(
      "Cache-Control",
      "no-store, max-age=0, must-revalidate"
    );
  }

  return response;
}
```

## Browser Support

This solution works on all modern browsers:

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Opera (latest)
- Internet Explorer 11 (with polyfills)

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Support

If you need help with this library, please open an issue on GitHub.

---

Built with privacy in mind. Happy coding!
