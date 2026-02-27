"use client";

import { useState } from "react";
import { TranscriptSegment } from "@/lib/api/transcript";

interface ManualPasteProps {
  onLoad: (segments: TranscriptSegment[]) => void;
}

export function ManualPaste({ onLoad }: ManualPasteProps) {
  const [text, setText] = useState("");

  const handleLoad = () => {
    const raw = text.trim();
    if (!raw) return;

    const lines = raw.split("\n").filter(Boolean);
    const segments: TranscriptSegment[] = lines.map((line, i) => {
      // Try to parse timestamps like [0:00] or 0:00
      const tsMatch = line.match(/^\[?(\d+:\d+)\]?\s*/);
      if (tsMatch) {
        const [min, sec] = tsMatch[1].split(":").map(Number);
        return {
          text: line.replace(tsMatch[0], "").trim(),
          start: min * 60 + sec,
          duration: 3,
        };
      }
      return { text: line.trim(), start: i * 3, duration: 3 };
    }).filter((s) => s.text);

    onLoad(segments);
  };

  return (
    <div
      className="mt-3.5"
      style={{
        background: "var(--color-bg-secondary)",
        border: "1px solid var(--color-border-default)",
        borderRadius: "10px",
        padding: "18px",
      }}
    >
      <label className="block text-[13px] text-text-secondary mb-2">
        Couldn&apos;t fetch automatically. Paste the transcript text below:
      </label>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Paste raw transcript text here..."
        className="w-full outline-none mb-2.5"
        style={{
          background: "var(--color-bg-tertiary)",
          border: "1px solid var(--color-border-subtle)",
          borderRadius: "8px",
          color: "var(--color-text-primary)",
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: "12.5px",
          lineHeight: "1.65",
          padding: "12px",
          height: "140px",
          resize: "vertical",
          transition: "border-color 0.15s",
        }}
        onFocus={(e) => { e.currentTarget.style.borderColor = "var(--color-accent-primary)"; }}
        onBlur={(e) => { e.currentTarget.style.borderColor = "var(--color-border-subtle)"; }}
      />
      <button
        onClick={handleLoad}
        className="flex items-center gap-1.5 text-[13.5px] font-medium cursor-pointer"
        style={{
          background: "var(--color-bg-tertiary)",
          border: "1px solid var(--color-border-subtle)",
          borderRadius: "8px",
          color: "var(--color-text-primary)",
          fontFamily: "'Outfit', sans-serif",
          padding: "10px 18px",
          transition: "all 0.15s",
        }}
        onMouseEnter={(e) => { e.currentTarget.style.background = "var(--color-bg-hover)"; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = "var(--color-bg-tertiary)"; }}
      >
        📋 Load Transcript
      </button>
    </div>
  );
}
