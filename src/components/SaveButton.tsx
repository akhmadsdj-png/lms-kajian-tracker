"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { createUserPlaylist, getSaveTargets, setVideoInPlaylist, type SaveTarget } from "@/app/pustaka/actions";
import { BookmarkIcon, PlusIcon } from "@/components/shell/icons";

/** "Simpan" button on the watch page: add or remove this pertemuan from the user's playlists. */
export function SaveButton({ videoId, initialSaved = false }: { videoId: string; initialSaved?: boolean }) {
  const router = useRouter();
  const ref = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  // Open upwards when there isn't room for the menu below the button
  const [openUp, setOpenUp] = useState(false);
  const [targets, setTargets] = useState<SaveTarget[] | null>(null);
  const [creating, setCreating] = useState(false);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, startTransition] = useTransition();
  // Until the menu has loaded, trust what the page told us
  const saved = targets ? targets.some((t) => t.hasVideo) : initialSaved;

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: PointerEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("pointerdown", onPointer);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("pointerdown", onPointer);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const failed = () => setMessage({ ok: false, text: "Gagal terhubung ke server. Coba lagi sebentar lagi." });

  function load() {
    startTransition(async () => {
      try {
        setTargets(await getSaveTargets(videoId));
      } catch {
        failed();
      }
    });
  }

  function toggleMenu() {
    const next = !open;
    if (next && ref.current) {
      const spaceBelow = window.innerHeight - ref.current.getBoundingClientRect().bottom;
      setOpenUp(spaceBelow < 380);
    }
    setOpen(next);
    setMessage(null);
    if (next) load();
  }

  function toggle(target: SaveTarget) {
    // Optimistic tick; the server result reloads the list
    setTargets((list) => list?.map((t) => (t.id === target.id ? { ...t, hasVideo: !t.hasVideo } : t)) ?? null);
    startTransition(async () => {
      try {
        const result = await setVideoInPlaylist(target.id, videoId, !target.hasVideo);
        setMessage({ ok: result.ok, text: result.ok ? `${result.message}: ${target.title}` : result.message });
        setTargets(await getSaveTargets(videoId));
        router.refresh();
      } catch {
        // Undo the optimistic tick
        setTargets((list) => list?.map((t) => (t.id === target.id ? { ...t, hasVideo: target.hasVideo } : t)) ?? null);
        failed();
      }
    });
  }

  function create(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      try {
        const result = await createUserPlaylist(title, videoId);
        setMessage({ ok: result.ok, text: result.message });
        if (result.ok) {
          setTitle("");
          setCreating(false);
          setTargets(await getSaveTargets(videoId));
          router.refresh();
        }
      } catch {
        failed();
      }
    });
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={toggleMenu}
        aria-haspopup="dialog"
        aria-expanded={open}
        className="flex items-center gap-2 rounded-full bg-raised px-4 py-2 font-semibold hover:bg-rule"
      >
        <BookmarkIcon className="h-5 w-5" filled={saved} />
        {saved ? "Tersimpan" : "Simpan"}
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Simpan ke playlist"
          className={`absolute left-0 z-40 w-72 max-w-[calc(100vw-2rem)] overflow-hidden rounded-xl border border-rule bg-surface shadow-2xl shadow-black/50 ${
            openUp ? "bottom-full mb-2" : "top-full mt-2"
          }`}
        >
          <p className="border-b border-rule px-4 py-3 font-semibold">Simpan ke…</p>

          {targets === null ? (
            <p className="px-4 py-3 text-sm text-pencil">{pending ? "Memuat…" : "Masuk dulu untuk menyimpan."}</p>
          ) : (
            <ul className="max-h-64 overflow-y-auto py-1">
              {targets.map((t) => (
                <li key={t.id}>
                  <label className="flex cursor-pointer items-center gap-3 px-4 py-2 hover:bg-raised">
                    <input
                      type="checkbox"
                      checked={t.hasVideo}
                      onChange={() => toggle(t)}
                      className="h-4 w-4 accent-[var(--color-pen)]"
                    />
                    <span className="min-w-0 flex-1 truncate">{t.title}</span>
                    <span className="text-xs tabular-nums text-pencil">{t.count}</span>
                  </label>
                </li>
              ))}
            </ul>
          )}

          {targets !== null &&
            (creating ? (
              <form onSubmit={create} className="space-y-2 border-t border-rule p-3">
                <input
                  autoFocus
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  maxLength={80}
                  placeholder="Nama playlist, misal: Fiqih nikah"
                  className="w-full rounded-lg border border-rule bg-paper px-3 py-2 text-sm placeholder:text-pencil focus:border-pen focus:outline-none"
                />
                <div className="flex justify-end gap-2">
                  <button type="button" onClick={() => setCreating(false)} className="rounded-full px-3 py-1 text-sm hover:bg-raised">
                    Batal
                  </button>
                  <button
                    disabled={pending || title.trim().length < 2}
                    className="rounded-full bg-pen px-3 py-1 text-sm font-bold text-paper disabled:opacity-50"
                  >
                    Buat dan simpan
                  </button>
                </div>
              </form>
            ) : (
              <button
                type="button"
                onClick={() => setCreating(true)}
                className="flex w-full items-center gap-3 border-t border-rule px-4 py-3 text-left font-semibold hover:bg-raised"
              >
                <PlusIcon className="h-5 w-5" />
                Buat playlist baru
              </button>
            ))}

          {message && (
            <p role="status" className={`border-t border-rule px-4 py-2 text-sm ${message.ok ? "text-pen" : "text-red-200"}`}>
              {message.text}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
