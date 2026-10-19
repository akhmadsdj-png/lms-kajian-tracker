"use client";

import { useRouter } from "next/navigation";
import { useActionState, useEffect, useState } from "react";
import { requestTutorAction, type RequestState, type RequestType } from "./actions";

const inputClass =
  "w-full rounded-lg border border-rule bg-paper px-3 py-2 placeholder:text-pencil/70 focus:border-pen focus:outline-none";

const TABS: { type: RequestType; label: string }[] = [
  { type: "tutor", label: "Request pengajar" },
  { type: "feature", label: "Saran atau fitur" },
];

export function RequestForm({ initialType = "tutor" }: { initialType?: RequestType }) {
  const [state, formAction, pending] = useActionState<RequestState, FormData>(requestTutorAction, null);
  const [type, setType] = useState<RequestType>(initialType);
  const isTutor = type === "tutor";
  const result = state?.type === type ? state : null;
  const router = useRouter();

  // After a successful send, continue to the donation page with a thank-you note
  useEffect(() => {
    if (state?.ok) router.push(`/donasi?terkirim=${state.type === "feature" ? "saran" : "pengajar"}`);
  }, [state, router]);

  return (
    <div>
      <div role="tablist" aria-label="Jenis request" className="mb-6 flex gap-2">
        {TABS.map((tab) => (
          <button
            key={tab.type}
            type="button"
            role="tab"
            aria-selected={type === tab.type}
            onClick={() => setType(tab.type)}
            className={`rounded-full px-4 py-1.5 text-sm font-semibold ${
              type === tab.type ? "bg-ink text-paper" : "bg-raised hover:bg-rule"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Remount after a successful send so the fields clear */}
      <form action={formAction} className="space-y-5" key={`${type}-${result?.ok ? result.message : ""}`}>
        <input type="hidden" name="type" value={type} />
        <div>
          <label htmlFor="name" className="mb-1 block font-semibold">
            {isTutor ? "Nama ustadz" : "Saran atau fitur yang kamu inginkan"}
          </label>
          <input
            id="name"
            name="name"
            required
            minLength={3}
            maxLength={120}
            placeholder={isTutor ? "Ustadz Khalid Basalamah" : "Mode audio saja untuk didengar sambil jalan"}
            className={inputClass}
          />
        </div>
        {isTutor && (
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
        )}
        <div>
          <label htmlFor="note" className="mb-1 block font-semibold">
            {isTutor ? "Catatan" : "Ceritakan lebih detail"} <span className="font-normal text-pencil">(opsional)</span>
          </label>
          <textarea
            id="note"
            name="note"
            rows={isTutor ? 3 : 5}
            maxLength={1000}
            placeholder={
              isTutor
                ? "Misalnya kitab atau playlist yang ingin diikuti"
                : "Apa yang kamu alami, dan bagaimana fitur ini akan membantumu?"
            }
            className={inputClass}
          />
        </div>

        {result && (
          <p
            role="status"
            className={`rounded-lg px-3 py-2 text-sm ${result.ok ? "bg-pen-soft text-ink" : "bg-red-950/60 text-red-200"}`}
          >
            {result.message}
          </p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-ink px-5 py-2 font-bold text-paper hover:opacity-90 disabled:opacity-60"
        >
          {pending ? "Mengirim…" : isTutor ? "Kirim request" : "Kirim saran"}
        </button>
      </form>
    </div>
  );
}
