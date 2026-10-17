import Link from "next/link";

interface PlaylistRowProps {
  title: string;
  description?: string | null;
  href: string;
  totalVideos: number;
  completedVideos: number;
  inProgressVideos: number;
}

export function PlaylistRow({
  title,
  description,
  href,
  totalVideos,
  completedVideos,
  inProgressVideos,
}: PlaylistRowProps) {
  const percent = totalVideos > 0 ? (completedVideos / totalVideos) * 100 : 0;
  const started = completedVideos > 0 || inProgressVideos > 0;

  return (
    <li>
      <Link
        href={href}
        className="flex flex-col gap-1 border-b border-rule px-2 py-3.5 hover:bg-surface sm:flex-row sm:items-center sm:gap-6"
      >
        <div className="min-w-0 flex-1">
          <p className="font-semibold">{title}</p>
          {description && <p className="line-clamp-1 text-sm text-pencil">{description}</p>}
        </div>
        <div className="flex shrink-0 items-center gap-3 text-sm tabular-nums text-pencil">
          {started ? (
            <>
              <span className="h-1 w-20 rounded-full bg-rule" aria-hidden>
                <span className="block h-full rounded-full bg-pen" style={{ width: `${percent}%` }} />
              </span>
              <span>
                {completedVideos} dari {totalVideos}
              </span>
            </>
          ) : (
            <span>{totalVideos} pertemuan</span>
          )}
        </div>
      </Link>
    </li>
  );
}
