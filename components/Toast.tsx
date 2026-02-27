"use client";

interface ToastProps {
  message: string | null;
}

export function Toast({ message }: ToastProps) {
  return (
    <div
      style={{
        position: "fixed",
        bottom: "28px",
        left: "50%",
        transform: message ? "translateX(-50%) translateY(0)" : "translateX(-50%) translateY(80px)",
        background: "var(--color-bg-hover)",
        border: "1px solid var(--color-border-subtle)",
        borderRadius: "8px",
        color: "var(--color-text-primary)",
        fontSize: "13.5px",
        fontWeight: 500,
        padding: "12px 20px",
        boxShadow: "0 8px 30px rgba(0,0,0,0.5)",
        transition: "transform 0.3s ease, opacity 0.3s ease",
        opacity: message ? 1 : 0,
        pointerEvents: "none",
        zIndex: 100,
        whiteSpace: "nowrap",
        fontFamily: "'Outfit', sans-serif",
      }}
    >
      {message || ""}
    </div>
  );
}
