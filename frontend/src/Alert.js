import React, { useEffect } from "react";

export default function Alert({ message, duration = 5000, onClose }) {
  useEffect(() => {
    if (!message) return;

    const timer = setTimeout(() => {
      if (onClose) onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [message, duration, onClose]);

  if (!message) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 55,
        right: 20,
        backgroundColor: "rgba(255, 69, 0, 0.9)",
        color: "white",
        padding: "12px 20px",
        borderRadius: "8px",
        fontWeight: "bold",
        boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
        zIndex: 1100,
        cursor: "pointer",
        userSelect: "none",
      }}
      onClick={onClose}
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
    >
      {message} (click to dismiss)
    </div>
  );
}