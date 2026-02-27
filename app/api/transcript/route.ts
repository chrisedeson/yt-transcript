import { NextRequest, NextResponse } from "next/server";
import { extractVideoId } from "@/lib/utils/youtube";
import { env } from "@/lib/config/env";

const API_URL = "https://www.youtube-transcript.io/api/transcripts";
const API_TOKEN = env.YOUTUBE_TRANSCRIPT_API_KEY;

interface TranscriptSegment {
  text: string;
  start: number;
  duration: number;
}

interface YoutubeTranscriptResponse {
  id: string;
  title: string;
  tracks?: Array<{
    language: string;
    transcript: Array<{
      text: string;
      start?: number;
      duration?: number;
    }>;
  }>;
  microformat?: {
    playerMicroformatRenderer?: {
      description?: { simpleText?: string };
      ownerChannelName?: string;
      category?: string;
    };
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { videoId: providedId, metadataOnly } = body;

    const videoId = providedId || extractVideoId(body.url);

    if (!videoId) {
      return NextResponse.json(
        { error: "Invalid YouTube URL", message: "Please enter a valid YouTube URL" },
        { status: 400 }
      );
    }

    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Basic ${API_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ ids: [videoId] })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("YouTube Transcript API error:", response.status, errorText);
      return NextResponse.json(
        { error: "API Error", message: `Transcript API failed: ${response.statusText}` },
        { status: response.status }
      );
    }

    const result = await response.json();

    let videos: YoutubeTranscriptResponse[] = [];
    if (Array.isArray(result)) {
      videos = result;
    } else if (result.transcripts && Array.isArray(result.transcripts)) {
      videos = result.transcripts;
    } else if (result.id) {
      videos = [result];
    }

    if (videos.length === 0) {
      return NextResponse.json(
        { error: "No Transcript", message: "No transcript available for this video" },
        { status: 404 }
      );
    }

    const videoData = videos[0];
    const transcript: TranscriptSegment[] = [];

    const tracks = videoData.tracks || [];
    let englishTrack = tracks.find((t: { language: string }) =>
      t.language.toLowerCase() === 'english' || t.language.toLowerCase() === 'en'
    );

    if (!englishTrack && tracks.length > 0) {
      englishTrack = tracks[0];
    }

    if (englishTrack && englishTrack.transcript) {
      for (const segment of englishTrack.transcript) {
        transcript.push({
          text: segment.text,
          start: segment.start || 0,
          duration: segment.duration || 0
        });
      }
    }

    if (transcript.length === 0) {
      return NextResponse.json(
        { error: "No Transcript", message: "No transcript available for this video" },
        { status: 404 }
      );
    }

    const channel = videoData.microformat?.playerMicroformatRenderer?.ownerChannelName || "Unknown Channel";
    const description = videoData.microformat?.playerMicroformatRenderer?.description?.simpleText || "";
    const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;

    if (metadataOnly) {
      return NextResponse.json({
        title: videoData.title,
        channel,
        description,
        thumbnailUrl,
      });
    }

    return NextResponse.json({
      transcript,
      metadata: {
        title: videoData.title,
        channel,
        description,
        thumbnailUrl,
      },
      languages: tracks.map((t: { language: string }) => t.language),
      originalLanguage: englishTrack?.language || "en",
    });

  } catch (error) {
    console.error("Transcript API error:", error);
    return NextResponse.json(
      { error: "API Error", message: error instanceof Error ? error.message : "Failed to process request" },
      { status: 500 }
    );
  }
}
