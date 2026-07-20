"use client";

import Link from "next/link";
import { useState } from "react";

export function LoginBanner() {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="relative flex items-center justify-between gap-3 border-b border-amber-500/20 bg-amber-500/10 px-4 py-2.5 text-sm">
      <div className="flex items-center gap-2.5">
        <span className="text-base">🔒</span>
        <span className="text-amber-200/90">
          Kamu sedang melihat sebagai tamu.{" "}
          <Link
            href="/api/auth/signin"
            className="font-semibold text-amber-400 underline underline-offset-2 hover:text-amber-300 transition-colors"
          >
            Masuk dengan Google
          </Link>{" "}
          untuk menyimpan progres belajarmu.
        </span>
      </div>
      <button
        onClick={() => setDismissed(true)}
        aria-label="Tutup notifikasi"
        className="shrink-0 rounded-md p-1 text-amber-400/60 transition-colors hover:text-amber-300"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}
