/**
 * YouTube URL validation and ID extraction utilities
 */

/**
 * Validates YouTube URL format
 * Supports: youtube.com/watch?v=ID, youtu.be/ID, youtube.com/shorts/ID
 */
export function validateYouTubeUrl(url: string): boolean {
  const patterns = [
    /^(https?:\/\/)?(www\.)?youtube\.com\/watch\?v=[\w-]{11}$/,
    /^(https?:\/\/)?(www\.)?youtu\.be\/[\w-]{11}$/,
    /^(https?:\/\/)?(www\.)?youtube\.com\/shorts\/[\w-]{11}$/,
  ];
  return patterns.some(pattern => pattern.test(url));
}

/**
 * Extracts video ID from YouTube URL
 * Returns null if URL is invalid
 */
export function extractVideoId(url: string): string | null {
  if (!validateYouTubeUrl(url)) return null;

  // youtube.com/watch?v=ID
  const watchMatch = url.match(/v=([\w-]{11})/);
  if (watchMatch) return watchMatch[1];

  // youtu.be/ID
  const shortMatch = url.match(/youtu\.be\/([\w-]{11})/);
  if (shortMatch) return shortMatch[1];

  // youtube.com/shorts/ID
  const shortsMatch = url.match(/shorts\/([\w-]{11})/);
  if (shortsMatch) return shortsMatch[1];

  return null;
}
