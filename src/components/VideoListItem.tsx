import Link from "next/link";
import { displayTitle, formatTime } from "@/lib/format";

interface VideoListItemProps {
  title: string;
  videoId: string;
  orderIndex: number;
  playlistSlug: string;
  tutorSlug: string;
  lastWatchedSeconds?: number;
  isCompleted?: boolean;
  isActive?: boolean;
}

export function VideoListItem({
  title,
  videoId,
  orderIndex,
  playlistSlug,
  tutorSlug,
  lastWatchedSeconds = 0,
  isCompleted = false,
  isActive = false,
}: VideoListItemProps) {
  const status = isCompleted
    ? "completed"
    : lastWatchedSeconds > 0
      ? "in-progress"
      : "unwatched";

  return (
    <Link
      href={`/${tutorSlug}/${playlistSlug}/${videoId}`}
      aria-current={isActive ? "page" : undefined}
      className={`flex items-baseline gap-3 border-b border-rule py-2.5 pr-2 pl-3 ${
        isActive ? "bg-surface shadow-[inset_3px_0_0_var(--color-pen)]" : "hover:bg-surface"
      }`}
    >
      <span className="w-7 shrink-0 text-right text-sm tabular-nums text-pencil">
        {orderIndex}
      </span>
      <span className={`min-w-0 flex-1 ${isActive ? "font-semibold" : ""}`}>{displayTitle(title)}</span>
      {status === "completed" && (
        <span className="shrink-0 text-sm text-pen">selesai</span>
      )}
      {status === "in-progress" && (
        <span className="shrink-0 text-sm tabular-nums text-pencil">
          berhenti di {formatTime(lastWatchedSeconds)}
        </span>
      )}
    </Link>
  );
}
