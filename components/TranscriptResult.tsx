"use client";

import { useState, useMemo } from "react";
import { TranscriptSegment, VideoMetadata } from "@/lib/api/transcript";
import { formatAsPlainText, formatAsMarkdown, formatAsSrt } from "@/lib/utils/formatters";

interface TranscriptResultProps {
  transcript: TranscriptSegment[];
  metadata: VideoMetadata;
  includeTimestamps: boolean;
  onReset: () => void;
  showToast: (msg: string) => void;
  onAiPanelChange?: (open: boolean) => void;
}

type ViewMode = "segments" | "text";
type SubTab = "plain" | "markdown" | "srt";

function formatTime(secs: number): string {
  const s = Math.floor(secs);
  const m = Math.floor(s / 60);
  const ss = String(s % 60).padStart(2, "0");
  const h = Math.floor(m / 60);
  if (h > 0) return `${h}:${String(m % 60).padStart(2, "0")}:${ss}`;
  return `${m}:${ss}`;
}

export function TranscriptResult({
  transcript,
  metadata,
  includeTimestamps,
  onReset,
  showToast,
  onAiPanelChange,
}: TranscriptResultProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("segments");
  const [subTab, setSubTab] = useState<SubTab>("plain");
  const [searchQuery, setSearchQuery] = useState("");
  const [aiPanel, setAiPanel] = useState<{ title: string; content: string; loading: boolean } | null>(null);

  const openAiPanel = (panel: { title: string; content: string; loading: boolean }) => {
    setAiPanel(panel);
    onAiPanelChange?.(true);
  };

  const closeAiPanel = () => {
    setAiPanel(null);
    onAiPanelChange?.(false);
  };

  // Stats
  const stats = useMemo(() => {
    const allText = transcript.map((s) => s.text).join(" ");
    const words = allText.trim().split(/\s+/).filter(Boolean).length;
    const chars = allText.length;
    return { words, chars, segments: transcript.length };
  }, [transcript]);

  // Duration
  const duration = useMemo(() => {
    if (transcript.length === 0) return "--";
    return formatTime(transcript[transcript.length - 1].start + 3);
  }, [transcript]);

  // Filtered segments for search
  const filteredSegments = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return transcript;
    return transcript.filter((s) => s.text.toLowerCase().includes(q));
  }, [transcript, searchQuery]);

  // Text view content
  const textContent = useMemo(() => {
    if (subTab === "plain") return formatAsPlainText(transcript, includeTimestamps);
    if (subTab === "markdown") return formatAsMarkdown(transcript, includeTimestamps, metadata.title);
    return formatAsSrt(transcript);
  }, [transcript, subTab, includeTimestamps, metadata.title]);

  // Highlight search query in text
  function highlightText(text: string, query: string): React.ReactNode {
    if (!query.trim()) return text;
    const parts = text.split(new RegExp(`(${escapeRegExp(query)})`, "gi"));
    return parts.map((part, i) =>
      part.toLowerCase() === query.toLowerCase() ? (
        <mark key={i}>{part}</mark>
      ) : (
        part
      )
    );
  }

  // Spell check
  async function runSpellCheck() {
    const text = transcript.map((s) => s.text).join(" ");
    openAiPanel({ title: "Spell Check", content: "Checking spelling...", loading: true });
    try {
      const res = await fetch("/api/ai-cleanup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, type: "spellcheck" }),
      });
      const data = await res.json();
      const changes = data.changes?.length || 0;
      if (changes > 0) {
        setAiPanel({ title: "Spell Check", content: `Found ${changes} correction(s):\n\n${data.corrected}`, loading: false });
      } else {
        setAiPanel({ title: "Spell Check", content: "No spelling issues found!", loading: false });
        showToast("No spelling issues found!");
      }
    } catch {
      setAiPanel({ title: "Spell Check", content: "Spell check failed. Please try again.", loading: false });
    }
  }

  // AI Cleanup
  async function runAICleanup() {
    const text = transcript.map((s) => s.text).join(" ");
    openAiPanel({ title: "AI Cleanup", content: "Cleaning up transcript...", loading: true });
    try {
      const res = await fetch("/api/ai-cleanup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, type: "ai-cleanup" }),
      });
      const data = await res.json();
      setAiPanel({ title: "AI Cleanup", content: data.cleaned || "Could not clean transcript.", loading: false });
    } catch {
      setAiPanel({ title: "AI Cleanup", content: "AI cleanup failed. Please try again.", loading: false });
    }
  }

  // Summarize
  async function runSummary() {
    const text = transcript.map((s) => s.text).join(" ");
    openAiPanel({ title: "AI Summary", content: "Generating summary...", loading: true });
    try {
      const res = await fetch("/api/ai-cleanup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: text.slice(0, 6000),
          type: "summarize",
          title: metadata.title,
        }),
      });
      const data = await res.json();
      setAiPanel({ title: "AI Summary", content: data.summary || "Could not summarize.", loading: false });
    } catch {
      setAiPanel({ title: "AI Summary", content: "Summary failed. Please try again.", loading: false });
    }
  }

  // Copy
  function copyText() {
    navigator.clipboard.writeText(textContent).then(() => showToast("Copied to clipboard!"));
  }

  // Download
  function downloadText() {
    const ext = subTab === "srt" ? "srt" : subTab === "markdown" ? "md" : "txt";
    const name = (metadata.title || "transcript").replace(/[^a-z0-9]/gi, "_").toLowerCase();
    const blob = new Blob([textContent], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${name}.${ext}`;
    a.click();
    URL.revokeObjectURL(a.href);
    showToast(`Downloading as .${ext}`);
  }

  return (
    <div className="mt-6" style={{ animation: "fadeUp 0.4s ease" }}>
      {/* Video card */}
      <div
        style={{
          background: "var(--color-bg-secondary)",
          border: "1px solid var(--color-border-default)",
          borderRadius: "10px",
          overflow: "hidden",
          marginBottom: "16px",
        }}
      >
        <div
          className="flex items-center gap-3.5 cursor-pointer"
          style={{ padding: "14px 16px", transition: "background 0.15s" }}
          onMouseEnter={(e) => { e.currentTarget.style.background = "var(--color-bg-tertiary)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
        >
          {metadata.thumbnailUrl ? (
            <img
              src={metadata.thumbnailUrl}
              alt={metadata.title}
              className="flex-shrink-0"
              style={{ width: "60px", height: "45px", borderRadius: "6px", objectFit: "cover", background: "var(--color-bg-hover)" }}
              onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
            />
          ) : (
            <div
              className="flex-shrink-0 flex items-center justify-center text-xl"
              style={{ width: "60px", height: "45px", borderRadius: "6px", background: "var(--color-bg-hover)" }}
            >
              &#9654;
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="text-[14px] font-medium truncate mb-1">{metadata.title || "--"}</div>
            <div className="text-[12px] text-text-secondary">{metadata.channel || "--"}</div>
            <div className="flex gap-3 mt-1">
              <span
                className="text-[10px] px-2 py-0.5 rounded-full"
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  background: "var(--color-accent-glow)",
                  color: "var(--color-accent-light)",
                  border: "1px solid rgba(124,58,237,0.3)",
                }}
              >
                {stats.segments} segments
              </span>
              <span
                className="text-[10px] px-2 py-0.5 rounded-full"
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  background: "var(--color-bg-hover)",
                  color: "var(--color-text-secondary)",
                  border: "1px solid var(--color-border-default)",
                }}
              >
                {duration} duration
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-2.5 mb-4 flex-wrap">
        <ActionButton icon="🔤" label="Spell Check" onClick={runSpellCheck} />
        <ActionButton icon="✨" label="AI Cleanup" onClick={runAICleanup} variant="purple" />
        <ActionButton icon="📝" label="Summarize" onClick={runSummary} />
        <ActionButton icon="↺" label="Reset" onClick={onReset} style={{ marginLeft: "auto" }} />
      </div>

      {/* Side-by-side layout: transcript left, AI panel right */}
      <div
        className="flex gap-4 side-by-side"
        style={{ flexDirection: aiPanel ? "row" : "column" }}
      >
        {/* Left: transcript content */}
        <div style={{ flex: aiPanel ? "1 1 50%" : "1 1 100%", minWidth: 0 }}>
          {/* View tabs + search */}
          <div className="flex items-center justify-between mb-3.5 flex-wrap gap-2.5">
            <div
              className="flex gap-0.5"
              style={{
                background: "var(--color-bg-secondary)",
                border: "1px solid var(--color-border-default)",
                borderRadius: "8px",
                padding: "3px",
              }}
            >
              <TabButton active={viewMode === "segments"} onClick={() => setViewMode("segments")}>
                Segments
              </TabButton>
              <TabButton active={viewMode === "text"} onClick={() => setViewMode("text")}>
                View as Text
              </TabButton>
            </div>

            {/* Search */}
            <div className="relative flex-1 max-w-[280px]">
              <span
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-tertiary text-[14px] pointer-events-none"
              >
                🔍
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search transcript..."
                className="w-full outline-none"
                style={{
                  background: "var(--color-bg-secondary)",
                  border: "1px solid var(--color-border-default)",
                  borderRadius: "8px",
                  color: "var(--color-text-primary)",
                  fontFamily: "'Outfit', sans-serif",
                  fontSize: "13px",
                  padding: "8px 12px 8px 34px",
                  transition: "border-color 0.15s",
                }}
                onFocus={(e) => { e.currentTarget.style.borderColor = "var(--color-accent-primary)"; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = "var(--color-border-default)"; }}
              />
            </div>
          </div>

          {/* Segments view */}
          {viewMode === "segments" && (
            <div
              style={{
                background: "var(--color-bg-secondary)",
                border: "1px solid var(--color-border-default)",
                borderRadius: "10px",
                overflow: "hidden",
                maxHeight: "500px",
                overflowY: "auto",
              }}
            >
              {filteredSegments.length === 0 ? (
                <div className="text-center py-10 text-text-tertiary text-[14px]">
                  {searchQuery ? `No results for "${searchQuery}"` : "No segments found."}
                </div>
              ) : (
                filteredSegments.map((seg, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3.5"
                    style={{
                      padding: "12px 18px",
                      borderBottom: i < filteredSegments.length - 1 ? "1px solid var(--color-border-default)" : "none",
                      transition: "background 0.1s",
                      background: searchQuery && seg.text.toLowerCase().includes(searchQuery.toLowerCase()) ? "rgba(124,58,237,0.1)" : "transparent",
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = "var(--color-bg-tertiary)"; }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background =
                        searchQuery && seg.text.toLowerCase().includes(searchQuery.toLowerCase())
                          ? "rgba(124,58,237,0.1)"
                          : "transparent";
                    }}
                  >
                    {includeTimestamps && (
                      <span
                        className="select-none pt-0.5"
                        style={{
                          fontFamily: "'JetBrains Mono', monospace",
                          fontSize: "11px",
                          color: "var(--color-accent-primary)",
                          minWidth: "38px",
                        }}
                      >
                        {formatTime(seg.start)}
                      </span>
                    )}
                    <span className="text-[14px] leading-[1.65]">
                      {highlightText(seg.text, searchQuery)}
                    </span>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Text view */}
          {viewMode === "text" && (
            <div>
              <div className="flex items-center justify-between mb-2.5">
                {/* Sub tabs */}
                <div
                  className="flex gap-0.5"
                  style={{
                    background: "var(--color-bg-secondary)",
                    border: "1px solid var(--color-border-default)",
                    borderRadius: "8px",
                    padding: "3px",
                  }}
                >
                  <SubTabButton active={subTab === "plain"} onClick={() => setSubTab("plain")}>Plain Text</SubTabButton>
                  <SubTabButton active={subTab === "markdown"} onClick={() => setSubTab("markdown")}>Markdown</SubTabButton>
                  <SubTabButton active={subTab === "srt"} onClick={() => setSubTab("srt")}>SRT</SubTabButton>
                </div>

                {/* Export buttons */}
                <div className="flex gap-2">
                  <SmallButton onClick={copyText}>📋 Copy Text</SmallButton>
                  <SmallButton onClick={downloadText}>⬇ Download</SmallButton>
                </div>
              </div>

              <div
                style={{
                  background: "var(--color-bg-secondary)",
                  border: "1px solid var(--color-border-default)",
                  borderRadius: "10px",
                  color: "var(--color-text-primary)",
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: "12.5px",
                  lineHeight: "1.75",
                  padding: "18px",
                  height: "380px",
                  resize: "vertical" as const,
                  overflowY: "auto" as const,
                  whiteSpace: "pre-wrap" as const,
                }}
              >
                {textContent}
              </div>
            </div>
          )}
        </div>

        {/* Right: AI panel (only when active) */}
        {aiPanel && (
          <div
            style={{
              flex: "1 1 50%",
              minWidth: 0,
              background: "var(--color-bg-secondary)",
              border: "1px solid rgba(124,58,237,0.3)",
              borderRadius: "10px",
              padding: "18px",
              animation: "fadeUp 0.3s ease",
              display: "flex",
              flexDirection: "column",
              maxHeight: "560px",
            }}
          >
            <div className="flex items-center justify-between mb-3.5 flex-shrink-0">
              <div className="text-[13px] font-semibold flex items-center gap-1.5" style={{ color: "var(--color-accent-light)" }}>
                {aiPanel.title === "AI Cleanup" ? "✨" : aiPanel.title === "AI Summary" ? "📝" : "🔤"} {aiPanel.title}
              </div>
              <button
                onClick={closeAiPanel}
                className="text-text-tertiary text-lg cursor-pointer border-none bg-transparent leading-none"
                style={{ transition: "color 0.15s" }}
                onMouseEnter={(e) => { e.currentTarget.style.color = "var(--color-text-primary)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = "var(--color-text-tertiary)"; }}
              >
                &#10005;
              </button>
            </div>
            <div
              className="text-[14px] leading-7 whitespace-pre-wrap flex-1 overflow-y-auto"
              style={{
                color: aiPanel.loading ? "var(--color-text-secondary)" : "var(--color-text-primary)",
                fontStyle: aiPanel.loading ? "italic" : "normal",
              }}
            >
              {aiPanel.content}
            </div>
          </div>
        )}
      </div>

      {/* Footer stats */}
      <div className="flex items-center justify-between mt-2.5 px-0.5">
        <span
          className="text-[11px] text-text-tertiary"
          style={{ fontFamily: "'JetBrains Mono', monospace" }}
        >
          {stats.words.toLocaleString()} words &middot; {stats.chars.toLocaleString()} chars
        </span>
        <span
          className="text-[11px] text-text-tertiary"
          style={{ fontFamily: "'JetBrains Mono', monospace" }}
        >
          {stats.segments} segments
        </span>
      </div>
    </div>
  );
}

// ── Sub-components ──

function ActionButton({
  icon,
  label,
  onClick,
  variant,
  style,
}: {
  icon: string;
  label: string;
  onClick: () => void;
  variant?: "purple";
  style?: React.CSSProperties;
}) {
  const isPurple = variant === "purple";
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 text-[13.5px] font-medium cursor-pointer"
      style={{
        background: isPurple ? "var(--color-accent-primary)" : "var(--color-bg-tertiary)",
        border: isPurple ? "1px solid var(--color-accent-primary)" : "1px solid var(--color-border-subtle)",
        borderRadius: "8px",
        color: isPurple ? "#fff" : "var(--color-text-primary)",
        fontFamily: "'Outfit', sans-serif",
        padding: "10px 18px",
        transition: "all 0.15s",
        ...style,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = isPurple ? "var(--color-accent-light)" : "var(--color-bg-hover)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = isPurple ? "var(--color-accent-primary)" : "var(--color-bg-tertiary)";
      }}
    >
      <span className="text-[15px]">{icon}</span> {label}
    </button>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className="text-[13px] font-medium cursor-pointer border-none"
      style={{
        fontFamily: "'Outfit', sans-serif",
        padding: "7px 16px",
        borderRadius: "6px",
        background: active ? "var(--color-bg-hover)" : "none",
        color: active ? "var(--color-text-primary)" : "var(--color-text-secondary)",
        boxShadow: active ? "0 1px 4px rgba(0,0,0,0.3)" : "none",
        transition: "all 0.15s",
      }}
    >
      {children}
    </button>
  );
}

function SubTabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className="text-[12.5px] font-medium cursor-pointer border-none"
      style={{
        fontFamily: "'Outfit', sans-serif",
        padding: "6px 14px",
        borderRadius: "5px",
        background: active ? "var(--color-bg-hover)" : "none",
        color: active ? "var(--color-text-primary)" : "var(--color-text-secondary)",
        transition: "all 0.15s",
      }}
    >
      {children}
    </button>
  );
}

function SmallButton({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 text-[12.5px] font-medium cursor-pointer"
      style={{
        background: "var(--color-bg-tertiary)",
        border: "1px solid var(--color-border-subtle)",
        borderRadius: "7px",
        color: "var(--color-text-secondary)",
        fontFamily: "'Outfit', sans-serif",
        padding: "7px 14px",
        transition: "all 0.15s",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "var(--color-bg-hover)";
        e.currentTarget.style.color = "var(--color-text-primary)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "var(--color-bg-tertiary)";
        e.currentTarget.style.color = "var(--color-text-secondary)";
      }}
    >
      {children}
    </button>
  );
}

function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
