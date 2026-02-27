import "server-only";

/**
 * Server-side environment variable access.
 * The "server-only" import ensures this module cannot be imported
 * from Client Components — it will throw a build error.
 *
 * Usage: import { env } from "@/lib/config/env";
 */
export const env = {
  YOUTUBE_TRANSCRIPT_API_KEY: getRequiredEnv("YOUTUBE_TRANSCRIPT_API_KEY"),
  GEMINI_API_KEY: getRequiredEnv("GEMINI_API_KEY"),
  OPENAI_API_KEY: getRequiredEnv("OPENAI_API_KEY"),
} as const;

function getRequiredEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(
      `Missing required environment variable: ${key}. ` +
      `See .env.example for required variables.`
    );
  }
  return value;
}
