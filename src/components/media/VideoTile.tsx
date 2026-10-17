import Link from "next/link";
import { Thumb } from "./Thumb";
import { videoThumb } from "@/lib/youtube";
import { displayTitle } from "@/lib/format";

interface VideoTileProps {
  href: string;
  title: string;
  youtubeVideoId: string;
  durationSeconds: number | null;
  watchedSeconds: number;
  meta: string;
}

export function VideoTile({ href, title, youtubeVideoId, durationSeconds, watchedSeconds, meta }: VideoTileProps) {
  return (
    <li className="w-60 shrink-0 snap-start sm:w-72">
      <Link href={href} className="group block">
        <Thumb
          src={videoThumb(youtubeVideoId)}
          durationSeconds={durationSeconds}
          watchedSeconds={watchedSeconds}
          sizes="(min-width: 640px) 288px, 240px"
          className="transition-[filter] group-hover:brightness-110"
        />
        <p className="mt-2.5 line-clamp-2 font-semibold leading-snug group-hover:text-pen">
          {displayTitle(title)}
        </p>
        <p className="mt-0.5 line-clamp-1 text-sm text-pencil">{meta}</p>
      </Link>
    </li>
  );
}
