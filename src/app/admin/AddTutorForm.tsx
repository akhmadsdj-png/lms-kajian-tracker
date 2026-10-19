"use client";

import { useActionState } from "react";
import { addTutorAction, type AddTutorState } from "./actions";

const inputClass =
  "w-full rounded-md border border-rule bg-paper px-3 py-2 placeholder:text-pencil/70 focus:border-pen focus:outline-none";

export function AddTutorForm() {
  const [state, formAction, pending] = useActionState<AddTutorState, FormData>(addTutorAction, null);

  return (
    // Remount after a successful add so the fields clear
    <form action={formAction} className="space-y-5" key={state?.ok ? state.message : "form"}>
      <div>
        <label htmlFor="name" className="mb-1 block font-semibold">
          Nama
        </label>
        <input
          type="text"
          id="name"
          name="name"
          required
          placeholder="Ustadz Syafiq Riza Basalamah"
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="youtubeChannelId" className="mb-1 block font-semibold">
          Channel YouTube
        </label>
        <input
          type="text"
          id="youtubeChannelId"
          name="youtubeChannelId"
          required
          placeholder="@amminurbaits"
          className={inputClass}
        />
        <p className="mt-1.5 text-sm text-pencil">Tempel URL channel, @handle, atau ID yang diawali UC.</p>
      </div>

      {state && (
        <p
          role="status"
          className={`rounded-lg px-3 py-2 text-sm ${state.ok ? "bg-pen-soft text-ink" : "bg-red-950/60 text-red-200"}`}
        >
          {state.message}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-pen px-4 py-2 font-semibold text-paper hover:opacity-90 disabled:opacity-60"
      >
        {pending ? "Mengecek channel…" : "Tambah pengajar"}
      </button>
    </form>
  );
}
