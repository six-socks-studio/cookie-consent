import React from "react";
import { ConsentConfig, Translation } from "../types";
import { useConsent } from "../hooks/useConsent";

interface CookieConsentProps {
  config: ConsentConfig;
  onConsent?: (accepted: boolean) => void;
}

const CookieConsent: React.FC<CookieConsentProps> = ({ config, onConsent }) => {
  const { consent, bannerVisible, acceptAll, rejectAll, showPreferences } =
    useConsent(config);

  const t: Translation = config.translations?.[config.language || "en"] || {
    consentTitle: "Cookie Consent",
    consentDescription:
      "We use cookies to improve your experience on our site. Some are essential for the site to function properly.",
    acceptButton: "Accept All",
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

  if (!bannerVisible) {
    return null;
  }

  // Generate banner position styles
  const getPositionStyle = () => {
    switch (config.bannerConfig.position) {
      case "top":
        return { top: 0, left: 0, right: 0 };
      case "bottom":
        return { bottom: 0, left: 0, right: 0 };
      case "top-left":
        return { top: "20px", left: "20px", maxWidth: "400px" };
      case "top-right":
        return { top: "20px", right: "20px", maxWidth: "400px" };
      case "bottom-left":
        return { bottom: "20px", left: "20px", maxWidth: "400px" };
      case "bottom-right":
        return { bottom: "20px", right: "20px", maxWidth: "400px" };
      default:
        return { bottom: 0, left: 0, right: 0 };
    }
  };

  // Create styles based on config
  const styles = {
    banner: {
      position: "fixed" as const,
      zIndex: 9999,
      padding: "1rem",
      backgroundColor: config.customStyles?.bannerBackgroundColor || "#ffffff",
      color: config.customStyles?.bannerTextColor || "#333333",
      boxShadow: "0 -2px 10px rgba(0, 0, 0, 0.1)",
      borderRadius: config.customStyles?.borderRadius || "0",
      fontSize: "14px",
      lineHeight: "1.5",
      ...getPositionStyle(),
    } as React.CSSProperties,
    container: {
      maxWidth: "1200px",
      margin: "0 auto",
      display: "flex",
      flexDirection: config.bannerConfig.layout === "box" ? "column" : "row",
      justifyContent: "space-between",
      alignItems: config.bannerConfig.layout === "box" ? "stretch" : "center",
      gap: "1rem",
      flexWrap: "wrap",
    } as React.CSSProperties,
    content: {
      flex: "1",
    },
    title: {
      margin: "0 0 0.5rem",
      fontSize: "18px",
      fontWeight: "bold",
    },
    description: {
      margin: "0 0 1rem",
    },
    buttons: {
      display: "flex",
      gap: "0.5rem",
      flexWrap: "wrap",
      justifyContent:
        config.bannerConfig.layout === "box" ? "flex-end" : "flex-start",
      alignItems: "center",
    } as React.CSSProperties,
    primaryButton: {
      backgroundColor: config.customStyles?.primaryButtonColor || "#007bff",
      color: config.customStyles?.primaryButtonTextColor || "#ffffff",
      border: "none",
      padding: "0.5rem 1rem",
      borderRadius: "4px",
      cursor: "pointer",
      fontWeight: "500",
      fontSize: "14px",
    },
    secondaryButton: {
      backgroundColor:
        config.customStyles?.secondaryButtonColor || "transparent",
      color: config.customStyles?.secondaryButtonTextColor || "#007bff",
      border: `1px solid ${
        config.customStyles?.secondaryButtonTextColor || "#007bff"
      }`,
      padding: "0.5rem 1rem",
      borderRadius: "4px",
      cursor: "pointer",
      fontWeight: "500",
      fontSize: "14px",
    },
    link: {
      color: config.customStyles?.linkColor || "#007bff",
      textDecoration: "underline",
      cursor: "pointer",
      fontSize: "14px",
      marginLeft: "1rem",
    },
    poweredBy: {
      fontSize: "10px",
      opacity: 0.7,
      marginTop: "0.5rem",
      textAlign: "right",
    } as React.CSSProperties,
  };

  const handleAcceptAll = () => {
    acceptAll();
    if (onConsent) onConsent(true);
  };

  const handleRejectAll = () => {
    rejectAll();
    if (onConsent) onConsent(false);
  };

  return (
    <div style={styles.banner}>
      <div style={styles.container}>
        <div style={styles.content}>
          <h3 style={styles.title}>
            {config.bannerConfig.bannerHeading || t.consentTitle}
          </h3>
          <p style={styles.description}>
            {config.bannerConfig.bannerDescription || t.consentDescription}
            {config.privacyPolicyUrl && (
              <a
                href={config.privacyPolicyUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={styles.link}
              >
                {t.privacyPolicy}
              </a>
            )}
          </p>
        </div>

        <div style={styles.buttons}>
          {config.bannerConfig.rejectButtonEnabled && (
            <button onClick={handleRejectAll} style={styles.secondaryButton}>
              {config.bannerConfig.rejectAllButtonLabel || t.rejectButton}
            </button>
          )}

          {config.bannerConfig.settingsButtonEnabled && (
            <button onClick={showPreferences} style={styles.secondaryButton}>
              {config.bannerConfig.settingsButtonLabel || t.settingsButton}
            </button>
          )}

          <button onClick={handleAcceptAll} style={styles.primaryButton}>
            {config.bannerConfig.acceptAllButtonLabel || t.acceptButton}
          </button>
        </div>
      </div>

      {config.bannerConfig.showPoweredBy && (
        <div style={styles.poweredBy}>{t.poweredBy}</div>
      )}
    </div>
  );
};

export default CookieConsent;
