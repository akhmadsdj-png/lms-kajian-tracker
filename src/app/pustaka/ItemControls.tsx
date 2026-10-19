"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { moveUserPlaylistItem, removeUserPlaylistItem } from "./actions";

const btn = "flex h-8 w-8 items-center justify-center rounded-full text-pencil hover:bg-raised hover:text-ink disabled:opacity-30";

/** Move up / move down / remove for one item in a user playlist. */
export function ItemControls({ itemId, first, last, title }: { itemId: string; first: boolean; last: boolean; title: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const run = (fn: () => Promise<unknown>) =>
    startTransition(async () => {
      try {
        await fn();
      } finally {
        router.refresh();
      }
    });

  return (
    <div className="flex shrink-0 items-center gap-0.5" aria-busy={pending}>
      <button
        className={btn}
        disabled={first || pending}
        onClick={() => run(() => moveUserPlaylistItem(itemId, "up"))}
        aria-label={`Naikkan ${title}`}
      >
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
          <path d="m6 15 6-6 6 6" />
        </svg>
      </button>
      <button
        className={btn}
        disabled={last || pending}
        onClick={() => run(() => moveUserPlaylistItem(itemId, "down"))}
        aria-label={`Turunkan ${title}`}
      >
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>
      <button
        className={btn}
        disabled={pending}
        onClick={() => run(() => removeUserPlaylistItem(itemId))}
        aria-label={`Hapus ${title} dari playlist`}
      >
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
          <path d="M6 6l12 12M18 6 6 18" />
        </svg>
      </button>
    </div>
  );
}
