/** 83 min → "1:23:05", 4 min → "4:05" */
export function formatTime(seconds: number): string {
  const total = Math.floor(seconds);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = (total % 60).toString().padStart(2, "0");
  return h > 0 ? `${h}:${m.toString().padStart(2, "0")}:${s}` : `${m}:${s}`;
}

/**
 * YouTube titles end with the speaker ("… - Ustadz Dr. Firanda Andirja, M.A.").
 * The page already names the tutor, so drop that suffix for display.
 */
export function displayTitle(title: string): string {
  return title.replace(/\s*-\s*Ust\w*\.?\s.*$/i, "").trim() || title;
}
