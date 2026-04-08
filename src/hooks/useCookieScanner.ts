import { useState, useEffect, useRef } from "react";
import { Cookie, ConsentCategory } from "../types";
import CookieScanner from "../services/cookieScanner";

export function useCookieScanner() {
  const [cookies, setCookies] = useState<Cookie[]>([]);
  const [loading, setLoading] = useState(true);

  // Create scanner instance with ref to avoid recreation on every render
  const scannerRef = useRef<CookieScanner>(new CookieScanner());
  const scanner = scannerRef.current;

  // Scan for cookies on component mount
  useEffect(() => {
    const scanForCookies = () => {
      try {
        const foundCookies = scanner.scanCookies();
        setCookies(foundCookies);
      } catch (e) {
        console.error("Cookie scanning failed:", e);
      } finally {
        setLoading(false);
      }
    };

    scanForCookies();

    // Re-scan on page changes or every 30 seconds
    const interval = setInterval(scanForCookies, 30000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  // Get cookies by category
  const getCookiesByCategory = (category: ConsentCategory): Cookie[] => {
    return cookies.filter((cookie) => cookie.category === category);
  };

  // Add a custom cookie definition
  const addCustomCookie = (
    name: string,
    category: ConsentCategory,
    provider?: string,
    description?: string
  ): void => {
    scanner.addKnownCookie(name, category, provider, description);

    // Force a re-scan
    const updatedCookies = scanner.scanCookies();
    setCookies(updatedCookies);
  };

  return {
    cookies,
    loading,
    getCookiesByCategory,
    addCustomCookie,
    rescan: () => {
      setLoading(true);
      const updatedCookies = scanner.scanCookies();
      setCookies(updatedCookies);
      setLoading(false);
    },
  };
}
