import { env } from "@/lib/config/env";

export interface SpellCheckResult {
  original: string;
  corrected: string;
  changes: Array<{ word: string; suggestion: string; position: { start: number; end: number } }>;
}

export interface AICleanupResult {
  original: string;
  cleaned: string;
  provider: "gemini" | "openai";
}

export interface SummarizeResult {
  summary: string;
  provider: "gemini" | "openai";
}

export async function aiCleanup(text: string): Promise<AICleanupResult> {
  try {
    const result = await cleanupWithGemini(text);
    return { original: text, cleaned: result, provider: "gemini" };
  } catch {
    const result = await cleanupWithOpenAI(text);
    return { original: text, cleaned: result, provider: "openai" };
  }
}

export async function summarize(text: string, title?: string): Promise<SummarizeResult> {
  const prompt = `You are a content summarizer. Given a YouTube video transcript, write a clear and concise summary with: 1) A one-sentence overview, 2) 3-5 key points as bullet points, 3) Main takeaway. Be brief and informative.\n\nVideo: "${title || "YouTube Video"}"\n\nTranscript:\n${text}`;

  try {
    const result = await geminiGenerate(prompt);
    return { summary: result, provider: "gemini" };
  } catch {
    const result = await openaiGenerate(prompt);
    return { summary: result, provider: "openai" };
  }
}

async function cleanupWithGemini(text: string): Promise<string> {
  return geminiGenerate(
    "You are a transcript editor. Clean up the following YouTube transcript: fix grammar, add punctuation, remove filler words (um, uh, like, you know), merge broken sentences, and make it readable. Return ONLY the cleaned text, no explanation.\n\n" +
      text
  );
}

async function cleanupWithOpenAI(text: string): Promise<string> {
  return openaiGenerate(
    "Fix this transcript grammar and formatting. Return ONLY the cleaned text:\n\n" + text
  );
}

async function geminiGenerate(prompt: string): Promise<string> {
  const url =
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" +
    env.GEMINI_API_KEY;
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
    }),
  });
  if (!response.ok) throw new Error("Gemini failed");
  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || "";
}

async function openaiGenerate(prompt: string): Promise<string> {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + env.OPENAI_API_KEY,
    },
    body: JSON.stringify({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
    }),
  });
  if (!response.ok) throw new Error("OpenAI failed");
  const data = await response.json();
  return data.choices?.[0]?.message?.content || "";
}
