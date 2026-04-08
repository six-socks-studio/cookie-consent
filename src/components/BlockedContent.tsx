import React from "react";
import { ConsentCategory, ConsentConfig } from "../types";
import { useConsent } from "../hooks/useConsent";

interface BlockedContentProps {
  category: ConsentCategory;
  config: ConsentConfig;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onAccept?: () => void;
}

const BlockedContent: React.FC<BlockedContentProps> = ({
  category,
  config,
  children,
  fallback,
  onAccept,
}) => {
  const { consent, showPreferences, acceptAll } = useConsent(config);

  // Check if we have consent for this category
  const hasConsent = consent?.[category] === true;

  // If necessary cookies or we have consent, show content
  if (category === "necessary" || hasConsent) {
    return <>{children}</>;
  }

  // Default fallback message
  const defaultFallback = (
    <div
      style={{
        padding: "2rem",
        textAlign: "center",
        backgroundColor: "#f8f9fa",
        border: "1px solid #dee2e6",
        borderRadius: "8px",
        marginBottom: "1rem",
      }}
    >
      <p style={{ marginBottom: "1rem" }}>
        {config.blockedContentMessage ||
          "This content is currently blocked because it requires cookies that you have not accepted."}
      </p>
      <div style={{ display: "flex", justifyContent: "center", gap: "1rem" }}>
        <button
          onClick={() => {
            showPreferences();
            if (onAccept) onAccept();
          }}
          style={{
            backgroundColor: "transparent",
            color: config.customStyles?.primaryButtonColor || "#007bff",
            border: `1px solid ${
              config.customStyles?.primaryButtonColor || "#007bff"
            }`,
            padding: "0.5rem 1rem",
            borderRadius: "4px",
            cursor: "pointer",
            fontWeight: "500",
          }}
        >
          Cookie Settings
        </button>
        <button
          onClick={() => {
            acceptAll();
            if (onAccept) onAccept();
          }}
          style={{
            backgroundColor:
              config.customStyles?.primaryButtonColor || "#007bff",
            color: config.customStyles?.primaryButtonTextColor || "#ffffff",
            border: "none",
            padding: "0.5rem 1rem",
            borderRadius: "4px",
            cursor: "pointer",
            fontWeight: "500",
          }}
        >
          Accept All Cookies
        </button>
      </div>
    </div>
  );

  // Return either the provided fallback or the default one
  return <>{fallback || defaultFallback}</>;
};

export default BlockedContent;
