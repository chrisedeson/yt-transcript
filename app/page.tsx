"use client";

import { useState, useCallback } from "react";
import { UrlInput } from "@/components/UrlInput";
import { TranscriptSettings } from "@/components/TranscriptSettings";
import { TranscriptResult } from "@/components/TranscriptResult";
import { ManualPaste } from "@/components/ManualPaste";
import { Toast } from "@/components/Toast";
import { fetchTranscript, TranscriptResponse, TranscriptSegment } from "@/lib/api/transcript";

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showManualPaste, setShowManualPaste] = useState(false);

  const [includeTimestamps, setIncludeTimestamps] = useState(true);
  const [language, setLanguage] = useState("en");
  const [languages, setLanguages] = useState<string[]>([]);
  const [autoPunctuate, setAutoPunctuate] = useState(false);
  const [transcriptData, setTranscriptData] = useState<TranscriptResponse | null>(null);
  const [lastVideoId, setLastVideoId] = useState<string | null>(null);

  const [toast, setToast] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2800);
  }, []);

  const handleSubmit = async (videoId: string) => {
    setLoading(true);
    setError(null);
    setTranscriptData(null);
    setShowManualPaste(false);
    setLastVideoId(videoId);

    try {
      const response = await fetchTranscript(videoId, {
        includeTimestamps,
        language: language !== "en" ? language : undefined,
      });
      setTranscriptData(response);
      setLanguages(response.languages);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to fetch transcript";
      setError(msg);
      setShowManualPaste(true);
    } finally {
      setLoading(false);
    }
  };

  const handleManualLoad = (segments: TranscriptSegment[]) => {
    setTranscriptData({
      transcript: segments,
      metadata: { title: "Manual Transcript", channel: "Pasted", description: "", thumbnailUrl: "" },
      languages: [],
      originalLanguage: "en",
    });
    setShowManualPaste(false);
    setError(null);
    showToast("Transcript loaded!");
  };

  const handleReset = () => {
    setTranscriptData(null);
    setError(null);
    setShowManualPaste(false);
    setLastVideoId(null);
    setLanguages([]);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      {/* Hero */}
      <div className="text-center animate-fade-down" style={{ padding: "64px 24px 44px" }}>
        <h1
          className="font-bold tracking-tight mb-2.5"
          style={{
            fontSize: "clamp(28px, 5vw, 48px)",
            letterSpacing: "-0.02em",
            background: "linear-gradient(135deg, #fff 30%, #9d65f5 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          YouTube Transcript Tool
        </h1>
        <p className="text-text-secondary text-[15px] font-light">
          Get clean, formatted transcripts from YouTube videos instantly
        </p>
      </div>

      {/* Main card */}
      <div className="max-w-[800px] mx-auto px-5 animate-fade-up-delay">
        <UrlInput
          onSubmit={handleSubmit}
          loading={loading}
          error={error}
        />

        {/* Options */}
        <TranscriptSettings
          includeTimestamps={includeTimestamps}
          onTimestampsChange={setIncludeTimestamps}
          language={language}
          onLanguageChange={setLanguage}
          languages={languages}
          autoPunctuate={autoPunctuate}
          onAutoPunctuateChange={setAutoPunctuate}
          disabled={loading}
        />

        {/* Error message */}
        {error && (
          <div
            className="mt-3.5 rounded-lg text-[13.5px] px-4 py-3"
            style={{
              background: "rgba(239,68,68,0.1)",
              border: "1px solid rgba(239,68,68,0.3)",
              color: "#fca5a5",
            }}
          >
            {error}
          </div>
        )}

        {/* Manual paste fallback */}
        {showManualPaste && (
          <ManualPaste onLoad={handleManualLoad} />
        )}

        {/* Loading spinner */}
        {loading && (
          <div className="flex flex-col items-center gap-3.5 py-12">
            <div
              className="w-10 h-10 rounded-full"
              style={{
                border: "3px solid var(--color-bg-hover)",
                borderTopColor: "var(--color-accent-primary)",
                animation: "spin 0.7s linear infinite",
              }}
            />
            <div className="text-text-secondary text-[13.5px] animate-pulsing">
              Fetching transcript...
            </div>
          </div>
        )}

        {/* Result */}
        {transcriptData && !loading && (
          <TranscriptResult
            transcript={transcriptData.transcript}
            metadata={transcriptData.metadata}
            includeTimestamps={includeTimestamps}
            onReset={handleReset}
            showToast={showToast}
          />
        )}
      </div>

      <Toast message={toast} />
    </>
  );
}
