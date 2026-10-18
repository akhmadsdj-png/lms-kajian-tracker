"use client";

import { useState } from "react";

export function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard can be blocked; the number stays visible to copy by hand
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      aria-live="polite"
      className="rounded-full bg-raised px-3 py-1 text-sm font-semibold hover:bg-rule"
    >
      {copied ? "Tersalin" : "Salin"}
    </button>
  );
}
