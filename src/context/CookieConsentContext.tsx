import React, { createContext, useContext, useMemo } from "react";
import { ConsentConfig, ConsentState, Cookie, ConsentCategory } from "../types";
import { useConsent } from "../hooks/useConsent";
import { useCookieScanner } from "../hooks/useCookieScanner";

export interface CookieConsentContextValue {
  // Consent state
  consent: ConsentState | null;
  bannerVisible: boolean;
  modalVisible: boolean;
  loading: boolean;

  // Consent actions
  acceptAll: () => ConsentState;
  rejectAll: () => ConsentState;
  setSpecificConsent: (consent: Partial<ConsentState>) => ConsentState;
  showPreferences: () => void;
  closePreferences: () => void;
  resetConsent: () => void;

  // Cookie scanner
  cookies: Cookie[];
  scannerLoading: boolean;
  getCookiesByCategory: (category: ConsentCategory) => Cookie[];
  addCustomCookie: (
    name: string,
    category: ConsentCategory,
    provider?: string,
    description?: string
  ) => void;
  rescan: () => void;

  // Config (for custom renderers)
  config: ConsentConfig;
}

const CookieConsentContext = createContext<CookieConsentContextValue | null>(
  null
);

interface CookieConsentProviderProps {
  config: ConsentConfig;
  children: React.ReactNode;
}

export const CookieConsentProvider: React.FC<CookieConsentProviderProps> = ({
  config,
  children,
}) => {
  const consentState = useConsent(config);
  const scannerState = useCookieScanner();

  const value = useMemo<CookieConsentContextValue>(
    () => ({
      // Consent
      consent: consentState.consent,
      bannerVisible: consentState.bannerVisible,
      modalVisible: consentState.modalVisible,
      loading: consentState.loading,
      acceptAll: consentState.acceptAll,
      rejectAll: consentState.rejectAll,
      setSpecificConsent: consentState.setSpecificConsent,
      showPreferences: consentState.showPreferences,
      closePreferences: consentState.closePreferences,
      resetConsent: consentState.resetConsent,

      // Scanner
      cookies: scannerState.cookies,
      scannerLoading: scannerState.loading,
      getCookiesByCategory: scannerState.getCookiesByCategory,
      addCustomCookie: scannerState.addCustomCookie,
      rescan: scannerState.rescan,

      // Config
      config,
    }),
    [consentState, scannerState, config]
  );

  return (
    <CookieConsentContext.Provider value={value}>
      {children}
    </CookieConsentContext.Provider>
  );
};

/**
 * Hook to access cookie consent state and actions from anywhere in the tree.
 * Must be used within a <CookieConsentProvider>.
 *
 * For headless usage, use this hook to build your own custom cookie banner UI.
 */
export function useCookieConsent(): CookieConsentContextValue {
  const context = useContext(CookieConsentContext);
  if (!context) {
    throw new Error(
      "useCookieConsent must be used within a <CookieConsentProvider>. " +
        "Wrap your app with <CookieConsentProvider config={...}>."
    );
  }
  return context;
}
