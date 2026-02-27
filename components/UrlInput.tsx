"use client";

import { useState } from "react";
import { validateYouTubeUrl, extractVideoId } from "@/lib/utils/youtube";

interface UrlInputProps {
  onSubmit: (videoId: string) => void;
  loading?: boolean;
  error?: string | null;
}

export function UrlInput({ onSubmit, loading }: UrlInputProps) {
  const [url, setUrl] = useState("");
  const [validity, setValidity] = useState<"valid" | "invalid" | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setUrl(value);
    if (!value.trim()) {
      setValidity(null);
      return;
    }
    setValidity(validateYouTubeUrl(value) ? "valid" : "invalid");
  };

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    const videoId = extractVideoId(url);
    if (videoId) onSubmit(videoId);
  };

  const borderColor =
    validity === "valid"
      ? "var(--color-success)"
      : validity === "invalid"
        ? "var(--color-error)"
        : "var(--color-border-default)";

  const focusShadow =
    validity === "valid"
      ? "0 0 0 3px rgba(34,197,94,0.12)"
      : "0 0 0 3px var(--color-accent-glow)";

  return (
    <form onSubmit={handleSubmit}>
      {/* URL input */}
      <div className="relative mb-3">
        <input
          type="text"
          value={url}
          onChange={handleChange}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          placeholder="Paste YouTube URL here..."
          disabled={loading}
          autoComplete="off"
          spellCheck={false}
          className="w-full text-[15px] outline-none"
          style={{
            background: "var(--color-bg-secondary)",
            border: `1.5px solid ${borderColor}`,
            borderRadius: "10px",
            color: "var(--color-text-primary)",
            fontFamily: "'Outfit', sans-serif",
            padding: "16px 48px 16px 18px",
            transition: "border-color 0.2s, box-shadow 0.2s",
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = validity === "valid" ? "var(--color-success)" : "var(--color-accent-primary)";
            e.currentTarget.style.boxShadow = focusShadow;
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = borderColor;
            e.currentTarget.style.boxShadow = "none";
          }}
        />
        {url && (
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-lg pointer-events-none">
            {validity === "valid" ? "✅" : validity === "invalid" ? "❌" : ""}
          </span>
        )}
      </div>

      {/* Get Transcript button */}
      <button
        type="submit"
        disabled={validity !== "valid" || loading}
        className="w-full text-white text-[15px] font-semibold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        style={{
          background: "var(--color-accent-primary)",
          borderRadius: "10px",
          border: "none",
          padding: "15px",
          fontFamily: "'Outfit', sans-serif",
          letterSpacing: "0.01em",
          transition: "background 0.2s, transform 0.1s, box-shadow 0.2s",
        }}
        onMouseEnter={(e) => {
          if (!e.currentTarget.disabled) {
            e.currentTarget.style.background = "var(--color-accent-light)";
            e.currentTarget.style.boxShadow = "0 4px 20px var(--color-accent-glow)";
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "var(--color-accent-primary)";
          e.currentTarget.style.boxShadow = "none";
        }}
        onMouseDown={(e) => {
          if (!e.currentTarget.disabled) e.currentTarget.style.transform = "scale(0.99)";
        }}
        onMouseUp={(e) => { e.currentTarget.style.transform = "none"; }}
      >
        {loading ? "Fetching..." : "Get Transcript"}
      </button>
    </form>
  );
}
