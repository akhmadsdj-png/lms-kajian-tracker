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

export const boxClass: Record<VideoStatus, string> = {
  completed: "border-pen bg-pen",
  "in-progress": "border-pen bg-[linear-gradient(to_top,var(--color-pen)_50%,transparent_50%)]",
  unwatched: "border-rule hover:border-pencil",
};

function chunk<T>(items: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
  return out;
}

// One box per pertemuan, grouped in tens like a santri's mutaba'ah card.
export function MutabaahGrid({ videos, hrefBase, activeId, compact = false }: MutabaahGridProps) {
  return (
    <div>
      <div className={`flex flex-wrap ${compact ? "gap-x-2 gap-y-1" : "gap-x-3 gap-y-1.5"}`} aria-label="Kartu mutaba'ah" role="group">
        {chunk(videos, 10).map((group) => (
          <ol key={group[0].id} className={`flex ${compact ? "gap-0.5" : "gap-1"}`}>
            {group.map((v) => (
              <li key={v.id}>
                <Link
                  href={`${hrefBase}/${v.id}`}
                  title={`${v.orderIndex}. ${displayTitle(v.title)}`}
                  aria-label={`Pertemuan ${v.orderIndex}: ${displayTitle(v.title)}, ${statusLabel[v.status]}`}
                  aria-current={v.id === activeId ? "page" : undefined}
                  className={`block rounded-[3px] border ${compact ? "h-3.5 w-3.5" : "h-5 w-5"} ${boxClass[v.status]} ${
                    v.id === activeId ? "outline-2 outline-offset-2 outline-ink" : ""
                  }`}
                />
              </li>
            ))}
          </ol>
        ))}
      </div>

      <p className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-pencil">
        <span className="flex items-center gap-1.5">
          <span className={`h-3 w-3 rounded-[2px] border ${boxClass.completed}`} /> selesai
        </span>
        <span className="flex items-center gap-1.5">
          <span className={`h-3 w-3 rounded-[2px] border ${boxClass["in-progress"]}`} />{" "}
          belum tuntas
        </span>
        <span className="flex items-center gap-1.5">
          <span className={`h-3 w-3 rounded-[2px] border ${boxClass.unwatched}`} /> belum ditonton
        </span>
      </p>
    </div>
  );
}
