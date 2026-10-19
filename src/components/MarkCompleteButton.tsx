"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { setCompleted } from "@/app/progress-actions";

interface MarkCompleteButtonProps {
  videoId: string;
  initialCompleted: boolean;
}

/** Toggles "selesai" for this pertemuan; when finished the button offers to undo it. */
export function MarkCompleteButton({ videoId, initialCompleted }: MarkCompleteButtonProps) {
  const router = useRouter();
  const [completed, setCompletedState] = useState(initialCompleted);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function toggle() {
    const next = !completed;
    setCompletedState(next); // optimistic
    setError(null);
    startTransition(async () => {
      try {
        const result = await setCompleted(videoId, next);
        if (!result.ok) {
          setCompletedState(!next);
          setError(result.message ?? "Gagal menyimpan.");
          return;
        }
        router.refresh();
      } catch {
        setCompletedState(!next);
        setError("Gagal terhubung ke server. Coba lagi.");
      }
    });
  }

  return (
    <div className="flex flex-col">
      <button
        type="button"
        onClick={toggle}
        disabled={pending}
        aria-pressed={completed}
        className={`group flex items-center gap-2 rounded-full px-4 py-2 font-semibold disabled:opacity-70 ${
          completed ? "bg-pen-soft text-pen hover:bg-raised" : "bg-pen text-paper hover:opacity-90"
        }`}
      >
        {completed && (
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        )}
        {completed ? "Batalkan selesai" : "Tandai selesai"}
      </button>
      {error && (
        <span role="alert" className="mt-1 px-2 text-xs text-red-200">
          {error}
        </span>
      )}
    </div>
  );
}
