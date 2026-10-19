"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { deleteUserPlaylist, updateUserPlaylist } from "./actions";

interface PlaylistEditorProps {
  id: string;
  title: string;
  description: string | null;
}

/** Rename / describe / delete a user playlist. */
export function PlaylistEditor({ id, title, description }: PlaylistEditorProps) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [name, setName] = useState(title);
  const [about, setAbout] = useState(description ?? "");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function save(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const result = await updateUserPlaylist(id, name, about);
      if (result.ok) {
        setEditing(false);
        setError(null);
        router.refresh();
      } else setError(result.message);
    });
  }

  function remove() {
    startTransition(async () => {
      const result = await deleteUserPlaylist(id);
      if (result.ok) router.push("/pustaka");
      else setError(result.message);
    });
  }

  if (editing) {
    return (
      <form onSubmit={save} className="mt-4 max-w-xl space-y-3">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={80}
          aria-label="Nama playlist"
          className="w-full rounded-lg border border-rule bg-paper px-3 py-2 focus:border-pen focus:outline-none"
        />
        <textarea
          value={about}
          onChange={(e) => setAbout(e.target.value)}
          maxLength={500}
          rows={2}
          aria-label="Deskripsi"
          placeholder="Deskripsi (opsional)"
          className="w-full rounded-lg border border-rule bg-paper px-3 py-2 placeholder:text-pencil focus:border-pen focus:outline-none"
        />
        {error && <p className="text-sm text-red-200">{error}</p>}
        <div className="flex gap-2">
          <button disabled={pending} className="rounded-full bg-ink px-4 py-1.5 font-bold text-paper disabled:opacity-50">
            Simpan
          </button>
          <button type="button" onClick={() => setEditing(false)} className="rounded-full px-4 py-1.5 hover:bg-raised">
            Batal
          </button>
        </div>
      </form>
    );
  }

  return (
    <div className="mt-4 flex flex-wrap items-center gap-2">
      <button onClick={() => setEditing(true)} className="rounded-full bg-raised px-4 py-1.5 text-sm font-semibold hover:bg-rule">
        Ubah nama
      </button>
      {confirmDelete ? (
        <>
          <button
            onClick={remove}
            disabled={pending}
            className="rounded-full bg-red-600 px-4 py-1.5 text-sm font-semibold text-white hover:bg-red-500 disabled:opacity-50"
          >
            {pending ? "Menghapus…" : "Hapus playlist ini"}
          </button>
          <button onClick={() => setConfirmDelete(false)} className="rounded-full px-4 py-1.5 text-sm hover:bg-raised">
            Batal
          </button>
          <span className="text-xs text-pencil">Pertemuan dan progresnya tidak ikut terhapus.</span>
        </>
      ) : (
        <button onClick={() => setConfirmDelete(true)} className="rounded-full px-4 py-1.5 text-sm font-semibold text-red-300 hover:bg-red-950/60">
          Hapus
        </button>
      )}
      {error && <p className="w-full text-sm text-red-200">{error}</p>}
    </div>
  );
}
