import Link from "next/link";
import { Thumb } from "./Thumb";
import { videoThumb } from "@/lib/youtube";
import { displayTitle, formatTime } from "@/lib/format";

interface VideoRowProps {
  href: string;
  title: string;
  orderIndex: number;
  youtubeVideoId: string;
  durationSeconds: number | null;
  watchedSeconds?: number;
  isCompleted?: boolean;
  isActive?: boolean;
  /** Smaller thumbnail for the watch-page sidebar */
  compact?: boolean;
}

// A track-list row: number, thumbnail with watched bar, title and status.
export function VideoRow({
  href,
  title,
  orderIndex,
  youtubeVideoId,
  durationSeconds,
  watchedSeconds = 0,
  isCompleted = false,
  isActive = false,
  compact = false,
}: VideoRowProps) {
  return (
    <li>
      <Link
        href={href}
        aria-current={isActive ? "page" : undefined}
        className={`group flex items-center gap-3 rounded-lg p-2 ${
          isActive ? "bg-raised" : "hover:bg-surface"
        }`}
      >
        <span
          className={`w-7 shrink-0 text-center text-sm tabular-nums ${isActive ? "text-pen" : "text-pencil"}`}
        >
          {isActive ? "▶" : orderIndex}
        </span>
        <Thumb
          src={videoThumb(youtubeVideoId)}
          durationSeconds={durationSeconds}
          watchedSeconds={watchedSeconds}
          completed={isCompleted}
          sizes={compact ? "112px" : "160px"}
          className={`shrink-0 ${compact ? "w-28" : "w-32 sm:w-40"}`}
        />
        <div className="min-w-0 flex-1">
          <p
            className={`line-clamp-2 leading-snug ${compact ? "text-sm" : ""} ${
              isActive ? "font-semibold text-ink" : "group-hover:text-ink"
            }`}
          >
            {displayTitle(title)}
          </p>
          {isCompleted ? (
            <p className="mt-1 flex items-center gap-1 text-sm text-pen">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
              Selesai
            </p>
          ) : (
            watchedSeconds > 0 && (
              <p className="mt-1 text-sm tabular-nums text-pencil">Berhenti di {formatTime(watchedSeconds)}</p>
            )
          )}
        </div>
      </Link>
    </li>
  );
}
