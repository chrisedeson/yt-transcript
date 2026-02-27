"use client";

import { useState } from "react";

export interface TranscriptSettingsProps {
  includeTimestamps: boolean;
  onTimestampsChange: (value: boolean) => void;
  language: string;
  onLanguageChange: (value: string) => void;
  languages?: string[];
  autoPunctuate: boolean;
  onAutoPunctuateChange: (value: boolean) => void;
  disabled?: boolean;
}

const LANGUAGES = [
  { value: "en", label: "English" },
  { value: "es", label: "Spanish" },
  { value: "fr", label: "French" },
  { value: "de", label: "German" },
  { value: "pt", label: "Portuguese" },
  { value: "ja", label: "Japanese" },
  { value: "zh", label: "Chinese" },
  { value: "ar", label: "Arabic" },
];

export function TranscriptSettings({
  includeTimestamps,
  onTimestampsChange,
  language,
  onLanguageChange,
  autoPunctuate,
  onAutoPunctuateChange,
  disabled = false,
}: TranscriptSettingsProps) {
  const [open, setOpen] = useState(false);

  return (
    <div>
      {/* Toggle */}
      <div
        className="flex items-center gap-2 text-text-secondary text-[13.5px] cursor-pointer select-none py-3 px-1"
        style={{ transition: "color 0.15s" }}
        onClick={() => setOpen(!open)}
        onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "var(--color-text-primary)"; }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "var(--color-text-secondary)"; }}
      >
        <span
          className="text-[11px] inline-block"
          style={{
            transition: "transform 0.2s",
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
          }}
        >
          &#9660;
        </span>
        <span>Transcript Options</span>
      </div>

      {/* Options body */}
      <div
        style={{
          background: "var(--color-bg-secondary)",
          border: "1px solid var(--color-border-default)",
          borderRadius: "10px",
          overflow: "hidden",
          maxHeight: open ? "300px" : "0",
          transition: "max-height 0.3s ease",
          opacity: disabled ? 0.5 : 1,
          pointerEvents: disabled ? "none" : "auto",
        }}
      >
        {/* Timestamps toggle */}
        <div className="flex items-center justify-between" style={{ padding: "14px 18px", borderBottom: "1px solid var(--color-border-default)" }}>
          <span className="text-[14px] text-text-secondary">Include timestamps</span>
          <Toggle checked={includeTimestamps} onChange={onTimestampsChange} />
        </div>

        {/* Language select */}
        <div className="flex items-center justify-between" style={{ padding: "14px 18px", borderBottom: "1px solid var(--color-border-default)" }}>
          <span className="text-[14px] text-text-secondary">Language</span>
          <select
            value={language}
            onChange={(e) => onLanguageChange(e.target.value)}
            className="cursor-pointer outline-none"
            style={{
              background: "var(--color-bg-tertiary)",
              border: "1px solid var(--color-border-subtle)",
              borderRadius: "6px",
              color: "var(--color-text-secondary)",
              fontFamily: "'Outfit', sans-serif",
              fontSize: "13px",
              padding: "6px 10px",
            }}
          >
            {LANGUAGES.map((l) => (
              <option key={l.value} value={l.value}>{l.label}</option>
            ))}
          </select>
        </div>

        {/* Auto-punctuate toggle */}
        <div className="flex items-center justify-between" style={{ padding: "14px 18px" }}>
          <span className="text-[14px] text-text-secondary">Auto-punctuate</span>
          <Toggle checked={autoPunctuate} onChange={onAutoPunctuateChange} />
        </div>
      </div>
    </div>
  );
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="relative inline-block" style={{ width: "46px", height: "26px" }}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="opacity-0 w-0 h-0 absolute"
      />
      <span
        className="toggle-track"
        style={{
          background: checked ? "var(--color-accent-primary)" : "var(--color-bg-hover)",
          borderColor: checked ? "var(--color-accent-primary)" : "var(--color-border-subtle)",
        }}
      >
        <span
          style={{
            position: "absolute",
            left: "3px",
            top: "50%",
            transform: `translateY(-50%) ${checked ? "translateX(20px)" : "translateX(0)"}`,
            width: "18px",
            height: "18px",
            background: "#fff",
            borderRadius: "50%",
            transition: "transform 0.2s",
            boxShadow: "0 1px 4px rgba(0,0,0,0.4)",
          }}
        />
      </span>
    </label>
  );
}
