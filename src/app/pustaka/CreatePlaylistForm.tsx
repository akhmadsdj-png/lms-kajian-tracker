"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { createUserPlaylist } from "./actions";

export function CreatePlaylistForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const result = await createUserPlaylist(title);
      if (result.ok && result.id) router.push(`/pustaka/${result.id}`);
      else setError(result.message);
    });
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-2 sm:flex-row sm:items-start">
      <div className="flex-1">
        <label htmlFor="new-playlist" className="sr-only">
          Nama playlist baru
        </label>
        <input
          id="new-playlist"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            setError(null);
          }}
          maxLength={80}
          placeholder="Nama playlist baru, misal: Persiapan Ramadhan"
          className="h-10 w-full rounded-full border border-rule bg-paper px-4 placeholder:text-pencil focus:border-pen focus:outline-none"
        />
        {error && <p className="mt-1 px-4 text-sm text-red-200">{error}</p>}
      </div>
      <button
        disabled={pending || title.trim().length < 2}
        className="h-10 rounded-full bg-ink px-5 font-bold text-paper hover:opacity-90 disabled:opacity-50"
      >
        {pending ? "Membuat…" : "Buat playlist"}
      </button>
    </form>
  );
}
