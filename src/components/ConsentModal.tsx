import React, { useState, useEffect } from "react";
import { ConsentState, ConsentConfig, Translation } from "../types";
import { useConsent } from "../hooks/useConsent";
import { useCookieScanner } from "../hooks/useCookieScanner";

interface ConsentModalProps {
  config: ConsentConfig;
  open: boolean;
  onClose: () => void;
  onSave?: (consent: ConsentState) => void;
}

const ConsentModal: React.FC<ConsentModalProps> = ({
  config,
  open,
  onClose,
  onSave,
}) => {
  const { consent, setSpecificConsent } = useConsent(config);
  const { cookies, getCookiesByCategory } = useCookieScanner();

  const [localConsent, setLocalConsent] = useState<Partial<ConsentState>>({
    necessary: true,
    functional: false,
    analytics: false,
    advertising: false,
    uncategorized: false,
  });

  const t: Translation = config.translations?.[config.language || "en"] || {
    consentTitle: "Cookie Preferences",
    consentDescription:
      "Customize your cookie preferences below. Some cookies are essential for the website to function properly.",
    acceptButton: "Save Preferences",
    rejectButton: "Reject All",
    settingsButton: "Preferences",
    closeButton: "Close",
    necessary: {
      title: "Necessary",
      description:
        "Essential cookies enable core functionality. The website cannot function properly without these cookies.",
    },
    functional: {
      title: "Functional",
      description:
        "These cookies enable personalized features and functionality.",
    },
    analytics: {
      title: "Analytics",
      description:
        "These cookies help us improve our website by collecting anonymous information.",
    },
    advertising: {
      title: "Advertising",
      description:
        "These cookies are used to display relevant advertisements and track campaign performance.",
    },
    uncategorized: {
      title: "Uncategorized",
      description:
        "Cookies that are being analyzed and have not yet been categorized.",
    },
    blockedContent: "Please accept cookies to view this content",
    privacyPolicy: "Privacy Policy",
    poweredBy: "Powered by GDPR Cookie Consent",
  };

  // Update local state when consent changes
  useEffect(() => {
    if (consent) {
      setLocalConsent({
        necessary: consent.necessary,
        functional: consent.functional,
        analytics: consent.analytics,
        advertising: consent.advertising,
        uncategorized: consent.uncategorized,
      });
    }
  }, [consent]);

  if (!open) {
    return null;
  }

  // Generate modal styles
  const styles = {
    overlay: {
      position: "fixed" as const,
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      zIndex: 10000,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    } as React.CSSProperties,
    modal: {
      backgroundColor: config.customStyles?.bannerBackgroundColor || "#ffffff",
      color: config.customStyles?.bannerTextColor || "#333333",
      borderRadius: config.customStyles?.borderRadius || "8px",
      boxShadow: "0 4px 20px rgba(0, 0, 0, 0.2)",
      width: "100%",
      maxWidth: "600px",
      maxHeight: "90vh",
      overflow: "auto",
      padding: "2rem",
    },
    header: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "1.5rem",
    },
    title: {
      margin: 0,
      fontSize: "24px",
      fontWeight: "bold",
    },
    closeButton: {
      background: "transparent",
      border: "none",
      fontSize: "24px",
      cursor: "pointer",
      color: config.customStyles?.bannerTextColor || "#333333",
      opacity: 0.7,
    },
    description: {
      marginBottom: "1.5rem",
    },
    categories: {
      display: "flex",
      flexDirection: "column",
      gap: "1rem",
    } as React.CSSProperties,
    category: {
      padding: "1.5rem",
      borderRadius: "6px",
      backgroundColor: "rgba(0, 0, 0, 0.03)",
      marginBottom: "0.5rem",
    },
    categoryHeader: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "0.5rem",
    },
    categoryTitle: {
      margin: 0,
      fontSize: "18px",
      fontWeight: "bold",
    },
    switchContainer: {
      position: "relative" as const,
      width: "50px",
      height: "24px",
    },
    switchInput: {
      opacity: 0,
      width: 0,
      height: 0,
    },
    switchSlider: {
      position: "absolute" as const,
      cursor: "pointer",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "#ccc",
      borderRadius: "12px",
      transition: "0.4s",
    } as React.CSSProperties,
    switchSliderChecked: {
      backgroundColor: config.customStyles?.switchActiveColor || "#007bff",
    },
    switchKnob: {
      position: "absolute" as const,
      content: '""',
      height: "20px",
      width: "20px",
      left: "2px",
      bottom: "2px",
      backgroundColor: "white",
      borderRadius: "50%",
      transition: "0.4s",
    } as React.CSSProperties,
    switchKnobChecked: {
      transform: "translateX(26px)",
    },
    cookiesList: {
      marginTop: "0.5rem",
      fontSize: "14px",
    },
    cookieItem: {
      display: "flex",
      justifyContent: "space-between",
      padding: "0.25rem 0",
      borderBottom: "1px solid rgba(0, 0, 0, 0.05)",
    },
    cookieName: {
      fontWeight: "bold",
    },
    cookieProvider: {
      opacity: 0.7,
    },
    buttons: {
      display: "flex",
      justifyContent: "flex-end",
      gap: "1rem",
      marginTop: "2rem",
    },
    primaryButton: {
      backgroundColor: config.customStyles?.primaryButtonColor || "#007bff",
      color: config.customStyles?.primaryButtonTextColor || "#ffffff",
      border: "none",
      padding: "0.5rem 1.5rem",
      borderRadius: "4px",
      cursor: "pointer",
      fontWeight: "500",
      fontSize: "16px",
    },
    secondaryButton: {
      backgroundColor:
        config.customStyles?.secondaryButtonColor || "transparent",
      color: config.customStyles?.secondaryButtonTextColor || "#007bff",
      border: `1px solid ${
        config.customStyles?.secondaryButtonTextColor || "#007bff"
      }`,
      padding: "0.5rem 1.5rem",
      borderRadius: "4px",
      cursor: "pointer",
      fontWeight: "500",
      fontSize: "16px",
    },
    link: {
      color: config.customStyles?.linkColor || "#007bff",
      textDecoration: "underline",
      cursor: "pointer",
    },
  };

  // Handle toggle of cookie category
  const handleToggle = (category: keyof ConsentState) => {
    // Don't allow toggling off necessary cookies
    if (category === "necessary") return;

    setLocalConsent({
      ...localConsent,
      [category]: !localConsent[category],
    });
  };

  // Handle saving preferences
  const handleSave = () => {
    const updatedConsent = setSpecificConsent(localConsent);
    if (onSave) onSave(updatedConsent);
    onClose();
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.header}>
          <h2 style={styles.title}>{t.consentTitle}</h2>
          <button style={styles.closeButton} onClick={onClose}>
            ×
          </button>
        </div>

        <p style={styles.description}>
          {t.consentDescription}
          {config.privacyPolicyUrl && (
            <a
              href={config.privacyPolicyUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={styles.link}
            >
              {" "}
              {t.privacyPolicy}
            </a>
          )}
        </p>

        <div style={styles.categories}>
          {/* Necessary Cookies */}
          <div style={styles.category}>
            <div style={styles.categoryHeader}>
              <h3 style={styles.categoryTitle}>{t.necessary.title}</h3>
              <div style={styles.switchContainer}>
                <input
                  type="checkbox"
                  style={styles.switchInput}
                  checked={true}
                  disabled
                />
                <span
                  style={{
                    ...styles.switchSlider,
                    ...styles.switchSliderChecked,
                  }}
                >
                  <span
                    style={{
                      ...styles.switchKnob,
                      ...styles.switchKnobChecked,
                    }}
                  ></span>
                </span>
              </div>
            </div>
            <p>{t.necessary.description}</p>

            <div style={styles.cookiesList}>
              {getCookiesByCategory("necessary").map((cookie, index) => (
                <div key={index} style={styles.cookieItem}>
                  <span style={styles.cookieName}>{cookie.name}</span>
                  <span style={styles.cookieProvider}>
                    {cookie.provider || "Website"}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Functional Cookies */}
          <div style={styles.category}>
            <div style={styles.categoryHeader}>
              <h3 style={styles.categoryTitle}>{t.functional.title}</h3>
              <div style={styles.switchContainer}>
                <input
                  type="checkbox"
                  style={styles.switchInput}
                  checked={!!localConsent.functional}
                  onChange={() => handleToggle("functional")}
                />
                <span
                  style={{
                    ...styles.switchSlider,
                    ...(localConsent.functional
                      ? styles.switchSliderChecked
                      : {}),
                  }}
                  onClick={() => handleToggle("functional")}
                >
                  <span
                    style={{
                      ...styles.switchKnob,
                      ...(localConsent.functional
                        ? styles.switchKnobChecked
                        : {}),
                    }}
                  ></span>
                </span>
              </div>
            </div>
            <p>{t.functional.description}</p>

            <div style={styles.cookiesList}>
              {getCookiesByCategory("functional").map((cookie, index) => (
                <div key={index} style={styles.cookieItem}>
                  <span style={styles.cookieName}>{cookie.name}</span>
                  <span style={styles.cookieProvider}>
                    {cookie.provider || "Website"}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Analytics Cookies */}
          <div style={styles.category}>
            <div style={styles.categoryHeader}>
              <h3 style={styles.categoryTitle}>{t.analytics.title}</h3>
              <div style={styles.switchContainer}>
                <input
                  type="checkbox"
                  style={styles.switchInput}
                  checked={!!localConsent.analytics}
                  onChange={() => handleToggle("analytics")}
                />
                <span
                  style={{
                    ...styles.switchSlider,
                    ...(localConsent.analytics
                      ? styles.switchSliderChecked
                      : {}),
                  }}
                  onClick={() => handleToggle("analytics")}
                >
                  <span
                    style={{
                      ...styles.switchKnob,
                      ...(localConsent.analytics
                        ? styles.switchKnobChecked
                        : {}),
                    }}
                  ></span>
                </span>
              </div>
            </div>
            <p>{t.analytics.description}</p>

            <div style={styles.cookiesList}>
              {getCookiesByCategory("analytics").map((cookie, index) => (
                <div key={index} style={styles.cookieItem}>
                  <span style={styles.cookieName}>{cookie.name}</span>
                  <span style={styles.cookieProvider}>
                    {cookie.provider || "Website"}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Advertising Cookies */}
          <div style={styles.category}>
            <div style={styles.categoryHeader}>
              <h3 style={styles.categoryTitle}>{t.advertising.title}</h3>
              <div style={styles.switchContainer}>
                <input
                  type="checkbox"
                  style={styles.switchInput}
                  checked={!!localConsent.advertising}
                  onChange={() => handleToggle("advertising")}
                />
                <span
                  style={{
                    ...styles.switchSlider,
                    ...(localConsent.advertising
                      ? styles.switchSliderChecked
                      : {}),
                  }}
                  onClick={() => handleToggle("advertising")}
                >
                  <span
                    style={{
                      ...styles.switchKnob,
                      ...(localConsent.advertising
                        ? styles.switchKnobChecked
                        : {}),
                    }}
                  ></span>
                </span>
              </div>
            </div>
            <p>{t.advertising.description}</p>

            <div style={styles.cookiesList}>
              {getCookiesByCategory("advertising").map((cookie, index) => (
                <div key={index} style={styles.cookieItem}>
                  <span style={styles.cookieName}>{cookie.name}</span>
                  <span style={styles.cookieProvider}>
                    {cookie.provider || "Website"}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Uncategorized Cookies */}
          <div style={styles.category}>
            <div style={styles.categoryHeader}>
              <h3 style={styles.categoryTitle}>{t.uncategorized.title}</h3>
              <div style={styles.switchContainer}>
                <input
                  type="checkbox"
                  style={styles.switchInput}
                  checked={!!localConsent.uncategorized}
                  onChange={() => handleToggle("uncategorized")}
                />
                <span
                  style={{
                    ...styles.switchSlider,
                    ...(localConsent.uncategorized
                      ? styles.switchSliderChecked
                      : {}),
                  }}
                  onClick={() => handleToggle("uncategorized")}
                >
                  <span
                    style={{
                      ...styles.switchKnob,
                      ...(localConsent.uncategorized
                        ? styles.switchKnobChecked
                        : {}),
                    }}
                  ></span>
                </span>
              </div>
            </div>
            <p>{t.uncategorized.description}</p>

            <div style={styles.cookiesList}>
              {getCookiesByCategory("uncategorized").map((cookie, index) => (
                <div key={index} style={styles.cookieItem}>
                  <span style={styles.cookieName}>{cookie.name}</span>
                  <span style={styles.cookieProvider}>
                    {cookie.provider || "Website"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={styles.buttons}>
          <button style={styles.secondaryButton} onClick={onClose}>
            {t.closeButton}
          </button>
          <button style={styles.primaryButton} onClick={handleSave}>
            {t.acceptButton}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConsentModal;
