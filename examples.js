// Example 1: Basic Integration in Next.js App Router
// ----------------------------------------------
// File: app/providers.tsx
import React from 'react';
import { CookieConsent, ConsentModal } from '@six-socks-studio/cookie-consent';

const config = {
  storageMethod: 'cookie',
  cookieName: 'gdpr_consent',
  cookieExpiry: 365,
  privacyPolicyUrl: '/privacy-policy',
  companyName: 'Your Company Name',
  contactEmail: 'privacy@yourcompany.com',
  autoBlockCookies: true,
  regionBased: true,
  requireConsentInEU: true,
  consentExpiryDays: 365,
  logConsent: true,
  bannerConfig: {
    position: 'bottom',
    layout: 'bar',
    rejectButtonEnabled: true,
    settingsButtonEnabled: true,
    bannerHeading: 'We Value Your Privacy',
    bannerDescription: 'This website uses cookies to ensure you get the best experience on our website.',
    showPoweredBy: true
  },
  customStyles: {
    bannerBackgroundColor: '#ffffff',
    bannerTextColor: '#333333',
    primaryButtonColor: '#0070f3',
    primaryButtonTextColor: '#ffffff',
    secondaryButtonColor: 'transparent',
    secondaryButtonTextColor: '#0070f3',
    borderRadius: '8px',
  },
  language: 'en'
};

export function Providers({ children }: { children: React.ReactNode }) {
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  return (
    <>
      {children}

      {/* Cookie Banner */}
      <CookieConsent
        config={config}
        onConsent={(accepted) => console.log('Consent:', accepted)}
      />

      {/* Settings Modal */}
      <ConsentModal
        config={config}
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={(consent) => console.log('Saved consent:', consent)}
      />

      {/* You can expose a way to open the modal again, e.g. in your footer */}
      {/* <button onClick={() => setIsModalOpen(true)}>Cookie Settings</button> */}
    </>

  );
}

// Example 2: Blocking Content (Analytics, Ads) until consent
// ----------------------------------------------
// File: app/components/Analytics.tsx
import { BlockedContent } from '@six-socks-studio/cookie-consent';

interface AnalyticsProps {
  config: any; // Use your config type
}

export function Analytics({ config }: AnalyticsProps) {
  return (
    <BlockedContent
      category="analytics"
      config={config}
      onAccept={() => console.log('Analytics accepted')} >
      {/_ Your analytics scripts/components go here _/}
      <script
        dangerouslySetInnerHTML={{
          __html: `
            // Google Analytics code
            (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
            (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
            m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
            })(window,document,'script','https://www.google-analytics.com/analytics.js','ga');
            ga('create', 'UA-XXXXX-Y', 'auto');
            ga('send', 'pageview');
          `
        }}
      />
    </BlockedContent>
  );
}

// Example 3: Using the Hooks API
// ----------------------------------------------
// File: app/components/CookieDashboard.tsx
import { useConsent, useCookieScanner } from '@six-socks-studio/cookie-consent';

export function CookieDashboard({ config }: { config: any }) {
  const {
    consent,
    acceptAll,
    rejectAll,
    setSpecificConsent,
    resetConsent
  } = useConsent(config);

  const {
    cookies,
    getCookiesByCategory,
    rescan
  } = useCookieScanner();

  // Example of how you could build a custom dashboard
  return (
    <div className="cookie-dashboard">
      <h2>Your Cookie Preferences</h2>

      {consent ? (
        <>
          <p>Last updated: {new Date(consent.timestamp).toLocaleString()}</p>

          <h3>Current Preferences</h3>
          <ul>
            <li>Necessary: Always enabled</li>
            <li>Functional: {consent.functional ? 'Enabled' : 'Disabled'}</li>
            <li>Analytics: {consent.analytics ? 'Enabled' : 'Disabled'}</li>
            <li>Advertising: {consent.advertising ? 'Enabled' : 'Disabled'}</li>
          </ul>

          <h3>Cookies Detected ({cookies.length})</h3>
          <button onClick={rescan}>Rescan Cookies</button>

          <h4>Necessary Cookies ({getCookiesByCategory('necessary').length})</h4>
          <ul>
            {getCookiesByCategory('necessary').map((cookie, i) => (
              <li key={i}>{cookie.name} - {cookie.provider || 'Unknown'}</li>
            ))}
          </ul>

          {/* Repeat for other categories */}

          <div className="actions">
            <button onClick={acceptAll}>Accept All</button>
            <button onClick={rejectAll}>Reject All</button>
            <button
              onClick={() => setSpecificConsent({
                functional: true,
                analytics: false,
                advertising: false
              })}
            >
              Set Custom Preferences
            </button>
            <button onClick={resetConsent}>Reset Consent</button>
          </div>
        </>
      ) : (
        <p>No consent has been given yet.</p>
      )}
    </div>

  );
}

// Example 4: Setting up the services manually
// ----------------------------------------------
// This allows for more advanced usage
import { CookieScanner, CookieBlocker, ConsentStorage } from '@six-socks-studio/cookie-consent';

// You can manually initialize and use these services
function initializeCookieServices(config: any) {
  // Create a cookie scanner instance and add custom cookies
  const scanner = new CookieScanner();
  scanner.addKnownCookie('\_myCustomCookie', 'functional', 'My Service', 'Used for storing user preferences');

  // Create a cookie blocker instance and add custom rules
  const blocker = new CookieBlocker();
  blocker.addCategoryRule('uservoice', 'functional');
  blocker.init(); // Initialize the blocker

  // Create a consent storage instance
  const storage = new ConsentStorage(config);

  return { scanner, blocker, storage };
}

// Example 5: Middleware (for Next.js)
// ----------------------------------------------
// File: middleware.ts
import { NextRequest, NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
  const response = NextResponse.next();

  // Get current consent from cookies
  const consentCookie = req.cookies.get('gdpr_consent');
  let consent = null;

  if (consentCookie) {
    try {
      consent = JSON.parse(consentCookie.value);
    } catch (e) {
      // Default to no consent
    }
  }

  // Add Cache-Control header based on consent
  if (!consent || (!consent.analytics && !consent.advertising)) {
    // No analytics/ads consent, disable caching with personalized content
    response.headers.set(
      'Cache-Control',
      'no-store, max-age=0, must-revalidate'
    );
  }

  // For pages with ads/tracking, check consent and redirect if needed
  if (req.nextUrl.pathname.startsWith('/content-with-ads') && (!consent || !consent.advertising)) {
    return NextResponse.redirect(new URL('/consent-required', req.url));
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};

// Example 6: Complete Implementation for Next.js with App Router
// ----------------------------------------------
// File: app/layout.tsx
import { Providers } from './providers';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head />
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

// File: components/GTMScript.tsx
import { BlockedContent } from '@six-socks-studio/cookie-consent';

export function GTMScript({ config }: { config: any }) {
  return (
    <BlockedContent category="analytics" config={config}>
      <script
        dangerouslySetInnerHTML={{
          __html: `
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','GTM-YYYY');
          `
        }}
      />
    </BlockedContent>
  );
}

// File: components/FacebookPixel.tsx
import { BlockedContent } from '@six-socks-studio/cookie-consent';

export function FacebookPixel({ config }: { config: any }) {
  return (
    <BlockedContent category="advertising" config={config}>
      <script
        dangerouslySetInnerHTML={{
          __html: `
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '000000000000000');
            fbq('track', 'PageView');
          `
        }}
      />
    </BlockedContent>
  );
}

// File: app/page.tsx
import { GTMScript } from '@/components/GTMScript';
import { FacebookPixel } from '@/components/FacebookPixel';
import { DEFAULT_CONFIG } from '@six-socks-studio/cookie-consent';

export default function Home() {
  return (
    <main>
      {/_ Add analytics and tracking scripts _/}
      <GTMScript config={DEFAULT_CONFIG} />
      <FacebookPixel config={DEFAULT_CONFIG} />

      <h1>Welcome to our GDPR-compliant website</h1>
      <p>Your privacy is important to us. We only use cookies with your consent.</p>

      {/* Rest of your page content */}
    </main>

  );
}

// File: app/privacy-policy/page.tsx
export default function PrivacyPolicy() {
  return (
    <main>
      <h1>Privacy Policy</h1>

      <h2>Cookies and Tracking Technologies</h2>
      <p>Our website uses the following types of cookies:</p>

      <h3>Necessary Cookies</h3>
      <p>These cookies are essential for the website to function properly.</p>
      <ul>
        <li>Session cookies</li>
        <li>Security cookies</li>
      </ul>

      <h3>Functional Cookies</h3>
      <p>These cookies enable personalized features and functionality.</p>
      <ul>
        <li>Language preference cookies</li>
        <li>Theme preference cookies</li>
      </ul>

      <h3>Analytics Cookies</h3>
      <p>These cookies help us understand how visitors interact with our website.</p>
      <ul>
        <li>Google Analytics cookies</li>
        <li>Hotjar cookies</li>
      </ul>

      <h3>Advertising Cookies</h3>
      <p>These cookies are used for targeted advertising.</p>
      <ul>
        <li>Facebook Pixel</li>
        <li>Google Ads cookies</li>
      </ul>

      {/* Rest of your privacy policy content */}
    </main>

  );
}

// File: components/CookieSettingsButton.tsx
"use client";

import { useState } from 'react';
import { ConsentModal } from '@six-socks-studio/cookie-consent';
import { DEFAULT_CONFIG } from '@six-socks-studio/cookie-consent';

export function CookieSettingsButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        style={{
          padding: '8px 16px',
          borderRadius: '4px',
          backgroundColor: 'transparent',
          border: '1px solid #0070f3',
          color: '#0070f3',
          cursor: 'pointer'
        }} >
        Cookie Settings
      </button>

      <ConsentModal
        config={DEFAULT_CONFIG}
        open={isOpen}
        onClose={() => setIsOpen(false)}
      />
    </>

  );
}
