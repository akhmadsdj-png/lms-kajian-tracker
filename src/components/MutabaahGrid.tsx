import Link from "next/link";
import { displayTitle } from "@/lib/format";

export type VideoStatus = "completed" | "in-progress" | "unwatched";

interface MutabaahGridProps {
  videos: { id: string; title: string; orderIndex: number; status: VideoStatus }[];
  hrefBase: string;
  activeId?: string;
  /** Smaller boxes for the video page sidebar */
  compact?: boolean;
}

const statusLabel: Record<VideoStatus, string> = {
  completed: "selesai",
  "in-progress": "belum tuntas",
  unwatched: "belum ditonton",
};

// Solid tiles (like a contribution graph) read better at small sizes than outlines.
export const boxClass: Record<VideoStatus, string> = {
  completed: "bg-pen",
  "in-progress": "bg-pen/45",
  unwatched: "bg-raised",
};

function chunk<T>(items: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
  return out;
}

// One box per pertemuan, grouped in tens like a santri's mutaba'ah card.
export function MutabaahGrid({ videos, hrefBase, activeId, compact = false }: MutabaahGridProps) {
  const tile = compact ? "h-4 w-4" : "h-5 w-5";
  const legendTile = "h-3 w-3 rounded-[3px]";

  return (
    <div>
      <div
        className={`flex flex-wrap gap-y-1 ${compact ? "gap-x-2.5" : "gap-x-3.5"}`}
        aria-label="Kartu mutaba'ah"
        role="group"
      >
        {chunk(videos, 10).map((group) => (
          <ol key={group[0].id} className="flex gap-1">
            {group.map((v) => (
              <li key={v.id}>
                <Link
                  href={`${hrefBase}/${v.id}`}
                  title={`${v.orderIndex}. ${displayTitle(v.title)}`}
                  aria-label={`Pertemuan ${v.orderIndex}: ${displayTitle(v.title)}, ${statusLabel[v.status]}`}
                  aria-current={v.id === activeId ? "page" : undefined}
                  className={`block rounded-[4px] ${tile} ${boxClass[v.status]} hover:brightness-150 ${
                    v.id === activeId ? "ring-2 ring-ink ring-inset" : ""
                  }`}
                />
              </li>
            ))}
          </ol>
        ))}
      </div>

      <p className={`mt-3 flex flex-wrap gap-x-4 gap-y-1 text-pencil ${compact ? "text-xs" : "text-sm"}`}>
        <span className="flex items-center gap-1.5">
          <span className={`${legendTile} ${boxClass.completed}`} /> selesai
        </span>
        <span className="flex items-center gap-1.5">
          <span className={`${legendTile} ${boxClass["in-progress"]}`} /> belum tuntas
        </span>
        <span className="flex items-center gap-1.5">
          <span className={`${legendTile} ${boxClass.unwatched}`} /> belum ditonton
        </span>
        {activeId && (
          <span className="flex items-center gap-1.5">
            <span className={`${legendTile} bg-raised ring-2 ring-ink ring-inset`} /> sedang dibuka
          </span>
        )}
      </p>
    </div>
  );
}
