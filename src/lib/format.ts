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

/** 352800 s → "98 jam", 2700 s → "45 menit" */
export function formatTotalDuration(seconds: number): string {
  const hours = Math.round(seconds / 3600);
  return hours >= 1 ? `${hours} jam` : `${Math.max(1, Math.round(seconds / 60))} menit`;
}

/** "hari ini", "kemarin", "3 hari yang lalu", "2 minggu yang lalu" */
export function timeAgo(date: Date | string): string {
  const days = Math.floor((Date.now() - new Date(date).getTime()) / 86_400_000);
  const rtf = new Intl.RelativeTimeFormat("id", { numeric: "auto" });
  if (days < 1) return "hari ini";
  if (days < 7) return rtf.format(-days, "day");
  if (days < 30) return rtf.format(-Math.floor(days / 7), "week");
  return rtf.format(-Math.floor(days / 30), "month");
}
