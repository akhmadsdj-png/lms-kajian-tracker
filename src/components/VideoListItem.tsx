import Link from "next/link";

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

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
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
      className={`group flex items-center gap-3 rounded-xl border p-3 transition-all duration-200 sm:gap-4 sm:p-4 ${
        isActive
          ? "border-emerald-500/30 bg-emerald-500/[0.08]"
          : "border-white/[0.04] bg-slate-800/40 hover:border-white/10 hover:bg-slate-800/60"
      }`}
    >
      {/* Order number */}
      <div
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm font-semibold ${
          status === "completed"
            ? "bg-emerald-500/20 text-emerald-400"
            : status === "in-progress"
              ? "bg-amber-500/20 text-amber-400"
              : "bg-slate-700/50 text-slate-500"
        }`}
      >
        {status === "completed" ? (
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        ) : (
          orderIndex
        )}
      </div>

      {/* Title & status */}
      <div className="min-w-0 flex-1">
        <p
          className={`truncate text-sm font-medium transition-colors ${
            isActive
              ? "text-emerald-400"
              : "text-slate-300 group-hover:text-white"
          }`}
        >
          {title}
        </p>
        {status === "in-progress" && (
          <p className="mt-0.5 text-xs text-amber-400/70">
            Terakhir di menit {formatTime(lastWatchedSeconds)}
          </p>
        )}
      </div>

      {/* Status badge */}
      <div className="shrink-0">
        {status === "completed" && (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-400 ring-1 ring-emerald-500/20">
            Selesai
          </span>
        )}
        {status === "in-progress" && (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-1 text-xs font-medium text-amber-400 ring-1 ring-amber-500/20">
            Berlangsung
          </span>
        )}
      </div>
    </Link>
  );
}
