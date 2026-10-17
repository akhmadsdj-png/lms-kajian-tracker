"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";

export function LoginBanner() {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="border-b border-rule bg-surface">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-2 text-sm sm:px-6">
        <p className="text-pencil">
          Progres tidak disimpan tanpa akun.{" "}
          <button
            onClick={() => signIn("google")}
            className="font-semibold text-pen underline underline-offset-2"
          >
            Masuk dengan Google
          </button>
        </p>
        <button
          onClick={() => setDismissed(true)}
          aria-label="Tutup"
          className="shrink-0 p-1 text-pencil hover:text-ink"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}
