import Image from "next/image";
import { formatTime } from "@/lib/format";

interface ThumbProps {
  src: string | null;
  durationSeconds?: number | null;
  watchedSeconds?: number;
  completed?: boolean;
  /** Overrides the duration badge, e.g. "119 pertemuan" on playlists */
  badge?: React.ReactNode;
  sizes?: string;
  priority?: boolean;
  className?: string;
}

// 16:9 artwork with a duration badge and a YouTube-style watched bar along the bottom.
export function Thumb({
  src,
  durationSeconds,
  watchedSeconds = 0,
  completed = false,
  badge,
  sizes = "320px",
  priority = false,
  className = "",
}: ThumbProps) {
  const percent = completed
    ? 100
    : durationSeconds && watchedSeconds > 0
      ? Math.min(100, Math.max(3, (watchedSeconds / durationSeconds) * 100))
      : 0;

  return (
    <div className={`relative aspect-video overflow-hidden rounded-lg bg-raised ${className}`}>
      {src && (
        <Image
          src={src}
          alt=""
          fill
          sizes={sizes}
          priority={priority}
          unoptimized
          className="object-cover"
        />
      )}
      {(badge || durationSeconds) && (
        <span className="absolute right-1.5 bottom-2 rounded bg-black/80 px-1.5 py-0.5 text-xs font-semibold tabular-nums text-white">
          {badge ?? formatTime(durationSeconds!)}
        </span>
      )}
      {percent > 0 && (
        <span className="absolute inset-x-0 bottom-0 h-1 bg-white/30" aria-hidden>
          <span className="block h-full bg-pen" style={{ width: `${percent}%` }} />
        </span>
      )}
    </div>
  );
}
