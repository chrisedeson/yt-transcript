import { TranscriptSegment } from "@/lib/api/transcript";

/**
 * Format transcript as plain text with optional timestamps
 */
export function formatAsPlainText(
  segments: TranscriptSegment[],
  includeTimestamps: boolean = true
): string {
  if (includeTimestamps) {
    return segments
      .map((segment) => {
        const mins = Math.floor(segment.start / 60);
        const secs = Math.floor(segment.start % 60);
        return `[${mins}:${secs.toString().padStart(2, "0")}] ${segment.text}`;
      })
      .join("\n");
  }
  return segments.map((segment) => segment.text).join(" ");
}

/**
 * Format transcript as Markdown with optional timestamps
 */
export function formatAsMarkdown(
  segments: TranscriptSegment[],
  includeTimestamps: boolean = true,
  title?: string
): string {
  let markdown = "";

  if (title) {
    markdown += `# ${title}\n\n`;
  }

  if (includeTimestamps) {
    markdown += segments
      .map((segment) => {
        const mins = Math.floor(segment.start / 60);
        const secs = Math.floor(segment.start % 60);
        return `**${mins}:${secs.toString().padStart(2, "0")}** — ${segment.text}`;
      })
      .join("\n\n");
  } else {
    markdown += segments
      .map((segment) => segment.text)
      .join("\n\n");
  }

  return markdown;
}

/**
 * Format transcript as SRT subtitle format
 */
export function formatAsSrt(segments: TranscriptSegment[]): string {
  return segments
    .map((seg, i) => {
      const start = toSrtTime(seg.start);
      const end = toSrtTime(
        seg.start + (segments[i + 1] ? segments[i + 1].start - seg.start : seg.duration || 3)
      );
      return `${i + 1}\n${start} --> ${end}\n${seg.text}`;
    })
    .join("\n\n");
}

/**
 * Format transcript as plain text without timestamps (compact)
 */
export function formatAsCompactText(segments: TranscriptSegment[]): string {
  return segments.map((segment) => segment.text).join(" ");
}

function toSrtTime(secs: number): string {
  const s = Math.floor(secs);
  const ms = Math.round((secs - s) * 1000);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const ss = s % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(ss).padStart(2, "0")},${String(ms).padStart(3, "0")}`;
}
