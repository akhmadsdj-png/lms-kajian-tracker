"use client";

import { useActionState } from "react";
import { requestTutorAction, type RequestState } from "./actions";

const inputClass =
  "w-full rounded-lg border border-rule bg-paper px-3 py-2 placeholder:text-pencil/70 focus:border-pen focus:outline-none";

export function RequestForm() {
  const [state, formAction, pending] = useActionState<RequestState, FormData>(requestTutorAction, null);

  return (
    // Remount after a successful send so the fields clear
    <form action={formAction} className="space-y-5" key={state?.ok ? state.message : "form"}>
      <div>
        <label htmlFor="name" className="mb-1 block font-semibold">
          Nama ustadz
        </label>
        <input
          id="name"
          name="name"
          required
          minLength={3}
          maxLength={120}
          placeholder="Ustadz Khalid Basalamah"
          className={inputClass}
        />
      </div>
      <div>
        <label htmlFor="channelUrl" className="mb-1 block font-semibold">
          Link channel YouTube <span className="font-normal text-pencil">(opsional)</span>
        </label>
        <input
          id="channelUrl"
          name="channelUrl"
          maxLength={300}
          placeholder="https://www.youtube.com/@…"
          className={inputClass}
        />
      </div>
      <div>
        <label htmlFor="note" className="mb-1 block font-semibold">
          Catatan <span className="font-normal text-pencil">(opsional)</span>
        </label>
        <textarea
          id="note"
          name="note"
          rows={3}
          maxLength={1000}
          placeholder="Misalnya kitab atau playlist yang ingin diikuti"
          className={inputClass}
        />
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
        className="rounded-full bg-ink px-5 py-2 font-bold text-paper hover:opacity-90 disabled:opacity-60"
      >
        {pending ? "Mengirim…" : "Kirim request"}
      </button>
    </form>
  );
}
