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
      <button
        disabled
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-6 py-3 text-sm font-semibold text-emerald-400 sm:w-auto"
      >
        <svg
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2.5}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        Materi Selesai
      </button>
    );
  }

  return (
    <button
      onClick={handleMarkComplete}
      disabled={isLoading}
      className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-500/20 transition-all hover:shadow-emerald-500/30 hover:brightness-110 disabled:opacity-50 sm:w-auto"
    >
      {isLoading ? (
        <>
          <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Menyimpan...
        </>
      ) : (
        <>
          <svg
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4.5 12.75l6 6 9-13.5"
            />
          </svg>
          Tandai Telah Selesai
        </>
      )}
    </button>
  );
}
