"use client";

import { useState, useCallback } from "react";

interface MarkCompleteButtonProps {
  videoId: string;
  initialCompleted: boolean;
}

export function MarkCompleteButton({
  videoId,
  initialCompleted,
}: MarkCompleteButtonProps) {
  const [isCompleted, setIsCompleted] = useState(initialCompleted);
  const [isLoading, setIsLoading] = useState(false);

  const handleMarkComplete = useCallback(async () => {
    if (isCompleted || isLoading) return;

    setIsLoading(true);
    try {
      const res = await fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          videoId,
          lastWatchedSeconds: 0,
          isCompleted: true,
        }),
      });

      if (res.ok) {
        setIsCompleted(true);
      }
    } catch (error) {
      console.error("Failed to mark complete:", error);
    } finally {
      setIsLoading(false);
    }
  }, [videoId, isCompleted, isLoading]);

  if (isCompleted) {
    return (
      <p className="flex items-center gap-2 py-2 font-semibold text-pen" role="status">
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
        </svg>
        Sudah selesai
      </p>
    );
  }

  return (
    <button
      onClick={handleMarkComplete}
      disabled={isLoading}
      className="rounded-md bg-pen px-4 py-2 font-semibold text-paper hover:opacity-90 disabled:opacity-60"
    >
      {isLoading ? "Menyimpan…" : "Tandai selesai"}
    </button>
  );
}
