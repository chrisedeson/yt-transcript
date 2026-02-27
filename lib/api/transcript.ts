import { env } from "@/lib/config/env";

export interface TranscriptSegment {
  text: string;
  start: number;
  duration: number;
}

export interface VideoMetadata {
  title: string;
  channel: string;
  description: string;
  thumbnailUrl?: string;
}

export interface TranscriptResponse {
  transcript: TranscriptSegment[];
  metadata: VideoMetadata;
  languages: string[];
  originalLanguage?: string;
}

export async function fetchTranscript(
  videoId: string,
  options: {
    includeTimestamps?: boolean;
    language?: string;
    translateTo?: string;
  } = {}
): Promise<TranscriptResponse> {
  const response = await fetch("/api/transcript", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ videoId, ...options }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to fetch transcript");
  }

  return response.json();
}

export async function fetchVideoMetadata(videoId: string): Promise<VideoMetadata> {
  const response = await fetch("/api/transcript", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ videoId, metadataOnly: true }),
  });

  if (!response.ok) {
    throw new Error("Failed to fetch video metadata");
  }

  return response.json();
}
