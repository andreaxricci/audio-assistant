import { useState, useEffect } from "react";

export const usePublicKeyInvalid = () => {
  const [showPublicKeyInvalidMessage, setShowPublicKeyInvalidMessage] = useState(false);

  useEffect(() => {
    if (showPublicKeyInvalidMessage) {
      const timer = setTimeout(() => setShowPublicKeyInvalidMessage(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showPublicKeyInvalidMessage]);

  return { showPublicKeyInvalidMessage, setShowPublicKeyInvalidMessage };
};
