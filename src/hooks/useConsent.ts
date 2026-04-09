import { useState, useEffect, useRef } from "react";
import { ConsentState, ConsentConfig } from "../types";
import ConsentStorage from "../services/consentStorage";
import CookieBlocker from "../services/cookieBlocker";

// Default consent values
const DEFAULT_CONSENT: ConsentState = {
  necessary: true, // Always true
  functional: false,
  analytics: false,
  advertising: false,
  uncategorized: false,
  timestamp: Date.now(),
};

export function useConsent(config: ConsentConfig) {
  const [consent, setConsent] = useState<ConsentState | null>(null);
  const [bannerVisible, setBannerVisible] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(true);

  // Initialize services with refs to avoid recreation on every render
  const storageRef = useRef<ConsentStorage>(new ConsentStorage(config));
  const cookieBlockerRef = useRef<CookieBlocker>(new CookieBlocker());
  const storage = storageRef.current;
  const cookieBlocker = cookieBlockerRef.current;

  useEffect(() => {
    // Tell the blocker which cookie name to preserve
    cookieBlocker.setConsentCookieName(config.cookieName);

    // Initialize cookie blocker
    cookieBlocker.init();

    // Load existing consent
    const savedConsent = storage.getConsent();

    if (savedConsent && !storage.isConsentExpired(savedConsent)) {
      // Apply saved consent
      setConsent(savedConsent);
      cookieBlocker.applyConsent(savedConsent);
      setBannerVisible(false);
    } else {
      // Check if we should show banner based on region
      if (config.regionBased && config.requireConsentInEU) {
        // TODO: Implement IP geolocation check
        // For now, always show banner
        setConsent(null);
        setBannerVisible(true);
      } else {
        // Use default consent
        const initialConsent = {
          ...DEFAULT_CONSENT,
          ...config.defaultConsent,
          necessary: true, // Always true
          timestamp: Date.now(),
          uuid: generateUuid(),
        };
        setConsent(initialConsent);
        cookieBlocker.applyConsent(initialConsent);
        setBannerVisible(true);
      }
    }

    setLoading(false);
  }, []);

  // Handle accepting all cookies
  const acceptAll = () => {
    const newConsent: ConsentState = {
      necessary: true,
      functional: true,
      analytics: true,
      advertising: true,
      uncategorized: true,
      timestamp: Date.now(),
      updated: Date.now(),
      uuid: consent?.uuid || generateUuid(),
    };

    storage.saveConsent(newConsent);
    cookieBlocker.applyConsent(newConsent);
    setConsent(newConsent);
    setBannerVisible(false);
    setModalVisible(false);

    return newConsent;
  };

  // Handle rejecting all optional cookies
  const rejectAll = () => {
    const newConsent: ConsentState = {
      necessary: true,
      functional: false,
      analytics: false,
      advertising: false,
      uncategorized: false,
      timestamp: Date.now(),
      updated: Date.now(),
      uuid: consent?.uuid || generateUuid(),
    };

    storage.saveConsent(newConsent);
    cookieBlocker.applyConsent(newConsent);
    setConsent(newConsent);
    setBannerVisible(false);
    setModalVisible(false);

    return newConsent;
  };

  // Handle setting specific consent
  const setSpecificConsent = (newConsent: Partial<ConsentState>) => {
    const updatedConsent: ConsentState = {
      ...DEFAULT_CONSENT,
      ...consent,
      ...newConsent,
      necessary: true, // Always true
      updated: Date.now(),
    };

    storage.saveConsent(updatedConsent);
    cookieBlocker.applyConsent(updatedConsent);
    setConsent(updatedConsent);
    setBannerVisible(false);
    setModalVisible(false);

    return updatedConsent;
  };

  // Show preferences modal
  const showPreferences = () => {
    setModalVisible(true);
  };

  // Close preferences modal
  const closePreferences = () => {
    setModalVisible(false);
  };

  // Reset consent (for testing)
  const resetConsent = () => {
    storage.clearConsent();
    setConsent(null);
    setBannerVisible(true);
  };

  // Generate a UUID for consent tracking
  const generateUuid = (): string => {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
      /[xy]/g,
      function (c) {
        const r = (Math.random() * 16) | 0;
        const v = c === "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      }
    );
  };

  return {
    consent,
    bannerVisible,
    modalVisible,
    loading,
    acceptAll,
    rejectAll,
    setSpecificConsent,
    showPreferences,
    closePreferences,
    resetConsent,
  };
}
