import Link from "next/link";
import { Thumb } from "./Thumb";

interface PlaylistTileProps {
  href: string;
  title: string;
  thumbnailUrl: string | null;
  totalVideos: number;
  completedVideos?: number;
  subtitle?: string;
  /** Fixed width inside a shelf; fluid inside a grid */
  inShelf?: boolean;
}

// Playlist artwork with YouTube's stacked-card edge and a count badge.
export function PlaylistTile({
  href,
  title,
  thumbnailUrl,
  totalVideos,
  completedVideos = 0,
  subtitle,
  inShelf = false,
}: PlaylistTileProps) {
  const percent = totalVideos > 0 ? (completedVideos / totalVideos) * 100 : 0;
  const Wrapper = inShelf ? "li" : "div";

  return (
    <Wrapper className={inShelf ? "w-60 shrink-0 snap-start sm:w-72" : ""}>
      <Link href={href} className="group block">
        <div className="relative pt-2">
          <span className="absolute inset-x-4 top-0 h-4 rounded-t-lg bg-raised/70" aria-hidden />
          <span className="absolute inset-x-2 top-1 h-4 rounded-t-lg bg-raised" aria-hidden />
          <Thumb
            src={thumbnailUrl}
            badge={`${totalVideos} pertemuan`}
            sizes="(min-width: 640px) 288px, 240px"
            className="transition-[filter] group-hover:brightness-110"
          />
        </div>
        <p className="mt-2.5 line-clamp-2 font-semibold leading-snug group-hover:text-pen">{title}</p>
        {completedVideos > 0 ? (
          <div className="mt-1.5 flex items-center gap-2 text-sm tabular-nums text-pencil">
            <span className="h-1 flex-1 rounded-full bg-raised" aria-hidden>
              <span className="block h-full rounded-full bg-pen" style={{ width: `${percent}%` }} />
            </span>
            {completedVideos}/{totalVideos}
          </div>
        ) : (
          subtitle && <p className="mt-0.5 text-sm text-pencil">{subtitle}</p>
        )}
      </Link>
    </Wrapper>
  );
}
